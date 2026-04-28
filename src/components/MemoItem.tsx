'use client'

import type { KeyboardEvent } from 'react'

import { Memo, MEMO_CATEGORIES } from '@/types/memo'

interface MemoItemProps {
  memo: Memo
  onView: (memo: Memo) => void
  onEdit: (memo: Memo) => void
  onDelete: (id: string) => void
}

export default function MemoItem({
  memo,
  onView,
  onEdit,
  onDelete,
}: MemoItemProps) {
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

  const handleCardKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onView(memo)
    }
  }

  const tags = memo.tags ?? []

  return (
    <article
      className="paper-card rounded-lg p-6 transition-shadow duration-200"
      data-testid="memo-card"
    >
      <div className="flex justify-between items-start gap-3">
        <div
          className="flex-1 min-w-0 cursor-pointer rounded-md -m-1 p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          role="button"
          tabIndex={0}
          aria-label={`${memo.title} 메모 상세 보기`}
          onClick={() => onView(memo)}
          onKeyDown={handleCardKeyDown}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {memo.title}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(memo.category)}`}
            >
              {MEMO_CATEGORIES[memo.category as keyof typeof MEMO_CATEGORIES] ||
                memo.category}
            </span>
            <span className="text-xs text-gray-500">
              {formatDate(memo.updatedAt)}
            </span>
          </div>
          <div className="mt-3 mb-4">
            <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
              {memo.content}
            </p>
          </div>
          {tags.length > 0 && (
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
          )}
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(memo)}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="편집"
            aria-label={`${memo.title} 편집`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('정말로 이 메모를 삭제하시겠습니까?')) {
                onDelete(memo.id)
              }
            }}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="삭제"
            aria-label={`${memo.title} 삭제`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </article>
  )
}
