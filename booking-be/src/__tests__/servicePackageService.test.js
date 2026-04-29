jest.mock('../models/index', () => ({
    ServicePackage: {
        findAll: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        destroy: jest.fn()
    }
}));

const db = require('../models/index');
const svc = require('../servies/servicePackageService').default;

beforeEach(() => jest.clearAllMocks());

describe('listPublic', () => {
    test('filters inactive out by default', async () => {
        db.ServicePackage.findAll.mockResolvedValueOnce([]);
        await svc.listPublic();
        const callArgs = db.ServicePackage.findAll.mock.calls[0][0];
        expect(callArgs.where.isActive).toBe(true);
    });

    test('applies featured filter when requested', async () => {
        db.ServicePackage.findAll.mockResolvedValueOnce([]);
        await svc.listPublic({ featured: '1' });
        const callArgs = db.ServicePackage.findAll.mock.calls[0][0];
        expect(callArgs.where.isFeatured).toBe(true);
    });
});

describe('create', () => {
    test('rejects when name missing', async () => {
        const r = await svc.create({});
        expect(r.errCode).toBe(1);
    });

    test('auto-slugifies when slug not provided', async () => {
        db.ServicePackage.create.mockResolvedValueOnce({ id: 1 });
        await svc.create({ name: 'Goi kham tong quat', priceSale: 500000 });
        const payload = db.ServicePackage.create.mock.calls[0][0];
        expect(payload.slug).toMatch(/^[a-z0-9-]+$/);
    });
});
