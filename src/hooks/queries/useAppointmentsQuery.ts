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
        const apptStatus = String(item.AppointmentStatus || item.Status || item.status || '')
        const apptId = item.AppointmentID !== undefined && item.AppointmentID !== null ? Number(item.AppointmentID) : (item.id !== undefined ? Number(item.id) : undefined)
        const apptNo = item.AppointmentNo && String(item.AppointmentNo).trim() !== '' ? String(item.AppointmentNo) : (apptId ? `APT-${apptId}` : (item.apptNo ? String(item.apptNo) : `APT-${idx + 1}`))
        const apptDate = String(item.AppointmentDate || item.date || item.Date || todayStr())
        const deptName = String(item.DeptName || item.Department || item.DepartmentName || item.department || '')
        const rawDoctor = String(item.DoctorName || item.Doctor_Name || item.doctor || '')
        const cleanDoctor = (rawDoctor === '--Select--' || !rawDoctor.trim() || item.DoctorID === 0) ? (deptName ? `${deptName} Specialist` : 'Doctor') : rawDoctor
        const timeSlot = String(item.TimeSlot || item.Timeslot || item.timeslot || item.slot || '')
        const bookedOn = String(item.CreatedAt || item.BookedOn || item.bookedOn || new Date().toISOString())

        return {
          AppointmentID: apptId,
          PatientID: Number(item.PatientID || item.patientID || numericPatientId),
          PatientName: String(item.PatientName || item.patientName || ''),
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
          Unit: String(item.Unit || item.unit || ''),
          unit: String(item.Unit || item.unit || ''),
          StatusID: Number(item.StatusID || item.statusID || 0),
          Status: apptStatus,
          status: apptStatus,
          AppointmentNo: apptNo,
          apptNo: apptNo,
          bookedOn: bookedOn,
          BookedOn: bookedOn,
          BookedMode: String(item.BookedMode || item.bookedMode || item.BookingMode || item.bookingMode || item.AppointmentType || 'Online'),
          bookedMode: String(item.BookedMode || item.bookedMode || item.BookingMode || item.bookingMode || item.AppointmentType || 'Online'),
          date: apptDate,
          room: String(item.Room || item.room || ''),
        }
      })

      // Strict Deduplication by AppointmentID
      const uniqueMapped = mapped.filter(
        (appointment, index, self) =>
          index ===
          self.findIndex((item) => {
            if (item.AppointmentID && appointment.AppointmentID) {
              return item.AppointmentID === appointment.AppointmentID
            }
            if (item.AppointmentNo && appointment.AppointmentNo) {
              return item.AppointmentNo === appointment.AppointmentNo
            }
            if (item.apptNo && appointment.apptNo) {
              return item.apptNo === appointment.apptNo
            }
            return false
          })
      )

      return uniqueMapped
    },
    enabled: isEnabled,
    staleTime: 1000 * 60, // 1 min fresh
  })
}
