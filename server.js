var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , urls = require('./lib/urls')
  , clients = []
  , sockets = []
  , MAX_URL = 100;

var counter = function() {
  var i = 1;
  return function() {
    return i++;
  }
};
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With');
    next();
}

app.use(allowCrossDomain);
app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser({ keepExtensions: true }));

server.listen(8080);

app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/public/index.html');
});

// upload test file
/*
app.post('/file-upload', function (req, res) {
  console.log(req.files.test);
});
*/


io.sockets.on('connection', function (socket) {

  socket.emit('news', {});
  
  // Client connected.
  socket.on('client', function (data) {
    clients.push({
      id: socket.id,
      finished: 0,
      time: 0,
      requested: 0,
      requestTime: 0,
      fail: 0,
      five:0
    });
    sockets.push(socket);
    socket.broadcast.emit('client_conn', {clients: clients});
    socket.emit("url_data", {urls: urls.get(MAX_URL)});
    console.log("MAX_URL: " + MAX_URL);
  });

  // Client finish one.
  socket.on('finish one', function (data) {
    for (var i = clients.length; i--;) {
      if (clients[i].id === socket.id) {
        clients[i].finished += 1;
        clients[i].time = data.time;
        if (parseInt(data.time) <= 5000)
          clients[i].five +=1;
        break;
      }
    }
    socket.broadcast.emit('client_conn', {clients: clients});
  });

  // Client request one.
  socket.on('request one', function (data) {
    for (var i = clients.length; i--;) {
      if (clients[i].id === socket.id) {
        clients[i].requested += 1;
        clients[i].requestTime = data.time;
        break;
      }
    }
  })

  // fail one
  socket.on('fail one', function (data) {
    for (var i = clients.length; i--;) {
      if (clients[i].id === socket.id) {
        clients[i].fail += 1;
        break;
      }
    }
    socket.broadcast.emit('client_conn', {clients: clients});
  })

  // Server connected.
  socket.on('server', function (data) {
    socket.emit('client_conn', {clients: clients, url_num: urls.len()});
  });

  // Start to test
  socket.on('start', function (data) {
    console.log('start');
    socket.broadcast.emit('start the job', {data: data});
    //socket.broadcast.json.send({data: 'message'});
  });

  // Start to test different urls
  socket.on('start urls', function (data) {
    console.log('start urls');
    /*
    for (var i = 0; i < sockets.length; i++) {
      (function() {
        sockets[i].emit('start the job urls', {urls: urls.get(num)});
      })();
    }
    */
    socket.broadcast.emit('start the job urls',  {});
  });

  // Reset the clients
  socket.on('reset clients', function (data) {
    console.log('reset clients');
    urls.reset();
    console.log(parseInt(data.num));
    MAX_URL = parseInt(data.num);
    socket.broadcast.emit('reset', {});
  });


  socket.on('disconnect', function () {
    for (var i = clients.length; i--;)
      if (clients[i].id === socket.id) {
        clients.splice(i, 1);
      }
    for (var i = socket.length; i--;) {
      if (sockets[i] === socket) {
        sockets.splice(i, 1);
      }
    }
    socket.broadcast.emit('client_conn', {clients: clients});
    console.log('DISCONNESSO!!! ');
  });  
});

