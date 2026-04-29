import medicineBatchService from '../servies/medicineBatchService';

const addBatch = async (req, res) => {
    try {
        const result = await medicineBatchService.addBatch({
            ...req.body,
            userId: req.user?.id
        });
        return res.status(200).json(result);
    } catch (e) {
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

const getBatchesByMedicine = async (req, res) => {
    try {
        const result = await medicineBatchService.getBatchesByMedicine({
            medicineId: req.query.medicineId
        });
        return res.status(200).json(result);
    } catch (e) {
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

const deleteBatch = async (req, res) => {
    try {
        const result = await medicineBatchService.deleteBatch({
            id: req.body?.id || req.query?.id,
            userId: req.user?.id
        });
        return res.status(200).json(result);
    } catch (e) {
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

const getExpiringSoon = async (req, res) => {
    try {
        const result = await medicineBatchService.getExpiringSoon({
            days: req.query.days || 30
        });
        return res.status(200).json(result);
    } catch (e) {
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

module.exports = {
    addBatch,
    getBatchesByMedicine,
    deleteBatch,
    getExpiringSoon
};
