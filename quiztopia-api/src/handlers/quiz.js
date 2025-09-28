
import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from '@middy/http-error-handler';
import httpCors from '@middy/http-cors';
import { db } from '../lib/db.js';
import { requireAuth } from '../lib/auth.js';
import { newId, nowIso } from '../lib/utils.js';
import { z } from 'zod';
import { validateBody } from '../lib/validate.js';
import { ok, created, http } from '../lib/errors.js';

export const getAllQuizzes = middy(async () => {
  const res = await db.query({
    KeyConditionExpression: 'PK = :p and begins_with(SK, :q)',
    ExpressionAttributeValues: { ':p': 'QUIZZES', ':q': 'QUIZ#' }
  });
  const data = (res.Items || []).map(i => ({ quizId: i.quizId, name: i.name, ownerId: i.ownerId }));
  return ok({ quizzes: data });
})
.use(httpErrorHandler()).use(httpCors());

const createSchema = z.object({ name: z.string().min(1) });

export const createQuiz = middy(async (event) => {
  const { userId } = event.user;
  const { name } = event.body;
  const quizId = newId();

  await db.put({ PK:`QUIZ#${quizId}`, SK:'METADATA', quizId, name, ownerId:userId, createdAt: nowIso() });
  await db.put({ PK:'QUIZZES', SK:`QUIZ#${quizId}`, quizId, name, ownerId:userId });

  return created({ quizId });
})
.use(httpJsonBodyParser()).use(validateBody(createSchema)).use(requireAuth()).use(httpErrorHandler()).use(httpCors());

export const getQuizByUser = middy(async (event) => {
  const { userId, quizId } = event.pathParameters || {};
  
  const meta = await db.get({ PK:`QUIZ#${quizId}`, SK:'METADATA' });
  if (!meta.Item || meta.Item.ownerId !== userId) return http(404, 'not found');

  const q = await db.query({
    KeyConditionExpression: 'PK = :pk and begins_with(SK, :p)',
    ExpressionAttributeValues: { ':pk': `QUIZ#${quizId}`, ':p': 'QUESTION#' }
  });

  return ok({
    quiz: {
      quizId,
      userId,
      questions: (q.Items || []).map(x => ({
        question: x.question, answer: x.answer,
        location: { longitude: String(x.longitude ?? ''), latitude: String(x.latitude ?? '') }
      }))
    }
  });
})
.use(httpErrorHandler()).use(httpCors());

export const deleteQuiz = middy(async (event) => {
  const { userId } = event.user;
  const { quizId } = event.pathParameters || {};

  const meta = await db.get({ PK:`QUIZ#${quizId}`, SK:'METADATA' });
  if (!meta.Item) return http(404,'not found');
  if (meta.Item.ownerId !== userId) return http(403,'forbidden');

  await db.del({ PK:`QUIZ#${quizId}`, SK:'METADATA' });
  await db.del({ PK:'QUIZZES', SK:`QUIZ#${quizId}` });
  

  return ok({ message: 'deleted' });
})
.use(requireAuth()).use(httpErrorHandler()).use(httpCors());