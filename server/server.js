/**
 * User: Yury
 * Date: 02.06.13
 * Time: 10:35
 */

var http = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs'),
    socketIo = require('socket.io'),
    activityStatus = require('./ActivityStatus'),
    config = require('./config'),
    mediaType = require('./mediatype');

var errorResponse = function (res, err) {
    console.log(err);
    res.writeHead(500, {'Content-Type': 'text/plain'});
    res.end(err + '\n');
};

var socket = null;

var httpServer = http.createServer(function (req, res) {

    var reqPath = url.parse(req.url).pathname;
    console.log(reqPath);

    if (reqPath === '/') {
        reqPath += 'index.html';
    }

    var fullPath = path.join(__dirname, config.pathToClient);
    fullPath = path.join(fullPath, reqPath);

    fs.exists(fullPath, function (exists) {
        if (!exists) {
            res.writeHead(404, {'Content-Type': 'text/plain'});
            return res.end('404 Not Found\n');
        }

        fs.readFile(fullPath, function (err, file) {
            if (err) {
                return errorResponse(res, err);
            }

            var extension = path.extname(fullPath);
            var contentType = mediaType.getByExt(extension);

            if (!contentType) {
                return errorResponse(res, 'Unknown extension: ' + extension);
            }

            res.writeHead(200, {'Content-Type': contentType});
            res.end(file);
        });
    });
});

var io = socketIo.listen(httpServer);

activityStatus.LoadFromFileSync();
httpServer.listen(config.port, config.host);

io.sockets.on('connection', function (newSocket) {
    socket = newSocket;

    socket.on('saveData', function (data) {
        activityStatus.updateData(data);
        activityStatus.SaveToFile();
    });

    socket.on('loadData', function (data) {
        socket.emit('data', {values: activityStatus.getDataForDate(data.date)});
    });
});

console.log('Server running at http://' + config.host + ':' + config.port + '/');