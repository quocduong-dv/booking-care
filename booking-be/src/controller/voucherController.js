import voucherService from '../servies/voucherService';

const validate = async (req, res) => {
    try {
        const { code, amount } = req.body || {};
        const r = await voucherService.validateVoucher({ code, amount });
        return res.status(200).json(r);
    } catch (e) {
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

const list = async (req, res) => {
    try {
        const activeOnly = req.query.activeOnly === '1';
        const r = await voucherService.listVouchers({ activeOnly });
        return res.status(200).json(r);
    } catch (e) { return res.status(200).json({ errCode: -1 }); }
};

const create = async (req, res) => {
    try { return res.status(200).json(await voucherService.createVoucher(req.body)); }
    catch (e) { return res.status(200).json({ errCode: -1 }); }
};

const update = async (req, res) => {
    try { return res.status(200).json(await voucherService.updateVoucher(req.body)); }
    catch (e) { return res.status(200).json({ errCode: -1 }); }
};

const remove = async (req, res) => {
    try { return res.status(200).json(await voucherService.deleteVoucher(req.body && req.body.id)); }
    catch (e) { return res.status(200).json({ errCode: -1 }); }
};

export default { validate, list, create, update, remove };
