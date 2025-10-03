import jwt from 'jsonwebtoken';

export const requireAuth = () => ({
  before: (request) => {
    const h = request.event.headers || {};
    const raw = h.authorization || h.Authorization || '';

    if (!raw.startsWith('Bearer ')) {
      const e = new Error('Unauthorized');
      e.statusCode = 401;
      throw e;
    }

    const token = raw.slice(7);

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      request.event.user = { userId: payload.sub, username: payload.username };
    } catch {
      const e = new Error('Unauthorized');
      e.statusCode = 401;
      throw e;
    }
  }
});