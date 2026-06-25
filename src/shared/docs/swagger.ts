import { Application } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import config from '@config/index';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'File Analytics Platform API',
      version: '1.0.0',
      description: 'Production-ready Modular Monolith API documentation',
      contact: {
        name: 'Principal Software Architect',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}${config.apiPrefix}`,
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  // Scan all modules files for JSDoc/Swagger specs (both .ts files in development and .js files in production)
  apis: [
    './src/app.ts',
    './src/modules/**/*.ts',
    './src/modules/**/*.js',
    './dist/modules/**/*.js',
  ],
};

const swaggerSpec = swaggerJSDoc(options);

/**
 * Sets up Swagger middleware and UI endpoints
 */
export const setupSwagger = (app: Application): void => {
  // Mount the Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Expose raw OpenAPI JSON spec
  app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};

export default setupSwagger;
