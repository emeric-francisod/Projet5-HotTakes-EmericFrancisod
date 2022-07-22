import request from 'supertest';
import app from '../../src/app.js';
import Sauce from '../../src/models/Sauce.js';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import jsonWebToken from 'jsonwebtoken';
import SAUCE_DATA from '../mocks/sauce-data.js';
import exp from 'node:constants';

const mockSauceSave = jest.spyOn(Sauce.prototype, 'save').mockResolvedValue();
const mockSauceFind = jest.spyOn(Sauce, 'find');
const mockSauceFindById = jest.spyOn(Sauce, 'findById');
const mockSauceUpdateOne = jest.spyOn(Sauce, 'updateOne');

beforeEach(() => {
    mockSauceSave.mockReset();
    mockSauceFind.mockReset();
    mockSauceFindById.mockReset();
    mockSauceUpdateOne.mockReset();
});

describe('Sauce routes test suite', () => {
    describe('POST api/sauces', () => {
        const sauceData = JSON.parse(JSON.stringify(SAUCE_DATA[0]));
        delete sauceData._id;
        delete sauceData.userId;
        delete sauceData.imageUrl;
        delete sauceData.likes;
        delete sauceData.dislikes;
        delete sauceData.usersLiked;
        delete sauceData.usersDisliked;

        const imagePath = join(dirname(fileURLToPath(import.meta.url)), '../images/test.png');

        const jwt = jsonWebToken.sign({ userId: '123' }, 'RANDOM_SECRET_KEY', {
            expiresIn: '24h',
        });
        const authorizationHeader = `Bearer ${jwt}`;

        test('Responds with a message in JSON format, and status 201', async () => {
            const response = await request(app)
                .post('/api/sauces/')
                .set('Authorization', authorizationHeader)
                .field('sauce', JSON.stringify(sauceData), { contentType: 'application/json' })
                .attach('image', imagePath);

            expect(response.status).toBe(201);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('message');
        });

        test('Responds with an error and status 400 if the name is invalid', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            invalidSauceData.name = true;
            const response = await request(app)
                .post('/api/sauces/')
                .set('Authorization', authorizationHeader)
                .field('sauce', JSON.stringify(invalidSauceData), { contentType: 'application/json' })
                .attach('image', imagePath);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/name/);
        });

        test('Responds with an error and status 400 if the name is absent', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            delete invalidSauceData.name;
            const response = await request(app)
                .post('/api/sauces/')
                .set('Authorization', authorizationHeader)
                .field('sauce', JSON.stringify(invalidSauceData), { contentType: 'application/json' })
                .attach('image', imagePath);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/name/);
        });

        test('Responds with an error and status 400 if the heat is invalid', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            invalidSauceData.heat = true;
            const response = await request(app)
                .post('/api/sauces/')
                .set('Authorization', authorizationHeader)
                .field('sauce', JSON.stringify(invalidSauceData), { contentType: 'application/json' })
                .attach('image', imagePath);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/heat/);
        });

        test('Responds with an error and status 400 if the heat is absent', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            delete invalidSauceData.heat;
            const response = await request(app)
                .post('/api/sauces/')
                .set('Authorization', authorizationHeader)
                .field('sauce', JSON.stringify(invalidSauceData), { contentType: 'application/json' })
                .attach('image', imagePath);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/heat/);
        });

        test('Responds with an error and status 400 if the heat is outside the boundaries', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            invalidSauceData.heat = 13;
            const response = await request(app)
                .post('/api/sauces/')
                .set('Authorization', authorizationHeader)
                .field('sauce', JSON.stringify(invalidSauceData), { contentType: 'application/json' })
                .attach('image', imagePath);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/heat/);
        });

        test('Responds with an error and status 400 if the file is missing', async () => {
            const response = await request(app)
                .post('/api/sauces/')
                .set('Authorization', authorizationHeader)
                .field('sauce', JSON.stringify(sauceData), { contentType: 'application/json' });

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
        });

        test('Responds with an error and status 400 if the description is invalid', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            invalidSauceData.description = true;
            const response = await request(app)
                .post('/api/sauces/')
                .set('Authorization', authorizationHeader)
                .field('sauce', JSON.stringify(invalidSauceData), { contentType: 'application/json' })
                .attach('image', imagePath);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/description/);
        });

        test('Responds with an error and status 400 if the description is absent', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            delete invalidSauceData.description;
            const response = await request(app)
                .post('/api/sauces/')
                .set('Authorization', authorizationHeader)
                .field('sauce', JSON.stringify(invalidSauceData), { contentType: 'application/json' })
                .attach('image', imagePath);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/description/);
        });

        test('Responds with an error and status 400 if the manufacturer is invalid', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            invalidSauceData.manufacturer = true;
            const response = await request(app)
                .post('/api/sauces/')
                .set('Authorization', authorizationHeader)
                .field('sauce', JSON.stringify(invalidSauceData), { contentType: 'application/json' })
                .attach('image', imagePath);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/manufacturer/);
        });

        test('Responds with an error and status 400 if the manufacturer is absent', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            delete invalidSauceData.manufacturer;
            const response = await request(app)
                .post('/api/sauces/')
                .set('Authorization', authorizationHeader)
                .field('sauce', JSON.stringify(invalidSauceData), { contentType: 'application/json' })
                .attach('image', imagePath);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/manufacturer/);
        });

        test('Responds with an error and status 400 if the main pepper is invalid', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            invalidSauceData.mainPepper = true;
            const response = await request(app)
                .post('/api/sauces/')
                .set('Authorization', authorizationHeader)
                .field('sauce', JSON.stringify(invalidSauceData), { contentType: 'application/json' })
                .attach('image', imagePath);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/mainPepper/);
        });

        test('Responds with an error and status 400 if the main pepper is absent', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            delete invalidSauceData.mainPepper;
            const response = await request(app)
                .post('/api/sauces/')
                .set('Authorization', authorizationHeader)
                .field('sauce', JSON.stringify(invalidSauceData), { contentType: 'application/json' })
                .attach('image', imagePath);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/mainPepper/);
        });

        test('Responds with an error and status 401 if the jwt is invalid', async () => {
            const invalidJwt = jsonWebToken.sign({ userId: '123' }, 'WRONG_KEY', {
                expiresIn: '24h',
            });
            const invalidAuthorizationHeader = `Bearer ${invalidJwt}`;
            const response = await request(app)
                .post('/api/sauces/')
                .set('Authorization', invalidAuthorizationHeader)
                .field('sauce', JSON.stringify(sauceData), { contentType: 'application/json' });

            expect(response.status).toBe(401);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
        });

        test("Responds with an error and status 401 if the jwt doesn't contain the userId", async () => {
            const invalidJwt = jsonWebToken.sign({ useless: '123' }, 'RANDOM_SECRET_KEY', {
                expiresIn: '24h',
            });
            const invalidAuthorizationHeader = `Bearer ${invalidJwt}`;
            const response = await request(app)
                .post('/api/sauces/')
                .set('Authorization', invalidAuthorizationHeader)
                .field('sauce', JSON.stringify(sauceData), { contentType: 'application/json' });

            expect(response.status).toBe(401);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
        });

        test('Responds with an error and status 400 if the saving fails due to validation error', async () => {
            mockSauceSave.mockRejectedValueOnce({ message: 'Save fail', name: 'ValidationError' });
            const response = await request(app)
                .post('/api/sauces/')
                .set('Authorization', authorizationHeader)
                .field('sauce', JSON.stringify(sauceData), { contentType: 'application/json' })
                .attach('image', imagePath);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
        });

        test('Responds with an error and status 500 if the saving fails', async () => {
            mockSauceSave.mockRejectedValueOnce({ message: 'Save fail' });
            const response = await request(app)
                .post('/api/sauces/')
                .set('Authorization', authorizationHeader)
                .field('sauce', JSON.stringify(sauceData), { contentType: 'application/json' })
                .attach('image', imagePath);

            expect(response.status).toBe(500);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('GET api/sauces', () => {
        const jwt = jsonWebToken.sign({ userId: '123' }, 'RANDOM_SECRET_KEY', {
            expiresIn: '24h',
        });
        const authorizationHeader = `Bearer ${jwt}`;

        beforeEach(() => {
            mockSauceFind.mockReset();
        });

        test('Responds with a message in JSON format, and status 200', async () => {
            mockSauceFind.mockResolvedValue(SAUCE_DATA);
            const response = await request(app).get('/api/sauces/').set('Authorization', authorizationHeader);

            expect(response.status).toBe(200);
            expect(response.type).toMatch(/json/);
            expect(response.body).toEqual(SAUCE_DATA);
        });

        test('Responds with an error and status 401 if the jwt is invalid', async () => {
            const invalidJwt = jsonWebToken.sign({ userId: '123' }, 'WRONG_KEY', {
                expiresIn: '24h',
            });
            const invalidAuthorizationHeader = `Bearer ${invalidJwt}`;
            const response = await request(app).get('/api/sauces/').set('Authorization', invalidAuthorizationHeader);

            expect(response.status).toBe(401);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
        });

        test("Responds with an error and status 401 if the jwt doesn't contain the userId", async () => {
            const invalidJwt = jsonWebToken.sign({ useless: '123' }, 'RANDOM_SECRET_KEY', {
                expiresIn: '24h',
            });
            const invalidAuthorizationHeader = `Bearer ${invalidJwt}`;
            const response = await request(app).get('/api/sauces/').set('Authorization', invalidAuthorizationHeader);

            expect(response.status).toBe(401);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
        });

        test('Responds with an error and status 500 if the fetching fails', async () => {
            mockSauceFind.mockRejectedValueOnce({ message: 'Fetch fails' });
            const response = await request(app).get('/api/sauces/').set('Authorization', authorizationHeader);

            expect(response.status).toBe(500);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('GET api/sauces/:id', () => {
        const jwt = jsonWebToken.sign({ userId: '123' }, 'RANDOM_SECRET_KEY', {
            expiresIn: '24h',
        });
        const authorizationHeader = `Bearer ${jwt}`;
        const requestUrl = `/api/sauces/${SAUCE_DATA[0]._id}`;

        beforeEach(() => {
            mockSauceFindById.mockReset();
        });

        test('Responds with a message in JSON format, and status 200', async () => {
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);
            const response = await request(app).get(requestUrl).set('Authorization', authorizationHeader);

            expect(response.status).toBe(200);
            expect(response.type).toMatch(/json/);
            expect(response.body).toEqual(SAUCE_DATA[0]);
        });

        test('Responds with an error and status 401 if the jwt is invalid', async () => {
            const invalidJwt = jsonWebToken.sign({ userId: '123' }, 'WRONG_KEY', {
                expiresIn: '24h',
            });
            const invalidAuthorizationHeader = `Bearer ${invalidJwt}`;
            const response = await request(app).get(requestUrl).set('Authorization', invalidAuthorizationHeader);

            expect(response.status).toBe(401);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
        });

        test("Responds with an error and status 401 if the jwt doesn't contain the userId", async () => {
            const invalidJwt = jsonWebToken.sign({ useless: '123' }, 'RANDOM_SECRET_KEY', {
                expiresIn: '24h',
            });
            const invalidAuthorizationHeader = `Bearer ${invalidJwt}`;
            const response = await request(app).get(requestUrl).set('Authorization', invalidAuthorizationHeader);

            expect(response.status).toBe(401);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
        });

        test('Responds with an error and status 500 if the fetching fails', async () => {
            mockSauceFindById.mockRejectedValueOnce({ message: 'Fetch fails' });
            const response = await request(app).get(requestUrl).set('Authorization', authorizationHeader);

            expect(response.status).toBe(500);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
        });

        test("Responds with an error and status 404 if the document can't be found", async () => {
            const badRequestUrl = '/api/sauces/000000000';
            mockSauceFindById.mockResolvedValueOnce(null);
            const response = await request(app).get(badRequestUrl).set('Authorization', authorizationHeader);

            expect(response.status).toBe(404);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
        });

        test("Responds with an error and status 404 if the document can't be found and an error is thrown", async () => {
            const badRequestUrl = '/api/sauces/000000000';
            mockSauceFindById.mockRejectedValueOnce({ message: 'Fetch fails', name: 'DocumentNotFoundError' });
            const response = await request(app).get(badRequestUrl).set('Authorization', authorizationHeader);

            expect(response.status).toBe(404);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
        });

        test('Responds with an error and status 400 if the id is incorrect', async () => {
            const badRequestUrl = '/api/sauces/000000000';
            mockSauceFindById.mockRejectedValueOnce({ message: 'Cast fails', name: 'CastError' });
            const response = await request(app).get(badRequestUrl).set('Authorization', authorizationHeader);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('PUT api/sauces/:id', () => {
        const sauceData = JSON.parse(JSON.stringify(SAUCE_DATA[0]));
        delete sauceData._id;
        delete sauceData.userId;
        delete sauceData.imageUrl;
        delete sauceData.likes;
        delete sauceData.dislikes;
        delete sauceData.usersLiked;
        delete sauceData.usersDisliked;

        const imagePath = join(dirname(fileURLToPath(import.meta.url)), '../images/test.png');

        const jwt = jsonWebToken.sign({ userId: SAUCE_DATA[0].userId }, 'RANDOM_SECRET_KEY', {
            expiresIn: '24h',
        });
        const authorizationHeader = `Bearer ${jwt}`;
        const requestUrl = `/api/sauces/${SAUCE_DATA[0]._id}`;

        test('Responds with a message in JSON format, and status 200 with an image', async () => {
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);
            mockSauceUpdateOne.mockResolvedValue(null);

            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .field('sauce', JSON.stringify(sauceData), { contentType: 'application/json' })
                .attach('image', imagePath);

            expect(response.status).toBe(200);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('message');
            expect(mockSauceFindById).toHaveBeenCalled();
            expect(mockSauceUpdateOne).toHaveBeenCalled();
            expect(mockSauceUpdateOne.mock.calls[0][1]).toHaveProperty('imageUrl');
        });

        test('Responds with a message in JSON format, and status 200 with no image', async () => {
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);
            mockSauceUpdateOne.mockResolvedValue(null);

            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .send(sauceData);

            expect(response.status).toBe(200);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('message');
            expect(mockSauceFindById).toHaveBeenCalled();
            expect(mockSauceUpdateOne).toHaveBeenCalled();
        });

        test('Responds with an error and status 400 if the name is invalid', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            invalidSauceData.name = true;
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);

            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .field('sauce', JSON.stringify(invalidSauceData), { contentType: 'application/json' })
                .attach('image', imagePath);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/name/);
        });

        test('Responds with an error and status 400 if the name is invalid and no image is sent', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            invalidSauceData.name = true;
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);

            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .send(invalidSauceData);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/name/);
        });

        test('Responds with a message in JSON format, and status 200 if name is absent', async () => {
            const updatedSauceData = JSON.parse(JSON.stringify(sauceData));
            delete updatedSauceData.name;
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);
            mockSauceUpdateOne.mockResolvedValue(null);

            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .send(updatedSauceData);

            expect(response.status).toBe(200);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('message');
            expect(mockSauceFindById).toHaveBeenCalled();
            expect(mockSauceUpdateOne).toHaveBeenCalled();
        });

        test('Responds with an error and status 400 if the heat is invalid', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            invalidSauceData.heat = true;
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);

            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .field('sauce', JSON.stringify(invalidSauceData), { contentType: 'application/json' })
                .attach('image', imagePath);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/heat/);
        });

        test('Responds with an error and status 400 if the heat is invalid and no image is sent', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            invalidSauceData.heat = true;
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);

            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .send(invalidSauceData);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/heat/);
        });

        test('Responds with a message in JSON format, and status 200 if heat is absent', async () => {
            const updatedSauceData = JSON.parse(JSON.stringify(sauceData));
            delete updatedSauceData.heat;
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);
            mockSauceUpdateOne.mockResolvedValue(null);

            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .send(updatedSauceData);

            expect(response.status).toBe(200);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('message');
            expect(mockSauceFindById).toHaveBeenCalled();
            expect(mockSauceUpdateOne).toHaveBeenCalled();
        });

        test('Responds with an error and status 400 if the heat is outside the boundaries', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            invalidSauceData.heat = 13;
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);

            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .field('sauce', JSON.stringify(invalidSauceData), { contentType: 'application/json' })
                .attach('image', imagePath);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/heat/);
        });

        test('Responds with an error and status 400 if the heat is outside the boundaries and no file is sent', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            invalidSauceData.heat = 13;
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);

            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .send(invalidSauceData);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/heat/);
        });

        test('Responds with an error and status 400 if the description is invalid', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            invalidSauceData.description = true;
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);

            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .field('sauce', JSON.stringify(invalidSauceData), { contentType: 'application/json' })
                .attach('image', imagePath);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/description/);
        });

        test('Responds with an error and status 400 if the description is invalid and no file is sent', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            invalidSauceData.description = true;
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);

            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .send(invalidSauceData);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/description/);
        });

        test('Responds with a message in JSON format, and status 200 if description is absent', async () => {
            const updatedSauceData = JSON.parse(JSON.stringify(sauceData));
            delete updatedSauceData.description;
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);
            mockSauceUpdateOne.mockResolvedValue(null);

            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .send(updatedSauceData);

            expect(response.status).toBe(200);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('message');
            expect(mockSauceFindById).toHaveBeenCalled();
            expect(mockSauceUpdateOne).toHaveBeenCalled();
        });

        test('Responds with an error and status 400 if the manufacturer is invalid', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            invalidSauceData.manufacturer = true;
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);

            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .field('sauce', JSON.stringify(invalidSauceData), { contentType: 'application/json' })
                .attach('image', imagePath);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/manufacturer/);
        });

        test('Responds with an error and status 400 if the manufacturer is invalid and no file is sent', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            invalidSauceData.manufacturer = true;
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);

            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .send(invalidSauceData);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/manufacturer/);
        });

        test('Responds with a message in JSON format, and status 200 if manufacturer is absent', async () => {
            const updatedSauceData = JSON.parse(JSON.stringify(sauceData));
            delete updatedSauceData.manufacturer;
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);
            mockSauceUpdateOne.mockResolvedValue(null);

            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .send(updatedSauceData);

            expect(response.status).toBe(200);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('message');
            expect(mockSauceFindById).toHaveBeenCalled();
            expect(mockSauceUpdateOne).toHaveBeenCalled();
        });

        test('Responds with an error and status 400 if the main pepper is invalid', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            invalidSauceData.mainPepper = true;
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);

            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .field('sauce', JSON.stringify(invalidSauceData), { contentType: 'application/json' })
                .attach('image', imagePath);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/mainPepper/);
        });

        test('Responds with an error and status 400 if the main pepper is invalid and no file is sent', async () => {
            const invalidSauceData = JSON.parse(JSON.stringify(sauceData));
            invalidSauceData.mainPepper = true;
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);

            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .send(invalidSauceData);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error[0]).toHaveProperty('message');
            expect(response.body.error[0].message).toMatch(/mainPepper/);
        });

        test('Responds with a message in JSON format, and status 200 if main pepper is absent', async () => {
            const updatedSauceData = JSON.parse(JSON.stringify(sauceData));
            delete updatedSauceData.mainPepper;
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);
            mockSauceUpdateOne.mockResolvedValue(null);

            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .send(updatedSauceData);

            expect(response.status).toBe(200);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('message');
            expect(mockSauceFindById).toHaveBeenCalled();
            expect(mockSauceUpdateOne).toHaveBeenCalled();
        });

        test('Responds with an error and status 401 if the jwt is invalid', async () => {
            const invalidJwt = jsonWebToken.sign({ userId: '123' }, 'WRONG_KEY', {
                expiresIn: '24h',
            });
            const invalidAuthorizationHeader = `Bearer ${invalidJwt}`;
            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', invalidAuthorizationHeader)
                .send(sauceData);

            expect(response.status).toBe(401);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
        });

        test("Responds with an error and status 401 if the jwt doesn't contain the userId", async () => {
            const invalidJwt = jsonWebToken.sign({ useless: '123' }, 'RANDOM_SECRET_KEY', {
                expiresIn: '24h',
            });
            const invalidAuthorizationHeader = `Bearer ${invalidJwt}`;
            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', invalidAuthorizationHeader)
                .send(sauceData);

            expect(response.status).toBe(401);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
        });

        test("Responds with an error and status 403 if the user doesn't have the right to manipulate the sauce", async () => {
            const invalidJwt = jsonWebToken.sign({ userId: '123' }, 'RANDOM_SECRET_KEY', {
                expiresIn: '24h',
            });
            const invalidAuthorizationHeader = `Bearer ${invalidJwt}`;
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);
            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', invalidAuthorizationHeader)
                .send(sauceData);

            expect(response.status).toBe(403);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
        });

        test('Responds with an error and status 400 if the update fails due to validation error', async () => {
            mockSauceUpdateOne.mockRejectedValueOnce({ message: 'Save fail', name: 'ValidationError' });
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);
            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .send(sauceData);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
        });

        test('Responds with an error and status 500 if the update fails', async () => {
            mockSauceUpdateOne.mockRejectedValueOnce({ message: 'Save fail' });
            mockSauceFindById.mockResolvedValue(SAUCE_DATA[0]);
            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .send(sauceData);

            expect(response.status).toBe(500);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
        });

        test('Responds with an error and status 500 if the fetching fails', async () => {
            mockSauceFindById.mockRejectedValueOnce({ message: 'Save fail' });
            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .send(sauceData);

            expect(response.status).toBe(500);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
        });

        test("Responds with an error and status 404 if the document can't be found", async () => {
            mockSauceFindById.mockResolvedValue(null);
            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .send(sauceData);

            expect(response.status).toBe(404);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
        });

        test.skip("Responds with an error and status 404 if the document can't be found and an error is thrown", async () => {
            mockSauceFindById.mockRejectedValueOnce({ message: 'Save fail', name: 'DocumentNotFoundError' });
            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .send(sauceData);

            expect(response.status).toBe(404);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
        });

        test.skip('Responds with an error and status 400 if the id is incorrect', async () => {
            mockSauceFindById.mockRejectedValueOnce({ message: 'Save fail', name: 'CastError' });
            const response = await request(app)
                .put(requestUrl)
                .set('Authorization', authorizationHeader)
                .send(sauceData);

            expect(response.status).toBe(400);
            expect(response.type).toMatch(/json/);
            expect(response.body).toHaveProperty('error');
        });
    });
});
