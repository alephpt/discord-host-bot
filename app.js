const Discord = require('discord.js');
const functions = require('./functions.js');
require('dotenv').config();

const client = new Discord.Client();

client.on('ready', () => { 
    console.log('AUTOBOTS GO!'); 
    setInterval (function () { functions.newsfeed(client); }, 15 * 60 * 1000);
});

client.on('message', (msg) => {
    const [, command, content] = msg.content.toLowerCase().match(/^(?:\.(\S+)(?:\s+(.+))?$)?/s);

    switch (command) {
        case "ls":
            functions.list(msg, Discord);
            break;
        case "newstest":
            functions.newsfeed(client);
            break;
        case "fuck":
            msg.channel.send('Your Mum');
            break;
        case "ping":
            msg.channel.send("Ping: time=" + (Date.now() - msg.createdTimestamp) + "ms");
            break;
        case "ip":
            if (content) { functions.ipscan(content, Discord, msg); };
            break;
        case "rolecache":
            functions.rolecache(msg);
            break;
        case "roleme":
            functions.newrole(msg);
            break;
        case "joke":
        case "fact":
            functions.infoman(command, msg); 
            break;
    }
});

client.login(process.env.TOKE)
