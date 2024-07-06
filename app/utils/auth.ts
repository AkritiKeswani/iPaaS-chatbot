import { readFileSync } from 'fs';
import { join } from 'path';
import * as jose from 'jose';

// In production, use environment variables instead of reading from a file
const privateKeyPath = join(process.cwd(), 'paragon_signing_key_4045e1de-5c1f-46e9-9a2c-27da2c7d9568.txt');
const privateKey = readFileSync(privateKeyPath, 'utf8');

export async function generateToken(userId: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  const alg = 'RS256';
  const privateJwk = await jose.importPKCS8(privateKey, alg);

  const jwt = await new jose.SignJWT({ sub: userId })
    .setProtectedHeader({ alg })
    .setIssuedAt(now)
    .setExpirationTime(now + 3600) // 1 hour from now
    .sign(privateJwk);

  return jwt;
}