import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import type { User } from '@/lib/types';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.csv');

export async function GET() {
  try {
    let users: User[] = [];
    try {
      const content = await fs.readFile(USERS_FILE, 'utf-8');
      const lines = content.split('\n').slice(1); // Skip header
      users = lines
        .filter(line => line.trim())
        .map(line => {
          const [id, email, username, password, createdAt] = line.split(',');
          return { id, email, username, password, createdAt };
        });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
      // If file doesn't exist, return empty array
    }

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error getting users:', error);
    return NextResponse.json(
      { error: 'Failed to get users' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { email, username, password } = await request.json();
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();
    const createdAt = new Date().toISOString();

    // Ensure directory exists
    await fs.mkdir(path.dirname(USERS_FILE), { recursive: true });

    // Create file with header if it doesn't exist
    try {
      await fs.access(USERS_FILE);
    } catch {
      await fs.writeFile(USERS_FILE, 'id,email,username,password,createdAt\n');
    }

    // Append new user
    const newLine = `${id},${email},${username},${hashedPassword},${createdAt}\n`;
    await fs.appendFile(USERS_FILE, newLine);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}