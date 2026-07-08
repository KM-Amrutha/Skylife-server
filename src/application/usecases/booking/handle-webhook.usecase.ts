import { inject, injectable } from "inversify";
import { IBookingRepository } from "@domain/interfaces/IBookingRepository";
import { IFlightSeatRepository } from "@domain/interfaces/IFlightSeatRepository";
import { IRedisService } from "@application/interfaces/service/cache/IRedis.service";
import { IStripeService } from "@application/interfaces/service/payment/IStripe.service";
import { IBookingConfirmationService, IHandleWebhookUseCase } from "@di/file-imports-index";
import { BookingMapper } from "@application/mappers/bookingMapper";
import { BookingListItemDTO } from "@application/dtos/booking-dtos";
import { TYPES_SERVICES } from "@di/types-services";
import { TYPES_BOOKING_REPOSITORIES, TYPES_AIRCRAFT_REPOSITORIES } from "@di/types-repositories";

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

@injectable()
export class HandleWebhookUseCase implements IHandleWebhookUseCase {
  constructor(
    @inject(TYPES_BOOKING_REPOSITORIES.BookingRepository)
    private readonly _bookingRepository: IBookingRepository,
    @inject(TYPES_AIRCRAFT_REPOSITORIES.FlightSeatRepository)
    private readonly _flightSeatRepository: IFlightSeatRepository,
    @inject(TYPES_SERVICES.RedisService)
    private readonly _redisService: IRedisService,
    @inject(TYPES_SERVICES.StripeService)
    private readonly _stripeService: IStripeService,
    @inject(TYPES_SERVICES.BookingConfirmationService)
    private readonly _bookingConfirmationService: IBookingConfirmationService,
  ) {}

  async execute(payload: Buffer, signature: string): Promise<void> {
    const event = this._stripeService.constructWebhookEvent(
      payload,
      signature,
      STRIPE_WEBHOOK_SECRET
    );

    // ── repo returns entity → mapper immediately → DTO only from here ─────
    const bookingEntity = await this._bookingRepository.getBookingByPaymentIntentId(
      event.data.id
    );
    if (!bookingEntity) return;

    const bookingDTO = BookingMapper.toBookingListItemDTO(bookingEntity);

    if (event.type === "payment_intent.succeeded") {
      await this._bookingConfirmationService.confirm(bookingDTO, event.data.metadata);
    } else if (event.type === "payment_intent.payment_failed") {
      await this._handleFailure(bookingDTO);
    }
  }

  private async _handleFailure(booking: BookingListItemDTO): Promise<void> {
    if (booking.status === "payment_failed") return;

    await this._bookingRepository.updateBookingStatus(
      booking.id,
      "payment_failed",
      booking.paymentIntentId
    );

    for (const passenger of booking.passengers) {
      for (const segment of passenger.segments) {
        await this._flightSeatRepository.unlockSeat(segment.flightSeatId);
        await this._redisService.delete(
          `seat-lock:${segment.flightId}:${segment.flightSeatId}`
        );
      }
    }
  }
}