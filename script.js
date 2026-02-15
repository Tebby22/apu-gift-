const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

function resize() {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  canvas.style.width = innerWidth + "px";
  canvas.style.height = innerHeight + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resize);
resize();

const FROM = "Saiful";
const TO = "Anika";

const Scene = {
  WALK: 0,
  CLOSE_EYES: 1,
  REVEAL: 2,
  QUESTION: 3,
  WAIT: 4,
  YES: 5,
  DANCE: 6,
};

let scene = Scene.WALK;
let t = 0;
let boyX = -100;
let blush = 0;
let armReach = 0;
let heartPulse = 1;
let yesBtn = { visible: false };

const coupleImg = new Image();
let coupleReady = false;

coupleImg.src = "couple.jpg";
coupleImg.onload = () => coupleReady = true;

function roundRect(x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}

function miniHeart(x,y,s){
  ctx.beginPath();
  ctx.ellipse(x-s*0.5,y-s*0.25,s*0.5,s*0.5,0,0,Math.PI*2);
  ctx.ellipse(x+s*0.5,y-s*0.25,s*0.5,s*0.5,0,0,Math.PI*2);
  ctx.moveTo(x-s,y);
  ctx.lineTo(x+s,y);
  ctx.lineTo(x,y+s*1.25);
  ctx.closePath();
  ctx.fill();
}

function drawBackground(){
  const g = ctx.createLinearGradient(0,0,0,innerHeight);
  g.addColorStop(0,"#2b1055");
  g.addColorStop(1,"#ff4f9a");
  ctx.fillStyle = g;
  ctx.fillRect(0,0,innerWidth,innerHeight);
}

function speech(text){
  ctx.fillStyle="white";
  roundRect(innerWidth/2-160,80,320,60,20);
  ctx.fill();
  ctx.fillStyle="#e62864";
  ctx.font="700 16px Georgia";
  ctx.textAlign="center";
  ctx.fillText(text,innerWidth/2,115);
}

function drawBoy(x,y){
  ctx.fillStyle="#1a1a25";
  roundRect(x-20,y-90,40,70,14);
  ctx.fill();

  ctx.fillStyle="white";
  roundRect(x-6,y-85,12,60,6);
  ctx.fill();

  ctx.fillStyle="#c81e46";
  ctx.beginPath();
  ctx.moveTo(x,y-80);
  ctx.lineTo(x+6,y-70);
  ctx.lineTo(x,y-50);
  ctx.lineTo(x-6,y-70);
  ctx.fill();

  ctx.fillStyle="#ffe8d5";
  ctx.beginPath();
  ctx.arc(x,y-110,18,0,Math.PI*2);
  ctx.fill();

  ctx.fillStyle="black";
  ctx.beginPath();
  ctx.arc(x-2,y-115,18,Math.PI,0);
  ctx.fill();
}

function drawGirl(x,y){
  ctx.fillStyle="#ff6aa2";
  roundRect(x-20,y-90,40,70,14);
  ctx.fill();

  ctx.fillStyle="#ffe8d5";
  ctx.beginPath();
  ctx.arc(x,y-110,18,0,Math.PI*2);
  ctx.fill();

  ctx.fillStyle="#5a2a18";
  ctx.beginPath();
  ctx.arc(x-2,y-115,18,Math.PI,0);
  ctx.fill();
}

function drawYesButton(){
  const w=240,h=60;
  const x=innerWidth/2-w/2;
  const y=160;
  yesBtn={x,y,w,h,visible:true};
  ctx.fillStyle="#e62864";
  roundRect(x,y,w,h,20);
  ctx.fill();
  ctx.fillStyle="white";
  ctx.font="800 20px Georgia";
  ctx.textAlign="center";
  ctx.fillText("YES 💖",innerWidth/2,y+38);
}

canvas.addEventListener("click",e=>{
  if(yesBtn.visible){
    const {x,y,w,h}=yesBtn;
    if(e.clientX>=x&&e.clientX<=x+w&&e.clientY>=y&&e.clientY<=y+h){
      scene=Scene.YES;
      t=0;
    }
  }
});

function drawDance(){
  const cx=innerWidth/2;
  const baseY=innerHeight*0.75;
  const tt=performance.now()*0.001;

  const turn=Math.sin(tt)*0.25;
  const rise=Math.sin(tt*3)*8;

  ctx.save();
  ctx.translate(cx,baseY-rise);
  ctx.rotate(turn);
  ctx.translate(-cx,-baseY);

  drawBoy(cx-40,baseY);
  drawGirl(cx+40,baseY);

  ctx.restore();
}

function drawFinalPhoto(){
  if(!coupleReady) return;
  const w=Math.min(500,innerWidth*0.7);
  const h=300;
  const x=innerWidth/2-w/2;
  const y=220;

  ctx.fillStyle="white";
  roundRect(x-12,y-12,w+24,h+24,20);
  ctx.fill();

  ctx.drawImage(coupleImg,x,y,w,h);
}

function update(){
  t++;
  if(scene===Scene.WALK){
    boyX+=4;
    if(boyX>innerWidth/2-80){
      scene=Scene.CLOSE_EYES;
      t=0;
    }
  }
  if(scene===Scene.CLOSE_EYES&&t>80){
    scene=Scene.REVEAL;
    t=0;
  }
  if(scene===Scene.REVEAL&&t>80){
    scene=Scene.QUESTION;
    t=0;
  }
  if(scene===Scene.QUESTION&&t>80){
    scene=Scene.WAIT;
    t=0;
  }
  if(scene===Scene.YES&&t>100){
    scene=Scene.DANCE;
  }
  heartPulse=1+Math.sin(performance.now()/200)*0.2;
}

function draw(){
  drawBackground();

  if(scene!==Scene.DANCE){
    drawGirl(innerWidth/2+80,innerHeight*0.75);
    drawBoy(boyX,innerHeight*0.75);
  }

  if(scene===Scene.CLOSE_EYES) speech("Close your eyes… 🙈");
  if(scene===Scene.REVEAL) speech("Anika… one moment…");
  if(scene===Scene.QUESTION||scene===Scene.WAIT) speech("Will you be my Valentine? 💐");
  if(scene===Scene.WAIT) drawYesButton();
  if(scene===Scene.YES) speech("YES!!! 💖");

  if(scene===Scene.DANCE){
    drawDance();
    ctx.save();
    ctx.translate(innerWidth/2,140);
    ctx.scale(heartPulse,heartPulse);
    ctx.fillStyle="#ff3264";
    miniHeart(0,0,60);
    ctx.restore();

    ctx.fillStyle="white";
    ctx.font="700 50px Georgia";
    ctx.textAlign="center";
    ctx.fillText(`${FROM} ❤ ${TO}`,innerWidth/2,80);

    drawFinalPhoto();
  }
}

function loop(){
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();
