# Secure Email Service Implementation Guide

## Overview
This guide explains how to implement a secure email service for password reset functionality without exposing API keys to the client-side.

## Security Issue Fixed
- **Previous**: API key exposed via `VITE_RESEND_API_KEY` environment variable (client-side accessible)
- **Fixed**: API key stored securely on server-side, accessed only by backend services

## Implementation Options

### Option 1: Backend API Endpoint (Recommended)
Create a backend API endpoint that handles email sending:

```javascript
// Backend API endpoint (e.g., /api/send-password-reset-email)
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY); // Server-side only

export async function POST(request) {
  const { to, verificationCode, expiryMinutes } = await request.json();
  
  // Add authentication/validation here
  
  const { data, error } = await resend.emails.send({
    from: 'Tech Student Hub <noreply@techstudenthub.com>',
    to: [to],
    subject: 'Password Reset - Tech Student Hub',
    // ... email template
  });
  
  return Response.json({ 
    success: !error, 
    message: error ? 'Failed to send email' : 'Email sent successfully'
  });
}
```

### Option 2: Supabase Edge Functions
Use Supabase Edge Functions for serverless email handling:

```javascript
// supabase/functions/send-password-reset/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { to, verificationCode, expiryMinutes } = await req.json()
  
  // Use Deno.env.get('RESEND_API_KEY') here
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  })
})
```

### Option 3: Current Implementation (Development)
For development/testing, we've implemented a secure wrapper that simulates email sending without exposing keys.

## Environment Variables Setup

### Server-side (.env or production environment)
```bash
RESEND_API_KEY=re_QRpM9neo_9QsqZyVH1pnvZzdVGEoDWjs3
```

### Client-side (Only public Supabase configs)
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-public-key
```

## Client-side Usage
```typescript
import { sendPasswordResetEmailSecure } from '@/lib/email/email-api';

// This function now calls your secure backend instead of exposing the API key
const result = await sendPasswordResetEmailSecure({
  to: email,
  verificationCode: code,
  expiryMinutes: 15
});
```

## Migration Steps
1. ✅ Remove `VITE_RESEND_API_KEY` from client-side environment variables
2. ✅ Store `RESEND_API_KEY` securely on server-side
3. ✅ Create secure email API wrapper
4. ✅ Update password reset to use secure service
5. 🔄 Implement backend API endpoint (when ready for production)

## Security Benefits
- API keys no longer exposed in client-side bundle
- Centralized email sending logic
- Better rate limiting and monitoring capabilities
- Easier to rotate API keys without client updates