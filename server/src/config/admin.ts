import crypto from "crypto";

const DEFAULT_DEV_PASSWORD = "1234";
const isProduction = process.env.NODE_ENV === "production";

if (isProduction && !process.env.ADMIN_PASSWORD) {
  throw new Error("ADMIN_PASSWORD deve ser definida em producao.");
}

export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? DEFAULT_DEV_PASSWORD;

export const isAdminPassword = (password?: string) => password === ADMIN_PASSWORD;

const adminTokens = new Set<string>();

export const createAdminToken = () => {
  const token = crypto.randomBytes(32).toString("hex");
  adminTokens.add(token);
  return token;
};

export const isAdminToken = (token?: unknown) =>
  typeof token === "string" && adminTokens.has(token);
