import axiosInstance from './axiosService';
import { type Patient } from '@/types/patient.types';

export { type Patient };

export interface ValidateOtpResponse {
    Result: string;
    UserID: number;
    ExistUser: boolean;
}

export interface RegisterPatientRequest {
    userID?: number;
    name?: string;
    email?: string;
    gender?: number;
    dob?: string;
    age?: number;
    mobileNo?: string;
    address?: string;
    pinCode?: string;
    createdBy?: number;
    updatedBy?: number;
    countryID?: number;
    cityID?: number;
    stateID?: number;
    area?: string;
    // Compatibility fields
    StateID?: number;
    CityID?: number;
    state?: string;
    city?: string;
    Email?: string;
    EmailID?: string;
    emailID?: string;
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

export interface StateOption {
    TotalCount?: number;
    StateID: number;
    StateName: string;
    StateCode?: string;
    countryID?: number;
    CountryName?: string;
}

export interface CityOption {
    TotalCount?: number;
    CityID: number;
    CityName: string;
    StateID?: number;
    StateName?: string;
    StateCode?: string;
}

export interface TimeSlotHour {
    TotalCount?: number;
    TimeSlotHoursID?: number;
    timeSlotHoursID?: number;
    TimeSlotHours?: string;
    timeSlotHours?: string;
    SlotHours?: string;
    slotHours?: string;
    id?: number | string;
    name?: string;
}

export interface TimeSlot {
    TotalCount?: number;
    TimeSlotID: number;
    timeSlotID?: number;
    Timeslot: string;
    TimeSlot?: string;
    timeslot?: string;
    Slot?: string;
    slot?: string;
    TimeSlotHoursID?: number;
    timeSlotHoursID?: number;
    SlotTypeID?: number;
    slotTypeID?: number;
    IsAvailable?: boolean | number;
    isAvailable?: boolean | number;
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
    appointBookedTypeID?: number;
    cancelledReason?: string;
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
        const payload: SaveAppointmentRequest = {
            ...data,
            deptID: Number(data.deptID) || 18,
            doctorID: Number(data.doctorID) || 0,
            unitID: Number(data.unitID) || 0,
            appointBookedTypeID: Number(data.appointBookedTypeID) || 0,
            cancelledReason: data.cancelledReason || '',
        };
        console.log("Save Appointment Payload:", payload);
        const response = await axiosInstance.post('/api/saveappointment', payload);
        console.log("Save Appointment Response:", response.data);
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
export const validateOtp = async (phoneNo: string, otp: string, patientID?: number): Promise<ValidateOtpResponse> => {
    try {
        const response = await axiosInstance.get<ValidateOtpResponse>('/api/validateotp', {
            params: {
                PhoneNo: phoneNo,
                otp: otp,
                ...(patientID !== undefined && { PatientID: patientID }),
            },
        });
        console.log("Validate OTP", response.data)
        return response.data;
    } catch (error) {
        console.error('Validate OTP Error:', error);
        throw error;
    }
};

export interface UpdatePatientRequest {
    userID: number;
    name: string;
    email: string;
    gender: number;
    dob: string;
    age: number;
    mobileNo: string;
    address: string;
    pinCode: string;
    createdBy: number;
    updatedBy: number;
    countryID: number;
    cityID: number;
    stateID: number;
    area: string;
}

/**
 * Register a new patient
 * Calls POST /api/savepatient
 */
export const savePatient = async (data: RegisterPatientRequest) => {
    try {
        console.log("Save Patient Payload:", data);
        const response = await axiosInstance.post('/api/savepatient', data);
        console.log("Save Patient", response.data);
        return response.data;
    } catch (error) {
        console.error('Save Patient Error:', error);
        throw error;
    }
};

/**
 * Update Patient Details
 * Calls PUT /api/updatepatient/{patientid}
 */
export const updatePatient = async (
    patientId: number | string,
    payload: UpdatePatientRequest
) => {
    try {
        console.log(`📝 Updating patient ID ${patientId} payload:`, JSON.stringify(payload, null, 2));
        const response = await axiosInstance.put(`/api/updatepatient/${patientId}`, payload);
        console.log("Update Patient Response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error('Update Patient Error details:', error?.response?.data || error?.message);
        throw error;
    }
};

/**
 * Delete Patient
 * Calls DELETE /api/deletepatient/{patientid}?updatedBy={updatedBy}
 */
export const deletePatient = async (
    patientId: number | string,
    updatedBy: number
) => {
    try {
        console.log(`🗑️ Deleting patient ID ${patientId} updatedBy: ${updatedBy}`);
        const response = await axiosInstance.delete(`/api/deletepatient/${patientId}`, {
            params: {
                updatedBy,
            },
        });
        console.log("Delete Patient Response:", response.data);
        return response.data;
    } catch (error) {
        console.error('Delete Patient Error:', error);
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
 * Get time slot hours ranges
 * Calls GET /api/timeslothours
 */
export const getTimeSlotHours = async (timeSlotHoursId?: number | string): Promise<TimeSlotHour[]> => {
    try {
        const response = await axiosInstance.get<TimeSlotHour[]>('/api/timeslothours', {
            params: {
                ...(timeSlotHoursId !== undefined && timeSlotHoursId !== '' && { timeSlotHoursID: Number(timeSlotHoursId) }),
            },
        });
        const raw = response.data;
        return Array.isArray(raw) ? raw : [];
    } catch (error) {
        console.error('Get TimeSlotHours Error:', error);
        throw error;
    }
};

export interface GetTimeSlotsParams {
    timeSlotHoursID?: number | string;
    timeSlotID?: number | string;
    slotTypeID?: number | string;
}

/**
 * Get available appointment time slots
 * Calls GET /api/timeslot
 */
export const getTimeSlots = async (params?: GetTimeSlotsParams | number): Promise<TimeSlot[]> => {
    try {
        let queryParams: Record<string, unknown> = {};
        if (typeof params === 'number') {
            queryParams = { timeSlotID: params };
        } else if (params && typeof params === 'object') {
            if (params.timeSlotHoursID !== undefined && params.timeSlotHoursID !== '') {
                queryParams.timeSlotHoursID = Number(params.timeSlotHoursID);
            }
            if (params.timeSlotID !== undefined && params.timeSlotID !== '') {
                queryParams.timeSlotID = Number(params.timeSlotID);
            }
            if (params.slotTypeID !== undefined && params.slotTypeID !== '') {
                queryParams.slotTypeID = Number(params.slotTypeID);
            }
        }

        const response = await axiosInstance.get<TimeSlot[]>('/api/timeslot', {
            params: queryParams,
        });
        const raw = response.data;
        return Array.isArray(raw) ? raw : [];
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

/**
 * Get states list
 * Calls GET /api/states
 */
export const getStates = async (): Promise<StateOption[]> => {
    try {
        const response = await axiosInstance.get<unknown>('/api/states');
        console.log("States response:", response.data);
        const data = response.data;
        if (Array.isArray(data)) return data;
        if (data && typeof data === 'object') {
            if (Array.isArray((data as any).data)) return (data as any).data;
            if (Array.isArray((data as any).States)) return (data as any).States;
            if (Array.isArray((data as any).result)) return (data as any).result;
        }
        return [];
    } catch (error) {
        console.error('Get States Error:', error);
        return [];
    }
};

/**
 * Get cities list, optionally filtered by StateID
 * Calls GET /api/cities
 */
export const getCities = async (stateId?: number | string): Promise<CityOption[]> => {
    try {
        const response = await axiosInstance.get<unknown>('/api/cities', {
            params: {
                ...(stateId !== undefined && stateId !== '' && { StateID: stateId }),
            },
        });
        console.log("Cities response:", response.data);
        const data = response.data;
        if (Array.isArray(data)) return data;
        if (data && typeof data === 'object') {
            if (Array.isArray((data as any).data)) return (data as any).data;
            if (Array.isArray((data as any).Cities)) return (data as any).Cities;
            if (Array.isArray((data as any).result)) return (data as any).result;
        }
        return [];
    } catch (error) {
        console.error('Get Cities Error:', error);
        return [];
    }
};

export interface FetchPatientParams {
    patientID?: number | string;
    userID?: number | string;
    pageNo?: number;
    recordCount?: number;
    searchText?: string;
}

/**
 * Fetch patient information
 * Calls GET /api/fetchpatient?patientID={patientID || userID}
 */
export const fetchPatient = async (params?: FetchPatientParams): Promise<Patient[]> => {
    try {
        const storedUserId = Number(localStorage.getItem('userID') || localStorage.getItem('srm_patient_user_id')) || undefined;
        // Pass userId into patientID parameter as expected by the backend
        const targetPatientId = params?.patientID ?? params?.userID ?? storedUserId;

        const response = await axiosInstance.get<unknown>('/api/fetchpatient', {
            params: {
                ...(targetPatientId !== undefined && { patientID: targetPatientId }),
                ...(params?.pageNo !== undefined && { pageNo: params.pageNo }),
                ...(params?.recordCount !== undefined && { recordCount: params.recordCount }),
                ...(params?.searchText !== undefined && { searchText: params.searchText }),
            },
        });
        console.log("Fetch Patient Response:", response.data);

        // Normalize response data to always return a flat array of Patient[]
        let rawList: unknown[] = [];
        if (Array.isArray(response.data)) {
            // Check if items have a nested "Patients" array (e.g. [{ UserID: 1, phoneNo: "...", Patients: [...] }])
            const firstItem = response.data[0] as Record<string, unknown> | undefined;
            if (firstItem && Array.isArray(firstItem.Patients)) {
                rawList = response.data.flatMap((u: Record<string, unknown>) => {
                    const phone = String(u.phoneNo || u.PhoneNo || '');
                    const pts = Array.isArray(u.Patients) ? u.Patients : [];
                    return pts.map((p: Record<string, unknown>) => ({
                        ...p,
                        phoneNo: p.PhoneNo || p.phoneNo || phone,
                        PhoneNo: p.PhoneNo || p.phoneNo || phone,
                    }));
                });
            } else {
                rawList = response.data;
            }
        } else if (response.data && typeof response.data === 'object') {
            const dataObj = response.data as Record<string, unknown>;
            if (Array.isArray(dataObj.Patients)) {
                const phone = String(dataObj.phoneNo || dataObj.PhoneNo || '');
                rawList = dataObj.Patients.map((p: Record<string, unknown>) => ({
                    ...p,
                    phoneNo: p.PhoneNo || p.phoneNo || phone,
                    PhoneNo: p.PhoneNo || p.phoneNo || phone,
                }));
            } else {
                rawList = [dataObj];
            }
        }

        // Map and normalize each Patient object
        const normalizedPatients: Patient[] = rawList.map((item: unknown) => {
            const p = (item || {}) as Record<string, unknown>;
            const patientId = Number(p.PatientID || p.patientID || p.id || 0);
            const patientName = String(p.PatientName || p.patientName || p.name || '');
            const dob = String(p.DOB || p.dob || '');
            const age = typeof p.Age === 'number' ? p.Age : (typeof p.age === 'number' ? p.age : 0);
            const gender = String(p.Gender || p.gender || 'Male');
            const genderId = Number(p.GenderID || p.genderID || (gender.toLowerCase() === 'female' ? 2 : 1));
            const address = String(p.Address || p.PatientAddress || p.address || '');
            const stateRaw = p.StateID ?? p.stateID ?? p.State ?? p.PatientState ?? p.state ?? '';
            const state = String(stateRaw);
            const stateId = typeof p.StateID === 'number' ? p.StateID : (typeof p.stateID === 'number' ? p.stateID : (Number(stateRaw) || undefined));

            const cityRaw = p.CityID ?? p.cityID ?? p.City ?? p.PatientCity ?? p.city ?? '';
            const city = String(cityRaw);
            const cityId = typeof p.CityID === 'number' ? p.CityID : (typeof p.cityID === 'number' ? p.cityID : (Number(cityRaw) || undefined));
            const countryId = typeof p.CountryID === 'number' ? p.CountryID : (typeof p.countryID === 'number' ? p.countryID : (Number(p.CountryID || p.countryID) || 1));

            const pinCode = String(p.PinCode || p.pinCode || p.pincode || '');
            const phoneNo = String(p.PhoneNo || p.phoneNo || p.mobile || '');
            const uhid = p.UHID != null ? String(p.UHID) : null;
            const registerNo = p.RegisterNo != null ? String(p.RegisterNo) : null;
            const abhaId = p.AbhaID != null ? String(p.AbhaID) : null;
            const emailRaw = p.Email ?? p.email ?? p.EmailID ?? p.emailID ?? null;
            const email = emailRaw != null && String(emailRaw).trim() !== '' ? String(emailRaw).trim() : null;

            return {
                TotalPatients: typeof p.TotalPatients === 'number' ? p.TotalPatients : undefined,
                TotalCount: typeof p.TotalCount === 'number' ? p.TotalCount : undefined,
                PatientID: patientId,
                PatientName: patientName,
                UHID: uhid,
                RegisterNo: registerNo,
                AbhaID: abhaId,
                DOB: dob,
                Age: age,
                GenderID: genderId,
                Gender: gender,
                Address: address,
                PatientAddress: address,
                StateID: stateId,
                stateID: stateId,
                CityID: cityId,
                cityID: cityId,
                CountryID: countryId,
                countryID: countryId,
                City: city,
                State: state,
                PatientState: state,
                PinCode: pinCode,
                PhoneNo: phoneNo,
                Email: email,
                email: email,

                // Convenience aliases for existing components
                id: String(patientId),
                name: patientName,
                mobile: phoneNo,
                gender: gender,
                dob: dob,
                address: address,
                city: city,
                state: state,
                pincode: pinCode,
            };
        });

        return normalizedPatients;
    } catch (error) {
        console.error('Fetch Patient Error:', error);
        throw error;
    }
};

export interface Department {
    TotalCount?: number;
    DepartmentID?: number;
    DepartmentName?: string;
    DeptID?: number;
    DeptName?: string;
    name?: string;
    id?: number;
}

export interface Unit {
    TotalCount?: number;
    UnitID?: number;
    UnitName?: string;
    DeptID?: number;
    DoctorID?: number;
}

export interface FetchAppointmentParams {
    pageNo?: number;
    recordCount?: number;
    searchText?: string;
    AppointmentID?: number;
    PatientID?: number;
    AppointmentNo?: string;
    RegisterNo?: string;
    TypeID?: number;
    StatusID?: number;
    FromDate?: string;
    ToDate?: string;
}

/**
 * Fetch appointments
 * Calls GET /api/fetchappointment
 */
export const fetchAppointments = async (params?: FetchAppointmentParams) => {
    try {
        const response = await axiosInstance.get('/api/fetchappointment', {
            params: {
                ...(params?.pageNo !== undefined && { pageNo: params.pageNo }),
                ...(params?.recordCount !== undefined && { recordCount: params.recordCount }),
                ...(params?.searchText !== undefined && { searchText: params.searchText }),
                ...(params?.AppointmentID !== undefined && { AppointmentID: params.AppointmentID }),
                ...(params?.PatientID !== undefined && { PatientID: params.PatientID }),
                ...(params?.AppointmentNo !== undefined && { AppointmentNo: params.AppointmentNo }),
                ...(params?.RegisterNo !== undefined && { RegisterNo: params.RegisterNo }),
                ...(params?.TypeID !== undefined && { TypeID: params.TypeID }),
                ...(params?.StatusID !== undefined && { StatusID: params.StatusID }),
                ...(params?.FromDate !== undefined && { FromDate: params.FromDate }),
                ...(params?.ToDate !== undefined && { ToDate: params.ToDate }),
            },
        });
        console.log('Appointments:', response.data)
        return response.data;
    } catch (error) {
        console.error('Fetch Appointments Error:', error);
        throw error;
    }
};

/**
 * Cancel Appointment
 * Calls PUT /api/cancelappointment/{appointmentid}?updatedBy={patientId}&cancelledReason={reason}
 */
export const cancelAppointment = async (
    appointmentId: number,
    updatedBy?: number,
    cancelledReason?: string
) => {
    try {
        const response = await axiosInstance.put(`/api/cancelappointment/${appointmentId}`, null, {
            params: {
                ...(updatedBy !== undefined && { updatedBy }),
                ...(cancelledReason !== undefined && { cancelledReason }),
            },
        });
        return response.data;
    } catch (error) {
        console.error('Cancel Appointment Error:', error);
        throw error;
    }
};

export const cancelAppointmentApi = cancelAppointment;

export interface UpdateAppointmentRequest {
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
    cancelledReason?: string;
}

/**
 * Update Appointment
 * Calls PUT /api/updateappointment/{appointmentId}
 */
export const updateAppointment = async (
    appointmentId: number,
    data: UpdateAppointmentRequest
) => {
    try {
        const response = await axiosInstance.put(`/api/updateappointment/${appointmentId}`, data);
        return response.data;
    } catch (error) {
        console.error('Update Appointment Error:', error);
        throw error;
    }
};

/**
 * Get departments from Master
 * Calls GET /api/department
 */
export const getDepartments = async (params?: { pageNo?: number; recordCount?: number; searchText?: string }): Promise<Department[]> => {
    try {
        const response = await axiosInstance.get<Department[]>('/api/department', {
            params: {
                ...(params?.pageNo !== undefined && { pageNo: params.pageNo }),
                ...(params?.recordCount !== undefined && { recordCount: params.recordCount }),
                ...(params?.searchText !== undefined && { searchText: params.searchText }),
            },
        });
        return response.data;
    } catch (error) {
        console.error('Get Departments Error:', error);
        throw error;
    }
};

/**
 * Get units
 * Calls GET /api/unit
 */
export const getUnits = async (params?: { UnitID?: number; DeptID?: number; DoctorID?: number }): Promise<Unit[]> => {
    try {
        const response = await axiosInstance.get<Unit[]>('/api/unit', {
            params: {
                ...(params?.UnitID !== undefined && { UnitID: params.UnitID }),
                ...(params?.DeptID !== undefined && { DeptID: params.DeptID }),
                ...(params?.DoctorID !== undefined && { DoctorID: params.DoctorID }),
            },
        });
        return response.data;
    } catch (error) {
        console.error('Get Units Error:', error);
        throw error;
    }
};

export interface GetUsersParams {
    pageNo?: number;
    recordCount?: number;
    searchText?: string;
    userID?: number;
    phoneNo?: string;
}

export interface UserData {
    TotalCount?: number;
    UserID: number;
    UserTypeID?: number;
    UserType?: string;
    phoneNo?: string;
    PhoneNo?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    Patients?: Patient[];
}

/**
 * Get users by phoneNo, userID, pageNo, recordCount, searchText
 * Calls GET /api/getusers
 */
export const getUsers = async (params?: GetUsersParams): Promise<UserData[]> => {
    try {
        const response = await axiosInstance.get<UserData[]>('/api/getusers', {
            params: {
                ...(params?.pageNo !== undefined && { pageNo: params.pageNo }),
                ...(params?.recordCount !== undefined && { recordCount: params.recordCount }),
                ...(params?.searchText !== undefined && { searchText: params.searchText }),
                ...(params?.userID !== undefined && { userID: params.userID }),
                ...(params?.phoneNo !== undefined && { phoneNo: params.phoneNo }),
            },
        });
        console.log("Get Users Response:", response.data);
        return response.data;
    } catch (error) {
        console.error('Get Users Error:', error);
        throw error;
    }
};


