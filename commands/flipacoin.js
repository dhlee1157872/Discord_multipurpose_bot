const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('flipcoin')
        .setDescription('Flips a coin'),
    async execute(Interaction){
        let decision = Math.floor(Math.random() * 2);
        if(decision == 1)
        {
            await Interaction.reply('Heads');
        }
        else
        {
            await Interaction.reply('Tails');
        }
    },
};