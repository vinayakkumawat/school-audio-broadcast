import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.csv');
const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Read users file
    const content = await fs.readFile(USERS_FILE, 'utf-8');
    const lines = content.split('\n').slice(1); // Skip header
    
    // Find user
    const user = lines
      .filter(line => line.trim())
      .map(line => {
        const [id, userEmail, username, hashedPassword, createdAt] = line.split(',');
        return { id, email: userEmail, username, password: hashedPassword, createdAt };
      })
      .find(u => u.email === email);

    if (!user || !await bcrypt.compare(password, user.password)) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create token
    const token = await new SignJWT({ 
      userId: user.id,
      email: user.email,
      username: user.username
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secret);

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error logging in:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}