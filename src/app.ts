import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import requestLogger from '@shared/middlewares/requestLogger';
import errorHandler from '@shared/middlewares/errorHandler';
import notFoundHandler from '@shared/middlewares/notFound';

import setupSwagger from './shared/docs/swagger';

const app: Application = express();

// Standard Security Headers
app.use(helmet());

// CORS Configuration
app.use(cors());

// Compression & Parsing Middleware
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Winston HTTP Request Logging
app.use(requestLogger);

// Setup OpenAPI Swagger Documentation
setupSwagger(app);

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Retrieve server health status
 *     description: Returns the health state of the application.
 *     responses:
 *       200:
 *         description: Server is operational.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 */
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
  });
});

// Fallback for non-existent routes
app.use(notFoundHandler);

// Global Error Interceptor
app.use(errorHandler);

export default app;
