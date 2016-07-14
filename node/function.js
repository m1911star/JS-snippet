/**
 * Created by 红亮 on 2016/1/11.
 */
function say(word) {
  console.log(word);
}

function execute(someFunction, value) {
  someFunction(value);
}

execute(say, "Hello");