'use client'

import { useCallback, useState } from 'react'
import { useMemos } from '@/hooks/useMemos'
import { Memo, MemoFormData } from '@/types/memo'
import MemoList from '@/components/MemoList'
import MemoForm from '@/components/MemoForm'
import MemoDetailViewer from '@/components/MemoDetailViewer'

export default function Home() {
  const {
    memos,
    loading,
    searchQuery,
    selectedCategory,
    stats,
    createMemo,
    updateMemo,
    deleteMemo,
    searchMemos,
    filterByCategory,
  } = useMemos()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingMemo, setEditingMemo] = useState<Memo | null>(null)
  const [viewingMemo, setViewingMemo] = useState<Memo | null>(null)

  const handleCreateMemo = async (formData: MemoFormData) => {
    await createMemo(formData)
    setIsFormOpen(false)
  }

  const handleUpdateMemo = async (formData: MemoFormData) => {
    if (editingMemo) {
      await updateMemo(editingMemo.id, formData)
      setEditingMemo(null)
    }
  }

  const handleEditMemo = useCallback((memo: Memo) => {
    setViewingMemo(null)
    setEditingMemo(memo)
    setIsFormOpen(true)
  }, [])

  const handleViewMemo = useCallback((memo: Memo) => {
    setViewingMemo(memo)
  }, [])

  const handleCloseViewer = useCallback(() => {
    setViewingMemo(null)
  }, [])

  const handleViewerEdit = handleEditMemo

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingMemo(null)
  }

  const handleDeleteMemoWithViewer = useCallback(
    (id: string) => {
      deleteMemo(id)
      setViewingMemo(prev => (prev?.id === id ? null : prev))
    },
    [deleteMemo],
  )

  return (
    <div className="min-h-screen paper-texture">
      {/* 헤더 */}
      <header className="paper-texture-light border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">📝 메모 앱</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  setViewingMemo(null)
                  setEditingMemo(null)
                  setIsFormOpen(true)
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                새 메모
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MemoList
          memos={memos}
          loading={loading}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          onSearchChange={searchMemos}
          onCategoryChange={filterByCategory}
          onViewMemo={handleViewMemo}
          onEditMemo={handleEditMemo}
          onDeleteMemo={handleDeleteMemoWithViewer}
          stats={stats}
        />
      </main>

      {/* 모달 폼 */}
      <MemoForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={editingMemo ? handleUpdateMemo : handleCreateMemo}
        editingMemo={editingMemo}
      />

      <MemoDetailViewer
        memo={viewingMemo}
        isOpen={viewingMemo !== null}
        onClose={handleCloseViewer}
        onEdit={handleViewerEdit}
      />
    </div>
  )
}
