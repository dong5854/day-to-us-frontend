export interface SharedSpaceRequest {
  name: string
}

export interface SharedSpaceResponse {
  id: string
  name: string
  inviteCode: string
}

export interface JoinSharedSpaceRequest {
  inviteCode: string
}

export interface UserResponse {
  name: string
  email: string
}
