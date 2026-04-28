'use client'

import { useState, useEffect } from 'react'
import {
  Memo,
  MemoFormData,
  MEMO_CATEGORIES,
  DEFAULT_CATEGORIES,
} from '@/types/memo'
import MarkdownViewer from '@/components/MarkdownViewer'

interface MemoFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: MemoFormData) => void | Promise<void>
  editingMemo?: Memo | null
}

export default function MemoForm({
  isOpen,
  onClose,
  onSubmit,
  editingMemo,
}: MemoFormProps) {
  const [formData, setFormData] = useState<MemoFormData>({
    title: '',
    content: '',
    category: 'personal',
    tags: [],
  })
  const [tagInput, setTagInput] = useState('')
  const [isPreview, setIsPreview] = useState(false)
  const [suggestedTags, setSuggestedTags] = useState<string[]>([])
  const [isGeneratingTags, setIsGeneratingTags] = useState(false)
  const [tagGenError, setTagGenError] = useState<string | null>(null)

  // 편집 모드일 때 폼 데이터 설정
  useEffect(() => {
    if (editingMemo) {
      setFormData({
        title: editingMemo.title,
        content: editingMemo.content,
        category: editingMemo.category,
        tags: editingMemo.tags,
      })
    } else {
      setFormData({
        title: '',
        content: '',
        category: 'personal',
        tags: [],
      })
    }
    setTagInput('')
    setIsPreview(false)
    setSuggestedTags([])
    setTagGenError(null)
    setIsGeneratingTags(false)
  }, [editingMemo, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.')
      return
    }
    await onSubmit(formData)
    onClose()
  }

  const handleAddTag = () => {
    const tag = tagInput.trim()
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }))
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleGenerateTags = async () => {
    if (isGeneratingTags) return
    setIsGeneratingTags(true)
    setSuggestedTags([])
    setTagGenError(null)

    try {
      const res = await fetch('/api/memos/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
        }),
      })
      const data: { tags?: string[]; error?: string } = await res.json()

      if (!res.ok || data.error) {
        setTagGenError(data.error ?? '태그 생성에 실패했습니다.')
      } else {
        setSuggestedTags(data.tags ?? [])
      }
    } catch {
      setTagGenError('네트워크 오류가 발생했습니다. 다시 시도해 주세요.')
    } finally {
      setIsGeneratingTags(false)
    }
  }

  const handleAddSuggestedTag = (tag: string) => {
    if (formData.tags.includes(tag)) return
    setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }))
  }

  const handleAddAllSuggestedTags = () => {
    const newTags = suggestedTags.filter(t => !formData.tags.includes(t))
    if (newTags.length === 0) return
    setFormData(prev => ({ ...prev, tags: [...prev.tags, ...newTags] }))
  }

  const canGenerateTags =
    formData.title.trim().length > 0 || formData.content.trim().length > 0

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="paper-texture-light rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{boxShadow: '0 20px 60px rgba(100, 80, 50, 0.25), 0 8px 20px rgba(100, 80, 50, 0.15)'}}>
        <div className="p-6">
          {/* 헤더 */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingMemo ? '메모 편집' : '새 메모 작성'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 제목 */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                제목 *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                className="placeholder-gray-400 text-gray-400 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="메모 제목을 입력하세요"
                required
              />
            </div>

            {/* 카테고리 */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                카테고리
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                className="text-gray-400 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                {DEFAULT_CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {MEMO_CATEGORIES[category]}
                  </option>
                ))}
              </select>
            </div>

            {/* 내용 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-gray-700"
                >
                  내용 *
                </label>
                <div className="flex rounded-lg border border-gray-300 overflow-hidden text-xs">
                  <button
                    type="button"
                    onClick={() => setIsPreview(false)}
                    className={`px-3 py-1 transition-colors ${
                      !isPreview
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    작성
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPreview(true)}
                    className={`px-3 py-1 transition-colors border-l border-gray-300 ${
                      isPreview
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    미리보기
                  </button>
                </div>
              </div>

              {isPreview ? (
                <div className="w-full min-h-[200px] px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 overflow-y-auto">
                  {formData.content.trim() ? (
                    <MarkdownViewer content={formData.content} />
                  ) : (
                    <p className="text-gray-400 text-sm">
                      마크다운 미리보기가 여기에 표시됩니다.
                    </p>
                  )}
                </div>
              ) : (
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  className="placeholder-gray-400 text-gray-700 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  placeholder={`메모 내용을 입력하세요\n마크다운 문법을 지원합니다. (예: **굵게**, *기울임*, # 제목, - 목록)`}
                  rows={8}
                  required={!isPreview}
                />
              )}
            </div>

            {/* 태그 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  태그
                </label>
                <button
                  type="button"
                  onClick={handleGenerateTags}
                  disabled={isGeneratingTags || !canGenerateTags}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg border border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="AI로 태그 자동 생성"
                >
                  {isGeneratingTags ? (
                    <>
                      <svg
                        className="w-3.5 h-3.5 animate-spin"
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
                      생성 중...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-3.5 h-3.5"
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
                      AI 태그 생성
                    </>
                  )}
                </button>
              </div>

              {/* AI 제안 태그 */}
              {tagGenError && (
                <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
                  {tagGenError}
                </div>
              )}
              {suggestedTags.length > 0 && (
                <div className="mb-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-purple-700">
                      AI 추천 태그 — 클릭하여 추가
                    </p>
                    <button
                      type="button"
                      onClick={handleAddAllSuggestedTags}
                      className="text-xs text-purple-600 hover:text-purple-800 underline underline-offset-2"
                    >
                      모두 추가
                    </button>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {suggestedTags.map((tag, index) => {
                      const alreadyAdded = formData.tags.includes(tag)
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleAddSuggestedTag(tag)}
                          disabled={alreadyAdded}
                          className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                            alreadyAdded
                              ? 'border-gray-300 text-gray-400 bg-gray-50 cursor-default'
                              : 'border-purple-300 text-purple-700 bg-white hover:bg-purple-100 cursor-pointer'
                          }`}
                          aria-label={
                            alreadyAdded
                              ? `${tag} — 이미 추가됨`
                              : `${tag} 태그 추가`
                          }
                        >
                          #{tag}
                          {alreadyAdded && (
                            <span className="ml-1 text-gray-400">✓</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  className="placeholder-gray-400 text-black flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="태그를 직접 입력하고 Enter를 누르세요"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  추가
                </button>
              </div>

              {/* 추가된 태그 목록 */}
              {formData.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-blue-600 hover:text-blue-800"
                        aria-label={`${tag} 태그 삭제`}
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 버튼 */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              >
                {editingMemo ? '수정하기' : '저장하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
