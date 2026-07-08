import { injectable, inject } from "inversify";
import { IProviderWalletService, IAddMoneyToProviderWalletUseCase } from "@di/file-imports-index";
import { AddMoneyDTO, AddMoneyResponseDTO } from "@application/dtos/wallet-dtos";
import { ProviderWalletMapper } from "@application/mappers/providerWalletMapper";
import { validationError } from "@presentation/middlewares/error.middleware";
import { WALLET_MESSAGES } from "@shared/constants/walletMessages/wallet.messages";
import { TYPES_SERVICES } from "@di/types-services";

@injectable()
export class AddMoneyToProviderWalletUseCase 
implements IAddMoneyToProviderWalletUseCase {
  constructor(
    @inject(TYPES_SERVICES.ProviderWalletService)
    private readonly _providerWalletService: IProviderWalletService,
  ) {}

  async execute(providerId: string, { amount }: AddMoneyDTO): Promise<AddMoneyResponseDTO> {
    if (!amount || amount < 1 || amount > 500000) {
      throw new validationError(WALLET_MESSAGES.INVALID_AMOUNT);
    }

    const { wallet, transactionId } = await this._providerWalletService.creditTopUp(providerId, amount);
    return ProviderWalletMapper.toAddMoneyResponseDTO(wallet, transactionId, amount);
  }
}