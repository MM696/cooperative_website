# Cooperative Management System

A comprehensive web application for managing cooperative members, contributions, and administrative tasks. Built with Next.js 14, Supabase, and Tailwind CSS.

## Features

### 🏠 Home Page
- Clean landing page with cooperative branding
- Clear navigation to member and admin portals
- Feature highlights and call-to-action buttons

### 👥 Member Portal
- **Member Login**: Email-based authentication with magic links
- **Dashboard**: View contribution history, totals, and profile information
- **Profile Management**: Update personal information

### 🛡️ Admin Portal
- **Admin Login**: Secure authentication with role-based access
- **Member Management**: Add, edit, and delete members
- **Contribution Recording**: Track member payments and contributions
- **Reports**: Export member data and contribution reports to CSV
- **Dashboard**: Overview of key metrics and quick actions

### 📧 Email Notifications
- Automatic email notifications when contributions are recorded
- Professional email templates with contribution details
- Powered by Resend for reliable delivery

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Email**: Resend
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## Database Schema

The application uses three main tables:

### Members Table
```sql
- id (UUID, Primary Key)
- full_name (Text)
- email (Text, Unique)
- phone (Text)
- created_at (Timestamp)
- updated_at (Timestamp)
```

### Contributions Table
```sql
- id (UUID, Primary Key)
- member_id (UUID, Foreign Key → members.id)
- amount (Numeric)
- date_paid (Timestamp)
- recorded_by (Text)
- notes (Text)
- created_at (Timestamp)
```

### Admins Table
```sql
- id (UUID, Primary Key)
- email (Text, Unique)
- role (Text)
- full_name (Text)
- created_at (Timestamp)
```

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd krea-ui
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings → API to get your project URL and anon key
3. Run the SQL schema from `database-schema.sql` in the Supabase SQL editor
4. Create your first admin user:
   ```sql
   INSERT INTO public.admins (email, role, full_name) 
   VALUES ('your-admin@email.com', 'financial_secretary', 'Admin User');
   ```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Resend Email Configuration
RESEND_API_KEY=your_resend_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set up Email Service (Resend)

1. Sign up at [resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Add it to your `.env.local` file
4. Update the "from" email address in `src/lib/email.ts` to match your domain

### 5. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in the Vercel dashboard
4. Deploy!

### Update Supabase Settings

After deployment, update your Supabase project settings:
1. Go to Authentication → URL Configuration
2. Add your production URL to "Site URL"
3. Add your production callback URL to "Redirect URLs"

## Usage

### For Members
1. Visit the home page
2. Click "Member Login"
3. Enter your email address
4. Check your email for the magic link
5. Click the link to access your dashboard

### For Admins
1. Visit the home page
2. Click "Admin Login"
3. Enter your admin email
4. Use magic link or password authentication
5. Access the full administrative dashboard

### Admin Features
- **Add Members**: Use the "Add Member" button to register new cooperative members
- **Record Contributions**: Track member payments with date, amount, and notes
- **View Reports**: Export member data and contribution history to CSV
- **Manage Data**: Edit or delete members and contributions as needed

## Security Features

- Row Level Security (RLS) enabled on all tables
- Role-based access control
- Admin-only access to sensitive operations
- Secure authentication with Supabase Auth
- Environment variable protection

## Free Tier Limits

- **Supabase**: 500MB database, 50k monthly requests
- **Vercel**: Unlimited deployments, 100GB bandwidth
- **Resend**: 3,000 emails per month

## Support

For issues or questions:
1. Check the console for error messages
2. Verify your environment variables are set correctly
3. Ensure your Supabase database schema is properly set up
4. Check that your admin email is added to the admins table

## License

This project is open source and available under the MIT License.