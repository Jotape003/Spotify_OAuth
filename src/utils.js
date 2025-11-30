export function addParamToUrl(url, param, value) {
    if (url.endsWith("?")) {
        return `${url}${param}=${value}`
    } else {
        return `${url}&${param}=${value}`
    }
}

export function getRandomBytes() {
    const randomBytes = new Uint8Array(16);

    window.crypto.getRandomValues(randomBytes);

    return Array.from(randomBytes)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
}

export function generateRandomString(length) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const randomValues = new Uint32Array(length);
  window.crypto.getRandomValues(randomValues);
  return Array.from(randomValues).map(n => charset[n % charset.length]).join('');
}

export async function generateCodeChallenge(codeVerifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}