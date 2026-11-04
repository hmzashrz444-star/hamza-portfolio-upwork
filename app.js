const siteLoader=document.querySelector('.site-loader');
if(siteLoader){
  const counter=siteLoader.querySelector('.loader-bottom b');
  const bar=siteLoader.querySelector('.loader-track i');
  const started=performance.now();
  let finishing=false;
  function loaderTick(now){
    const progress=Math.min(92,Math.round(((now-started)/620)*92));
    counter.textContent=String(progress).padStart(2,'0');
    bar.style.transform=`scaleX(${progress/100})`;
    if(!finishing)requestAnimationFrame(loaderTick);
  }
  function finishLoader(){
    if(finishing)return;
    finishing=true;
    counter.textContent='100';
    bar.style.transform='scaleX(1)';
    document.body.classList.add('loader-ready');
    setTimeout(()=>{document.body.classList.remove('is-loading','loader-ready');siteLoader.remove()},300);
  }
  requestAnimationFrame(loaderTick);
  const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const fontsReady=document.fonts?.ready||Promise.resolve();
  Promise.all([wait(260),Promise.race([fontsReady,wait(450)])]).then(finishLoader);
}

const reveals=document.querySelectorAll('.reveal');
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')}),{threshold:.1});
reveals.forEach(el=>observer.observe(el));

const cursor=document.querySelector('.cursor');
const finePointer=matchMedia('(hover:hover) and (pointer:fine)').matches;
if(finePointer&&cursor){window.addEventListener('pointermove',e=>{cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px'},{passive:true});document.querySelectorAll('a,button,.project-stage').forEach(el=>{el.addEventListener('pointerenter',()=>cursor.classList.add('active'));el.addEventListener('pointerleave',()=>cursor.classList.remove('active'))})}

const canvas=document.querySelector('#motionCanvas');
const ctx=canvas.getContext('2d');
let pointer={x:.5,y:.5};
const touchMotion=matchMedia('(hover:none), (pointer:coarse)').matches;
function size(){const d=Math.min(devicePixelRatio,touchMotion?1.35:1.75);canvas.width=canvas.clientWidth*d;canvas.height=canvas.clientHeight*d;ctx.setTransform(d,0,0,d,0,0)}
size();window.addEventListener('resize',size);
canvas.parentElement.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();pointer.x=(e.clientX-r.left)/r.width;pointer.y=(e.clientY-r.top)/r.height});
let motionVisible=false;
function draw(t){if(!motionVisible||document.hidden)return;const w=canvas.clientWidth,h=canvas.clientHeight;if(touchMotion){pointer.x=.5+Math.cos(t*.00048)*.2;pointer.y=.5+Math.sin(t*.00062)*.16}ctx.clearRect(0,0,w,h);ctx.fillStyle='#0b0c0f';ctx.fillRect(0,0,w,h);const cols=touchMotion?18:22,rows=touchMotion?13:16;for(let y=0;y<rows;y++){for(let x=0;x<cols;x++){const px=(x+.5)*w/cols,py=(y+.5)*h/rows;const dx=px-pointer.x*w,dy=py-pointer.y*h;const dist=Math.hypot(dx,dy);const force=Math.max(0,1-dist/260);const wave=Math.sin(x*.55+y*.38+t*.0017)*8;const ang=Math.atan2(dy,dx)+Math.PI/2;const length=5+force*30+wave*.28;ctx.save();ctx.translate(px+Math.cos(ang)*force*13,py+Math.sin(ang)*force*13);ctx.rotate(ang+wave*.018);ctx.fillStyle=force>.55?'#c9ff3c':((x+y)%7===0?'#ff7148':'rgba(240,239,233,.38)');ctx.fillRect(-length/2,-1.2,length,2.4);ctx.restore()}}const g=ctx.createRadialGradient(pointer.x*w,pointer.y*h,0,pointer.x*w,pointer.y*h,180);g.addColorStop(0,'rgba(77,92,255,.20)');g.addColorStop(1,'rgba(77,92,255,0)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);requestAnimationFrame(draw)}
new IntersectionObserver(([entry])=>{const was=motionVisible;motionVisible=entry.isIntersecting;if(motionVisible&&!was)requestAnimationFrame(draw)},{rootMargin:'180px'}).observe(canvas);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&motionVisible)requestAnimationFrame(draw)});

const heroCanvas=document.querySelector('#heroCanvas');
if(heroCanvas){const hctx=heroCanvas.getContext('2d');let hp={x:.5,y:.5};const lab=heroCanvas.parentElement;function heroSize(){const d=Math.min(devicePixelRatio,2);heroCanvas.width=heroCanvas.clientWidth*d;heroCanvas.height=heroCanvas.clientHeight*d;hctx.setTransform(d,0,0,d,0,0)}heroSize();addEventListener('resize',heroSize);lab.addEventListener('pointermove',e=>{const r=lab.getBoundingClientRect();hp.x=(e.clientX-r.left)/r.width;hp.y=(e.clientY-r.top)/r.height});function heroDraw(t){const w=heroCanvas.clientWidth,h=heroCanvas.clientHeight;hctx.clearRect(0,0,w,h);for(let ring=0;ring<5;ring++){hctx.beginPath();const radius=76+ring*42+Math.sin(t*.001+ring)*5;hctx.arc(w*(.5+(hp.x-.5)*.05),h*(.5+(hp.y-.5)*.05),radius,0,Math.PI*2);hctx.strokeStyle=`rgba(240,239,233,${.16-ring*.022})`;hctx.lineWidth=1;hctx.stroke()}for(let i=0;i<44;i++){const a=i/44*Math.PI*2+t*.00012*(i%3+1);const r=105+(i%7)*24;const x=w/2+Math.cos(a)*r+(hp.x-.5)*20;const y=h/2+Math.sin(a)*r+(hp.y-.5)*20;hctx.fillStyle=i%9===0?'#c9ff3c':i%11===0?'#ff7148':'rgba(240,239,233,.42)';hctx.fillRect(x-1.5,y-1.5,3,3)}requestAnimationFrame(heroDraw)}requestAnimationFrame(heroDraw)}

if(finePointer)document.querySelectorAll('.project-stage').forEach(stage=>stage.addEventListener('pointermove',e=>{const r=stage.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5;const y=(e.clientY-r.top)/r.height-.5;stage.style.setProperty('--mx',x);stage.style.setProperty('--my',y)},{passive:true}));

const depthLayers=[...document.querySelectorAll('[data-depth]')];
function spatialScroll(){
  const max=document.documentElement.scrollHeight-innerHeight;
  document.documentElement.style.setProperty('--scroll',`${max>0?(scrollY/max)*100:0}%`);
  depthLayers.forEach(el=>{
    const r=el.parentElement.getBoundingClientRect();
    const progress=(innerHeight*.5-(r.top+r.height*.5))/innerHeight;
    const depth=Number(el.dataset.depth||.15);
    el.style.translate=`0 ${progress*depth*180}px`;
  });
}
let scrollQueued=false;function queueSpatial(){if(scrollQueued)return;scrollQueued=true;requestAnimationFrame(()=>{spatialScroll();scrollQueued=false})}
addEventListener('scroll',queueSpatial,{passive:true});spatialScroll();
