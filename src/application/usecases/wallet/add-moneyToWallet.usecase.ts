import { injectable, inject } from "inversify";
import { IUserWalletCreditService, IAddMoneyToWalletUseCase } from "@di/file-imports-index";
import { AddMoneyDTO, AddMoneyResponseDTO } from "@application/dtos/wallet-dtos";
import { UserWalletMapper } from "@application/mappers/userWalletMapper";
import { validationError } from "@presentation/middlewares/error.middleware";
import { WALLET_MESSAGES } from "@shared/constants/walletMessages/wallet.messages";
import { TYPES_SERVICES } from "@di/types-services";

@injectable()
export class AddMoneyToWalletUseCase implements IAddMoneyToWalletUseCase {
  constructor(
    @inject(TYPES_SERVICES.UserWalletCreditService)
    private readonly _walletCreditService: IUserWalletCreditService,
  ) {}

  async execute(userId: string, { amount }: AddMoneyDTO):
                      Promise<AddMoneyResponseDTO> {
                        
  if (!amount || amount < 1 || amount > 500000) {
    throw new validationError(WALLET_MESSAGES.INVALID_AMOUNT);
  }

  
  const { wallet, transactionId } = await this._walletCreditService.creditTopUp(userId, amount);
  return UserWalletMapper.toAddMoneyResponseDTO(wallet, transactionId, amount);
}


}