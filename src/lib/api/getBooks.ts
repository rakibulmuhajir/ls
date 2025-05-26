// lib/api/getBooks.ts
import { supabase } from './supabase';

export async function getBooks() {
  const { data, error } = await supabase
    .from('books')
    .select('book_pk, title')
    .order('book_pk');

  if (error) throw new Error(error.message);
  return data ?? [];
}
