export function genOtp(): string {
  return String(Math.floor(1000 + Math.random() * 9000))
}

export function genApptNo(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const rand = String(Math.floor(100000 + Math.random() * 900000))
  return `APT-${y}${m}${d}-${rand}`
}

export function calcAge(dobStr: string): number | '' {
  if (!dobStr) return ''
  const dob = new Date(dobStr)
  if (isNaN(dob.getTime())) return ''
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const mm = today.getMonth() - dob.getMonth()
  if (mm < 0 || (mm === 0 && today.getDate() < dob.getDate())) {
    age--
  }
  return age >= 0 ? age : ''
}

export function formatDateLong(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  if (isNaN(d.getTime())) return dateStr
  const day = String(d.getDate()).padStart(2, '0')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${day}-${months[d.getMonth()]}-${String(d.getFullYear()).slice(2)}`
}

export function formatDateBadge(dateStr: string): { d: string; m: string; y: string } {
  if (!dateStr) return { d: '--', m: '---', y: '----' }
  const d = new Date(dateStr + 'T00:00:00')
  if (isNaN(d.getTime())) return { d: '--', m: '---', y: '----' }
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  return {
    d: String(d.getDate()).padStart(2, '0'),
    m: months[d.getMonth()],
    y: String(d.getFullYear()),
  }
}

export function formatDateFull(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  if (isNaN(d.getTime())) return dateStr
  const day = String(d.getDate()).padStart(2, '0')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${day}-${months[d.getMonth()]}-${d.getFullYear()}`
}

export function formatDateTime(isoStr: string): string {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  if (isNaN(d.getTime())) return ''
  const day = String(d.getDate()).padStart(2, '0')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  let hrs = d.getHours()
  const ampm = hrs >= 12 ? 'PM' : 'AM'
  hrs = hrs % 12
  if (hrs === 0) hrs = 12
  const mins = String(d.getMinutes()).padStart(2, '0')
  return `${day}-${months[d.getMonth()]}-${d.getFullYear()} ${String(hrs).padStart(2, '0')}:${mins} ${ampm}`
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

export function initials(name: string): string {
  if (!name) return '?'
  return name.trim().charAt(0).toUpperCase()
}

export function capitalizeName(name: string): string {
  if (!name) return ''
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

export function digitsOnly(v: string, max: number): string {
  return v.replace(/\D/g, '').slice(0, max)
}

/**
 * Parses appointment date and slot/time into a single Date object representing the end of the appointment slot.
 */
export function parseAppointmentEndDateTime(appt: { date?: string; AppointmentDate?: string; slot?: string; TimeSlot?: string; Timeslot?: string }): Date | null {
  const dateStr = String(appt.date || appt.AppointmentDate || '').trim()
  if (!dateStr) return null

  let year = 0
  let month = 0 // 0-indexed
  let day = 0

  // 1. DD-MM-YYYY or DD/MM/YYYY
  const ddMmMatch = dateStr.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/)
  if (ddMmMatch) {
    day = parseInt(ddMmMatch[1], 10)
    month = parseInt(ddMmMatch[2], 10) - 1
    year = parseInt(ddMmMatch[3], 10)
  } else {
    // 2. DD-MMM-YYYY (e.g. 01-Oct-2026, 01-OCT-2026, 01/Oct/2026)
    const ddMmmMatch = dateStr.match(/^(\d{1,2})[-/ ]([A-Za-z]{3})[-/ ](\d{4})/)
    if (ddMmmMatch) {
      day = parseInt(ddMmmMatch[1], 10)
      const monthStr = ddMmmMatch[2].toUpperCase()
      year = parseInt(ddMmmMatch[3], 10)
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
      const idx = months.indexOf(monthStr)
      if (idx !== -1) month = idx
    } else {
      // 3. YYYY-MM-DD
      const isoMatch = dateStr.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/)
      if (isoMatch) {
        year = parseInt(isoMatch[1], 10)
        month = parseInt(isoMatch[2], 10) - 1
        day = parseInt(isoMatch[3], 10)
      } else {
        const d = new Date(dateStr)
        if (!isNaN(d.getTime())) {
          year = d.getFullYear()
          month = d.getMonth()
          day = d.getDate()
        } else {
          return null
        }
      }
    }
  }

  // Parse time string like "08:10 AM" or "14:30" or "08:01:00"
  const parseTimeString = (tStr: string): { hours: number; minutes: number; seconds: number } | null => {
    const match = tStr.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i)
    if (!match) return null
    let hours = parseInt(match[1], 10)
    const minutes = parseInt(match[2], 10)
    const seconds = match[3] ? parseInt(match[3], 10) : 0
    const ampm = match[4]?.toUpperCase()

    if (ampm === 'PM' && hours < 12) hours += 12
    if (ampm === 'AM' && hours === 12) hours = 0

    return { hours, minutes, seconds }
  }

  const slotStr = String(appt.slot || appt.TimeSlot || appt.Timeslot || (appt as any).Slot || '').trim()
  let parsedTime: { hours: number; minutes: number; seconds: number } | null = null

  if (slotStr) {
    if (slotStr.includes('-')) {
      const parts = slotStr.split('-')
      const endPart = parts[parts.length - 1].trim()
      parsedTime = parseTimeString(endPart)
    }
    if (!parsedTime) {
      parsedTime = parseTimeString(slotStr)
    }
  }

  // If slot didn't provide time, check if dateStr has a time portion (e.g. ISO string or datetime)
  if (!parsedTime && (dateStr.includes('T') || (dateStr.includes(' ') && dateStr.includes(':')))) {
    const timePortion = dateStr.includes('T') ? dateStr.split('T')[1] : dateStr.split(' ').slice(1).join(' ')
    parsedTime = parseTimeString(timePortion)
  }

  if (parsedTime) {
    return new Date(year, month, day, parsedTime.hours, parsedTime.minutes, parsedTime.seconds)
  }

  // Default to end of day (23:59:59)
  return new Date(year, month, day, 23, 59, 59, 999)
}

/**
 * Returns true if the appointment's scheduled date and time has passed.
 */
export function hasAppointmentDateTimePassed(appt: { date?: string; AppointmentDate?: string; slot?: string; TimeSlot?: string; Timeslot?: string }, now = new Date()): boolean {
  const endDateTime = parseAppointmentEndDateTime(appt)
  if (!endDateTime) return false
  return now.getTime() > endDateTime.getTime()
}

/**
 * Classifies the effective appointment status according to business & date validation rules:
 * - Cancelled stays Cancelled
 * - Visited / Completed stays Visited
 * - If scheduled date/time has passed and not Visited/Cancelled -> Not Visited
 * - Future appointments keep their current status (e.g. Scheduled / Confirmed / Upcoming)
 */
export function getEffectiveAppointmentStatus(
  appt: {
    date?: string
    AppointmentDate?: string
    slot?: string
    TimeSlot?: string
    Timeslot?: string
    AppointmentStatus?: string
    status?: string
    Status?: string
    StatusID?: number
  },
  now = new Date()
): string {
  const rawStatus = String(
    appt.AppointmentStatus ||
    appt.status ||
    appt.Status ||
    (appt as any).appointmentStatus ||
    (appt as any).AppointmentStatusName ||
    (appt as any).statusName ||
    ''
  ).trim()

  const lower = rawStatus.toLowerCase()
  const clean = lower.replace(/[\s_-]+/g, '')

  // 1. Cancelled
  if (
    clean === 'cancelled' ||
    clean === 'canceled' ||
    clean.startsWith('cancel') ||
    appt.StatusID === 2 ||
    (appt as any).statusID === 2
  ) {
    return 'Cancelled'
  }

  // 2. Visited
  if (clean === 'visited' || clean === 'completed') {
    return 'Visited'
  }

  // 3. Explicitly Not Visited
  if (clean === 'notvisited' || lower === 'not visited') {
    return 'Not Visited'
  }

  // 4. If scheduled date/time has already passed and not completed/visited -> Not Visited
  if (hasAppointmentDateTimePassed(appt, now)) {
    return 'Not Visited'
  }

  // 5. Future appointment -> preserve raw status or default 'Scheduled'
  return rawStatus || 'Scheduled'
}

