var fs = require('fs');
var urls = fs.readFileSync('urls.txt').toString().split('\n');
var index = 0;

function get(num) {
	var tmp = urls.slice(index, num+index);
	index = index + num > urls.length ? urls.length : index + num;
	return tmp;
}

function len() {
	return urls.length;
}


module.exports = {
	get: get,
	len: len
}
