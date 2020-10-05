
var teams = {
    left: {},
    right: {}
};
var start_money = {};





function fillObserved(player) {



    let statistics = player.getStats();
    let weapons = player.weapons;
    let right = false;

    




    if (player.observer_slot >= 1 && player.observer_slot <= 5) {
        right = true;
    }
    let flag = player.country_code || (right
        ? (teams.left.flag || "")
        : (teams.right.flag || ""));
    
    if(flag){
        $("#current_nick").css("background-image", "url(/files/img/flags/" + flag + ".png)").removeClass("no-flag");
    } else {
        $("#current_nick").css("background-image", "").addClass("no-flag");
    }

    $("#kills_count").html(statistics.kills + " K /");
    $("#assist_count").html(statistics.assists + " A /");
    $("#death_count").html(statistics.deaths + " D");

    $("#adr_count").html(player.state.adr == undefined ? "ADR: 0" : "ADR: " + player.state.adr + "");





    $("#player-container")
        .removeClass("t ct")
        .addClass(player.team.toLowerCase());

    $("#current_nick").html(player.name);
    $("#nick_also").html(player.real_name + " ");

    $("#nades").html("");


    for (let key in weapons) {
        let weapon = weapons[key];
        if (weapon.type == "Grenade") {
            for (let x = 0; x < weapon.ammo_reserve; x++) {
                $("#nades").append($("<img />").attr("src", "/files/img/grenades/" + weapon.name + ".png"));
            }
        }
        if (weapon.state == "active" || weapon.state == "reloading") {
            if (weapon.type == "Grenade" || weapon.type == "C4" || weapon.type == "Knife" || statistics.health == 0) {

                $(".clip").html("");
                $(".reserve").html("");
            } else {
                $(".clip").html(weapon.ammo_clip + "/");
                $(".reserve").html(weapon.ammo_reserve);
            }
        }
    }
    $("#armor-text").html(statistics.armor);
    $("#health-text").html(statistics.health);
    $("#armor-text")
        .removeClass("armor helmet")
        .addClass(statistics.helmet
            ? "helmet"
            : "armor");
    loadAvatar(player.steamid, function(){
        //if (("../files/playerAvatars/" + player.steamid + ".png")){
            $("#avatar_container").html($("<img />").attr("src", "../files/playerAvatars/"+player.steamid+".png"));
        //}
        //$("#avatar_container").html($("<img />").attr("src", "/av/"+player.steamid));
    });
    if (statistics.flashed > 0){
        $("#flashed").css("opacity", (((statistics.flashed)*100)/10000) + "");

        $("#flashed").css("display", "block");
    }
    else {
        $("#flashed").css("display", "none");
    }
    if (statistics.burning > 0){
        $("#burning").css("display", "block");
    }
    else {
        $("#burning").css("display", "none");
    }

    if (statistics.smoked > 0){

    }

}
function fillPlayers(teams){

    if(teams.left.players){
        for(var i = 0; i < 5; i++){
            if(i >=teams.left.players.length){
                $("#left").find("#player"+(i+1)).css("opacity", "0");
            } else{
                fillPlayer(teams.left.players[i],i, "left", teams.left.players.length);
                $("#left").find("#player"+(i+1)).css("opacity","1");

                $("#left").find("#player" +(i+1)).find(".playerAvatar").html($("<img />").attr("src", "../files/playerAvatars/"+teams.left.players[i].steamid+".png").addClass("playerImage"));

            }
        }
    }
    if(teams.right.players){
        for(var i = 0; i < 5; i++){
            if(i >=teams.right.players.length){
                $("#right").find("#player"+(i+1)).css("opacity","0");
            } else{
                fillPlayer(teams.right.players[i],i, "right", teams.right.players.length);
                $("#right").find("#player"+(i+1)).css("opacity","1");
                $("#right").find("#player" +(i+1)).find(".playerAvatar").html($("<img />").attr("src", "../files/playerAvatars/"+teams.left.players[i].steamid+".png").addClass("playerImage"));

            }
        }
    }
}


function fillPlayer(player,nr, side, max){
    let slot = player.observer_slot;
    let statistics = player.getStats();
    let weapons = player.getWeapons();
    let steamid = player.steamid;

    let team = player.team.toLowerCase();

    let health_gradient_left = statistics.health <= 20 ? "#ff0000" : team == "ct" ? "#00a0ff":"#ffa000";
    let health_gradient_right = statistics.health <= 20 ? "#ff0000" : team == "ct" ? "#F939E3":"#F939E3";
    let $player = $("#"+side).find("#player"+(nr+1));

    let $bottom = $player.find(".bottom_bar");
    let $top = $player.find(".bar1");







    //let gradient = "linear-gradient(to " + side +", rgba(0,0,0,0) " + (100-statistics.health) + "%, " + health_color + " " + (100-statistics.health) + "%)";
    let gradient = "linear-gradient(to " + side +", rgba(0,0,0,0) " + (100-statistics.health) + "%, " + health_gradient_left + " " + (100-statistics.health) + "%, " + health_gradient_right + " 100%)";


    //var unameToString = decodeURIComponent(player.name.split(" ").join("").replace(/[^a-zA-Z ]/g, "").slice(0,8));

    $player.removeClass("shrink").addClass(statistics.health == 0 ? "shrink" : "");
    $top.find("#bar_username").text(player.name);
    //$top.find("#bar_username").text(player.name.split(" ").join(""));
    $top.find("#bar_username").removeClass("dontdisplay").addClass(statistics.health == 0 ? "dontdisplay" : "");
    $player.find(".playerAvatar").removeClass("grayPic").addClass(statistics.health == 0 ? "grayPic" : "");
    //$bottom.find(".playerImage").removeClass("grayPic").addClass(statistics.health == 0 ? "grayPic" : "");
    //$player.find(".playerAvatar").addClass("grayPic");


    $top.find("#hp_p").text(statistics.health > 0 ? statistics.health : "");
    $top.find(".hp_bar2").css("background", gradient);


    $top.find(".stat_t").text("");
    $top.find(".stat_t").append("K:" +statistics.kills);
    $top.find(".stat_t").append(" D:" + statistics.deaths);
    $top.find(".stat_t").removeClass("dontdisplay").addClass(statistics.health == 0 ? "dontdisplay" : "");

    $bottom.find(".hp_el").html(statistics.helmet ? $("<img />").attr("src", "/files/img/helmet.png") : statistics.armor > 0 ? $("<img />").attr("src", "/files/img/armor.png") : "");
    $bottom.find(".bomb_defuse").html(statistics.defusekit ? $("<img />").attr("src", "/files/img/elements/defuse.png").addClass("invert_brightness") : "");

    $bottom.find(".moneys").text("$"+statistics.money);
    $bottom.find(".moneys").removeClass("low").addClass(statistics.money < 1000? "low":"");
    
    $top.find("#weapon_icon").html("");
    $bottom.find("#weapon_icon").html("");
    $bottom.find("#nade_icon").html("");
    /*
    if(statistics.round_kills > 0){
        let img_css = {
            "text-shadow":"0 0 10px black",
            "float": side
        };
        $bottom.find("#weapon_icon").prepend($("<img />").attr("src", "/files/img/death.png").addClass("death").css("float", side)).prepend($("<div></div>").text(statistics.round_kills).css(img_css));
    }*/


    for(let key in weapons){
        let weapon = weapons[key];
        let name = weapon.name.replace("weapon_", "");
        let state = weapon.state;
        let view = "";
        let type = weapon.type;





        if (name == "taser" && weapon.state == "active"){
            $bottom.find("#weapon_icon").prepend($("<img />").attr("src", "/files/img/weapons/" + name + ".png").addClass("invert icon_secondary").addClass(view));
        } else if (type == "Knife"){
            $bottom.find("#weapon_icon").prepend($("<img />").attr("src", "/files/img/weapons/" + name + ".png").addClass("invert icon_knife").addClass(view));
        }

        view += weapon.state == "active" ? "checked" : "";

        //if (type == "Knife"){
        //    $bottom.find("#weapon_icon").prepend($("<img />").attr("src", "/files/img/weapons/" + name + ".png").addClass("invert icon_knife").addClass(view));
        //}

        if (type == "Pistol"){
            $bottom.find("#weapon_icon").prepend($("<img />").attr("src", "/files/img/weapons/" + name + ".png").addClass("invert icon_secondary").addClass(view));
        }
        /*if (name == "taser"){
            $bottom.find("#weapon_icon").append($("<img />").attr("src", "/files/img/weapons/" + name + ".png").addClass("invert icon_secondary").addClass(view));
        }*/
        //if (name == "taser"){
        //    $bottom.find("#weapon_icon").insertAfter("icon_secondary").append($("<img />").attr("src", "/files/img/weapons/" + name + ".png").addClass("invert icon_secondary").addClass(view));
        //}
        if (type != "C4" && type != "Grenade" && type != "Pistol" && type != "Knife" && name != "taser"){
            $bottom.find("#weapon_icon").prepend($("<img />").attr("src", "/files/img/weapons/" + name + ".png").addClass("invert icon_primary").addClass(view));

        }
        if(type == "Grenade") {

            for (let x = 0; x < weapon.ammo_reserve; x++) {
                $bottom.find("#nade_icon").append($("<img />").attr("src", "/files/img/grenades/weapon_" + name + ".png").addClass("invert").addClass(view));

            }
        }




        /*

                #left>.player>.bar1>.hp_bar>.bar_weapon, #left>.player>.bottom_bar>.equip_bar>.bar_weapon
                #left>.player>.bottom_bar>.equip_bar>.bar_nades



         */




        /*
        if(type != "C4" && type != "Knife"){

            view += weapon.state == "active" ? "checked" : "";
            if(type == "Grenade"){
                for(let x = 0; x < weapon.ammo_reserve; x++){
                    $bottom.find("#weapon_icon").append($("<img />").attr("src", "/files/img/grenades/weapon_" + name + ".png").addClass("invert").addClass(view));
                }
            } else if(type) {
                view += side == "right" ? " img-hor" : "";
                if (type == "Pistol") {
                    $bottom.find("#weapon_icon").prepend($("<img />").attr("src", "/files/img/weapons/" + name + ".png").addClass("invert").addClass(view));
                }

                else {
                    $top.find("#weapon_icon").prepend($("<img />").attr("src", "/files/img/weapons/" + name + ".png").addClass("invert").addClass(view));
                }


            }
        }*/
        if(type == "C4"){
            $bottom.find(".bomb_defuse").html($("<img />").attr("src", "/files/img/elements/bomb.png").addClass("invert_brightness"));

        }
       /* if (type == "Knife" ){
            $bottom.find("#weapon_icon").html($("<img />").attr("src", "/files/img/weapons/" + name + ".png").addClass("invert").addClass(view));
        } */
    }
    
    if (!start_money[steamid]) {
        start_money[steamid] = statistics.money;
    } 
    $("#stats_player"+slot).find("#stat_money").html("-"+(start_money[steamid]-statistics.money)+"$");
}

var isDefusing = false;
var bomb_time,
    bomb_timer,
    bomb_timer_css;
bomb_time = 0;
function bomb(time) {
    if (Math.pow((time - bomb_time), 2) > 1) {
        clearInterval(bomb_timer);
        bomb_time = parseFloat(time);
        if (bomb_time > 0) {
            bomb_timer = setInterval(function () {
                bomb_timer_css = {
                    display: "block",
                    width: bomb_time * 100 / 40 + "%"
                }
                $("#bomb_timer").css(bomb_timer_css);
                bomb_time = bomb_time - 0.01;
            }, 10);
        } else {
            clearInterval(bomb_timer);
        }
    }
}

function resetBomb() {
    clearInterval(bomb_timer);
    $("#bomb_timer").css("display", "none");
}

//SOME other weird vars
var menu = false;
var freezetime = false;
var over = false;
let last_round = 0;
var plantGradientRight = 0;
var plantGradientLeft = 0;
var defuseGradientRight = 0;
var defuseGradientLeft = 0;
var oldWinner = "";
var oldRound = 0;
const adrAll = new Array();
var putToArray = 0;
var roundNow = 0;
function updatePage(data) {




    var observed = data.getObserved();
    var phase = data.phase();

    var team_one = data.getTeamOne();
    var team_two = data.getTeamTwo();
    //var bombState = data.info.bomb.state;
    var round = data.info.map.round;
    var winners = data.info.map.round_wins;
    roundNow = round;






    try {
        if (winners[round] != oldWinner){

            if (winners[round] == "ct_win_defuse"){
                $("#defuser_custom").css("display", "inline-block").addClass("defuser_border");
                $("#defuseText_custom").text("The bomb was defused!");
            }


            oldWinner = data.info.map.round_wins[data.info.map.round];
            oldRound = data.info.map.round;
        }

    } catch (e) {
        
    }



    //data.map.round_wins,data.map.round






    /*
    if (phase.phase == "freezetime"){
    isAce = 0;
    }

    if (vmixPhaseOld != phase.phase){
        switch (isAce) {
            case 0:
                sendVMixAPICall(phase.phase);
                vmixPhaseOld = phase.phase;
                break;
            case 1:
                sendVMixAPICall("ace");
                vmixPhaseOld = "ace";
                break;
        }
    }*/



    var matchup = data.getMatchType();
    var match = data.getMatch();
    if(matchup && matchup.toLowerCase() != "none"){
        var block = $("<div class='block'></div>");
        var left_bl = $("<div></div>");
        var right_bl = $("<div></div>");
        for(var x = 0; x < (matchup == "bo5" ? 3 : 2); x ++){
            block.clone().appendTo($(left_bl)).addClass(match.team_1.map_score > x ? "win" : "");
            block.clone().appendTo(right_bl).addClass(match.team_2.map_score > x ? "win" : "");
        }
        $("#match_one_info").html(left_bl);
        $("#match_two_info").html(right_bl);
        
        $("#match_tournament").show();
        $("#match_info").text("Best Of " + matchup.substr(2));
    } else {
        $("#match_tournament").hide();
    }

    if (observed.steamid == 1 || !observed) {
        $("#player-container").css("opacity", "0");
    } else if (observed) {
        menu = (data.info.player.activity == "menu");
        $("#player-container").css("opacity", !menu ? "1" : "0");
    }
    let left,
        right;
    var players = data.getPlayers();
    var round = data.round();
    var map = data.map();


    var round_now = map.round + (round.phase == "over" || round.phase == "intermission"
        ? 0
        : 1);
    if ((round.phase == "freezetime" && !freezetime) || round_now != last_round) {
        start_money = {};
    }

    if (round.phase == "freezetime"){
        $("#player-container").removeClass("showPlayer");
        $("#player-container").addClass("hidePlayer");

    }
    if (round.phase != "freezetime"){
        $("#player-container").removeClass("hidePlayer");
        $("#player-container").addClass("showPlayer");

    }



    var longd = 10;
    var team_ct = data.getCT();
    var team_t = data.getT();
    var test_player2 = data.getPlayer(1);
    var tscore = [];
    $("body").css("display", !map || menu
        ? "none"
        : "block");
    if (test_player2) {
        left = test_player2
            .team
            .toLowerCase() == "ct"
            ? team_ct
            : team_t;
        right = test_player2
            .team
            .toLowerCase() != "ct"
            ? team_ct
            : team_t;
        
        teams.left.side = left.side || null;
        teams.right.side = right.side || null;

        teams.left.name = team_one.team_name || left.name;
        teams.right.name = team_two.team_name || right.name;

        if(teams.left.score !== undefined && teams.right.score !== undefined){
            if(left.score > teams.left.score){
                $("#winning_team").text(teams.left.name).removeClass("t-color ct-color").addClass(teams.left.side.toLowerCase() + "-color");
                $("#who_won").fadeTo(1000, 1).delay(2000).fadeTo(1000, 0);
            } else if(right.score > teams.right.score){
                $("#winning_team").text(teams.right.name).removeClass("t-color ct-color").addClass(teams.right.side.toLowerCase() + "-color");
                $("#who_won").fadeTo(1000, 1).delay(2000).fadeTo(1000, 0);
            }
        }

        teams.left.score = left.score;
        teams.right.score = right.score;

        teams.left.flag = team_one.country_code || null;
        teams.right.flag = team_two.country_code || null;

        teams.left.logo = team_one.logo || null;
        teams.right.logo = team_two.logo || null;

        teams.left.map_score = team_one.map_score || 0;
        teams.right.map_score = team_two.map_score || 0;


        teams.left.players = left.players || null;
        teams.right.players = right.players || null;

        $("#match_one_info")
            .removeClass("ct t")
            .addClass(test_player2.team.toLowerCase());
        $("#match_two_info")
            .removeClass("ct t")
            .addClass(test_player2.team.toLowerCase() != "ct"
                ? "ct"
                : "t");

        $("#team_1 #team_score")
            .removeClass("ct-color t-color")
            .addClass(test_player2.team.toLowerCase() + "-color").css("background-color", test_player2.team.toLowerCase() == "ct" ? "#007CFF" : "#F5B90A");
        $("#team_2 #team_score")
            .removeClass("ct-color t-color")
            .addClass(test_player2.team.toLowerCase() != "t"
                ? "t-color"
                : "ct-color").css("background-color", test_player2.team.toLowerCase() != "t" ? "#F5B90A" : "#007CFF");


        if (test_player2.team.toLowerCase() == "ct"){
            $("#time_counter").css("background", "linear-gradient(to right,#007cff 0%, #007cff 5%,#ff006f 55%,#f5b90a 95%,#f5b90a 100%)");
            $("#round_counter").css("background", "linear-gradient(to right,#007cff 0%, #007cff 5%,#ff006f 55%,#f5b90a 95%,#f5b90a 100%)");
        } else {
            $("#time_counter").css("background", "linear-gradient(to right, #f5b90a 0%,#f5b90a 5%,#ff006f 55%,#007cff 95%,#007cff 100%)");
            $("#round_counter").css("background", "linear-gradient(to right, #f5b90a 0%,#f5b90a 5%,#ff006f 55%,#007cff 95%,#007cff 100%)");
        }



        $("#left")
            .find("#team_money_1").removeClass('low').addClass(left.team_money < 1000 ? "low":"")
            .text("$" + left.team_money);
        $("#left")
            .find("#eq_money_1")
            .text("$" + left.equip_value);

        $("#right")
            .find("#team_money_2").removeClass('low').addClass(right.team_money < 1000 ? "low":"")
            .text("$" + right.team_money);
        $("#right")
            .find("#eq_money_2")
            .text("$" + right.equip_value);
    }

    $("#round_counter").html("Round " + round_now + " / 30");
    //TEAMS

    $("#team_2 #team_name").html(teams.right.name);
    $("#team_2 #team_score").html(teams.right.score);
    $("#team_1 #team_name").html(teams.left.name);
    $("#team_1 #team_score").html(teams.left.score);
    if (teams.left.logo || teams.left.flag) {
        if (teams.left.flag) {
            $("#team_1 #team_logo #team_flag").css("background-image", "url('/files/img/flags/" + teams.left.flag + ".png')");
        }
        if (teams.left.logo) {
            $("#team_1_logo").attr("src", "/teams/"+teams.left.logo);
            $("#team_1 #team_logo").removeClass("empty");
        }
    } else {
        $("#team_1 #team_logo #team_flag").css("background-image", "");
        $("#team_1 #team_logo").addClass("empty");
    }
    if (teams.right.logo || teams.right.flag) {
        if (teams.right.flag) {
            $("#team_2 #team_logo #team_flag").css("background-image", "url('/files/img/flags/" + teams.right.flag + ".png')");
        }
        if (teams.right.logo) {
            $("#team_2_logo").attr("src", "/teams/"+teams.right.logo);
            $("#team_2 #team_logo").removeClass("empty");
        }
    } else {
        $("#team_2 #team_logo").addClass("empty");
        $("#team_2 #team_logo #team_flag").css("background-image", "");
    }

    //OBSERVED PLAYER
    if (observed && observed.steamid != 1 && observed.getStats()) {
        fillObserved(observed);
    }

    //EVERY OTHER PLAYER
    if (players) {
        
        var offset = 0;
        for (var sl in players) {
            let player = players[sl];
            if (avatars[player.steamid] != true && disp_avatars) 
                loadAvatar(player.steamid);
            
            if(player.observer_slot <= 5 && offset == 0 && player.team.toLowerCase() != teams.left.side)
                offset = 6 - sl;
        }
        fillPlayers(teams)
    }

    //PHASESc
    if (phase) {
        /*$("#time_counter").css("color", (phase.phase == "live" || phase.phase == "over" || phase.phase == "warmup" || (phase.phase == "freezetime" && phase.phase_ends_in > 10))
            ? "white"
            : "red");*/
        $("#defuser_custom").css("display", phase.phase == "defuse"
            ? "inline-block"
            : "none");
        try{
            $("#planter_custom").css("display", data.info.bomb.state == "planting"
                ? "inline-block"
                : "none");
        }catch (e) {

        }

        try {
            if (data.info.bomb.state == "planting"){
                let countdown = data.info.bomb.countdown;
                //350 * (parseFloat(phase.phase_ends_in) / longd)
                //console.log(countdown);
                let planterPercent = (100 * (countdown / 3)).toFixed(0);
                if (planterPercent > 100){planterPercent = 100};

                var plantGradientHelper = 100-planterPercent;
                if (plantGradientHelper <= 50){
                    plantGradientRight = plantGradientHelper*2;
                }
                if (plantGradientHelper > 50){
                    let vHelper = plantGradientHelper-50;
                    plantGradientLeft = vHelper*2;
                }
                //console.log(v1);
                //console.log(plantGradientRight);
                //console.log(plantGradientLeft);
                $("#plantProgress_custom").css("background", "linear-gradient(to right, #FF006F " + plantGradientLeft + "% ,#F5B90A " + plantGradientRight + "%)");

            }
        }catch (e) {

        }






        try{
            let plantSid = data.info.bomb.player;
            let plantText = data.info.allplayers[plantSid].name;
            $("#plantText_custom").text(data.info.bomb.state == "planting" ? plantText + " is planting the bomb!" : "");


            let defuseSid = data.info.bomb.player;
            let defuseText = data.info.allplayers[defuseSid].name;
                    $("#defuseText_custom").text(phase.phase == "defuse" ? defuseText + " is defusing the bomb!" : "");
        } catch (e) {

        }





        if (phase.phase == "bomb" || phase.phase == "defuse") {
            if (phase.phase == "bomb") {
                bomb(parseFloat(phase.phase_ends_in));
            }
            if (phase.phase == "defuse") {
                if (!isDefusing) {
                    longd = 5;
                    if (parseFloat(phase.phase_ends_in) > 5) {
                        longd = 10;
                    }
                    isDefusing = true;
                }
                let defusePercent = (100 * (parseFloat(phase.phase_ends_in)/ longd)).toFixed(0);
                if (defusePercent > 100){defusePercent = 100}

                var defuseGradientHelper = 100-defusePercent;
                if (defuseGradientHelper <= 50){
                    defuseGradientLeft = defuseGradientHelper*2;

                }
                if (defuseGradientHelper > 50){
                    let vHelper = defuseGradientHelper-50;
                    defuseGradientRight = vHelper*4;

                }
                //console.log(v1);
                //console.log(plantGradientRight);
                //console.log(plantGradientLeft);
                $("#defuseProgress_custom").css("background", "linear-gradient(to right,  #007CFF " + defuseGradientLeft + "% ,#FF006F " + defuseGradientRight + "%)");
                var seconds = Math.round(parseFloat(phase.phase_ends_in).toFixed(1));
                $("#defuse_bar").css("width", 350 * (parseFloat(phase.phase_ends_in) / longd) + "px");
                $("#defuse_time").text("00:" + (seconds < 10 ? "0" + seconds : seconds));

            }
        } else {
            resetBomb();
        }

        if (phase.phase == "freezetime" || phase.phase.substring(0,7) == "timeout") {
            if (phase.phase_ends_in > 3) {
                if ($(".money").css("opacity") == 0) {
                    $(".money").fadeTo(1000, 1);
                    $("#stats-container").fadeTo(1000,1);
                    $(".stat_t").fadeTo(1000, 1);
                    $(".team").addClass("addBackground");
                    $(".player").addClass("removeBackground");
                    $("#header").css("opacity", 0);
                    /*
                    $(".team").removeClass("addBackground");
                     $(".team").find(".money").removeClass("addBackground");
                    $(".player").removeClass("removeBackground");
                    $(".team").find(".money").addClass("removeBackground");
                     */


                }
            } else {
                if ($(".money").css("opacity") == 1) {

                    $(".team").removeClass("addBackground");
                    $(".player").removeClass("removeBackground");
                    $(".money").fadeTo(1000, 0);
                    $(".stat_t").fadeTo(1000, 0);
                    $("#header").fadeTo(1000,1);
                    $("#stats-container").fadeTo(1000,0);
                    if (observed && observed.steamid != 1) 
                        $("#player-container").fadeTo(1000, 1);

                    }
                }

        } else {
            if ($(".money").css("opacity") == 1) {
                $(".money").fadeTo(1000, 0);
                $(".stat_t").fadeTo(1000, 0);
                $("#stats-container").fadeTo(1000,0);
                if (observed && observed.steamid != 1) 
                    $("#player-container").fadeTo(1000, 1);
            }
        }
        if (phase.phase_ends_in) {
            var countdown = Math.abs(Math.ceil(phase.phase_ends_in));
            var count_minute = Math.floor(countdown / 60);
            var count_seconds = countdown - (count_minute * 60);
            if (count_seconds < 10) {
                count_seconds = "0" + count_seconds;
            }
            if(phase.phase == "bomb" || phase.phase == "defuse"){
                $("#time_counter").text("").addClass("bomb_timer");
            } else {
                $("#time_counter").text(count_minute + ":" + count_seconds).removeClass("bomb_timer");
            }
        }
    }
    freezetime = round.phase == "freezetime";
    last_round = round_now;




}