import { BookingListItemDTO } from "@application/dtos/booking-dtos";

export interface IBookingConfirmationService {
  confirm(booking: BookingListItemDTO, metadata?: Record<string, string>): Promise<void>;
}