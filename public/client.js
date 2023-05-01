/* eslint-disable */
const BACKEND_URL = 'http://127.0.0.1:3001';
const video = document.createElement('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const canvasVideo = document.getElementById('canvasVideo');
const startButton = document.getElementById('startBtn');
const stopButton = document.getElementById('stopBtn');
const upButton = document.getElementById('upBtn');
const downBtn = document.getElementById('downBtn');
const cwBtn = document.getElementById('cwBtn');
const ccwBtn = document.getElementById('ccwBtn');
const forwardBtn = document.getElementById('forwardBtn');
const backBtn = document.getElementById('backBtn');
const leftBtn = document.getElementById('leftBtn');
const rigthBtn = document.getElementById('rigthBtn');
const plipForward = document.getElementById('plipForward');
const plipBack = document.getElementById('plipBack');
const plipRigth = document.getElementById('plipRigth');
const plipLeft = document.getElementById('plipLeft');


// SPEED DRONE
let droneSpeed = 10

const speed10 = document.getElementById('speed10');
const speed20 = document.getElementById('speed20');
const speed40 = document.getElementById('speed40');
const speed60 = document.getElementById('speed60');
const speed80 = document.getElementById('speed80');
const speed100 = document.getElementById('speed100');
speed10.classList.add("activeSpeed")



const withAI = document.getElementById('withAI');

const actionLog = document.getElementById('lastAction');
let Ai_VideoState = true
let lastAction, socket, player, model;
let clickedKey;


document.addEventListener('keypress', (event) => {
  clickedKey = event.key;

  if (clickedKey === 'Enter') {
    startDrone()
  }

  if (clickedKey === 'w') {
    upDrone()
    upButton.classList.add("activeBtn")
    removeActiveBtnStyle(upButton)
  }
  if (clickedKey === 's') {
    downDrone()
    downBtn.classList.add("activeBtn")
    removeActiveBtnStyle(downBtn)
  }
  if (clickedKey === 'a') {
    ccwDrone()
    ccwBtn.classList.add("activeBtn")
    removeActiveBtnStyle(ccwBtn)
  }
  if (clickedKey === 'd') {
    cwDrone()
    cwBtn.classList.add("activeBtn")
    removeActiveBtnStyle(cwBtn)
  }
});

document.onkeydown = checkKey;

function checkKey(e) {

  e = e || window.event;

  if (e.keyCode == '27') {
    stopDrone()
   }

  if (e.keyCode == '38') {
    // up arrow
    forwardDrone()
    forwardBtn.classList.add("activeBtn")
    removeActiveBtnStyle(forwardBtn)
  }
  else if (e.keyCode == '40') {
    // down arrow
    backDrone()
    backBtn.classList.add("activeBtn")
    removeActiveBtnStyle(backBtn)
  }
  else if (e.keyCode == '37') {
    // left arrow
    leftDrone()
    leftBtn.classList.add("activeBtn")
    removeActiveBtnStyle(leftBtn)
  }
  else if (e.keyCode == '39') {
    // right arrow
    rigthDrone()
    rigthBtn.classList.add("activeBtn")
    removeActiveBtnStyle(rigthBtn)
  }

}

function removeActiveBtnStyle(btn) {
  setTimeout(() => {
    btn.classList.remove('activeBtn')
  }, 1000)
}

const socketEvent = (predictions) => {
  for (const i in predictions) {
    if (predictions[i].label !== 'face' && predictions[i].score >= 0.8) {
      lastAction = predictions[i].label;
      socket.emit('action', lastAction);
    }
  }
};

const startVideo = async () => {
  const status = await handTrack.startVideo(video);
  if (status) runDetection()
  else alert('Please enable video');
};

const runDetection = async () => {
  const predictions = await model.detect(video);
  socketEvent(predictions);
  model.renderPredictions(predictions, canvas, context, video);
  requestAnimationFrame(runDetection);
};

const startDrone = () => {
  startVideo();
  socket.emit('start', true);
  startButton.classList.add("active")
  stopButton.classList.remove("active")
};

const stopDrone = () => {
  socket.emit('stop', true);
  handTrack.stopVideo(video);
  startButton.classList.remove("active")
  stopButton.classList.add("active")
};

const upDrone = () => {
  socket.emit('up', true);
};

const downDrone = () => {
  socket.emit('down', true)
};

const cwDrone = () => {
  socket.emit('cw', true)
}

const ccwDrone = () => {
  socket.emit('ccw', true)
}

const forwardDrone = () => {
  socket.emit('forward', true)
}

const backDrone = () => {
  socket.emit('back', true)
}

const leftDrone = () => {
  socket.emit('left', true)
}

const rigthDrone = () => {
  socket.emit('right', true)
}

const plipForwardDrone = () => {
  socket.emit('flip f', true)
}

const plipBackdDrone = () => {
  socket.emit('flip b', true)
}
const plipRigthDrone = () => {
  socket.emit('flip r', true)
}
const plipLeftdDrone = () => {
  socket.emit('flip l', true)
}

// SPEED DRONE 
function speedDrone(el) {
  console.log(el, "elvv");
  droneSpeed = el ;
  socket.emit(`speed`, el)

  droneSpeed === 10 ? speed10.classList.add("activeSpeed") : speed10.classList.remove("activeSpeed");
  droneSpeed === 20 ? speed20.classList.add("activeSpeed") : speed20.classList.remove("activeSpeed");
  droneSpeed === 40 ? speed40.classList.add("activeSpeed") : speed40.classList.remove("activeSpeed");
  droneSpeed === 60 ? speed60.classList.add("activeSpeed") : speed60.classList.remove("activeSpeed");
  droneSpeed === 80 ? speed80.classList.add("activeSpeed") : speed80.classList.remove("activeSpeed");
  droneSpeed === 100 ? speed100.classList.add("activeSpeed") : speed100.classList.remove("activeSpeed");
}




const onOffAI = () => {
  Ai_VideoState = !Ai_VideoState
  Ai_VideoState ? startVideo() : handTrack.stopVideo(video);
  !Ai_VideoState ? withAI.classList.add("unActiveAi") : withAI.classList.remove("unActiveAi");
  canvas.classList.toggle("displayNone")
}

const onSocketConnect = async () => {
  model = await handTrack.load({
    flipHorizontal: true,
    maxNumBoxes: 5,
    iouThreshold: 0.5,
    scoreThreshold: 0.6,
  });

  startButton.disabled = false;

  player = new JSMpeg.Player('pipe', {
    canvas: canvasVideo,
  });
  console.log('Connect');
}

const onLastAction = (msg) => {
  actionLog.innerHTML = msg;
}

const onStreamMessage = (data) => {
  player.write(data);
}

socket = io(BACKEND_URL, {
  allowUpgrades: false,
  upgrade: true,
  transports: ['websocket'],
});

socket.on('connect', onSocketConnect);
socket.on('lastAction', onLastAction)
socket.on('stream', onStreamMessage);

startButton.onclick = startDrone;
stopButton.onclick = stopDrone;
upButton.onclick = upDrone;
withAI.onclick = onOffAI;
downBtn.onclick = downDrone;
cwBtn.onclick = cwDrone;
ccwBtn.onclick = ccwDrone;
forwardBtn.onclick = forwardDrone;
backBtn.onclick = backDrone;
leftBtn.onclick = leftDrone;
rigthBtn.onclick = rigthDrone;
plipForward.onclick = plipForwardDrone;
plipBack.onclick = plipBackdDrone;
plipRigth.onclick = plipRigthDrone;
plipLeft.onclick = plipLeftdDrone;

// DRONE SPEED CLICK

speed10.addEventListener('click', () => speedDrone(10));
speed20.addEventListener('click', () => speedDrone(20));
speed40.addEventListener('click', () => speedDrone(40));
speed60.addEventListener('click', () => speedDrone(60));
speed80.addEventListener('click', () => speedDrone(80));
speed100.addEventListener('click', () => speedDrone(100));