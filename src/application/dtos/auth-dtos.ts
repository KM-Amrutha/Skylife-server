export interface SignInDTO {
    email: string;
    password:string;
}

export interface FindEmailDTO {
 email:string;
}

export interface CreateOtpSessionDTO {
  email: string;
  purpose: 'signup' | 'forgotPassword';
}

export interface OtpSessionPayload {
  email: string;
  otp: string;
  purpose: 'signup' | 'forgotPassword';
  attempts: number;
  resendCount: number;
}

export interface VerifyOtpDTO {
  otpSessionId: string;
  otp: string;
}

export interface ResendOtpDTO {
  otpSessionId: string;
}


export interface CreatePassResetTokenDTO {
  email: string;
  resetToken: string;
}

export interface DeletePasswordResetTokenDTO extends CreatePassResetTokenDTO {}


export interface UpdatePasswordDTO {
  email: string;
  password: string;
  newPassword?: string;
} 


export enum RoleType {
  Provider = "provider",
  User = "user",
  Admin = "admin",
}


export interface ChangePasswordDTO {
  userId: string;
  password: string;
  newPassword: string;
}
export interface PasswordResetDTO {
  password?: string;
  resetToken: string;
}

export interface UpdateBlockStatusDTO {
  userId: string;
  isActive: boolean;
}
export interface GoogleTokenDTO {
  token: string;
}
