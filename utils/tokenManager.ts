import CryptoJS from "crypto-js";

const SECRET_KEY = "quantify-pro-secure-secret-key-2026";
const TOKEN_KEY = "qp_access_token";
const EXPIRY_KEY = "qp_access_token_expiry";
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 10000;

export const encryptToken = (token: string): string => {
  return CryptoJS.AES.encrypt(token, SECRET_KEY).toString();
};

/**
 * Decrypts an encrypted token string back to its original value
 */
export const decryptToken = (encryptedToken: string): string | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedToken, SECRET_KEY);
    const originalToken = bytes.toString(CryptoJS.enc.Utf8);
    return originalToken || null;
  } catch (error) {
    console.error("Failed to decrypt token", error);
    return null;
  }
};

/**
 * Saves exactly one token into browser local storage encrypted.
 */
export const setToken = (token: string) => {
  if (typeof window === "undefined") return;
  const encrypted = encryptToken(token);
  localStorage.setItem(TOKEN_KEY, encrypted);

  const expiryTime = Date.now() + TWENTY_FOUR_HOURS_MS;
  localStorage.setItem(EXPIRY_KEY, expiryTime.toString());
};

/**
 * Retrieves and automatically decrypts the token from local storage
 */
export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;

  const expiryStr = localStorage.getItem(EXPIRY_KEY);
  if (expiryStr) {
    const expiryTime = parseInt(expiryStr, 10);
    if (Date.now() > expiryTime) {
      removeToken(); // Self-purge if expired
      return null;
    }
  }

  const stored = localStorage.getItem(TOKEN_KEY);
  if (!stored) return null;
  return decryptToken(stored);
};

/**
 * Clears the user's token from local storage
 */
export const removeToken = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRY_KEY);
};

/**
 * Returns the millisecond UNIX timestamp of when the token naturally expires.
 */
export const getTokenExpiryTime = (): number | null => {
  if (typeof window === "undefined") return null;
  const expiryStr = localStorage.getItem(EXPIRY_KEY);
  return expiryStr ? parseInt(expiryStr, 10) : null;
};
