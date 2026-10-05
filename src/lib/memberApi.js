import { authenticatedFetch } from './authenticatedFetch';
import { getApiBase } from "../config/constants";
export async function memberApi(user, path, options = {}) {
  if (!user?.id) throw new Error("Please sign in to continue.");
  const response = await authenticatedFetch(`${getApiBase()}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-user-id": user.id,
      "x-user-role": user.role || "member",
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(data.error || "Unable to save. Please try again.");
  return data;
}
