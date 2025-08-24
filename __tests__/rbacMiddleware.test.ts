import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';

let requirePermission: any;

beforeAll(async () => {
  // ✅ Correct path: from __tests__ → shared/rbac.ts
  await (jest as any).unstable_mockModule('../shared/rbac.js', () => ({
    UserRole: { ADMIN: 'ADMIN', DOCTOR: 'DOCTOR', PATIENT: 'PATIENT' },
    checkPermission: (role: string, permission: string) =>
      role === 'ADMIN' && permission === 'READ_SECURE_DATA',
  }));

  // ✅ Import the middleware AFTER the RBAC mock
  const mod: any = await import('../server/rbacMiddleware.js');
  requirePermission = mod.requirePermission;

  if (typeof requirePermission !== 'function') {
    throw new Error('❌ requirePermission was not imported correctly');
  }
});

const buildApp = () => {
  const app = express();
  app.use(express.json());

  app.get(
    '/secure',
    (req: Request, _res: Response, next: NextFunction) => {
      (req as any).user = {
        claims: { sub: '1234' },
        role: 'ADMIN',
        permissions: ['READ_SECURE_DATA'],
      };
      next();
    },
    requirePermission('READ_SECURE_DATA'),
    (_req: Request, res: Response) => res.status(200).send('Access granted')
  );

  app.get(
    '/unauth',
    requirePermission('READ_SECURE_DATA'),
    (_req: Request, res: Response) => res.status(200).send('Should not reach')
  );

  app.get(
    '/forbidden',
    (req: Request, _res: Response, next: NextFunction) => {
      (req as any).user = {
        claims: { sub: '5678' },
        role: 'PATIENT',
        permissions: ['VIEW_PUBLIC'],
      };
      next();
    },
    requirePermission('READ_SECURE_DATA'),
    (_req: Request, res: Response) => res.status(200).send('Should not reach')
  );

  return app;
};

describe('RBAC Middleware (requirePermission)', () => {
  let app: ReturnType<typeof buildApp>;

  beforeAll(() => {
    app = buildApp();
  });

  it('✅ allows access when permission is granted', async () => {
    const res = await request(app).get('/secure');
    expect(res.status).toBe(200);
    expect(res.text).toBe('Access granted');
  });

  it('🚫 denies access for unauthenticated user', async () => {
    const res = await request(app).get('/unauth');
    expect(res.status).toBe(401);
    expect(res.body?.code).toBe('UNAUTHORIZED');
  });

  it('🚫 denies access when permission is missing', async () => {
    const res = await request(app).get('/forbidden');
    expect(res.status).toBe(403);
    expect(res.body?.code).toBe('FORBIDDEN');
  });
});
