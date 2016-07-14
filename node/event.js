/**
 * Created by 红亮 on 2016/1/11.
 */
var events = require('events');

var eventEmmiter = new events.EventEmitter();

var connectHandler = function connected() {
    console.log('连接成功!');
    eventEmmiter.emit('data_received');
}

eventEmmiter.on('connection', connectHandler);

eventEmmiter.on('data_received', function() {
   console.log('数据接收成功！');
});

eventEmmiter.emit('connection');

console.log('over');