import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/store';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [redirect, setRedirect] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const user = await getCurrentUser();
        if (user) {
          setRedirect(user.role === 'admin' ? '/admin' : '/student');
        } else {
          setRedirect('/login');
        }
      } else {
        setRedirect('/login');
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return <Navigate to={redirect || '/login'} replace />;
};

export default Index;
