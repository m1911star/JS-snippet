/**
 * Created by 红亮 on 2016/1/11.
 */
var fs = require('fs');

var readerStream = fs.createReadStream('input.txt');

var writerStream = fs.createWriteStream('output.txt');

readerStream.pipe(writerStream);

console.log('over!')