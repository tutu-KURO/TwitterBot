//一旦完成
'use strict';
const Twitter = require('twitter');
const cron = require('cron').CronJob;
const puppeteer = require("puppeteer");

let checkedTweets = [];
let newTweets = [];
let tweetUserScreenName = [];

const client = new Twitter({
  consumer_key: process.env.TWITTER_API_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_API_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_API_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_API_ACCESS_TOKEN_SECRET
});

console.log("ok")


let promise = new Promise((resolve, reject) => {
  return getUser();
}).then(() => {
  sendReply();
})


function getUser() {
  client.get("friends/ids", {
    screen_name: "22_kuro_bot", stringify_ids: true
  }, function (error, response, ids) {
    if (!error) {
      let followIds = JSON.parse(ids.body);
      console.log("フォロー", followIds.ids)
      let followIdsStr = followIds.ids.join(", ");
      client.get("users/lookup", { user_id: followIdsStr }, function (error, response, users) {
        console.log("おけ")
        let usersData = JSON.parse(users.body);
        for (let i = 0; i < usersData.length; i++) {
          console.log(usersData[i].screen_name)
          console.log(i)
          if (!tweetUserScreenName.includes(usersData[i].screen_name) && usersData[i].followers_count >= 10000) {
            console.log("前:", tweetUserScreenName)
            tweetUserScreenName.push(usersData[i].screen_name)
            console.log("後:", tweetUserScreenName)
          }
        }
        sendReply();
      });
    } else {
      console.log(error);
    }
  });
}

function sendReply() {
  const stream = client.stream('statuses/filter', { track: '22_kuro_bot' });
  stream.on('data', function (tweet) {

    console.log("元の配列:", tweetUserScreenName)
    let random = Math.floor(Math.random() * tweetUserScreenName.length);
    let randomUserScreenName = tweetUserScreenName[random]
    console.log("ランダムで選んだ人：", randomUserScreenName)

    client.get('search/tweets', { from: `${randomUserScreenName}`, result_type: "popular", count: 1 }, function (error, tweets, response) {
      console.log(tweets);
      let popularTweetId = tweets.statuses[0].id_str;
      let userName = tweets.statuses[0].user.name;
      console.log("選んだ人", userName)
      console.log("ポピュラー", popularTweetId)

      const tweetMessage = '@' + tweet.user.screen_name + ` https://twitter.com/${randomUserScreenName}/status/${popularTweetId}` + ` ${userName}さんの人気のツイートです。`;
      client.post('statuses/update', {
        status: tweetMessage,
        in_reply_to_status_id: tweet.id_str
      })
        .then((tweet) => {
          // console.log(tweet);
          return;
        })
        .catch((error) => {
          console.log(error)
          throw error;
        });
    });
  });

  stream.on('error', function (error) {
    throw error;
  });

}

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
  cronTime: "30 16 * * *",
//  cronTime: '30 6 * * *', // 1分ごとに実行
  start: true, // newした後即時実行するかどうか
  onTick: function () {
    weatherGet();
  }
});





// function isCheckedTweet(homeTimeLineTweet) {
//   // ボット自身のツイートは無視する。
//   if (homeTimeLineTweet.user.screen_name === '22_kuro_bot') {
//     return true;
//   }
//   for (let checkedTweet of checkedTweets) {
//     // 同内容を連続投稿をするアカウントがあるため、一度でも返信した内容は返信しない仕様にしています。
//     if (checkedTweet.id_str === homeTimeLineTweet.id_str || checkedTweet.text === homeTimeLineTweet.text) {
//       return true;
//     }
//   }
//   return false;
// }
