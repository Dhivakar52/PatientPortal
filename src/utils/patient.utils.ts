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
