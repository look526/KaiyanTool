import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { swaggerOptions } from '../config/swagger';

export function setupSwagger(app: any) {
  const specs = swaggerJsdoc(swaggerOptions);
  
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  
  console.log('Swagger documentation available at /api-docs');
}
