/* Animate the supplied photograph with separate sky and foreground wind fields. */
(()=>{
 const host=document.querySelector('.meadow-backdrop'),hero=document.querySelector('.hero');
 const canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');
 const gl=canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power'});if(!gl)return;
 const vertex='attribute vec2 position; varying vec2 uv; void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}';
 const fragment=`precision mediump float;
 varying vec2 uv; uniform sampler2D photo; uniform vec2 resolution; uniform vec2 imageSize; uniform vec2 pointer; uniform float clock; uniform float strength;
 void main(){
 vec2 box=resolution;float scale=max(box.x/imageSize.x,box.y/imageSize.y)*1.045;
 vec2 visible=box/(imageSize*scale);vec2 origin=vec2(box.x<700.? .58:.5,.5);
 vec2 p=(vec2(uv.x,1.-uv.y)-origin)*visible+origin;
 float grass=smoothstep(.43,.95,p.y);float sky=1.-smoothstep(.28,.44,p.y);
 float breeze=sin(clock*.85+p.x*7.5)+.42*sin(clock*1.65+p.x*18.-p.y*8.);
 float gust=.7+.3*sin(clock*.24);
 // Roots and horizon stay anchored while foliage moves in broad, soft waves.
 float stems=sin(p.y*29.+p.x*8.-clock*1.2);
 p.x+=strength*grass*(.0038*breeze*gust+.0015*stems)+pointer.x*.002*grass;
 p.y+=strength*grass*.0017*sin(clock*1.1+p.x*12.)+pointer.y*.0015*grass;
 // Cloud drift remains slow and seamlessly reverses, with a stable horizon.
 p.x+=strength*sky*.014*sin(clock*.065)+pointer.x*.0015*sky;
 p.y+=strength*sky*.0022*sin(clock*.11+p.x*2.);
 gl_FragColor=texture2D(photo,clamp(p,vec2(.001),vec2(.999)));
 }`;
 function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
 let program;try{program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))return}catch{return}
 gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const pos=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
 const loc={};['resolution','imageSize','pointer','clock','strength','photo'].forEach(n=>loc[n]=gl.getUniformLocation(program,n));
 let ready=false,visible=true,time=0,last=0,frame=0,px=0,py=0,tx=0,ty=0;const mq=matchMedia('(prefers-reduced-motion: reduce)');
 function frozen(){return mq.matches||document.body.classList.contains('motion-paused')}
 function resize(){const b=host.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(b.width*ratio);canvas.height=Math.round(b.height*ratio);gl.viewport(0,0,canvas.width,canvas.height);gl.uniform2f(loc.resolution,b.width,b.height);if(ready)render()}
 function render(){gl.uniform1f(loc.clock,time);gl.uniform1f(loc.strength,mq.matches?0:1);gl.uniform2f(loc.pointer,px,py);gl.drawArrays(gl.TRIANGLES,0,6)}
 function tick(now){frame=0;if(!ready||!visible||document.hidden||frozen())return;if(!last||now-last>=32){time+=last?Math.min((now-last)/1000,.06):0;last=now;px+=(tx-px)*.06;py+=(ty-py)*.06;render()}frame=requestAnimationFrame(tick)}
 function sync(){cancelAnimationFrame(frame);frame=0;last=0;if(ready){render();if(visible&&!document.hidden&&!frozen())frame=requestAnimationFrame(tick)}}
 const img=new Image();img.onload=()=>{const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);gl.uniform1i(loc.photo,0);gl.uniform2f(loc.imageSize,img.width,img.height);host.appendChild(canvas);host.classList.add('wind-ready');ready=true;resize();sync()};img.src='assets/meadow-new.png';
 new ResizeObserver(resize).observe(hero);new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync()},{threshold:0}).observe(hero);
 new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});document.addEventListener('visibilitychange',sync);mq.addEventListener('change',sync);
 hero.addEventListener('pointermove',e=>{if(frozen())return;const b=hero.getBoundingClientRect();tx=(e.clientX-b.left)/b.width*2-1;ty=(e.clientY-b.top)/b.height*2-1},{passive:true});hero.addEventListener('pointerleave',()=>{tx=0;ty=0},{passive:true});hero.addEventListener('pointerup',()=>{tx=0;ty=0},{passive:true});
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(frame);ready=false;canvas.remove();host.classList.remove('wind-ready')});
})();
