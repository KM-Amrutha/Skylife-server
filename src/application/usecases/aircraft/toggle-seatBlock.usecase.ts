import { injectable, inject } from "inversify";
import { ISeatRepository } from "@domain/interfaces/ISeatRepository";
import { IFlightSeatRepository } from "@domain/interfaces/IFlightSeatRepository";
import { IBookingRepository } from "@domain/interfaces/IBookingRepository";
import { IUserRepository } from "@domain/interfaces/IUserRepository";
import { IUserWalletCreditService, IProviderWalletService, IEmailService,IToggleSeatBlockUseCase } from "@di/file-imports-index";
import { ToggleSeatBlockResponseDTO } from "@application/dtos/seat-dtos";
import { NotFoundError, ForbiddenError, validationError } from "@presentation/middlewares/error.middleware";
import { TYPES_REPOSITORIES, TYPES_AIRCRAFT_REPOSITORIES, TYPES_BOOKING_REPOSITORIES } from "@di/types-repositories";
import { TYPES_SERVICES } from "@di/types-services";
import { SeatMapper } from "@application/mappers/seatMapper";

@injectable()
export class ToggleSeatBlockUseCase implements IToggleSeatBlockUseCase {
  constructor(
    @inject(TYPES_AIRCRAFT_REPOSITORIES.SeatRepository)
    private readonly _seatRepository: ISeatRepository,
    @inject(TYPES_AIRCRAFT_REPOSITORIES.FlightSeatRepository)
    private readonly _flightSeatRepository: IFlightSeatRepository,
    @inject(TYPES_BOOKING_REPOSITORIES.BookingRepository)
    private readonly _bookingRepository: IBookingRepository,
    @inject(TYPES_REPOSITORIES.UserRepository)
    private readonly _userRepository: IUserRepository,
    @inject(TYPES_SERVICES.UserWalletCreditService)
    private readonly _walletCreditService: IUserWalletCreditService,
    @inject(TYPES_SERVICES.ProviderWalletService)
    private readonly _providerWalletService: IProviderWalletService,
    @inject(TYPES_SERVICES.EmailService)
    private readonly _emailService: IEmailService,
  ) {}

  async execute(
    providerId: string,
    aircraftId: string,
    seatId: string,
    blockReason?: string
  ): Promise<ToggleSeatBlockResponseDTO> {
    // ── fetch seat ────────────────────────────────────────────────────────

    console.log("🔒 Blocking seatId:", seatId);
    const seat = await this._seatRepository.getSeatById(seatId);
    if (!seat) throw new NotFoundError("Seat not found");
    if (seat.aircraftId !== aircraftId) throw new ForbiddenError("Seat does not belong to this aircraft");

    const blocking = !seat.isBlocked;

    // ── toggle ISeat ──────────────────────────────────────────────────────
    if (blocking) {
      if (!blockReason) throw new validationError("Block reason is required");
      await this._seatRepository.blockSeat(seatId, blockReason);
    } else {
      await this._seatRepository.unblockSeat(seatId);
    }

    // ── cascade to scheduled IFlightSeat ──────────────────────────────────
    let affectedCount = 0;
    let refundIssued = false;
    let totalRefund = 0;
    let affectedUserId: string | undefined;

    if (blocking) {
      // find all scheduled flight seats for this seat
      const scheduledFlightSeats = await this._flightSeatRepository.findScheduledFlightSeatsBySeatId(seatId);
      console.log("🔍 Scheduled flight seats found:", scheduledFlightSeats.length);

      for (const flightSeat of scheduledFlightSeats) {
        // check confirmed booking for this flight seat
        const booking = await this._bookingRepository.findConfirmedBookingByFlightSeatId(flightSeat.id);
        console.log("📦 Booking found for flightSeat:", flightSeat.id, "→", booking?.id ?? "none");

        if (booking) {
          // find the affected passenger + segment
          for (const passenger of booking.passengers) {
            if (passenger.status === "cancelled") continue;

            const segment = passenger.segments.find(
              (s) => s.flightSeatId === flightSeat.id && s.status === "active"
            );
            if (!segment) continue;

            const refundAmount = segment.segmentFare;

            // cancel segment in booking
            const updatedBooking = await this._bookingRepository.cancelPassengerSegment(
              booking.id,
              passenger.passengerId,
              flightSeat.id,
              refundAmount
            );

            if (!updatedBooking) continue;

            // check if all segments of this passenger cancelled → cancel passenger
            const updatedPassenger = updatedBooking.passengers.find(
              (p) => p.passengerId === passenger.passengerId
            );
            const allSegmentsCancelled = updatedPassenger?.segments.every(
              (s) => s.status === "cancelled"
            );

            if (allSegmentsCancelled) {
              // check if all passengers cancelled → cancel booking
              const allPassengersCancelled = updatedBooking.passengers.every(
                (p) => p.status === "cancelled" ||
                p.segments.every((s) => s.status === "cancelled")
              );
              if (allPassengersCancelled) {
                await this._bookingRepository.cancelBooking(booking.id);
              }
            }

            // release the flight seat
            await this._flightSeatRepository.releaseSeat(flightSeat.id);

            // credit user wallet
            await this._walletCreditService.creditSeatBlockRefund(
              booking.userId,
              booking.id,
              passenger.passengerId,
              flightSeat.id,
              refundAmount
            );

            // debit provider wallet
            await this._providerWalletService.debitSeatBlock(
              segment.providerId,
              booking.id,
              flightSeat.id,
              refundAmount
            );

            // send email to user
            const user = await this._userRepository.findOne({ id: booking.userId });
            if (user) {
              affectedUserId = booking.userId;
              totalRefund += refundAmount;
              await this._emailService.sendEmail({
                to: user.email,
                subject: "Seat Blocked — Refund Issued",
                text: `Dear ${user.firstName}, your seat ${seat.seatNumber} on flight has been blocked by the provider due to: ${blockReason}. A refund of ₹${refundAmount} has been credited to your wallet.`,
              });
            }

            refundIssued = true;
          }
        }
      }

      // block all scheduled flight seats
      affectedCount = await this._flightSeatRepository.blockFlightSeatsBySeatId(seatId);
    } else {
      // unblock all scheduled flight seats
      affectedCount = await this._flightSeatRepository.unblockFlightSeatsBySeatId(seatId);
    }

   return SeatMapper.toToggleSeatBlockResponseDTO(
  { ...seat, isBlocked: blocking },  // seat state after toggle
  affectedCount,
  refundIssued,
  refundIssued ? totalRefund : undefined,
  affectedUserId
);
  }
}