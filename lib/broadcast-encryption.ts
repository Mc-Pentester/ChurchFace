import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const TAG_POSITION = SALT_LENGTH + IV_LENGTH;
const ENCRYPTED_POSITION = TAG_POSITION + TAG_LENGTH;

/**
 * Derives a cryptographic key from the encryption key
 */
function getKey(
  key: string,
  salt: Buffer
): Buffer {
  return crypto.pbkdf2Sync(
    key,
    salt,
    100000,
    KEY_LENGTH,
    'sha256'
  );
}

/**
 * Encrypts sensitive data (OAuth tokens, API keys)
 */
export function encrypt(
  data: string,
  encryptionKey: string
): string {
  try {
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = getKey(encryptionKey, salt);

    const cipher = crypto.createCipheriv(
      ALGORITHM,
      key,
      iv
    );

    const encrypted = Buffer.concat([
      cipher.update(data, 'utf8'),
      cipher.final()
    ]);

    const tag = cipher.getAuthTag();

    const buffer = Buffer.concat([
      salt,
      iv,
      tag,
      encrypted
    ]);

    return buffer.toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypts sensitive data
 */
export function decrypt(
  encryptedData: string,
  encryptionKey: string
): string {
  try {
    const buffer = Buffer.from(encryptedData, 'base64');

    const salt = buffer.subarray(0, SALT_LENGTH);
    const iv = buffer.subarray(SALT_LENGTH, TAG_POSITION);
    const tag = buffer.subarray(TAG_POSITION, ENCRYPTED_POSITION);
    const encrypted = buffer.subarray(ENCRYPTED_POSITION);

    const key = getKey(encryptionKey, salt);

    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      key,
      iv
    );

    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);

    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Validates if encryption key is properly configured
 */
export function validateEncryptionKey(
  encryptionKey: string
): boolean {
  return typeof encryptionKey === 'string' &&
         encryptionKey.length >= 32;
}

/**
 * Hashes sensitive identifiers for logging/auditing
 */
export function hashIdentifier(
  identifier: string
): string {
  return crypto
    .createHash('sha256')
    .update(identifier)
    .digest('hex')
    .substring(0, 16);
}
