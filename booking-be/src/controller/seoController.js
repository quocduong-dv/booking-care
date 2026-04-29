import db from '../models/index';

const SITE_URL = process.env.SITE_URL || 'https://bookingcare.vn';

const robots = (req, res) => {
    res.type('text/plain');
    res.send(
        `User-agent: *\n` +
        `Allow: /\n` +
        `Disallow: /system/\n` +
        `Disallow: /doctor/\n` +
        `Disallow: /api/\n` +
        `Sitemap: ${SITE_URL}/sitemap.xml\n`
    );
};

const sitemap = async (req, res) => {
    try {
        const urls = [];
        const add = (loc, priority = '0.7', changefreq = 'weekly') => urls.push({ loc, priority, changefreq });

        add(`${SITE_URL}/`, '1.0', 'daily');
        add(`${SITE_URL}/home`, '1.0', 'daily');
        add(`${SITE_URL}/more-specialty`, '0.8', 'weekly');
        add(`${SITE_URL}/more-telemedicine`, '0.7', 'weekly');

        const [doctors, specialties, clinics, handbooks] = await Promise.all([
            db.User.findAll({ where: { roleId: 'R2' }, attributes: ['id'], raw: true }),
            db.Specialty.findAll({ attributes: ['id'], raw: true }),
            db.Clinic.findAll({ attributes: ['id'], raw: true }),
            db.Handbook.findAll({ attributes: ['id'], raw: true })
        ]);
        doctors.forEach(d => add(`${SITE_URL}/detail-doctor/${d.id}`, '0.7'));
        specialties.forEach(s => add(`${SITE_URL}/detail-specialty/${s.id}`, '0.7'));
        clinics.forEach(c => add(`${SITE_URL}/detail-clinic/${c.id}`, '0.7'));
        handbooks.forEach(h => add(`${SITE_URL}/detail-handbook/${h.id}`, '0.5'));

        const xml =
            `<?xml version="1.0" encoding="UTF-8"?>\n` +
            `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
            urls.map(u =>
                `  <url>\n` +
                `    <loc>${u.loc}</loc>\n` +
                `    <changefreq>${u.changefreq}</changefreq>\n` +
                `    <priority>${u.priority}</priority>\n` +
                `  </url>`).join('\n') + '\n' +
            `</urlset>\n`;

        res.type('application/xml');
        res.send(xml);
    } catch (e) {
        res.status(500).send('sitemap error');
    }
};

export default { robots, sitemap };
