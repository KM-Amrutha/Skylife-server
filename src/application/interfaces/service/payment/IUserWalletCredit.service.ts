import { IWallet } from "@domain/entities/userWallet.entity";

export interface IUserWalletCreditService {
  creditRefund(
    userId: string,
    bookingId: string,
    passengerId: string,
    refundAmount: number
  ): Promise<IWallet>;

   creditSeatBlockRefund(
    userId: string, 
    bookingId: string,
     passengerId: string,
      flightSeatId: string, 
      refundAmount: number
    ):Promise<IWallet>;

    creditTopUp(
      userId: string,
      amount: number
    ): Promise<{ wallet: IWallet; transactionId: string }>;

    debitBookingPayment(
      userId: string,
       bookingId: string,
        amount: number
      ): Promise<{ balance: number }>;
}