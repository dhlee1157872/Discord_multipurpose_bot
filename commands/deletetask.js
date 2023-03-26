const { SlashCommandBuilder, CommandInteractionOptionResolver} = require('discord.js');

function sort(array) {
    for(var i = 0; i < array.length; i++){
        array[i] = parseInt(array[i]);
    }
    if(array.length <= 1){
        return array;
    }
    var pivot = array[0];
    var left = [];
    var right = [];
    for(var i = 1; i < array.length; i++){
        if(array[i] < pivot){
            left.push(array[i]);
        }
        else{
            right.push(array[i]);
        }
    }
    return sort(left).concat(pivot, sort(right));
}

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

const wordtask = 'task';

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
        inputstring = Interaction.options.getString('input');
        if(inputstring == null){
            await Interaction.reply('Enter the task number to delete individual tasks or type \'ALL\' to delete all tasks');
            return;
        }

        //check to see if they wanted to delete all tasks
        var deleteall = false;
        inputstring = inputstring.split(',');
        for(var i = 0; i < inputstring.length; i++){
            if(inputstring[i].replace(/ /g, "").toLowerCase() == 'all'){
                deleteall = true;
            }
        }

        //deletes all if wanted to delete all
        if(deleteall){
            sqlline = "update usertasks set "
            for(var i = 1; i < 10; i++){
                sqlline = sqlline + wordtask + i + '=null, '
            }
            sqlline = sqlline + wordtask + i + '=null  where user_id = '+interactionUser.id;
            mydb.query(sqlline);
            await Interaction.reply('Deleted All Tasks!');
            return;
            
        }

        //sorts input string to delete tasks in reverse order
        inputstring = sort(inputstring);
   
        sqlline = 'select * from usertasks where user_id = ' + interactionUser.id;
        sqlresult = await mydb.promise().query(sqlline);
        sqlresult = sqlresult[0][0];

        //checks to see where the null position is
        var nullposition = 1;
        while(sqlresult[wordtask+nullposition] != null && nullposition < 11){
            nullposition++;
        }

        //goes through to see if any delete value is too high
        for(var i = 0; i < inputstring.length; i++){
            if(inputstring[i] >= nullposition){
                await Interaction.reply('One of your inputs do not exist or is too high');
                return;
            }
        }

        //deletes and moves down the task list
        for(var i = inputstring.length -1; i  >= 0; i--){
            sqlline = "update usertasks set "
            if(inputstring[i] != 10){
                for(var j = inputstring[i]; j < nullposition-1; j++){
                    sqlline = sqlline + wordtask + j + '=' + wordtask + (j+1) + ', ';
                }           
            }
            nullposition--;
            sqlline = sqlline + wordtask+nullposition+ '=null where user_id = ' + interactionUser.id;
            await mydb.promise().query(sqlline);
        }

        await Interaction.reply('Deleted the tasks');
    }
};
