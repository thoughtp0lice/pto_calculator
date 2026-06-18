import { useMemo, useState } from 'react'
import Calendar from './Calendar.jsx'
import { buildBalances, toKey, fromKey, formatHours, hoursToDays } from './pto.js'

const DEFAULT_WORKDAYS = [1, 2, 3, 4, 5] // Mon–Fri
const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const todayKey = toKey(new Date())

export default function App() {
  const [accrualPerHour, setAccrualPerHour] = useState(0.0577) // ~15 days/yr at 8h
  const [hoursPerDay, setHoursPerDay] = useState(8)
  const [startingBalance, setStartingBalance] = useState(40)
  const [startDateKey, setStartDateKey] = useState(todayKey)
  const [workdays, setWorkdays] = useState(new Set(DEFAULT_WORKDAYS))
  const [ptoDays, setPtoDays] = useState(new Set())
  const [holidays, setHolidays] = useState(new Set())
  const [clickMode, setClickMode] = useState('pto') // 'pto' | 'holiday'
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })

  const startDate = useMemo(() => fromKey(startDateKey), [startDateKey])

  const endDate = useMemo(() => {
    const e = new Date(startDate)
    e.setFullYear(e.getFullYear() + 2)
    return e
  }, [startDate])

  const balances = useMemo(
    () =>
      buildBalances({
        startDate,
        startingBalance: Number(startingBalance) || 0,
        accrualPerHour: Number(accrualPerHour) || 0,
        hoursPerDay: Number(hoursPerDay) || 0,
        workdays,
        ptoDays,
        holidays,
        endDate,
      }),
    [startDate, startingBalance, accrualPerHour, hoursPerDay, workdays, ptoDays, holidays, endDate]
  )

  const toggleDay = (key) => {
    if (clickMode === 'pto') {
      setPtoDays((prev) => {
        const next = new Set(prev)
        if (next.has(key)) next.delete(key)
        else next.add(key)
        return next
      })
      // Clicking PTO on a holiday clears the holiday so the user's intent wins.
      setHolidays((prev) => {
        if (!prev.has(key)) return prev
        const next = new Set(prev)
        next.delete(key)
        return next
      })
    } else {
      setHolidays((prev) => {
        const next = new Set(prev)
        if (next.has(key)) next.delete(key)
        else next.add(key)
        return next
      })
      setPtoDays((prev) => {
        if (!prev.has(key)) return prev
        const next = new Set(prev)
        next.delete(key)
        return next
      })
    }
  }

  const toggleWorkday = (dow) => {
    setWorkdays((prev) => {
      const next = new Set(prev)
      if (next.has(dow)) next.delete(dow)
      else next.add(dow)
      return next
    })
  }

  const removePto = (key) =>
    setPtoDays((prev) => {
      const next = new Set(prev)
      next.delete(key)
      return next
    })

  const removeHoliday = (key) =>
    setHolidays((prev) => {
      const next = new Set(prev)
      next.delete(key)
      return next
    })

  const goPrev = () =>
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  const goNext = () =>
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
  const goToday = () => {
    const d = new Date()
    setViewDate(new Date(d.getFullYear(), d.getMonth(), 1))
  }

  const accrualPerDay = (Number(accrualPerHour) || 0) * (Number(hoursPerDay) || 0)
  const annualAccrual = accrualPerDay * workdays.size * 52
  const ptoUsedHours = ptoDays.size * (Number(hoursPerDay) || 0)

  const sortedPto = useMemo(() => Array.from(ptoDays).sort(), [ptoDays])
  const sortedHolidays = useMemo(() => Array.from(holidays).sort(), [holidays])

  return (
    <div className="app">
      <header className="app-header">
        <h1>PTO Calculator</h1>
        <p className="subtitle">
          Track your paid time off balance day by day.
        </p>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <section className="card">
            <h3>Accrual</h3>
            <label>
              PTO hours per hour worked
              <input
                type="number"
                step="0.001"
                min="0"
                value={accrualPerHour}
                onChange={(e) => setAccrualPerHour(e.target.value)}
              />
              <span className="hint">
                e.g. 0.0577 ≈ 15 days/yr at 8h/day
              </span>
            </label>
            <label>
              Hours per workday
              <input
                type="number"
                step="0.5"
                min="0"
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(e.target.value)}
              />
            </label>
            <label>
              Starting balance (hours)
              <input
                type="number"
                step="0.5"
                value={startingBalance}
                onChange={(e) => setStartingBalance(e.target.value)}
              />
            </label>
            <label>
              Start date
              <input
                type="date"
                value={startDateKey}
                onChange={(e) => setStartDateKey(e.target.value)}
              />
            </label>
          </section>

          <section className="card">
            <h3>Workdays</h3>
            <div className="weekday-toggle">
              {WEEKDAY_LABELS.map((label, dow) => (
                <button
                  key={dow}
                  type="button"
                  className={workdays.has(dow) ? 'on' : 'off'}
                  onClick={() => toggleWorkday(dow)}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          <section className="card">
            <h3>Click mode</h3>
            <div className="mode-toggle">
              <button
                type="button"
                className={clickMode === 'pto' ? 'on pto' : ''}
                onClick={() => setClickMode('pto')}
              >
                PTO day
              </button>
              <button
                type="button"
                className={clickMode === 'holiday' ? 'on holiday' : ''}
                onClick={() => setClickMode('holiday')}
              >
                Holiday
              </button>
            </div>
            <p className="hint">
              Choose what clicking a calendar day toggles. Holidays don't accrue
              PTO and don't deduct from your balance.
            </p>
          </section>

          <section className="card">
            <h3>Summary</h3>
            <ul className="summary">
              <li>
                <span>Per workday</span>
                <strong>{formatHours(accrualPerDay)}</strong>
              </li>
              <li>
                <span>Per year (approx)</span>
                <strong>
                  {formatHours(annualAccrual)} ·{' '}
                  {hoursToDays(annualAccrual, Number(hoursPerDay) || 1).toFixed(1)}d
                </strong>
              </li>
              <li>
                <span>PTO days planned</span>
                <strong>
                  {ptoDays.size} ({formatHours(ptoUsedHours)})
                </strong>
              </li>
              <li>
                <span>Holidays</span>
                <strong>{holidays.size}</strong>
              </li>
            </ul>
          </section>

          <section className="card">
            <h3>Planned PTO</h3>
            {sortedPto.length === 0 ? (
              <p className="muted">Click days on the calendar to plan PTO.</p>
            ) : (
              <ul className="pto-list">
                {sortedPto.map((key) => {
                  const info = balances.get(key)
                  return (
                    <li key={key}>
                      <span>{key}</span>
                      <span className="muted">
                        {info ? formatHours(info.balance) : ''}
                      </span>
                      <button className="link" onClick={() => removePto(key)}>
                        remove
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
            {sortedPto.length > 0 && (
              <button className="clear" onClick={() => setPtoDays(new Set())}>
                Clear all
              </button>
            )}
          </section>

          <section className="card">
            <h3>Holidays</h3>
            {sortedHolidays.length === 0 ? (
              <p className="muted">
                Switch click mode to "Holiday" and click days to mark them.
              </p>
            ) : (
              <ul className="pto-list">
                {sortedHolidays.map((key) => (
                  <li key={key}>
                    <span>{key}</span>
                    <span className="muted">no accrual</span>
                    <button className="link" onClick={() => removeHoliday(key)}>
                      remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {sortedHolidays.length > 0 && (
              <button className="clear" onClick={() => setHolidays(new Set())}>
                Clear all
              </button>
            )}
          </section>
        </aside>

        <main className="main">
          <Calendar
            viewDate={viewDate}
            onPrevMonth={goPrev}
            onNextMonth={goNext}
            onToday={goToday}
            balances={balances}
            ptoDays={ptoDays}
            holidays={holidays}
            toggleDay={toggleDay}
            startDate={startDate}
            hoursPerDay={Number(hoursPerDay) || 1}
            clickMode={clickMode}
          />
        </main>
      </div>
    </div>
  )
}
