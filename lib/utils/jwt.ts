import jwt from "jsonwebtoken";

const SECRET = process.env.NEXTAUTH_SECRET || "your-secret-key";

export function generateToken(userId: string, email: string) {
  return jwt.sign({ userId, email }, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET) as { userId: string; email: string };
  } catch (error) {
    return null;
  }
}

export function getTokenFromHeader(authHeader: string | null) {
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  return parts.length === 2 && parts[0] === "Bearer" ? parts[1] : null;
}
