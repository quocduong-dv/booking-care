import db from '../models/index';
import { Op } from 'sequelize';

const listPublic = async ({ featured, specialtyId, clinicId, limit } = {}) => {
    const where = { isActive: true };
    if (featured === '1' || featured === true) where.isFeatured = true;
    if (specialtyId) where.specialtyId = specialtyId;
    if (clinicId) where.clinicId = clinicId;
    const rows = await db.ServicePackage.findAll({
        where,
        order: [['isFeatured', 'DESC'], ['id', 'DESC']],
        limit: Math.min(parseInt(limit, 10) || 20, 100),
        raw: true
    });
    return { errCode: 0, data: rows };
};

const getDetail = async (idOrSlug) => {
    const where = /^\d+$/.test(String(idOrSlug))
        ? { id: Number(idOrSlug) }
        : { slug: idOrSlug };
    const pkg = await db.ServicePackage.findOne({ where, raw: true });
    if (!pkg) return { errCode: 2, errMessage: 'Khong tim thay goi kham' };
    return { errCode: 0, data: pkg };
};

const listAdmin = async ({ q } = {}) => {
    const where = {};
    if (q) where.name = { [Op.like]: `%${q}%` };
    const rows = await db.ServicePackage.findAll({ where, order: [['id', 'DESC']], raw: true });
    return { errCode: 0, data: rows };
};

const slugify = (s) => String(s || '').toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 200);

const create = async (data) => {
    if (!data.name || data.priceSale === undefined) {
        return { errCode: 1, errMessage: 'Thieu ten hoac gia' };
    }
    const row = await db.ServicePackage.create({
        name: data.name,
        slug: data.slug ? slugify(data.slug) : slugify(data.name),
        description: data.description || null,
        priceOriginal: data.priceOriginal || 0,
        priceSale: data.priceSale,
        image: data.image || null,
        specialtyId: data.specialtyId || null,
        clinicId: data.clinicId || null,
        includes: data.includes || null,
        isFeatured: !!data.isFeatured,
        isActive: data.isActive !== false
    });
    return { errCode: 0, data: row };
};

const update = async (data) => {
    if (!data.id) return { errCode: 1, errMessage: 'Thieu id' };
    const row = await db.ServicePackage.findOne({ where: { id: data.id }, raw: false });
    if (!row) return { errCode: 2, errMessage: 'Khong tim thay' };
    ['name', 'slug', 'description', 'priceOriginal', 'priceSale', 'image',
        'specialtyId', 'clinicId', 'includes', 'isFeatured', 'isActive']
        .forEach((k) => { if (Object.prototype.hasOwnProperty.call(data, k)) row[k] = data[k]; });
    await row.save();
    return { errCode: 0 };
};

const remove = async (id) => {
    if (!id) return { errCode: 1, errMessage: 'Thieu id' };
    await db.ServicePackage.destroy({ where: { id } });
    return { errCode: 0 };
};

export default { listPublic, getDetail, listAdmin, create, update, remove };
