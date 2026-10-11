/** Never show a completed unsubscribe when the server failed or did not confirm it. */
export async function requireUnsubscribeSuccess(response) {
  const data = await response.json();
  if (!response.ok || data?.success !== true) {
    throw new Error('Unsubscribe was not confirmed');
  }
  return data;
}
