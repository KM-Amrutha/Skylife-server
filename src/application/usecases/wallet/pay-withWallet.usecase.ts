import { injectable, inject } from "inversify";
import { IBookingRepository } from "@domain/interfaces/IBookingRepository";
import { IOfferRepository } from "@domain/interfaces/IOfferRepository";
import { IUserWalletRepository } from "@domain/interfaces/IUserWalletRepository";
import { IRedisService } from "@application/interfaces/service/cache/IRedis.service";
import { IBookingConfirmationService, IUserWalletCreditService, IPayWithWalletUseCase } from "@di/file-imports-index";
import { PayWithWalletDTO, PayWithWalletResponseDTO } from "@application/dtos/wallet-dtos";
import { UserWalletMapper } from "@application/mappers/userWalletMapper";
import { BookingMapper } from "@application/mappers/bookingMapper";
import { BookingSegmentCacheDTO, BookingDetailsCacheDTO } from "@application/dtos/booking-dtos";
import { NotFoundError, validationError } from "@presentation/middlewares/error.middleware";
import { TYPES_BOOKING_REPOSITORIES } from "@di/types-repositories";
import { TYPES_SERVICES } from "@di/types-services";
import { BOOKING_MESSAGES,OFFER_MESSAGES,WALLET_MESSAGES } from "@shared/constants/index.constants";

@injectable()
export class PayWithWalletUseCase implements IPayWithWalletUseCase {
  constructor(
    @inject(TYPES_BOOKING_REPOSITORIES.BookingRepository)
    private readonly _bookingRepository: IBookingRepository,
    @inject(TYPES_BOOKING_REPOSITORIES.OfferRepository)
    private readonly _offerRepository: IOfferRepository,
    @inject(TYPES_BOOKING_REPOSITORIES.UserWalletRepository)
    private readonly _walletRepository: IUserWalletRepository,
    @inject(TYPES_SERVICES.RedisService)
    private readonly _redisService: IRedisService,
    @inject(TYPES_SERVICES.UserWalletCreditService)
    private readonly _walletCreditService: IUserWalletCreditService,
    @inject(TYPES_SERVICES.BookingConfirmationService)
    private readonly _bookingConfirmationService: IBookingConfirmationService,
  ) {}

  async execute(
    userId: string,
    { sessionId, offerId }: PayWithWalletDTO
  ): Promise<PayWithWalletResponseDTO> {
    if (!sessionId) throw new validationError(BOOKING_MESSAGES.SESSION_ID_REQUIRED);

    // ── load redis session ────────────────────────────────────────────────
    const [segmentCache, detailsCache] = await Promise.all([
      this._redisService.get<BookingSegmentCacheDTO>(`booking-segment:${sessionId}`),
      this._redisService.get<BookingDetailsCacheDTO>(`booking-details:${sessionId}`),
    ]);

    if (!segmentCache) throw new NotFoundError(BOOKING_MESSAGES.SESSION_NOT_FOUND);
    if (!detailsCache) throw new NotFoundError(BOOKING_MESSAGES.DETAILS_NOT_FOUND);
    if (segmentCache.userId !== userId || detailsCache.userId !== userId) {
      throw new validationError(BOOKING_MESSAGES.SESSION_INVALID);
    }

    // ── validate seat locks ───────────────────────────────────────────────
    for (const passenger of detailsCache.passengers) {
      for (const seat of passenger.seats) {
        const lock = await this._redisService.get<{ userId: string; sessionId: string }>(
          `seat-lock:${seat.flightId}:${seat.flightSeatId}`
        );
        if (!lock) throw new validationError(BOOKING_MESSAGES.DETAILS_SEAT_LOCK_EXPIRED);
        if (lock.userId !== userId || lock.sessionId !== sessionId) {
          throw new validationError(BOOKING_MESSAGES.SEAT_NOT_AVAILABLE);
        }
      }
    }

    // ── apply offer ───────────────────────────────────────────────────────
    let discount = 0;
    let grandTotal = detailsCache.fareBreakdown.grandTotal;
    let appliedOfferId: string | undefined;

    if (offerId) {
      const offer = await this._offerRepository.getOfferById(offerId);
      if (!offer) throw new NotFoundError(OFFER_MESSAGES.OFFER_NOT_FOUND);

      const now = new Date();
      const isValid =
        offer.isActive &&
        now >= new Date(offer.validFrom) &&
        now <= new Date(offer.validTo) &&
        grandTotal > offer.minimumAmount &&
        (offer.usageLimit === undefined || offer.usageCount < offer.usageLimit);

      if (!isValid) throw new validationError(OFFER_MESSAGES.OFFER_NOT_ELIGIBLE);

      discount = parseFloat(((grandTotal * offer.discountPercentage) / 100).toFixed(2));
      grandTotal = parseFloat((grandTotal - discount).toFixed(2));
      appliedOfferId = offerId;
    }

    // ── check wallet balance ──────────────────────────────────────────────
    const wallet = await this._walletRepository.getWalletByUserId(userId);
    if (!wallet || wallet.balance < grandTotal) {
      throw new validationError(WALLET_MESSAGES.INSUFFICIENT_BALANCE);
    }

    // ── build booking — same pattern as InitiateBookingUseCase ────────────
    const bookingSegments = segmentCache.segments.map((s) => ({
      flightId: s.flightId,
      flightNumber: s.flightNumber,
      from: s.from,
      to: s.to,
      departureTime: new Date(s.departureTime),
      arrivalTime: new Date(s.arrivalTime),
    }));

    const passengers = detailsCache.passengers.map((p) => {
      const farePassenger = detailsCache.fareBreakdown.passengerFares.find(
        (pf) => pf.passengerId === p.passengerId
      );
      return {
        passengerId: p.passengerId,
        name: p.name,
        dob: new Date(p.dob),
        gender: p.gender,
        address: p.address,
        mobile: p.mobile,
        extraLuggageKg: p.extraLuggageKg,
        passengerTotal: farePassenger?.passengerTotal ?? 0,
        status: "active" as const,
        segments: p.seats.map((seat) => {
          const segCache = segmentCache.segments.find((s) => s.flightId === seat.flightId);
          return {
            flightId: seat.flightId,
            flightNumber: segCache?.flightNumber ?? "",
            providerId: segCache?.providerId ?? "",
            from: segCache?.from ?? "",
            to: segCache?.to ?? "",
            departureTime: new Date(segCache?.departureTime ?? ""),
            arrivalTime: new Date(segCache?.arrivalTime ?? ""),
            flightSeatId: seat.flightSeatId,
            seatNumber: seat.seatNumber,
            cabinClass: seat.cabinClass,
            position: seat.position,
            baseFare: seat.baseFare,
            seatSurcharge: seat.seatSurcharge,
            luggageCharge: seat.luggageCharge,
            segmentFare: seat.segmentFare,
            status: "active" as const,
          };
        }),
      };
    });

    const flightFoods = detailsCache.flightFoods.map((ff) => {
      const segCache = segmentCache.segments.find((s) => s.flightId === ff.flightId);
      return {
        flightId: ff.flightId,
        aircraftId: segCache?.aircraftId ?? "",
        providerId: segCache?.providerId ?? "",
        items: ff.items,
        flightFoodTotal: ff.flightFoodTotal,
      };
    });

    // ── create booking → entity from repo → mapper immediately ───────────
    const bookingEntity = await this._bookingRepository.createBooking({
      userId,
      segments: bookingSegments,
      passengers,
      flightFoods,
      subtotal: detailsCache.fareBreakdown.subtotal,
      discount,
      grandTotal,
      commissionAmount: 0,
      status: "pending",
    });

    // ← mapper called immediately after repo — entity never leaves this line
    const bookingDTO = BookingMapper.toBookingListItemDTO(bookingEntity);

    // ── debit wallet via service — no entity in usecase ───────────────────
    const { balance: remainingBalance } = await this._walletCreditService.debitBookingPayment(
      userId,
      bookingDTO.id,
      grandTotal
    );

    // ── confirm booking via shared service ────────────────────────────────
    await this._bookingConfirmationService.confirm(bookingDTO, {
      ...(appliedOfferId && { offerId: appliedOfferId }),
      sessionId,
    });

    // ← mapper at usecase return
    return UserWalletMapper.toPayWithWalletResponseDTO(
      bookingDTO.id,
      grandTotal,
      remainingBalance
    );
  }
}