var Twitter = require('twitter');
const Octokit = require('@octokit/rest')
const config = require('./config.js');
require('dotenv').config()

var client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});


client.get("favorites/list", {count: 200}, function (err, response) {

    response.forEach(function(data){

        client.post('favorites/destroy', {id: data.id_str}, function (err, response) {

            if(err){
                console.log(err);
            }


        })
    })

})