import { useAuth } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User, Mail, Calendar, Eye, EyeOff, Camera } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState, useRef } from "react";
import { toast } from "sonner";

type ProfileForm = {
  name: string;
  profileImage?: string;
};

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const profileForm = useForm<ProfileForm>({
    defaultValues: { name: user?.name || '', profileImage: user?.profileImage || '' }
  });
  
  const passwordForm = useForm<PasswordForm>({
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' }
  });

  const onUpdateProfile = async (data: ProfileForm) => {
    try {
      console.log('Updating profile with image size:', previewImage ? previewImage.length : 0);
      await updateProfile(data.name, previewImage || data.profileImage);
      setIsEditing(false);
      setPreviewImage(null);
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      console.error('Profile update error:', err);
      toast.error(err?.message || 'Failed to update profile');
      profileForm.setError('root', { message: err?.message || 'Update failed' });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (limit to 2MB)
      if (file.size > 2 * 1024 * 1024) {
        profileForm.setError('root', { message: 'Image size must be less than 2MB' });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        console.log('Image loaded, size:', result.length);
        setPreviewImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onChangePassword = async (data: PasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      passwordForm.setError('confirmPassword', { message: 'Passwords do not match' });
      return;
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/auth/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword: data.currentPassword, newPassword: data.newPassword })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      const result = await response.json();
      
      // If logout flag is set, redirect to login
      if (result.logout) {
        toast.success('Password changed successfully! Please login again.');
        window.location.href = '/login';
        return;
      }
      
      passwordForm.reset();
      setIsChangingPassword(false);
      onOpenChange(false);
      toast.success('Password changed successfully!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to change password');
      passwordForm.setError('root', { message: err?.message || 'Password change failed' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Profile Info */}
          <div className="text-center">
            <div className="relative inline-block">
              <div className="h-16 w-16 rounded-full bg-black flex items-center justify-center text-white text-xl font-bold mx-auto mb-3 overflow-hidden">
                {previewImage || user?.profileImage ? (
                  <img 
                    src={previewImage || user?.profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase() || 'U'
                )}
              </div>
              {isEditing && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full p-0"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{user?.name || 'User'}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email || 'user@example.com'}</p>
          </div>

          {!isChangingPassword ? (
            <>
              {/* Profile Form */}
              {!isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <User className="inline h-4 w-4 mr-2" />
                      Full Name
                    </label>
                    <Input value={user?.name || ''} disabled className="bg-gray-50 dark:bg-gray-700" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Mail className="inline h-4 w-4 mr-2" />
                      Email
                    </label>
                    <Input value={user?.email || ''} disabled className="bg-gray-50 dark:bg-gray-700" />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={() => setIsEditing(true)} className="flex-1">
                      Edit Profile
                    </Button>
                    <Button variant="outline" onClick={() => setIsChangingPassword(true)} className="flex-1">
                      Change Password
                    </Button>
                  </div>
                </div>
              ) : (
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-4">
                    {profileForm.formState.errors.root?.message && (
                      <div className="text-sm text-red-600 border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded px-3 py-2">
                        {profileForm.formState.errors.root.message}
                      </div>
                    )}
                    
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">Save</Button>
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </>
          ) : (
            /* Change Password Form */
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
                {passwordForm.formState.errors.root?.message && (
                  <div className="text-sm text-red-600 border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded px-3 py-2">
                    {passwordForm.formState.errors.root.message}
                  </div>
                )}
                
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type={showCurrentPassword ? "text" : "password"} {...field} />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type={showNewPassword ? "text" : "password"} {...field} />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type={showConfirmPassword ? "text" : "password"} {...field} />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">Change Password</Button>
                  <Button type="button" variant="outline" onClick={() => setIsChangingPassword(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}