/**
 * Created by 红亮 on 2016/1/11.
 */
var fs = require('fs');

var zlib = require('zlib');

fs.createReadStream('input.txt')
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream('input.txt.gz'));

