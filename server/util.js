/**
 * User: Yury
 * Date: 03.06.13
 * Time: 17:18
 */

var util = new function () {

    this.getUserHome = function () {
        return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
    };
};

module.exports = util;
