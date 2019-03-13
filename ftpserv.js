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

  // commands Available
  socket.write('Commands Available:\npwd\n'+'cd\n'+'ls\n'+'mkdir\n'+'rmdir\n'+'get\n'+'put\n'+'@quit\n\n');

  let ftpServer = function (arg) {

    // command handler
    /*let
      command = arg.trim().toLowerCase(),
      cleanCommand = (command === 'pwd' || command === 'ls' || command === '@quit') ? command : command.substring(0,command.indexOf(" ")),
      dirname = '',
      file = '';

    if (cleanCommand === 'cd') {
      dirname = command.substring(command.indexOf(" ")+1);

    }else if (cleanCommand === 'mkdir') {
      dirname = command.substring(command.indexOf(" ")+1);

    }else if (cleanCommand === 'rmdir') {
      dirname = command.substring(command.indexOf(" ")+1);

    }else if (cleanCommand === 'get') {
      file = command.substring(command.indexOf(" ")+1);

    }else if (cleanCommand === 'put') {
      file = command.substring(command.indexOf(" ")+1);

    }*/
    var commands = commandManager(arg);
    switch (commands[0]) {
      case 'pwd':
        socket.write(process.cwd() + '\n');
        return ;
      case 'cd':
        process.chdir(commands[1]);
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
        fs.mkdir(commands[1], function (err) {
          if (err) {
            socket.write(`${err.message}\n`);
          }else {
            socket.write(`directory ${commands[1]} was created.\n`);
          }
        });
        return ;
      case 'rmdir':
        fs.rmdir(commands[1], function (err) {
          if (err) {
            socket.write(`${err.message}\n`);
          }else {
            socket.write(`directory ${commands[1]} was deleted.\n`);
          }
        });
        return ;
      case 'get':
      fs.copyFile(`${process.cwd()}/${commands[1]}`, `${process.env.OLDPWD}/ftp_client/local/${file}`, (err)=>{
        if (err) {
          socket.write(`${err.message}\n`);
        }else {
          socket.write(`file ${commands[1]} was copied succesfully\n`);
        }

      });
       return ;
       case 'put':
       fs.copyFile(`${process.env.OLDPWD}/ftp_client/local/${file}`,`${process.cwd()}/remote/${file}`, (err)=>{
         if (err) {
           socket.write(`${err.message}\n`);
         }else {
           socket.write(`file ${commands[1]} was copied succesfully\n`);
         }
       });
        return ;
      case '@quit':
        return socket.end('Bye\n');
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

// message in case port is missing
if (port === undefined) {
  console.log(`Please include port number as 'node ftpserv.js port'`);
}else {
  server.listen(port);
}

function commandManager(cmnd) {

let
  command = cmnd.trim().toLowerCase(),
  cleanCommand = (command === 'pwd' || command === 'ls' || command === '@quit') ? command : command.substring(0,command.indexOf(" ")),
  dirname = '',
  filename = '',
  parameters = [];

if (cleanCommand === 'pwd' || cleanCommand === 'ls' || command === '@quit') {
  parameters.push(cleanCommand);
  return parameters;
}
if (cleanCommand === 'cd') {
  dirname = command.substring(command.indexOf(" ")+1);
  parameters.push(cleanCommand);
  parameters.push(dirname);

}else if (cleanCommand === 'mkdir' || cleanCommand === 'rmdir') {
  dirname = command.substring(command.indexOf(" ")+1);
  parameters.push(cleanCommand);
  parameters.push(dirname);

}else if (cleanCommand === 'get' || cleanCommand === 'put') {
  filename = command.substring(command.indexOf(" ")+1);
  parameters.push(commandCleaned);
  parameters.push(filename);

}
 return parameters;
}
