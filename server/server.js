/**
 * User: Yury
 * Date: 02.06.13
 * Time: 10:35
 */
'use strict';

var http = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs'),
    socketIo = require('socket.io'),
    activityStatus = require('./ActivityStatus'),
    config = require('./config'),
    util = require('./util');

var errorResponse = function(res, err) {
    console.log(err);
    res.writeHead(util.httpStatusCodes.InternalServerError,
        {'Content-Type': 'text/plain'});
    res.end(err + '\n');
};

var httpServer = http.createServer(function(req, res) {

    /*jslint nomen: true*/
    var reqPath = url.parse(req.url).pathname,
        fullPath = path.join(__dirname, config.pathToClient);
    /*jslint nomen: false*/

    console.log(reqPath);

    if ('/' === reqPath) {
        reqPath += 'index.html';
    }

    fullPath = path.join(fullPath, reqPath);

    fs.exists(fullPath, function(exists) {
        if (!exists) {
            res.writeHead(util.httpStatusCodes.NotFound,
                {'Content-Type': 'text/plain'});
            res.end('404 Not Found\n');
            return;
        }

        fs.readFile(fullPath, function(err, file) {
            if (err) {
                errorResponse(res, err);
                return;
            }

            var extension = path.extname(fullPath),
                contentType = util.extToMediaType[extension];

            if (!contentType) {
                errorResponse(res, 'Unknown extension: ' + extension);
                return;
            }

            res.writeHead(util.httpStatusCodes.OK,
                {'Content-Type': contentType});
            res.end(file);
        });
    });
});

var io = socketIo.listen(httpServer);

io.sockets.on('connection', function(socket) {

    socket.on('saveData', function(data) {
        activityStatus.updateData(data);
        activityStatus.SaveToFile(function(err) {
            socket.emit('saveCompleted', {err: err});
        });
    });

    socket.on('loadData', function(data) {
        socket.emit('data', {values: activityStatus.getDataForDate(data.date)});
    });

    socket.on('getMonthData', function(data) {
        var monthData = activityStatus.getMonthData(data.year, data.month,
            data.maxDay);
        socket.emit('monthData', monthData);
    });
});

activityStatus.LoadFromFile(function() {
    httpServer.listen(config.port, config.host);
    console.log('Server running at http://' + config.host + ':' + config.port +
        '/');
});
