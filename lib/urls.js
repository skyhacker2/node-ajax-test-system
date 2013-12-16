var fs = require('fs')
	, urls = fs.readFileSync('urls.txt').toString().split('\n')
	, index = 0
	, map = {};

function reset() {
	for (var i = urls.length;i--;) {
		map[i] = false;
	}
}

function get(num) {
	var arr = [];
	for (var i = 0; i < num; i++) {
		var index = parseInt((Math.random() * urls.length) + 1);
		if (map[index]) i--;
		else {
			arr.push(urls[index]);
			map[index] = true;
		}
	}
	return arr;
}

function len() {
	return urls.length;
}


reset();
module.exports = {
	get: get,
	len: len,
	reset: reset
}
