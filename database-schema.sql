-- Cooperative Management System Database Schema
-- Run this in your Supabase SQL editor

-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create members table
CREATE TABLE public.members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contributions table
CREATE TABLE public.contributions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    date_paid TIMESTAMP WITH TIME ZONE NOT NULL,
    recorded_by TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admins table
CREATE TABLE public.admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create member signup tokens table
CREATE TABLE public.member_signup_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin signup tokens table
CREATE TABLE public.admin_signup_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_contributions_member_id ON public.contributions(member_id);
CREATE INDEX idx_contributions_date_paid ON public.contributions(date_paid);
CREATE INDEX idx_members_email ON public.members(email);
CREATE INDEX idx_member_signup_tokens_email ON public.member_signup_tokens(email);
CREATE INDEX idx_member_signup_tokens_token ON public.member_signup_tokens(token);
CREATE INDEX idx_admin_signup_tokens_email ON public.admin_signup_tokens(email);
CREATE INDEX idx_admin_signup_tokens_token ON public.admin_signup_tokens(token);

-- Row Level Security Policies

-- Members can view their own data
CREATE POLICY "Members can view own data" ON public.members
    FOR SELECT USING (auth.email() = email);

-- Members can view their own contributions
CREATE POLICY "Members can view own contributions" ON public.contributions
    FOR SELECT USING (
        member_id IN (
            SELECT id FROM public.members WHERE email = auth.email()
        )
    );

-- Admins can view all data (we'll create a function to check admin status)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admins WHERE email = auth.email()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin policies
CREATE POLICY "Admins can view all members" ON public.members
    FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage all contributions" ON public.contributions
    FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage admin accounts" ON public.admins
    FOR ALL USING (is_admin());

-- Signup token policies - allow public access for signup process
CREATE POLICY "Public can insert member signup tokens" ON public.member_signup_tokens
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update member signup tokens" ON public.member_signup_tokens
    FOR UPDATE USING (true);

CREATE POLICY "Public can select member signup tokens" ON public.member_signup_tokens
    FOR SELECT USING (true);

CREATE POLICY "Public can insert admin signup tokens" ON public.admin_signup_tokens
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update admin signup tokens" ON public.admin_signup_tokens
    FOR UPDATE USING (true);

CREATE POLICY "Public can select admin signup tokens" ON public.admin_signup_tokens
    FOR SELECT USING (true);

-- Enable RLS
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_signup_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_signup_tokens ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for members table
CREATE TRIGGER update_members_updated_at
    BEFORE UPDATE ON public.members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create triggers for signup token tables
CREATE TRIGGER update_member_signup_tokens_updated_at
    BEFORE UPDATE ON public.member_signup_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_signup_tokens_updated_at
    BEFORE UPDATE ON public.admin_signup_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Sample data (optional - remove in production)
-- INSERT INTO public.admins (email, role, full_name) VALUES 
-- ('admin@coop.com', 'financial_secretary', 'Admin User');
