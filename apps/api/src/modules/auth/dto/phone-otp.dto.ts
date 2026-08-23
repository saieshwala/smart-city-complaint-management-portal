import { IsString, IsNotEmpty } from 'class-validator';

export class SendPhoneOtpDto {
  @IsString()
  @IsNotEmpty()
  phone: string;
}

export class VerifyPhoneOtpDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}
