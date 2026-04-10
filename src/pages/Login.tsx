import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Store, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const foundUser = login(email, password);
    if (foundUser) {
      const route = foundUser.role === 'owner' ? '/owner' : foundUser.role === 'admin' ? '/admin' : '/cashier';
      navigate(route);
    } else {
      setError('Invalid credentials. Try owner@vesmenda.com, admin@vesmenda.com, or cashier@vesmenda.com');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[hsl(222,47%,11%)] flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-info rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-8">
            <Store className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Vesmenda's Store</h1>
          <p className="text-base text-white/50 mb-4">Management System</p>
          <p className="text-sm text-white/40">Poblacion Pitogo Zamboanga Del Sur</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Store className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">Vesmenda's Store</h1>
          </div>

          <h2 className="text-2xl font-bold mb-1">Welcome</h2>
          <p className="text-muted-foreground mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@vesmenda.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">Register</Link>
          </p>

          <div className="mt-6 p-4 rounded-lg bg-muted">
            <p className="text-xs font-medium text-muted-foreground mb-2">Demo Accounts:</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p><span className="font-medium text-foreground">Owner:</span> owner@vesmenda.com</p>
              <p><span className="font-medium text-foreground">Admin:</span> admin@vesmenda.com</p>
              <p><span className="font-medium text-foreground">Cashier:</span> cashier@vesmenda.com</p>
              <p className="text-[10px] mt-1">(Any password works for demo)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
