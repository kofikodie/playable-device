import request from 'supertest';
import app from '../src/app';
jest.useFakeTimers();
describe('E2E tests for the app', () => {
    it('should return a valid response for GET /health', () => {
        request(app).get('/health').expect(200).expect('OK');
    });
});
