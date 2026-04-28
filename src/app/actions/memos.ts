'use server'

import { v4 as uuidv4 } from 'uuid'
import { revalidatePath } from 'next/cache'
import { supabaseServer, type MemoRow } from '@/lib/supabase/server'
import { Memo, MemoFormData } from '@/types/memo'

function rowToMemo(row: MemoRow): Memo {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category,
    tags: row.tags ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getMemos(): Promise<Memo[]> {
  const { data, error } = await supabaseServer
    .from('memos')
    .select('id, title, content, category, tags, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[getMemos] Supabase error:', error)
    throw new Error('메모를 불러오는 데 실패했습니다.')
  }

  return (data as MemoRow[]).map(rowToMemo)
}

export async function createMemo(formData: MemoFormData): Promise<Memo> {
  const now = new Date().toISOString()
  const newRow: MemoRow = {
    id: uuidv4(),
    title: formData.title,
    content: formData.content,
    category: formData.category,
    tags: formData.tags,
    created_at: now,
    updated_at: now,
  }

  const { data, error } = await supabaseServer
    .from('memos')
    .insert(newRow)
    .select('id, title, content, category, tags, created_at, updated_at')
    .single()

  if (error) {
    console.error('[createMemo] Supabase error:', error)
    throw new Error('메모 저장에 실패했습니다.')
  }

  revalidatePath('/')
  return rowToMemo(data as MemoRow)
}

export async function updateMemo(id: string, formData: MemoFormData): Promise<Memo> {
  const { data, error } = await supabaseServer
    .from('memos')
    .update({
      title: formData.title,
      content: formData.content,
      category: formData.category,
      tags: formData.tags,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('id, title, content, category, tags, created_at, updated_at')
    .single()

  if (error) {
    console.error('[updateMemo] Supabase error:', error)
    throw new Error('메모 수정에 실패했습니다.')
  }

  revalidatePath('/')
  return rowToMemo(data as MemoRow)
}

export async function deleteMemo(id: string): Promise<void> {
  const { error } = await supabaseServer.from('memos').delete().eq('id', id)

  if (error) {
    console.error('[deleteMemo] Supabase error:', error)
    throw new Error('메모 삭제에 실패했습니다.')
  }

  revalidatePath('/')
}

export async function clearAllMemos(): Promise<void> {
  const { error } = await supabaseServer.from('memos').delete().neq('id', '')

  if (error) {
    console.error('[clearAllMemos] Supabase error:', error)
    throw new Error('메모 전체 삭제에 실패했습니다.')
  }

  revalidatePath('/')
}
