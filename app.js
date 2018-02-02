//一旦完成
'use strict';
const Twitter = require('twitter');
const cron = require('cron').CronJob;

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


function isCheckedTweet(homeTimeLineTweet) {
  // ボット自身のツイートは無視する。
  if (homeTimeLineTweet.user.screen_name === '22_kuro_bot') {
    return true;
  }
  for (let checkedTweet of checkedTweets) {
    // 同内容を連続投稿をするアカウントがあるため、一度でも返信した内容は返信しない仕様にしています。
    if (checkedTweet.id_str === homeTimeLineTweet.id_str || checkedTweet.text === homeTimeLineTweet.text) {
      return true;
    }
  }
  return false;
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





//変更予定
// const cronJob = new cron({
//   cronTime: '00 0-59/1 * * * *', // 1分ごとに実行
//   start: true, // newした後即時実行するかどうか
//   onTick: function () {
//     getUser();
//   }
// });




//関数に入れて使うこと！

// client.post('direct_messages/new', {
//   user_id: 'ユーザーID',
//   text: 'Hello Direct Message!'
// })
// .then((response) => {
//   console.log(response);
// })
// .catch((error) => {
//   console.log(error);
// });





// export TWITTER_API_CONSUMER_KEY="sl6QJ0NmAv3V198AJWF6m2lBR"
// export TWITTER_API_CONSUMER_SECRET="DXEQgZ35wVcrlUoZPCIQvBbN1UgVB686CmU0MdshhURJBDQZFE"
// export TWITTER_API_ACCESS_TOKEN_KEY="953101260307103745-Fb8hDl5zcXleyP7HoeNP66C9C46oK88"
// export TWITTER_API_ACCESS_TOKEN_SECRET="rAHhPSxgdsgf5Hs7Ik5W8FTVPakVM2evawaTtPxhrHl73"

