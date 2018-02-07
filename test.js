const puppeteer = require("puppeteer");

function weatherGet(){

  (async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://weather.yahoo.co.jp/weather/jp/11/4310/11101.html?rd=1");

    const clip = await page.evaluate(() => {
      const element = document.querySelector("#yjw_pinpoint_today");
      const {x, y, width, height} = element.getBoundingClientRect();
      return {x, y, width, height};
    });

    let image = await page.screenshot({clip, type:"jpeg", quality:100, path: "example1.jpg"});

    await browser.close();
  })();

}