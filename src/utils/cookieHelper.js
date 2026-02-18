import { jwtDecode } from "jwt-decode";
import { HTTPClient } from "../services/client";

export function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}


export async function isAuthenticated() {
  try {
    await HTTPClient.get("Login/AuthCheck");
    return true;
  } catch (error) {
    return false;
  }
}

export async function getUserData() {
  try {
    const response = await HTTPClient.get("Login/user");
    return response.data;
  } catch (error) {
    return null;
  }
}
