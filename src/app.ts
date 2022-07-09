import express, { Request, Response } from 'express';
import { DeviceController } from './controller/devices.controller';
import { DeviceInterface } from './controller/types/device-interface';
import logger from './middleware/Logger';

const app = express();

app.use(express.json());
app.use(logger);

app.get('/health', (_req: Request, res: Response) => {
    res.status(200).send('OK');
});

//create a POST route for /users
app.post(
    '/create',
    async (
        req: Request<unknown, unknown, DeviceInterface, unknown>,
        res: Response
    ) => {
        const user = req.body;
        const deviceController = new DeviceController();
        const result = await deviceController.create(user);

        if ('errorCode' in result) {
            return res.status(result.errorCode).send({
                message: result.context,
            });
        }

        return res.status(201).send(result);
    }
);

export default app;
