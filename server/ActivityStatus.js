/**
 * User: Yury
 * Date: 03.06.13
 * Time: 17:13
 */

var path = require('path'),
    fs = require('fs'),
    util = require('./util'),
    config = require('./config');

var ActivityStatus = new function () {
    var data = null;
    var dataFileName = path.join(util.getUserHome(), config.dataFileName);

    this.LoadFromFileSync = function () {

        // check if file exists
        var exists = fs.existsSync(dataFileName);

        if (exists) {
            // read it to the object
            var fileData = fs.readFileSync(dataFileName);
            data = JSON.parse(fileData);
        }
        else {
            data = {};
        }
    };

    this.SaveToFile = function () {
        fs.writeFile(dataFileName, JSON.stringify(data), function (err) {
            if (err) {
                console.log(err);
            }
            else {
                console.log('data saved');
            }

            socket.emit('saveCompleted', {err: err});
        });
    };

    this.updateData = function (update) {
        data[update.date] = update.fields;
    };

    this.getDataForDate = function (date) {
        return data[date];
    }
};

module.exports = ActivityStatus;
