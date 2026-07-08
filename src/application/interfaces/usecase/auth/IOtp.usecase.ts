import { VerifyOtpDTO, ResendOtpDTO } from "@application/dtos/auth-dtos";

export interface IOtpUseCase {
  verifyOtp(dto: VerifyOtpDTO): Promise<void>;
  resendOtp(dto: ResendOtpDTO): Promise<void>;
}