/**
 * SMS Template ID Constants & Type (Enum pattern compatible with erasableSyntaxOnly)
 * 
 * - LOGIN_OTP (1) / OTP (1): OTP Generation & Verification SMS (Login, Booking OTP, Cancel OTP)
 * - BOOKING_APPOINTMENT (2) / BOOKING_SUCCESS (2): Successful Appointment Booking Notification SMS
 * - CANCEL_APPOINTMENT (3) / CANCEL_SUCCESS (3): Successful Appointment Cancellation Notification SMS
 */

export const SmsTemplateId = {
  OTP: 1,
  LOGIN_OTP: 1,
  BOOKING_OTP: 1,
  CANCEL_OTP: 1,
  BOOKING_APPOINTMENT: 2,
  BOOKING_SUCCESS: 2,
  CANCEL_APPOINTMENT: 3,
  CANCEL_SUCCESS: 3,
  // Convenient aliases
  Login: 1,
  Booking: 2,
  Cancel: 3,
} as const;

export type SmsTemplateId = (typeof SmsTemplateId)[keyof typeof SmsTemplateId];

export const SMS_TEMPLATE_IDS = SmsTemplateId;

export type SmsTemplateIdType = SmsTemplateId;


