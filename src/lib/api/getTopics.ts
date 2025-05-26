import { supabase } from '@/lib/api/supabase'

export async function getTopics(chapterId: number) {
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('chapter_fk', chapterId)
    .order('order_in_chapter')

  if (error) {
    console.error('Supabase error:', error)
    return []
  }

  return data
}
