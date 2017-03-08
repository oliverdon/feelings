'use strict';

const Twit = require('twit');
const sentiment = require('sentiment');

const keys = {
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
};

const T = new Twit(keys);

const express = require('express');
const app = express();
const expressWs = require('express-ws')(app);

let openSockets = [];

app.use('/', express.static('frontend'));

app.ws('/tweets', (ws, req) => {
    console.log('Socket Connected');
});

let socketServer = expressWs.getWss('/tweets');

app.listen(8089);


let stream = T.stream('statuses/filter', {track: 'brexit'});

stream.on('tweet', function (tweet) {
    let s = sentiment(tweet.text);
    let payload = {sentiment: s, tweet: tweet};

    socketServer.clients.forEach(client => {
        client.send(JSON.stringify(payload));
    })
});