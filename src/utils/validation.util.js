// Full text validation
const validateText = (text) => {
  const dangerousSymbolsRegex =
    /[\u200c\u200d\u2060\u2063\u2064\u2066\u2067\u2068\u2069\u206a\u206b\u206c\u206d\u206e\u206f\u2800\u2000-\u200f\u2028\u2029\u202a-\u202f\u205f\u3000\u180e\ufeff\u061c\u06dd\u070f\u08e2\u1680\u180b-\u180d\u200a-\u200e\u2028\u2029\u202a-\u202e\u2060-\u2064\u2066-\u206f\u3000\ufeff\u00ad\u180b-\u180e\u200b-\u200f\u202a-\u202e\u2060-\u206f\u180e-\u180f\u200b-\u200f\u202a-\u202e\u2060-\u206f\u3164\u2000-\u200f\u202a-\u202e\u2060-\u206f]/;
  if (dangerousSymbolsRegex.test(text)) {
    return false;
  }
  const emojiRegex =
    /[\u2600-\u27FF]|[\uD83C-\uDBFF\uDC00-\uDFFF]|[\uD800-\uDB7F]/;
  if (emojiRegex.test(text)) {
    return false;
  }
  const numbersRegex = /\d/;
  if (numbersRegex.test(text)) {
    return false;
  }
  const forbiddenSymbolsRegex = /[\/\-_=+\[\]\(\)\\|]/;
  if (forbiddenSymbolsRegex.test(text)) {
    return false;
  }
  const trimmedText = text.trim();
  return trimmedText.length > 0;
};

// Has two words in string validation
const hasTwoWords = (text) => {
  const words = text.trim().split(" ");
  return words.length == 2;
};

// E-mail validation
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation
const isValidPhoneNumber = (phoneNumber) => {
  const phoneNumberRegex = /^(\+7|8)\d{10}$/;
  return phoneNumberRegex.test(phoneNumber);
};

// Censor validation
const hasCensorship = (text) => {
  const forbiddenWords = [
    "блять",
    "блядь",
    "бля",
    "блядина",
    "блядство",
    "ебать",
    "ебаный",
    "ебанутый",
    "ебнутая",
    "ебарь",
    "еблан",
    "ебантяй",
    "распиздяй",
    "сука",
    "нахуй",
    "хуй",
    "пизда",
    "уебок",
    "пиздатый",
    "пиздатая",
  ];
  const lowercaseText = text.toLowerCase();
  return forbiddenWords.some((word) => lowercaseText.includes(word));
};

// Length validation
const isMinLengthValid = (text, minLength) => {
  return text.length >= minLength;
};
const isMaxLengthValid = (text, maxLength) => {
  return text.length <= maxLength;
};

module.exports = {
  validateText,
  hasTwoWords,
  isValidEmail,
  isValidPhoneNumber,
  hasCensorship,
  isMinLengthValid,
  isMaxLengthValid,
};
