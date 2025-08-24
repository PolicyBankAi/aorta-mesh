import request from 'supertest';
import express from 'express';
import session from 'express-session';
import csrf from 'csurf';

const buildApp = () => {
  const app = express();
  app.use(express.urlencoded({ extended: false }));
  app.use(
    session({
      secret: 'test-secret',
      resave: false,
      saveUninitialized: true,
    })
  );

  const csrfProtection = csrf(); // session-based

  // Cast csrfProtection as any to avoid TS overload mismatch
  app.get('/form', csrfProtection as any, (req, res) => {
    // @ts-ignore – csurf adds csrfToken to req
    res.status(200).json({ csrfToken: req.csrfToken() });
  });

  app.post('/submit', csrfProtection as any, (_req, res) => {
    res.status(200).send('Submitted');
  });

  return app;
};

describe('CSRF Middleware', () => {
  it('returns a CSRF token on GET', async () => {
    const app = buildApp();
    const res = await request(app).get('/form');
    expect(res.status).toBe(200);
    expect(res.body.csrfToken).toBeDefined();
  });

  it('blocks POST without token', async () => {
    const app = buildApp();
    const res = await request(app).post('/submit');
    expect(res.status).toBe(403);
  });

  it('allows POST with valid token + session', async () => {
    const app = buildApp();
    const agent = request.agent(app);

    const tokenRes = await agent.get('/form');
    const token = tokenRes.body.csrfToken;

    const postRes = await agent
      .post('/submit')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send(`_csrf=${encodeURIComponent(token)}`);

    expect(postRes.status).toBe(200);
    expect(postRes.text).toBe('Submitted');
  });
});
