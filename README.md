# Simple FTP server and client

The aim of this project is for learning purpous the basic of an FTP server and client using node js built-in modules. 

I decide to work on this project because I was curious about the functionality behind a FTP server and client. 
The server has 8 basic commands.

Modules used on this project:
  * Net
  * File System
  * Child Process
  * Process

# How it works
1. open the terminal
1. Clone this repository `$ git clone git://github.com/RicardoGonzalezJ/ftp_server.git`
1. cd ftp_server
1. start the server:
   `node ftpserv.js port`
1. test the server using **nc** or **telnet**

# Commands:
* cd Changes the current directory of the ftp server.
* ls Displays the content of current directory.
* pwd Displays the work directory of the ftp server.
* mkdir <dir_name> Creates a directory in the ftp server.
* rmdir <dir_name> Deletes directory from the ftp server.
* get <file_name> copy the file from local folder to remote folder.
* put <file_name> copy the file from remote folder to local folder.

