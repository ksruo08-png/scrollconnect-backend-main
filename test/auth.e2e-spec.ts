import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth API (e2e)', () => {
  let app: INestApplication;
  let token: string;

  const user = { name: 'Test', email: 'test@mail.com', password: '123456' };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('registers a new user (201, no password in response)', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send(user)
      .expect(201);

    expect(res.body.email).toBe(user.email);
    expect(res.body.password).toBeUndefined();
  });

  it('rejects duplicate email (409)', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(user)
      .expect(409);
  });

  it('logs in and returns a token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: user.email, password: user.password })
      .expect(201);

    expect(res.body.access_token).toBeDefined();
    token = res.body.access_token;
  });

  it('rejects wrong password (401)', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: user.email, password: 'wrong' })
      .expect(401);
  });

  it('blocks profile without token (401)', async () => {
    await request(app.getHttpServer()).get('/auth/profile').expect(401);
  });

  it('returns profile with valid token (200)', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.email).toBe(user.email);
  });

  it('rejects invalid data on register (400)', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: '', email: 'not-an-email', password: '12' })
      .expect(400);
  });

  it('paginates users list', async () => {
    const res = await request(app.getHttpServer())
      .get('/users?page=1&limit=5')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.meta.limit).toBe(5);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('rejects invalid query params (400)', async () => {
    await request(app.getHttpServer())
      .get('/users?limit=500&sortBy=password')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
  });
});