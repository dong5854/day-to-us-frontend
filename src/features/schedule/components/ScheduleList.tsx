import type { FC } from 'react'
import type { ScheduleResponse } from '../types/schedule.types'

interface Props {
  schedules: ScheduleResponse[]
  loading: boolean
  onEdit: (schedule: ScheduleResponse) => void
  onDelete: (scheduleId: string) => void
}

export const ScheduleList: FC<Props> = ({ schedules, loading, onEdit, onDelete }) => {
  if (loading) {
    return <div className="text-center py-16 text-gray-500">로딩 중...</div>
  }

  if (schedules.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg shadow-sm">
        <div className="text-6xl mb-4">📅</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">아직 일정이 없습니다</h3>
        <p className="text-gray-500">첫 번째 일정을 추가해보세요!</p>
      </div>
    )
  }

  const formatDateTime = (dateTimeStr: string, isAllDay: boolean) => {
    const date = new Date(dateTimeStr)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = date.getHours()
    const minutes = date.getMinutes()

    if (isAllDay) {
      return `${year}년 ${month}월 ${day}일`
    }

    return `${year}년 ${month}월 ${day}일 ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }

  // Group by date
  const groupedSchedules = schedules.reduce((groups, schedule) => {
    const date = schedule.startDateTime.split('T')[0]
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(schedule)
    return groups
  }, {} as Record<string, ScheduleResponse[]>)

  const sortedDates = Object.keys(groupedSchedules).sort((a, b) => a.localeCompare(b))

  return (
    <div className="flex flex-col gap-6">
      {sortedDates.map((date) => (
        <div key={date}>
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-lg font-bold text-gray-900">
              {new Date(date).toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'short'
              })}
            </h3>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <div className="flex flex-col gap-3">
            {groupedSchedules[date].map((schedule) => (
              <div
                key={schedule.id}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {schedule.isAllDay && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                          종일
                        </span>
                      )}
                      <h4 className="text-lg font-bold text-gray-900">{schedule.title}</h4>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      {formatDateTime(schedule.startDateTime, schedule.isAllDay)} ~ {formatDateTime(schedule.endDateTime, schedule.isAllDay)}
                    </div>

                    {schedule.description && (
                      <p className="text-sm text-gray-500 mt-2">{schedule.description}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(schedule)}
                      className="px-3 py-1.5 text-sm font-medium text-[#667eea] hover:bg-gray-50 rounded transition-colors"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => onDelete(schedule.id)}
                      className="px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
