import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogTrigger, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Mail, Phone, MapPin, Calendar, User, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface UserProfileDialogProps {
  children: React.ReactNode;
}

export function UserProfileDialog({ children }: UserProfileDialogProps) {
  const { user, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [open, setOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    birthdate: user?.birthdate || '',
    address: user?.address || '',
    avatar: user?.avatar || ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!formData.name.trim()) { toast.error('Name is required'); return; }
    if (!formData.email.trim()) { toast.error('Email is required'); return; }
    
    updateUserProfile(formData);
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleReset = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      birthdate: user?.birthdate || '',
      address: user?.address || '',
      avatar: user?.avatar || ''
    });
    setIsEditing(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if(!v) handleReset(); }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] border-none bg-white/95 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden p-0">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
          <button 
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 text-white rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="px-8 pb-8 -mt-16">
          <div className="flex flex-col items-center text-center">
            <div className="relative group mb-4">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                {formData.avatar ? (
                  <img src={formData.avatar} alt={formData.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-gray-300" />
                )}
              </div>
              {isEditing && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2.5 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all border-2 border-white"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleAvatarChange} 
              />
            </div>

            {!isEditing ? (
              <>
                <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                <p className="text-blue-600 font-medium capitalize mb-6">{user?.role} Account</p>
                
                <div className="w-full space-y-4">
                  <div className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50/50 border border-gray-100 italic transition-all">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Email Address</p>
                      <p className="text-sm font-medium text-gray-700">{user?.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50/50 border border-gray-100 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Phone</p>
                        <p className="text-sm font-medium text-gray-700">{user?.phone || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50/50 border border-gray-100 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Birthday</p>
                        <p className="text-sm font-medium text-gray-700">{user?.birthdate || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50/50 border border-gray-100 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Home Address</p>
                      <p className="text-sm font-medium text-gray-700 line-clamp-1">{user?.address || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <DialogFooter className="w-full mt-8">
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-lg shadow-blue-200"
                  >
                    Edit Profile Details
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <div className="w-full space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 text-left">
                    <Label className="ml-1 text-[10px] font-bold text-gray-400 uppercase">Full Name</Label>
                    <Input 
                      value={formData.name} 
                      onChange={e => setFormData({ ...formData, name: e.target.value })} 
                      className="rounded-xl bg-gray-50 border-gray-100 focus:bg-white h-11"
                    />
                  </div>
                  <div className="space-y-1 text-left">
                    <Label className="ml-1 text-[10px] font-bold text-gray-400 uppercase">Email</Label>
                    <Input 
                      value={formData.email} 
                      onChange={e => setFormData({ ...formData, email: e.target.value })} 
                      className="rounded-xl bg-gray-50 border-gray-100 focus:bg-white h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 text-left">
                    <Label className="ml-1 text-[10px] font-bold text-gray-400 uppercase">Phone</Label>
                    <Input 
                      value={formData.phone} 
                      onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                      className="rounded-xl bg-gray-50 border-gray-100 focus:bg-white h-11"
                    />
                  </div>
                  <div className="space-y-1 text-left">
                    <Label className="ml-1 text-[10px] font-bold text-gray-400 uppercase">Birthday</Label>
                    <Input 
                      value={formData.birthdate} 
                      placeholder="MM/DD/YYYY"
                      onChange={e => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length > 8) val = val.slice(0, 8);
                        if (val.length >= 5) {
                          val = `${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(4)}`;
                        } else if (val.length >= 3) {
                          val = `${val.slice(0, 2)}/${val.slice(2)}`;
                        }
                        setFormData({ ...formData, birthdate: val });
                      }} 
                      className="rounded-xl bg-gray-50 border-gray-100 focus:bg-white h-11"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <Label className="ml-1 text-[10px] font-bold text-gray-400 uppercase">Complete Address</Label>
                  <Input 
                    value={formData.address} 
                    onChange={e => setFormData({ ...formData, address: e.target.value })} 
                    className="rounded-xl bg-gray-50 border-gray-100 focus:bg-white h-11"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={handleReset}
                    className="flex-1 h-12 rounded-xl border-gray-200 text-gray-600 font-bold"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave}
                    className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-200"
                  >
                    <Save className="w-4 h-4 mr-2" /> Save Changes
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
