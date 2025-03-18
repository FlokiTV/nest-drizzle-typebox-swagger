<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository with Drizzle ORM, TypeBox for runtime type checking, and Swagger for API documentation.

## Key Dependencies

- **NestJS** (v11.0.1) - Progressive Node.js framework
- **Drizzle ORM** (v0.30.5) - TypeScript ORM with developer-friendly SQL
- **TypeBox** (v0.34.30) - JSON Schema Type Builder with Static Type Resolution
- **Swagger/OpenAPI** (v11.0.6) - API documentation
- **Scalar API Reference** (v0.4.1) - Modern API documentation UI
- **Better SQLite3** (v11.9.1) - SQLite3 driver for Node.js

## Project setup

```bash
$ npm install
```

## Database Commands

```bash
# Start Drizzle Studio - Visual Database Manager
$ npm run db:studio

# Generate and Apply Migrations
$ npm run db:sync

# Generate Migration Files
$ npm run db:generate

# Apply Pending Migrations
$ npm run db:migrate
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## API Documentation

After starting the server, you can access:
- Swagger UI at: http://localhost:3000/api
- Scalar API Reference at: http://localhost:3000/scalar

## Rotas Disponíveis

### Autenticação

#### POST /auth/login
Autenticação de usuário existente.

**Corpo da Requisição:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123" // mínimo 8 caracteres
}
```

**Resposta (200 OK):**
```json
{
  "user": {
    "id": "string",
    "name": "string",
    "email": "string"
  },
  "token": "string"
}
```

#### POST /auth/signup
Criação de novo usuário.

**Corpo da Requisição:**
```json
{
  "name": "Nome do Usuário",
  "email": "usuario@exemplo.com",
  "password": "senha123" // mínimo 8 caracteres
}
```

**Resposta (201 Created):**
```json
{
  "user": {
    "id": "string",
    "name": "string",
    "email": "string"
  },
  "token": "string"
}
```

### Usuários

#### GET /users/me
Retorna os dados do usuário autenticado.

**Headers:**
```
Authorization: Bearer {token}
```

**Resposta (200 OK):**
```json
{
  "id": "string",
  "name": "string",
  "email": "string"
}
```

#### PATCH /users/me
Atualiza os dados do usuário autenticado.

**Headers:**
```
Authorization: Bearer {token}
```

**Corpo da Requisição (campos opcionais):**
```json
{
  "name": "Novo Nome",
  "email": "novo@email.com"
}
```

**Resposta (200 OK):**
```json
{
  "id": "string",
  "name": "string",
  "email": "string"
}
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
