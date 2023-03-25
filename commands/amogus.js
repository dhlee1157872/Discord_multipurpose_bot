const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('amogus')
        .setDescription('amogus'),
    async execute(Interaction){
        await Interaction.reply('https://www.youtube.com/watch?v=HPd2hiYreyc');
    },
};