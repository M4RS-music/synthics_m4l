var width, height, boxes = [], numberBoxes, balls = [], ballsHistory = [], boxesHistory = [], numberBalls, drag, dragOk, beingDragged, friction, bounce, gravity, posBeforeClick, paused;
numberBalls = 4;
numberBoxes = 1;
bounce = 0.9;
gravity = -0.09;
drag = 0.001;
friction = 0.04;
dragOk = false;
beingDragged = null;
paused = true;

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

  this.update = function(){
    if(!paused){
      if(this.x-this.rad <= 0 || this.x+this.rad >= width) this.vx = collidex(this.vx, this);
      if(this.y-this.rad <= 0 || this.y+this.rad >= height) this.vy = collidey(this.vy, this);

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
      for(var i=0; i<numberBalls; i++){
        if(i !== this.i){
          var b = balls[i];

          if(getDistance(this.x, this.y, b.x, b.y) <= this.rad+b.rad)
            {
            //console.log(getDistance(this.x, this.y, b.x, b.y));
              solveElasticCollision(this, b);
            }}
      }

      this.vy -= gravity;
      if(Math.sign(this.vx) == 1) this.vx -= drag;
      if(Math.sign(this.vx) == -1) this.vx += drag;
      if(Math.sign(this.vy) == 1) this.vy -= drag;
      if(Math.sign(this.vy) == -1) this.vy += drag;

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
    ctx.glcolor(this.color);
    ctx.moveto(this.x, this.y);
    ctx.circle(this.r);
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
    ctx.fillStyle = "rgba(10, 10, 10, 0.2)";
    ctx.strokeStyle = "rgba(1, 1, 1, 0.5)";
    ctx.rect(this.position[0], this.position[1], this.size[0], this.size[1]);

    //Draw Top Left Corner
    ctx.fillStyle = "rgba(120, 1, 60, 0.6)";
    ctx.arc(this.corners[0][0], this.corners[0][1], 7, 0, Math.PI * 2);


    //Draw Top Right Corner
    ctx.fillStyle = "rgba(120, 1, 60, 0.6)";
    ctx.arc(this.corners[1][0], this.corners[1][1], 7, 0, Math.PI * 2);


    //Draw Bottom Left Corner
    ctx.fillStyle = "rgba(120, 1, 60, 0.6)";
    ctx.arc(this.corners[2][0], this.corners[2][1], 7, 0, Math.PI * 2);


    //Draw Bottom Right Corner
    ctx.fillStyle = "rgba(100, 1, 60, 0.6)";
    ctx.arc(this.corners[3][0], this.corners[3][1], 7, 0, Math.PI * 2);

  }
}


///FUNCTIONS

function tick(){
  sketch.glclear();
  for (var i = 0; i < numberBalls; i++) {
    var b = balls[i];
    b.update();
    b.render(sketch);
  }
  for (var i = 0; i < numberBoxes; i++) {
    var b = boxes[i];
    b.render(sketch);
  }
}



  function bang()
  {
    sketch.glclear();
    sketch.glcolor(0.9,0.9,0.3);
    sketch.moveto(0,0);
    sketch.circle(0.3);
    refresh();
  }
  bang();
