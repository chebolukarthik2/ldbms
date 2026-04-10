import { supabase } from '@/integrations/supabase/client';

export interface Book {
  id: string;
  book_id: string;
  title: string;
  author: string;
  status: string;
  issued_to: string | null;
}

export interface Student {
  student_id: string;
  name: string;
  borrowed: number;
  books: string[];
  email?: string;
  user_id?: string;
}

export interface AppUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'student';
}

// --- Auth (Supabase Auth) ---

export async function login(usernameOrEmail: string, password: string): Promise<AppUser | null> {
  let email = usernameOrEmail;

  // If input doesn't look like an email, look up the username in profiles
  if (!usernameOrEmail.includes('@')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('username', usernameOrEmail)
      .single();

    if (!profile?.email) return null;
    email = profile.email;
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return null;

  return await getCurrentUser();
}

export async function getCurrentUser(): Promise<AppUser | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const userId = session.user.id;

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, email, display_name')
    .eq('user_id', userId)
    .single();

  // Get role
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (!profile || !roleData) return null;

  return {
    id: userId,
    username: profile.username || profile.email || '',
    email: profile.email || session.user.email || '',
    role: roleData.role as 'admin' | 'student',
  };
}

export async function logout() {
  await supabase.auth.signOut();
}

export async function registerStudent(
  username: string,
  password: string,
  email: string,
  studentId: string,
  displayName: string,
  department?: string
): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        display_name: displayName,
        role: 'student',
      },
    },
  });

  if (error) return { success: false, error: error.message };
  if (!data.user) return { success: false, error: 'Registration failed.' };

  // Create student record
  const { error: studentError } = await supabase.from('students').insert({
    student_id: studentId,
    name: displayName,
    email,
    user_id: data.user.id,
    borrowed: 0,
    books: [],
    department: department || null,
  });

  if (studentError) return { success: false, error: studentError.message };

  return { success: true };
}

export async function deleteStudent(studentId: string): Promise<string | null> {
  const { error } = await supabase.from('students').delete().eq('student_id', studentId);
  if (error) return error.message;
  return null;
}

// --- Books ---

export async function fetchBooks(): Promise<Book[]> {
  const { data, error } = await supabase.from('books').select('*').order('created_at');
  if (error) throw error;
  return data || [];
}

export async function addBook(bookId: string, title: string, author: string) {
  const { error } = await supabase.from('books').insert({ book_id: bookId, title, author });
  if (error) throw error;
}

export async function deleteBook(bookId: string): Promise<string | null> {
  const { data: book } = await supabase.from('books').select('status').eq('book_id', bookId).single();
  if (!book) return 'Book not found.';
  if (book.status === 'Issued') return 'Cannot delete an issued book.';
  const { error } = await supabase.from('books').delete().eq('book_id', bookId);
  if (error) return error.message;
  return null;
}

export async function issueBook(bookId: string, studentName: string): Promise<string | null> {
  const { data: book } = await supabase.from('books').select('*').eq('book_id', bookId).single();
  if (!book) return 'Book not found.';
  if (book.status === 'Issued') return 'Book is already issued.';

  const { data: student } = await supabase.from('students').select('*').eq('name', studentName).single();
  if (student && student.borrowed >= 3) return 'Student has reached the limit (Max 3 books).';

  await supabase.from('books').update({ status: 'Issued', issued_to: studentName }).eq('book_id', bookId);
  await supabase.from('issued_books').insert({ book_id: bookId, student_name: studentName });

  if (student) {
    await supabase.from('students').update({
      borrowed: student.borrowed + 1,
      books: [...student.books, bookId],
    }).eq('student_id', student.student_id);
  }

  return null;
}

export async function returnBook(bookId: string): Promise<string | null> {
  const { data: book } = await supabase.from('books').select('*').eq('book_id', bookId).single();
  if (!book || book.status !== 'Issued') return 'Book not found or not issued.';

  await supabase.from('books').update({ status: 'Available', issued_to: null }).eq('book_id', bookId);
  await supabase.from('issued_books').update({ return_date: new Date().toISOString().split('T')[0] })
    .eq('book_id', bookId).is('return_date', null);

  if (book.issued_to) {
    const { data: student } = await supabase.from('students').select('*').eq('name', book.issued_to).single();
    if (student) {
      await supabase.from('students').update({
        borrowed: Math.max(0, student.borrowed - 1),
        books: student.books.filter(b => b !== bookId),
      }).eq('student_id', student.student_id);
    }
  }

  return null;
}

// --- Students ---

export async function fetchStudents(): Promise<Student[]> {
  const { data, error } = await supabase.from('students').select('*').order('created_at');
  if (error) throw error;
  return (data || []) as Student[];
}

// --- Stats ---

export async function getStats() {
  const { data: books } = await supabase.from('books').select('status');
  const total = books?.length || 0;
  const issued = books?.filter(b => b.status === 'Issued').length || 0;
  return { totalBooks: total, issuedBooks: issued, availableBooks: total - issued };
}

// --- Activity ---

export async function fetchActivities() {
  const { data, error } = await supabase
    .from('issued_books')
    .select('*, books(title)')
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (error) throw error;
  return data || [];
}
