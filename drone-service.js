const { createSocket } = require('dgram');
const { spawn } = require('child_process');
const constants = require('./config/constants');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

class DroneService {
  constructor() {
    const udpSocket = createSocket('udp4');
    const udpStatePort = createSocket('udp4')
    udpSocket.bind(constants.udpPort);
    udpStatePort.bind(constants.udpStatePort);
    this.udpSocket = udpSocket;
    this.udpStatePort = udpStatePort;
    udpSocket.on('message', message => {
      console.log(`🤖 : ${message}`);
      io.sockets.emit('status', message.toString());
    })
    udpStatePort.on('message', message => {
      // console.log(`🤖 : ${message}`);
      io.sockets.emit('status', message.toString());
    })
  }


  send(command) {
    return new Promise((resolve) => {
      this.udpSocket.send(command, 0, command.length, constants.udpPort, constants.udpHost, (err) => {
        if (err) {
          throw err;
        } else {
          return resolve();
        }
      });
    });
  }

  streamonCommand() {
    // eslint-disable-next-line
    return new Promise(async (resolve) => {
      await this.send('streamon', 0, 'streamon'.length, constants.udpPort, constants.udpHost);
      spawn('ffmpeg', [
        '-hide_banner',
        '-i',
        `udp://${constants.udpHost}:${constants.udpStreamPort}`,
        '-f',
        'mpegts',
        '-codec:v',
        'mpeg1video',
        '-s',
        '600x500',
        '-b:v',
        '800k',
        '-bf',
        '0',
        '-r',
        '20',
        `${constants.streamEndpoint}`,
      ]);
      return resolve();
    });
  }
}

module.exports = new DroneService();
