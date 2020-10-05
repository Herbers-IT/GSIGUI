const db = require('./database.js').freezetime;
db.loadDatabase();



exports.getfreezetime = (req, res) => {
    db.find({}, (err, freezetimeList) => {
        if (err)
            res.sendStatus(500);
        res.setHeader('Content-Type', 'application/json');
        return res.json({freezetimes: freezetimeList});
    });
};

exports.addFreezetime = (req, res) => {
    let freezetime = req.body;
    delete freezetime.id;
    db.insert(freezetime, (err, newfreezetime) => {
        if (err)
            return res.sendStatus(500);
        return res.status(200).json({id:newfreezetime["_id"]});
    });
};
exports.updateFreezetime = (req, res) => {
    let freezetime = req.body;
    let fId = freezetime._id;
    delete freezetime._id;
    db.update({ _id: fId }, freezetime, {}, (err, numReplaced) => {
        if(err) return res.sendStatus(500);
        return res.sendStatus(200);
    });
};
exports.render = (req, res) => {
    return res.render('freezetime', {
        ip: address,
        port: hud_port
    });
};