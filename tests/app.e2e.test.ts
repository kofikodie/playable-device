import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import app from '../src/app';
import * as dotenv from "dotenv";
import mongoose from 'mongoose';
dotenv.config();


describe('E2E tests for the app', () => {
    beforeAll(async () => {
        const mongo = await MongoMemoryServer.create();
        const mongoUri = mongo.getUri();
        return mongoose.connect(mongoUri);
    });
    
    afterAll(done => {
        mongoose.connection.close();
        done();
    });

    it('should return a valid response for GET /health', () => {
        return request(app).get('/health').expect(200).expect('OK');
    });

    it('should return a valid response for POST /users', () => {
        return request(app).post('/create').send({
            id: '1',
            name: 'Iphone X',
            userId: '1',
        }).expect(201).expect({
            message: 'Device created successfully',
            user: {
                id: '1',
            },
        });
    });
});
