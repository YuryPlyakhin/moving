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
        dataFileName = path.join(util.getUserHome(), config.dataFileName),
        generateDateKey = function(year, month, day) {
            var monthStr = 10 > month ? '0' + month : month,
                dayStr = 10 > day ? '0' + day : day;

            return year + '-' + monthStr + '-' + dayStr + 'T05:00:00.000Z';
        };

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

    this.getMonthData = function(year, month, maxDay) {
        var monthData = {},
            i,
            key,
            date,
            isDone,
            activity;

        for (i = 1; i <= maxDay; i += 1) {
            key = generateDateKey(year, month, i);
            date = data[key];
            isDone = false;

            if (date) {
                isDone = true;
                for (activity in date) {
                    if (date.hasOwnProperty(activity) && !date[activity]) {
                        isDone = false;
                        break;
                    }
                }
            }
            monthData[i] = isDone;
        }

        return monthData;
    };
}

module.exports = new ActivityStatus();
