$(document).ready(function(){
    let id = null;

    listCameras();
    let vMixSettingsObject;
    $.get("/api/vmix", function (data) {
        vMixSettingsObject = data;
        loadvMixSettings(vMixSettingsObject.vmixs[0]);
    });
    let freezetimeSettingsObject;
    $.get("/api/freezetime", function (data) {
        freezetimeSettingsObject = data;
        loadFreezetimeSettings(freezetimeSettingsObject.freezetimes[0]);
    });
    let oscSettingsObject;
    $.get("/api/osc", function (data) {
        oscSettingsObject = data;
        loadOSC(oscSettingsObject.OSCs[0]);
    });

    $("#cameras").change(function(){
        let i = $(this).val();
        loadCamera(camerasOverall[i]);

        if(camerasOverall[i]) id = camerasOverall[i]._id;
        //$("#cname").formSelect();
    });

    $("#save_camera").click(function () {
        let camera = {
            cname: $("#cname").val(),
            uname: $("#uname").val(),
            password: $("#password").val(),
            ip: $("#ip").val(),
            cid: $("#cid").val()
        };
        let localId = $("#cameras").val();
        if (localId == "default"){
            addCamera(camera)
        } else {
            camera._id = camerasOverall[parseInt(localId)]._id;
            //console.log(camerasOverall[parseInt(localId)]._id);
            updateCamera(camera, camera._id);
        }

    });

    $("#delete_camera").click(function(){
        deleteCamera(id);
    });

    $("#save_vmix").click(function () {
        $.get("/api/vmix", function (data) {
            let vmix = {
                apiIP: $("#apiIP").val(),
                apiCallFreeze: $("#apiCallFreeze").val(),
                apiCallLiveT1: $("#apiCallLiveT1").val(),
                apiCallLiveT2: $("#apiCallLiveT2").val(),
                apiCallOver: $("#apiCallOver").val(),
                apiCallTimeout: $("#apiCallTimeout").val(),
                apiCallAce: $("#apiCallAce").val(),
                _id: data.vmixs[0]._id
            };
            if (data.vmixs.length == "1"){
                updatevMix(vmix);
            } else {
                addvMix(vmix);
            }
        });





    });

    $("#save_freeze").click(function () {
        $.get("/api/freezetime", function (data) {
            if (data.freezetimes.length == "0") {
                var freezetime = {
                    freezetimes: $("#rndsepk").val(),
                };
            } else {
                var freezetime = {
                    freezetimes: $("#rndsepk").val(),
                    _id: data.freezetimes[0]._id
                };
            }
            if (data.freezetimes.length == "1") {
                updateFreezetime(freezetime);
            } else {
                addFreezetime(freezetime);
            }
        });
    });

    $("#save_osc").click(function () {
        $.get("/api/osc", function (data) {
            if (data.OSCs.length == "0") {
                var osc = {
                    port: $("#oscPort").val(),
                    host: $("#oscHost").val()
                };
            } else {
                var osc = {
                    port: $("#oscPort").val(),
                    host: $("#oscHost").val(),
                    _id: data.OSCs[0]._id
                };
            }
            if (data.OSCs.length == "1") {
                updateOSC(osc);
            } else {
                addOSC(osc);
            }
        });
    });

});