import axiosInstance from './axiosService';
import { type Patient } from '@/types/patient.types';

export { type Patient };

export interface ValidateOtpResponse {
    Result: string;
    UserID: number;
    ExistUser: boolean;
}

export interface RegisterPatientRequest {
    userID: number;
    name: string;
    gender: number;
    dob: string;
    age: number;
    mobileNo: string;
    address: string;
    city: string;
    state: string;
    pinCode: string;
    createdBy: number;
    updatedBy: number;
}

export interface DashboardParams {
    pageNo?: number;
    recordCount?: number;
    searchText?: string;
    patientID?: string | number;
}

export interface DashboardResponse {
    UpcomingAppointments: unknown[];
    PastVisits: unknown[];
}

export interface TimeSlot {
    TotalCount: number;
    TimeSlotID: number;
    Timeslot: string;
}

export interface Doctor {
    TotalCount: number;
    DoctorID: number;
    Doctor_Name: string;
}

export interface SaveAppointmentRequest {
    patientID: number;
    appointmentDate: string;
    deptID: number;
    doctorID: number;
    timeSlotID: number;
    unitID: number;
    typeID: number;
    statusID: number;
    createdBy: number;
    updatedBy: number;
}

/**
 * Generate OTP for the given phone number and optional patient ID
 * Calls POST /api/generateotp?PhoneNo={phoneNo}&PatientID={patientID}
 */
export const generateOtp = async (phoneNo: string, patientID?: number) => {
    try {
        const response = await axiosInstance.post('/api/generateotp', null, {
            params: {
                PhoneNo: phoneNo,
                ...(patientID !== undefined && { PatientID: patientID }),
            },
        });
        return response.data;
    } catch (error) {
        console.error('Generate OTP Error:', error);
        throw error;
    }
};

/**
 * Save / Confirm Appointment
 * Calls POST /api/saveappointment
 */
export const saveAppointment = async (data: SaveAppointmentRequest) => {
    try {
        const response = await axiosInstance.post('/api/saveappointment', data);
        return response.data;
    } catch (error) {
        console.error('Save Appointment Error:', error);
        throw error;
    }
};


/**
 * Validate OTP for the given phone number and OTP code
 * Calls GET /api/validateotp?PhoneNo={phoneNo}&otp={otp}
 */
export const validateOtp = async (phoneNo: string, otp: string): Promise<ValidateOtpResponse> => {
    try {
        const response = await axiosInstance.get<ValidateOtpResponse>('/api/validateotp', {
            params: {
                PhoneNo: phoneNo,
                otp: otp,
            },
        });
        console.log("Validate OTP", response.data)
        return response.data;
    } catch (error) {
        console.error('Validate OTP Error:', error);
        throw error;
    }
};

/**
 * Register a new patient
 * Calls POST /api/savepatient
 */
export const savePatient = async (data: RegisterPatientRequest) => {
    try {
        const response = await axiosInstance.post('/api/savepatient', data);
        console.log("Save Patient", response.data)
        return response.data;
    } catch (error) {
        console.error('Save Patient Error:', error);
        throw error;
    }
};

/**
 * Get dashboard data (Upcoming Appointments & Past Visits)
 * Calls GET /api/dashboard
 */
export const getDashboard = async (params?: DashboardParams): Promise<DashboardResponse> => {
    try {
        const response = await axiosInstance.get<DashboardResponse>('/api/dashboard', {
            params: {
                ...(params?.pageNo !== undefined && { pageNo: params.pageNo }),
                ...(params?.recordCount !== undefined && { recordCount: params.recordCount }),
                ...(params?.searchText !== undefined && { searchText: params.searchText }),
                ...(params?.patientID !== undefined && { patientID: params.patientID }),
            },
        });
        console.log("Dashboard", response.data)
        return response.data;
    } catch (error) {
        console.error('Get Dashboard Error:', error);
        throw error;
    }
};

/**
 * Get available appointment time slots
 * Calls GET /api/timeslot
 */
export const getTimeSlots = async (timeSlotId?: number): Promise<TimeSlot[]> => {
    try {
        const response = await axiosInstance.get<TimeSlot[]>('/api/timeslot', {
            params: {
                ...(timeSlotId !== undefined && { TimeSlotID: timeSlotId }),
            },
        });
        return response.data;
    } catch (error) {
        console.error('Get Time Slots Error:', error);
        throw error;
    }
};

/**
 * Get doctors by department ID
 * Calls GET /api/doctor
 */
export const getDoctors = async (departmentId?: number, doctorId?: number): Promise<Doctor[]> => {
    try {
        const response = await axiosInstance.get<Doctor[]>('/api/doctor', {
            params: {
                ...(departmentId !== undefined && { DepartmentID: departmentId }),
                ...(doctorId !== undefined && { DoctorID: doctorId }),
            },
        });
        return response.data;
    } catch (error) {
        console.error('Get Doctors Error:', error);
        throw error;
    }
};

export interface FetchPatientParams {
    patientID?: number | string;
    pageNo?: number;
    recordCount?: number;
    searchText?: string;
}

/**
 * Fetch patient information by patientID, pageNo, recordCount, searchText
 * Calls GET /api/fetchpatient
 */
export const fetchPatient = async (params?: FetchPatientParams): Promise<Patient[]> => {
    try {
        const response = await axiosInstance.get<Patient[]>('/api/fetchpatient', {
            params: {
                ...(params?.patientID !== undefined && { patientID: params.patientID }),
                ...(params?.pageNo !== undefined && { pageNo: params.pageNo }),
                ...(params?.recordCount !== undefined && { recordCount: params.recordCount }),
                ...(params?.searchText !== undefined && { searchText: params.searchText }),
            },
        });
        return response.data;
    } catch (error) {
        console.error('Fetch Patient Error:', error);
        throw error;
    }
};


