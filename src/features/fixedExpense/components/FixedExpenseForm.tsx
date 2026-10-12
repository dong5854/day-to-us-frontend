import { ModalHeader } from '@/shared/components/ModalHeader'
import { useState, useEffect, type FC, type FormEvent } from 'react'
import type { FixedExpenseRequest, FixedExpenseResponse, Frequency, RecurringPreview } from '../types/fixedExpense.types'
import { useRecurringPreview } from '../hooks/useRecurringPreview'
import type { ExpenseCategoryResponse } from '@/features/budget/types/expenseCategory.types'
import type { PaymentMethodResponse } from '@/features/budget/types/paymentMethod.types'
import { Select } from '@/shared/components/Select'
import { DatePicker } from '@/shared/components/DatePicker'
import { toDateString } from '@/shared/utils/dateUtils'
import { formatKoreanWon } from '@/shared/utils/format'

interface Props {
  spaceId?: string
  expense?: FixedExpenseResponse | null
  categories?: ExpenseCategoryResponse[]
  paymentMethods?: PaymentMethodResponse[]
  onCreateCategory?: (name: string) => Promise<ExpenseCategoryResponse | undefined>
  onCreatePaymentMethod?: (name: string) => Promise<PaymentMethodResponse | undefined>
  onDeleteCategory?: (id: string) => Promise<void>
  onDeletePaymentMethod?: (id: string) => Promise<void>
  onSubmit: (data: FixedExpenseRequest) => Promise<void>
  onCancel: () => void
}

export const FixedExpenseForm: FC<Props> = ({
  spaceId,
  expense,
  categories = [],
  paymentMethods = [],
  onCreateCategory,
  onCreatePaymentMethod,
  onDeleteCategory,
  onDeletePaymentMethod,
  onSubmit,
  onCancel
}) => {
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [frequency, setFrequency] = useState<Frequency>('MONTHLY')
  const [startDate, setStartDate] = useState(toDateString(new Date()))
  const [autoPostFrom, setAutoPostFrom] = useState(toDateString(new Date()))
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [pending, setPending] = useState<{ data: FixedExpenseRequest; preview: RecurringPreview } | null>(null)
  const preview = useRecurringPreview(spaceId)

  // Category state
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [categoryError, setCategoryError] = useState('')

  // Payment method state
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>('')
  const [isAddingPaymentMethod, setIsAddingPaymentMethod] = useState(false)
  const [newPaymentMethodName, setNewPaymentMethodName] = useState('')
  const [paymentMethodError, setPaymentMethodError] = useState('')

  // Submitting states for duplicate prevention
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false)
  const [isSubmittingPaymentMethod, setIsSubmittingPaymentMethod] = useState(false)

  const isEditing = !!expense

  useEffect(() => {
    if (expense) {
      setType(expense.type ?? 'EXPENSE')
      setDescription(expense.description)
      setAmount(String(expense.amount))
      setFrequency(expense.frequency)
      setStartDate(expense.startDate)
      setAutoPostFrom(expense.autoPostFrom ?? '2026-06-01')
      setSelectedCategoryId(expense.categoryId ?? '')
      setSelectedPaymentMethodId(expense.paymentMethodId ?? '')
    } else {
      setType('EXPENSE')
      setDescription('')
      setAmount('')
      setFrequency('MONTHLY')
      setStartDate(toDateString(new Date()))
      setAutoPostFrom(toDateString(new Date()))
      setSelectedCategoryId('')
      setSelectedPaymentMethodId('')
    }
  }, [expense])

  const handleCategorySelectChange = (value: string) => {
    if (value === '__add_new__') {
      setIsAddingCategory(true)
      setSelectedCategoryId('')
      setCategoryError('')
    } else {
      setSelectedCategoryId(value)
      setIsAddingCategory(false)
      setCategoryError('')
    }
  }

  const handleConfirmNewCategory = async () => {
    if (!newCategoryName.trim() || !onCreateCategory || isSubmittingCategory) return
    try {
      setIsSubmittingCategory(true)
      setCategoryError('')
      const created = await onCreateCategory(newCategoryName.trim())
      if (created) {
        setSelectedCategoryId(created.id)
      }
      setNewCategoryName('')
      setIsAddingCategory(false)
    } catch (err: any) {
      setCategoryError(err.response?.data?.message || '이미 존재하는 카테고리이거나 추가에 실패했습니다.')
    } finally {
      setIsSubmittingCategory(false)
    }
  }

  const handlePaymentMethodSelectChange = (value: string) => {
    if (value === '__add_new__') {
      setIsAddingPaymentMethod(true)
      setSelectedPaymentMethodId('')
      setPaymentMethodError('')
    } else {
      setSelectedPaymentMethodId(value)
      setIsAddingPaymentMethod(false)
      setPaymentMethodError('')
    }
  }

  const handleConfirmNewPaymentMethod = async () => {
    if (!newPaymentMethodName.trim() || !onCreatePaymentMethod || isSubmittingPaymentMethod) return
    try {
      setIsSubmittingPaymentMethod(true)
      setPaymentMethodError('')
      const created = await onCreatePaymentMethod(newPaymentMethodName.trim())
      if (created) {
        setSelectedPaymentMethodId(created.id)
      }
      setNewPaymentMethodName('')
      setIsAddingPaymentMethod(false)
    } catch (err: any) {
      setPaymentMethodError(err.response?.data?.message || '이미 존재하는 결제 수단이거나 추가에 실패했습니다.')
    } finally {
      setIsSubmittingPaymentMethod(false)
    }
  }

  const save = async (data: FixedExpenseRequest) => {
    setSubmitError('')
    setLoading(true)
    try {
      await onSubmit(data)
      if (!isEditing) {
        setDescription('')
        setAmount('')
        setFrequency('MONTHLY')
        setStartDate(toDateString(new Date()))
        setAutoPostFrom(toDateString(new Date()))
        setSelectedCategoryId('')
        setSelectedPaymentMethodId('')
      }
    } catch (error) {
      setPending(null)
      setSubmitError('저장하지 못했습니다. 변경 내용을 다시 확인한 후 저장해 주세요.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (loading || preview.loading || !description.trim() || !amount) return
    const data: FixedExpenseRequest = {
      type, description: description.trim(), amount: parseFloat(amount), frequency,
      startDate, autoPostFrom, categoryId: selectedCategoryId || undefined,
      paymentMethodId: selectedPaymentMethodId || undefined,
    }
    setSubmitError('')
    if (expense && (startDate !== expense.startDate || frequency !== expense.frequency)) {
      try {
        setPending({ data, preview: await preview.preview(expense.id, data) })
      } catch { /* The preview hook displays the error. */ }
      return
    }
    await save(data)
  }

  if (pending) return (
    <div role="alertdialog" aria-labelledby="recurring-preview-title" className="flex min-h-0 flex-col bg-white rounded-lg">
      <ModalHeader onClose={onCancel} titleId="recurring-preview-title">예정일 변경 확인</ModalHeader>
      <div className="min-h-0 overflow-y-auto overscroll-contain px-6 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <p className="font-semibold text-gray-900 mb-3">
        {pending.preview.added}건 추가 / {pending.preview.deleted}건 삭제 / {pending.preview.preserved}건 보존
      </p>
      <p className="text-sm text-gray-600 mb-6">
        자동 반영 시작일 이후의 예정 회차를 다시 계산합니다.
        직접 수정하거나 삭제한 기록과 수정 이력이 없는 이전 내역은 보존합니다.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" disabled={loading} onClick={() => setPending(null)} className="min-h-11 rounded-lg bg-gray-100 text-gray-700 disabled:opacity-50">돌아가기</button>
        <button type="button" disabled={loading} onClick={() => save({ ...pending.data, reconciliationToken: pending.preview.token })}
          className="min-h-11 rounded-lg gradient-bg text-white disabled:opacity-50">{loading ? '반영 중...' : '확인 후 저장'}</button>
      </div>
      </div>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-col bg-white rounded-lg">
      <ModalHeader onClose={onCancel}>
        {`고정${type === 'INCOME' ? '수입' : '지출'} ${isEditing ? '수정' : '등록'}`}
      </ModalHeader>
      <div className="min-h-0 overflow-y-auto overscroll-contain px-6 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      {(submitError || preview.error) && <p role="alert" className="mb-4 text-sm text-red-600">{submitError || preview.error}</p>}

      <div className="space-y-4 mb-6">
        <div>
          <label htmlFor="fixed-type" className="block text-sm font-semibold text-gray-900 mb-2">유형</label>
          <Select id="fixed-type" value={type} onChange={value => setType(value as 'INCOME' | 'EXPENSE')}
            options={[{ value: 'INCOME', label: '고정수입' }, { value: 'EXPENSE', label: '고정지출' }]} />
        </div>
        {/* Category selector */}
        {(categories.length > 0 || onCreateCategory) && (
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">카테고리</label>
            {isAddingCategory ? (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="새 카테고리 이름"
                    value={newCategoryName}
                    onChange={(e) => {
                      setNewCategoryName(e.target.value)
                      if (categoryError) setCategoryError('')
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        if (e.nativeEvent.isComposing) return
                        handleConfirmNewCategory()
                      }
                    }}
                    className={`flex-1 min-w-0 px-4 py-3 border rounded-lg text-base text-gray-900 bg-white transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-4 ${categoryError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : 'border-gray-200 focus:border-[#4F46E5] focus:ring-[#4F46E5]/10'}`}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleConfirmNewCategory}
                    disabled={isSubmittingCategory}
                    className="shrink-0 px-3 py-3 rounded-lg font-semibold transition-all border-2 border-[#4F46E5] gradient-bg text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingCategory ? '추가 중...' : '추가'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsAddingCategory(false); setNewCategoryName(''); setCategoryError('') }}
                    disabled={isSubmittingCategory}
                    className="shrink-0 px-3 py-3 rounded-lg font-semibold transition-all border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    취소
                  </button>
                </div>
                {categoryError && (
                  <p className="text-sm text-red-500">{categoryError}</p>
                )}
              </div>
            ) : (
              <Select
                value={selectedCategoryId}
                onChange={handleCategorySelectChange}
                options={[
                  { value: '', label: '카테고리 없음' },
                  ...categories.map((cat) => ({
                    value: cat.id,
                    label: cat.name,
                    onDelete: onDeleteCategory
                      ? async () => {
                          await onDeleteCategory(cat.id)
                          if (selectedCategoryId === cat.id) setSelectedCategoryId('')
                        }
                      : undefined,
                  })),
                  ...(onCreateCategory ? [{ value: '__add_new__', label: '+ 새로 추가', isSpecial: true }] : []),
                ]}
              />
            )}
          </div>
        )}

        {/* Payment method selector */}
        {(paymentMethods.length > 0 || onCreatePaymentMethod) && (
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">결제 수단</label>
            {isAddingPaymentMethod ? (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="새 결제 수단 이름"
                    value={newPaymentMethodName}
                    onChange={(e) => {
                      setNewPaymentMethodName(e.target.value)
                      if (paymentMethodError) setPaymentMethodError('')
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        if (e.nativeEvent.isComposing) return
                        handleConfirmNewPaymentMethod()
                      }
                    }}
                    className={`flex-1 min-w-0 px-4 py-3 border rounded-lg text-base text-gray-900 bg-white transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-4 ${paymentMethodError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : 'border-gray-200 focus:border-[#4F46E5] focus:ring-[#4F46E5]/10'}`}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleConfirmNewPaymentMethod}
                    disabled={isSubmittingPaymentMethod}
                    className="shrink-0 px-3 py-3 rounded-lg font-semibold transition-all border-2 border-[#4F46E5] gradient-bg text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingPaymentMethod ? '추가 중...' : '추가'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsAddingPaymentMethod(false); setNewPaymentMethodName(''); setPaymentMethodError('') }}
                    disabled={isSubmittingPaymentMethod}
                    className="shrink-0 px-3 py-3 rounded-lg font-semibold transition-all border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    취소
                  </button>
                </div>
                {paymentMethodError && (
                  <p className="text-sm text-red-500">{paymentMethodError}</p>
                )}
              </div>
            ) : (
              <Select
                value={selectedPaymentMethodId}
                onChange={handlePaymentMethodSelectChange}
                options={[
                  { value: '', label: '결제 수단 없음' },
                  ...paymentMethods.map((pm) => ({
                    value: pm.id,
                    label: pm.name,
                    onDelete: onDeletePaymentMethod
                      ? async () => {
                          await onDeletePaymentMethod(pm.id)
                          if (selectedPaymentMethodId === pm.id) setSelectedPaymentMethodId('')
                        }
                      : undefined,
                  })),
                  ...(onCreatePaymentMethod ? [{ value: '__add_new__', label: '+ 새로 추가', isSpecial: true }] : []),
                ]}
              />
            )}
          </div>
        )}

        {/* 설명 */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
            항목명
          </label>
          <input
            id="description"
            type="text"
            placeholder="예: 넷플릭스 구독료"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            autoFocus
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10"
          />
        </div>

        {/* 금액 */}
        <div>
          <label htmlFor="amount" className="block text-sm font-semibold text-gray-900 mb-2">
            금액 (원)
          </label>
          <input
            id="amount"
            type="number"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="0"
            step="1"
            aria-describedby="fixed-amount-readable"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10"
          />
          <p id="fixed-amount-readable" aria-live="polite" className="mt-2 min-h-5 text-right text-sm text-gray-500">
            {formatKoreanWon(Number(amount))}
          </p>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {[
              { value: 1000, label: '+1천' },
              { value: 10000, label: '+1만' },
              { value: 50000, label: '+5만' },
              { value: 100000, label: '+10만' },
            ].map(({ value, label }) => (
              <button
                key={value}
                type="button"
                aria-label={`${value.toLocaleString('ko-KR')}원 더하기`}
                disabled={loading}
                onClick={() => setAmount(current => {
                  const next = Math.max(0, Number(current) || 0) + value
                  return Number.isSafeInteger(next) ? String(next) : current
                })}
                className="min-h-11 rounded-full bg-gray-100 px-1 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 active:bg-gray-300 disabled:opacity-60"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 주기 */}
        <div>
          <label htmlFor="frequency" className="block text-sm font-semibold text-gray-900 mb-2">
            결제 주기
          </label>
          <Select
            id="frequency"
            value={frequency}
            onChange={(v) => setFrequency(v as Frequency)}
            options={[
              { value: 'WEEKLY', label: '매주' },
              { value: 'MONTHLY', label: '매월' },
              { value: 'YEARLY', label: '매년' },
            ]}
          />
        </div>

        {/* 시작일 */}
        <div>
          <label htmlFor="startDate" className="block text-sm font-semibold text-gray-900 mb-2">
            {type === 'INCOME' ? '첫 입금 예정일' : '결제 시작일 (첫 결제일)'}
          </label>
          <DatePicker
            id="startDate"
            value={startDate}
            onChange={setStartDate}
            required
          />
        </div>
        {!isEditing && <div>
          <label htmlFor="autoPostFrom" className="block text-sm font-semibold text-gray-900 mb-2">
            자동 반영 시작일
          </label>
          <DatePicker id="autoPostFrom" value={autoPostFrom} onChange={setAutoPostFrom} required />
          <p className="mt-2 text-xs text-gray-500">
            이 날짜 이후의 예정 회차부터 내역에 반영합니다.
          </p>
        </div>}
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={loading || preview.loading || !description.trim() || !amount}
          className="px-5 py-2.5 rounded-lg font-medium text-white gradient-bg shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
        >
          {preview.loading ? '변경 내용 확인 중...' : loading ? (isEditing ? '수정 중...' : '등록 중...') : (isEditing ? '수정하기' : '등록하기')}
        </button>
      </div>
      </div>
    </form>
  )
}
