const PRIVATE_KEY_STORAGE = 'forge_private_key';

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

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

export function savePrivateKey(key: string) {
  localStorage.setItem(PRIVATE_KEY_STORAGE, key);
}

export function getStoredPrivateKey(): string | null {
  return localStorage.getItem(PRIVATE_KEY_STORAGE);
}

export async function encryptMessage(
  text: string,
  receiverPublicKeyBase64: string,
): Promise<{ encryptedText: string; encryptedKey: string; iv: string }> {
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

  const publicKey = await crypto.subtle.importKey(
    'spki',
    base64ToArrayBuffer(receiverPublicKeyBase64),
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt'],
  );

  const rawAesKey = await crypto.subtle.exportKey('raw', aesKey);
  const encryptedAesKey = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    rawAesKey,
  );

  return {
    encryptedText: arrayBufferToBase64(encryptedContent),
    encryptedKey: arrayBufferToBase64(encryptedAesKey),
    iv: arrayBufferToBase64(iv),
  };
}

export async function decryptMessage(
  encryptedText: string,
  encryptedKey: string,
  ivBase64: string,
): Promise<string> {
  const privateKeyBase64 = getStoredPrivateKey();
  if (!privateKeyBase64) return '[encrypted — key not available]';

  try {
    const privateKey = await crypto.subtle.importKey(
      'pkcs8',
      base64ToArrayBuffer(privateKeyBase64),
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      false,
      ['decrypt'],
    );

    const rawAesKey = await crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      privateKey,
      base64ToArrayBuffer(encryptedKey),
    );

    const aesKey = await crypto.subtle.importKey(
      'raw',
      rawAesKey,
      { name: 'AES-GCM' },
      false,
      ['decrypt'],
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: base64ToArrayBuffer(ivBase64) },
      aesKey,
      base64ToArrayBuffer(encryptedText),
    );

    return new TextDecoder().decode(decrypted);
  } catch {
    return '[unable to decrypt]';
  }
}
