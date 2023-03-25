const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('flipcoin')
        .setDescription('Flips a coin')
        .addStringOption(option => 
            option.setName('number')
                .setDescription('number of trials')),
    async execute(Interaction){
        trials = Interaction.options.getString('number');
        trials = parseInt(trials)
        if(trials == null || isNaN(trials)){
            trials = 1;
        }
        Heads = 0;
        Tails = 0;
        for(let i = 0; i < trials; i++){
            decision = Math.random();
            if(decision >= 0.5){
                Heads++;
            }
            else{
                Tails++;
            }
        }
        if(trials == 1){
            if(Heads > 0){
                await Interaction.reply('Heads');
                return;
            }
            else{
                await Interaction.reply('Tails');
                return;
            }
        }
        await Interaction.reply('Heads: ' + String(Heads) + ' || Tails: ' + String(Tails) );
        
    },
};