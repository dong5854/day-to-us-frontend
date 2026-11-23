import { useState } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { ConfirmModal } from './ConfirmModal'
import { Modal } from './Modal'

afterEach(cleanup)

it('중첩 확인 창에서 Escape로 취소하면 각 단계의 실행 버튼으로 복귀한다', () => {
  const confirm = vi.fn()
  function Example() {
    const [open, setOpen] = useState(false)
    const [confirming, setConfirming] = useState(false)
    return <>
      <button onClick={() => setOpen(true)}>가계부 추가</button>
      <Modal isOpen={open} label="가계부" onClose={() => setOpen(false)}>
        <button onClick={() => setConfirming(true)}>삭제 요청</button>
        <ConfirmModal isOpen={confirming} title="삭제 확인" message="삭제할까요?"
          onCancel={() => setConfirming(false)} onConfirm={confirm}/>
      </Modal>
    </>
  }
  render(<Example/>)
  const trigger = screen.getByText('가계부 추가')
  trigger.focus()
  fireEvent.click(trigger)
  const parent = screen.getByRole('dialog', { name: '가계부' })
  expect(parent.contains(document.activeElement)).toBe(true)
  const remove = screen.getByText('삭제 요청')
  remove.focus()
  fireEvent.click(remove)
  const child = screen.getByRole('dialog', { name: '삭제 확인' })
  fireEvent.keyDown(child, { key: 'Escape' })
  expect(child.isConnected).toBe(false)
  expect(document.activeElement).toBe(remove)
  expect(document.body.style.overflow).toBe('hidden')
  fireEvent.keyDown(remove, { key: 'Escape' })
  expect(parent.isConnected).toBe(false)
  expect(document.activeElement).toBe(trigger)
  expect(document.body.style.overflow).not.toBe('hidden')
  expect(confirm).not.toHaveBeenCalled()
})
