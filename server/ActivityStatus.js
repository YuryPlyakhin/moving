/**
 * User: Yury
 * Date: 03.06.13
 * Time: 17:13
 */
'use strict';

var path = require('path'),
    fs = require('fs'),
    util = require('./util'),
    config = require('./config');

/** @constructor */
function ActivityStatus() {
    var data = null,
        dataFileName = path.join(util.getUserHome(), config.dataFileName);

    this.LoadFromFile = function(cb) {

        // check if file exists
        fs.exists(dataFileName, function(exists) {
            if (exists) {
                // read it to the object
                fs.readFile(dataFileName, function(err, fileData) {
                    if (err) {
                        throw err;
                    }

                    data = JSON.parse(fileData);
                    cb();
                });
            } else {
                data = {};
                cb();
            }
        });
    };

    this.SaveToFile = function(cb) {
        fs.writeFile(dataFileName, JSON.stringify(data), function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log('data saved');
            }

            cb(err);
        });
    };

    this.updateData = function(update) {
        data[update.date] = update.fields;
    };

    this.getDataForDate = function(date) {
        return data[date];
    };
}

module.exports = new ActivityStatus();
