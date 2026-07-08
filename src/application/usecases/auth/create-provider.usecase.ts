import { IUserRepository, IProviderRepository, IEncryptionService, IEmailService, IOtpService, ICreateProviderUseCase } from "@di/file-imports-index";
import { CreateProviderDTO, Provider } from "@application/dtos/provider-dtos";
import { APPLICATION_MESSAGES, AUTH_MESSAGES, OTP_CONFIG } from "@shared/constants/index.constants";
import { validationError } from "@presentation/middlewares/error.middleware";
import { injectable, inject } from "inversify";
import { TYPES_SERVICES } from "@di/types-services";
import { TYPES_REPOSITORIES } from "@di/types-repositories";
import { ProviderMapper } from "@application/mappers/providerMapper";
import { UserMapper } from "@application/mappers/userMapper";
import { userListDTO } from "@application/dtos/user-dtos";
import { IRedisService } from "@application/interfaces/service/cache/IRedis.service";
import { OtpSessionPayload } from "@application/dtos/auth-dtos";

@injectable()
export class CreateProviderUseCase implements ICreateProviderUseCase {
  constructor(
    @inject(TYPES_REPOSITORIES.UserRepository)
    private _userRepository: IUserRepository,
    @inject(TYPES_REPOSITORIES.ProviderRepository)
    private _providerRepository: IProviderRepository,
    @inject(TYPES_SERVICES.EncryptionService)
    private _encryptionService: IEncryptionService,
    @inject(TYPES_SERVICES.EmailService)
    private _emailService: IEmailService,
    @inject(TYPES_SERVICES.OtpService)
    private _otpService: IOtpService,
    @inject(TYPES_SERVICES.RedisService)
    private _redisService: IRedisService,
  ) {}

  private async createOtpSession(email: string): Promise<string> {
    const otp = this._otpService.generateOtp(6);
    const otpSessionId = crypto.randomUUID();
    const payload: OtpSessionPayload = { email, otp, purpose: "signup", attempts: 0, resendCount: 0 };
    await this._redisService.set(`${OTP_CONFIG.REDIS_PREFIX}${otpSessionId}`, payload, OTP_CONFIG.TTL_SECONDS);
    await this._emailService.sendEmail({
      to: email,
      subject: "OTP for Registration",
      text: `Your OTP is ${otp}. Valid for 5 minutes. Do not share this with anyone.`,
    });
    return otpSessionId;
  }

  async execute({ companyName, email, mobile, password, airlineCode }: CreateProviderDTO): Promise<(Provider | userListDTO) & { otpSessionId: string }> {
    if (!companyName || !email || !mobile || !password || !airlineCode) {
      throw new validationError(APPLICATION_MESSAGES.ALL_FIELDS_ARE_REQUIRED);
    }

    const existingUser = await this._userRepository.findOne({ email });
    if (existingUser && existingUser.otpVerified) throw new validationError(AUTH_MESSAGES.EMAIL_CONFLICT);

    const existingAirlineCode = await this._providerRepository.getProviderByAirlineCode(airlineCode);
    if (existingAirlineCode) throw new validationError("Airline code already exists");

    if (existingUser && !existingUser.otpVerified) {
      const otpSessionId = await this.createOtpSession(email);
      return { ...UserMapper.toUserListDTO(existingUser), otpSessionId };
    }

    const hashedPassword = await this._encryptionService.hash(password);
    const providerData = await this._providerRepository.createProvider({
      companyName, email, mobile, password: hashedPassword, airlineCode, isActive: true, isVerified: true,
    });
    const otpSessionId = await this.createOtpSession(email);
    return { ...ProviderMapper.toProviderDTO(providerData), otpSessionId };
  }
}