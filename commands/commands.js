const { SlashCommandBuilder } = require('discord.js');




module.exports = {
    data: new SlashCommandBuilder()
        .setName('pizza')
        .setDescription('Pizza'),
    async execute(Interaction){
        await Interaction.reply('https://www.dominos.com/en/');
    },
};