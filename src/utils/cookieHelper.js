import { HTTPClient } from "../services/client";

export async function getUserData() {
  try {
    const response = await HTTPClient.get("Login/user");
    return response.data;
  } catch (error) {
    return null;
  }
}
