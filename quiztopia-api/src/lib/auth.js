import jwt from 'jsonwebtoken';
export const requireAuth = () => ({
  before: (request) => {
    const h = request.event.headers || {};
    const raw = h.authorization || h.Authorization || '';
    if (!raw.startsWith('Bearer ')) throw new Error('Unauthorized');
    const token = raw.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    request.event.user = { userId: payload.sub, username: payload.username };
  }
});