async function screenShot(url) {

  var puppeteer = require("puppeteer")

  try {

    const browser = await puppeteer.launch({ args: ['--no-sandbox'], timeout: 30000 });
    const page = await browser.newPage();

    await page.goto(url);
    await page.screenshot({ "path": "path/to/png or jpg" });
    await browser.close();

    console.log("OK")

  } catch (e) {
    console.log(e)
  }
}