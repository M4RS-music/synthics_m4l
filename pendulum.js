function bang()
{

  sketch.glclear();
  sketch.glcolor(0.28,0.28,0.28);
  sketch.moveto(0,0.5);
  sketch.lineto(0,-0.5);
  sketch.moveto(0,-0.5)
  sketch.glcolor(0.99,0.99,0.39);
  sketch.circle(0.2);
  sketch.glcolor(0.28,0.28,0.28);
  sketch.moveto(0,0.5);
  sketch.circle(0.05);
  refresh();
}

bang();
