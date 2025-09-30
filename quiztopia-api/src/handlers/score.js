import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from '@middy/http-error-handler';
import httpCors from '@middy/http-cors';
import { requireAuth } from '../lib/auth.js';
import { put, query } from '../lib/db.js';
import { nowIso, rankKey } from '../lib/utils.js';

export const submitScore = middy(async (event) => {
  const { userId } = event.user;
  const { quizId } = event.pathParameters || {};
  const { score } = event.body || {};
  const s = Number(score);
  if (!Number.isFinite(s)) return { statusCode: 400, body: JSON.stringify({ message: 'score must be a number' }) };