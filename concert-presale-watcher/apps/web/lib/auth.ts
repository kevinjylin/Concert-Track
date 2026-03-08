import { env } from "./env";

export const AUTH_COOKIE_NAME = "cpw_auth";

export const isAuthConfigured = (): boolean => {
  return Boolean(env.authPassword && env.authCookieValue);
};

export const verifyPassword = (password: string): boolean => {
  return isAuthConfigured() && password === env.authPassword;
};

export const verifySessionValue = (value: string | undefined): boolean => {
  return isAuthConfigured() && value === env.authCookieValue;
};
