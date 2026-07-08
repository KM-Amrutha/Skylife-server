import { injectable, inject } from "inversify";
import { IUserRepository, IProviderRepository, IEmailService, IOtpService, IOtpUseCase } from "@di/file-imports-index";
import { VerifyOtpDTO, ResendOtpDTO, OtpSessionPayload } from "@application/dtos/auth-dtos";
import { OTP_MESSAGES, OTP_CONFIG } from "@shared/constants/index.constants";
import { validationError } from "@presentation/middlewares/error.middleware";
import { IRedisService } from "@application/interfaces/service/cache/IRedis.service";
import { TYPES_REPOSITORIES } from "@di/types-repositories";
import { TYPES_SERVICES } from "@di/types-services";

@injectable()
export class OtpUseCase implements IOtpUseCase {
  constructor(
    @inject(TYPES_REPOSITORIES.UserRepository)
    private _userRepository: IUserRepository,
    @inject(TYPES_REPOSITORIES.ProviderRepository)
    private _providerRepository: IProviderRepository,
    @inject(TYPES_SERVICES.EmailService)
    private _emailService: IEmailService,
    @inject(TYPES_SERVICES.OtpService)
    private _otpService: IOtpService,
    @inject(TYPES_SERVICES.RedisService)
    private _redisService: IRedisService,
  ) {}

  async verifyOtp({ otpSessionId, otp }: VerifyOtpDTO): Promise<void> {
    const sessionKey = `${OTP_CONFIG.REDIS_PREFIX}${otpSessionId}`;
    const session = await this._redisService.get<OtpSessionPayload>(sessionKey);

    if (!session) throw new validationError(OTP_MESSAGES.EXPIRED);

    if (session.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
      await this._redisService.delete(sessionKey);
      throw new validationError(OTP_MESSAGES.MAX_ATTEMPTS);
    }

    if (session.otp !== otp) {
      await this._redisService.set(sessionKey, { ...session, attempts: session.attempts + 1 }, OTP_CONFIG.TTL_SECONDS);
      throw new validationError(OTP_MESSAGES.INVALID);
    }

    const user = await this._userRepository.findOne({ email: session.email });
    const provider = await this._providerRepository.getProviderByEmail(session.email);

    if (user) {
      await this._userRepository.updateUserVerificationStatus(session.email);
    } else if (provider) {
      await this._providerRepository.updateVerificationStatus(provider.id, true);
    } else {
      throw new validationError("No account found for this session");
    }

    await this._redisService.delete(sessionKey);
  }

  async resendOtp({ otpSessionId }: ResendOtpDTO): Promise<void> {
    const sessionKey = `${OTP_CONFIG.REDIS_PREFIX}${otpSessionId}`;
    const cooldownKey = `${OTP_CONFIG.RESEND_COOLDOWN_PREFIX}${otpSessionId}`;

    const session = await this._redisService.get<OtpSessionPayload>(sessionKey);
    if (!session) throw new validationError(OTP_MESSAGES.EXPIRED);

    if (session.resendCount >= OTP_CONFIG.MAX_RESENDS) {
      await this._redisService.delete(sessionKey);
      throw new validationError(OTP_MESSAGES.MAX_RESENDS);
    }

    const onCooldown = await this._redisService.exists(cooldownKey);
    if (onCooldown) throw new validationError(OTP_MESSAGES.RESEND_COOLDOWN);

    const newOtp = this._otpService.generateOtp(6);
    await this._redisService.set(sessionKey, { ...session, otp: newOtp, attempts: 0, resendCount: session.resendCount + 1 }, OTP_CONFIG.TTL_SECONDS);
    await this._redisService.set(cooldownKey, 1, OTP_CONFIG.RESEND_COOLDOWN_SECONDS);

    await this._emailService.sendEmail({
      to: session.email,
      subject: "OTP Resend",
      text: `Your new OTP is ${newOtp}. Valid for 5 minutes. Do not share this with anyone.`,
    });
  }
}