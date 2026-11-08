"""
EmailGuard - Text Preprocessing Module
Implements Natural Language Processing (NLP) text cleaning, normalization,
tokenization, stopword removal, and spam-signal extraction.
"""

import re
from typing import Dict, List, Any, Set

# Comprehensive English stopwords list (avoids runtime NLTK download failures)
STOPWORDS: Set[str] = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", 
    "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", 
    "but", "by", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", 
    "doing", "don't", "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", 
    "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", 
    "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", 
    "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's", 
    "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", 
    "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", 
    "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", 
    "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", 
    "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", 
    "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", 
    "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's", 
    "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", 
    "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", 
    "yourself", "yourselves"
}

# Suspicious spam keywords and scam triggers
SPAM_TRIGGERS: List[str] = [
    "urgent", "act now", "action required", "verify your account", "account suspended",
    "password reset", "unauthorized login", "confirm your identity", "immediate response",
    "winner", "won", "congratulations", "claim your prize", "jackpot", "cash prize",
    "lottery", "sweepstakes", "gift card", "free voucher", "exclusive deal",
    "wire transfer", "unclaimed funds", "beneficiary", "inheritance", "million dollars",
    "investment opportunity", "guaranteed profit", "risk free", "double your income",
    "crypto", "bitcoin", "work from home", "earn money fast", "limited time offer",
    "click here", "click below", "special promotion", "cheap luxury", "replica"
]

# Regular expression patterns
HTML_TAG_PATTERN = re.compile(r"<[^>]+>")
URL_PATTERN = re.compile(r"https?://\S+|www\.\S+|bit\.ly/\S+|goo\.gl/\S+")
EMAIL_PATTERN = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b")
CURRENCY_PATTERN = re.compile(r"[$€£¥₹]")
PHONE_PATTERN = re.compile(r"\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b|\b0800\d{6,}\b")
EXCESSIVE_PUNCT_PATTERN = re.compile(r"(!{2,}|\?{2,})")
NON_ALPHANUMERIC_PATTERN = re.compile(r"[^a-zA-Z0-9\s]")

def simple_stem(word: str) -> str:
    """Lightweight rule-based suffix normalization."""
    word = word.lower()
    if word.endswith("sses"):
        return word[:-2]
    if word.endswith("ies"):
        return word[:-3] + "y"
    if word.endswith("ing") and len(word) > 5:
        return word[:-3]
    if word.endswith("ed") and len(word) > 4:
        return word[:-2]
    if word.endswith("ly") and len(word) > 4:
        return word[:-2]
    if word.endswith("s") and not word.endswith("ss") and len(word) > 3:
        return word[:-1]
    return word

def preprocess_text(text: str, apply_stemming: bool = True) -> str:
    """
    Cleans raw text for machine learning:
    1. HTML tag removal
    2. URL, email, and phone normalization into token signals
    3. Currency symbol normalization
    4. Casing conversion to lowercase
    5. Punctuation removal while preserving alphanumeric words
    6. Stopword filtering
    7. Word stemming
    """
    if not text or not isinstance(text, str):
        return ""

    # Preserve special high-signal spam indicators
    has_repeated_punct = bool(EXCESSIVE_PUNCT_PATTERN.search(text))
    has_currency = bool(CURRENCY_PATTERN.search(text))
    has_url = bool(URL_PATTERN.search(text))
    has_phone = bool(PHONE_PATTERN.search(text))

    # Strip HTML tags
    cleaned = HTML_TAG_PATTERN.sub(" ", text)

    # Normalize URLs, emails, phone numbers, and currency
    cleaned = URL_PATTERN.sub(" httpurltoken ", cleaned)
    cleaned = EMAIL_PATTERN.sub(" emailtoken ", cleaned)
    cleaned = PHONE_PATTERN.sub(" phonetoken ", cleaned)
    cleaned = CURRENCY_PATTERN.sub(" currencysymbol ", cleaned)

    # Convert to lowercase
    cleaned = cleaned.lower()

    # Add signal tokens if found
    if has_repeated_punct:
        cleaned += " repeatedpuncttoken"
    if has_currency and "currencysymbol" not in cleaned:
        cleaned += " currencysymbol"
    if has_url and "httpurltoken" not in cleaned:
        cleaned += " httpurltoken"
    if has_phone and "phonetoken" not in cleaned:
        cleaned += " phonetoken"

    # Remove remaining punctuation/symbols
    cleaned = NON_ALPHANUMERIC_PATTERN.sub(" ", cleaned)

    # Tokenize by whitespace
    tokens = cleaned.split()

    # Filter stopwords and short meaningless tokens
    filtered_tokens: List[str] = []
    for token in tokens:
        if token in STOPWORDS and token not in {"currencysymbol", "httpurltoken", "phonetoken", "repeatedpuncttoken"}:
            continue
        if len(token) <= 1 and token not in {"$", "£", "€"}:
            continue
        
        # Apply stemming
        if apply_stemming and not token.endswith("token") and token != "currencysymbol":
            token = simple_stem(token)
        filtered_tokens.append(token)

    return " ".join(filtered_tokens)

def extract_email_features(raw_text: str, subject: str = "") -> Dict[str, Any]:
    """
    Analyzes an email to extract structural, lexical, and spam-trigger indicators.
    Used for transparent model explainability in the UI.
    """
    full_text = f"{subject} {raw_text}".strip()
    if not full_text:
        return {
            "has_url": False,
            "has_currency": False,
            "has_phone": False,
            "caps_ratio": 0.0,
            "exclamation_count": 0,
            "suspicious_keywords": [],
            "word_count": 0
        }

    # Uppercase ratio (excluding spaces)
    alpha_chars = [c for c in full_text if c.isalpha()]
    caps_count = sum(1 for c in alpha_chars if c.isupper())
    caps_ratio = round((caps_count / len(alpha_chars)) * 100, 1) if alpha_chars else 0.0

    # Exclamations
    exclamation_count = full_text.count("!")

    # URL / Currency / Phone detection
    has_url = bool(URL_PATTERN.search(full_text))
    has_currency = bool(CURRENCY_PATTERN.search(full_text))
    has_phone = bool(PHONE_PATTERN.search(full_text))

    # Keyword matching against spam triggers
    lower_text = full_text.lower()
    detected_triggers: List[str] = []
    for trigger in SPAM_TRIGGERS:
        if trigger in lower_text:
            detected_triggers.append(trigger)

    # Word count
    words = full_text.split()

    return {
        "has_url": has_url,
        "has_currency": has_currency,
        "has_phone": has_phone,
        "caps_ratio": caps_ratio,
        "exclamation_count": exclamation_count,
        "suspicious_keywords": list(dict.fromkeys(detected_triggers)),
        "word_count": len(words)
    }
