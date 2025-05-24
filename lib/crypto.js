import crypto from "crypto";

// Password hashing (KEEP THIS)
export function generateSalt(length = 16) {
  return crypto.randomBytes(length);
}

export function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 32, "sha256");
}

// --- ADD THIS FOR AES ENCRYPTION/DECRYPTION ---

const AES_SECRET_KEY = process.env.AES_SECRET_KEY || "my_ultra_secret_key_32_bytes_long!!"; // 32 chars for testing
const AES_IV_LENGTH = 16;

export function encrypt(text) {
  const iv = crypto.randomBytes(AES_IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(AES_SECRET_KEY), iv);
  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");
  return iv.toString("base64") + ":" + encrypted;
}

export function decrypt(encryptedText) {
  const [ivBase64, encrypted] = encryptedText.split(":");
  const iv = Buffer.from(ivBase64, "base64");
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(AES_SECRET_KEY), iv);
  let decrypted = decipher.update(encrypted, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}