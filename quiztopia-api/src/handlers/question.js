// src/handlers/question.js
import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from '@middy/http-error-handler';
import httpCors from '@middy/http-cors';
import { db } from '../lib/db.js';
import { requireAuth } from '../lib/auth.js';
import { newId, nowIso } from '../lib/utils.js';
import { z } from 'zod';
import { validateBody } from '../lib/validate.js';
import { ok, http } from '../lib/errors.js';

const addSchema = z.object({
  name: z.string().min(1).optional(),      
  quizId: z.string().uuid().optional(),    
  question: z.string().min(1),
  answer: z.string().min(1),
  location: z.object({
    longitude: z.union([z.string(), z.number()]),
    latitude: z.union([z.string(), z.number()])
  })
});

export const addQuestion = middy(async (event) => {
  const { userId } = event.user;
  const { quizId: qidMaybe, name, question, answer, location } = event.body;

  
  let quizId = qidMaybe;
  if (!quizId && name) {
    const list = await db.query({
      KeyConditionExpression: 'PK = :p and begins_with(SK, :q)',
      ExpressionAttributeValues: { ':p': 'QUIZZES', ':q': 'QUIZ#' }
    });
    const hit = (list.Items || []).find(i => i.name === name && i.ownerId === userId);
    if (!hit) return http(404, 'quiz not found for user');
    quizId = hit.quizId;
  }
  if (!quizId) return http(400,'quizId or name required');

  const meta = await db.get({ PK:`QUIZ#${quizId}`, SK:'METADATA' });
  if (!meta.Item || meta.Item.ownerId !== userId) return http(403, 'forbidden');

  const questionId = newId();
  await db.put({
    PK:`QUIZ#${quizId}`,
    SK:`QUESTION#${questionId}`,
    questionId, quizId,
    question, answer,
    longitude: location.longitude, latitude: location.latitude,
    createdAt: nowIso()
  });

 
  const q = await db.query({
    KeyConditionExpression: 'PK = :pk and begins_with(SK, :p)',
    ExpressionAttributeValues: { ':pk': `QUIZ#${quizId}`, ':p': 'QUESTION#' }
  });

  return ok({
    quiz: {
      Attributes: {
        questions: (q.Items || []).map(x => ({
          question: x.question, answer: x.answer,
          location: { longitude: String(x.longitude ?? ''), latitude: String(x.latitude ?? '') }
        })),
        userId, quizId
      }
    }
  });
})
.use(httpJsonBodyParser())
.use(validateBody(addSchema))
.use(requireAuth())
.use(httpErrorHandler())
.use(httpCors());