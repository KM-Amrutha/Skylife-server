import { inject, injectable } from "inversify";
import crypto from "crypto";
import { IUserWalletRepository } from "@domain/interfaces/IUserWalletRepository";
import {
  IWallet,
  IWalletTransaction,
} from "@domain/entities/userWallet.entity";
import { IUserWalletCreditService } from "@di/file-imports-index";
import { TYPES_BOOKING_REPOSITORIES } from "@di/types-repositories";
import { WALLET_MESSAGES } from "@shared/constants/walletMessages/wallet.messages";
import { validationError } from "@presentation/middlewares/error.middleware";

@injectable()
export class UserWalletCreditService
  implements IUserWalletCreditService
{
  constructor(
    @inject(TYPES_BOOKING_REPOSITORIES.UserWalletRepository)
    private readonly _walletRepository: IUserWalletRepository
  ) {}

  async creditRefund(
    userId: string,
    bookingId: string,
    passengerId: string,
    refundAmount: number
  ): Promise<IWallet> {
    let wallet = await this._walletRepository.getWalletByUserId(userId);

    if (!wallet) {
      wallet = await this._walletRepository.createWallet(userId);
    }

    const transaction: IWalletTransaction = {
      transactionId: crypto.randomUUID(),
      type: "credit",
      amount: refundAmount,
      description: WALLET_MESSAGES.PASSENGER_REFUND,
      bookingId,
      passengerId,
      createdAt: new Date(),
    };

    return await this._walletRepository.creditWallet(
      userId,
      transaction,
      refundAmount
    );
  };
  async creditSeatBlockRefund(
  userId: string,
  bookingId: string,
  passengerId: string,
  flightSeatId: string,
  refundAmount: number
): Promise<IWallet> {
  let wallet = await this._walletRepository.getWalletByUserId(userId);
  if (!wallet) wallet = await this._walletRepository.createWallet(userId);

  const transaction: IWalletTransaction = {
    transactionId: crypto.randomUUID(),
    type: "credit",
    amount: refundAmount,
    description: WALLET_MESSAGES.SEAT_BLOCK_REFUND,
    bookingId,
    passengerId,
    createdAt: new Date(),
  };

  return await this._walletRepository.creditWallet(userId, transaction, refundAmount);
}
async creditTopUp(userId: string, amount: number): 
Promise<{ wallet: IWallet; transactionId: string }> 
                                               {       
                                                                                         
  let wallet = await this._walletRepository.getWalletByUserId(userId);
  if (!wallet) wallet = await this._walletRepository.createWallet(userId);

  const transaction: IWalletTransaction = {
    transactionId: crypto.randomUUID(),
    type: "credit",
    amount,
    description: WALLET_MESSAGES.USER_TOPUP,
    createdAt: new Date(),
  };

  const updatedWallet = await this._walletRepository.creditWallet(userId, transaction, amount);
  return { wallet: updatedWallet, transactionId: transaction.transactionId };
}

async debitBookingPayment(
  userId: string,
  bookingId: string,
  amount: number
): Promise<{ balance: number }> {
  const wallet = await this._walletRepository.getWalletByUserId(userId);
  if (!wallet) throw new validationError(WALLET_MESSAGES.INSUFFICIENT_BALANCE);

  const transaction: IWalletTransaction = {
    transactionId: crypto.randomUUID(),
    type: "debit",
    amount,
    description: WALLET_MESSAGES.WALLET_PAYMENT,
    bookingId,
    createdAt: new Date(),
  };

  const updatedWallet = await this._walletRepository.debitWallet(userId, transaction, amount);
  return { balance: updatedWallet.balance };
}
}