const express = require('express');
const puppeteer = require('puppeteer-core');

const app = express();
app.use(express.json());

let browser;
let page;
let monitoring = false;

app.get('/api/monitoring/config', (req, res) => {
    res.json({ success: true, isMonitoring: monitoring });
});

app.post('/api/monitoring/start', async (req, res) => {
    if (monitoring) return res.json({ success: true });

    monitoring = true;

   browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
});
    page = await browser.newPage();

    setInterval(async () => {
        if (!monitoring) return;

        try {
            await page.goto('https://welcome.visas-be.tlscontact.com/', { waitUntil: 'networkidle2' });

            const text = await page.content();

            if (!text.toLowerCase().includes("no appointment")) {
                console.log("🔥 SLOT AVAILABLE");
            } else {
                console.log("No slot yet");
            }

        } catch (e) {
            console.log("Error checking:", e.message);
        }

    }, 60000);

    res.json({ success: true });
});

app.post('/api/monitoring/stop', async (req, res) => {
    monitoring = false;
    if (browser) await browser.close();
    res.json({ success: true });
});

app.listen(process.env.PORT || 10000, () => {
    console.log("Server running");
});

