import { supabase } from './supabase'; // or '@/lib/api/supabase' depending on your path

export async function getChapters(bookId: number) {
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('book_fk', bookId)
    .order('chapter_order');

  if (error) {
    console.error('Supabase error:', error);
    throw error;
  }

  return data;
}
