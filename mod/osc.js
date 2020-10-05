const db = require('./database.js').osc;
db.loadDatabase();


exports.getOSC = (req, res) => {
    db.find({}, (err, OSCList) => {
        if (err)
            res.sendStatus(500);
        res.setHeader('Content-Type', 'application/json');
        return res.json({OSCs: OSCList});
    });
};
exports.addOSC = (req, res) => {
    let OSC = req.body;
    delete OSC.id;
    db.insert(OSC, (err, newOSC) => {
        if (err)
            return res.sendStatus(500);
        return res.status(200).json({id:newOSC["_id"]});
    });
};
exports.updateOSC = (req, res) => {
    let OSC = req.body;
    let oId = OSC._id;
    delete OSC._id;
    db.update({ _id: oId }, OSC, {}, (err, numReplaced) => {
        if(err) return res.sendStatus(500);
        return res.sendStatus(200);
    });
};
exports.render = (req, res) => {
    return res.render('OSC', {
        ip: address,
        port: hud_port
    });
};