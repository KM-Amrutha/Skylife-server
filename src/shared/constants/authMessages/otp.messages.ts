export const OTP_MESSAGES = {
  SENT: 'The OTP has been resent to your email successfully.',
  VERIFIED: 'This user has already been verified and cannot receive a new OTP.',
  INVALID: 'The OTP you entered is either invalid or has expired.',
  EXPIRED: 'OTP session expired. Please sign up again.',
  MAX_ATTEMPTS: 'Too many incorrect attempts. Please sign up again.',
  MAX_RESENDS: 'Maximum resend limit reached. Please sign up again.',
  RESEND_COOLDOWN: 'Please wait 60 seconds before requesting a new OTP.',
} as const;

export const OTP_CONFIG = {
  REDIS_PREFIX: 'otp:session:',
  RESEND_COOLDOWN_PREFIX: 'otp:cooldown:',
  TTL_SECONDS: 300,           // 5 min session
  MAX_ATTEMPTS: 5,
  MAX_RESENDS: 3,
  RESEND_COOLDOWN_SECONDS: 60,
} as const;

