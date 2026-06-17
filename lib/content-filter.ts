const BANNED_WORDS = [
  // Insults in French
  "connard",
  "con",
  "salope",
  "pute",
  "enculé",
  "encule",
  "fdp",
  "fils de pute",
  "ntm",
  "nique ta mère",
  "bâtard",
  "merde",
  "chier",
  "putain",
  "bouffon",
  "idiot",
  "imbécile",
  "crétin",
  "connerie",
  "salaud",
  "enfoiré",
  "enfoire",
  "trou du cul",
  "cul",
  
  // Insults in English
  "fuck",
  "shit",
  "asshole",
  "bitch",
  "bastard",
  "cunt",
  "dick",
  "whore",
  "slut",
  "idiot",
  "stupid",
  "dumbass",
  "douchebag",
  "jackass",
  "motherfucker",
  "son of a bitch",
  
  // Pornographic terms (basic)
  "porn",
  "porno",
  "xxx",
  "sex",
  "nude",
  "naked",
  
  // Hate speech terms
  "nazi",
  "hitler",
  "racist",
  "terrorism",
  "terrorist",
  "kill",
  "murder",
  "death",
  "suicide",
];

const SPAM_PATTERNS = [
  /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, // Phone numbers
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email addresses
  /(http|https):\/\/[^\s]+/gi, // URLs
  /\$\d+/g, // Money amounts
  /(buy|sell|free|discount|offer|deal|win|prize|lottery|casino)/gi, // Spam keywords
];

export function containsBannedWord(content: string): boolean {
  const lowerContent = content.toLowerCase();
  return BANNED_WORDS.some(word => lowerContent.includes(word));
}

export function containsSpamPattern(content: string): boolean {
  return SPAM_PATTERNS.some(pattern => pattern.test(content));
}

export function isContentInappropriate(content: string): boolean {
  return containsBannedWord(content) || containsSpamPattern(content);
}

export function filterContent(content: string): string {
  let filtered = content;
  
  // Filter banned words
  BANNED_WORDS.forEach(word => {
    const regex = new RegExp(word, "gi");
    filtered = filtered.replace(regex, "*".repeat(word.length));
  });
  
  // Remove spam patterns
  SPAM_PATTERNS.forEach(pattern => {
    filtered = filtered.replace(pattern, "[REDACTED]");
  });
  
  return filtered;
}
