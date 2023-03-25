const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dice')
        .setDescription('rolls a die')
        .addStringOption(option => 
            option.setName('sides')
                .setDescription('number of sides on die(default normal)')),
    async execute(Interaction){
        diceside = Interaction.options.getString('sides');
        n = parseInt(diceside)
        if(n == null || isNaN(n)){
            n = 6;
        }
        await Interaction.reply(String(Math.floor((Math.random()*n) + 1)));
    },
};