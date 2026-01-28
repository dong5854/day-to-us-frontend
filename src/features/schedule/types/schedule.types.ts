export interface ScheduleRequest {
  title: string
  description?: string
  startDateTime: string // ISO 8601 format
  endDateTime: string // ISO 8601 format
  isAllDay: boolean
}

export interface ScheduleResponse {
  id: string
  title: string
  description?: string
  startDateTime: string
  endDateTime: string
  isAllDay: boolean
  createdBy: number
}
