var Twitter = require('twitter');
const Octokit = require('@octokit/rest')
const path = require('path')

require('dotenv').config({ path: path.resolve(__dirname, './.env') })

const CLquery = process.argv[2];

const runDate = new Date();

var client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});



const octokit = Octokit({
    auth: process.env.GITHUB_AUTH_TOKEN,
    previews: ['cloak-preview']
})

let words = ["fuck", "shit", "damn", "ass", "motherfucker", "goddamn", "asshole", "unfucked", "unfuck", "fucky", "shitty", "piece of shit", "hate javascript", "fucking", "bitch", "bitchy","bitches", "fucked", "cunt", "bastard", "hell", "shitass"]

const searchCommits = function () {

    let wordCount = words.length - 1;
    let word = words[Math.floor(Math.random() * wordCount)]

    if (CLquery != null) {

        var options = { q: '"' + word + '" "' + CLquery + '"' }
    } else {

        var options = { q: word }
    }
    var commit = octokit.search.commits(options).then(({ data }) => {
        // handle data

        let commitCounts = data.items.length - 1;
        let commit = data.items[Math.floor(Math.random() * commitCounts)]
        return commit
    })


    return commit

}

function doesItCuss(string, words) {

    for (var i = 0; i < words.length; i++) {
        if (string.toLowerCase().indexOf(words[i]) > -1) {
            return false;
        }
    }
    return true;
}



const formatTweet = function (tweetData) {
    let { message, languages } = tweetData
    let tweet;
    console.log("Unformatted: " + message);
    // Strip Merge Commit Messages
    message = message.replace(/(Merge (branch|pull request) (#[0-9]*|'[A-z0-9]*') (from|of) [A-z0-9.\-\+\:\@]*\/[A-z0-9.\-]*\r*\n*)/, '')
    //strip emails
    message = message.replace(/([^.@\s]+)(\.[^.@\s]+)*@([^.@\s]+\.)+([^.@\s]+)/, "[Email Removed]")
    //strip urls
    message = message.replace(/(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/, '[url removed]');
    tweet = '"' + message + '"\n~ ~ ~ ~ ~\n' + languages

    if (doesItCuss(message, words)) {
        throw "no cusswords in formatted message: " + message;
    }
    if (message.split(' ').length > 2) {
        return tweet

    } else { throw "Commit Message Too Short: " + message; }

}


const postTweet = function (tweet) {
    console.log(tweet);
    tweetData = { status: tweet }

    if (process.env.TWEET === "true") {

        client.post('statuses/update', tweetData, function (err, response) {
            if (err) { throw (err) } else {

                console.log("\nSUCCESS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n");
                console.log(runDate +'\n');
                console.log('Tweeted: ', tweet)
                console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
                console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n");
            }
        });
    } else {
        
        throw "Tweeting Skipped";
    }

}

const getLanguages = function (commit) {
    const { repository } = commit
    var owner = repository.owner.login
    var repo = repository.name
    return octokit.repos.listLanguages({
        owner,
        repo
    }).then((res) => {
        const { data } = res
        const sumValues = obj => Object.values(obj).reduce((a, b) => a + b);
        const totalBytes = sumValues(data);
        let languages = [];
        const objLength = Object.keys(data).length
        let i = 0;
        for (let [language, bytes] of Object.entries(data)) {
            if (data.hasOwnProperty(language)) {
                // do stuff
                i++;
                language = (language === "C#" ? "CSharp" : language)
                language = (language === "C++" ? "CPlusPlus" : language)
                language = language.replace(/\s+/g, '');

                var percent = ((bytes / totalBytes) * 100).toFixed(2)

                if (percent < 0.5) { break; }

                percent = (percent < 1 ? "<1" : percent)

                languages += percent + "% #" + language
                languages += (objLength > 1 ? (i >= objLength ? "" : ", ") : "")
            }
        }
        return { message: commit.commit.message, languages: languages }
    });

}




searchCommits()
    .then(getLanguages)
    .then(formatTweet)
    .then(postTweet).catch(function (err) {
        console.error("\nERROR ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n");
        console.error(runDate +'\n');
        console.error(err);
        console.error("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        console.error("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n");


        return err;
    }).then(() => { return false; });

