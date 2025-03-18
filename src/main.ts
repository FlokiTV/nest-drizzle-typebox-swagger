import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureNestJsTypebox } from 'nestjs-typebox';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

configureNestJsTypebox({
  patchSwagger: true,
  setFormats: true,
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3000;
  app.enableCors();
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'JWT Token for authentication',
    })
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, documentFactory);

  const document = SwaggerModule.createDocument(app, config);

  app.use(
    '/scalar',
    apiReference({
      spec: {
        content: document,
      },
    }),
  );

  await app.listen(port, () => {
    console.log('-----------------------');
    console.log('🎉 - Servidor Online !');
    console.log('\x1b[34m%s\x1b[0m', '🔗 - http://localhost:3000');
    console.log('\x1b[33m%s\x1b[0m', '📃 - http://localhost:3000/api');
    console.log('\x1b[33m%s\x1b[0m', '📃 - http://localhost:3000/scalar');
    console.log('-----------------------');
  });
}
bootstrap().catch((err) => {
  console.error(err);
});
