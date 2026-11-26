import { isAxiosError } from 'axios'
import { useState } from 'react'

interface Props {
  placeholder: string
  defaultError: string
  onCreate: (name: string) => Promise<{ id: string } | undefined>
  onCreated: (id: string) => void
  onCancel: () => void
}

export function InlineOptionInput({ placeholder, defaultError, onCreate, onCreated, onCancel }: Props) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const add = async () => {
    if (!name.trim() || pending) return
    setPending(true)
    setError('')
    try {
      const created = await onCreate(name.trim())
      if (created) onCreated(created.id)
      else setError(defaultError)
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : undefined
      setError(typeof message === 'string' ? message : defaultError)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          autoFocus
          aria-label={placeholder}
          placeholder={placeholder}
          value={name}
          onChange={e => { setName(e.target.value); setError('') }}
          onKeyDown={e => {
            if (e.nativeEvent.isComposing) {
              if (e.key === 'Enter') e.preventDefault()
              return
            }
            if (e.key === 'Enter') {
              e.preventDefault()
              void add()
            }
          }}
          className={`flex-1 min-w-0 px-4 py-3 border rounded-lg text-base text-gray-900 bg-white transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-4 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : 'border-gray-200 focus:border-[#4F46E5] focus:ring-[#4F46E5]/10'}`}
        />
        <button type="button" onClick={add} disabled={pending}
          className="shrink-0 px-3 py-3 rounded-lg font-semibold transition-all border-2 border-[#4F46E5] gradient-bg text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed">
          {pending ? '추가 중...' : '추가'}
        </button>
        <button type="button" onClick={onCancel} disabled={pending}
          className="shrink-0 px-3 py-3 rounded-lg font-semibold transition-all border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
          취소
        </button>
      </div>
      {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
