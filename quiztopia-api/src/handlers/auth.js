
import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from '@middy/http-error-handler';
import httpCors from '@middy/http-cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../lib/db.js';
import { newId, nowIso } from '../lib/utils.js';
import { z } from 'zod';
import { validateBody } from '../lib/validate.js';
import { ok } from '../lib/errors.js';

const authSchema = z.object({ username: z.string().min(3), password: z.string().min(6) });

export const signup = middy(async (event) => {
  const { username, password } = event.body;
  // se om username finns
  const existing = await db.get({ PK: `USERNAME#${username}`, SK: 'USER' });
  if (existing.Item) return { statusCode: 409, body: JSON.stringify({ success:false, error:'username taken' }) };

  const userId = newId();
  const hash = bcrypt.hashSync(password, 10);

  await db.put({ PK:`USER#${userId}`, SK:'PROFILE', userId, username, passwordHash:hash, createdAt: nowIso() });
  await db.put({ PK:`USERNAME#${username}`, SK:'USER', userId });

  return ok({ success: true });
})
.use(httpJsonBodyParser())
.use(validateBody(authSchema))
.use(httpErrorHandler())
.use(httpCors());

export const login = middy(async (event) => {
  const { username, password } = event.body;

  const lookup = await db.get({ PK: `USERNAME#${username}`, SK: 'USER' });
  if (!lookup.Item) return { statusCode:401, body: JSON.stringify({ success:false, error:'invalid credentials' }) };

  const user = await db.get({ PK:`USER#${lookup.Item.userId}`, SK:'PROFILE' });
  if (!user.Item || !bcrypt.compareSync(password, user.Item.passwordHash))
    return { statusCode:401, body: JSON.stringify({ success:false, error:'invalid credentials' }) };

  const token = jwt.sign({ sub: user.Item.userId, username }, process.env.JWT_SECRET, { expiresIn:'60m' });
  return ok({ token });
})
.use(httpJsonBodyParser())
.use(validateBody(authSchema))
.use(httpErrorHandler())
.use(httpCors());