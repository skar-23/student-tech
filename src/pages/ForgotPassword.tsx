import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, Shield, Key, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { sendVerificationCode, verifyResetCode, resetPassword } from '@/lib/auth/password-reset';

type Step = 'email' | 'verification' | 'password' | 'success';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds

  // Timer for verification code expiry
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentStep === 'verification' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setCurrentStep('email');
            toast.error('Verification code expired. Please request a new one.');
            return 900;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentStep, timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await sendVerificationCode(email);
      
      if (result.success) {
        setCurrentStep('verification');
        setTimeLeft(900); // Reset timer
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await verifyResetCode(email, verificationCode);
      
      if (result.success) {
        setCurrentStep('password');
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
      const result = await resetPassword(email, verificationCode, newPassword);
      
      if (result.success) {
        setCurrentStep('success');
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Success step
  if (currentStep === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="gradient-success w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800">
              Password Reset Successful!
            </CardTitle>
            <CardDescription className="text-slate-600">
              Your password has been successfully updated.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-sm text-slate-600">
                You can now sign in with your new password.
              </p>
              
              <Button
                onClick={() => navigate('/auth')}
                className="w-full gradient-primary text-white font-semibold"
              >
                Sign In Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400/20 rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-teal-400/20 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-sky-400/20 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      <Card className="w-full max-w-md border-0 shadow-2xl bg-white/80 backdrop-blur-sm relative z-10">
        {/* Step Progress Indicator */}
        <div className="px-6 pt-6">
          <div className="flex justify-center space-x-4 mb-6">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
              currentStep === 'email' ? 'gradient-primary text-white' : 
              currentStep === 'verification' || currentStep === 'password' ? 'bg-blue-100 text-blue-600' : 
              'bg-gray-100 text-gray-400'
            }`}>
              1
            </div>
            <div className={`w-8 h-1 rounded-full mt-3.5 transition-all ${
              currentStep === 'verification' || currentStep === 'password' ? 'bg-blue-200' : 'bg-gray-200'
            }`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
              currentStep === 'verification' ? 'gradient-primary text-white' : 
              currentStep === 'password' ? 'bg-blue-100 text-blue-600' : 
              'bg-gray-100 text-gray-400'
            }`}>
              2
            </div>
            <div className={`w-8 h-1 rounded-full mt-3.5 transition-all ${
              currentStep === 'password' ? 'bg-blue-200' : 'bg-gray-200'
            }`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
              currentStep === 'password' ? 'gradient-primary text-white' : 'bg-gray-100 text-gray-400'
            }`}>
              3
            </div>
          </div>
        </div>

        {/* Step 1: Email Input */}
        {currentStep === 'email' && (
          <>
            <CardHeader className="text-center">
              <div className="gradient-primary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-800">
                Reset Your Password
              </CardTitle>
              <CardDescription className="text-slate-600">
                Enter your email address to receive a verification code
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    disabled={isLoading}
                    className="h-12"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full h-12 gradient-primary text-white font-semibold"
                >
                  {isLoading ? 'Sending Code...' : 'Send Verification Code'}
                </Button>

                <div className="text-center">
                  <Link 
                    to="/auth" 
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Sign In
                  </Link>
                </div>
              </form>
            </CardContent>
          </>
        )}

        {/* Step 2: Verification Code */}
        {currentStep === 'verification' && (
          <>
            <CardHeader className="text-center">
              <div className="gradient-primary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-800">
                Enter Verification Code
              </CardTitle>
              <CardDescription className="text-slate-600">
                We've sent a 6-digit code to {email}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleCodeVerification} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit code"
                    required
                    disabled={isLoading}
                    className="h-12 text-center text-lg font-mono tracking-widest"
                    maxLength={6}
                  />
                  <div className="text-center text-sm text-slate-500">
                    Code expires in: <span className="font-semibold text-blue-600">{formatTime(timeLeft)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || verificationCode.length !== 6}
                  className="w-full h-12 gradient-primary text-white font-semibold"
                >
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </Button>

                <div className="text-center space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleEmailSubmit}
                    disabled={isLoading}
                    className="w-full"
                  >
                    Resend Code
                  </Button>
                  
                  <button 
                    type="button"
                    onClick={() => {
                      setCurrentStep('email');
                      setVerificationCode('');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2 w-full"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Change Email
                  </button>
                </div>
              </form>
            </CardContent>
          </>
        )}

        {/* Step 3: New Password */}
        {currentStep === 'password' && (
          <>
            <CardHeader className="text-center">
              <div className="gradient-primary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Key className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-800">
                Create New Password
              </CardTitle>
              <CardDescription className="text-slate-600">
                Choose a strong password for your account
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
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                  className="w-full h-12 gradient-primary text-white font-semibold"
                >
                  {isLoading ? 'Updating Password...' : 'Update Password'}
                </Button>

                <div className="text-center">
                  <button 
                    type="button"
                    onClick={() => setCurrentStep('verification')}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2 w-full"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Verification
                  </button>
                </div>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
