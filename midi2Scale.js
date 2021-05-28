autowatch = 1;
inlets = 2;
outlets = 1;

var ionian=[], dorian=[], phrygian=[], lydian=[], mixolydian=[], aeolian=[], locrian=[], currentScale=[], modes=[];
ionian = [2,2,1,2,2,2,1];
dorian = [2,1,2,2,2,1,2];
phrygian = [1,2,2,2,1,2,2];
lydian = [2,2,2,1,2,2,1];
mixolydian = [2,2,1,2,2,1,2];
aeolian = [2,1,2,2,1,2,2];
locrian = [1,2,2,1,2,2,2];
modes = [ionian, dorian, phrygian, lydian, mixolydian, aeolian, locrian];




function setScale(root, mode){ //interface function called by max, will set root and mode]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]
  calculateScale(root+4, mode);
}

function calculateScale(root, modeI){
  var mode = modes[modeI];
  var x = 0;
  var it = 0;
  for(var i=0; i<128; i++){
    if(x==0){currentScale[i] = root + it*12} else{
      currentScale[i] = currentScale[i-1]+mode[x-1];
    }
    if(x==6){x=0; it++} else{x++}
  }
//  post(currentScale);
}

setScale(1, 1);
//post(currentScale);



function midiToScale(n){
  //takes midi note n, and quantizes it to currentScale
  const needle = n;

  const closest = currentScale.reduce(function(a,b){
    return Math.abs(b - needle) < Math.abs(a - needle) ? b : a;
  });

  outlet(0, closest);
}
