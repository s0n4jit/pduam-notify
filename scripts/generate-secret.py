import secrets
import string

def generate_api_secret(length_bytes: int = 64) -> str:
    """
    Generates a cryptographically secure, high-entropy API secret token
    using the Python 'secrets' module. This is secure against guessing
    and brute-force attacks.
    
    By default, it generates 64 bytes of random data, which translates
    to 88 characters when URL-safe Base64 encoded.
    """
    # secrets.token_urlsafe generates a random URL-safe text string.
    # The number of random bytes is specified by length_bytes.
    return secrets.token_urlsafe(length_bytes)

if __name__ == "__main__":
    secret = generate_api_secret()
    print("=" * 70)
    print("      CRYPTOGRAPHICALLY SECURE API SECRET GENERATOR")
    print("=" * 70)
    print(f"Generated Secret:\n{secret}\n")
    print(f"Length: {len(secret)} characters")
    print("Entropy Source: OS-provided cryptographic RNG (urandom)")
    print("-" * 70)
    print("Tip: Add this value as API_SECRET_KEY in your .env and Cloudflare secrets.")
    print("=" * 70)
