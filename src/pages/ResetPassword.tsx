import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Key, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if this is a valid password reset session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsValidSession(true);
        } else {
          // Check if we have the required URL parameters for password reset
          const accessToken = searchParams.get('access_token');
          const refreshToken = searchParams.get('refresh_token');
          const type = searchParams.get('type');
          
          if (accessToken && refreshToken && type === 'recovery') {
            // Set the session using the tokens from URL
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (error) {
              console.error('Error setting session:', error);
              setIsValidSession(false);
              toast.error('Invalid or expired reset link.');
            } else {
              setIsValidSession(true);
            }
          } else {
            setIsValidSession(false);
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setIsValidSession(false);
      }
    };

    checkSession();
  }, [searchParams]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        toast.error(error.message || 'Failed to update password');
      } else {
        toast.success('Password updated successfully! Please sign in with your new password.');
        // Sign out the user so they can sign in with the new password
        await supabase.auth.signOut();
        navigate('/auth');
      }
    } catch (error: any) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while checking session
  if (isValidSession === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardContent className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Invalid session state
  if (isValidSession === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
        {/* Floating background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-32 h-32 bg-red-400/20 rounded-full animate-float"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-orange-400/20 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
        </div>

        <Card className="w-full max-w-md border-0 shadow-2xl bg-white/80 backdrop-blur-sm relative z-10">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-red-100">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800">
              Invalid Reset Link
            </CardTitle>
            <CardDescription className="text-slate-600">
              This password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-sm text-slate-600">
                Password reset links expire after 24 hours for security reasons.
              </p>
              
              <div className="space-y-2">
                <Button
                  onClick={() => navigate('/forgot-password')}
                  className="w-full gradient-primary text-white font-semibold"
                >
                  Request New Reset Link
                </Button>
                
                <Button
                  onClick={() => navigate('/auth')}
                  variant="outline"
                  className="w-full"
                >
                  Back to Sign In
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Valid session - show password reset form
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400/20 rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-teal-400/20 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-sky-400/20 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      <Card className="w-full max-w-md border-0 shadow-2xl bg-white/80 backdrop-blur-sm relative z-10">
        <CardHeader className="text-center">
          <div className="gradient-primary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Key className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">
            Set New Password
          </CardTitle>
          <CardDescription className="text-slate-600">
            Enter your new password to complete the reset process
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handlePasswordReset} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    disabled={isLoading}
                    className="h-12 pr-12"
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    disabled={isLoading}
                    className="h-12 pr-12"
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <div className="text-xs text-slate-500 space-y-1">
                <p>Password must:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li className={newPassword.length >= 8 ? 'text-green-600' : ''}>
                    Be at least 8 characters long
                  </li>
                  <li className={/[A-Z]/.test(newPassword) ? 'text-green-600' : ''}>
                    Contain at least one uppercase letter
                  </li>
                  <li className={/[a-z]/.test(newPassword) ? 'text-green-600' : ''}>
                    Contain at least one lowercase letter
                  </li>
                  <li className={/\d/.test(newPassword) ? 'text-green-600' : ''}>
                    Contain at least one number
                  </li>
                </ul>
              </div>
              
              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <div className="text-sm text-red-600">
                  Passwords do not match
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
              className="w-full h-12 gradient-primary text-white font-semibold"
            >
              {isLoading ? 'Updating Password...' : 'Update Password'}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                onClick={() => navigate('/auth')}
                variant="ghost"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Cancel and go back to Sign In
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
