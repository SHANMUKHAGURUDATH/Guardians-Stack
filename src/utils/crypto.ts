/**
 * Cryptographic utility functions for Guardian Stack
 * Implements strict SHA-256 document integrity hashing using the standard Web Crypto API.
 */

export async function calculateSha256(fileOrBuffer: File | Blob | ArrayBuffer | string): Promise<string> {
  let arrayBuffer: ArrayBuffer;

  if (typeof fileOrBuffer === 'string') {
    const encoder = new TextEncoder();
    arrayBuffer = encoder.encode(fileOrBuffer).buffer;
  } else if (fileOrBuffer instanceof ArrayBuffer) {
    arrayBuffer = fileOrBuffer;
  } else {
    arrayBuffer = await fileOrBuffer.arrayBuffer();
  }

  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hexString = hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return hexString;
}

/**
 * Format bytes to human readable string (KB, MB)
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Mask sensitive identifiers like Aadhaar, PAN, Card or Policy numbers
 */
export function maskIdentifier(value: string, showLastCount: number = 4): string {
  if (!value) return '';
  const clean = value.trim();
  if (clean.length <= showLastCount) return clean;
  const maskedLength = clean.length - showLastCount;
  return 'X'.repeat(Math.min(maskedLength, 8)) + clean.slice(-showLastCount);
}

/**
 * Format currency in Indian Rupees or specified currency
 */
export function formatCurrency(amount: number, currency: string = 'INR'): string {
  if (amount === undefined || amount === null) return 'N/A';
  if (currency === 'INR') {
    return '₹' + amount.toLocaleString('en-IN');
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}
