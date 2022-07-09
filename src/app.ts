import express, { Request, Response } from 'express';
import logger from './middleware/Logger';

const app = express();

app.use(express.json());
app.use(logger);

app.get('/health', (_req: Request, res: Response) => {
    res.send('OK');
});

export default app; 