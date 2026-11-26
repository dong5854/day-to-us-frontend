import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { InlineOptionInput } from './InlineOptionInput'

it('한글 조합 중에는 추가하지 않고, 실패한 이름으로 다시 시도할 수 있다', async () => {
  const create = vi.fn().mockRejectedValueOnce(new Error()).mockResolvedValueOnce({ id: 'food' })
  const created = vi.fn()
  const submit = vi.fn()
  render(
    <form onSubmit={submit}>
      <InlineOptionInput placeholder="새 이름" defaultError="추가 실패" onCreate={create} onCreated={created} onCancel={vi.fn()} />
      <button type="submit">저장</button>
    </form>,
  )
  const input = screen.getByRole('textbox', { name: '새 이름' }) as HTMLInputElement
  fireEvent.change(input, { target: { value: '식비' } })
  expect(fireEvent.keyDown(input, { key: 'Enter', isComposing: true })).toBe(false)
  expect(create).not.toHaveBeenCalled()

  expect(fireEvent.keyDown(input, { key: 'Enter' })).toBe(false)
  fireEvent.keyDown(input, { key: 'Enter' })
  expect(create).toHaveBeenCalledTimes(1)
  expect((await screen.findByRole('alert')).textContent).toBe('추가 실패')
  expect(input.value).toBe('식비')

  fireEvent.click(screen.getByRole('button', { name: '추가' }))
  await waitFor(() => expect(created).toHaveBeenCalledWith('food'))
  expect(create).toHaveBeenCalledTimes(2)
  expect(create).toHaveBeenLastCalledWith('식비')
  expect(submit).not.toHaveBeenCalled()
})
