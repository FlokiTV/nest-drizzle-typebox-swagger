import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('UsersController', () => {
    it('/users/me (GET)', () => {
      return request(app.getHttpServer()).get('/users/me').expect(401); // Expect Unauthorized without token
    });

    it('/users/me (PATCH)', () => {
      return request(app.getHttpServer())
        .patch('/users/me')
        .send({ name: 'Updated Name' })
        .expect(401); // Expect Unauthorized without token
    });
  });

  describe('AuthController', () => {
    const email = `newuser${Date.now()}@example.com`;
    it('/auth/login (POST) - User not found', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'password123' })
        .expect(409)
        .expect((res) => {
          console.log(res.body);
          expect(res.body.message).toBe('User not found');
        });
    });

    it('/auth/signup (POST) - Successful signup', () => {
      const newUser = {
        email,
        password: 'password123',
        name: 'New User',
      };
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send(newUser)
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.email).toBe(newUser.email);
          expect(res.body.name).toBe(newUser.name);
        });
    });

    it('/auth/signup (POST) - Email already exists', () => {
      const existingUser = {
        email,
        password: 'password123',
        name: 'Existing User',
      };
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send(existingUser)
        .expect(409)
        .expect((res) => {
          expect(res.body.message).toBe('Email already exists');
        });
    });
  });
});
