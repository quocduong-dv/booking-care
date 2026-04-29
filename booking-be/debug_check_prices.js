const db = require('./src/models/index');

async function check() {
    try {
        console.log("Connecting to DB...");
        const prices = await db.Allcode.findAll({
            where: { type: 'PRICE' },
            attributes: ['keyMap', 'valueEn', 'valueVi']
        });
        console.log(JSON.stringify(prices, null, 2));
    } catch (e) {
        console.error("Error:", e);
    }
}

check();
