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
        .setName('task')
        .setDescription('youtasks'),
    async execute(Interaction){
        var interactionUser = Interaction.member.user
        var exists;
        var sqlline = 'select count(user_id) from usertasks where user_id = ' + interactionUser.id;

        //creates a promise for async control
        let countresult = await mydb.promise().query(sqlline);
        
        //gets only the count value 
        countval = countresult[0][0];
        exists = countval['count(user_id)'];    

        if(exists == 0){
            sqlline = 'insert into usertasks(user_id) values (' + interactionUser.id + ')';
            mydb.execute(sqlline);
            await Interaction.reply('Nothing!');
        }
        else
        {
            sqlline = 'select * from usertasks where user_id =' + interactionUser.id;
            let taskline = await mydb.promise().query(sqlline);
            userlogs = taskline[0][0];
            if(userlogs['task1'] == null){
                await Interaction.reply('Nothing!');
                return;
            }
            else
            {
                iterate = 1;
                wordtask = 'task';
                tasklist = [];
                neword = wordtask + iterate;
                while(userlogs[neword] != null && iterate <= 10){
                    tasklist.push(userlogs[neword]);
                    iterate++;
                    neword = wordtask+iterate;
                }
                buildresponse = 'Tasks \n-------------------------\n';
                iterate = 1;
                while(iterate -1 < tasklist.length){
                    buildresponse = buildresponse + iterate + '. ' + tasklist[iterate-1] + '\n';
                    iterate++;
                }
            }
            await Interaction.reply(buildresponse);
        }

    },
};