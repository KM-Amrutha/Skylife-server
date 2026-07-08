import { AddMoneyDTO, AddMoneyResponseDTO } from "@application/dtos/wallet-dtos";

export interface IAddMoneyToProviderWalletUseCase {
  execute(providerId: string, dto: AddMoneyDTO): Promise<AddMoneyResponseDTO>;
}