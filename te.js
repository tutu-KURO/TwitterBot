const puppeteer = require("puppeteer")
const Twitter = require('twitter');
const cron = require('cron').CronJob;



const client = new Twitter({
  consumer_key: process.env.TWITTER_API_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_API_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_API_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_API_ACCESS_TOKEN_SECRET
});

function weatherGet() {
  (async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://weather.yahoo.co.jp/weather/jp/11/4310/11107.html");

    const clip = await page.evaluate(() => {
      const element = document.querySelector("#yjw_pinpoint_today");
      const { x, y, width, height } = element.getBoundingClientRect();
      return { x, y, width, height };
    });

    let imageData = await page.screenshot({ clip, type: "jpeg", quality: 100 });
    await browser.close();
    console.log(imageData);

    client.post('media/upload', {media: imageData}, function(error, media, response) {
      if (!error) {
        console.log(media);
        let status = {
          status: '@22_kuroro yahoo天気予報から\nhttps://weather.yahoo.co.jp/weather/jp/11/4310/11107.html?rd=1',
          media_ids: media.media_id_string 
        }
        client.post('statuses/update', status, function(error, tweet, response) {
          if (!error) {
            console.log(tweet);
          }
        });
      }
    });
  })();
}


//変更予定
const cronJob = new cron({
  cronTime: '15 16 * * *', // 1分ごとに実行
  start: true, // newした後即時実行するかどうか
  onTick: function () {
    weatherGet();
  }
});