/* ===================== RÉGLAGES (la seule partie à modifier) ===================== */
const NAME='Leïa Bessad';                 // ton nom : affiché en haut à gauche et en bas de page
const ROLE='';      // petit texte à côté de ton nom dans le header (laisse '' pour le retirer)
const MENU=[                             // liens du menu : [page, texte affiché, identifiant de page]
  ['index.html#travaux','Travaux','home'],
  ['a-propos.html','À propos','about'],
  ['contact.html','Contact','contact']
];
/* ================== FIN DES RÉGLAGES : le reste, ce sont les animations ================== */

const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
document.documentElement.classList.add('js');
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const page=document.body.dataset.page;

/* en-tête, pied de page, curseur, rideau */
document.body.insertAdjacentHTML('afterbegin',`<div class="curtain"></div><div class="cursor"><span></span></div>
<header class="top"><a class="logo" href="index.html"><span data-scramble>${NAME}</span>${ROLE?`<em>${ROLE}</em>`:''}</a><nav>${MENU.map(n=>`<a href="${n[0]}" class="${n[2]===page?'on':''}"><span data-scramble>${n[1]}</span></a>`).join('')}</nav><i class="bar"></i></header>`);
document.body.insertAdjacentHTML('beforeend',`<footer><span>© ${new Date().getFullYear()} ${NAME}</span><a href="mailto:leia.bessad@gmail.com">On ne va quand même pas se laisser sur ça…</a><a href="#top" data-scramble>Haut de page</a></footer>`);

/* apparitions au scroll */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -10% 0px'});
const obs=()=>$$('.reveal,.reveal-t').forEach(e=>io.observe(e));
if(!document.documentElement.classList.contains('intro'))obs();

/* texte : une petite vague de 3 lettres traverse le mot, de gauche à droite */
const LOW='abcdefghijklmnopqrstuvwxyz',UP='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function scramble(el,force){
  if(force&&el._id){clearInterval(el._id);el._r=0;el.style.minWidth=''}
  if(reduce||el._r)return;
  const t=el.dataset.t||(el.dataset.t=el.textContent),L=[...t],cur=[];el._r=1;
  if(getComputedStyle(el).display==='inline')el.style.display='inline-block';
  el.style.minWidth=el.offsetWidth+'px';
  const W=3,speed=Math.max(1,L.length/14);   // W = nombre de lettres qui bougent en même temps
  let f=0;
  const id=el._id=setInterval(()=>{
    const head=f*speed;
    el.textContent=L.map((c,k)=>{
      if(!/\p{L}/u.test(c)||k<head-W||k>head)return c;
      if(f%2===0||!cur[k])cur[k]=(c===c.toUpperCase()?UP:LOW)[Math.random()*26|0];
      return cur[k];
    }).join('');
    f++;
    if(head-W>L.length){clearInterval(id);el.textContent=t;el._r=0}
  },30);
}
$$('[data-scramble]').forEach(el=>{const h=el.closest('a')||el;h.addEventListener('mouseenter',()=>scramble(el));h.addEventListener('focus',()=>scramble(el))});

/* header : se compacte au scroll, se cache en descendant, réapparaît en remontant */
const hd=$('.top');let ly=0,tick=false;
addEventListener('scroll',()=>{
  if(tick)return;tick=true;
  requestAnimationFrame(()=>{
    const y=scrollY,max=document.documentElement.scrollHeight-innerHeight;
    hd.classList.toggle('scrolled',y>40);
    hd.classList.toggle('hide',y>ly&&y>260);
    hd.style.setProperty('--p',max>0?(y/max).toFixed(4):0);
    ly=y;tick=false;
  });
},{passive:true});

/* curseur */
if(matchMedia('(pointer:fine)').matches){
  const c=$('.cursor'),s=$('span',c);let x=0,y=0,cx=0,cy=0;
  addEventListener('mousemove',e=>{x=e.clientX;y=e.clientY;if(!c.classList.contains('vis')){cx=x;cy=y;c.classList.add('vis')}});
  (function r(){cx+=(x-cx)*.2;cy+=(y-cy)*.2;c.style.transform=`translate(${cx}px,${cy}px)`;requestAnimationFrame(r)})();
  document.addEventListener('mouseover',e=>{
    const t=e.target.closest('[data-cursor]');
    c.classList.toggle('big',!!t);if(t)s.dataset.l=t.dataset.cursor;
    c.classList.toggle('link',!t&&!!e.target.closest('a,button'));
  });
}

/* transitions entre pages (rideau) */
document.addEventListener('click',e=>{
  const a=e.target.closest('a');if(!a||a.target||e.metaKey||e.ctrlKey||e.shiftKey)return;
  const u=new URL(a.href,location);
  if(u.origin!==location.origin||(u.pathname===location.pathname&&u.hash))return;
  e.preventDefault();document.body.classList.add('leave');setTimeout(()=>location.href=a.href,650);
});
addEventListener('pageshow',e=>e.persisted&&document.body.classList.remove('leave'));

/* projets : au survol de "précédent / suivant", une vignette du projet suit la souris */
if(matchMedia('(pointer:fine)').matches&&$('.pager')){
  const pk=document.createElement('div');pk.className='peek';pk.innerHTML='<img alt="">';document.body.append(pk);
  const im=$('img',pk);im.onload=()=>{im.style.visibility=''};im.onerror=()=>{im.style.visibility='hidden'};
  let x=0,y=0,px=0,py=0;
  addEventListener('mousemove',e=>{x=e.clientX;y=e.clientY},{passive:true});
  (function r(){
    const dx=x-px;px+=dx*.14;py+=(y-py)*.14;
    const w=pk.offsetWidth,h=pk.offsetHeight,tilt=Math.max(-7,Math.min(7,dx*.06));   // léger penchement quand la souris va vite
    pk.style.transform=`translate3d(${px-w/2}px,${py-h-28}px,0) rotate(${tilt}deg)`;   // 28 = distance au-dessus de la souris
    requestAnimationFrame(r);
  })();
  $$('.pager a[data-img]').forEach(a=>{
    a.addEventListener('mouseenter',()=>{
      const s=getComputedStyle(a);
      pk.style.setProperty('--a',s.getPropertyValue('--a'));pk.style.setProperty('--b',s.getPropertyValue('--b'));
      im.style.visibility='hidden';im.src=a.dataset.img;
      if(!pk.classList.contains('on')){px=x;py=y}
      pk.classList.add('on');
    });
    a.addEventListener('mouseleave',()=>pk.classList.remove('on'));
  });
}

/* accueil : les images des vignettes défilent une fois, puis la couverture monte */
const fl=$('#flash');
if(fl){
  const hero=$('.hero'),root=document.documentElement;
  if(!root.classList.contains('intro'))hero.remove();
  else{
    sessionStorage.setItem('intro','1');
    const pause=parseInt(fl.dataset.duree)||1300;
    const frames=$$('.work .card').map(c=>{const im=$('img',c),s=getComputedStyle($('.media',c));return{src:im&&im.getAttribute('src'),a:s.getPropertyValue('--a'),b:s.getPropertyValue('--b')}});
    let lifted=false,i=0;

    /* DISPOSITION EN QUINCONCE : les images se placent côte à côte (une sur deux remontée), avec un léger chevauchement.
       STEP = écart entre deux images (.71 = chevauchement d'environ 30 %) | STAG = décalage vertical de la 1re, 3e, 5e... */
    const STEP=.71,ASPECT=1.25,STAG=.13,n=frames.length,pad=parseFloat(getComputedStyle(hero).paddingLeft)||20;
    let W=0,pos=[];
    const layout=()=>{
      if(!n)return;
      const availW=innerWidth-2*pad,availH=innerHeight*.58;let best={w:0};
      for(let r=1;r<=n;r++){                       // essaie 1, 2, 3... rangées et garde la plus grande taille d'image
        const per=Math.ceil(n/r),w=Math.min(availW/(1+(per-1)*STEP),availH/(1.5*r-.12),420);
        if(w>best.w+.5)best={w,r,per};
      }
      const {w,r,per}=best,rowW=c=>w*(1+(c-1)*STEP);
      W=w;
      pos=frames.map((_,k)=>{
        const row=Math.floor(k/per),col=k%per,cnt=Math.min(per,n-row*per);
        return{x:(rowW(per)-rowW(cnt))/2+col*STEP*w,y:row*1.5*w+(col%2?0:STAG*w)};
      });
      fl.style.width=rowW(per)+'px';fl.style.height=w*(1.5*r-.12)+'px';
    };
    const place=(d,k)=>{const p=pos[k];d.style.width=W+'px';d.style.height=W*ASPECT+'px';d.style.left=p.x+'px';d.style.top=p.y+'px'};
    layout();
    addEventListener('resize',()=>{layout();$$('.f',fl).forEach(d=>place(d,+d.dataset.k))});

    /* ORDRE D'APPARITION : aléatoire (mélangé à chaque visite). Pour garder l'ordre de la grille, supprime la ligne "order.sort..." */
    const order=frames.map((_,k)=>k);
    order.sort(()=>Math.random()-.5);
    let z=1;
    const show=k=>{
      const f=frames[k],d=document.createElement('div');d.className='f';d.dataset.k=k;
      d.style.cssText=`--a:${f.a};--b:${f.b};z-index:${++z}`;place(d,k);   /* z-index qui augmente : la dernière image apparue est toujours au-dessus */
      if(f.src){const im=new Image();im.alt='';im.src=f.src;im.onerror=()=>im.remove();d.append(im)}
      fl.append(d);d.getBoundingClientRect();d.classList.add('on');
    };
    const lift=()=>{
      if(lifted)return;lifted=true;
      ev.forEach(([n,f])=>removeEventListener(n,f));
      hero.classList.add('up');root.classList.add('lifting');obs();
      setTimeout(()=>{hero.remove();root.classList.remove('intro','lifting');scrollTo(0,0)},1500);
    };
    $('#hfoot a').addEventListener('click',e=>{e.preventDefault();lift()});
    /* scroller (molette, glissement du doigt, flèche bas, espace) passe l'intro : la couverture monte */
    let ty=0;
    const ev=[
      ['wheel',e=>{if(e.deltaY>4)lift()}],
      ['touchstart',e=>{ty=e.touches[0].clientY}],
      ['touchmove',e=>{if(ty-e.touches[0].clientY>14)lift()}],
      ['keydown',e=>{if(['ArrowDown','PageDown','End',' '].includes(e.key)){e.preventDefault();lift()}}]
    ];
    ev.forEach(([n,f])=>addEventListener(n,f,{passive:n!=='keydown'}));
    const step=()=>{
      if(lifted)return;
      if(i<frames.length){show(order[i++]);setTimeout(step,i<frames.length?pause:pause+700)}else lift();   // +700 : petite pause sur l'ensemble avant la montée
    };
    frames.length?setTimeout(step,950):lift();
  }
}
