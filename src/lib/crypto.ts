const PRIVATE_KEY_STORAGE = 'forge_private_key';

function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return btoa(String.fromCharCode(...bytes));
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

// ==================== KEY PAIR ====================

export async function generateKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
  const keyPair = await crypto.subtle.generateKey(
    { name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
    true,
    ['encrypt', 'decrypt'],
  );

  const publicKeyData = await crypto.subtle.exportKey('spki', keyPair.publicKey);
  const privateKeyData = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

  return {
    publicKey: arrayBufferToBase64(publicKeyData),
    privateKey: arrayBufferToBase64(privateKeyData),
  };
}

// ==================== LOCAL STORAGE ====================

export function savePrivateKey(key: string) {
  localStorage.setItem(PRIVATE_KEY_STORAGE, key);
}

export function getStoredPrivateKey(): string | null {
  return localStorage.getItem(PRIVATE_KEY_STORAGE);
}

// ==================== PASSWORD-BASED KEY ENCRYPTION ====================

async function deriveKeyFromPassword(password: string, salt: BufferSource): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptPrivateKeyWithPassword(privateKey: string, password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const aesKey = await deriveKeyFromPassword(password, salt);

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    new TextEncoder().encode(privateKey),
  );

  // Format: base64(salt) + '.' + base64(iv) + '.' + base64(encrypted)
  return `${arrayBufferToBase64(salt)}.${arrayBufferToBase64(iv)}.${arrayBufferToBase64(encrypted)}`;
}

export async function decryptPrivateKeyWithPassword(encryptedBundle: string, password: string): Promise<string | null> {
  try {
    const [saltB64, ivB64, encryptedB64] = encryptedBundle.split('.');
    const salt = new Uint8Array(base64ToArrayBuffer(saltB64));
    const iv = base64ToArrayBuffer(ivB64);
    const encrypted = base64ToArrayBuffer(encryptedB64);

    const aesKey = await deriveKeyFromPassword(password, salt);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      aesKey,
      encrypted,
    );

    return new TextDecoder().decode(decrypted);
  } catch {
    return null;
  }
}

// ==================== RECOVERY KEY ====================

export function generateRecoveryKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const parts: string[] = [];
  for (let p = 0; p < 4; p++) {
    let part = '';
    for (let i = 0; i < 4; i++) {
      part += chars[Math.floor(Math.random() * chars.length)];
    }
    parts.push(part);
  }
  return `FORGE-${parts.join('-')}`;
}

// ==================== MESSAGE ENCRYPTION (DUAL) ====================

export async function encryptMessageDual(
  text: string,
  receiverPublicKeyBase64: string,
  senderPublicKeyBase64: string,
): Promise<{ encryptedText: string; encryptedKeyReceiver: string; encryptedKeySender: string; iv: string }> {
  const aesKey = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt'],
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedText = new TextEncoder().encode(text);

  const encryptedContent = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    encodedText,
  );

  const rawAesKey = await crypto.subtle.exportKey('raw', aesKey);

  // Encrypt AES key for receiver
  const receiverPubKey = await crypto.subtle.importKey(
    'spki', base64ToArrayBuffer(receiverPublicKeyBase64),
    { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['encrypt'],
  );
  const encryptedForReceiver = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, receiverPubKey, rawAesKey);

  // Encrypt AES key for sender
  const senderPubKey = await crypto.subtle.importKey(
    'spki', base64ToArrayBuffer(senderPublicKeyBase64),
    { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['encrypt'],
  );
  const encryptedForSender = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, senderPubKey, rawAesKey);

  return {
    encryptedText: arrayBufferToBase64(encryptedContent),
    encryptedKeyReceiver: arrayBufferToBase64(encryptedForReceiver),
    encryptedKeySender: arrayBufferToBase64(encryptedForSender),
    iv: arrayBufferToBase64(iv),
  };
}

// Legacy single encryption (backwards compatible)
export async function encryptMessage(
  text: string,
  receiverPublicKeyBase64: string,
): Promise<{ encryptedText: string; encryptedKey: string; iv: string }> {
  const aesKey = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt'],
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encryptedContent = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, aesKey, new TextEncoder().encode(text),
  );

  const rawAesKey = await crypto.subtle.exportKey('raw', aesKey);
  const publicKey = await crypto.subtle.importKey(
    'spki', base64ToArrayBuffer(receiverPublicKeyBase64),
    { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['encrypt'],
  );
  const encryptedAesKey = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, publicKey, rawAesKey);

  return {
    encryptedText: arrayBufferToBase64(encryptedContent),
    encryptedKey: arrayBufferToBase64(encryptedAesKey),
    iv: arrayBufferToBase64(iv),
  };
}

// ==================== MESSAGE DECRYPTION ====================

export async function decryptMessage(
  encryptedText: string,
  encryptedKey: string,
  ivBase64: string,
): Promise<string> {
  const privateKeyBase64 = getStoredPrivateKey();
  if (!privateKeyBase64) return '[encrypted — key not available]';

  try {
    const privateKey = await crypto.subtle.importKey(
      'pkcs8', base64ToArrayBuffer(privateKeyBase64),
      { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['decrypt'],
    );

    const rawAesKey = await crypto.subtle.decrypt(
      { name: 'RSA-OAEP' }, privateKey, base64ToArrayBuffer(encryptedKey),
    );

    const aesKey = await crypto.subtle.importKey(
      'raw', rawAesKey, { name: 'AES-GCM' }, false, ['decrypt'],
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: base64ToArrayBuffer(ivBase64) }, aesKey, base64ToArrayBuffer(encryptedText),
    );

    return new TextDecoder().decode(decrypted);
  } catch {
    return '[unable to decrypt]';
  }
}

// Try both keys (receiver first, then sender) for dual-encrypted messages
export async function decryptMessageDual(
  encryptedText: string,
  encryptedKeyReceiver: string,
  encryptedKeySender: string | null,
  ivBase64: string,
): Promise<string> {
  // Try receiver key first
  const result = await decryptMessage(encryptedText, encryptedKeyReceiver, ivBase64);
  if (result !== '[unable to decrypt]' && result !== '[encrypted — key not available]') {
    return result;
  }

  // Try sender key
  if (encryptedKeySender) {
    return decryptMessage(encryptedText, encryptedKeySender, ivBase64);
  }

  return result;
}
