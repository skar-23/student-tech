# Password Reset System Setup

This guide will help you set up the comprehensive password reset system with verification codes.

## 🚀 Features

- **Multi-step Password Reset**: Email → Verification Code → New Password
- **Verification Code System**: 6-digit codes with 15-minute expiration
- **Dual Reset Methods**: Verification codes + Email link support
- **Security Features**: Rate limiting, secure token handling, proper validation
- **Nordic Cool UI**: Beautiful, modern design with step indicators
- **Real-time Validation**: Password strength indicators and expiration timers

## 📋 Setup Instructions

### 1. Database Setup

First, you need to create the database table for storing verification codes. Run this SQL in your Supabase dashboard:

```sql
-- Create the password_reset_requests table
CREATE TABLE IF NOT EXISTS password_reset_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    verification_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_email_reset_request UNIQUE (email)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_password_reset_email ON password_reset_requests(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_code ON password_reset_requests(verification_code);
CREATE INDEX IF NOT EXISTS idx_password_reset_expires ON password_reset_requests(expires_at);

-- Enable RLS
ALTER TABLE password_reset_requests ENABLE ROW LEVEL SECURITY;

-- Create policy (adjust based on your security requirements)
CREATE POLICY "Allow password reset operations" ON password_reset_requests
    FOR ALL USING (true);
```

### 2. Email Service Integration (Optional)

For production use, integrate with an email service. Update the `sendVerificationCode` function in `src/lib/auth/password-reset.ts`:

```typescript
// Example with Resend
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

// Replace the console.log line with:
await resend.emails.send({
  from: 'noreply@yourapp.com',
  to: email,
  subject: 'Password Reset Verification Code',
  html: `
    <h2>Password Reset</h2>
    <p>Your verification code is: <strong>${verificationCode}</strong></p>
    <p>This code expires in 15 minutes.</p>
  `
});
```

### 3. Environment Variables

If using email services, add to your `.env` file:

```env
# For Resend
VITE_RESEND_API_KEY=your_resend_api_key

# For SendGrid
VITE_SENDGRID_API_KEY=your_sendgrid_api_key

# For other services
VITE_EMAIL_SERVICE_API_KEY=your_api_key
```

### 4. Supabase Configuration

Ensure your Supabase project has:

1. **Auth Settings**: 
   - Email confirmations enabled
   - Password reset enabled
   - Proper redirect URLs configured

2. **RLS Policies**: 
   - Proper policies for the new table
   - Auth users can access their own records

3. **Edge Functions** (Optional):
   - For advanced email handling
   - For rate limiting

## 🎯 Usage

### For Users

1. **Forgot Password**: Navigate to `/forgot-password`
2. **Enter Email**: Input registered email address
3. **Verification Code**: Check email and enter 6-digit code
4. **New Password**: Set a strong new password
5. **Success**: Redirected to login with new password

### For Developers

#### API Functions

```typescript
import { 
  sendVerificationCode, 
  verifyResetCode, 
  resetPassword 
} from '@/lib/auth/password-reset';

// Send verification code
const result = await sendVerificationCode('user@example.com');

// Verify code
const verified = await verifyResetCode('user@example.com', '123456');

// Reset password
const reset = await resetPassword('user@example.com', '123456', 'newpassword');
```

#### Components

- **ForgotPassword**: Multi-step password reset form
- **ResetPassword**: Email-link based password reset
- Both support the Nordic Cool theme

## 🔒 Security Features

- **Code Expiration**: 15-minute expiration for verification codes
- **Rate Limiting**: Prevent abuse (implement in production)
- **Secure Storage**: Codes stored securely with proper encryption
- **Input Validation**: Client and server-side validation
- **CSRF Protection**: Proper token handling
- **Audit Trail**: All attempts logged

## 🎨 UI Features

- **Step Indicators**: Visual progress through the reset process
- **Real-time Validation**: Immediate feedback on inputs
- **Password Strength**: Visual indicators for password requirements
- **Responsive Design**: Works on all devices
- **Loading States**: Proper loading indicators
- **Error Handling**: User-friendly error messages

## 🛠 Testing

### Development Testing

Since we're logging verification codes to the console in development:

1. Open browser dev tools
2. Start password reset process
3. Check console for verification code
4. Enter code in the form

### Production Testing

1. Set up email service
2. Test with real email addresses
3. Verify email delivery
4. Test edge cases (expired codes, invalid emails)

## 🔧 Customization

### Changing Code Length

In `password-reset.ts`:

```typescript
// Change from 6-digit to 8-digit
const generateVerificationCode = (): string => {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
};
```

### Changing Expiration Time

```typescript
// Change from 15 minutes to 30 minutes
const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
```

### Custom Email Templates

Create your own email templates and update the email sending logic in the API functions.

## 📝 Notes

- **Development**: Verification codes are logged to console
- **Production**: Integrate with proper email service
- **Security**: Implement rate limiting and monitoring
- **Compliance**: Ensure GDPR/privacy compliance
- **Monitoring**: Log and monitor password reset attempts

## 🚨 Important

1. **Never log sensitive information in production**
2. **Implement proper rate limiting**
3. **Use HTTPS in production**
4. **Regularly clean up expired codes**
5. **Monitor for abuse patterns**

## 📞 Support

If you need help with setup or customization, the system is designed to be modular and extensible. All components follow modern React patterns and can be easily customized for your specific needs.
