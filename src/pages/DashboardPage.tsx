import type { FC } from 'react'
import { SpaceDashboard } from '@/features/space/components/SpaceDashboard'
import type { SharedSpaceResponse, UserResponse } from '@/features/space/types/space.types'

interface Props {
  space: SharedSpaceResponse | null
  members: UserResponse[]
  onNavigate: (module: 'budget') => void
}

export const DashboardPage: FC<Props> = ({ space, members, onNavigate }) => {
  return <SpaceDashboard space={space} members={members} onNavigate={onNavigate} />
}
