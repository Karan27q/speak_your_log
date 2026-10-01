export async function generateFollowup(transcript) {
  const response = await fetch('/api/followup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || typeof data.question !== 'string') {
    throw new Error(data.error || "I couldn't generate the follow-up question. Try again.");
  }
  return data.question;
}
