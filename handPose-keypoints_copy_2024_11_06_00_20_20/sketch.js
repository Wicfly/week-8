let handPose;
let video;
let hands = [];

// 追踪拇指和食指捏合的变量
let pinch = 0;

// 定义蓝色和红色的小圆数组
let blueCircles = [];
let redCircles = [];
let totalCircles = 6;

// 定义盒子的位置和大小
let boxX, boxY, boxSize = 50;
let gameOver = false;

function preload() {
  // 加载手势模型
  handPose = ml5.handPose();
}

function setup() {
  createCanvas(640, 480);
  // 创建摄像头并隐藏它
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  // 开始检测手势
  handPose.detectStart(video, gotHands);

  // 随机生成3个蓝色和3个红色小圆
  for (let i = 0; i < 2; i++) {
    blueCircles.push({ x: random(width - 100), y: random(height - 100), color: 'rgb(255,189,189)' });
    redCircles.push({ x: random(width - 100), y: random(height - 100), color: 'rgb(112,211,233)' });
  }

  // 定义黑色盒子的位置
  boxX = width / 2 - boxSize / 2;
  boxY = height - boxSize - 10;
}

function draw() {
  // 绘制摄像头画面
  image(video, 0, 0, width, height);

  if (gameOver) {
    textSize(32);
    fill(0, 255, 0);
    textAlign(CENTER, CENTER);
    text("Game Over!", width / 2, height / 2);
    return;
  }

  // 绘制黑色盒子
  fill(0);
  rect(boxX, boxY, boxSize, boxSize);

  // 如果检测到手
  if (hands.length > 0) {
    // 获取食指和拇指的指尖位置
    let finger = hands[0].index_finger_tip;
    let thumb = hands[0].thumb_tip;

    // 计算捏合距离
    pinch = dist(finger.x, finger.y, thumb.x, thumb.y);

    // 如果捏合距离小于某个阈值，表示玩家在捏住
    if (pinch < 30) {
      let pinchX = (finger.x + thumb.x) / 2;
      let pinchY = (finger.y + thumb.y) / 2;

      // 检查是否捏住了小圆
      checkPinch(pinchX, pinchY, blueCircles);
      checkPinch(pinchX, pinchY, redCircles);
    }
  }

  // 绘制小圆
  drawCircles(blueCircles);
  drawCircles(redCircles);

  // 检查游戏是否结束
  if (blueCircles.length === 0 && redCircles.length === 0) {
    gameOver = true;
  }
}

// 绘制小圆的函数
function drawCircles(circles) {
  for (let i = 0; i < circles.length; i++) {
    fill(circles[i].color);
    noStroke();
    circle(circles[i].x, circles[i].y, 20);
  }
}

// 检查是否捏住小圆的函数
function checkPinch(pinchX, pinchY, circles) {
  for (let i = circles.length - 1; i >= 0; i--) {
    let d = dist(pinchX, pinchY, circles[i].x, circles[i].y);
    if (d < 10) {
      // 移动小圆到手指位置
      circles[i].x = pinchX;
      circles[i].y = pinchY;

      // 检查是否放入黑色盒子
      if (circles[i].x > boxX && circles[i].x < boxX + boxSize && circles[i].y > boxY && circles[i].y < boxY + boxSize) {
        // 从数组中移除小圆
        circles.splice(i, 1);
      }
    }
  }
}

// 回调函数，获取手势检测结果
function gotHands(results) {
  hands = results;
}
