import express from 'express';
import cors from 'cors';
import { config } from './core/config.js';
import { requestId } from './middleware/requestId.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler } from './middleware/errorHandler.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import userAdminRoutes from './routes/userAdminRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import workCenterRoutes from './routes/workCenterRoutes.js';
import bomRoutes from './routes/bomRoutes.js';
import moRoutes from './routes/moRoutes.js';
import woRoutes from './routes/woRoutes.js';
import ledgerRoutes from './routes/ledgerRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import cookieParser from 'cookie-parser';

const app = express();
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(requestId);
app.use(requestLogger);

app.use('/', healthRoutes);
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/users', userAdminRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/work-centers', workCenterRoutes);
app.use('/boms', bomRoutes);
app.use('/mos', moRoutes);
app.use('/wos', woRoutes);
app.use('/ledger', ledgerRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/reports', reportRoutes);

// Swagger docs
try {
	const specPath = path.join(process.cwd(), 'src', 'docs', 'openapi.json');
	const spec = JSON.parse(fs.readFileSync(specPath,'utf8'));
	app.get('/docs-json', (_req,res)=> res.json(spec));
	app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));
} catch(e){
	// eslint-disable-next-line no-console
	console.error('Failed to load OpenAPI spec', e);
}

app.use(errorHandler);

export default app;
