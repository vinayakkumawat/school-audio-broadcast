import { promises as fs } from 'fs';
import { join } from 'path';
import bcrypt from 'bcryptjs';

export async function validateCredentials(email: string, password: string): Promise<boolean> {
  try {
    const csvPath = join(process.cwd(), 'data', 'database.csv');
    const fileContent = await fs.readFile(csvPath, 'utf-8');

    // Skip header row and split into lines
    const [, adminLine] = fileContent.split('\n');
    if (!adminLine) return false;

    const [storedEmail, hashedPassword] = adminLine.split(',');

    if (email !== storedEmail) return false;

    return bcrypt.compareSync(password, hashedPassword);
  } catch (error) {
    console.error('Error validating credentials:', error);
    return false;
  }
}