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

var promise = new Promise((resolve, reject) => {
 return getHomeTimeLine();
}).then(() => {
  sendReply();
})
// getHomeTimeLine();
// sendReply();



function getHomeTimeLine() {
  console.log("ok");
  client.get('statuses/home_timeline', {}, function (error, tweets, response) {
    if (!error) {
      // 初回起動時は取得するだけで終了
      if (checkedTweets.length === 0) {
        console.log("チェック")
        tweets.forEach(function (homeTimeLineTweet, key) {
          checkedTweets.push(homeTimeLineTweet); // 配列に追加
          if (!tweetUserScreenName.includes(homeTimeLineTweet.user.screen_name) && homeTimeLineTweet.user.followers_count >= 10000) {
            tweetUserScreenName.push(homeTimeLineTweet.user.screen_name)
          }
        });
        console.log("ユーザーネーム" + tweetUserScreenName)
        sendReply();
      }
    } else {
      console.log(error)
    }

  //   // console.log(tweets)
  //   tweets.forEach(function (homeTimeLineTweet, key) {
  //     if (isCheckedTweet(homeTimeLineTweet) === false) {
  //       newTweets.push(homeTimeLineTweet); // 新しいツイートを追加
  //       if (!tweetUserScreenName.includes(homeTimeLineTweet.user.screen_name)) {
  //         tweetUserScreenName.push(homeTimeLineTweet.user.screen_name)
  //       }
  //     }
  //   });
  //   // console.log("チェック済み:", checkedTweets)
  //   console.log("チェック レン:", checkedTweets.length)
  //   // 調査済みリストに追加と、千個を超えていたら削除
  //   checkedTweets = newTweets.concat(checkedTweets); // 配列の連結

  //   if (checkedTweets.length > 1000) {
  //     checkedTweets.length = 1000;// 古い要素を消して要素数を1000個にする。
  //   } else {
  //     console.log(error);
  //   }
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

  console.log("ユーザスクリンネーム　後", tweetUserScreenName)

  let random = Math.floor(Math.random() * tweetUserScreenName.length);

  let randomUserScreenName = tweetUserScreenName[random]
  console.log(randomUserScreenName)
  client.get('search/tweets', { from: `${randomUserScreenName}`, result_type: "popular", count: 1 }, function (error, tweets, response) {
    console.log(tweets);
    let popularTweetId = tweets.statuses[0].id_str;
    let userName = tweets.statuses[0].user.name;
    console.log("なめ", userName)
    console.log("ポピュラー", popularTweetId)

    const stream = client.stream('statuses/filter', { track: '22_kuro_bot' });
    stream.on('data', function (tweet) {
      const tweetMessage = '@' + tweet.user.screen_name + ` https://twitter.com/${randomUserScreenName}/status/${popularTweetId}` + ` ${userName}さんの人気のツイートです。`;
      client.post('statuses/update', {
        status: tweetMessage,
        in_reply_to_status_id: tweet.id_str
      })
        .then((tweet) => {
          console.log(tweet);
          console.log("前", random)
          console.log("前ーーーーーーー", tweetUserScreenName.length)          
          random = Math.floor(Math.random() * tweetUserScreenName.length);
          console.log("後", random)
          return;
        })
        .catch((error) => {
          console.log(error)
          throw error;
        });
    });

    stream.on('error', function (error) {
      throw error;
    });

    
  });

}





//変更予定
// const cronJob = new cron({
//   cronTime: '00 0-59/1 * * * *', // 1分ごとに実行
//   start: true, // newした後即時実行するかどうか
//   onTick: function () {
//     getHomeTimeLine();
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






// function getTweetUserId(homeTimeLineTweet){
//   if(!tweetUserId.includes(homeTimeLineTweet.user.id_str)){
//     tweetUserId.push(homeTimeLineTweet.user.id_str)
//   }
// }

// function userIdSe(checkedTweets){
// }

// function searchTweet(homeTimeLineTweet) {
// }


// const responses = ['面白い！', 'すごい！', 'なるほど！'];
// function responseHomeTimeLine(homeTimeLineTweet) {
//   const tweetMessage = '@' + homeTimeLineTweet.user.screen_name + '「' + homeTimeLineTweet.text + '」 ' + responses[Math.floor(Math.random() * responses.length)];
//   client.post('statuses/update', {
//     status: tweetMessage,
//     in_reply_to_status_id: homeTimeLineTweet.id_str
//   })
//     .then((tweet) => {
//       console.log("tweet:",tweet);
//     })
//     .catch((error) => {
//       throw error;
//     });
// }


