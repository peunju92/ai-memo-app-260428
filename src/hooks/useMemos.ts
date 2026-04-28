'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Memo, MemoFormData } from '@/types/memo'
import {
  getMemos,
  createMemo as createMemoAction,
  updateMemo as updateMemoAction,
  deleteMemo as deleteMemoAction,
  clearAllMemos as clearAllMemosAction,
} from '@/app/actions/memos'

export const useMemos = () => {
  const [memos, setMemos] = useState<Memo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const loadMemos = useCallback(async () => {
    setLoading(true)
    try {
      const loaded = await getMemos()
      setMemos(loaded)
    } catch (error) {
      console.error('Failed to load memos:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMemos()
  }, [loadMemos])

  const createMemo = useCallback(
    async (formData: MemoFormData): Promise<Memo> => {
      const newMemo = await createMemoAction(formData)
      setMemos(prev => [newMemo, ...prev])
      return newMemo
    },
    [],
  )

  const updateMemo = useCallback(
    async (id: string, formData: MemoFormData): Promise<void> => {
      const updated = await updateMemoAction(id, formData)
      setMemos(prev => prev.map(m => (m.id === id ? updated : m)))
    },
    [],
  )

  const deleteMemo = useCallback(async (id: string): Promise<void> => {
    await deleteMemoAction(id)
    setMemos(prev => prev.filter(m => m.id !== id))
  }, [])

  const searchMemos = useCallback((query: string): void => {
    setSearchQuery(query)
  }, [])

  const filterByCategory = useCallback((category: string): void => {
    setSelectedCategory(category)
  }, [])

  const getMemoById = useCallback(
    (id: string): Memo | undefined => {
      return memos.find(m => m.id === id)
    },
    [memos],
  )

  const filteredMemos = useMemo(() => {
    let filtered = memos

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(m => m.category === selectedCategory)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        m =>
          m.title.toLowerCase().includes(query) ||
          m.content.toLowerCase().includes(query) ||
          (m.tags ?? []).some(tag => tag.toLowerCase().includes(query)),
      )
    }

    return filtered
  }, [memos, selectedCategory, searchQuery])

  const clearAllMemos = useCallback(async (): Promise<void> => {
    await clearAllMemosAction()
    setMemos([])
    setSearchQuery('')
    setSelectedCategory('all')
  }, [])

  const stats = useMemo(() => {
    const categoryCounts = memos.reduce(
      (acc, m) => {
        acc[m.category] = (acc[m.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      total: memos.length,
      byCategory: categoryCounts,
      filtered: filteredMemos.length,
    }
  }, [memos, filteredMemos])

  return {
    memos: filteredMemos,
    allMemos: memos,
    loading,
    searchQuery,
    selectedCategory,
    stats,

    createMemo,
    updateMemo,
    deleteMemo,
    getMemoById,

    searchMemos,
    filterByCategory,

    clearAllMemos,
  }
}
