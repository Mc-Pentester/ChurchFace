/**
 * Utilitaires de chiffrement pour les données sensibles (stream keys, etc.)
 * ChurchFace V1 - Security Layer
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const TAG_POSITION = SALT_LENGTH + IV_LENGTH;
const ENCRYPTED_POSITION = TAG_POSITION + TAG_LENGTH;

/**
 * Clé de chiffrement depuis les variables d'environnement
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY || 'default-churchface-encryption-key-32-chars';
  // Utiliser SHA-256 pour garantir une clé de 32 bytes
  return crypto.createHash('sha256').update(key).digest();
}

/**
 * Chiffre une donnée sensible
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const salt = crypto.randomBytes(SALT_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  // Format: salt + iv + tag + encrypted
  return salt.toString('hex') + iv.toString('hex') + tag.toString('hex') + encrypted;
}

/**
 * Déchiffre une donnée sensible
 */
export function decrypt(ciphertext: string): string {
  try {
    const key = getEncryptionKey();
    
    const salt = Buffer.from(ciphertext.slice(0, SALT_LENGTH * 2), 'hex');
    const iv = Buffer.from(ciphertext.slice(SALT_LENGTH * 2, TAG_POSITION * 2), 'hex');
    const tag = Buffer.from(ciphertext.slice(TAG_POSITION * 2, ENCRYPTED_POSITION * 2), 'hex');
    const encrypted = ciphertext.slice(ENCRYPTED_POSITION * 2);
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Masque une stream key pour l'affichage
 * Affiche seulement les 4 derniers caractères
 */
export function maskStreamKey(streamKey: string): string {
  if (!streamKey || streamKey.length < 4) {
    return '****';
  }
  const visible = streamKey.slice(-4);
  const masked = '*'.repeat(streamKey.length - 4);
  return masked + visible;
}

/**
 * Masque une stream key chiffrée pour l'affichage
 */
export function maskEncryptedStreamKey(encryptedKey: string): string {
  try {
    const decrypted = decrypt(encryptedKey);
    return maskStreamKey(decrypted);
  } catch {
    return '****';
  }
}

/**
 * Génère une stream key aléatoire
 */
export function generateStreamKey(): string {
  return crypto.randomBytes(32).toString('hex');
}
