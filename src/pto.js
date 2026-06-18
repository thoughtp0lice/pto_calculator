// Date helpers using local-time YYYY-MM-DD keys
export const toKey = (d) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const fromKey = (key) => {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const addDays = (d, n) => {
  const next = new Date(d)
  next.setDate(next.getDate() + n)
  return next
}

// Walks every day from `start` through end of (start.year + 1), computing
// the running PTO balance. Returns a Map keyed by YYYY-MM-DD with details.
//
// Per-workday accrual = accrualPerHour * hoursPerDay.
// PTO days deduct hoursPerDay from the balance.
export function buildBalances({
  startDate,
  startingBalance,
  accrualPerHour,
  hoursPerDay,
  workdays,  // Set of weekday numbers 0-6 (0 = Sun)
  ptoDays,   // Set of YYYY-MM-DD keys
  holidays,  // Set of YYYY-MM-DD keys
  endDate,
}) {
  const balances = new Map()
  let balance = startingBalance
  const accrualPerDay = accrualPerHour * hoursPerDay
  const ptoCost = hoursPerDay

  let cursor = new Date(startDate)
  while (cursor <= endDate) {
    const key = toKey(cursor)
    const dow = cursor.getDay()
    const isWorkday = workdays.has(dow)
    const isHoliday = holidays.has(key)
    const isPto = ptoDays.has(key) && !isHoliday

    let accrued = 0
    let used = 0

    // Accrue only on actual worked days: a workday that isn't PTO and isn't a holiday.
    if (isWorkday && !isPto && !isHoliday) {
      accrued = accrualPerDay
      balance += accrued
    }
    if (isPto) {
      used = ptoCost
      balance -= used
    }

    balances.set(key, {
      balance,
      accrued,
      used,
      isWorkday,
      isPto,
      isHoliday,
    })
    cursor = addDays(cursor, 1)
  }
  return balances
}

export const formatHours = (h) => {
  const sign = h < 0 ? '-' : ''
  const abs = Math.abs(h)
  return `${sign}${abs.toFixed(2)}h`
}

export const hoursToDays = (h, hoursPerDay) =>
  hoursPerDay > 0 ? h / hoursPerDay : 0
