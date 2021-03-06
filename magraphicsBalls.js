autowatch = 1;
inlets = 3;
outlets = 4;

///////////////////////////////////GLOBAL///////////////////////////////////////
var width, height, boxes = [], numberBoxes, balls = [], ballsHistory = [],
    boxesHistory = [], numberBalls, drag, beingDragged, friction, bounce,
    gravity, posBeforeClick, paused, trigger, triggerRegister;

width = 200;
height = 200;
numberBalls = 5;
numberBoxes = 1;
bounce = 1;
gravity = -0.01;
drag = 0.0001;
friction = 0.04;
beingDragged = null;
paused = false;
trigger = true;
triggerRegister = 0;






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


function Ball(i, rad, x, y, vx, vy, color, mass){
  this.rad = rad;
  this.x = x;
  this.y = y;
  this.vx = vx;
  this.vy =vy;
  this.color = color;
  this.i = i;
  this.spin = 0;
  this.mass = mass;
  this.pastCollide = false;
  this.atRestx = false;
  this.atResty = false;

  this.update = function(){
    if(Math.abs(this.vy) <= -drag){this.vy = 0; this.atResty = true;}
    if(Math.abs(this.vx) <= -drag){this.vx = 0; this.atRestx = true;}

    if(!paused){
      if(this.x-this.rad <= 0 || this.x+this.rad >= width){
        this.vx = collidex(this.vx, this);
        if(trigger){
          outlet(0, 1);
          outlet(1, this.y + (triggerRegister*12));
        }}
      if(this.y-this.rad <= 0 || this.y+this.rad >= height){
        this.vy = collidey(this.vy, this);
        if(trigger){
          outlet(0, 1);
          outlet(1, this.x + (triggerRegister*12));
        }}

      //collision detection w boxes
      for(var x=0; x < numberBoxes; x++){
        var box = boxes[x];
        var r = this.rad;

        if(this.x+r >= box.position[0] && this.x-r <= box.position[0] + box.size[0]){
          if(this.y+r >= box.position[1] && this.y-r <= box.position[1] + box.size[1]){
            solveBoxCollision(this, box);
          }
        }
      }

      //collision detection w other balls

	if (numberBalls > 1){
	for(var i=0; i<numberBalls; i++){
        if(i !== this.i){
          var b = balls[i];

          if(getDistance(this.x, this.y, b.x, b.y) <= this.rad+b.rad)
            {
            //console.log(getDistance(this.x, this.y, b.x, b.y));
              solveElasticCollision(this, b);
            }}}
      }

      this.vy -= gravity;
      if(sign(this.vx) == 1 && !this.atRestx) {this.vx -= drag;}
      if(sign(this.vx) == -1 && !this.atRestx) {this.vx += drag;}
      if(sign(this.vy) == 1 && !this.atResty) {this.vy -= drag;}
      if(sign(this.vy) == -1 && !this.atResty) {this.vy += drag;}

      //if(this.x-this.rad+15 >= 0 && this.x+this.rad-15 <= width)
      this.x += this.vx;
      //if(this.y-this.rad-10 >= 0 && this.y+this.rad+10 <= height)
      this.y += this.vy;

      if(this.x-this.rad < 0) this.x = 0 + this.rad;
      if(this.x+this.rad > width) this.x = width - this.rad;
      if(this.y-this.rad < 0) this.y = 0 + this.rad;
      if(this.y+this.rad > height) this.y = height - this.rad;

      //console.log("update");

    }

  }
  this.render = function(ctx){
    sketch.glcolor(this.color);
    sketch.moveto(coordToFloat(this.x), coordToFloat(this.y));
    sketch.circle(this.rad/100);

    if(paused){
      sketch.glcolor([0.1,1,1,1]);
      sketch.moveto(coordToFloat(this.x), coordToFloat(this.y));
      sketch.lineto(coordToFloat(this.vx*10 + this.x), coordToFloat(this.vy*10 + this.y))
    }

  }
}

function CollisionBox(x, y, w, h){
  this.position = [x, y];
  this.size = [w, h];
  this.x = x;
  this.y = y;
  this.h = h;
  this.w = w;
  this.corners = [[], [], [], []];
  this.color = [.3, .3, .3];

  this.calculateCorners = function(){
    var w = this.size[0] / 2;
    var	h = this.size[1] / 2;
    var x = this.position[0] + w;
    var y = this.position[1] + h;

    this.corners[0][0] = x - w;
    this.corners[0][1] = y - h;
    this.corners[1][0] = x + w;
    this.corners[1][1] = y - h;
    this.corners[2][0] = x - w;
    this.corners[2][1] = y + h;
    this.corners[3][0] = x + w;
    this.corners[3][1] = y + h;

  }


  this.render = function(ctx){
    //Draw BOX
    ctx.glcolor(this.color);
    ctx.moveto(coordToFloat(this.position[0]+(this.size[0]/2)), coordToFloat(this.position[1]+(this.size[1]/2)));
    ctx.plane((this.size[0]/2)/100,(this.size[1]/2)/100);
    //Draw Top Left Corner
    ctx.glcolor(0.9,0.9,0.3);
    ctx.moveto(coordToFloat(this.corners[0][0]), coordToFloat(this.corners[0][1]));
    ctx.circle(0.037);

    //Draw Top Right Corner
    ctx.moveto(coordToFloat(this.corners[1][0]), coordToFloat(this.corners[1][1]));
    ctx.circle(0.037);

    //Draw Bottom Left Corner
    ctx.moveto(coordToFloat(this.corners[2][0]), coordToFloat(this.corners[2][1]));
    ctx.circle(0.037);

    //Draw Bottom Right Corner
    ctx.moveto(coordToFloat(this.corners[3][0]), coordToFloat(this.corners[3][1]));
    ctx.circle(0.037);

  }
}


///////////////////////////////////FUNCTIONS////////////////////////////////////
function setHeight(x){
  if(beingDragged != null){
    if(beingDragged[0] == 1){//change ball velocity
      boxes[beingDragged[1]].size[1] = x;
      boxesHistory[beingDragged[1]].size[1] = x;
    }
  }
}

function setWidth(x){
  if(beingDragged != null){
    if(beingDragged[0] == 1){//change ball velocity
      boxes[beingDragged[1]].size[0] = x;
      boxesHistory[beingDragged[1]].size[0] = x;
    }
  }
}

function setYVel(x){
  if(beingDragged != null){
    if(beingDragged[0] == 0){//change ball velocity
      balls[beingDragged[1]].vy = -x;
      ballsHistory[beingDragged[1]].vy = -x;
    }
  }
}

function setXVel(x){
  if(beingDragged != null){
    if(beingDragged[0] == 0){//change ball velocity
      balls[beingDragged[1]].vx = -x;
      ballsHistory[beingDragged[1]].vx = -x;
    }
  }
}

function setYPos(x){
  if(beingDragged != null){
    if(beingDragged[0] == 0){//change ball position
      balls[beingDragged[1]].y = x;
      ballsHistory[beingDragged[1]].y = x;
    }
    if(beingDragged[0] == 1){//change box position
      boxes[beingDragged[1]].position[1] = x;
      boxesHistory[beingDragged[1]].position[1] = x;
    }
  }
}

function setXPos(x){
  if(beingDragged != null){
    if(beingDragged[0] == 0){//change ball position
      balls[beingDragged[1]].x = x;
      ballsHistory[beingDragged[1]].x = x;
    }
    if(beingDragged[0] == 1){//change box position
      boxes[beingDragged[1]].position[0] = x;
      boxesHistory[beingDragged[1]].position[0] = x;
    }
  }
}

function setTriggerRegister(r){
  triggerRegister = r;
}

function triggerBool(b){
  trigger = b;
}

function setBounce(n){
  bounce = n/10;
//  post(bounce);
}
function setGravity(n){
  gravity = -n/1000;
//  post(gravity);
}
function setDrag(n){
  drag = -n/10000;
//  post(drag);
}


 function playPause(){
  	if(!paused){
     for(var i=0; i<numberBalls; i++){
       var b = ballsHistory[i];
      balls[i] = new Ball(b.i, b.rad, b.x, b.y, b.vx, b.vy, b.color, b.mass);
     }
     for(var i=0; i<numberBoxes; i++){
       var b = boxesHistory[i];
       boxes[i] = new CollisionBox(b.position[0], b.position[1], b.size[0], b.size[1]);
     }
   }
   paused = !paused;
	tsk.repeat(10000);
  if(mod.draw){
    mod.setModify(false);
    if(beingDragged[0]==0){
      balls[beingDragged[1]].color = [0.9,0.9,0.3,1];
    } else if(beingDragged[0]==1){
      boxes[beingDragged[1]].color = [0.3,0.3,0.3,1];
    }
    beingDragged = null;
   // post("mod off");
 }

 }

function changeNumberBalls(no){
	numberBalls = no;
	post(numberBalls);
}

function clear(){
  sketch.glclear();
}

function game(){
  clear();
  sketch.glclear();
  sketch.glcolor(.2, .2, .2);
  sketch.moveto(-1, -1);
  sketch.plane(2,2);
  if(mod.draw){mod.render(sketch);};

  for(var i=0; i<numberBalls; i++){
    var b = balls[i];
    b.update();
    b.render(sketch);
  }
  for(var i=0; i<numberBoxes; i++){
    var b = boxes[i];
    b.calculateCorners();
    b.render(sketch);
  }
  refresh();

 //assign mouse events to functions
}

////////////////Click and Modify////////////////////
function onclick(x,y){
   var worldx = sketch.screentoworld(x,y)[0];
   var worldy = sketch.screentoworld(x,y)[1];

   var x_click = floatToCoord(worldx); // position of click on coordinate grid
   var y_click = floatToCoord(worldy);

   if(mod.draw){
     mod.setModify(false);
     if(beingDragged[0]==0){
       balls[beingDragged[1]].color = [0.9,0.9,0.3,1];
     } else if(beingDragged[0]==1){
       boxes[beingDragged[1]].color = [0.3,0.3,0.3,1];
     }
     beingDragged = null;
    // post("mod off");
  } else{
     for(var i=0; i<numberBoxes; i++){
       var box = boxes[i];
       if(x_click >= box.position[0] && x_click <= box.position[0] + box.size[0]){
         if(y_click >= box.position[1] && y_click <= box.position[1] + box.size[1]){
           mod.setModify(true);
           beingDragged = [1,i];
           box.color = [0.8,1,0.3,1];
         }
       }

     }
     for(var i=0; i<numberBalls; i++){
       var b = balls[i];
       if(getDistance(x_click, y_click, b.x, b.y) < b.rad){
         mod.setModify(true);
         beingDragged = [0,i];
         b.color = [0.8,1,0.3,1];
        // post(x_click, y_click, ":mouse...");
        // post(b.x, b.y, ":ball");
         break;
       }
     }
   }
}


function collidex(v, ball){ //calculates the velocity/spin resulting from a collision with wall
  if(ball.spin !== 0){ //apply effect of spin on velocity
    ball.vy += ball.spin * friction
  }

  var angularVelocity = ball.vy; //calculate next spin
  if(angularVelocity !== 0){
    ball.spin = angularVelocity * friction;
  }
  return -v * bounce;
}

function collidey(v, ball){ //calculates the velocity/spin resulting from a collision with wall
  if(ball.spin !== 0){ //apply effect of spin on velocity
    ball.vx += ball.spin * friction
  }

  var angularVelocity = ball.vx; //calculate next spin
  if(angularVelocity !== 0){
    ball.spin = angularVelocity * friction;
  }
  return -v * bounce;
}

function rotate(vx, vy, angle){
  var rotated = {
    x: vx * Math.cos(angle) - vy * Math.sin(angle),
    y: vx * Math.sin(angle) + vy * Math.cos(angle)
  }

  return rotated;
}

function solveElasticCollision(p1, p2){
  var vxDiff = p1.vx - p2.vx;
  var vyDiff = p1.vy - p2.vy;
  var xD = p2.x - p1.x;
  var yD = p2.y - p1.y;

  if(vxDiff * xD + vyDiff * yD >= 0){
    var angle = -Math.atan2(p2.y-p1.y, p2.x-p1.x);
    var m1 = p1.mass;
    var m2 = p2.mass;
    //1d velocities
    var u1 = rotate(p1.vx, p1.vy, angle);
    var u2 = rotate(p2.vx, p2.vy, angle);
    //1d collision result
    var v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
        var v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y: u2.y };
    //change to 2d velocity
    var vF1 = rotate(v1.x, v1.y, -angle);
        var vF2 = rotate(v2.x, v2.y, -angle);
    //apply changes to balls velocity
    p1.vx = vF1.x;
    p1.vy = vF1.y;
    p2.vx = vF2.x;
    p2.vy = vF2.y;

}}

function solveBoxCollision(ball, box){
  var bx = ball.x;
  var by = ball.y;
  var br = ball.rad;
  var boxBoundsX = [box.position[0], box.position[0]+box.size[0]];
  var boxBoundsY = [box.position[1], box.position[1]+box.size[1]];
  var boxCenterX = box.position[0] + (box.size[0]/2);
  var boxCenterY = box.position[1] + (box.size[1]/2);

  if(bx <= boxBoundsX[0] || bx >= boxBoundsX[1]){//bounce left right
    ball.vx = -ball.vx;
    if(bx <= boxBoundsX[0]){
      ball.x = boxBoundsX[0] - br;
    }
    if(bx >= boxBoundsX[1]){
      ball.x = boxBoundsX[1] + br;
    }
  }
  else if(by <= boxBoundsY[0] || by >= boxBoundsY[1]){//bounce top
    ball.vy = -ball.vy;
    if(by <= boxBoundsY[0]){
      ball.y = boxBoundsY[0] - br;
    }
    if(by >= boxBoundsY[1]){
      ball.y = boxBoundsY[1] + br;
    }
  }
  else { //bounce corner
    ball.vy = -ball.vy;
    ball.vx = -ball.vx;
  }

}

function getDistance(x1, y1, x2, y2){
  var xD = x1-x2;
  var yD = y1-y2;
  return Math.sqrt((xD * xD)+(yD * yD));
}

function randIntRange(min, max){
  return Math.floor(Math.random() * (max - min +1) +min);
}


function floatToCoord(f){ //returns the coordinate or a floating point position on sketch
  return -100 * f + 100;
}

function coordToFloat(c){
  return -(c/100 - 1);
}

function sign(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; }

///////////////////////////////////INIT/////////////////////////////////////////
mod = new ModifyIndicator();

for(var i=0; i<numberBalls; i++){
  var rad = 15;
  var x = randIntRange(rad, width - rad);
  var y = randIntRange(rad, height - rad);
  var vx = 0.1; //pixels per tick velocity
  var vy = -0.1;
  var color = [0.9,0.9,0.3,1];
  var mass = 1;

  if(i !== 0){ //randomly generate new position for ball if ball is inside another
    for(var z; z < balls.length; z++){
      var binit = balls[z];
      if(getDistance(x, y, binit.x, binit.y) < rad + binit.rad){
        x = randIntRange(rad, width - rad);
        y = randIntRange(rad, height - rad);
        z = -1;
      }
    }
  }

  balls.push(new Ball(i, rad, x, y, vx, vy, color, mass));
  ballsHistory.push(new Ball(i, rad, x, y, vx, vy, color, mass));
}
for(var i = 0; i < numberBoxes; i++){
  boxes.push(new CollisionBox(50, 50, 25, 25));
  boxesHistory.push(new CollisionBox(50, 50, 50, 50));
}

/////////////////////////////////RUN GAME///////////////////////////////////////
var tsk = new Task(function(){
  game();
}, this);
tsk.interval = 30;
tsk.repeat(10000);
