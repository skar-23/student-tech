# 📚 Tech Student Hub

A comprehensive platform for tech students featuring AI-powered roadmaps, collaborative note sharing, and strategic placement preparation.

![Tech Student Hub](https://img.shields.io/badge/React-18.2.0-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-06B6D4?style=flat-square&logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat-square&logo=supabase)

## ✨ Features

### 🎨 **Nordic Cool Design**
- Beautiful ice blue, steel blue, and arctic mint color palette
- Modern gradients and smooth animations
- Clean, Scandinavian-inspired user interface
- Fully responsive design

### 🔐 **Advanced Authentication System**
- Multi-step password reset with verification codes
- Email verification via Resend integration
- Secure profile management
- Role-based access control

#### 🛠️ **Fixing Profile Email Issue**
If emails are not showing up in the profiles table:
1. Run the SQL script in Supabase SQL Editor: `database/fix_email_column.sql`
2. This will add the email column if missing, update the trigger function, and fix existing profiles

### 🚀 **Core Functionality**
- **AI-Powered Roadmaps**: Personalized learning paths
- **Note Sharing Hub**: Collaborative study materials
- **Practice Questions**: Curated question bank with solutions
- **Progress Tracking**: Comprehensive analytics and statistics
- **Credit System**: Reward-based learning engagement

### 📧 **Email System**
- Professional email templates
- Password reset verification codes
- Resend API integration
- Beautiful HTML emails with branding

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (Database, Auth, Storage)
- **Email**: Resend API
- **State Management**: TanStack Query
- **Routing**: React Router DOM
- **Animations**: Custom CSS animations with Tailwind

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Resend account (for email functionality)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vskr-23/student-technology.git
   cd student-technology
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL="your_supabase_project_url"
   VITE_SUPABASE_PUBLISHABLE_KEY="your_supabase_anon_key"
   
   # Resend Email Configuration
   VITE_RESEND_API_KEY="your_resend_api_key"
   ```

4. **Set up Supabase Database**
   
   Run the SQL scripts in the `database/` folder in your Supabase SQL Editor:
   - `password_reset_schema.sql` - Password reset system
   - `fix_profile_trigger.sql` - Profile creation fixes
   - `email_verification.sql` - Email verification functions
   
   Alternatively, you can run the fix script to update the profile trigger:
   ```bash
   npm run fix-profile-emails
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── ...
├── pages/              # Route components
├── hooks/              # Custom React hooks
├── lib/                # Utilities and services
│   ├── auth/           # Authentication logic
│   └── email/          # Email service integration
├── integrations/       # External service integrations
│   └── supabase/       # Supabase client and types
└── sections/           # Page sections

database/               # SQL scripts and database setup
├── password_reset_schema.sql
├── fix_profile_trigger.sql
└── email_verification.sql
```

## 🎨 Design System

### Color Palette (Nordic Cool)
- **Primary**: Ice Blue (#0284c7)
- **Secondary**: Steel Blue (#475569) 
- **Accent**: Arctic Mint (#06d6a0)
- **Background**: Frost White (#f8fafc)

### Typography
- **Font Family**: Inter, system fonts
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

## 🔧 Key Features Implementation

### Password Reset System
- Multi-step verification process
- 6-digit email verification codes
- 15-minute expiration for security
- Beautiful email templates
- Fallback mechanisms for development

### Profile Management
- Automatic profile creation on signup
- Email integration with auth system
- Progress tracking and statistics
- Avatar support

### Note Sharing System
- File upload and management
- Download tracking
- Subject categorization
- User contribution tracking

## 📧 Email Templates

The system includes professionally designed email templates:
- Password reset verification
- Welcome emails
- Notification emails
- Responsive HTML design
- Plain text fallbacks

## 🔐 Security Features

- Row Level Security (RLS) policies
- Email verification for password resets
- Secure token handling
- Rate limiting protection
- Input validation and sanitization

## 🌐 Deployment

### 🚨 Security Notice
**IMPORTANT**: The current implementation exposes the Resend API key in client-side code, which is not secure for production. See security recommendations below.

### GitHub Pages (Current Setup)
Your repository is already configured for GitHub Pages deployment with automatic builds.

**Current Status**: ✅ Ready to deploy

**What's already set up:**
- GitHub Actions workflow (`.github/workflows/deploy.yml`)
- Automatic building on push to `main` branch
- Environment variables integration

### Step-by-Step Deployment Process

#### 1. Set up GitHub Secrets
Go to your repository settings → Secrets and Variables → Actions, and add:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Your Supabase public key
- `VITE_RESEND_API_KEY`: Your Resend API key

#### 2. Merge Your Changes to Main Branch
Since you're currently on a feature branch, follow these exact steps:

```bash
# 1. Switch to main branch
git checkout main

# 2. Pull latest changes
git pull origin main

# 3. Merge your feature branch
git merge copilot/fix-08d19295-8934-42da-b328-85a8d87acb66

# 4. Push to main (this will trigger deployment)
git push origin main
```

#### 3. Enable GitHub Pages
1. Go to your repository → Settings → Pages
2. Under "Source", select "GitHub Actions"
3. Your site will be deployed automatically

#### 4. Monitor Deployment
- Check the Actions tab for deployment progress
- Your site will be available at: `https://skar-23.github.io/student-tech/`

### Alternative Deployment Options

#### Vercel (Recommended for Security)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_RESEND_API_KEY`
3. Deploy automatically on push to main branch

#### Netlify
1. Build command: `npm run build`
2. Publish directory: `dist`
3. Add environment variables in Netlify dashboard

### 🔐 Security Recommendations

#### Current Security Issue
The Resend API key is currently exposed in client-side code because of the `VITE_` prefix. This means anyone can view your API key in the browser's developer tools.

#### Recommended Solutions (Choose One)

**Option 1: Supabase Edge Functions (Recommended)**
```sql
-- Create an edge function for secure email sending
CREATE OR REPLACE FUNCTION send_password_reset_email(email TEXT, code TEXT)
RETURNS JSON AS $$
-- Move email logic to server-side
$$ LANGUAGE plpgsql;
```

**Option 2: Vercel Serverless Functions**
Create `/api/send-email.ts` for secure email handling.

**Option 3: Netlify Functions**
Create `/netlify/functions/send-email.ts` for secure email handling.

#### Immediate Security Steps
1. ✅ Rotate your Resend API key after deployment
2. ✅ Monitor API usage in Resend dashboard
3. ✅ Implement rate limiting
4. 🔄 Plan migration to server-side email sending

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for backend infrastructure
- [Resend](https://resend.com) for email delivery
- [Tailwind CSS](https://tailwindcss.com) for styling
- [shadcn/ui](https://ui.shadcn.com) for components
- [Lucide](https://lucide.dev) for icons

## 📞 Support

If you have any questions or need help with setup, please open an issue or contact the maintainers.

---

**Made with ❤️ for tech students everywhere**
