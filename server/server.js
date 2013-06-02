/**
 * User: Yury
 * Date: 02.06.13
 * Time: 10:35
 */

var http = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs'),
    socketIo = require('socket.io');

var host = '127.0.0.1',
    port = 1337,
    pathToClient = '..\\client\\',
    pathToData = 'moving.json';

var mediaType = {
    '.txt': 'text/plain',
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript'
};

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

    var fullPath = path.join(__dirname, pathToClient);
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
            var contentType = mediaType[extension];

            if (!contentType) {
                return errorResponse(res, 'Unknown extension: ' + extension);
            }

            res.writeHead(200, {'Content-Type': contentType});
            res.end(file);
        });
    });
});

var io = socketIo.listen(httpServer);
httpServer.listen(port, host);

var getUserHome = function () {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
};

var saveDataToFile = function (filename, orig, update) {
    orig[update.date] = update.fields;

    fs.writeFile(filename, JSON.stringify(orig), function (err) {
        if (err) {
            console.log(err);
        }
        else {
            console.log('data saved');
        }

        socket.emit('saveCompleted', {err: err});
    });
};

io.sockets.on('connection', function (newSocket) {
    socket = newSocket;

    socket.on('saveData', function (data) {
        console.log(data);

        // check if file exists
        var fullPath = path.join(getUserHome(), pathToData);
        fs.exists(fullPath, function (exists) {

            if (exists) {
                // read it to the object
                fs.readFile(fullPath, function (err, fileData) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    var dataObject = JSON.parse(fileData);
                    saveDataToFile(fullPath, dataObject, data);
                });
                return;
            }

            saveDataToFile(fullPath, {}, data);
        });
    });
});

console.log('Server running at http://' + host + ':' + port + '/');