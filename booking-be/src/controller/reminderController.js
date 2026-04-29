import reminderService from '../servies/reminderService';

const triggerPatientReminders = async (req, res) => {
    try {
        const result = await reminderService.sendPatient24hReminders();
        return res.status(200).json({ errCode: 0, data: result });
    } catch (e) {
        console.log(e);
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

module.exports = {
    triggerPatientReminders
};
