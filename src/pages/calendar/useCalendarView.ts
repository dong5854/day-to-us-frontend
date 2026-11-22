import { useState } from 'react'
import type { CalendarView } from './CalendarViewTabs'

const preferenceKey = 'daytous.defaultCalendarView'

function readDefaultView(): CalendarView {
  try {
    return localStorage.getItem(preferenceKey) === 'list' ? 'list' : 'calendar'
  } catch {
    return 'calendar'
  }
}

export function useCalendarView() {
  const [defaultView, setDefaultView] = useState(readDefaultView)
  const [view, setView] = useState(defaultView)

  function saveDefaultView(next: CalendarView) {
    localStorage.setItem(preferenceKey, next)
    setDefaultView(next)
    setView(next)
  }

  return { view, setView, defaultView, saveDefaultView }
}
