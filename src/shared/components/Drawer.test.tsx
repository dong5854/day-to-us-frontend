import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { Drawer } from './Drawer'

afterEach(() => { cleanup(); document.body.style.overflow = ''; vi.restoreAllMocks() })

function setup() {
  const onClose = vi.fn()
  const view = render(<Drawer isOpen onClose={onClose}><p>긴 목록</p></Drawer>)
  const panel = screen.getByRole('dialog')
  const handle = panel.querySelector('.cursor-grab')!
  Object.defineProperty(handle, 'setPointerCapture', { value: vi.fn() })
  const point = (clientY: number) => ({ pointerId: 1, isPrimary: true, button: 0, clientY })
  return { ...view, onClose, panel, handle, point }
}

it('상단 바를 아래로 끌면 패널이 따라 움직이고 충분히 내리면 닫힌다', () => {
  const { handle, panel, point, onClose } = setup()
  fireEvent.pointerDown(handle, point(100))
  fireEvent.pointerMove(handle, point(180))
  expect(panel.style.transform).toBe('translateY(80px)')
  fireEvent.pointerUp(handle, point(180))
  expect(onClose).toHaveBeenCalledOnce()
})

it('짧은 드래그와 취소는 원위치로 돌아가고 목록에서 시작한 제스처는 닫지 않는다', () => {
  const { handle, panel, point, onClose } = setup()
  fireEvent.pointerDown(handle, point(100))
  fireEvent.pointerMove(handle, point(120))
  fireEvent.pointerUp(handle, point(120))
  expect(panel.style.transform).toBe('')
  fireEvent.pointerDown(handle, point(100))
  fireEvent.pointerMove(handle, point(200))
  fireEvent.pointerCancel(handle, point(200))
  expect(panel.style.transform).toBe('')
  fireEvent.pointerDown(screen.getByText('긴 목록'), point(100))
  fireEvent.pointerMove(screen.getByText('긴 목록'), point(200))
  fireEvent.pointerUp(screen.getByText('긴 목록'), point(200))
  expect(onClose).not.toHaveBeenCalled()
})

it('닫기 버튼이 동작하고 배경 스크롤 설정을 복원한다', () => {
  document.body.style.overflow = 'auto'
  const { onClose, unmount } = setup()
  expect(document.body.style.overflow).toBe('hidden')
  fireEvent.click(screen.getByRole('button', { name: '닫기' }))
  expect(onClose).toHaveBeenCalledOnce()
  unmount()
  expect(document.body.style.overflow).toBe('auto')
})
