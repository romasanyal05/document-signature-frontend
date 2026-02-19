const API_URL = import.meta.env.VITE_API_URL;

export async function inviteSignerAPI(
  fileId: string,
  signerEmail: string
) {
  const res = await fetch(`${API_URL}/api/invite-signer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileId,
      signerEmail,
    }),
  });

  if (!res.ok) {
    let message = "Failed to invite signer";
    try {
      const err = await res.json();
      message = err.error || message;
    } catch (_) {}
    throw new Error(message);
  }

  return await res.json();
}