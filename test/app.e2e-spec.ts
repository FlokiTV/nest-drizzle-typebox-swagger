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
    it('/auth/login (POST)', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password123' })
        .expect(204); // Expect No Content for user not found
    });

    it('/auth/signup (POST)', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User',
        })
        .expect(201); // Expect Created for successful signup
    });
  });
});
