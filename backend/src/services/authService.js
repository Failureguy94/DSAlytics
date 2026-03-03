const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const userRepository = require('../repositories/userRepository');
const AppError = require('../utils/appError');

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

function sanitizeUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    display_name: user.display_name,
    avatar_url: user.avatar_url,
    is_active: user.is_active,
    created_at: user.created_at,
    updated_at: user.updated_at
  };
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function register(payload) {
  const username = String(payload.username || '').trim();
  const email = String(payload.email || '').trim().toLowerCase();
  const password = String(payload.password || '');
  const displayName = payload.display_name ? String(payload.display_name).trim() : null;
  const avatarUrl = payload.avatar_url ? String(payload.avatar_url).trim() : null;

  if (!username || !email || !password) {
    throw new AppError('username, email, and password are required', 400);
  }

  if (username.length < 3 || username.length > 50) {
    throw new AppError('username must be between 3 and 50 characters', 400);
  }

  if (!validateEmail(email)) {
    throw new AppError('invalid email format', 400);
  }

  if (password.length < 8) {
    throw new AppError('password must be at least 8 characters', 400);
  }

  const [existingByEmail, existingByUsername] = await Promise.all([
    userRepository.findByEmail(email),
    userRepository.findByUsername(username)
  ]);

  if (existingByEmail) {
    throw new AppError('email already in use', 409);
  }

  if (existingByUsername) {
    throw new AppError('username already in use', 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const createdUser = await userRepository.createUser({
    id: uuidv4(),
    username,
    email,
    passwordHash,
    displayName,
    avatarUrl
  });

  return {
    token: signToken(createdUser.id),
    user: sanitizeUser(createdUser)
  };
}

async function login(payload) {
  const identifier = String(payload.identifier || payload.email || payload.username || '').trim();
  const password = String(payload.password || '');

  if (!identifier || !password) {
    throw new AppError('identifier and password are required', 400);
  }

  const user = await userRepository.findByEmailOrUsername(identifier);

  if (!user) {
    throw new AppError('invalid credentials', 401);
  }

  if (!user.is_active) {
    throw new AppError('user account is inactive', 403);
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new AppError('invalid credentials', 401);
  }

  return {
    token: signToken(user.id),
    user: sanitizeUser(user)
  };
}

module.exports = {
  register,
  login
};
