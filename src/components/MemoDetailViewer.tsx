'use client'

import { useState, useEffect, useCallback } from 'react'
import { Memo, MEMO_CATEGORIES } from '@/types/memo'
import MarkdownViewer from '@/components/MarkdownViewer'

interface MemoDetailViewerProps {
  memo: Memo | null
  isOpen: boolean
  onClose: () => void
  onEdit?: (memo: Memo) => void
}

interface SummaryResponse {
  summary?: string
  error?: string
}

export default function MemoDetailViewer({
  memo,
  isOpen,
  onClose,
  onEdit,
}: MemoDetailViewerProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [summaryError, setSummaryError] = useState<string | null>(null)
  const [isSummarizing, setIsSummarizing] = useState(false)

  useEffect(() => {
    setSummary(null)
    setSummaryError(null)
    setIsSummarizing(false)
  }, [memo?.id, isOpen])

  const handleSummarize = useCallback(async () => {
    if (!memo || isSummarizing) return

    setSummary(null)
    setSummaryError(null)
    setIsSummarizing(true)

    try {
      const res = await fetch('/api/memos/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: memo.title, content: memo.content }),
      })

      const data: SummaryResponse = await res.json()

      if (!res.ok || data.error) {
        setSummaryError(data.error ?? '요약에 실패했습니다. 다시 시도해 주세요.')
      } else {
        setSummary(data.summary ?? null)
      }
    } catch {
      setSummaryError('네트워크 오류가 발생했습니다. 다시 시도해 주세요.')
    } finally {
      setIsSummarizing(false)
    }
  }, [memo, isSummarizing])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      personal: 'bg-blue-100 text-blue-800',
      work: 'bg-green-100 text-green-800',
      study: 'bg-purple-100 text-purple-800',
      idea: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800',
    }
    return colors[category as keyof typeof colors] || colors.other
  }

  if (!isOpen || !memo) return null

  const tags = memo.tags ?? []

  const categoryLabel =
    MEMO_CATEGORIES[memo.category as keyof typeof MEMO_CATEGORIES] ||
    memo.category

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="paper-texture-light rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{
          boxShadow:
            '0 20px 60px rgba(100, 80, 50, 0.25), 0 8px 20px rgba(100, 80, 50, 0.15)',
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="memo-detail-title"
        data-testid="memo-detail-viewer"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          {/* 헤더 */}
          <div className="flex justify-between items-start gap-4 mb-6">
            <div className="flex-1 min-w-0">
              <h2
                id="memo-detail-title"
                className="text-xl font-semibold text-gray-900 break-words"
              >
                {memo.title}
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(memo.category)}`}
                >
                  {categoryLabel}
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-500 space-y-1">
                <p>생성: {formatDate(memo.createdAt)}</p>
                <p>수정: {formatDate(memo.updatedAt)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
              aria-label="닫기"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* AI 요약 영역 */}
          <div className="mb-5">
            <button
              type="button"
              onClick={handleSummarize}
              disabled={isSummarizing}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="AI로 메모 요약하기"
            >
              {isSummarizing ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  요약 중...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  AI 요약
                </>
              )}
            </button>

            {/* 요약 결과 */}
            {summary && (
              <div className="mt-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <svg
                    className="w-4 h-4 text-purple-600 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                    AI 요약 · Gemini
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {summary}
                </p>
              </div>
            )}

            {/* 에러 */}
            {summaryError && (
              <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-4 h-4 text-red-500 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm text-red-700">{summaryError}</p>
                    <button
                      type="button"
                      onClick={handleSummarize}
                      className="mt-2 text-xs text-red-600 hover:text-red-800 underline underline-offset-2"
                    >
                      다시 시도
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 본문 */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="sr-only">내용</h3>
            <MarkdownViewer content={memo.content} />
          </div>

          {/* 태그 */}
          {tags.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-3">태그</p>
              <div className="flex gap-2 flex-wrap">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              닫기
            </button>
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onEdit(memo)
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              >
                편집
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
