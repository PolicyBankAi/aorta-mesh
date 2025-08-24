import crypto from "crypto";

export class PHIEncryption {
  private algorithm = "aes-256-gcm";
  private key: Buffer;
  private ivLength = 16;

  constructor(secretKey?: string) {
    this.key = crypto
      .createHash("sha256")
      .update(secretKey || process.env.ENCRYPTION_KEY || "default_dev_key")
      .digest();
  }

  private encrypt(value: string): string {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return Buffer.concat([iv, authTag, encrypted]).toString("base64");
  }

  private decrypt(value: string): string {
    const buffer = Buffer.from(value, "base64");
    const iv = buffer.subarray(0, this.ivLength);
    const authTag = buffer.subarray(this.ivLength, this.ivLength + 16);
    const encrypted = buffer.subarray(this.ivLength + 16);

    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString("utf8");
  }

  // === Generic helpers ===
  encryptText(plaintext: string): string {
    return this.encrypt(plaintext);
  }

  decryptText(cipher: string): string {
    return this.decrypt(cipher);
  }

  // === Domain-specific helpers (already exist in your code) ===
  encryptSSN(plaintext: string): string {
    return this.encrypt(plaintext);
  }

  decryptSSN(cipher: string): string {
    return this.decrypt(cipher);
  }

  encryptMRN(plaintext: string): string {
    return this.encrypt(plaintext);
  }

  decryptMRN(cipher: string): string {
    return this.decrypt(cipher);
  }

  encryptDOB(plaintext: string): string {
    return this.encrypt(plaintext);
  }

  decryptDOB(cipher: string): string {
    return this.decrypt(cipher);
  }

  encryptAddress(plaintext: string): string {
    return this.encrypt(plaintext);
  }

  decryptAddress(cipher: string): string {
    return this.decrypt(cipher);
  }
}

// ✅ Export a shared instance
export const phiEncryption = new PHIEncryption();
