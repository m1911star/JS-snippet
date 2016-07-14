///**
// * Created by m1911 on 16-2-23.
// */
//var someone = {
//	name: 'Bob',
//	showName: function () {
//		console.log(this
//			.name);
//	}
//};
//
//var another = {
//	name: 'Tom',
//	showName: someone.showName
//};
//
//another.showName();
//
//someone.showName();
//

var name = 2;
var a = {
	name: 22,
	fn: (function () {
		console.log(this.name);
	})(),
	fn1: function () {
		console.log(this
			.name);
	}
}
a.fn;
a.fn1();

console.log(3 + true);