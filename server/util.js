/**
 * User: Yury
 * Date: 03.06.13
 * Time: 17:18
 */
'use strict';

var Util = {};

Util.getUserHome = function() {
    var isWin32 = ('win32' === process.platform);
    return process.env[isWin32 ? 'USERPROFILE' : 'HOME'];
};

Util.extToMediaType = {
    '.txt': 'text/plain',
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json'
};

//noinspection MagicNumberJS
Util.httpStatusCodes = {
    'OK': 200,
    'NotFound': 404,
    'InternalServerError': 500
};

module.exports = Util;
