import request from 'supertest';
import app from '../../src/app';
import User from '../../src/models/User';

describe('Auth API Integration', () => {
  const validRegisterData = {
    name: 'Test Student',
    email: 'student@university.edu',
    password: 'Password123!',
    confirmPassword: 'Password123!',
    university: 'Test University'
  };

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(validRegisterData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user.email).toBe(validRegisterData.email);
      
      // Should set an HttpOnly cookie
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/token=.*HttpOnly/);
    });

    it('should return 400 if email already exists', async () => {
      // Create user first
      await User.create(validRegisterData);

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(validRegisterData)
        .expect(409);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toMatch(/already exists/i);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await User.create(validRegisterData);
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: validRegisterData.email,
          password: validRegisterData.password
        })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user.email).toBe(validRegisterData.email);
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should reject invalid password', async () => {
      await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: validRegisterData.email,
          password: 'WrongPassword123!'
        })
        .expect(401);
    });
  });

  describe('GET /api/v1/users/me', () => {
    it('should deny access without a token', async () => {
      await request(app)
        .get('/api/v1/users/me')
        .expect(401);
    });

    it('should allow access with a valid token cookie', async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/register')
        .send(validRegisterData);

      const cookie = loginRes.headers['set-cookie'][0];

      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Cookie', cookie)
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.data.user.email).toBe(validRegisterData.email);
    });
  });
});
