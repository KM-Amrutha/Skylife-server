import { PayWithWalletDTO, PayWithWalletResponseDTO } from "@application/dtos/wallet-dtos";

export interface IPayWithWalletUseCase {
  execute(userId: string, dto: PayWithWalletDTO): Promise<PayWithWalletResponseDTO>;
}