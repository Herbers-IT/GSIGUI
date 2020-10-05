const db = require('./database.js').vmix;
db.loadDatabase();

exports.getvMix = (req, res) => {
    db.find({}, (err, vmixList) => {
        if (err)
            res.sendStatus(500);
        res.setHeader('Content-Type', 'application/json');
        return res.json({vmixs: vmixList});
    });
};
exports.addvMix = (req, res) => {
    let vmix = req.body;
    delete vmix.id;
    db.insert(vmix, (err, newvmix) => {
        if (err)
            return res.sendStatus(500);
        return res.status(200).json({id:newvmix["_id"]});
    });
};
exports.updatevMix = (req, res) => {
        let vmix = req.body;
        let vId = vmix._id;
        delete vmix._id;
        db.update({ _id: vId }, vmix, {}, (err, numReplaced) => {
            if(err) return res.sendStatus(500);
            return res.sendStatus(200);
        });
};
exports.render = (req, res) => {
    return res.render('vmix', {
        ip: address,
        port: hud_port
    });
};

