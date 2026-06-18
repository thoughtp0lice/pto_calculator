import { useMemo } from 'react'
import { toKey, formatHours, hoursToDays } from './pto.js'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export default function Calendar({
  viewDate,
  onPrevMonth,
  onNextMonth,
  onToday,
  balances,
  ptoDays,
  holidays,
  toggleDay,
  startDate,
  hoursPerDay,
  clickMode,
}) {
  const cells = useMemo(() => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const first = new Date(year, month, 1)
    const startWeekday = first.getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const out = []
    for (let i = 0; i < startWeekday; i++) out.push(null)
    for (let d = 1; d <= daysInMonth; d++) {
      out.push(new Date(year, month, d))
    }
    while (out.length % 7 !== 0) out.push(null)
    return out
  }, [viewDate])

  const startKey = toKey(startDate)

  return (
    <div className="calendar">
      <div className="cal-header">
        <button onClick={onPrevMonth} aria-label="Previous month">‹</button>
        <h2>
          {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
        </h2>
        <div className="cal-header-right">
          <span className="cal-mode-indicator">
            Click toggles:{' '}
            <strong className={clickMode}>
              {clickMode === 'pto' ? 'PTO' : 'Holiday'}
            </strong>
          </span>
          <button onClick={onToday}>Today</button>
          <button onClick={onNextMonth} aria-label="Next month">›</button>
        </div>
      </div>

      <div className="cal-grid cal-weekdays">
        {WEEKDAYS.map((d) => (
          <div key={d} className="cal-weekday">{d}</div>
        ))}
      </div>

      <div className="cal-grid cal-days">
        {cells.map((date, i) => {
          if (!date) return <div key={i} className="cal-cell empty" />
          const key = toKey(date)
          const info = balances.get(key)
          const isPto = ptoDays.has(key)
          const isHoliday = holidays.has(key)
          const beforeStart = key < startKey
          const isToday = key === toKey(new Date())

          const classes = ['cal-cell']
          if (isHoliday) classes.push('holiday')
          else if (isPto) classes.push('pto')
          if (info?.isWorkday) classes.push('workday')
          else classes.push('weekend')
          if (beforeStart) classes.push('before-start')
          if (isToday) classes.push('today')
          if (info && info.balance < 0 && !beforeStart) classes.push('negative')

          return (
            <button
              key={i}
              className={classes.join(' ')}
              onClick={() => !beforeStart && toggleDay(key)}
              disabled={beforeStart}
              title={beforeStart ? 'Before start date' : `Click to toggle ${clickMode}`}
            >
              <div className="cal-day-num">{date.getDate()}</div>
              {info && !beforeStart && (
                <div className="cal-day-info">
                  <div className="cal-balance">
                    {formatHours(info.balance)}
                  </div>
                  <div className="cal-balance-days">
                    {hoursToDays(info.balance, hoursPerDay).toFixed(1)}d
                  </div>
                  {isHoliday && <div className="cal-pto-badge holiday-badge">HOLIDAY</div>}
                  {isPto && !isHoliday && <div className="cal-pto-badge">PTO</div>}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
