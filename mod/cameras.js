const db = require('./database.js').cameras;
db.loadDatabase();


exports.addCamera = (req, res) => {
    let camera = req.body;
    delete camera.id;
    db.insert(camera, (err, newCamera) => {
        if (err)
            return res.sendStatus(500);
        return res.status(200).json({id:newCamera["_id"]});
    });
};
exports.updateCamera = (req, res) => {
    let camera = req.body;
    let camId = camera._id;
    delete camera._id;

    db.update({ _id: camId }, camera, {}, (err, numReplaced) => {
        if(err) return res.sendStatus(500);
        return res.sendStatus(200);
    });
};
exports.deleteCamera = (req,res) => {
    let camId = req.body.userId;

    db.remove({_id:camId}, {}, (err, numRemoved) => {
        if(err || numRemoved != 1) return res.sendStatus(500);
        return res.sendStatus(200);
    });
};
exports.getCameras = (req, res) => {
    db.find({}, (err, cameraList) => {
        if (err)
            res.sendStatus(500);
        res.setHeader('Content-Type', 'application/json');
        return res.json({cameras: cameraList});
    });
};
exports.render = (req, res) => {
    return res.render('cameras', {
        ip: address,
        port: hud_port
    });
};