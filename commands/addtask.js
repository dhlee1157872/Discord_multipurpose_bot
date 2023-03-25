const { SlashCommandBuilder} = require('discord.js');

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
        .setName('addtask')
        .setDescription('adds tasks to your task list (separate multiple tasks with a comma(,)')
        .addStringOption(option => 
            option.setName('input')
                .setDescription('Your Task(s)')),
    async execute(Interaction){
        var interactionUser = Interaction.member.user;
        var exists;
        var sqlline = 'select count(user_id) from usertasks where user_id = ' + interactionUser.id;

        //creates a promise for async control
        let sqlresult = await mydb.promise().query(sqlline);
        
        //gets only the count value 
        countval = sqlresult[0][0];
        exists = countval['count(user_id)'];    
        if(exists == 0){
            sqlline = 'insert into usertasks(user_id) values (' + interactionUser.id + ')';
            mydb.execute(sqlline);
        }
        inputstring = Interaction.options.getString('input');
        if(inputstring == null){
            await Interaction.reply('input your tasks after /addtask!!!');
            return;
        }
        //splits the input string by ,
        inputstring = inputstring.split(',');
        sqlline = 'select * from usertasks where user_id = ' + interactionUser.id;
        sqlresult = await mydb.promise().query(sqlline);
        
        //tasklist has the list of task from sql
        tasklist = sqlresult[0][0];
        const taskword = 'task';                  //stores the word 'task' to iterate through the columns
        iteration = 10;
        numberofnulls = 0;

        //counts number of null
        while(tasklist[taskword + iteration] == null && iteration > 0){
            numberofnulls++;
            iteration--;
        }

        //checks if there is enough space in the list
        if(numberofnulls < inputstring.length){
            await Interaction.reply('Not enough space on list (MAX: 10)');
            return;
        }

        //to set the task# on the next null space
        iteration++;
        sqlline = 'update usertasks set '
        
        //builds the sql code line
        for(task in inputstring){
            sqlline = sqlline + taskword + iteration + ' = \'' + inputstring[task] + '\'';
            iteration++;
            if(task < inputstring.length - 1){
                sqlline = sqlline + ', ';
            }
        }
        sqlline = sqlline + ' where user_id = ' + interactionUser.id;
        sqlresult = await mydb.promise().query(sqlline);

        //This is for printing out the task list after inputting the tasks
        sqlline = 'select * from usertasks where user_id =' + interactionUser.id;

        sqlresult = await mydb.promise().query(sqlline);
        sqltasklist = sqlresult[0][0];
        iterate = 1;

        tasklist = [];
        while(sqltasklist[taskword + iterate] != null && iterate <= 10){
            tasklist.push(sqltasklist[taskword+iterate]);
            iterate++;
        }
        buildresponse = 'Tasks \n-------------------------\n';
        iterate = 1;
        while(iterate -1 < tasklist.length){
            buildresponse = buildresponse + iterate + '. ' + tasklist[iterate-1] + '\n';
            iterate++;
        }
        await Interaction.reply(buildresponse);
    },
};