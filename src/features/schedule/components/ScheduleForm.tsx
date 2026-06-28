import { useState, useEffect, type FC, type FormEvent } from 'react'
import { Calendar, Clock } from 'lucide-react'
import { toDateString, toTimeString } from '@/shared/utils/dateUtils'
import type { ScheduleRequest, ScheduleResponse } from '../types/schedule.types'

interface Props {
  schedule?: ScheduleResponse | null
  initialDate?: string | null
  onSubmit: (data: ScheduleRequest) => Promise<void>
  onCancel: () => void
}

export const ScheduleForm: FC<Props> = ({ schedule, initialDate, onSubmit, onCancel }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState(toDateString(new Date()))
  const [startTime, setStartTime] = useState('09:00')
  const [endDate, setEndDate] = useState(toDateString(new Date()))
  const [endTime, setEndTime] = useState('10:00')
  const [isAllDay, setIsAllDay] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dateError, setDateError] = useState<string | null>(null)

  useEffect(() => {
    if (schedule) {
      setTitle(schedule.title)
      setDescription(schedule.description || '')

      const start = new Date(schedule.startDateTime)
      setStartDate(toDateString(start))
      setStartTime(toTimeString(start))

      const end = new Date(schedule.endDateTime)
      setEndDate(toDateString(end))
      setEndTime(toTimeString(end))

      setIsAllDay(schedule.isAllDay)
    } else if (initialDate) {
      setStartDate(initialDate)
      setEndDate(initialDate)
    }
    setDateError(null)
  }, [schedule, initialDate])

  // 날짜/시간 변경 시 실시간 유효성 검사
  useEffect(() => {
    const startDateTime = isAllDay ? `${startDate}T00:00:00` : `${startDate}T${startTime}:00`
    const endDateTime = isAllDay ? `${endDate}T23:59:59` : `${endDate}T${endTime}:00`

    if (startDate && endDate && new Date(endDateTime) < new Date(startDateTime)) {
      setDateError(
        isAllDay
          ? '종료 날짜는 시작 날짜 이후여야 합니다.'
          : '종료 시간은 시작 시간 이후여야 합니다.'
      )
    } else {
      setDateError(null)
    }
  }, [startDate, startTime, endDate, endTime, isAllDay])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!title.trim()) return
    if (dateError) return

    setLoading(true)
    try {
      const startDateTime = isAllDay
        ? `${startDate}T00:00:00`
        : `${startDate}T${startTime}:00`

      const endDateTime = isAllDay
        ? `${endDate}T23:59:59`
        : `${endDate}T${endTime}:00`

      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        startDateTime,
        endDateTime,
        isAllDay,
      })

      // Reset form
      setTitle('')
      setDescription('')
      setStartDate(toDateString(new Date()))
      setStartTime('09:00')
      setEndDate(toDateString(new Date()))
      setEndTime('10:00')
      setIsAllDay(false)
      setDateError(null)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg">
      <h3 className="text-2xl font-bold text-gray-900 mb-8">
        {schedule ? '일정 수정' : '새 일정 추가'}
      </h3>

      <div className="mb-6">
        <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">
          제목
        </label>
        <input
          id="title"
          type="text"
          placeholder="예: 병원 예약, 여행"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-base text-gray-900 bg-white transition-colors placeholder:text-gray-400 focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
          설명 (선택)
        </label>
        <textarea
          id="description"
          placeholder="일정에 대한 추가 정보"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-base text-gray-900 bg-white transition-colors placeholder:text-gray-400 focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 resize-none"
        />
      </div>

      <div className="mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isAllDay}
            onChange={(e) => setIsAllDay(e.target.checked)}
            className="w-5 h-5 text-[#4F46E5] rounded focus:ring-[#4F46E5]"
          />
          <span className="text-sm font-semibold text-gray-900">종일</span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="startDate" className="block text-sm font-semibold text-gray-900 mb-2">
            시작 날짜
          </label>
          <div className="relative">
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-base text-gray-900 bg-white transition-colors focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 appearance-none pr-10"
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
        {!isAllDay && (
          <div>
            <label htmlFor="startTime" className="block text-sm font-semibold text-gray-900 mb-2">
              시작 시간
            </label>
            <div className="relative">
              <input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-base text-gray-900 bg-white transition-colors focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 appearance-none pr-10"
              />
              <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
        <div>
          <label htmlFor="endDate" className="block text-sm font-semibold text-gray-900 mb-2">
            종료 날짜
          </label>
          <div className="relative">
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className={`w-full px-4 py-3 border rounded-lg text-base text-gray-900 bg-white transition-colors focus:outline-none focus:ring-4 appearance-none pr-10 ${
                dateError
                  ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10'
                  : 'border-gray-200 focus:border-[#4F46E5] focus:ring-[#4F46E5]/10'
              }`}
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
        {!isAllDay && (
          <div>
            <label htmlFor="endTime" className="block text-sm font-semibold text-gray-900 mb-2">
              종료 시간
            </label>
            <div className="relative">
              <input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className={`w-full px-4 py-3 border rounded-lg text-base text-gray-900 bg-white transition-colors focus:outline-none focus:ring-4 appearance-none pr-10 ${
                  dateError
                    ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10'
                    : 'border-gray-200 focus:border-[#4F46E5] focus:ring-[#4F46E5]/10'
                }`}
              />
              <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* Date/Time validation error */}
      {dateError && (
        <p className="text-sm text-red-500 mb-6 flex items-center gap-1">
          <span>⚠</span> {dateError}
        </p>
      )}
      {!dateError && <div className="mb-8" />}

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-3 rounded-lg font-semibold text-base transition-all border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={loading || !!dateError}
          className="px-6 py-3 rounded-lg font-semibold text-base gradient-bg text-white transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? '처리 중...' : schedule ? '수정' : '추가'}
        </button>
      </div>
    </form>
  )
}
