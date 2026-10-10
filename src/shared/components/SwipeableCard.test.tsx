import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { SwipeableCard } from './SwipeableCard'

afterEach(cleanup)

it('닫힌 카드에서는 삭제 배경을 숨기고 드래그할 때만 드러낸다', () => {
  const onDelete = vi.fn()
  render(<SwipeableCard onDelete={onDelete}><p>항목</p></SwipeableCard>)
  const card = screen.getByText('항목').parentElement!
  const action = screen.getByText('삭제').parentElement!.parentElement!
  expect(action.style.visibility).toBe('hidden')
  expect(screen.queryByRole('button', { name: '삭제' })).toBeNull()
  fireEvent.mouseDown(card, { clientX: 200 })
  fireEvent.mouseMove(card, { clientX: 140 })
  expect(action.style.visibility).toBe('visible')
  fireEvent.mouseMove(card, { clientX: 200 })
  expect(action.style.visibility).toBe('hidden')
  fireEvent.mouseMove(card, { clientX: 120 })
  fireEvent.click(screen.getByRole('button', { name: '삭제' }))
  expect(onDelete).toHaveBeenCalledOnce()
  expect(action.style.visibility).toBe('hidden')
})

it('터치 스와이프에서도 삭제 배경을 드러내고 원위치에서 숨긴다', () => {
  render(<SwipeableCard><p>항목</p></SwipeableCard>)
  const card = screen.getByText('항목').parentElement!
  const action = screen.getByText('삭제').parentElement!.parentElement!
  fireEvent.touchStart(card, { touches: [{ clientX: 200, clientY: 100 }] })
  fireEvent.touchMove(card, { touches: [{ clientX: 140, clientY: 100 }] })
  expect(action.style.visibility).toBe('visible')
  fireEvent.touchMove(card, { touches: [{ clientX: 200, clientY: 100 }] })
  expect(action.style.visibility).toBe('hidden')
})
