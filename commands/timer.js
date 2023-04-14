const { SlashCommandBuilder } = require('discord.js');

class TimeIntervals{
    time = 0;
    constructor(timeinput){
        let value = 0;
        for(let x = 0; x < timeinput.length; x++){
            if(timeinput[x] >= '0' && timeinput[x] <= '9'){
                value = (value*10) + parseInt(timeinput[x]);
            }
            else if(timeinput[x] >= 'A' && timeinput[x] <= 'z'){
                if(value == 0){
                    return;
                }
                else{
                    switch(timeinput[x].toLowerCase()){
                        case 'h':
                            this.time = value * 3600000;
                            return;
                        case 'm':
                            this.time = value * 60000
                            return;
                        case 'd':
                            this.time = value * 86400000;
                            return;
                    }
                }
            }
        }
        this.time = 0;
    }
    get gettime(){
        return this.time;
    };
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
    'select * from timer',
    //this function is needed for compile to not throw an error
    function(err,results,fields) {
    }
);


module.exports = {
    data: new SlashCommandBuilder()
        .setName('timer')
        .setDescription('timer')
        .addStringOption(option => 
            option.setName('input')
                .setDescription('Set Timer')),
    async execute(Interaction){
        var interactionUser = Interaction.member.user
        var exists;
        var sqlline = 'select count(user_id) from timer where user_id = ' + interactionUser.id;

        //creates a promise for async control
        let countresult = await mydb.promise().query(sqlline);
        
        //gets only the count value 
        countval = countresult[0][0];
        exists = countval['count(user_id)'];    

        if(exists == 0){
            sqlline = 'insert into timer(user_id, username) values (' + interactionUser.id + ', \'' + interactionUser.username + '\')';
            mydb.execute(sqlline);
        }

        sqlline = 'select * from timer where user_id = ' + interactionUser.id;
        result = await mydb.promise().query(sqlline);
        result = result[0][0];

        Time = Interaction.options.getString('input');
        if(Time == null){
            await Interaction.reply('Enter a time! in the form of: time (d/h/m). For multiple input of time, separate with comma (,)');
            return;
        }
        Time = Time.split(',');
        let tottime = [];
        
        for(let i = 0; i < Time.length; i++){
            tottime.push(new TimeIntervals(Time[i]));
        }
    
        currtime = Date.now(); // THIS IS IN UNIX TIMESTAMP

        for(let i = 0; i < tottime.length; i++){
            if(tottime[i].gettime == 0){
                await Interaction.reply('Enter a unit of time in the form of: time (d/h/m). For multiple input of time, separate with comma (,)');
                return;
            }
            currtime = currtime + tottime[i].gettime;
        }

        sqlline = 'update timer set unixsec = ' + currtime + ' where user_id = ' + interactionUser.id;
        await mydb.promise().query(sqlline);


        if(result['username'] != interactionUser.username){
            sqlline = 'update timer set username = \'' + interactionUser.username + '\' where user_id = ' + interactionUser.id;
            await mydb.promise().query(sqlline);
        }


        remindtime = new Date(currtime).toLocaleTimeString('en-US');//YOU NEED TO MAKE INTO NEW DATE CONSTRUCTOR
        await Interaction.reply('we will remind you at ' + remindtime);
    },
};
