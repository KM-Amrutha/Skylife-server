import { IUserRepository, IEncryptionService, IEmailService, IOtpService, ICreateUserUseCase } from "@di/file-imports-index";
import { CreateUserDTO, userListDTO } from "@application/dtos/user-dtos";
import { APPLICATION_MESSAGES, AUTH_MESSAGES, OTP_CONFIG } from "@shared/constants/index.constants";
import { validationError } from "@presentation/middlewares/error.middleware";
import { injectable, inject } from "inversify";
import { TYPES_SERVICES } from "@di/types-services";
import { TYPES_REPOSITORIES } from "@di/types-repositories";
import { UserMapper } from "@application/mappers/userMapper";
import { IRedisService } from "@application/interfaces/service/cache/IRedis.service";
import { OtpSessionPayload } from "@application/dtos/auth-dtos";

@injectable()
export class CreateUserUseCase implements ICreateUserUseCase {
  constructor(
    @inject(TYPES_REPOSITORIES.UserRepository)
    private _userRepository: IUserRepository,
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

  async execute({ firstName, lastName, email, password }: CreateUserDTO): Promise<userListDTO & { otpSessionId: string }> {
    if (!firstName || !lastName || !email || !password) {
      throw new validationError(APPLICATION_MESSAGES.ALL_FIELDS_ARE_REQUIRED);
    }

    const existingUser = await this._userRepository.findOne({ email });

    if (existingUser && existingUser.otpVerified) throw new validationError(AUTH_MESSAGES.EMAIL_CONFLICT);
    if (existingUser && !existingUser.otpVerified && existingUser.googleVerified) throw new validationError(AUTH_MESSAGES.DIFFERENT_LOGIN_METHOD);

    if (existingUser && !existingUser.otpVerified) {
      const otpSessionId = await this.createOtpSession(email);
      return { ...UserMapper.toUserListDTO(existingUser), otpSessionId };
    }

    const hashedPassword = await this._encryptionService.hash(password);
    const userData = await this._userRepository.create({ firstName, lastName, email, password: hashedPassword });
    const otpSessionId = await this.createOtpSession(email);
    return { ...UserMapper.toUserListDTO(userData), otpSessionId };
  }
}