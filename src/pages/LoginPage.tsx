import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '@/lib/store';
import { BookOpen, LogIn, UserPlus } from 'lucide-react';

const LoginPage = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const user = await login(usernameOrEmail, password);
      if (user) {
        navigate(user.role === 'admin' ? '/admin' : '/student');
      } else {
        setError('Invalid credentials. Please try again.');
        setTimeout(() => setError(''), 3000);
      }
    } catch {
      setError('An error occurred. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="bg-shape w-96 h-96 bg-primary -top-20 -left-20" />
      <div className="bg-shape w-80 h-80 bg-accent bottom-10 right-10" />

      <div className="glass-card w-full max-w-md p-8 relative z-10">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <BookOpen className="w-10 h-10 text-primary" />
          <h1 className="text-2xl font-display font-bold text-foreground">Library System</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Username / Email</label>
            <input type="text" value={usernameOrEmail} onChange={e => setUsernameOrEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter username or email" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter password" required />
          </div>

          {error && <div className="text-destructive text-sm text-center bg-destructive/10 py-2 rounded-lg">{error}</div>}

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
            <LogIn className="w-4 h-4" /> {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <Link to="/register"
            className="w-full py-3 rounded-lg border border-border text-muted-foreground font-medium flex items-center justify-center gap-2 hover:bg-secondary transition-colors">
            <UserPlus className="w-4 h-4" /> Register as Student
          </Link>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
