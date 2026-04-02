import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerStudent } from '@/lib/store';
import { BookOpen, UserPlus, ArrowLeft } from 'lucide-react';

const RegistrationPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setMessage({ text: 'Passwords do not match.', type: 'error' });
      return;
    }
    setLoading(true);
    const result = await registerStudent(username, password, email, studentId, username, department);
    setLoading(false);
    if (result.success) {
      setMessage({ text: 'Registration successful! Please check your email to confirm your account, then sign in.', type: 'success' });
      setTimeout(() => navigate('/login'), 3000);
    } else {
      setMessage({ text: result.error || 'Registration failed.', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="bg-shape w-96 h-96 bg-accent -top-20 right-0" />
      <div className="bg-shape w-80 h-80 bg-primary bottom-0 -left-20" />

      <div className="glass-card w-full max-w-md p-8 relative z-10">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <BookOpen className="w-10 h-10 text-accent" />
          <h1 className="text-2xl font-display font-bold text-foreground">Student Registration</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Choose a username" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="your@email.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Student ID</label>
            <input type="text" value={studentId} onChange={e => setStudentId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="STU-XXX" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Department</label>
            <select value={department} onChange={e => setDepartment(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              required>
              <option value="">Select Department</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="English">English</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Create password (min 6 chars)" required minLength={6} />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Confirm Password</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Confirm password" required />
          </div>

          {message && (
            <div className={`text-sm text-center py-2 rounded-lg ${
              message.type === 'success' ? 'text-success bg-success/10' : 'text-destructive bg-destructive/10'
            }`}>{message.text}</div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-lg bg-accent text-accent-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
            <UserPlus className="w-4 h-4" /> {loading ? 'Registering...' : 'Register'}
          </button>

          <Link to="/login"
            className="w-full py-3 rounded-lg border border-border text-muted-foreground font-medium flex items-center justify-center gap-2 hover:bg-secondary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </form>
      </div>
    </div>
  );
};

export default RegistrationPage;
