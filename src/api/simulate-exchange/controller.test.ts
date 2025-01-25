import request from 'supertest';
import app from '../..';

describe('SimulateExchangeController Integration Tests', () => {

    describe('POST /simulate-exchange', () => {
        it('should create a new exchange simulation task', async () => {
            const response = await request(app)
                .post('/api/simulate-exchange')
                .send({
                    baseCurrency: 'USD',
                    targetCurrency: 'EUR',
                    amount: 100
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('taskId');
            expect(typeof response.body.taskId).toBe('string');
        });

        it('should return 400 when missing required parameters', async () => {
            const response = await request(app)
                .post('/api/simulate-exchange')
                .send({
                    baseCurrency: 'USD',
                    // missing targetCurrency and amount
                });

            expect(response.status).toBe(400);
            expect(response.body).toEqual({
                error: 'Missing required parameters'
            });
        });
    });

    describe('GET /simulate-exchange/:taskId', () => {
        it('should get task status for existing task', async () => {
            // First create a task
            const createResponse = await request(app)
                .post('/api/simulate-exchange')
                .send({
                    baseCurrency: 'USD',
                    targetCurrency: 'EUR',
                    amount: 100
                });

            const taskId = createResponse.body.taskId;

            // Then get its status
            const statusResponse = await request(app)
                .get(`/api/simulate-exchange/${taskId}`);

            expect(statusResponse.status).toBe(200);
            expect(statusResponse.body).toHaveProperty('status');
            expect(statusResponse.body).toHaveProperty('progress');
        });

        it('should return 404 for non-existent task', async () => {
            const response = await request(app)
                .get('/api/simulate-exchange/non-existent-task-id');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({
                error: 'Task not found'
            });
        });
    });

    describe('GET /simulate-exchange', () => {
        it('should get all tasks', async () => {
            // Create a couple of tasks first
            await request(app)
                .post('/api/simulate-exchange')
                .send({
                    baseCurrency: 'USD',
                    targetCurrency: 'EUR',
                    amount: 100
                });

            await request(app)
                .post('/api/simulate-exchange')
                .send({
                    baseCurrency: 'EUR',
                    targetCurrency: 'GBP',
                    amount: 200
                });

            // Get all tasks
            const response = await request(app)
                .get('/api/simulate-exchange');

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(4);
            
            // Check structure of returned tasks
            response.body.forEach((task: any) => {
                expect(task).toHaveProperty('status');
                expect(task).toHaveProperty('progress');
            });
        });
    });
});
