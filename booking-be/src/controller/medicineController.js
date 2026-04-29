import medicineService from '../servies/medicineService';

const wrap = (fn) => async (req, res) => {
    try { return res.status(200).json(await fn()); }
    catch (e) { console.log(e); return res.status(200).json({ errCode: -1, errMessage: 'Error from server' }); }
};

module.exports = {
    createMedicine: (req, res) => wrap(() => medicineService.createMedicine(req.body))(req, res),
    getMedicines: (req, res) => wrap(() => medicineService.getMedicines({
        q: req.query.q, limit: req.query.limit,
        activeOnly: req.query.activeOnly === 'true' || req.query.activeOnly === '1'
    }))(req, res),
    updateMedicine: (req, res) => wrap(() => medicineService.updateMedicine(req.body))(req, res),
    deleteMedicine: (req, res) => wrap(() => medicineService.deleteMedicine({ id: req.body?.id }))(req, res),
    adjustStock: (req, res) => wrap(() => medicineService.adjustStock({
        ...req.body,
        userId: req.user?.id || null
    }))(req, res),
    getStockMovements: (req, res) => wrap(() => medicineService.getStockMovements({
        medicineId: req.query.medicineId,
        limit: req.query.limit
    }))(req, res)
};
