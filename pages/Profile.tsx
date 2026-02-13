import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import Button from '../components/Button';
import Input from '../components/Input';
import { User as UserIcon, Lock, Mail, Save, AlertCircle, Trash2 } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, updateUser, deleteAccount } = useStore();
  const [displayName, setDisplayName] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
    }
  }, [user]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    setIsSavingProfile(true);
    setProfileMessage({ type: '', text: '' });

    // Simulate API delay
    setTimeout(() => {
      updateUser({ displayName });
      setIsSavingProfile(false);
      setProfileMessage({ type: 'success', text: 'Profile updated successfully.' });
      
      // Clear message after 3 seconds
      setTimeout(() => setProfileMessage({ type: '', text: '' }), 3000);
    }, 800);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setIsSavingPassword(true);

    // Simulate API delay
    setTimeout(() => {
      setIsSavingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage({ type: 'success', text: 'Password changed successfully.' });
      
      // Clear message after 3 seconds
      setTimeout(() => setPasswordMessage({ type: '', text: '' }), 3000);
    }, 1000);
  };

  const handleDeleteAccount = () => {
      if (window.confirm('Are you sure you want to delete your account? This action cannot be undone and you will lose all your data.')) {
          deleteAccount();
      }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Account Settings</h1>
        <p className="text-slate-500 mt-1">Manage your profile and security preferences.</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
          <UserIcon size={18} className="text-blue-600" />
          <h2 className="font-semibold text-slate-800">Personal Information</h2>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-shrink-0">
                 <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold border-4 border-white shadow-sm">
                    {user?.displayName.charAt(0)}
                 </div>
              </div>
              <div className="flex-1 space-y-4">
                <Input
                  label="Display Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your Name"
                />
                <div className="relative">
                  <Input
                    label="Email Address"
                    value={user?.email || ''}
                    disabled
                    className="bg-slate-50 text-slate-500"
                  />
                  <Mail size={16} className="absolute right-3 top-[34px] text-slate-400" />
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div className="text-sm">
                {profileMessage.text && (
                  <span className={`flex items-center gap-1 ${profileMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                    {profileMessage.type === 'error' ? <AlertCircle size={14} /> : <Save size={14} />}
                    {profileMessage.text}
                  </span>
                )}
              </div>
              <Button type="submit" disabled={isSavingProfile || !displayName.trim() || displayName === user?.displayName}>
                {isSavingProfile ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
          <Lock size={18} className="text-blue-600" />
          <h2 className="font-semibold text-slate-800">Security</h2>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <Input
              type="password"
              label="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="password"
                label="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
              <Input
                type="password"
                label="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div className="text-sm">
                {passwordMessage.text && (
                  <span className={`flex items-center gap-1 ${passwordMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                    {passwordMessage.type === 'error' ? <AlertCircle size={14} /> : <Save size={14} />}
                    {passwordMessage.text}
                  </span>
                )}
              </div>
              <Button 
                type="submit" 
                variant="secondary"
                disabled={isSavingPassword || !currentPassword || !newPassword || !confirmPassword}
              >
                {isSavingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-lg shadow-sm border border-red-100 overflow-hidden">
        <div className="p-4 border-b border-red-100 bg-red-50/30 flex items-center gap-2">
          <Trash2 size={18} className="text-red-600" />
          <h2 className="font-semibold text-red-800">Danger Zone</h2>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h3 className="font-medium text-slate-800">Delete Account</h3>
                <p className="text-sm text-slate-500 mt-1">
                    Permanently delete your account and all associated data. This action cannot be undone.
                </p>
            </div>
            <Button 
                variant="danger" 
                onClick={handleDeleteAccount}
            >
                Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;