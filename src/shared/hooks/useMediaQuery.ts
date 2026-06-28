import { useEffect, useState } from 'react'

/**
 * 미디어 쿼리를 구독하는 훅.
 * window.innerWidth 직접 접근 대신 CSS 미디어 쿼리를 사용하여 리사이즈에도 반응.
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 767px)')
 */
export const useMediaQuery = (query: string): boolean => {
  const getMatches = (): boolean => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  }

  const [matches, setMatches] = useState<boolean>(getMatches)

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query)
    const handleChange = (e: MediaQueryListEvent) => setMatches(e.matches)

    mediaQueryList.addEventListener('change', handleChange)
    return () => mediaQueryList.removeEventListener('change', handleChange)
  })

  return matches
}
