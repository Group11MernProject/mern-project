import crypto from 'node:crypto';
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { config } from '../config.js';
import { createToken, requireAuth } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { MealPlan } from '../models/MealPlan.js';
import { sendVerificationEmail } from '../services/email.js';

export const authRouter = Router();
const googleClient = new OAuth2Client(config.googleClientId);

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    isEmailVerified: user.isEmailVerified
  };
}

function validEmail(email = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function makeVerification(user) {
  const token = crypto.randomBytes(32).toString('hex');
  user.verificationTokenHash = crypto.createHash('sha256').update(token).digest('hex');
  user.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();
  return sendVerificationEmail({ name: user.name, email: user.email, token });
}

authRouter.post('/register', async (req, res, next) => {
  try {
    const { name = '', email = '', password = '' } = req.body || {};
    if (name.trim().length < 2 || !validEmail(email) || password.length < 8) {
      return res.status(400).json({ message: 'Enter a name, a valid email, and a password of at least 8 characters.' });
    }

    if (await User.exists({ email: email.toLowerCase() })) {
      return res.status(409).json({ message: 'An account already exists for this email.' });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      passwordHash: await bcrypt.hash(password, 12)
    });
    const delivery = await makeVerification(user);

    return res.status(201).json({
      token: createToken(user),
      user: publicUser(user),
      message: 'Account created. Check your inbox to verify your email.',
      ...(config.env === 'development' && delivery.previewUrl ? { previewUrl: delivery.previewUrl } : {})
    });
  } catch (error) {
    return next(error);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const { email = '', password = '' } = req.body || {};
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Email or password is incorrect.' });
    }
    return res.json({ token: createToken(user), user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
});

authRouter.post('/google', async (req, res, next) => {
  try {
    if (!config.googleClientId) {
      return res.status(503).json({ message: 'Google sign-in is not configured yet.' });
    }
    const ticket = await googleClient.verifyIdToken({ idToken: req.body?.credential, audience: config.googleClientId });
    const payload = ticket.getPayload();
    if (!payload?.email) return res.status(401).json({ message: 'Google sign-in could not be verified.' });

    let user = await User.findOne({ email: payload.email.toLowerCase() });
    if (!user) {
      user = await User.create({
        name: payload.name || payload.email.split('@')[0],
        email: payload.email.toLowerCase(),
        googleId: payload.sub,
        avatar: payload.picture,
        isEmailVerified: Boolean(payload.email_verified)
      });
    } else {
      user.googleId ||= payload.sub;
      user.avatar ||= payload.picture;
      user.isEmailVerified ||= Boolean(payload.email_verified);
      await user.save();
    }
    return res.json({ token: createToken(user), user: publicUser(user) });
  } catch (error) {
    if (error.message?.includes('Token used too late') || error.message?.includes('Wrong recipient')) {
      return res.status(401).json({ message: 'Google sign-in could not be verified.' });
    }
    return next(error);
  }
});

authRouter.post('/demo', async (_req, res, next) => {
  try {
    if (!config.enableDemoLogin) return res.status(404).json({ message: 'Demo mode is disabled.' });
    let user = await User.findOne({ email: 'demo@platepilot.app' });
    if (!user) {
      user = await User.create({
        name: 'Alex Morgan',
        email: 'demo@platepilot.app',
        isEmailVerified: true
      });
      await MealPlan.create({
        user: user._id,
        meals: [
          { recipeId: '52772', title: 'Teriyaki Chicken Casserole', image: 'https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg', category: 'Chicken', area: 'Japanese', day: 'Monday' },
          { recipeId: '52959', title: 'Baked Salmon with Fennel', image: 'https://www.themealdb.com/images/media/meals/1548772327.jpg', category: 'Seafood', area: 'British', day: 'Wednesday' },
          { recipeId: '52771', title: 'Spicy Arrabbiata Penne', image: 'https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg', category: 'Vegetarian', area: 'Italian', day: 'Friday' }
        ]
      });
    }
    return res.json({ token: createToken(user), user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
});

authRouter.post('/verify-email', async (req, res, next) => {
  try {
    const tokenHash = crypto.createHash('sha256').update(req.body?.token || '').digest('hex');
    const user = await User.findOne({ verificationTokenHash: tokenHash, verificationExpires: { $gt: new Date() } });
    if (!user) return res.status(400).json({ message: 'This verification link is invalid or has expired.' });
    user.isEmailVerified = true;
    user.verificationTokenHash = undefined;
    user.verificationExpires = undefined;
    await user.save();
    return res.json({ message: 'Email verified successfully.', user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
});

authRouter.post('/resend-verification', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.auth.sub);
    if (!user) return res.status(404).json({ message: 'Account not found.' });
    if (user.isEmailVerified) return res.json({ message: 'Your email is already verified.' });
    const delivery = await makeVerification(user);
    return res.json({
      message: 'A new verification email is on its way.',
      ...(config.env === 'development' && delivery.previewUrl ? { previewUrl: delivery.previewUrl } : {})
    });
  } catch (error) {
    return next(error);
  }
});

authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.auth.sub);
    if (!user) return res.status(404).json({ message: 'Account not found.' });
    return res.json({ user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
});

