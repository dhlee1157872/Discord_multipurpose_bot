const { SlashCommandBuilder, CommandInteractionOptionResolver} = require('discord.js');

// connects with mysql database
var mysql = require('mysql2');
const mydb = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

//this initial query is only for deploying commands, without it, the deploy-commands.js throws an error when compiling
mydb.query(
    'select * from usertasks',
    //this function is needed for compile to not throw an error
    function(err,results,fields) {
    }
);


module.exports = {
    data: new SlashCommandBuilder()
        .setName('deletetask')
        .setDescription('deletes tasks from your task list(enter the task number; for multiple tasks, separate with comma(,)')
        .addStringOption(option => 
            option.setName('input')
                .setDescription('Remove Tasks (number)')),
    async execute(Interaction){
        var interactionUser = Interaction.member.user;
        var exists;
        var sqlline = 'select count(user_id) from usertasks where user_id = ' + interactionUser.id;

        //creates a promise for async control
        let sqlresult = await mydb.promise().query(sqlline);
        countval = sqlresult[0][0];
        exists = countval['count(user_id)'];    
        //prevents users from deleting tasks when they don't have any
        if(exists == 0){
            sqlline = 'insert into usertasks(user_id) values (' + interactionUser.id + ')';
            await mydb.promise().query(sqlline);
            await Interaction.reply('You have no tasks!!!!!');
            return;
        }
        sqlline = 'select * from usertasks where user_id = ' + interactionUser.id;
        sqlresult = await mydb.promise().query(sqlline);
        sqlresult = sqlresult[0][0];





        /*
            THOUGHTS FOR 3/25
            get the result, to see which tasks are null
            MAKE SURE THAT THEY AREN'T DELETING A TASK THAT DOESN'T EXIST.
            start sorting from the back of the list (i.e) if the tasks are in 1-8, and the user wants to delete tasks 2 and 5. DELETE 5 first then move the tasks from 6-8 down to 5-7.
            (you can prob implement an array with task delete numbers sorted from highest to lowest so that you can do above dynamically (or efficiently))
            then you can delete 2 and move the tasks from 3-7 down
        */

    }
};