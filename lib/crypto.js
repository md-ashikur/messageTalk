import crypto from "crypto";

// Password hashing (keep as-is)
export function generateSalt(length = 16) {
  return crypto.randomBytes(length);
}
export function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 32, "sha256");
}

// AES message encryption/decryption
const AES_SECRET_KEY = process.env.AES_SECRET_KEY; // 32 chars for AES-256
const AES_IV_LENGTH = 16;

console.log("AES_SECRET_KEY length:", AES_SECRET_KEY.length);
/**
 * Encrypt a message with AES-256-CBC.
 * Returns base64 string: <iv_base64>:<ciphertext_base64>
 */
export function encrypt(text) {
  const iv = crypto.randomBytes(AES_IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(AES_SECRET_KEY), iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  return iv.toString("base64") + ":" + encrypted.toString("base64");
}

/**
 * Decrypt a message encrypted by the above function.
 */
export function decrypt(encryptedText) {
  if (typeof encryptedText !== "string" || !encryptedText.includes(":")) return encryptedText;
  const [ivBase64, encryptedBase64] = encryptedText.split(":");
  const iv = Buffer.from(ivBase64, "base64");
  const encrypted = Buffer.from(encryptedBase64, "base64");
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(AES_SECRET_KEY), iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}