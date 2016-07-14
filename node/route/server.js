/**
 * Created by 红亮 on 2016/1/11.
 */
var http = require('http');

var url = require('url');

function start(router) {
  function onRequest(request, response) {
    var pathname = url.parse(request.url).pathname;
    console.log('Request for ' + pathname + 'record');
    router(pathname);
    response.writeHead(200, {'content-type': 'text/plain'});
    response.write('hello world!');
    response.end();
  }

  http.createServer(onRequest).listen(8888);
  console.log('server has started....');
}

exports.start = start;
