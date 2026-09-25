(()=>{
 const video=document.getElementById('hero-video');
 if(!video)return;
 video.muted=true;
 let visible=true;
 function sync(){
  if(!visible||document.hidden||document.body.classList.contains('motion-paused')||document.body.classList.contains('viewer-open')){video.pause();return;}
  const promise=video.play();
  if(promise)promise.catch(()=>{/* The poster remains visible if autoplay is blocked. */});
 }
 new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();}).observe(video);
 document.addEventListener('visibilitychange',sync);
 video.addEventListener('loadeddata',sync);
 sync();
})();
