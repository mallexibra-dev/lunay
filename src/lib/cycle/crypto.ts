/**
 * Hash PIN lokal via Web Crypto (tersedia di semua browser modern dan
 * runtime Node 18+ sehingga bisa diuji tanpa polyfill).
 */

const cryptoRef = (): Crypto => {
  const c = (globalThis as { crypto?: Crypto }).crypto;
  if (!c?.subtle) throw new Error('Web Crypto tidak tersedia di lingkungan ini');
  return c;
};

export const makeSalt = (): string => {
  const bytes = cryptoRef().getRandomValues(new Uint8Array(16));
  return btoa(String.fromCharCode(...bytes));
};

export const sha256Hex = async (input: string): Promise<string> => {
  const digest = await cryptoRef().subtle.digest(
    'SHA-256',
    new TextEncoder().encode(input)
  );
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

export const hashPin = async (pin: string, salt: string): Promise<string> =>
  sha256Hex(`${salt}:${pin}`);

export const verifyPin = async (
  pin: string,
  salt: string,
  expectedHash: string
): Promise<boolean> => {
  const actual = await hashPin(pin, salt);
  if (actual.length !== expectedHash.length) return false;
  let mismatch = 0;
  for (let i = 0; i < actual.length; i++) {
    mismatch |= actual.charCodeAt(i) ^ expectedHash.charCodeAt(i);
  }
  return mismatch === 0;
};

// ---------------------------------------------------------------------------
// WebAuthn (sidik jari / Face ID) — best-effort, hanya sebagai kunci lokal
// ---------------------------------------------------------------------------

export const isBiometricAvailable = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) return false;
  try {
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
};

const toBase64 = (buffer: ArrayBuffer): string =>
  btoa(String.fromCharCode(...new Uint8Array(buffer)));

const fromBase64 = (value: string): Uint8Array => {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

/** Daftarkan authenticator platform sebagai kunci buka aplikasi lokal. */
export const registerBiometric = async (): Promise<string> => {
  const credential = (await navigator.credentials.create({
    publicKey: {
      challenge: cryptoRef().getRandomValues(new Uint8Array(32)),
      rp: { name: 'Lunay' },
      user: {
        id: cryptoRef().getRandomValues(new Uint8Array(16)),
        name: 'lunay-local',
        displayName: 'Pemilik Lunay',
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },
        { type: 'public-key', alg: -257 },
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'preferred',
      },
      timeout: 60_000,
      attestation: 'none',
    },
  })) as PublicKeyCredential | null;

  if (!credential) throw new Error('Pendaftaran biometrik dibatalkan');
  return toBase64(credential.rawId);
};

/** Minta verifikasi biometrik untuk membuka aplikasi. */
export const verifyBiometric = async (credentialId: string): Promise<boolean> => {
  await navigator.credentials.get({
    publicKey: {
      challenge: cryptoRef().getRandomValues(new Uint8Array(32)),
      allowCredentials: [
        { id: fromBase64(credentialId) as unknown as BufferSource, type: 'public-key' },
      ],
      userVerification: 'required',
      timeout: 60_000,
    },
  });
  return true;
};
