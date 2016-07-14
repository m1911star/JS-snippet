/**
 * Created by 红亮 on 2016/1/11.
 */
var fs = require('fs');

fs.readFile('input.txt', function (err, data) {
   if (err) {
       console.log(err.stack);
       return;
   }
    console.log(data.toString());
});
console.log('dehdwedwe');