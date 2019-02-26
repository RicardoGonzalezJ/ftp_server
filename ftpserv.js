'use strict';

const
  net = require('net'),
  fs = require('fs'),
  port = process.argv[2],
  spawn = require('child_process').spawn,

  server = net.createServer(function (socket) {

  //reporting
  console.log('Client connected');
  console.log(`localAddress: ${socket.localAddress}`);
  console.log(`RemoteAddress: ${socket.remoteAddress}`);

  socket.setEncoding('utf8');
  socket.write('Commands Available:\npwd\n'+'cd\n'+'ls\n'+'mkdir\n'+'rmdir\n'+'get\n'+'put\n'+'@quit\n\n');

  let ftpServer = function (arg) {

    let
      command = arg.trim().toLowerCase(),
      dirname = '',
      file = '';

    if (command.includes('cd')) {
      dirname = command.slice(3);
      command = 'cd';

    }else if (command.includes('mkdir')) {
      dirname = command.slice(6);
      command = 'mkdir';
    }else if (command.includes('rmdir')) {
      dirname = command.slice(6);
      command = 'rmdir';
    }else if (command.includes('get')) {
      file = command.slice(4);
      command = 'get';
    }else if (command.includes('put')) {
      file = command.slice(4);
      command = 'put';
    }

    switch (command) {
      case 'pwd':
        socket.write(process.cwd() + '\n');
        return ;
      case 'cd':
        process.chdir(dirname);
        return ;
      case 'ls':
      const
        ls = spawn('ls', [`${process.cwd()}`]);

        ls.stdout.on('data', function (data) {
          socket.write(data.toString());
        })

        ls.stderr.on('data', function (data) {
          socket.write(data.toString());
        });
        return ;
      case 'mkdir':
        fs.mkdir(dirname, function (err) {
          if (err) {
            socket.write(`${err.message}\n`);
          }else {
            socket.write(`directory ${dirname} was created.\n`);
          }
        });
        return ;
      case 'rmdir':
        fs.rmdir(dirname, function (err) {
          if (err) {
            socket.write(`${err.message}\n`);
          }else {
            socket.write(`directory ${dirname} was deleted.\n`);
          }
        });
        return ;
      case 'get':
      fs.copyFile(`${process.cwd()}/${file}`, `${process.env.OLDPWD}/ftp_client/local/${file}`, (err)=>{
        if (err) {
          socket.write(`${err.message}\n`);
        }else {
          socket.write(`file ${file} was copied succesfully\n`);
        }

      });
       return ;
       case 'put':
       fs.copyFile(`${process.env.OLDPWD}/ftp_client/local/${file}`,`${process.cwd()}/remote/${file}`, (err)=>{
         if (err) {
           socket.write(`${err.message}\n`);
         }else {
           socket.write(`file ${file} was copied succesfully\n`);
         }
       });
        return ;
      case '@quit':
        socket.write('disconnected from server\n');
        return socket.end();
    }
  }

  socket.on('data', function (data) {
    ftpServer(data)
  })

  socket.on('end', function () {
    console.log('client connection ended.');
  });

});

server.on('listening', function () {
  console.log(`Server is running on port ${port}`);

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
