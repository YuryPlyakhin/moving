/**
 * User: Yury
 * Date: 03.06.13
 * Time: 17:05
 */

var mediaType = new function () {
    var mediaType = {
        '.txt': 'text/plain',
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript'
    };

    this.getByExt = function (ext) {
        return mediaType[ext];
    };
};

module.exports = mediaType;