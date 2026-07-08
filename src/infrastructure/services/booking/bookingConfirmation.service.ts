import { injectable, inject } from "inversify";
import { BookingListItemDTO } from "@application/dtos/booking-dtos";
import { IBookingRepository } from "@domain/interfaces/IBookingRepository";
import { IFlightSeatRepository } from "@domain/interfaces/IFlightSeatRepository";
import { IOfferRepository } from "@domain/interfaces/IOfferRepository";
import { IUserRepository } from "@domain/interfaces/IUserRepository";
import { IRedisService } from "@application/interfaces/service/cache/IRedis.service";
import { IEmailService } from "@application/interfaces/service/communication/IEmail.service";
import { IProviderWalletService,
        ITicketGenerationService,
         IBookingConfirmationService } from "@di/file-imports-index";
import { TYPES_BOOKING_REPOSITORIES,
         TYPES_AIRCRAFT_REPOSITORIES,
         TYPES_REPOSITORIES } from "@di/types-repositories";
import { TYPES_SERVICES } from "@di/types-services";

@injectable()
export class BookingConfirmationService implements IBookingConfirmationService {
  constructor(
    @inject(TYPES_BOOKING_REPOSITORIES.BookingRepository)
    private readonly _bookingRepository: IBookingRepository,
    @inject(TYPES_AIRCRAFT_REPOSITORIES.FlightSeatRepository)
    private readonly _flightSeatRepository: IFlightSeatRepository,
    @inject(TYPES_BOOKING_REPOSITORIES.OfferRepository)
    private readonly _offerRepository: IOfferRepository,
    @inject(TYPES_REPOSITORIES.UserRepository)
    private readonly _userRepository: IUserRepository,
    @inject(TYPES_SERVICES.RedisService)
    private readonly _redisService: IRedisService,
    @inject(TYPES_SERVICES.EmailService)
    private readonly _emailService: IEmailService,
    @inject(TYPES_SERVICES.ProviderWalletService)
    private readonly _providerWalletService: IProviderWalletService,
    @inject(TYPES_SERVICES.TicketGenerationService)
    private readonly _ticketGenerationService: ITicketGenerationService,
  ) {}

  async confirm(
    booking: BookingListItemDTO,
    metadata?: Record<string, string>
  ): Promise<void> {
    if (booking.status === "confirmed") return;

    await this._bookingRepository.updateBookingStatus(
      booking.id,
      "confirmed",
      booking.paymentIntentId,
      new Date()
    );

    for (const passenger of booking.passengers) {
      for (const segment of passenger.segments) {
        await this._flightSeatRepository.bookSeat(segment.flightSeatId, booking.id);
        await this._redisService.delete(
          `seat-lock:${segment.flightId}:${segment.flightSeatId}`
        );
      }
    }

    const offerId = metadata?.offerId;
    if (offerId) await this._offerRepository.incrementUsageCount(offerId);

    const sessionId = metadata?.sessionId;
    if (sessionId) {
      await Promise.all([
        this._redisService.delete(`booking-segment:${sessionId}`),
        this._redisService.delete(`booking-details:${sessionId}`),
      ]);
    }

    // ── re-fetch as entity for services that need IBooking ────────────────
    const confirmedBooking = await this._bookingRepository.getBookingById(booking.id);
    if (!confirmedBooking) return;

    try {
      await this._providerWalletService.settleBookingRevenue(confirmedBooking);
    } catch {
      console.error(`Provider wallet credit failed for booking ${booking.id}`);
    }

    try {
      await this._ticketGenerationService.generateTicket(confirmedBooking);
    } catch {
      console.error(`Ticket generation failed for booking ${booking.id}`);
    }

    try {
      const user = await this._userRepository.findById(confirmedBooking.userId);
      if (!user?.email) return;

      const flightSummary = confirmedBooking.segments
        .map((s) => `${s.from} → ${s.to} (${s.flightNumber})`)
        .join(", ");

      await this._emailService.sendEmail({
        to: user.email,
        subject: "Booking Confirmed — Skylife",
        text: `Hi ${user.firstName ?? "there"},\n\nYour booking has been confirmed.\n\nFlights: ${flightSummary}\nBooking ID: ${confirmedBooking.id}\nAmount Paid: ₹${confirmedBooking.grandTotal}\n\nThank you for flying with us.`,
      });
    } catch {
      console.error(`Confirmation email failed for booking ${booking.id}`);
    }
  }
}