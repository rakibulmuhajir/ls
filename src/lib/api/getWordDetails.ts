import { supabase } from './supabase';

export async function getWordDetails(wordText: string, bookId: number = 1) {
  const { data, error } = await supabase
    .from('words')
    .select('word_text, meaning, explanation, urdu_meaning, term_type, properties')
    .eq('word_text', wordText.toLowerCase())
    .eq('book_fk', bookId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}
