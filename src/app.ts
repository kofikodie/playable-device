import express, { Request, Response } from 'express';
import Redis from 'ioredis';
import { DeviceController } from './controller/devices.controller';
import { DeviceInterface } from './controller/types/device-type';
import logger from './middleware/Logger';
import * as dotenv from 'dotenv';
import { EntitlementClient } from './client/entitlement-client';
dotenv.config();

const app = express();
const redis = new Redis({
    port: Number(process.env.REDIS_PORT) || 6379,
    host: process.env.REDIS_HOST || 'redis',
    password: process.env.REDIS_PASSWORD || '',
});

app.use(express.json());
app.use(logger);

app.get('/health', (_req: Request, res: Response) => {
    res.status(200).send('OK');
});

app.post(
    '/create',
    async (
        req: Request<unknown, unknown, DeviceInterface, unknown>,
        res: Response
    ) => {
        const device = req.body;
        const deviceController = new DeviceController();
        const result = await deviceController.create(device);

        if ('errorCode' in result) {
            return res.status(result.errorCode).send({
                message: result.context,
            });
        }

        return res.status(201).send(result);
    }
);

app.post(
    '/retrieve',
    async (
        req: Request<unknown, unknown, DeviceInterface, unknown>,
        res: Response
    ) => {
        const device = req.body;
        const deviceController = new DeviceController();
        const result = await deviceController.retrieve(device);

        if ('errorCode' in result) {
            return res.status(result.errorCode).send({
                message: result.context,
            });
        }

        const entitlement = new EntitlementClient();
        const maxDevices = await entitlement.getMaxDevices(device.userId);
        if (typeof maxDevices !== 'number') {
            return res.status(maxDevices.errorCode).send({
                message: maxDevices.context,
            });
        }

        const cachedDevice = await redis.get(device.userId);
        if (cachedDevice !== null) {
            const devices: [{ id: string }] = JSON.parse(cachedDevice);
            const deviceInCache = devices.find(d => d.id === result.device.id);

            if (deviceInCache) {
                return res.status(200).send({
                    message: 'Device retrieved successfully',
                    device: {
                        id: deviceInCache.id,
                    },
                    playingDevices: devices.length,
                });
            }

            devices.push({
                id: result.device.id,
            });

            if (maxDevices < devices.length) {
                return res.status(403).send({
                    message: 'User has reached the maximum number of devices',
                });
            }

            await redis.set(device.userId, JSON.stringify(devices));

            return res.status(200).send({
                message: 'Device retrieved successfully',
                device: {
                    id: result.device.id,
                },
                playingDevices: devices.length,
            });
        }

        await redis.set(
            device.userId,
            JSON.stringify([{ id: result.device.id }])
        );

        if (maxDevices <= 0) {
            return res.status(403).send({
                message: 'User has reached the maximum number of devices',
            });
        }

        return res.status(200).send({
            message: 'Device retrieved successfully',
            device: {
                id: result.device.id,
            },
            playingDevices: 1,
        });
    }
);

app.delete(
    '/delete',
    async (
        req: Request<unknown, unknown, DeviceInterface, unknown>,
        res: Response
    ) => {
        const device = req.body;
        const deviceController = new DeviceController();
        const result = await deviceController.delete(device);

        if ('errorCode' in result) {
            return res.status(result.errorCode).send({
                message: result.context,
            });
        }

        const cachedDevice = await redis.get(device.userId);
        if (cachedDevice !== null) {
            const devices: [{ id: string }] = JSON.parse(cachedDevice);
            const deviceInCache = devices.find(d => d.id === result.device.id);

            if (deviceInCache) {
                devices.splice(devices.indexOf(deviceInCache), 1);
                await redis.set(device.userId, JSON.stringify(devices));
            }

            return res.status(200).send({
                message: 'Device deleted successfully',
                device: {
                    id: result.device.id,
                },
                playingDevices: devices.length,
            });
        }

        return res.status(200).send({
            message: 'Device deleted successfully',
            device: {
                id: result.device.id,
            },
            playingDevices: 0,
        });
    }
);

export default app;
