var net = require('net');
var fs = require('fs');
var port = process.argv[2];

var server = net.createServer();

server.on('listening', function () {
  console.log(`Server is running on port ${port}`);
})

server.on('connection', function (socket) {
  console.log('Server has a new connection');

  socket.setEncoding('utf8');

  socket.write('command pwd')

  socket.on('data', function (data) {

    console.log('got:', data.toString());

    var command = data.trim().toLowerCase();

    switch (command) {
      case 'pwd':
        socket.write(process.cwd());
        break;
      case '@quit':
        socket.write('Bye, bye!!')
        return socket.end();
        break;
    }
  })
  socket.on('end', function () {
    console.log('client connection ended.');
  })
})

server.on('error', function (error) {
  console.log(`error server ${error.message}`);
});

server.on('close', function () {
  console.log('Server is closed.');
})

if (port === undefined) {
  console.log(`Please include port number as 'node ftpserv.js port'`);
}else {
  server.listen(port);
}
