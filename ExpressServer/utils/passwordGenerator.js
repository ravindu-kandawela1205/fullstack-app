import crypto from "crypto";

/**
 * Generate a secure random password
 * @param {number} length - Password length (default: 12)
 * @returns {string} Generated password
 */
export function generateSecurePassword(length = 12) {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*";
  
  const allChars = uppercase + lowercase + numbers + symbols;
  
  let password = "";
  
  // Ensure at least one character from each category
  password += uppercase[crypto.randomInt(0, uppercase.length)];
  password += lowercase[crypto.randomInt(0, lowercase.length)];
  password += numbers[crypto.randomInt(0, numbers.length)];
  password += symbols[crypto.randomInt(0, symbols.length)];
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[crypto.randomInt(0, allChars.length)];
  }
  
  // Shuffle the password
  return password.split("").sort(() => crypto.randomInt(-1, 2)).join("");
}

/**
 * Generate a memorable password (easier to type)
 * @returns {string} Generated password
 */
export function generateMemorablePassword() {
  const words = ["Blue", "Red", "Green", "Fast", "Slow", "Happy", "Bright", "Dark", "Cool", "Warm"];
  const word1 = words[crypto.randomInt(0, words.length)];
  const word2 = words[crypto.randomInt(0, words.length)];
  const number = crypto.randomInt(100, 999);
  const symbol = ["!", "@", "#", "$", "%"][crypto.randomInt(0, 5)];
  
  return `${word1}${word2}${number}${symbol}`;
}