// src/data/books.ts
import { db } from '../lib/db';

export interface Book {
  id: string;
  title: string;
  subject: string;
  author: string;
  publicationYear: number;
  description: string;
  board: string;
  grade: string;
}

export function getAllBooks(callback: (books: Book[]) => void) {
  db.transaction(tx => {
    tx.executeSql(
      `SELECT
         b.book_pk AS id,
         b.title,
         b.subject,
         b.author,
         b.publication_year AS publicationYear,
         b.description,
         boards.board_name AS board,
         grades.grade_name AS grade
       FROM Books b
       LEFT JOIN Boards boards ON b.board_fk = boards.board_pk
       LEFT JOIN Grades grades ON b.grade_fk = grades.grade_pk
       ORDER BY b.title ASC;`,
      [],
      (_, { rows }) => {
        const books: Book[] = rows._array;
        callback(books);
      },
      (_, error) => {
        console.error("Error fetching books", error);
        return false;
      }
    );
  });
}
