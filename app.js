const { Client, GatewayIntentBits, Collection, OAuth2Scopes, REST, Routes, SlashCommandBuilder, Events } = require('discord.js');
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


// connects with mysql database
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});
connection.connect(function(err) {
    if(err){
        console.error('error connecting: ' + err.stack);
        return;
    }

    console.log('connected as: ' + connection.threadID);
});


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


const prefix = '-';
//starts bot
client.on('ready', ()=> {
    console.log('Bot Ready...')
});

//
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