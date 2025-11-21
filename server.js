const express = require("express");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");

const app = express();
app.use(bodyParser.json({ limit: "10mb" }));

app.get("/", (req, res) => res.send("Puppeteer Renderer is up!"));

app.post("/render", async (req, res) => {
  const html = req.body.html;
  if (!html) return res.status(400).json({ error: "Missing html" });

  let browser;
  try {
    // Launch puppeteer.
    // Note: ghcr.io/puppeteer/puppeteer image has chrome installed.
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 });

    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    const buffer = await page.screenshot({
      type: "jpeg",
      quality: 90,
      omitBackground: false,
    });

    const jpgBase64 = buffer.toString("base64");
    res.json({ jpgBase64, mime: "image/jpeg" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    if (browser) await browser.close();
  }
});

const port = process.env.PORT || 9000;
app.listen(port, () => console.log(`Listening on ${port}`));
