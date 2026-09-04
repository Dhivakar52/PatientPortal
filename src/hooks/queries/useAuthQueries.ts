import { useMutation } from '@tanstack/react-query'
import {
  generateOtp,
  sendSmsRequest,
  validateOtp,
  type SendSmsRequestParams,
  type SendSmsResponse,
  type ValidateOtpResponse,
} from '@/services/apiService'

export interface GenerateOtpMutationParams {
  phoneNo: string
  patientID?: number
}

export interface ValidateOtpMutationParams {
  phoneNo: string
  otp: string
  patientID?: number
}

/**
 * TanStack Query Mutation to Generate OTP (Step 1)
 * POST /api/generateotp?PhoneNo={PhoneNo}&PatientID={PatientID}
 */
export function useGenerateOtpMutation() {
  return useMutation<number | string, Error, GenerateOtpMutationParams>({
    mutationFn: async ({ phoneNo, patientID }) => {
      return generateOtp(phoneNo, patientID)
    },
  })
}

/**
 * TanStack Query Mutation to Send SMS Request (Step 2)
 * POST /api/sendsmsrequest?TemplateID=1&ReferenceID={referenceId}&SMSNotify=true
 */
export function useSendSmsMutation() {
  return useMutation<SendSmsResponse, Error, SendSmsRequestParams>({
    mutationFn: async (params) => {
      return sendSmsRequest(params)
    },
  })
}

/**
 * TanStack Query Mutation to Validate OTP (Step 3)
 * GET /api/validateotp?PhoneNo={PhoneNo}&otp={otp}&PatientID={PatientID}
 */
export function useValidateOtpMutation() {
  return useMutation<ValidateOtpResponse, Error, ValidateOtpMutationParams>({
    mutationFn: async ({ phoneNo, otp, patientID }) => {
      return validateOtp(phoneNo, otp, patientID)
    },
  })
}
