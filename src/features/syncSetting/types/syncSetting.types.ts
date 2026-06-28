export type SyncDirection = 'BIDIRECTIONAL' | 'APP_TO_GOOGLE' | 'GOOGLE_TO_APP'

export interface SyncSettingRequest {
  syncEnabled: boolean
  syncDirection: SyncDirection
  googleCalendarId: string
}

export interface SyncSettingResponse {
  syncEnabled: boolean
  syncDirection: SyncDirection
  googleCalendarId: string
}

export interface GoogleCalendarListEntry {
  id: string
  summary: string
  primary: boolean
}
