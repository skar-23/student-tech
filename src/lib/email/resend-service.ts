import { Resend } from 'resend';

// ⚠️ SECURITY WARNING: VITE_ prefixed environment variables are exposed in client-side code!
// This makes the API key publicly visible in the browser and is NOT secure.
// 
// RECOMMENDED SOLUTIONS:
// 1. Move email sending to Supabase Edge Functions
// 2. Use Vercel/Netlify serverless functions
// 3. Implement server-side email handling
//
// For now, this works for development but should NOT be used in production!
const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

export interface SendPasswordResetEmailParams {
  to: string;
  verificationCode: string;
  expiryMinutes: number;
}

export const sendPasswordResetEmail = async ({
  to,
  verificationCode,
  expiryMinutes = 15
}: SendPasswordResetEmailParams): Promise<{ success: boolean; message: string }> => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Tech Student Hub <noreply@techstudenthub.com>',
      to: [to],
      subject: 'Password Reset - Tech Student Hub',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset - Tech Student Hub</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
              margin: 0;
              padding: 20px;
              color: #334155;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 16px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #0284c7 0%, #06d6a0 100%);
              padding: 40px 30px;
              text-align: center;
            }
            .logo {
              width: 60px;
              height: 60px;
              background: rgba(255,255,255,0.2);
              border-radius: 16px;
              margin: 0 auto 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 24px;
              color: white;
            }
            .header h1 {
              color: white;
              margin: 0;
              font-size: 24px;
              font-weight: 700;
            }
            .content {
              padding: 40px 30px;
              text-align: center;
            }
            .verification-code {
              background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
              border: 2px solid #0284c7;
              border-radius: 12px;
              padding: 24px;
              margin: 30px 0;
              font-size: 32px;
              font-weight: 700;
              letter-spacing: 8px;
              color: #0284c7;
              font-family: 'Courier New', monospace;
            }
            .warning {
              background: #fef3c7;
              border: 1px solid #fbbf24;
              border-radius: 8px;
              padding: 16px;
              margin: 20px 0;
              color: #92400e;
              font-size: 14px;
            }
            .footer {
              background: #f8fafc;
              padding: 30px;
              text-align: center;
              font-size: 14px;
              color: #64748b;
              border-top: 1px solid #e2e8f0;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #0284c7 0%, #06d6a0 100%);
              color: white;
              text-decoration: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-weight: 600;
              margin: 20px 0;
            }
            .steps {
              text-align: left;
              background: #f8fafc;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .steps ol {
              margin: 0;
              padding-left: 20px;
            }
            .steps li {
              margin: 8px 0;
              color: #475569;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">📚</div>
              <h1>Tech Student Hub</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Password Reset Request</p>
            </div>
            
            <div class="content">
              <h2 style="color: #1e293b; margin-bottom: 16px;">Reset Your Password</h2>
              <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
                We received a request to reset your password. Use the verification code below to continue:
              </p>
              
              <div class="verification-code">
                ${verificationCode}
              </div>
              
              <div class="warning">
                ⚠️ This code will expire in <strong>${expiryMinutes} minutes</strong> for security reasons.
              </div>
              
              <div class="steps">
                <h3 style="color: #1e293b; margin-top: 0;">How to use this code:</h3>
                <ol>
                  <li>Go back to the password reset page</li>
                  <li>Enter this 6-digit code: <strong>${verificationCode}</strong></li>
                  <li>Create your new secure password</li>
                  <li>Sign in with your new password</li>
                </ol>
              </div>
              
              <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
                If you didn't request this password reset, you can safely ignore this email. 
                Your password will remain unchanged.
              </p>
            </div>
            
            <div class="footer">
              <p><strong>Tech Student Hub</strong></p>
              <p>Empowering your tech learning journey</p>
              <p style="margin-top: 20px; font-size: 12px; color: #94a3b8;">
                This email was sent because you requested a password reset. 
                If you have any questions, please contact our support team.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Tech Student Hub - Password Reset

Hi there!

We received a request to reset your password. Here's your verification code:

VERIFICATION CODE: ${verificationCode}

This code will expire in ${expiryMinutes} minutes.

To reset your password:
1. Go back to the password reset page
2. Enter this code: ${verificationCode}
3. Create your new password
4. Sign in with your new credentials

If you didn't request this reset, you can safely ignore this email.

Best regards,
Tech Student Hub Team
      `
    });

    if (error) {
      console.error('❌ Resend email error:', error);
      return {
        success: false,
        message: 'Failed to send email. Please try again.'
      };
    }

    console.log('✅ Email sent successfully:', data);
    return {
      success: true,
      message: 'Password reset email sent successfully!'
    };

  } catch (error) {
    console.error('❌ Error sending email:', error);
    return {
      success: false,
      message: 'Failed to send email. Please check your connection and try again.'
    };
  }
};
