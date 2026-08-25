import { useQuery } from '@tanstack/react-query'
import { fetchAppointments, type FetchAppointmentParams } from '@/services/apiService'
import { type Appointment } from '@/types/patient.types'
import { todayStr } from '@/utils/patient.utils'

export const appointmentsQueryKeys = {
  all: ['appointments'] as const,
  user: (userId: string | number | null) => ['appointments', userId] as const,
  list: (
    userId: string | number | null,
    patientId: string | number | null,
    params?: FetchAppointmentParams
  ) => ['appointments', userId, patientId, params] as const,
}

export function useAppointmentsQuery(
  userId: string | number | null,
  patientId: string | number | null,
  params?: FetchAppointmentParams,
  options?: { enabled?: boolean }
) {
  const numericPatientId = patientId ? Number(patientId) : undefined
  const isEnabled = options?.enabled !== false && !!numericPatientId

  return useQuery({
    queryKey: appointmentsQueryKeys.list(userId, numericPatientId || null, params),
    queryFn: async () => {
      if (!numericPatientId) return []
      const res = await fetchAppointments({
        PatientID: numericPatientId,
        pageNo: params?.pageNo || 1,
        recordCount: params?.recordCount || 50,
        ...params,
      })

      if (!Array.isArray(res)) return []

      const mapped: Appointment[] = res.map((item: Record<string, unknown>, idx: number) => {
        const apptStatus = String(item.AppointmentStatus || item.Status || item.status || 'Scheduled')
        const apptNo = item.AppointmentNo && String(item.AppointmentNo).trim() !== '' ? String(item.AppointmentNo) : `APT-${item.AppointmentID || idx + 1}`
        const apptDate = String(item.AppointmentDate || item.date || item.Date || todayStr())
        const deptName = String(item.DeptName || item.Department || item.DepartmentName || item.department || 'General')
        const rawDoctor = String(item.DoctorName || item.Doctor_Name || item.doctor || '')
        const cleanDoctor = (rawDoctor === '--Select--' || !rawDoctor.trim() || item.DoctorID === 0) ? `${deptName} Specialist` : rawDoctor
        const timeSlot = String(item.TimeSlot || item.Timeslot || item.timeslot || item.slot || '08:00 AM - 08:10 AM')
        const bookedOn = String(item.CreatedAt || item.BookedOn || item.bookedOn || new Date().toISOString())

        return {
          AppointmentID: Number(item.AppointmentID || idx + 1),
          PatientID: Number(item.PatientID || numericPatientId),
          PatientName: String(item.PatientName || ''),
          AppointmentStatus: apptStatus,
          AppointmentDate: apptDate,
          AppointmentType: String(item.AppointmentType || 'Online'),
          DeptID: Number(item.DeptID || 0),
          DeptName: deptName,
          Department: deptName,
          department: deptName,
          DoctorID: Number(item.DoctorID || 0),
          DoctorName: cleanDoctor,
          Doctor_Name: cleanDoctor,
          doctor: cleanDoctor,
          TimeSlotID: Number(item.TimeSlotID || 1),
          TimeSlot: timeSlot,
          Timeslot: timeSlot,
          slot: timeSlot,
          UnitID: Number(item.UnitID || 0),
          Unit: String(item.Unit || item.unit || 'Unit 1'),
          unit: String(item.Unit || item.unit || 'Unit 1'),
          StatusID: Number(item.StatusID || 0),
          Status: apptStatus,
          status: apptStatus,
          AppointmentNo: apptNo,
          apptNo: apptNo,
          bookedOn: bookedOn,
          BookedOn: bookedOn,
          BookedMode: String(item.BookedMode || item.bookedMode || item.BookingMode || item.bookingMode || item.AppointmentType || 'Online'),
          bookedMode: String(item.BookedMode || item.bookedMode || item.BookingMode || item.bookingMode || item.AppointmentType || 'Online'),
          date: apptDate,
          room: String(item.Room || item.room || 'OPD-101'),
        }
      })

      return mapped
    },
    enabled: isEnabled,
    staleTime: 1000 * 60, // 1 min fresh
  })
}
