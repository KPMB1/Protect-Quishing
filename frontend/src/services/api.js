const API_BASE = '/api';

/**
 * Upload a QR code image to the backend for decoding and phishing analysis.
 * @param {File} file
 * @returns {Promise<Object>}
 */
export async function scanQrFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/scan-file`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || `Upload failed with status: ${response.status}`);
  }

  return data;
}

/**
 * Send an extracted URL directly to the backend for phishing risk analysis.
 * @param {string} url
 * @param {string} [thumbnailBase64]
 * @returns {Promise<Object>}
 */
export async function analyzeUrl(url, thumbnailBase64 = null) {
  const response = await fetch(`${API_BASE}/analyze-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url, thumbnail_base64: thumbnailBase64 }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || `Analysis failed with status: ${response.status}`);
  }

  return data;
}

/**
 * Check backend health status.
 * @returns {Promise<Object>}
 */
export async function getSystemHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) return { status: 'down' };
    return await res.json();
  } catch (err) {
    return { status: 'offline', error: err.message };
  }
}
