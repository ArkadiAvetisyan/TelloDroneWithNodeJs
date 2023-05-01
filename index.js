const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const DronHelper = require('./drone-service.js');
const constants = require('./config/constants');
let timeout;
const actionCM = 40;
const actonDeg = 20;


app.use(express.static('public'));


app.post('/stream', (req, res) => {
  req.on('data', function (data) {
    io.emit('stream', data);
  });
});

io.on('connection', async (socket) => {
  socket.on('start', async () => {
    await DronHelper.send('command');
    console.log("ok");
    await DronHelper.streamonCommand();
    // await DronHelper.send('takeoff');
  });
  socket.on('stop', async () => {
    await DronHelper.send('land');
    await DronHelper.send('streamoff');
  });

  socket.on('up', async () => {
    await DronHelper.send(`up ${actionCM}`);
  });

  socket.on('down', async () => {
    await DronHelper.send(`down ${actionCM}`);
  });

  socket.on('cw', async () => {
    await DronHelper.send(`cw ${actonDeg}`);
  });

  socket.on('ccw', async () => {
    await DronHelper.send(`ccw ${actonDeg}`);
  });

  socket.on('forward', async () => {
    await DronHelper.send(`forward ${actionCM}`);
  });

  socket.on('back', async () => {
    await DronHelper.send(`back ${actionCM}`);
  });

  socket.on('left', async () => {
    await DronHelper.send(`left ${actionCM}`);
  });

  socket.on('right', async () => {
    await DronHelper.send(`right ${actionCM}`);
  });

  socket.on('flip f', async () => {
    await DronHelper.send(`flip f`);
  });

  socket.on('flip b', async () => {
    await DronHelper.send(`flip b`);
  });

  socket.on('flip r', async () => {
    await DronHelper.send(`flip r`);
  });

  socket.on('flip l', async () => {
    await DronHelper.send(`flip l`);
  });

  socket.on('speed', async (el) => {
    await DronHelper.send(`speed ${el}`);
    await DronHelper.send('speed?');
  });


  


  socket.on('action', async (msg) => {
    if (!timeout) {
      timeout = setTimeout(async () => {
        await DronHelper.send(`${constants.maping[msg]} 20`);
        io.emit('lastAction', constants.maping[msg]);
        timeout = null;
      }, 500);
    }
  });
});


http.listen(constants.serverPort, () => {
  // eslint-disable-next-line
  console.log(`Server running at port ${constants.serverPort}`);
});
