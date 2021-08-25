const fetch = require('node-fetch');
const fs = require('fs');
const data = require('./data.js');
var articles = require('./articles.json');

// news data //
newNews = false;
topNews = "https://hacker-news.firebaseio.com/v0/topstories.json";

// commands list //
cmdlist  = [".roleme", "Allows new members access to the server.",
            " .ip ", " I can give you IP/URL info.",
            ".ping", " My current reponse time.",
            ".joke", " Do you know what jokes are?",
            ".fact", " I'm full of random knowledge.",
            ".fuck", " Your Mom."]


module.exports = {
// JOKES and FACTS
    infoman: function(command, msg) {
        output = []
        switch (command) {
            case "joke":
                output = data.joker;
                break;
            case "fact":
                output = data.facter;
                break;
        }
        picker = Math.floor((Math.random() * 1000) % output.length);
        if (output[picker][1][1]){
            msg.channel.send(output[picker][0]);
            setTimeout(function () {msg.channel.send(output[picker][1])}, 2000);
        } else {
            msg.channel.send(output[picker])
        }
    },

// HACKER NEWS
    newsfeed: function(client) {
        // check if the latest article is the max article
        fetch(topNews).then(function(response) {
            response.json().then(function(topItem) {
                article = topItem[0];

               // check if news article is present
                for (var index = 0; index < articles.length; index++) {
                    if (articles[index]["id"] == JSON.stringify(article)) {
                        newNews = false;
                    } else {
                        newNews = true;
                    }
                }
                
                // if the article is new, update postings
                if(newNews) {
                    articleUrl = "https://hacker-news.firebaseio.com/v0/item/" + article + ".json"

                    fetch(articleUrl).then(function(response) {
                        response.json().then(function(news){
                            // print news article
                            client.channels.cache.get('873189233177788436').send(news['title'] + "\n" + news['url']);
                           
                            // push new article to object and write to db
                            articles.push({id: JSON.stringify(article), timestamp: JSON.stringify(news["time"])});
                            fs.writeFile("./articles.json", JSON.stringify(articles), (err) => {
                                if (err) throw err;
                            });
                        })
                    });
                    newNews = false;
                } 
            })
        })
    },


// IP SCANNER
    ipscan: function(content, Discord, msg) {
        msg.channel.send("Scanning .. " );
        if (!content.match(/\//) && !content.match(/\?/)) {
            if (content.match(/\d/)) {
                const jsonurl = "http://extreme-ip-lookup.com/json/" + content;

                fetch(jsonurl).then(function(response) {
                    response.json().then(function(data) {
                        if(data["status"] !== "success") {
                            msg.reply(data["message"] + ".")
                        } else {
                        embeded = new Discord.MessageEmbed()
                        .setTitle('IP Results for ' + data["query"])
                        .setDescription(
                            "**ISP: **" + data["isp"] + "." +
                            "**\nIP Name: **" + data["ipName"] +  "." +
                            "**\nType: **" + data["ipType"] + "." +
                            "**\nLocation: **" + data["city"] + "." +
                            ", " + data["country"] + ", " +
                            data["continent"] +  "." +
                            "**\nLat/Lon: **" + data["lat"] + ", " + data["lon"]
                        )
                        .setFooter((Date.now() - msg.createdTimestamp) + "ms");

                    msg.channel.send(embeded);
                    }
                });
            });
        }  else  {
            const urlquery = "http://ip-api.com/json/" + content;

            fetch(urlquery).then(function(urlresponse) {
                urlresponse.json().then(function(urldata) {
                    if(urldata["status"] !== "success") {
                        msg.reply(data["message"] + ".")
                    } else {
                        const ipquery = "http://extreme-ip-lookup.com/json/" + urldata["query"];
                        locationdata = "nothing";

                        fetch(ipquery).then(function(ipresponse){
                            ipresponse.json().then(function(ipdata) {

                        if(urldata["city"] != ipdata["city"]){
                            locationdata = ("**\nURL Loc: **\t" + urldata["city"] + ", " + urldata["country"] + ", " + urldata["continent"] +  "." +
                            "**\nURL Coords: **\t" + urldata["lat"] + ", " + urldata["lon"] +
                            "**\nIP Loc: **\t" + ipdata["city"] + ", " + ipdata["country"] + ", " + ipdata["continent"] +  "." +
                            "**\nIP Coords: **\t" + ipdata["lat"] + ", " + ipdata["lon"]);
                        } else {
                            locationdata = ("**\nURL Loc: **\t" + urldata["city"] + ", " + urldata["country"] + ", " + urldata["continent"] +  "." +
                            "**\nURL Coords: **\t" + urldata["lat"] + ", " + urldata["lon"]);
                        }


                                embeded = new Discord.MessageEmbed()
                                .setTitle('IP Results for ' + content)
                                .setDescription(
                            "**IP: **\t" + urldata["query"] + "." +
                            "**\nIP Name: **\t" + ipdata["ipName"] +  "." +
                            "**\nISP: **\t" + ipdata["isp"] + "." +
                            "**\nOrg: **\t" + urldata["org"] +  "." +
                            "**\nType: **\t" + ipdata["ipType"] + "." + locationdata
                                                    )

                        .setFooter((Date.now() - msg.createdTimestamp) + "ms");

                    msg.channel.send(embeded);
                    })});

                    }
                });
            }); }
        }  else { msg.reply('https://cdn.discordapp.com/emojis/854682316286722078.gif?size=64') }
    },

// PRINT OUT ROLE INFO
     rolecache: function(msg) {
        msg.channel.send(JSON.stringify(msg.guild.roles.cache));
     },

// GRANT ROLE TO NEW USER //
    newrole: function(msg) {
        m = msg.guild.members.cache.find(({user: {username, discriminator}}) =>
            `${username}#${discriminator}` === msg.author.tag,)
        m.roles.add('864164950066200616')
    },

// LIST ALL BOT COMMANDS //
    list : function(msg, Discord) {
        let fields = ""

        for (let i = 0; i < (cmdlist.length / 2); i++) {
            fields = fields + "**" + cmdlist[i * 2] + "**  - " + cmdlist[i * 2 + 1] + "\n";
        }

        embedded = new Discord.MessageEmbed()
            .setTitle("__Command List__")
            .setDescription( fields );
        msg.channel.send(embedded);
    }
}
