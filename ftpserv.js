
const net = require('net');
const fs = require('fs');

const port = process.argv[2];
const { spawn } = require('child_process');

function commandManager(cmnd) {
  const
    command = cmnd.trim().toLowerCase();
  const cleanCommand = (command === 'pwd' || command === 'ls' || command === '@quit') ? command : command.substring(0, command.indexOf(' '));
  let dirname = '';
  let filename = '';
  const parameters = [];

  if (cleanCommand === 'pwd' || cleanCommand === 'ls' || command === '@quit') {
    parameters.push(cleanCommand);
    return parameters;
  }
  if (cleanCommand === 'cd') {
    dirname = command.substring(command.indexOf(' ') + 1);
    parameters.push(cleanCommand);
    parameters.push(dirname);
  } else if (cleanCommand === 'mkdir' || cleanCommand === 'rmdir') {
    dirname = command.substring(command.indexOf(' ') + 1);
    parameters.push(cleanCommand);
    parameters.push(dirname);
  } else if (cleanCommand === 'get' || cleanCommand === 'put') {
    filename = command.substring(command.indexOf(' ') + 1);
    parameters.push(cleanCommand);
    parameters.push(filename);
  }
  return parameters;
}

const server = net.createServer((socket) => {
  // reporting
  console.log('Client connected');
  console.log(`localAddress: ${socket.localAddress}`);
  console.log(`RemoteAddress: ${socket.remoteAddress}`);

  socket.setEncoding('utf8');

  // commands Available
  socket.write('Commands Available:\npwd\n' + 'cd\n' + 'ls\n' + 'mkdir\n' + 'rmdir\n' + 'get\n' + 'put\n' + '@quit\n\n');

  const ftpServer = function (arg) {
    const commands = commandManager(arg);

    switch (commands[0]) {
      case 'pwd':
        socket.write(`${process.cwd()}\n`);
        break;
      case 'cd':
        process.chdir(commands[1]);
        break;
      case 'ls': {
        const
          ls = spawn('ls', [`${process.cwd()}`]);

        ls.stdout.on('data', (data) => {
          socket.write(data.toString());
        });

        ls.stderr.on('data', (data) => {
          socket.write(data.toString());
        });
        break;
      }
      case 'mkdir':
        fs.mkdir(commands[1], (err) => {
          if (err) {
            socket.write(`${err.message}\n`);
          } else {
            socket.write(`directory ${commands[1]} was created.\n`);
          }
        });
        break;
      case 'rmdir':
        fs.rmdir(commands[1], (err) => {
          if (err) {
            socket.write(`${err.message}\n`);
          } else {
            socket.write(`directory ${commands[1]} was deleted.\n`);
          }
        });
        break;
      case 'get':
        fs.copyFile(`${process.cwd()}/${commands[1]}`, `${process.env.OLDPWD}/ftp_client/local/${commands[1]}`, (err) => {
          if (err) {
            socket.write(`${err.message}\n`);
          } else {
            socket.write(`file ${commands[1]} was copied succesfully\n`);
          }
        });
        break;
      case 'put':
        fs.copyFile(`${process.env.OLDPWD}/ftp_client/local/${commands[1]}`, `${process.cwd()}/remote/${commands[1]}`, (err) => {
          if (err) {
            socket.write(`${err.message}\n`);
          } else {
            socket.write(`file ${commands[1]} was copied succesfully\n`);
          }
        });
        break;
      case '@quit':
        socket.end('Bye\n');
        break;
      default:
        socket.write('invalid command');
        break;
    }
  };

  socket.on('data', (data) => {
    ftpServer(data);
  });

  socket.on('end', () => {
    console.log('client connection ended.');
  });
});

server.on('listening', () => {
  console.log(`Server is running on port ${port}`);
});

server.on('error', (error) => {
  console.log(`error server ${error.message}`);
});

server.on('close', () => {
  console.log('Server is closed.');
});

// message in case port is missing
if (port === undefined) {
  console.log('Please include port number as \'node ftpserv.js port\'');
} else {
  server.listen(port);
}
