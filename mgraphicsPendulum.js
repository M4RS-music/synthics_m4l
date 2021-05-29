autowatch = 1;
inlets = 2;
outlets = 4;

///////////////////////////////////GLOBAL///////////////////////////////////////
var canvas, ctx, width, height, magnets = [], numberMagnets, dampening, bounce,
gravity, pend, beingDragged, mouseInit, radInit, cYellow, cBlack, cGrey, drive, paused, initpause, doublepend;

width = 200;
height = 200;
bounce = 0.65;
gravity = -0.9;
dampening = 0.99;
numberMagnets = 3;
beingDragged = null;
paused = false;
cOrange = [0.9,0.7,0.2,1];
cYellow = [0.9,0.9,0.3,1];
cGrey = [0.3, 0.3, 0.3];
cBlack = [0,0,0];
paused = true;
tick = 0;
doublepend = false;



///////////////////////////////////OBJECTS//////////////////////////////////////
function ModifyIndicator(){
  this.x = 190;
  this.y = 10;
  this.rad = 0.06;
  this.draw = false;
  this.color = [0.8,1,0.3,1];

  this.setModify = function(v){
    this.draw = v;
  }
  this.render = function(ctx){
    ctx.glcolor(this.color);
    ctx.moveto(coordToFloat(this.x), coordToFloat(this.y));
    ctx.circle(this.rad);
  }
}


function Pendulum(x, y, len){
  this.origin = [x, y];
  this.position = [];
  this.len = len;
  this.angle = Math.PI / 4;
  this.v = 0.0;
  this.a = 0.0;
  this.rad = 15;


  this.update = function(){
    if(!paused){
      this.a = (gravity / this.len) * Math.sin(this.angle);
      this.v += this.a;
      this.v *= dampening;
      this.angle += this.v;
      this.position = [this.len * Math.sin(this.angle), this.len * Math.cos(this.angle)];
      this.position[0] += this.origin[0];
      this.position[1] += this.origin[1];

    }
    if(tick == 0){
      this.a = (gravity / this.len) * Math.sin(this.angle);
      this.v += this.a;
      this.v *= dampening;
      this.angle += this.v;
      this.position = [this.len * Math.sin(this.angle), this.len * Math.cos(this.angle)];
      this.position[0] += this.origin[0];
      this.position[1] += this.origin[1];
      tick++;
    }
    outlet(0, this.position[0]*100);
  }

    this.render = function(ctx){
      //DRAW PIVOT
      ctx.glcolor(cBlack);
      ctx.moveto(coordToFloat(this.origin[0]), coordToFloat(this.origin[1]));
      ctx.circle(0.05);

      //DRAW LINE
      ctx.lineto(coordToFloat(this.position[0]), coordToFloat(this.position[1]));

      //DRAW WEIGHT
      ctx.glcolor(cYellow);
      ctx.moveto(coordToFloat(this.position[0]), coordToFloat(this.position[1]));
      ctx.circle(this.rad/100);
    }
}

function Magnet(x, y, r) {
  this.position = [x, y];
  this.rad = r;
  this.strength = 0;
  this.field = r*2;
  this.color = cOrange;

  this.update = function(){

  }

  this.render = function(ctx){
    ctx.glcolor(this.color);
    ctx.moveto(coordToFloat(this.position[0]), coordToFloat(this.position[1]));
    ctx.circle(this.rad/100);
    ctx.glcolor(0.9,0.9,0.3,0.6);
    ctx.circle(this.field/100);
  }
}


///////////////////////////////////FUNCTIONS////////////////////////////////////
function setDrag(n){
  dampening = n/10;
}
function setGravity(n){
  gravity = -n/50;
}
function setDrive(n){
  drive = n;
}

function playPause(){
  paused = !paused;
  tick = 0;
  pend = new Pendulum(100, 20, 110);
  tsk.repeat(10000);
}


function floatToCoord(f){ //returns the coordinate or a floating point position on sketch
  return -100 * f + 100;
}

function coordToFloat(c){
  return -(c/100 - 1);
}

//////////////////////////////////CLICK AND MOD/////////////////////////////////
function onclick(x,y){
   var worldx = sketch.screentoworld(x,y)[0];
   var worldy = sketch.screentoworld(x,y)[1];

   var x_click = floatToCoord(worldx); // position of click on coordinate grid
   var y_click = floatToCoord(worldy);

   if(mod.draw){
     mod.setModify(false);
     if(beingDragged[0]==0){
       magnets[beingDragged[1]].color = cOrange;
     }
     beingDragged = null;
     post("mod off");
   } else{
     for(var i=0; i<numberMagnets; i++){
       m = magnets[i];
       if(getDistance(x_click, y_click, m.position[0], m.position[1]) < m.field){
         mod.setModify(true);
         beingDragged = [0,i];
         m.color = [0.8,1,0.3,1];
         break;
       }
     }
   }
}

////////////////////////////////////////////GAME////////////////////////////////
function clear(){
  sketch.glclear();
}

function game(){
  clear();
  sketch.glclear();
  sketch.glclear();
  sketch.glcolor(.2, .2, .2);
  sketch.moveto(-1, -1);
  sketch.plane(2,2);
  pend.update();
  pend.render(sketch);
  for(var i=0; i<numberMagnets; i++){
    var mag = magnets[i];
    mag.render(sketch);
  }
  //canvas.onmousedown = mouseDown;
  //canvas.onmouseup = mouseUp;
  refresh();
}

function getDistance(x1, y1, x2, y2){
  var xD = x1-x2;
  var yD = y1-y2;
  return Math.sqrt((xD * xD)+(yD * yD));
}

function randIntRange(min, max){
  return Math.floor(Math.random() * (max - min +1) +min);
}

///////////////////////////////////INIT/////////////////////////////////////////
mod = new ModifyIndicator();
pend = new Pendulum(100, 20, 110);
for(var i=0; i<numberMagnets; i++){
  var r = 10;
  var x = randIntRange(r, width - r);
  var y = randIntRange(r, height - r);

  if(i !== 0){ //randomly generate new position for mag if is inside another
    for(var z; z < magnets.length; z++){
      var binit = magnets[z];
      if(getDistance(x, y, binit.x, binit.y) < r + binit.rad){
        x = randIntRange(r, width - r);
        y = randIntRange(r, height - r);
        z = -1;
      }
    }
  }

  magnets.push(new Magnet(x, y, r));
}

/////////////////////////////////RUN GAME///////////////////////////////////////
var tsk = new Task(function(){
  game();
}, this);
tsk.interval = 10;
tsk.repeat(10000);
