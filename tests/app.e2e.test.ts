import request from 'supertest';
import app from '../src/app';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import Redis from 'ioredis';
import nock from 'nock';

dotenv.config();

nock(
    'https://growth-engineering-nodejs-home-assessement-dev.s3.eu-central-1.amazonaws.com'
)
    .persist()
    .get('/entitlements.json')
    .reply(200, [
        {
            userId: '1',
            entitlements: {
                devices: {
                    access_device: 'any',
                    max_devices: 2,
                },
            },
        },
    ]);

describe('E2E tests for the app', () => {
    const redis = new Redis({
        port: Number(process.env.REDIS_PORT) || 6379,
        host: process.env.REDIS_HOST || 'redis',
        password: process.env.REDIS_PASSWORD || '',
    });

    beforeAll(async () => {
        await redis.flushdb();
        return mongoose.connect(process.env.MONGO_URI || '');
    });

    beforeEach(async () => {
        await redis.flushdb();
    });

    afterAll(done => {
        redis.flushdb();
        mongoose.connection.close();
        done();
    });

    it('should return a valid response for GET /health', () => {
        return request(app).get('/health').expect(200).expect('OK');
    });

    it('should return a error response for POST /create given a correct that already exists', () => {
        return request(app)
            .post('/create')
            .send({
                name: 'Iphone X',
                userId: '1',
            })
            .expect(409)
            .expect({
                message: 'Device already exists',
            });
    });

    it('should return a error response for POST /create given invalid body request', () => {
        return request(app)
            .post('/create')
            .send({
                name: 'Iphone X',
            })
            .expect(400)
            .expect({
                message:
                    'Device validation failed: userId: Path `userId` is required.',
            });
    });

    it('should return a valid response for POST /retrieve', () => {
        return request(app)
            .post('/retrieve')
            .send({
                name: 'Iphone X',
                userId: '1',
            })
            .expect(200)
            .expect({
                message: 'Device retrieved successfully',
                device: {
                    id: '62cac7f3b6ddd9deb4be79eb',
                },
                playingDevices: 1,
            });
    });

    it('should return a valid response POST /retieve with playing device count at 1 calling the endpint twice with the same device and max device at 1', () => {
        return request(app)
            .post('/retrieve')
            .send({
                name: 'Iphone X',
                userId: '1',
            })
            .expect(200)
            .expect({
                message: 'Device retrieved successfully',
                device: {
                    id: '62cac7f3b6ddd9deb4be79eb',
                },
                playingDevices: 1,
            })
            .then(() => {
                return request(app)
                    .post('/retrieve')
                    .send({
                        name: 'Iphone X',
                        userId: '1',
                    })
                    .expect(200)
                    .expect({
                        message: 'Device retrieved successfully',
                        device: {
                            id: '62cac7f3b6ddd9deb4be79eb',
                        },
                        playingDevices: 1,
                    });
            });
    });

    it('should return a valid response POST /retieve with playing device count at 2 calling the endpint twice with the different device', () => {
        return request(app)
            .post('/retrieve')
            .send({
                name: 'Iphone X',
                userId: '1',
            })
            .expect(200)
            .expect({
                message: 'Device retrieved successfully',
                device: {
                    id: '62cac7f3b6ddd9deb4be79eb',
                },
                playingDevices: 1,
            })
            .then(() => {
                return request(app)
                    .post('/retrieve')
                    .send({
                        name: 'Samsung S10',
                        userId: '1',
                    })
                    .expect(200)
                    .expect({
                        message: 'Device retrieved successfully',
                        device: {
                            id: '63cac7f3b6ddd9deb4be79eb',
                        },
                        playingDevices: 2,
                    });
            });
    });

    it('should return a valid response POST /retieve with playing device count at 2 calling the endpint twice with the same device and with another device', () => {
        return request(app)
            .post('/retrieve')
            .send({
                name: 'Iphone X',
                userId: '1',
            })
            .expect(200)
            .expect({
                message: 'Device retrieved successfully',
                device: {
                    id: '62cac7f3b6ddd9deb4be79eb',
                },
                playingDevices: 1,
            })
            .then(() => {
                return request(app)
                    .post('/retrieve')
                    .send({
                        name: 'Samsung S10',
                        userId: '1',
                    })
                    .expect(200)
                    .expect({
                        message: 'Device retrieved successfully',
                        device: {
                            id: '63cac7f3b6ddd9deb4be79eb',
                        },
                        playingDevices: 2,
                    });
            })
            .then(() => {
                return request(app)
                    .post('/retrieve')
                    .send({
                        name: 'Iphone X',
                        userId: '1',
                    })
                    .expect(200)
                    .expect({
                        message: 'Device retrieved successfully',
                        device: {
                            id: '62cac7f3b6ddd9deb4be79eb',
                        },
                        playingDevices: 2,
                    });
            });
    });

    it('should return an error response POST /retieve with playing device count at 2 calling the endpint thrice with different devices', () => {
        return request(app)
            .post('/retrieve')
            .send({
                name: 'Iphone X',
                userId: '1',
            })
            .expect(200)
            .expect({
                message: 'Device retrieved successfully',
                device: {
                    id: '62cac7f3b6ddd9deb4be79eb',
                },
                playingDevices: 1,
            })
            .then(() => {
                return request(app)
                    .post('/retrieve')
                    .send({
                        name: 'Samsung S10',
                        userId: '1',
                    })
                    .expect(200)
                    .expect({
                        message: 'Device retrieved successfully',
                        device: {
                            id: '63cac7f3b6ddd9deb4be79eb',
                        },
                        playingDevices: 2,
                    });
            })
            .then(() => {
                return request(app)
                    .post('/retrieve')
                    .send({
                        name: 'Xiaomi Mi8',
                        userId: '1',
                    })
                    .expect(403)
                    .expect({
                        message:
                            'User has reached the maximum number of devices',
                    });
            });
    });

    it('should return an error response POST /retrieve with a device that does not exist', () => {
        return request(app)
            .post('/retrieve')
            .send({
                name: 'Tecno',
                userId: '1',
            })
            .expect(404)
            .expect({
                message: 'Device not found',
            });
    });
});
