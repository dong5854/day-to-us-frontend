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
  expect(action.style.opacity).toBe('1')
  fireEvent.touchCancel(card)
  expect(card.style.transform).toBe('translateX(0px)')
  expect(action.style.opacity).toBe('0')
  fireEvent.touchStart(card, { touches: [{ clientX: 200, clientY: 100 }] })
  fireEvent.touchMove(card, { touches: [{ clientX: 180, clientY: 100 }] })
  expect(action.style.opacity).toBe('0.5')
  fireEvent.touchMove(card, { touches: [{ clientX: 200, clientY: 100 }] })
  expect(action.style.visibility).toBe('hidden')
})

it.each(['touch', 'mouse'])('%s로 끝까지 당기면 저항을 두고 늘어나며 놓으면 열린 위치로 복귀한다', mode => {
  const onDelete = vi.fn()
  render(<SwipeableCard onDelete={onDelete}><p>탄성 항목</p></SwipeableCard>)
  const card = screen.getByText('탄성 항목').parentElement!
  const action = screen.getByText('삭제').parentElement!.parentElement!
  const move = (clientX: number) => mode === 'touch'
    ? fireEvent.touchMove(card, { touches: [{ clientX, clientY: 100 }] })
    : fireEvent.mouseMove(card, { clientX })
  if (mode === 'touch') fireEvent.touchStart(card, { touches: [{ clientX: 300, clientY: 100 }] })
  else fireEvent.mouseDown(card, { clientX: 300 })
  move(220)
  expect(card.style.transform).toBe('translateX(-80px)')
  move(140)
  expect(card.style.transform).toBe('translateX(-92px)')
  expect(action.style.width).toBe('92px')
  move(-10000)
  expect(parseFloat(action.style.width)).toBeLessThan(104)
  expect(onDelete).not.toHaveBeenCalled()
  if (mode === 'touch') fireEvent.touchEnd(card, { changedTouches: [{ clientX: -10000, clientY: 100 }] })
  else fireEvent.mouseUp(card)
  expect(card.style.transform).toBe('translateX(-80px)')
  expect(action.style.width).toBe('80px')
  expect(card.style.transition).toContain('280ms')
  expect(onDelete).not.toHaveBeenCalled()
})
