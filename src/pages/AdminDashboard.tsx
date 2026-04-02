import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchBooks, fetchStudents, getStats, addBook, deleteBook as removeBook, issueBook, returnBook, logout, deleteStudent, type Book, type Student } from '@/lib/store';
import {
  LayoutDashboard, BookOpen, BookUp, BookDown, Users, LogOut, Plus, Trash2, Shield, X, Loader2
} from 'lucide-react';

type Section = 'dashboard' | 'manage-books' | 'issue-book' | 'return-book' | 'view-students';

const navItems: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'manage-books', label: 'Manage Books', icon: <BookOpen className="w-5 h-5" /> },
  { id: 'issue-book', label: 'Issue Book', icon: <BookUp className="w-5 h-5" /> },
  { id: 'return-book', label: 'Return Book', icon: <BookDown className="w-5 h-5" /> },
  { id: 'view-students', label: 'View Students', icon: <Users className="w-5 h-5" /> },
];

const AdminDashboard = () => {
  const [section, setSection] = useState<Section>('dashboard');
  const [books, setBooks] = useState<Book[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState({ totalBooks: 0, issuedBooks: 0, availableBooks: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [newBook, setNewBook] = useState({ id: '', title: '', author: '' });
  const [issueForm, setIssueForm] = useState({ bookId: '', studentName: '', studentId: '', department: '' });
  const [returnId, setReturnId] = useState('');
  const [alert, setAlert] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showAlert = (text: string, type: 'success' | 'error') => {
    setAlert({ text, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [b, s, st] = await Promise.all([fetchBooks(), fetchStudents(), getStats()]);
      setBooks(b);
      setStudents(s);
      setStats(st);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addBook(newBook.id, newBook.title, newBook.author);
      setShowModal(false);
      setNewBook({ id: '', title: '', author: '' });
      showAlert('Book added successfully!', 'success');
      loadData();
    } catch { showAlert('Error adding book.', 'error'); }
  };

  const handleDelete = async (id: string) => {
    const err = await removeBook(id);
    if (err) showAlert(err, 'error');
    else { showAlert('Book deleted!', 'success'); loadData(); }
  };

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = await issueBook(issueForm.bookId, issueForm.studentName);
    if (err) showAlert(err, 'error');
    else { showAlert(`Book issued to ${issueForm.studentName}!`, 'success'); setIssueForm({ bookId: '', studentName: '', studentId: '', department: '' }); loadData(); }
  };

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = await returnBook(returnId);
    if (err) showAlert(err, 'error');
    else { showAlert('Book returned!', 'success'); setReturnId(''); loadData(); }
  };

  const handleLogout = async () => { await logout(); navigate('/login'); };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      <div className="bg-shape w-96 h-96 bg-primary -top-40 -right-40" />

      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col shrink-0 relative z-10">
        <div className="p-6 flex items-center gap-3 border-b border-sidebar-border">
          <Shield className="w-8 h-8 text-primary" />
          <h2 className="font-display font-bold text-lg text-foreground">LMS Admin</h2>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                section === item.id ? 'bg-primary text-primary-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent'
              }`}>{item.icon} {item.label}</button>
          ))}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-auto relative z-10">
        {alert && (
          <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg text-sm font-medium ${
            alert.type === 'success' ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'
          }`}>{alert.text}</div>
        )}

        {section === 'dashboard' && (
          <div>
            <h1 className="text-3xl font-display font-bold mb-8">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Total Books', value: stats.totalBooks, color: 'text-primary' },
                { label: 'Issued Books', value: stats.issuedBooks, color: 'text-warning' },
                { label: 'Available Books', value: stats.availableBooks, color: 'text-success' },
              ].map(s => (
                <div key={s.label} className="glass-card p-6">
                  <p className="text-sm text-muted-foreground mb-1">{s.label}</p>
                  <h2 className={`text-4xl font-display font-bold ${s.color}`}>{s.value}</h2>
                </div>
              ))}
            </div>
          </div>
        )}

        {section === 'manage-books' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-display font-bold">Manage Books</h1>
              <button onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity">
                <Plus className="w-4 h-4" /> Add Book
              </button>
            </div>
            <div className="glass-card overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border">
                    {['ID', 'Title', 'Author', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {books.map(book => (
                    <tr key={book.book_id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono">{book.book_id}</td>
                      <td className="px-6 py-4 text-sm font-medium">{book.title}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{book.author}</td>
                      <td className="px-6 py-4">
                        <span className={book.status === 'Available' ? 'status-available' : 'status-issued'}>{book.status}</span>
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => handleDelete(book.book_id)}
                          className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {section === 'issue-book' && (
          <div>
            <h1 className="text-3xl font-display font-bold mb-8">Issue a Book</h1>
            <div className="glass-card max-w-lg mx-auto p-8">
              <form onSubmit={handleIssue} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Book ID</label>
                  <input type="text" value={issueForm.bookId} onChange={e => setIssueForm(f => ({ ...f, bookId: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g. CS001" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Student Name</label>
                  <select value={issueForm.studentName} onChange={e => {
                    const name = e.target.value;
                    const stu = students.find(s => s.name === name);
                    setIssueForm(f => ({
                      ...f,
                      studentName: name,
                      studentId: stu?.student_id || '',
                      department: (stu as any)?.department || '',
                    }));
                  }}
                    className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required>
                    <option value="">Select a student</option>
                    {students.map(s => (
                      <option key={s.student_id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Student ID</label>
                  <input type="text" value={issueForm.studentId} readOnly
                    className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-border text-muted-foreground cursor-not-allowed"
                    placeholder="Auto-filled" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Department</label>
                  <input type="text" value={issueForm.department} readOnly
                    className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-border text-muted-foreground cursor-not-allowed"
                    placeholder="Auto-filled" />
                </div>
                <button type="submit"
                  className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">Process Issue</button>
              </form>
            </div>
          </div>
        )}

        {section === 'return-book' && (
          <div>
            <h1 className="text-3xl font-display font-bold mb-8">Return a Book</h1>
            <div className="glass-card max-w-lg mx-auto p-8">
              <form onSubmit={handleReturn} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Book ID</label>
                  <input type="text" value={returnId} onChange={e => setReturnId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="BK-XXX" required />
                </div>
                <button type="submit"
                  className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">Process Return</button>
              </form>
            </div>
          </div>
        )}

        {section === 'view-students' && (
          <div>
            <h1 className="text-3xl font-display font-bold mb-8">Registered Students</h1>
            <div className="glass-card overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border">
                    {['ID', 'Name', 'Department', 'Borrowed', 'Actions'].map(h => (
                      <th key={h} className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map(stu => (
                    <tr key={stu.student_id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono">{stu.student_id}</td>
                      <td className="px-6 py-4 text-sm font-medium">{stu.name}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{(stu as any).department || '—'}</td>
                      <td className="px-6 py-4 text-sm">{stu.borrowed}</td>
                      <td className="px-6 py-4">
                        <button onClick={async () => {
                          const err = await deleteStudent(stu.student_id);
                          if (err) showAlert(err, 'error');
                          else { showAlert('Student deleted!', 'success'); loadData(); }
                        }}
                          className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-8 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-display font-bold mb-6">Add New Book</h2>
            <form onSubmit={handleAddBook} className="space-y-4">
              <input type="text" placeholder="Book ID (e.g. BK-111)" required
                value={newBook.id} onChange={e => setNewBook(b => ({ ...b, id: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              <input type="text" placeholder="Title" required
                value={newBook.title} onChange={e => setNewBook(b => ({ ...b, title: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              <input type="text" placeholder="Author" required
                value={newBook.author} onChange={e => setNewBook(b => ({ ...b, author: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              <button type="submit"
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">Add to Library</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
