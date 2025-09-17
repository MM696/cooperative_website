// app/api/member-login/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  const result = await query('SELECT * FROM members WHERE email = $1 LIMIT 1', [email]);
  if (result.rows.length === 0) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const member = result.rows[0];

  const validPassword = await bcrypt.compare(password, member.password);
  if (!validPassword) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const jwtToken = jwt.sign(
    { id: member.id, email: member.email, name: member.name },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );

  const response = NextResponse.json({ member });
  response.cookies.set({
    name: 'member_token',
    value: jwtToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
