/**
 * Created by 红亮 on 2016/1/11.
 */
buf = new Buffer(256);

len = buf.write('哈哈安徽')

console.log(buf.toString('utf8') + 'write :' + len);