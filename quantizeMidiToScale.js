var major[], currentScale[], mode;
major = [2,2,1,2,2,2,1];

function setRoot(r){ //interface function called by max, will set root and mode
  calculateScale(r);
}

function calculateScale(r){
  currentScale[0] = r;
  for(var i=1; i<major.length; i++){
    currentScale[i] = currentScale[i-1]+major[i-1];
  }
}

function midiToScale(n){
  //takes midi note n, and quantizes it to currentScale
  const needle = n;

  const closest = [1,5,6,8].reduce((a, b) => {
    return Math.abs(b - needle) < Math.abs(a - needle) ? b : a;
  });

  post(closest);
}
