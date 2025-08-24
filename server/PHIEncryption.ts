import crypto from "crypto";

const ALGORITHM = "aes-256-gcm"; // we are using GCM mode
const IV_LENGTH = 16; // 128-bit IV
const KEY = crypto
  .createHash("sha256")
  .update(process.env.PHI_ENCRYPTION_KEY || "dev-secret")
  .digest();

/**
 * Encrypts plaintext into ciphertext with AES-256-GCM
 */
export function encryptText(plaintext: string): { cipher: string; iv: string; tag: string } {
  const iv = crypto.randomBytes(IV_LENGTH);

  // Cast to GCM-specific type
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv) as crypto.CipherGCM;

  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    cipher: encrypted.toString("hex"),
    iv: iv.toString("hex"),
    tag: tag.toString("hex"),
  };
}

/**
 * Decrypts AES-256-GCM ciphertext
 */
export function decryptText(cipherHex: string, ivHex: string, tagHex: string): string {
  const iv = Buffer.from(ivHex, "hex");

  // Cast to GCM-specific type
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv) as crypto.DecipherGCM;
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(cipherHex, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

