const http = require('http'),
    apps = require('express'),
    app = apps(),
    request = require('request'),
    express = require('http').Server(app),
    io = require('socket.io')(express),
    fs = require('fs'),
    address = require('ip').address(),
    players = require('./mod/players.js'),
    cameras = require('./mod/cameras.js'),
    vmix = require('./mod/vmix.js'),
    freezetime = require('./mod/freezetime.js'),
    osc = require('./mod/osc.js'),
    teams = require('./mod/teams.js'),
    lineReader = require('line-reader'),
    fetch = require('node-fetch'),
    huds = require('./mod/huds.js'),
    JSONbig = require('json-bigint');


const { TeamSpeak } = require("ts3-nodejs-library")

var oldPhase = "";
var recent_update;
var backendData;
var match = null;
var multer  = require('multer');
var allADR = new Array();
var coolArray = new Array();
var p1dmg = 0;
var p2dmg = 0;
var p3dmg = 0;
var p4dmg = 0;
var p5dmg = 0;
var p6dmg = 0;
var p7dmg = 0;
var p8dmg = 0;
var p9dmg = 0;
var p10dmg = 0;





var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/teams')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + ".png")
  }
});

var upload = multer({ storage: storage });
/*
var playerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/playerAvatars')
    },
    filename: function (req, file, cb) {
        cb(null, req.sid  + ".png")
    }
});

var playerUpload = multer({ storage: storage });


 */

const config = huds.loadConfig();

const bodyParser = require('body-parser');

function getFlags(){
    let flags = [];
    fs
        .readdirSync('./public/files/img/flags/')
        .forEach(file => {
            if (file.substr(-4, 4) == '.png') {
                flags.push(file.substr(0, file.indexOf('.png')));
            }
        });
    return flags;
}



function status(bool) {
    return JSON.stringify({"status": bool});
}

var download = function (uri, filename, callback) {
    request.head(uri, (err, res, body) => {
        request(uri)
            .pipe(fs.createWrilightControlream(filename))
            .on('close', callback);
    });
};

app.locals.pretty = true;
app.use(bodyParser.urlencoded({extended: true}));

app.use(bodyParser.json());
app.use(apps.static(__dirname + '/public'));

app.engine('pug', require('pug').__express)
app.set('view engine', 'pug');

app.get('/', (req, res) => {
    return res.render('index', {
        ip: config.Address,
        port: config.ServerPort,
        flags: getFlags()
    });
});

app.get('/huds', huds.overlay);
app.get('/huds/:id([^\\\/]+)', huds.render);
app.get('/api/huds', huds.getHUDs);
app.post('/api/huds', huds.addHUD);
app.patch('/api/huds', huds.setHUD);
app.delete('/api/huds', huds.deleteHUD);
app.get('/teams', teams.render);
app.get('/api/teams', teams.getTeams);
app.post('/api/teams', upload.single('logo'), teams.addTeam);
app.patch('/api/teams', upload.single('logo'), teams.updateTeam);
app.delete('/api/teams', teams.deleteTeam);
app.delete('/api/teams_logo', teams.deleteLogo);
app.get('/players', players.render);
app.get('/api/players', players.getPlayers);
app.post('/api/players', players.addPlayer);
app.patch('/api/players', players.updatePlayer);
app.delete('/api/players', players.deletePlayer);
app.get('/cameras', cameras.render);
app.get('/api/cameras', cameras.getCameras);
app.post('/api/cameras', cameras.addCamera);
app.patch('/api/cameras', cameras.updateCamera);
app.delete('/api/cameras', cameras.deleteCamera);
app.get('/vmix', vmix.render);
app.get('/api/vmix', vmix.getvMix);
app.post('/api/vmix', vmix.addvMix);
app.patch('/api/vmix', vmix.updatevMix);
app.get('/freezetime', freezetime.render);
app.get('/api/freezetime', freezetime.getfreezetime);
app.post('/api/freezetime', freezetime.addFreezetime);
app.patch('/api/freezetime', freezetime.updateFreezetime);
app.get('/osc', osc.render);
app.get('/api/osc', osc.getOSC);
app.post('/api/osc', osc.addOSC);
app.patch('/api/osc', osc.updateOSC);


app.get('/api/playerAvatars');

// 178 team2  // warmup 180





app.get('/av/:sid([0-9]+)', (req, res) => {
    let steam_id = req.params.sid;

    let filename = steam_id + '.png';
    let filepath = config.AvatarDirectory + filename;

    let bodyChunks = [];
    let data;

    if (fs.existsSync(filepath)) {
        let file = fs.readFileSync(filepath);
        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': file.length
        });
        return res.end(file);
    } else {
        let getPlayerCallback = (ans) => {
            ans.on('data', (chunk) => {
                bodyChunks.push(chunk);
            }).on('end', endCallback)
        }
        let endCallback = () => {
            let body = Buffer.concat(bodyChunks);

            try {
                data = JSON.parse(body).response;
                if (data && data.players) {
                    download(data.players[0].avatarfull, config.AvatarDirectory + filename, () => {
                        let file = fs.readFileSync(filepath);
                        res.writeHead(200, {
                            'Content-Type': 'image/png',
                            'Content-Length': file.length
                        });
                        return res.end(file);
                    });
                }
            } catch (e) {
                return res.sendStatus(500);
            }
        }

        let request = http.get('http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=' + config.SteamApiKey + '&steamids=' + steam_id, getPlayerCallback);
        request.on('error', (e) => {
            return res.sendStatus(500);
        });
    }
});
io.on('connection', (socket) => {
    socket.on('update', (data) => {
        io.emit(data);
    });
    socket.on('ready', () => {
        if(match){
            socket.emit('match', match);
        }
        if (recent_update) {
            socket.emit("update", recent_update);
        }
    });
    socket.on('update_match', (data) => {
        match = data;
        io.emit('match', data);
    });
    socket.on('refresh', (data) => {
        io.emit('refresh', data);
    });
});

express.listen(config.ServerPort, address || 'localhost', () => {
    console.log('\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n');
    console.log('\n\t\t\t Open http://' + address + ':' + config.ServerPort + ' in a browser to connect to HUD');
    console.log('\n');
});

server = http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    if (req.method != "POST") {
        return res.end('');
    }
    let body,
        data,
        bombStatePlayer,
        bodyChunks = [];
    req.on('data', (data) => {
        bodyChunks.push(data);

    });
    req.on('end', () => {
        body = Buffer.concat(bodyChunks);
        data = JSON.parse(body);
        dataLossLess = JSONbig.parse(body);
        try {
            bombStatePlayer = dataLossLess.bomb.state;
        }
        catch (ee) {
            
        }




        if (bombStatePlayer == "carried" || bombStatePlayer == "planting" || bombStatePlayer == "defusing"){
                data.bomb.player = JSONbig.stringify(dataLossLess.bomb.player);
            }

        try {
            if (data.round.phase == "live" || data.round.phase == "bomb" || data.round.phase == "defuse"){

                for (p in data.allplayers){
                    //console.log(data.allplayers[p].state.round_totaldmg);


                    switch (data.allplayers[p].observer_slot) {
                        case 1:allADR[0] = data.allplayers[p].state.round_totaldmg;break;
                        case 2:allADR[1] = data.allplayers[p].state.round_totaldmg;break;
                        case 3:allADR[2] = data.allplayers[p].state.round_totaldmg;break;
                        case 4:allADR[3] = data.allplayers[p].state.round_totaldmg;break;
                        case 5:allADR[4] = data.allplayers[p].state.round_totaldmg;break;
                        case 6:allADR[5] = data.allplayers[p].state.round_totaldmg;break;
                        case 7:allADR[6] = data.allplayers[p].state.round_totaldmg;break;
                        case 8:allADR[7] = data.allplayers[p].state.round_totaldmg;break;
                        case 9:allADR[8] = data.allplayers[p].state.round_totaldmg;break;
                        case 0:allADR[9] = data.allplayers[p].state.round_totaldmg;break;

                    }

                    if (allADR == undefined){

                    } else {
                        var coolObj = {
                            1:allADR[0],
                            2:allADR[1],
                            3:allADR[2],
                            4:allADR[3],
                            5:allADR[4],
                            6:allADR[5],
                            7:allADR[6],
                            8:allADR[7],
                            9:allADR[8],
                            0:allADR[9],
                        };
                        coolArray[data.map.round] = coolObj;
                    }

                }
            }
            //console.log(allADR);

            p1dmg = 0;
            p2dmg = 0;
            p3dmg = 0;
            p4dmg = 0;
            p5dmg = 0;
            p6dmg = 0;
            p7dmg = 0;
            p8dmg = 0;
            p9dmg = 0;
            p10dmg = 0;
            coolArray.forEach(obj =>{
                p1dmg +=obj[0];
                p2dmg +=obj[1];
                p3dmg +=obj[2];
                p4dmg +=obj[3];
                p5dmg +=obj[4];
                p6dmg +=obj[5];
                p7dmg +=obj[6];
                p8dmg +=obj[7];
                p9dmg +=obj[8];
                p10dmg +=obj[9];
            });
            for (p in data.allplayers){
                switch (data.allplayers[p].observer_slot) {
                    case 1:data.allplayers[p].state.round_allDmg = p1dmg;break;
                    case 2:data.allplayers[p].state.round_allDmg = p2dmg;break;
                    case 3:data.allplayers[p].state.round_allDmg = p3dmg;break;
                    case 4:data.allplayers[p].state.round_allDmg = p4dmg;break;
                    case 5:data.allplayers[p].state.round_allDmg = p5dmg;break;
                    case 6:data.allplayers[p].state.round_allDmg = p6dmg;break;
                    case 7:data.allplayers[p].state.round_allDmg = p7dmg;break;
                    case 8:data.allplayers[p].state.round_allDmg = p8dmg;break;
                    case 9:data.allplayers[p].state.round_allDmg = p9dmg;break;
                    case 0:data.allplayers[p].state.round_allDmg = p10dmg;break;
                }
                let round = data.map.round + 1;
                switch (data.allplayers[p].observer_slot) {
                    case 1:data.allplayers[p].state.adr = (p1dmg/round).toFixed(1);break;
                    case 2:data.allplayers[p].state.adr = (p2dmg/round).toFixed(1);break;
                    case 3:data.allplayers[p].state.adr = (p3dmg/round).toFixed(1);break;
                    case 4:data.allplayers[p].state.adr = (p4dmg/round).toFixed(1);break;
                    case 5:data.allplayers[p].state.adr = (p5dmg/round).toFixed(1);break;
                    case 6:data.allplayers[p].state.adr = (p6dmg/round).toFixed(1);break;
                    case 7:data.allplayers[p].state.adr = (p7dmg/round).toFixed(1);break;
                    case 8:data.allplayers[p].state.adr = (p8dmg/round).toFixed(1);break;
                    case 9:data.allplayers[p].state.adr = (p9dmg/round).toFixed(1);break;
                    case 0:data.allplayers[p].state.adr = (p10dmg/round).toFixed(1);break;
                }
            }
        }catch (e) {

        }


        if (data.auth && data.auth.token == config.GSIToken) {
            recent_update = data;
            update(data);
            try {

                //console.log(data.allplayers);
                lightControl(data);
                teamspeakTest(data);
                sendVmix(data.round.phase, data.player.observer_slot);
                turnCamera(data);
                oscSendPhase(data.round.phase);
                oscSendBomb(data.bomb);
                oscSendWin(data.map.round_wins,data.map.round);

            }catch (e) {

            }
        }






        res.end('');
    });

});

var slotOld = 0;
var oSlot = "";
var oldWinner = 0;
var oldBomb = "";
var oldPhase = "";
var oldRound = 0;




const oscc = require('osc');


var oscPort = new oscc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: 7001,
    metadata: true
});
oscPort.open();





var teamleftteam = "";
var teamrightteam = "";
var teamleftroom = "";
var teamrightroom = "";
var lööp = 0;
var tsPhase = "";
var outsidePlayerTeam1 = new Array();
var outsidePlayerTeam2 = new Array();
var  tsTeamName1;
var  tsTeamName2;
var tsTeamName1ID;
var tsTeamName1Array = new Array();
var t1init = 0;
var tsTeamName2ID;
var tsTeamName2Array = new Array();
var t2init = 0;
var ispausedPhase = "";
var alreadyPaused = false;







function teamspeakTest(playersData) {

    try {
        if (playersData.phase_countdowns.phase == "paused" && alreadyPaused == false){
                alreadyPaused = true;
                TeamSpeak.connect({
                    host: "127.0.0.1",
                    protocol: "raw",
                    queryport: 10011,
                    serverport: 9987,
                    username: "serveradmin",
                    password: "L6ggMOun"
                }).then(async teamspeak =>{
                        await teamspeak.channelEdit(config.tsTeam1, {channel_needed_talk_power:79});
                        await teamspeak.channelEdit(config.tsTeam2, {channel_needed_talk_power:79});
                        teamspeak.forceQuit();
                }).catch(e =>{

                });



        }
        if (playersData.phase_countdowns.phase != "paused" && alreadyPaused == true){
            TeamSpeak.connect({
                host: "127.0.0.1",
                protocol: "raw",
                queryport: 10011,
                serverport: 9987,
                username: "serveradmin",
                password: "L6ggMOun"
            }).then(async teamspeak =>{
                await teamspeak.channelEdit(config.tsTeam1, {channel_needed_talk_power:0});
                await teamspeak.channelEdit(config.tsTeam2, {channel_needed_talk_power:0});
                teamspeak.forceQuit();
                alreadyPaused = false;
            }).catch(e =>{

            });
        }

        ispausedPhase = playersData.phase_countdowns.phase;
    } catch (e) {

    }



    //console.log(playersData.phase_countdowns);
    let team1,
        team2,
        teamName1,

        teamName2;
    if (tsPhase != playersData.map.phase){


        for (p in playersData.allplayers){
            let ppID = p;



            if (playersData.allplayers[p].observer_slot == 1){

                lineReader.eachLine('./databases/players', function (line) {

                    let player = JSON.parse(line);

                    if (player.sid == ppID){
                        let playerTeam = player.team;

                        lineReader.eachLine('./databases/teams', function (line) {
                            team1 = JSON.parse(line);

                            if (playerTeam == team1._id){
                                teamName1 = team1.team_name;
                                tsTeamName1 = team1.tsChannelName;
                                TeamSpeak.connect({
                                    host: "127.0.0.1",
                                    protocol: "raw",
                                    queryport: 10011,
                                    serverport: 9987,
                                    username: "serveradmin",
                                    password: "L6ggMOun"
                                }).then(async teamspeak =>{
                                    const channelList = await teamspeak.channelList();
                                    const userListUnsorted = await teamspeak.clientList( {client_type:0} );
                                    channelList.forEach(channel =>{
                                        if (channel.name == tsTeamName1){
                                            tsTeamName1ID = channel.cid;
                                        }
                                    });
                                    if (t1init == 0){
                                        userListUnsorted.forEach(ply =>{
                                            if (ply.cid == tsTeamName1ID){
                                                tsTeamName1Array.push(ply.clid);
                                            }
                                        });
                                        t1init = 1;
                                    }


                                    if (playersData.map.phase == "warmup"){
                                        await teamspeak.clientMove(tsTeamName1Array[0],180);
                                        await teamspeak.clientMove(tsTeamName1Array[1],180);
                                        await teamspeak.clientMove(tsTeamName1Array[2],180);
                                        await teamspeak.clientMove(tsTeamName1Array[3],180);
                                        await teamspeak.clientMove(tsTeamName1Array[4],180);
                                    }
                                    if (playersData.map.phase == "live"){
                                        await teamspeak.clientMove(tsTeamName1Array[0],config.tsTeam1);
                                        await teamspeak.clientMove(tsTeamName1Array[1],config.tsTeam1);
                                        await teamspeak.clientMove(tsTeamName1Array[2],config.tsTeam1);
                                        await teamspeak.clientMove(tsTeamName1Array[3],config.tsTeam1);
                                        await teamspeak.clientMove(tsTeamName1Array[4],config.tsTeam1);
                                    }
                                    if (playersData.map.phase == "gameover"){
                                        await teamspeak.clientMove(tsTeamName1Array[0],tsTeamName1ID);
                                        await teamspeak.clientMove(tsTeamName1Array[1],tsTeamName1ID);
                                        await teamspeak.clientMove(tsTeamName1Array[2],tsTeamName1ID);
                                        await teamspeak.clientMove(tsTeamName1Array[3],tsTeamName1ID);
                                        await teamspeak.clientMove(tsTeamName1Array[4],tsTeamName1ID);
                                    }
                                    if (playersData.map.phase == "intermission"){
                                        await teamspeak.clientMove(tsTeamName1Array[0],180);
                                        await teamspeak.clientMove(tsTeamName1Array[1],180);
                                        await teamspeak.clientMove(tsTeamName1Array[2],180);
                                        await teamspeak.clientMove(tsTeamName1Array[3],180);
                                        await teamspeak.clientMove(tsTeamName1Array[4],180);
                                    }





                                    teamspeak.forceQuit();
                                }).catch(e =>{

                                });

                            }
                        })
                    }
                });
            }
            if (playersData.allplayers[p].observer_slot == 6){

                lineReader.eachLine('./databases/players', function (line) {
                    let player = JSON.parse(line);

                    if (player.sid == ppID){
                        let playerTeam = player.team;

                        lineReader.eachLine('./databases/teams', function (line) {
                            team2 = JSON.parse(line);

                            if (playerTeam == team2._id){
                                teamName2 = team2.team_name;
                                tsTeamName2 = team2.tsChannelName;
                                TeamSpeak.connect({
                                    host: "127.0.0.1",
                                    protocol: "raw",
                                    queryport: 10011,
                                    serverport: 9987,
                                    username: "serveradmin",
                                    password: "L6ggMOun"
                                }).then(async teamspeak =>{
                                    const channelList = await teamspeak.channelList();
                                    const userListUnsorted = await teamspeak.clientList( {client_type:0} );
                                    channelList.forEach(channel =>{
                                        if (channel.name == tsTeamName2){
                                            tsTeamName2ID = channel.cid;
                                        }
                                    });
                                    if (t2init == 0){
                                        userListUnsorted.forEach(ply =>{
                                            if (ply.cid == tsTeamName2ID){
                                                tsTeamName2Array.push(ply.clid);
                                            }
                                        });
                                        t2init = 1;
                                    }


                                    if (playersData.map.phase == "warmup"){
                                        await teamspeak.clientMove(tsTeamName2Array[0],180);
                                        await teamspeak.clientMove(tsTeamName2Array[1],180);
                                        await teamspeak.clientMove(tsTeamName2Array[2],180);
                                        await teamspeak.clientMove(tsTeamName2Array[3],180);
                                        await teamspeak.clientMove(tsTeamName2Array[4],180);
                                    }
                                    if (playersData.map.phase == "live"){
                                        await teamspeak.clientMove(tsTeamName2Array[0],config.tsTeam2);
                                        await teamspeak.clientMove(tsTeamName2Array[1],config.tsTeam2);
                                        await teamspeak.clientMove(tsTeamName2Array[2],config.tsTeam2);
                                        await teamspeak.clientMove(tsTeamName2Array[3],config.tsTeam2);
                                        await teamspeak.clientMove(tsTeamName2Array[4],config.tsTeam2);
                                    }
                                    if (playersData.map.phase == "gameover"){
                                        await teamspeak.clientMove(tsTeamName2Array[0],tsTeamName2ID);
                                        await teamspeak.clientMove(tsTeamName2Array[1],tsTeamName2ID);
                                        await teamspeak.clientMove(tsTeamName2Array[2],tsTeamName2ID);
                                        await teamspeak.clientMove(tsTeamName2Array[3],tsTeamName2ID);
                                        await teamspeak.clientMove(tsTeamName2Array[4],tsTeamName2ID);
                                    }
                                    if (playersData.map.phase == "intermission"){
                                        await teamspeak.clientMove(tsTeamName2Array[0],180);
                                        await teamspeak.clientMove(tsTeamName2Array[1],180);
                                        await teamspeak.clientMove(tsTeamName2Array[2],180);
                                        await teamspeak.clientMove(tsTeamName2Array[3],180);
                                        await teamspeak.clientMove(tsTeamName2Array[4],180);
                                    }



                                    teamspeak.forceQuit();
                                }).catch(e =>{

                                });
                            }
                        })
                    }
                });
            }
        }
        tsPhase = playersData.map.phase;
   }




/*
 TeamSpeak.connect({
            host: "127.0.0.1",
            protocol: "raw",
            queryport: 10011,
            serverport: 9987,
            username: "serveradmin",
            password: "L6ggMOun"
        }).then( teamspeak =>{

            teamspeak.forceQuit();
        }).catch(e =>{

        });
        tsPhase = phase;
 */



}

function lightControl(data) {
    if (lööp == 40) {
        for (p in data.allplayers) {
            if (data.allplayers[p].observer_slot == 1) {

                let pT = data.allplayers[p].team;
                let playerData = p; //STEAMID
                teamleftteam = pT;

                lineReader.eachLine('./databases/players', function (line) {
                    let player = JSON.parse(line);
                    if (player.sid == playerData) { //IF STEAMID IS == TO JSON STEAMID FROM FILE
                        let playerTeam = player.team;
                        lineReader.eachLine('./databases/teams', function (line) {
                            let team = JSON.parse(line);
                            if (playerTeam == team._id) {
                                teamleftroom = team.room;
                                //console.log(team.room);
                            }
                        });
                    }
                });
            }
            if (data.allplayers[p].observer_slot == 6) {

                let playerData = p; //STEAMID
                let pT = data.allplayers[p].team;
                teamrightteam = pT;

                lineReader.eachLine('./databases/players', function (line) {
                    let player = JSON.parse(line);
                    if (player.sid == playerData) { //IF STEAMID IS == TO JSON STEAMID FROM FILE
                        let playerTeam = player.team;
                        lineReader.eachLine('./databases/teams', function (line) {
                            let team = JSON.parse(line);
                            if (playerTeam == team._id) {
                                teamrightroom = team.room;
                                //console.log(team.room);
                            }
                        });
                    }
                });
            }

        }
        lööp = 0;
    }
lööp++;
}

function oscSendWin(wins,round) {
    if (oldWinner != wins[round] && oldRound != round){

    switch(wins[round]) {
        /*case "t_win_bomb":
            fs.readFile("./databases/osc", function (err, data) {
                let oscJson = JSON.parse(data);
                if ((teamleftteam == "CT" && teamleftroom == "Seminarraum 1") || (teamleftteam =="T" && teamleftroom =="Seminarraum 2")) {
                    oscPort.send({
                        address: "/csgo/gsi/win/exploded/s1/ct",
                        args: [
                            {
                                type: "f",
                                value: 1
                            }
                        ]
                    }, oscJson.host, oscJson.port);
                    oscPort.send({
                        address: "/csgo/gsi/win/exploded/s2/t",
                        args: [
                            {
                                type: "f",
                                value: 1
                            }
                        ]
                    }, oscJson.host, oscJson.port);
                }
                if ((teamrightteam == "CT" && teamrightroom == "Seminarraum 2") || (teamrightteam == "T" && teamrightroom == "Seminarraum 1")) {
                    oscPort.send({
                        address: "/csgo/gsi/win/exploded/s1/t",
                        args: [
                            {
                                type: "f",
                                value: 1
                            }
                        ]
                    }, oscJson.host, oscJson.port);
                    oscPort.send({
                        address: "/csgo/gsi/win/exploded/s2/ct",
                        args: [
                            {
                                type: "f",
                                value: 1
                            }
                        ]
                    }, oscJson.host, oscJson.port);
                }
            });
            break;*/
        case "t_win_elimination":
            fs.readFile("./databases/osc", function (err, data) {
                let oscJson = JSON.parse(data);
                if ((teamleftteam == "CT" && teamleftroom == "Seminarraum 1") || (teamleftteam =="T" && teamleftroom =="Seminarraum 2")) {
                    oscPort.send({
                        address: "/csgo/gsi/win/twin/s1/ct",
                        args: [
                            {
                                type: "f",
                                value: 1
                            }
                        ]
                    }, oscJson.host, oscJson.port);
                    oscPort.send({
                        address: "/csgo/gsi/win/twin/s2/t",
                        args: [
                            {
                                type: "f",
                                value: 1
                            }
                        ]
                    }, oscJson.host, oscJson.port);
                }
                if ((teamrightteam == "CT" && teamrightroom == "Seminarraum 2") || (teamrightteam == "T" && teamrightroom == "Seminarraum 1")) {
                    oscPort.send({
                        address: "/csgo/gsi/win/twin/s1/t",
                        args: [
                            {
                                type: "f",
                                value: 1
                            }
                        ]
                    }, oscJson.host, oscJson.port);
                    oscPort.send({
                        address: "/csgo/gsi/win/twin/s2/ct",
                        args: [
                            {
                                type: "f",
                                value: 1
                            }
                        ]
                    }, oscJson.host, oscJson.port);
                }
            });
            break;
        case "ct_win_elimination":
            fs.readFile("./databases/osc", function (err, data) {
                let oscJson = JSON.parse(data);
                if ((teamleftteam == "CT" && teamleftroom == "Seminarraum 1") || (teamleftteam =="T" && teamleftroom =="Seminarraum 2")) {
                    oscPort.send({
                        address: "/csgo/gsi/win/ctwin/s1/ct",
                        args: [
                            {
                                type: "f",
                                value: 1
                            }
                        ]
                    }, oscJson.host, oscJson.port);
                    oscPort.send({
                        address: "/csgo/gsi/win/ctwin/s2/t",
                        args: [
                            {
                                type: "f",
                                value: 1
                            }
                        ]
                    }, oscJson.host, oscJson.port);
                }
                if ((teamrightteam == "CT" && teamrightroom == "Seminarraum 2") || (teamrightteam == "T" && teamrightroom == "Seminarraum 1")) {
                    oscPort.send({
                        address: "/csgo/gsi/win/ctwin/s1/t",
                        args: [
                            {
                                type: "f",
                                value: 1
                            }
                        ]
                    }, oscJson.host, oscJson.port);
                    oscPort.send({
                        address: "/csgo/gsi/win/ctwin/s2/ct",
                        args: [
                            {
                                type: "f",
                                value: 1
                            }
                        ]
                    }, oscJson.host, oscJson.port);
                }
            });
            break;
        case "ct_win_defuse":
            fs.readFile("./databases/osc", function (err, data) {
                let oscJson = JSON.parse(data);
                if ((teamleftteam == "CT" && teamleftroom == "Seminarraum 1") || (teamleftteam =="T" && teamleftroom =="Seminarraum 2")) {
                    oscPort.send({
                        address: "/csgo/gsi/win/defused/s1/ct",
                        args: [
                            {
                                type: "f",
                                value: 1
                            }
                        ]
                    }, oscJson.host, oscJson.port);
                    oscPort.send({
                        address: "/csgo/gsi/win/defused/s2/t",
                        args: [
                            {
                                type: "f",
                                value: 1
                            }
                        ]
                    }, oscJson.host, oscJson.port);
                }
                if ((teamrightteam == "CT" && teamrightroom == "Seminarraum 2") || (teamrightteam == "T" && teamrightroom == "Seminarraum 1")) {
                    oscPort.send({
                        address: "/csgo/gsi/win/defused/s1/t",
                        args: [
                            {
                                type: "f",
                                value: 1
                            }
                        ]
                    }, oscJson.host, oscJson.port);
                    oscPort.send({
                        address: "/csgo/gsi/win/defused/s2/ct",
                        args: [
                            {
                                type: "f",
                                value: 1
                            }
                        ]
                    }, oscJson.host, oscJson.port);
                }
            });
            break;
    }
    oldWinner = wins[round];
    oldRound = round;
    }
}

function oscSendBomb(bombJson) {

    if (bombJson.state != oldBomb.state){

        switch (bombJson.state) {
            case "planted":
                fs.readFile("./databases/osc", function (err, data) {
                    let oscJson = JSON.parse(data);
                    if ((teamleftteam == "CT" && teamleftroom == "Seminarraum 1") || (teamleftteam == "T" && teamleftroom =="Seminarraum 2")) {
                        oscPort.send({
                            address: "/csgo/gsi/bomb/planted",
                            args: [
                                {
                                    type: "f",
                                    value: 1
                                }
                            ]
                        }, oscJson.host, oscJson.port);
                    }
                    if ((teamrightteam == "CT" && teamrightroom == "Seminarraum 2") || (teamrightteam == "T" && teamrightroom == "Seminarraum 1")) {
                        oscPort.send({
                            address: "/csgo/gsi/bomb/planted",
                            args: [
                                {
                                    type: "f",
                                    value: 1
                                }
                            ]
                        }, oscJson.host, oscJson.port);
                    }
                });
                break;
            case "defusing":
                fs.readFile("./databases/osc", function (err, data) {
                    let oscJson = JSON.parse(data);
                    if ((teamleftteam == "CT" && teamleftroom == "Seminarraum 1") || (teamleftteam == "T" && teamleftroom =="Seminarraum 2")) {
                        oscPort.send({
                            address: "/csgo/gsi/bomb/defusing/s1/ct",
                            args: [
                                {
                                    type: "f",
                                    value: 1
                                }
                            ]
                        }, oscJson.host, oscJson.port);
                        oscPort.send({
                            address: "/csgo/gsi/bomb/defusing/s2/t",
                            args: [
                                {
                                    type: "f",
                                    value: 1
                                }
                            ]
                        }, oscJson.host, oscJson.port);
                    }
                    if ((teamrightteam == "CT" && teamrightroom == "Seminarraum 2") || (teamrightteam == "T" && teamrightroom == "Seminarraum 1")) {
                        oscPort.send({
                            address: "/csgo/gsi/bomb/defusing/s1/t",
                            args: [
                                {
                                    type: "f",
                                    value: 1
                                }
                            ]
                        }, oscJson.host, oscJson.port);
                        oscPort.send({
                            address: "/csgo/gsi/bomb/defusing/s2/ct",
                            args: [
                                {
                                    type: "f",
                                    value: 1
                                }
                            ]
                        }, oscJson.host, oscJson.port);
                    }
                });
                break;
            case "exploded":
                fs.readFile("./databases/osc", function (err, data) {
                    let oscJson = JSON.parse(data);
                    if ((teamleftteam == "CT" && teamleftroom == "Seminarraum 1") || (teamleftteam == "T" && teamleftroom =="Seminarraum 2")) {
                        oscPort.send({
                            address: "/csgo/gsi/bomb/exploded",
                            args: [
                                {
                                    type: "f",
                                    value: 1
                                }
                            ]
                        }, oscJson.host, oscJson.port);
                    }
                    if ((teamrightteam == "CT" && teamrightroom == "Seminarraum 2") || (teamrightteam == "T" && teamrightroom == "Seminarraum 1")) {
                        oscPort.send({
                            address: "/csgo/gsi/bomb/exploded",
                            args: [
                                {
                                    type: "f",
                                    value: 1
                                }
                            ]
                        }, oscJson.host, oscJson.port);
                    }
                });
                break;
        }
    }
        oldBomb = bombJson;
}

function oscSendPhase(gamePhase) {

    if (gamePhase != oldPhase) {
        switch (gamePhase) {
            case "freezetime":
                fs.readFile("./databases/osc", function (err, data) {
                    let oscJson = JSON.parse(data);
                    if ((teamleftteam == "CT" && teamleftroom == "Seminarraum 1") || (teamleftteam == "T" && teamleftroom == "Seminarraum 2")) {
                        oscPort.send({
                            address: "/csgo/gsi/round/freeze",
                            args: [
                                {
                                    type: "f",
                                    value: 1
                                }
                            ]
                        }, oscJson.host, oscJson.port);
                    }
                    if ((teamrightteam == "CT" && teamrightroom == "Seminarraum 2") || (teamrightteam == "T" && teamrightroom == "Seminarraum 1")) {
                        oscPort.send({
                            address: "/csgo/gsi/round/freeze",
                            args: [
                                {
                                    type: "f",
                                    value: 1
                                }
                            ]
                        }, oscJson.host, oscJson.port);
                    }
                });
                break;
            case "live":
                //console.log(teamrightteam);
                //console.log((teamrightroom));
                fs.readFile("./databases/osc", function (err, data) {
                    let oscJson = JSON.parse(data);
                    if ((teamleftteam == "CT" && teamleftroom == "Seminarraum 1") || (teamleftteam == "T" && teamleftroom == "Seminarraum 2")) {
                        oscPort.send({
                            address: "/csgo/gsi/round/live/s1/ct",
                            args: [
                                {
                                    type: "f",
                                    value: 1
                                }
                            ]
                        }, oscJson.host, oscJson.port);
                        oscPort.send({
                            address: "/csgo/gsi/round/live/s2/t",
                            args: [
                                {
                                    type: "f",
                                    value: 1
                                }
                            ]
                        }, oscJson.host, oscJson.port);
                    }
                    if ((teamrightteam == "CT" && teamrightroom == "Seminarraum 2") || (teamrightteam == "T" && teamrightroom == "Seminarraum 1")) {
                        oscPort.send({
                            address: "/csgo/gsi/round/live/s1/t",
                            args: [
                                {
                                    type: "f",
                                    value: 1
                                }
                            ]
                        }, oscJson.host, oscJson.port);
                        oscPort.send({
                            address: "/csgo/gsi/round/live/s2/ct",
                            args: [
                                {
                                    type: "f",
                                    value: 1
                                }
                            ]
                        }, oscJson.host, oscJson.port);
                    }
                });
                break;
            case "over":
                fs.readFile("./databases/osc", function (err, data) {
                    let oscJson = JSON.parse(data);
                    if ((teamleftteam == "CT" && teamleftroom == "Seminarraum 1") || (teamleftteam == "T" && teamleftroom == "Seminarraum 2")) {
                        oscPort.send({
                            address: "/csgo/gsi/round/over/s1/ct",
                            args: [
                                {
                                    type: "f",
                                    value: 1
                                }
                            ]
                        }, oscJson.host, oscJson.port);
                        oscPort.send({
                            address: "/csgo/gsi/round/over/s2/t",
                            args: [
                                {
                                    type: "f",
                                    value: 1
                                }
                            ]
                        }, oscJson.host, oscJson.port);
                    }
                    if ((teamrightteam == "CT" && teamrightroom == "Seminarraum 2") || (teamrightteam == "T" && teamrightroom == "Seminarraum 1")) {
                        oscPort.send({
                            address: "/csgo/gsi/round/over/s1/t",
                            args: [
                                {
                                    type: "f",
                                    value: 1
                                }
                            ]
                        }, oscJson.host, oscJson.port);
                        oscPort.send({
                            address: "/csgo/gsi/round/over/s2/ct",
                            args: [
                                {
                                    type: "f",
                                    value: 1
                                }
                            ]
                        }, oscJson.host, oscJson.port);
                    }
                });
                break;
            case "timeout":
                fs.readFile("./databases/osc", function (err, data) {
                    let oscJson = JSON.parse(data);
                    if ((teamleftteam == "CT" && teamleftroom == "Seminarraum 1") || (teamleftteam == "T" && teamleftroom == "Seminarraum 2")) {
                        oscPort.send({
                            address: "/csgo/gsi/round/timeout/s1/ct",
                            args: [
                                {
                                    type: "f",
                                    value: 1
                                }
                            ]
                        }, oscJson.host, oscJson.port);
                        oscPort.send({
                            address: "/csgo/gsi/round/timeout/s2/t",
                            args: [
                                {
                                    type: "f",
                                    value: 1
                                }
                            ]
                        }, oscJson.host, oscJson.port);
                    }
                    if ((teamrightteam == "CT" && teamrightroom == "Seminarraum 2") || (teamrightteam == "T" && teamrightroom == "Seminarraum 1")) {
                        oscPort.send({
                            address: "/csgo/gsi/round/timeout/s1/t",
                            args: [
                                {
                                    type: "f",
                                    value: 1
                                }
                            ]
                        }, oscJson.host, oscJson.port);
                        oscPort.send({
                            address: "/csgo/gsi/round/timeout/s2/ct",
                            args: [
                                {
                                    type: "f",
                                    value: 1
                                }
                            ]
                        }, oscJson.host, oscJson.port);
                    }
                });
                break;
            case "halftime":
                fs.readFile("./databases/osc", function (err, data) {
                    let oscJson = JSON.parse(data);
                    if ((teamleftteam == "CT" && teamleftroom == "Seminarraum 1") || (teamleftteam == "T" && teamleftroom == "Seminarraum 2")) {
                        oscPort.send({
                            address: "/csgo/gsi/round/halftime/s1/ct",
                            args: [
                                {
                                    type: "f",
                                    value: 1
                                }
                            ]
                        }, oscJson.host, oscJson.port);
                        oscPort.send({
                            address: "/csgo/gsi/round/halftime/s2/t",
                            args: [
                                {
                                    type: "f",
                                    value: 1
                                }
                            ]
                        }, oscJson.host, oscJson.port);
                    }
                    if ((teamrightteam == "CT" && teamrightroom == "Seminarraum 2") || (teamrightteam == "T" && teamrightroom == "Seminarraum 1")) {
                        oscPort.send({
                            address: "/csgo/gsi/round/halftime/s1/t",
                            args: [
                                {
                                    type: "f",
                                    value: 1
                                }
                            ]
                        }, oscJson.host, oscJson.port);
                        oscPort.send({
                            address: "/csgo/gsi/round/halftime/s2/ct",
                            args: [
                                {
                                    type: "f",
                                    value: 1
                                }
                            ]
                        }, oscJson.host, oscJson.port);
                    }
                });
                break;
        }

        oldPhase = gamePhase;
   }

}

/*
function turnCamera(obsslot) {
    if( obsslot.observer_slot != slotOld){
        var cArray = new Array();
        var loop = 0;
        lineReader.eachLine('./databases/cameras', function(line) {
            loop++;
            cArray.push(JSON.parse(line));
        if (loop!=1){
            if (obsslot <= 5 && obsslot >= 1){
                lineReader.eachLine('./databases/players', function(line) {
                    let ipString = "";

                    for (var c in cArray){
                        if (cArray[c].cid == "1"){
                            ipString = cArray[c].ip;
                        }
                    }
                    obsstring = "http://" + ipString + "/cgi-bin/ptzctrl.cgi?ptzcmd&poscall&" + obsslot;
                    fetch(obsstring, {
                        method: 'get'
                    })
                        .catch(err => {
                            //console.log(err);
                        });

                });
            }
            if (obsslot >= 6 && obsslot <= 10){
                let ipString = "";
                for (var c in cArray){
                    if (cArray[c].cid == "2"){
                        ipString = cArray[c].ip;
                    }
                }
                obsstring = "http://" + ipString + "/cgi-bin/ptzctrl.cgi?ptzcmd&poscall&" + obsslot;
                fetch(obsstring, {
                    method: 'get'
                })
                    .catch(err => {
                        //console.log(err);
                    });
            }
        }
        });
        slotOld = obsslot;
    }
}
 */

function turnCamera(data) {
if (slotOld != data.player.observer_slot){
    if (data.player.observer_slot == 0){
        data.player.observer_slot = 10;
    }
    //console.log(data.player.observer_slot);
    if (data.player.observer_slot <= 5 && data.player.observer_slot >= 1){
        lineReader.eachLine('./databases/players', function(line) {
            let player = JSON.parse(line);
            if (player.sid == data.player.steamid){
                let obslot = player ? player.place : "no player"; //OBSERVER_SLOT
                lineReader.eachLine('./databases/cameras', function (line) {
                    let camera = JSON.parse(line);
                    if (camera.cid == 1){
                        let camIP = camera.ip;
                        let apiString = "http://" + camIP + "/cgi-bin/ptzctrl.cgi?ptzcmd&poscall&" + obslot;
                        //console.log(apiString);
                        fetch(apiString, {
                            method: 'get'
                        })
                            .catch(err => {
                                //console.log(err);
                            });
                    }

                });

            }
        });
    }
    if (data.player.observer_slot >= 6 && data.player.observer_slot <= 10){
        lineReader.eachLine('./databases/players', function(line) {
            let player = JSON.parse(line);
            if (player.sid == data.player.steamid){
                let obslot = player ? player.place : "no player"; //OBSERVER_SLOT
                lineReader.eachLine('./databases/cameras', function (line) {
                    let camera = JSON.parse(line);
                    if (camera.cid == 2){
                        let camIP = camera.ip;
                        let apiString = "http://" + camIP + "/cgi-bin/ptzctrl.cgi?ptzcmd&poscall&" + obslot;
                        //console.log(apiString);
                        fetch(apiString, {
                            method: 'get'
                        })
                            .catch(err => {
                                //console.log(err);
                            });
                    }

                });

            }
        });
    }
    if (data.player.observer_slot <= 9){
        slotOld = data.player.observer_slot;
    }
    if (data.player.observer_slot == 10){
        slotOld = 0;
    }

}


}

function sendVmix(vmixPhase, obsslot){
    try {
        var slot = "";

        if (obsslot >= 6){
            slot = "left";
        }
        if (obsslot<=5){
            slot = "right";
        }
        if (oldPhase != vmixPhase || !(slot != oSlot)) {
            fs.readFile("./databases/vmix", function (err, data) {
                cont = JSON.parse(data);
            switch (vmixPhase) {
                case "ace":
                    var apiStr = "http://" + cont.apiIP + ":8088/API/?" + cont.apiCallAce;
                    fetch(apiStr, {
                        method: 'get'
                    })
                        .catch(err => {
                            //console.log(err);
                        });
                    //console.log("ace");
                    oldPhase = "ace";
                    break;
                case "freezetime":
                    var apiStr = "http://" + cont.apiIP + ":8088/API/?" + cont.apiCallFreeze;
                    fetch(apiStr, {
                        method: 'get'
                    })
                        .catch(err => {
                            //console.log(err);
                        });
                    //console.log("freezetime");
                    oldPhase = vmixPhase;
                    oSlot = "";
                    break;
                case "live":
                    if(obsslot <= 5 && obsslot >= 1){
                        var apiStr = "http://" + cont.apiIP + ":8088/API/?" + cont.apiCallLiveT1;
                        fetch(apiStr, {
                            method: 'get'
                        })
                            .catch(err => {
                                //console.log(err);
                            });
                        //console.log("Live");
                        oldPhase = vmixPhase;
                        oSlot = "left";
                    }
                    if (obsslot >= 6 && obsslot <= 10){
                        var apiStr = "http://" + cont.apiIP + ":8088/API/?" + cont.apiCallLiveT2;
                        fetch(apiStr, {
                            method: 'get'
                        })
                            .catch(err => {
                                //console.log(err);
                            });
                        //console.log("Live");
                        oldPhase = vmixPhase;
                        oSlot = "right";
                    }
                    break;
                case "over":
                    var apiStr = "http://" + cont.apiIP + ":8088/API/?" + cont.apiCallOver;
                    fetch(apiStr, {
                        method: 'get'
                    })
                        .catch(err => {
                            //console.log(err);
                        });
                    //console.log("over");
                    oldPhase = vmixPhase;
                    break;
                case "timeout":
                    var apiStr = "http://" + cont.apiIP + ":8088/API/?" + cont.apiCallTimeout;
                    fetch(apiStr, {
                        method: 'get'
                    })
                        .catch(err => {
                            //console.log(err);
                        });
                    oldPhase = vmixPhase;
                    break;
                default:
                    break;
            }
            });
        }
    }   catch (ex) {

        //console.log(ex);
    }
}

function update(json) {
    io.emit("update", json);
    backendData = json;
}


server.listen(config.GameStateIntegrationPort);
