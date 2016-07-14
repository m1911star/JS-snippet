/**
 * Created by 红亮 on 2016/1/11.
 */
var server = require('./server');

var url = require('./router');

server.start(url.router);
console.log(__filename)