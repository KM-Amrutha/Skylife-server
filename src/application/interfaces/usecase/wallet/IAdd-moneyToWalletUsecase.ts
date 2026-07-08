import { AddMoneyDTO, AddMoneyResponseDTO } from "@application/dtos/wallet-dtos";

export interface IAddMoneyToWalletUseCase {
  execute(userId: string, dto: AddMoneyDTO): Promise<AddMoneyResponseDTO>;
}