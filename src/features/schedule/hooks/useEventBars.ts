import { useMemo } from 'react'
import type { ScheduleResponse } from '../types/schedule.types'

export interface EventBar {
  schedule: ScheduleResponse
  weekIndex: number
  startCol: number
  span: number
  rowOffset: number
}

interface UseEventBarsParams {
  schedules: ScheduleResponse[]
  year: number
  month: number          // 0-indexed (JS convention)
  daysInMonth: number
  startingDayOfWeek: number
  enabled: boolean       // false면 빈 배열 반환 (budget-only 필터 등)
}

export const useEventBars = ({
  schedules,
  year,
  month,
  daysInMonth,
  startingDayOfWeek,
  enabled,
}: UseEventBarsParams): EventBar[] => {
  return useMemo(() => {
    if (!enabled) return []

    const bars: EventBar[] = []
    const totalCells = startingDayOfWeek + daysInMonth
    const weeks = Math.ceil(totalCells / 7)

    schedules.forEach((schedule) => {
      const scheduleStart = new Date(schedule.startDateTime.split('T')[0])
      const scheduleEnd = new Date(schedule.endDateTime.split('T')[0])

      // 단일 날짜 일정은 이벤트바 없음
      const daysDiff = Math.ceil(
        (scheduleEnd.getTime() - scheduleStart.getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysDiff === 0) return

      for (let weekIdx = 0; weekIdx < weeks; weekIdx++) {
        const weekStartCell = weekIdx * 7
        const weekEndCell = Math.min(weekStartCell + 6, totalCells - 1)

        const weekStartDay = weekStartCell - startingDayOfWeek + 1
        const weekEndDay = weekEndCell - startingDayOfWeek + 1

        const weekStartDate = new Date(year, month, Math.max(1, weekStartDay))
        const weekEndDate = new Date(year, month, Math.min(daysInMonth, weekEndDay))

        if (scheduleEnd >= weekStartDate && scheduleStart <= weekEndDate) {
          let startCol = 1
          let span = 7

          if (scheduleStart >= weekStartDate) {
            const dayInMonth = scheduleStart.getDate()
            const cellIndex = dayInMonth - 1 + startingDayOfWeek
            startCol = (cellIndex % 7) + 1
          }

          if (scheduleEnd <= weekEndDate) {
            const dayInMonth = scheduleEnd.getDate()
            const cellIndex = dayInMonth - 1 + startingDayOfWeek
            const endCol = (cellIndex % 7) + 1
            span = endCol - startCol + 1
          } else {
            span = 8 - startCol
          }

          bars.push({ schedule, weekIndex: weekIdx, startCol, span, rowOffset: 0 })
        }
      }
    })

    // 겹치는 이벤트 rowOffset 계산
    const weekGroups: Record<number, EventBar[]> = {}
    bars.forEach((bar) => {
      if (!weekGroups[bar.weekIndex]) weekGroups[bar.weekIndex] = []
      weekGroups[bar.weekIndex].push(bar)
    })

    Object.values(weekGroups).forEach((weekBars) => {
      weekBars.sort((a, b) =>
        a.startCol !== b.startCol ? a.startCol - b.startCol : b.span - a.span
      )
      weekBars.forEach((bar, idx) => {
        bar.rowOffset = idx
      })
    })

    return bars
  }, [schedules, year, month, daysInMonth, startingDayOfWeek, enabled])
}
