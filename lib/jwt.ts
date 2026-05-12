import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET!;

export interface JWTPayload {
  id: string;
  codename: string;
  email: string;
}

export const signToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, SECRET) as JWTPayload;
  } catch {
    return null;
  }
};