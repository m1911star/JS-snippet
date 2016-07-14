/**
 * Created by 红亮 on 2016/1/11.
 */
function Hello() {
  var name;
  this.setName = function(thyName) {
    name = thyName;
  };
  this.sayHello = function() {
    console.log('Hello' + name);
  };
};
module.exports = Hello;