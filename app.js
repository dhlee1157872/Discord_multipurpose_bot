const { Client, GatewayIntentBits, Collection, OAuth2Scopes, REST, Routes, SlashCommandBuilder, Events, Guild, GuildChannelManager, EmbedBuilder} = require('discord.js');
const Discord = require('discord.js');
const env = require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { clientid, guildId, token } = require('./config.json')
const client = new Discord.Client({intents : 
    [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.GuildMessageTyping, 
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildInvites, 
        GatewayIntentBits.DirectMessages,
    ]
});
var mysql = require('mysql2');
const { channel } = require('node:diagnostics_channel');
const mydb = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

//this initial query is only for deploying commands, without it, the deploy-commands.js throws an error when compiling
mydb.query(
    'select * from timer',
    //this function is needed for compile to not throw an error
    function(err,results,fields) {
    }
);

//checks to see if time is met
async function checktime(){
    sqlline = 'select * from timer';
    let result = await mydb.promise().query(sqlline);
    result = result[0];
    timersup = [];
    currtime = Date.now()+30000;
    for(let i = 0; i < result.length; i++){
        userdata = result[i];        
        if(currtime > userdata['unixsec'] && userdata['unixsec'] != null){
            userid = userdata['user_id'];
            timersup.push(userid);
            sqlline = 'update timer set unixsec = null where user_id = \'' + userid + '\''
            await mydb.promise().query(sqlline);
        }
    }
    return timersup;
}

//to read files and put the commands into a collection
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file=>file.endsWith('.js'));

//for reading files to execute /commands
for(const file of commandFiles){
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if('data' in command && 'execute' in command){
        client.commands.set(command.data.name, command);
    } else {
        console.log('warning');
    }
}


//starts bot
client.on('ready', ()=> {
    console.log('Bot Ready...');
    checktime().then(userlists => {
        for(var i = 0; i < userlists.length; i++){
           let channel = client.channels.cache.get(process.env.CHANNEL_ID);
           channel.send('<@'+ userlists[i] +'> time is up!!');
        }
    });
    
    setInterval(function(){
        checktime().then(userlists => {
            for(var i = 0; i < userlists.length; i++){
               let channel = client.channels.cache.get(process.env.CHANNEL_ID);
               channel.send('<@'+ userlists[i] +'> time is up!!');
            }
        })
    }, 60000);
});

//for -commands
const prefix = '-';
client.on("messageCreate", message => {
    if(!message.content.startsWith(prefix) || message.author.bot) return;

    
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if(command === 'ping'){
        message.channel.send('pong!');
    }
    if(command === 'rickroll'){
        message.channel.send('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    }
    if(command === 'tyler1')
    {
        message.channel.send('https://www.twitch.tv/loltyler1');
    }

});

client.on(Events.InteractionCreate, async interaction => {
    if(!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if(!command){
        console.error('no matching command');
        return;
    }

    try{
        await command.execute(interaction);
    } catch(error){
        console.error(error);
        await interaction.reply({ content: 'Something Messed Up', ephemeral: true});
    }
});


client.login(token);