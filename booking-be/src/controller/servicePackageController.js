import servicePackageService from '../servies/servicePackageService';

const listPublic = async (req, res) => {
    try {
        const r = await servicePackageService.listPublic({
            featured: req.query.featured,
            specialtyId: req.query.specialtyId,
            clinicId: req.query.clinicId,
            limit: req.query.limit
        });
        return res.status(200).json(r);
    } catch (e) { return res.status(200).json({ errCode: -1 }); }
};
const getDetail = async (req, res) => {
    try {
        const r = await servicePackageService.getDetail(req.query.id || req.query.slug);
        return res.status(200).json(r);
    } catch (e) { return res.status(200).json({ errCode: -1 }); }
};
const listAdmin = async (req, res) => {
    try { return res.status(200).json(await servicePackageService.listAdmin({ q: req.query.q })); }
    catch (e) { return res.status(200).json({ errCode: -1 }); }
};
const create = async (req, res) => {
    try { return res.status(200).json(await servicePackageService.create(req.body)); }
    catch (e) { return res.status(200).json({ errCode: -1 }); }
};
const update = async (req, res) => {
    try { return res.status(200).json(await servicePackageService.update(req.body)); }
    catch (e) { return res.status(200).json({ errCode: -1 }); }
};
const remove = async (req, res) => {
    try { return res.status(200).json(await servicePackageService.remove(req.body && req.body.id)); }
    catch (e) { return res.status(200).json({ errCode: -1 }); }
};

export default { listPublic, getDetail, listAdmin, create, update, remove };
