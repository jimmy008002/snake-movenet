let numSegments = 10;
let direction = 'right';

const xStart = 0; 
const yStart = 250; 
const diff = 10;

let xCor = [];
let yCor = [];

let xFruit = 0;
let yFruit = 0;
let scoreElem;

let detector;
let poses;
let video;

async function init() {
  const detectorConfig = {
    modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
  };
  detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.PoseNet,
    detectorConfig
  );
}

async function videoReady() {
  console.log("video ready");
  await getPoses();
}

async function setup() {
  mode=0;
   scoreElem = createDiv('Score = 0');
  scoreElem.position(20, 20);
  scoreElem.id = 'score';
  scoreElem.style('color', 'white');
 createCanvas(500, 500);
  createCanvas(500, 500);
   frameRate(7);
 stroke('skyblue');
  strokeWeight(10);
  updateFruitCoordinates();
  

  
  for (let i = 0; i < numSegments; i++) {
    xCor.push(xStart + i * diff);
    yCor.push(yStart);
  }
  
  video = createCapture(VIDEO, videoReady);
  // video.size(320, 240);

  await init();

  // createButton('pose').mousePressed(getPoses);
}

async function getPoses() {
  poses = await detector.estimatePoses(video.elt);
 control();
  setTimeout(getPoses, 500);
}

function calcAngleDegrees(a, b,c) {
    angle=0;
    rad=0;
    rad=Math.atan2(a.y-b.y, a.x-b.x) -Math.atan2(c.y-b.y, c.x-b.x) 
  
  
    angle= rad* 180 / Math.PI;

    return angle;
  }

function control(){
  
  start_action=false;
  
   console.log(poses)
    // Detect up flap
    // (Note: I add 40 to the y so we don't have to flap as high)
//     if (
//      poses[0].keypoints[9].y<poses[0].keypoints[5].y&&poses[0].keypoints[9].score>0.5&&poses[0].keypoints[5].score>0.5)
      
//      { console.log( poses[0].keypoints[9].y)
//        console.log( poses[0].keypoints[5].y)
//       if (direction !== 'down') {
//         direction = 'up';}
//     }
  left_knee=pose[0].keypoints[13];
  left_hip=pose[0].keypoints[11];  
  left_ankle=pose[0].keypoints[15]; 
  
    if (left_knee.y<left_hip.y&&calcAngleDegrees(left_hip,left_knee,left_ankle)<90){
        if (direction !== 'down') {
          direction = 'up';}
      }
  
   right_knee=pose[0].keypoints[14];
  right_hip=pose[0].keypoints[12];  
  right_ankle=pose[0].keypoints[16]; 
  
    if (right_knee.y<right_hip.y&&calcAngleDegrees(left_hip,left_knee,left_ankle)<90){
        if (direction !== 'up') {
          direction = 'down';}
      }

 
    left_wrist=pose[0].keypoints[9];
  left_elbow=pose[0].keypoints[7];  
  left_shoulder=pose[0].keypoints[5]; 
  
 if (left_wrist.y<left_elbow.y&&calcAngleDegrees(left_shoulder,left_elbow,left_wrist)<90){
        if (direction !== 'down') {
          direction = 'up';}
      }
  
  
  
}



function draw() {
  
  if(mode==0){
    
    text("START GAME",10,20)
    
  }else {
  
  
  background('hotpink');
  for (let i = 0; i < numSegments - 1; i++) {
    line(xCor[i], yCor[i], xCor[i + 1], yCor[i + 1]);
  }
  updateSnakeCoordinates();
  checkGameStatus();
  checkForFruit();}
}




function updateSnakeCoordinates() {
  for (let i = 0; i < numSegments - 1; i++) {
    xCor[i] = xCor[i + 1];
    yCor[i] = yCor[i + 1];
  }
  switch (direction) {
    case 'right':
      xCor[numSegments - 1] = xCor[numSegments - 2] + diff;
      yCor[numSegments - 1] = yCor[numSegments - 2];
      break;
    case 'up':
      xCor[numSegments - 1] = xCor[numSegments - 2];
      yCor[numSegments - 1] = yCor[numSegments - 2] - diff;
      break;
    case 'left':
      xCor[numSegments - 1] = xCor[numSegments - 2] - diff;
      yCor[numSegments - 1] = yCor[numSegments - 2];
      break;
    case 'down':
      xCor[numSegments - 1] = xCor[numSegments - 2];
      yCor[numSegments - 1] = yCor[numSegments - 2] + diff;
      break;
  }
}

/*
 检查蛇头的位置 xCor[xCor.length - 1] 和 yCor[yCor.length - 1] 来看它是否
 碰到边界或者自己。
*/
function checkGameStatus() {
  if (
    xCor[xCor.length - 1] > width ||
    xCor[xCor.length - 1] < 0 ||
    yCor[yCor.length - 1] > height ||
    yCor[yCor.length - 1] < 0 ||
    checkSnakeCollision()
  ) {
    noLoop();
    const scoreVal = parseInt(scoreElem.html().substring(8));
    scoreElem.html('Game ended! Your score was : ' + scoreVal);
  }
}

/*
 如果蛇碰到自己，说明蛇头的 (x,y) 坐标和它自身的小段之一的 (x,y) 坐标相同。
*/
function checkSnakeCollision() {
  const snakeHeadX = xCor[xCor.length - 1];
  const snakeHeadY = yCor[yCor.length - 1];
  for (let i = 0; i < xCor.length - 1; i++) {
    if (xCor[i] === snakeHeadX && yCor[i] === snakeHeadY) {
      return true;
    }
  }
}

/*
 蛇每吃一个水果，小段的数量就会增加，然后将尾段插入数组的开头
 （将最后一个小段再次添加到尾部，从而延长了尾部）
*/
function checkForFruit() {
  point(xFruit, yFruit);
  if (xCor[xCor.length - 1] === xFruit && yCor[yCor.length - 1] === yFruit) {
    const prevScore = parseInt(scoreElem.html().substring(8));
    scoreElem.html('Score = ' + (prevScore + 1));
    xCor.unshift(xCor[0]);
    yCor.unshift(yCor[0]);
    numSegments++;
    updateFruitCoordinates();
  }
}

function updateFruitCoordinates() {
  /*
    这里的数学逻辑是因为我希望这个点位于 100 和 width-100 之间，并四舍五入到
    10 的倍数 ，因为蛇以 10 的倍数移动。
  */

  xFruit = floor(random(10, (width - 100) / 10)) * 10;
  yFruit = floor(random(10, (height - 100) / 10)) * 10;
}

function keyPressed() {
  switch (keyCode) {
    case 74:
      if (direction !== 'right') {
        direction = 'left';
      }
      break;
    case 76:
      if (direction !== 'left') {
        direction = 'right';
      }
      break;
    case 73:
      if (direction !== 'down') {
        direction = 'up';
      }
      break;
    case 75:
      if (direction !== 'up') {
        direction = 'down';
      }
      break;
       case ENTER:
      mode=1
      break;
  }
}

function mouseClicked() {
 mode=1
}

