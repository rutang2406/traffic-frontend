import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USERS_FILE = path.join(__dirname, '../data/users.txt');

// Simple hash function for passwords (in production, use bcrypt)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'pravah_salt_2025').digest('hex');
}

// Ensure users file exists
async function ensureUsersFile() {
  try {
    await fs.access(USERS_FILE);
  } catch (error) {
    await fs.writeFile(USERS_FILE, '# User Data Storage\n# Format: email|hashedPassword|name|createdAt\n');
  }
}

// Read all users from file
async function readUsers() {
  await ensureUsersFile();
  const data = await fs.readFile(USERS_FILE, 'utf-8');
  const lines = data.split('\n').filter(line => line && !line.startsWith('#'));
  
  return lines.map(line => {
    const [email, hashedPassword, name, createdAt] = line.split('|');
    return { email, hashedPassword, name, createdAt };
  });
}

// Add a new user
export async function addUser(email, password, name) {
  const users = await readUsers();
  
  // Check if user already exists
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    throw new Error('User already exists');
  }
  
  const hashedPassword = hashPassword(password);
  const createdAt = new Date().toISOString();
  const userLine = `${email}|${hashedPassword}|${name}|${createdAt}\n`;
  
  await fs.appendFile(USERS_FILE, userLine);
  
  return { email, name, createdAt };
}

// Verify user credentials
export async function verifyUser(email, password) {
  const users = await readUsers();
  const hashedPassword = hashPassword(password);
  
  const user = users.find(user => 
    user.email === email && user.hashedPassword === hashedPassword
  );
  
  if (user) {
    return { email: user.email, name: user.name };
  }
  
  return null;
}
