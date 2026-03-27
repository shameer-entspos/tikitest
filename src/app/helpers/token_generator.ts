import crypto from "crypto";

const SECRET_KEY = process.env.SECRET_KEY || "your-secure-secret-key"; // Use an environment variable in production

// Function to generate a secure, tamper-proof token
export function generateSecureToken(data: object): string {
  const payload = Buffer.from(JSON.stringify(data)).toString("base64"); // Encode data to base64
  const hmac = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(payload)
    .digest("hex"); // Create a signature
  return `${payload}.${hmac}`; // Return the token as "payload.signature"
}

// Function to validate and decode the secure token
export function validateSecureToken(
  token: string
): { [key: string]: any } | null {
  if (!token || typeof token !== "string") {
    throw new Error("Invalid token: Token must be a non-empty string.");
  }

  const [payload, signature] = token.split(".");
  if (!payload || !signature) {
    throw new Error("Invalid token format: Missing payload or signature.");
  }

  const expectedSignature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(payload)
    .digest("hex");

  if (signature !== expectedSignature) {
    throw new Error("Invalid token: Signature does not match.");
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(payload, "base64").toString("utf-8")
    );
    return decoded;
  } catch (error) {
    throw new Error("Invalid token: Unable to decode payload.");
  }
}
