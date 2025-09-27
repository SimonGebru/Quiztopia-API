export const validateBody = (schema) => ({
    before: (request) => {
      const data = request.event.body || {};
      const parsed = schema.safeParse(data);
      if (!parsed.success) {
        const msg = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
        const e = new Error(`BadRequest: ${msg}`);
        e.statusCode = 400; throw e;
      }
      request.event.body = parsed.data;
    }
  });