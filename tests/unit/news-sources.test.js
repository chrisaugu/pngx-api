const mongoose = require('mongoose');
const NewsSource = require('../../models/news-source.model');

describe('NewsSource Model', () => {
    beforeAll(async () => {
        await mongoose.connect(global.__MONGO_URI__, {
        });
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await NewsSource.deleteMany({});
    });

    it('should create and save news source successfully', async () => {
        const validNewsSource = new NewsSource({
            name: 'Test News',
            url: 'https://test.com/api/news'
        });

        const savedNewsSource = await validNewsSource.save();

        expect(savedNewsSource._id).toBeDefined();
        expect(savedNewsSource.name).toBe(validNewsSource.name);
        expect(savedNewsSource.url).toBe(validNewsSource.url);
        expect(savedNewsSource.createdAt).toBeDefined();
        expect(savedNewsSource.updatedAt).toBeDefined();
    });

    it('should fail when name is missing', async () => {
        const newsSourceWithoutName = new NewsSource({
            url: 'https://test.com/api/news'
        });

        let error;
        try {
            await newsSourceWithoutName.save();
        } catch (err) {
            error = err;
        }

        expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(error.errors.name).toBeDefined();
    });

    it('should fail when url is missing', async () => {
        const newsSourceWithoutUrl = new NewsSource({
            name: 'Test News'
        });

        let error;
        try {
            await newsSourceWithoutUrl.save();
        } catch (err) {
            error = err;
        }

        expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(error.errors.url).toBeDefined();
    });

    it('should trim whitespace from name and url', async () => {
        const newsSource = new NewsSource({
            name: '  Test News  ',
            url: '  https://test.com/api/news  '
        });

        const savedNewsSource = await newsSource.save();

        expect(savedNewsSource.name).toBe('Test News');
        expect(savedNewsSource.url).toBe('https://test.com/api/news');
    });
});