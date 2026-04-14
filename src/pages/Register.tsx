import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus, Camera, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { UserRole } from '@/data/mockData';

const roles: { value: UserRole; label: string; description: string }[] = [
  { value: 'owner', label: 'Owner', description: 'Full access to modules' },
  { value: 'admin', label: 'Admin/Staff', description: 'Manage store ops' },
  { value: 'cashier', label: 'Cashier', description: 'POS & transactions' },
];

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [address, setAddress] = useState('');
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('cashier');
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Full name is required'); return; }
    if (!email.trim()) { toast.error('Email is required'); return; }
    if (!phone.trim()) { toast.error('Phone number is required'); return; }
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(birthdate)) { toast.error('Please enter birthdate in MM/DD/YYYY format'); return; }
    if (!address.trim()) { toast.error('Address is required'); return; }
    if (password.length < 4) { toast.error('Password must be at least 4 characters'); return; }
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }

    const success = register(name, email, selectedRole, { phone, birthdate, address, avatar });
    if (success) {
      toast.success('Account created! Please sign in with your credentials.');
      navigate('/');
    } else {
      toast.error('Email already exists');
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 py-12 overflow-y-auto">
      {/* Full-screen Background with Blur and Dark Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed"
        style={{ backgroundImage: "url('/store-bg.jpg')" }}
      />
      <div className="absolute inset-0 z-0 bg-black/60 backdrop-blur-[2px]" />

      {/* Header Titles - Sharp & High Contrast */}
      <div className="relative z-10 text-center mb-10 mt-4 md:mt-0">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-3 tracking-tight drop-shadow-[0_4px_10px_rgba(124,58,237,0.5)] leading-tight">
          Vesmenda's Store Management System
        </h1>
        <p className="text-xl md:text-2xl text-violet-200 font-semibold tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
          Poblacion Pitogo Zamboanga Del Sur
        </p>
      </div>

      {/* Centered Register Card */}
      <div className="relative z-10 w-full max-w-[900px] bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Branding & Avatar */}
        <div className="w-full md:w-1/3 bg-gray-50/80 p-8 md:p-10 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-200">
          <div className="relative w-32 h-32 mx-auto mb-6 group">
            {avatar ? (
              <img 
                src={avatar} 
                alt="Avatar preview" 
                className="w-full h-full rounded-full object-cover border-4 border-white shadow-md"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-blue-50 border-4 border-white shadow-md flex items-center justify-center text-blue-300">
                <UserPlus className="w-12 h-12" />
              </div>
            )}
            <label 
              htmlFor="avatar-upload" 
              className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-bold"
            >
              <div className="flex flex-col items-center">
                <Camera className="w-6 h-6 mb-1" />
                CHANGE
              </div>
              <input 
                id="avatar-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleAvatarChange}
              />
            </label>
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Join Us</h2>
            <p className="text-gray-500 text-sm">Create your account to access the system.</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-2/3 p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 text-left">
                <Label htmlFor="name" className="text-gray-700 font-medium ml-1">Full Name</Label>
                <Input id="name" placeholder="Enter your full name" value={name} onChange={e => setName(e.target.value)} className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all" required />
              </div>
              <div className="space-y-2 text-left">
                <Label htmlFor="reg-email" className="text-gray-700 font-medium ml-1">Email</Label>
                <Input id="reg-email" type="email" placeholder="you@vesmenda.com" value={email} onChange={e => setEmail(e.target.value)} className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 text-left">
                <Label htmlFor="phone" className="text-gray-700 font-medium ml-1">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="09XXXXXXXXX" value={phone} onChange={e => setPhone(e.target.value)} className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all" required />
              </div>
              <div className="space-y-2 text-left">
                <Label htmlFor="birthdate" className="text-gray-700 font-medium ml-1">Birthdate</Label>
                <Input 
                  id="birthdate" 
                  type="text" 
                  placeholder="MM/DD/YYYY" 
                  value={birthdate} 
                  onChange={e => {
                    let val = e.target.value.replace(/\D/g, '');
                    if (val.length > 8) val = val.slice(0, 8);
                    if (val.length >= 5) {
                      val = `${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(4)}`;
                    } else if (val.length >= 3) {
                      val = `${val.slice(0, 2)}/${val.slice(2)}`;
                    }
                    setBirthdate(val);
                  }} 
                  className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all" 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2 text-left">
              <Label htmlFor="address" className="text-gray-700 font-medium ml-1">Complete Address</Label>
              <Input id="address" placeholder="House No., Street, Brgy, City, Province" value={address} onChange={e => setAddress(e.target.value)} className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 text-left">
                <Label htmlFor="reg-password" className="text-gray-700 font-medium ml-1">Password</Label>
                <div className="relative">
                  <Input id="reg-password" type={showPassword ? 'text' : 'password'} placeholder="Create password" value={password} onChange={e => setPassword(e.target.value)} className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all pr-10" required />
                  <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-left">
                <Label htmlFor="confirm-password" className="text-gray-700 font-medium ml-1">Confirm</Label>
                <Input id="confirm-password" type={showPassword ? 'text' : 'password'} placeholder="Confirm password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all" required />
              </div>
            </div>

            <div className="space-y-2 text-left pt-1">
              <Label className="text-gray-700 font-medium ml-1">Register as</Label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map(role => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setSelectedRole(role.value)}
                    className={`p-2 rounded-xl border-2 text-center transition-all flex flex-col items-center justify-center ${
                      selectedRole === role.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`text-sm font-bold ${selectedRole === role.value ? 'text-blue-700' : 'text-gray-600'}`}>{role.label}</span>
                    <span className={`text-[10px] mt-0.5 leading-tight ${selectedRole === role.value ? 'text-blue-500' : 'text-gray-400'}`}>{role.description}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex flex-row gap-3">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 h-12 rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-semibold transition-all text-base"
                onClick={() => navigate('/')}
              >
                Back to Sign In
              </Button>
              <Button 
                type="submit" 
                className="flex-[2] h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white shadow-lg shadow-blue-500/30 font-semibold transition-all border-0 text-base"
              >
                <UserPlus className="w-5 h-5 mr-2" /> Complete Registration
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
