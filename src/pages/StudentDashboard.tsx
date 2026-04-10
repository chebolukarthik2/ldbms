import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchBooks, getCurrentUser, logout, type Book, type AppUser } from '@/lib/store';
import { BookOpen, Search, LogOut, Library, BookMarked, Loader2 } from 'lucide-react';

type Section = 'browse' | 'my-books';

const StudentDashboard = () => {
  const [section, setSection] = useState<Section>('browse');
  const [search, setSearch] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AppUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getCurrentUser().then(u => setUser(u));
    fetchBooks().then(b => { setBooks(b); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filter = search.toLowerCase();
  const filteredBooks = books.filter(
    b => b.title.toLowerCase().includes(filter) || b.author.toLowerCase().includes(filter) || b.book_id.toLowerCase().includes(filter)
  );
  const myBooks = user ? books.filter(b => b.status === 'Issued' && b.issued_to === user.username) : [];

  const handleLogout = async () => { await logout(); navigate('/login'); };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      <div className="bg-shape w-96 h-96 bg-accent -top-40 -right-40" />

      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col shrink-0 relative z-10">
        <div className="p-6 flex items-center gap-3 border-b border-sidebar-border">
          <BookOpen className="w-8 h-8 text-accent" />
          <div>
            <h2 className="font-display font-bold text-lg text-foreground">LMS Student</h2>
            <p className="text-xs text-muted-foreground">{user?.username || 'Student'}</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <button onClick={() => setSection('browse')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              section === 'browse' ? 'bg-accent text-accent-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent'
            }`}><Library className="w-5 h-5" /> Browse Books</button>
          <button onClick={() => setSection('my-books')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              section === 'my-books' ? 'bg-accent text-accent-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent'
            }`}><BookMarked className="w-5 h-5" /> My Books</button>
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-auto relative z-10">
        {section === 'browse' && (
          <div>
            <h1 className="text-3xl font-display font-bold mb-6">Browse Library</h1>
            <div className="relative mb-6 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Search by title or author..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBooks.map(book => (
                <div key={book.book_id} className="glass-card p-5">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-mono text-muted-foreground">{book.book_id}</span>
                    <span className={book.status === 'Available' ? 'status-available' : 'status-issued'}>{book.status}</span>
                  </div>
                  <h3 className="font-display font-semibold text-foreground mb-1">{book.title}</h3>
                  <p className="text-sm text-muted-foreground">{book.author}</p>
                </div>
              ))}
              {filteredBooks.length === 0 && (
                <p className="text-muted-foreground col-span-full text-center py-12">No books found.</p>
              )}
            </div>
          </div>
        )}

        {section === 'my-books' && (
          <div>
            <h1 className="text-3xl font-display font-bold mb-6">My Borrowed Books</h1>
            {myBooks.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <BookMarked className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">You haven't borrowed any books yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myBooks.map(book => (
                  <div key={book.book_id} className="glass-card p-5">
                    <span className="text-xs font-mono text-muted-foreground">{book.book_id}</span>
                    <h3 className="font-display font-semibold text-foreground mt-2 mb-1">{book.title}</h3>
                    <p className="text-sm text-muted-foreground">{book.author}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
