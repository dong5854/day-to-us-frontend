import { createContext, type RefObject } from 'react'

export const LayoutSlotsContext = createContext<{
  headerTarget: HTMLElement | null
  contentRef: RefObject<HTMLElement | null> | null
}>({ headerTarget: null, contentRef: null })
