import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
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
      setError('Account not found. Please register first.');
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Full-screen Background with Blur and Dark Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ backgroundImage: "url('/store-bg.jpg')" }}
      />
      <div className="absolute inset-0 z-0 bg-black/60 backdrop-blur-[2px]" />
      
      {/* Header Titles - Sharp & High Contrast */}
      <div className="relative z-10 text-center mb-10 mt-[-5vh]">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-3 tracking-tight drop-shadow-[0_4px_10px_rgba(124,58,237,0.5)]">
          Vesmenda's Store Management System
        </h1>
        <p className="text-xl md:text-2xl text-violet-200 font-semibold tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
          Poblacion Pitogo Zamboanga Del Sur
        </p>
      </div>

      {/* Centered Login Card */}
      <div className="relative z-10 w-full max-w-[420px] bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-8 md:p-10 border border-white/20">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome</h2>
          <p className="text-gray-500 text-sm">Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2 text-left">
            <Label htmlFor="email" className="text-gray-700 font-medium ml-1">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all"
              required
            />
          </div>

          <div className="space-y-2 text-left">
            <Label htmlFor="password" className="text-gray-700 font-medium ml-1">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all pr-12"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <div className="pt-4 flex flex-col gap-3">
            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white shadow-lg shadow-blue-500/30 font-semibold transition-all border-0 text-base"
            >
              Sign In
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-12 rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-semibold transition-all text-base"
              onClick={() => navigate('/register')}
            >
              Register
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
