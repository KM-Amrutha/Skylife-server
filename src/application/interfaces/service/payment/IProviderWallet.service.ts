import { IBooking } from "@domain/entities/booking.entity";
import { IProviderWallet } from "@domain/entities/providerWallet.entity";

export interface IProviderWalletService {
  settleBookingRevenue(booking: IBooking): Promise<void>;
  debitSeatBlock(providerId: string,
     bookingId: string,
      flightSeatId: string,
       amount: number
       ): Promise<void>;
    
creditTopUp(providerId: string, amount: number):
 Promise<{ wallet: IProviderWallet; transactionId: string }>;
}