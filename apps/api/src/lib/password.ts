import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

// scrypt settings. They make each password guess deliberately slow and memory-hungry,
// so an attacker with a stolen database can only try a few guesses per second.
const N = 2 ** 17; // cost: how much work each hash takes
const r = 8; // block size
const p = 1; // parallelization
const KEY_LENGTH = 64;
const MAX_MEMORY = 256 * 1024 * 1024; // these settings need about 128 MB per hash

function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, { N, r, p, maxmem: MAX_MEMORY }, (err, key) =>
      err ? reject(err) : resolve(key),
    );
  });
}

// Returns something like "scrypt$<salt>$<hash>", which is what we store
export async function hashPassword(password: string): Promise<string> {
  // A random "salt" makes every hash unique, even for two users with the same password
  const salt = randomBytes(16);
  const key = await deriveKey(password, salt);
  return `scrypt$${salt.toString('base64')}$${key.toString('base64')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algorithm, saltB64, keyB64] = stored.split('$');
  if (algorithm !== 'scrypt' || !saltB64 || !keyB64) return false;

  const expected = Buffer.from(keyB64, 'base64');
  const actual = await deriveKey(password, Buffer.from(saltB64, 'base64'));

  // timingSafeEqual compares in constant time, so the comparison speed
  // never hints at how much of the password was right
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
