function base64urlToBuffer(value: string): ArrayBuffer {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  const binary = window.atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function bufferToBase64url(buffer: ArrayBuffer | null): string | null {
  if (!buffer) return null;
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function ensureWebAuthnSupport() {
  if (!window.PublicKeyCredential || !navigator.credentials) {
    throw new Error('Trình duyệt hoặc thiết bị chưa hỗ trợ vân tay/Passkey.');
  }
}

export async function createFingerprintCredential(options: any) {
  ensureWebAuthnSupport();
  const publicKey: PublicKeyCredentialCreationOptions = {
    ...options,
    challenge: base64urlToBuffer(options.challenge),
    user: {
      ...options.user,
      id: base64urlToBuffer(options.user.id)
    },
    excludeCredentials: (options.excludeCredentials || []).map((credential: any) => ({
      ...credential,
      id: base64urlToBuffer(credential.id)
    }))
  };
  const credential = await navigator.credentials.create({ publicKey }) as PublicKeyCredential | null;
  if (!credential) throw new Error('Không nhận được phản hồi từ thiết bị vân tay.');
  const response = credential.response as AuthenticatorAttestationResponse;
  return {
    id: credential.id,
    rawId: bufferToBase64url(credential.rawId),
    type: credential.type,
    transports: typeof response.getTransports === 'function' ? response.getTransports() : [],
    response: {
      clientDataJSON: bufferToBase64url(response.clientDataJSON),
      attestationObject: bufferToBase64url(response.attestationObject)
    }
  };
}

export async function getFingerprintAssertion(options: any) {
  ensureWebAuthnSupport();
  const publicKey: PublicKeyCredentialRequestOptions = {
    ...options,
    challenge: base64urlToBuffer(options.challenge),
    allowCredentials: (options.allowCredentials || []).map((credential: any) => ({
      ...credential,
      id: base64urlToBuffer(credential.id)
    }))
  };
  const credential = await navigator.credentials.get({ publicKey }) as PublicKeyCredential | null;
  if (!credential) throw new Error('Không nhận được phản hồi từ thiết bị vân tay.');
  const response = credential.response as AuthenticatorAssertionResponse;
  return {
    id: credential.id,
    rawId: bufferToBase64url(credential.rawId),
    type: credential.type,
    response: {
      clientDataJSON: bufferToBase64url(response.clientDataJSON),
      authenticatorData: bufferToBase64url(response.authenticatorData),
      signature: bufferToBase64url(response.signature),
      userHandle: bufferToBase64url(response.userHandle)
    }
  };
}

export function isWebAuthnAvailable() {
  return !!(window.PublicKeyCredential && navigator.credentials);
}
