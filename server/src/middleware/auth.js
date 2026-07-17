import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export function createToken(user) {
  return jwt.sign({ sub: user._id.toString(), email: user.email }, config.jwtSecret, {
    expiresIn: '7d'
  });
}

export function requireAuth(req, res, next) {
  const header = req.get('authorization');
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    req.auth = jwt.verify(header.slice(7), config.jwtSecret);
    return next();
  } catch {
    return res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
  }
}

