# Quick Setup Guide

Follow these steps to get your Cooperative Management System up and running:

## 1. Environment Setup

1. **Create `.env.local` file** in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 2. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In your Supabase dashboard:
   - Go to **Settings → API**
   - Copy your **Project URL** and **anon public key**
   - Go to **Settings → API** and copy your **service_role key**
3. Go to **SQL Editor** and run the contents of `database-schema.sql`
4. Add your first admin user:
```sql
INSERT INTO public.admins (email, role, full_name) 
VALUES ('your-email@domain.com', 'financial_secretary', 'Your Name');
```

## 3. Email Setup (Resend)

1. Sign up at [resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Update the "from" email in `src/lib/email.ts` to match your domain
4. Add the API key to your `.env.local` file

## 4. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` and you're ready to go!

## 5. First Login

1. Use the admin email you added to the database
2. Go to "Admin Login"
3. Enter your email and use the magic link
4. Start adding members and recording contributions

## Deployment to Vercel

1. Push your code to GitHub
2. Connect to Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy!

## Important Notes

- Make sure to update Supabase redirect URLs after deployment
- The app uses magic links for authentication (no passwords required)
- All data is stored securely in Supabase with row-level security
- Email notifications are sent automatically when contributions are recorded

## Troubleshooting

- **Can't login**: Check if your email is in the `admins` or `members` table
- **Email not working**: Verify your Resend API key and domain settings
- **Database errors**: Ensure the schema was created correctly in Supabase
