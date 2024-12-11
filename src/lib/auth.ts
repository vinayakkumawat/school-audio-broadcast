import { promises as fs } from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { execSync } from 'child_process';

export type AdminCredentials = {
  email: string;
  password: string;
};

export async function validateCredentials(email: string, password: string): Promise<boolean> {
  try {
    const csvPath = path.join(process.cwd(), 'data', 'database.csv');
    
    try {
      const fileContent = await fs.readFile(csvPath, 'utf-8');
      
      // Skip header row and split into lines
      const [, adminLine] = fileContent.split('\n');
      if (!adminLine) return false;
      
      const [storedEmail, hashedPassword] = adminLine.split(',');
      
      if (email !== storedEmail) return false;
      
      return bcrypt.compareSync(password, hashedPassword);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // Database file is missing, run setup script
        console.log('Database file not found. Running setup script...');
        execSync('npm run setup', { stdio: 'inherit' });
        
        // Retry validation with newly created database
        const fileContent = await fs.readFile(csvPath, 'utf-8');
        const [, adminLine] = fileContent.split('\n');
        if (!adminLine) return false;
        
        const [storedEmail, hashedPassword] = adminLine.split(',');
        
        if (email !== storedEmail) return false;
        
        return bcrypt.compareSync(password, hashedPassword);
      }
      throw error;
    }
  } catch (error) {
    console.error('Error validating credentials:', error);
    return false;
  }
}