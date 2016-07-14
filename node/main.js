/**
 * Created by 红亮 on 2016/1/11.
 */
var http = require('http');

http.createServer(function(request, response) {
  response.writeHead(200, {"content-type": 'text/plain'});
    response.write('hello world');
    response.end();
}).listen(8888);
