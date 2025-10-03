import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from '@middy/http-error-handler';
import httpCors from '@middy/http-cors';
import { requireAuth } from '../lib/auth.js';
import { db } from '../lib/db.js';
import { nowIso, rankKey } from '../lib/utils.js';

export const submitScore = middy(async (event) => {
  const { userId } = event.user;
  const { quizId } = event.pathParameters || {};
  const { score } = event.body || {};
  const s = Number(score);
  if (!Number.isFinite(s)) return { statusCode: 400, body: JSON.stringify({ message: 'score must be a number' }) };

  const updatedAt = nowIso();
   await db.put({
    PK: `QUIZ#${quizId}`,
    SK: `SCORE#${userId}`,
    userId, quizId, score: s, updatedAt,
    GSI1PK: `LEADER#${quizId}`,
    GSI1SK: `${rankKey(s)}#${updatedAt}`
  });

  return { statusCode: 201, body: JSON.stringify({ ok: true }) };
}).use(httpJsonBodyParser()).use(requireAuth()).use(httpErrorHandler()).use(httpCors());

export const getLeaderboard = middy(async (event) => {
  const { quizId } = event.pathParameters || {};
  const limit = Number(event.queryStringParameters?.limit) || 10;
  const { Items } = await db.query({
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :p',
    ExpressionAttributeValues: { ':p': `LEADER#${quizId}` },
    ScanIndexForward: false,
    Limit: limit
  });
  return { statusCode: 200, body: JSON.stringify(Items.map(i => ({ userId: i.userId, score: i.score, updatedAt: i.updatedAt }))) };
}).use(httpErrorHandler()).use(httpCors());