/* Casa Ameyalli · demo para propuesta (Jose Khalili). Todo es de ejemplo: sin cobros reales. */
(function(){
'use strict';
var $=function(s,c){return (c||document).querySelector(s)}, $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
var U=function(id,w,h){return 'https://images.unsplash.com/photo-'+id+'?w='+(w||1200)+(h?'&h='+h:'')+'&q=72&auto=format&fit=crop'};
var IMG={hero:'1613490493576-7fde63acd811',pool:'1600596542815-ffad4c1539a9',pool2:'1564013799919-ab600027ffc6',dusk:'1600585154340-be6161a56a0c',glass:'1600573472550-8090b5e0745e',liv1:'1600210492486-724fe5c67fb0',liv2:'1600607687939-ce8a6c25118c',liv3:'1560448204-e02f11c3d0e2',bed1:'1616594039964-ae9021a400a0',bed2:'1615874959474-d609969a20ed',bed3:'1618773928121-c32242e63f39',bed4:'1505693416388-ac5ce068fe85',bath1:'1552321554-5fefe8c9ef14',bath2:'1584622650111-993a426fbf0a',kit:'1556912172-45b7abe8b7e1'};

/* ---------- helpers ---------- */
function sod(d){var x=new Date(d);x.setHours(0,0,0,0);return x}
function add(d,n){var x=new Date(d);x.setDate(x.getDate()+n);return sod(x)}
function key(d){return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)}
function diff(a,b){return Math.round((sod(b)-sod(a))/864e5)}
var money=function(n){return '$'+Math.round(n).toLocaleString('es-MX')+' MXN'};
var moneyS=function(n){return '$'+Math.round(n).toLocaleString('es-MX')};
var fD=function(d,o){return d.toLocaleDateString('es-MX',o||{day:'numeric',month:'short'})};
var TODAY=sod(new Date());
function toast(msg){var t=$('#toast');$('span',t).textContent=msg;t.classList.add('on');clearTimeout(toast._t);toast._t=setTimeout(function(){t.classList.remove('on')},3200)}

/* ---------- datos de ejemplo ---------- */
var SEASONS_DEF=[
 {id:'alta',name:'Temporada alta',range:'18 dic – 6 ene',price:7900,min:3,test:function(d){var m=d.getMonth(),x=d.getDate();return (m===11&&x>=18)||(m===0&&x<=6)}},
 {id:'santa',name:'Semana Santa',range:'21 mar – 4 abr 2027',price:7400,min:3,test:function(d){var k=key(d);return k>='2027-03-21'&&k<='2027-04-04'}},
 {id:'verano',name:'Verano',range:'15 jul – 20 ago',price:6900,min:2,test:function(d){var m=d.getMonth(),x=d.getDate();return (m===6&&x>=15)||(m===7&&x<=20)}},
 {id:'finde',name:'Fin de semana',range:'viernes y sábado',price:5900,min:2,test:function(d){var w=d.getDay();return w===5||w===6}},
 {id:'base',name:'Entre semana',range:'domingo a jueves',price:4800,min:2,test:function(){return true}}
];
var seasons=SEASONS_DEF.map(function(s){return Object.assign({},s)});
function season(d){for(var i=0;i<seasons.length;i++)if(seasons[i].test(d))return seasons[i]}
function rate(d){return season(d).price}
var FEES={clean:950,pet:450,tax:.19,weekly:.10};
var coupons=[{code:'DEMO10',pct:10,min:2},{code:'SEMANA20',pct:20,min:2}];
var SRC={air:'Airbnb',web:'Web directa',blk:'Bloqueo'};
var bookings=[
 {o:2,n:3,src:'air',guest:'Mariana R.',pay:'Pagado vía Airbnb'},
 {o:8,n:2,src:'web',guest:'Luis P.',pay:'Pagado · Stripe'},
 {o:13,n:4,src:'air',guest:'Sofía y Diego',pay:'Pagado vía Airbnb'},
 {o:19,n:2,src:'blk',guest:'Mantenimiento alberca',pay:'—'},
 {o:24,n:3,src:'air',guest:'Familia Ortega',pay:'Pagado vía Airbnb'},
 {o:30,n:2,src:'web',guest:'Carla M.',pay:'Pagado · Mercado Pago'},
 {o:37,n:6,src:'air',guest:'Andrés V.',pay:'Pagado vía Airbnb'},
 {o:47,n:3,src:'air',guest:'Renata S.',pay:'Pagado vía Airbnb'},
 {o:55,n:4,src:'web',guest:'Grupo Medina',pay:'Pagado · PayPal'},
 {o:66,n:3,src:'air',guest:'Pablo E.',pay:'Pagado vía Airbnb'}
].map(function(b){b.s=add(TODAY,b.o);b.e=add(b.s,b.n);return b});
var booked={};
function rebuildBooked(){booked={};bookings.forEach(function(b){for(var i=0;i<b.n;i++)booked[key(add(b.s,i))]=b.src})}
function bTotal(b){if(b.src==='blk')return 0;var t=0;for(var i=0;i<b.n;i++)t+=rate(add(b.s,i));return Math.round((t+FEES.clean)*(1+FEES.tax))}
rebuildBooked();

var state={ci:null,co:null,g:{adults:2,children:0,infants:0,pets:0},coupon:null,pm:'stripe'};

/* ---------- cotización ---------- */
function quote(){
 if(!state.ci||!state.co)return null;
 var n=diff(state.ci,state.co),groups={},sub=0;
 for(var i=0;i<n;i++){var p=rate(add(state.ci,i));groups[p]=(groups[p]||0)+1;sub+=p}
 var lines=Object.keys(groups).sort(function(a,b){return a-b}).map(function(p){return {p:+p,n:groups[p]}});
 var weekly=n>=7?sub*FEES.weekly:0, cp=state.coupon&&n>=state.coupon.min?(sub-weekly)*state.coupon.pct/100:0;
 var pets=state.g.pets*FEES.pet, base=sub-weekly-cp+FEES.clean+pets, tax=base*FEES.tax;
 return {n:n,lines:lines,sub:sub,weekly:weekly,cp:cp,pets:pets,clean:FEES.clean,tax:tax,total:base+tax};
}
function brkHTML(q){
 var h='<ul class="brk">';
 q.lines.forEach(function(l){h+='<li><span>'+moneyS(l.p)+' × '+l.n+' noche'+(l.n>1?'s':'')+'</span><span>'+money(l.p*l.n)+'</span></li>'});
 if(q.weekly)h+='<li class="disc"><span>Descuento por semana (−10 %)</span><span>−'+money(q.weekly)+'</span></li>';
 if(q.cp)h+='<li class="disc"><span>Cupón '+state.coupon.code+' (−'+state.coupon.pct+' %)</span><span>−'+money(q.cp)+'</span></li>';
 h+='<li><span>Tarifa de limpieza</span><span>'+money(q.clean)+'</span></li>';
 if(q.pets)h+='<li><span>Limpieza por mascota × '+state.g.pets+'</span><span>'+money(q.pets)+'</span></li>';
 h+='<li><span>Impuestos (IVA 16 % + ISH 3 %)</span><span>'+money(q.tax)+'</span></li>';
 h+='<li class="tot"><span>Total a pagar hoy</span><span>'+money(q.total)+'</span></li></ul>';
 return h;
}
function guestsTxt(){var g=state.g,n=g.adults+g.children,t=n+' huésped'+(n>1?'es':'');if(g.infants)t+=', '+g.infants+' bebé'+(g.infants>1?'s':'');if(g.pets)t+=', '+g.pets+' mascota'+(g.pets>1?'s':'');return t}
function minNights(d){return season(d).min}

/* ---------- calendario ---------- */
var cals=[];
function Cal(el,opt){
 this.el=el;this.opt=opt||{};this.off=0;this.msgEl=opt.msg?$(opt.msg):null;var self=this;
 el.addEventListener('click',function(e){
  var nav=e.target.closest('[data-nav]');if(nav){self.off=Math.max(0,self.off+(+nav.dataset.nav));self.render();return}
  var d=e.target.closest('.day[data-k]');if(d)self.pick(d.dataset.k);
 });
 cals.push(this);this.render();
}
Cal.prototype.months=function(){var m=this.opt.months;return typeof m==='function'?m():m||2};
Cal.prototype.msg=function(t){if(this.msgEl)this.msgEl.textContent=t||'';var pt=$('#popCalTxt');if(this.el.id==='calPop'&&pt)pt.textContent=t||infoTxt()};
Cal.prototype.pick=function(k){
 var p=k.split('-'),d=new Date(+p[0],p[1]-1,+p[2]);
 if(d<TODAY)return;
 var selectingOut=state.ci&&!state.co&&d>state.ci;
 if(selectingOut){
  var n=diff(state.ci,d),ok=true;for(var i=0;i<n;i++)if(booked[key(add(state.ci,i))]){ok=false;break}
  if(!ok){if(!booked[k]){state.ci=d;state.co=null;this.msg('Hay noches ocupadas en medio: empezamos de nuevo desde esta fecha.')}else this.msg('Esas fechas cruzan una reserva existente.');return update()}
  var mn=minNights(state.ci);if(n<mn){this.msg('Estancia mínima de '+mn+' noches para esa fecha.');return update()}
  state.co=d;this.msg('');return update(true);
 }
 if(booked[k]){this.msg('Esa noche ya está reservada (sincronizado con Airbnb).');return update()}
 state.ci=d;state.co=null;this.msg('Ahora elige tu fecha de salida.');update();
};
Cal.prototype.render=function(){
 var M=this.months(),base=new Date(TODAY.getFullYear(),TODAY.getMonth()+this.off,1),h='';
 h+='<div class="cal-head"><button type="button" class="cal-nav" data-nav="-1" aria-label="Mes anterior" '+(this.off===0?'disabled':'')+'><svg><use href="#i-left"/></svg></button><span style="font-size:13px;font-weight:700;color:var(--mute)">'+infoTxt()+'</span><button type="button" class="cal-nav" data-nav="1" aria-label="Mes siguiente" '+(this.off>=10?'disabled':'')+'><svg><use href="#i-right"/></svg></button></div>';
 h+='<div class="cal-months" style="--m:'+M+'">';
 var limit=null;
 if(state.ci&&!state.co){for(var j=0;j<120;j++){var t=add(state.ci,j);if(booked[key(t)]){limit=t;break}}}
 for(var m=0;m<M;m++){
  var first=new Date(base.getFullYear(),base.getMonth()+m,1),days=new Date(first.getFullYear(),first.getMonth()+1,0).getDate(),lead=(first.getDay()+6)%7;
  h+='<div class="cal-month"><h4>'+(function(t){return t.charAt(0).toUpperCase()+t.slice(1)})(first.toLocaleDateString('es-MX',{month:'long',year:'numeric'}))+'</h4><div class="cal-grid" role="grid">';
  ['L','M','M','J','V','S','D'].forEach(function(x){h+='<span class="cal-dow" aria-hidden="true">'+x+'</span>'});
  for(var i=0;i<lead;i++)h+='<span></span>';
  for(var dd=1;dd<=days;dd++){
   var d=new Date(first.getFullYear(),first.getMonth(),dd),k=key(d),cls='day',past=d<TODAY,b=booked[k];
   if(past)cls+=' is-past';
   else if(b){cls+=' is-booked';if(state.ci&&!state.co&&limit&&+d===+limit)cls+=' is-co'}
   if(state.ci&&!state.co&&limit&&d>limit)cls+=' is-off';
   if(+d===+TODAY)cls+=' is-today';
   if(state.ci&&+d===+state.ci){cls+=' is-start';if(state.co)cls+=' has-end'}
   if(state.co&&+d===+state.co)cls+=' is-end';
   if(state.ci&&state.co&&d>state.ci&&d<state.co)cls+=' in-range';
   var lbl=fD(d,{weekday:'long',day:'numeric',month:'long'})+(past?'':b?', ocupado ('+SRC[b]+')':', disponible, '+moneyS(rate(d))+' por noche');
   h+='<button type="button" class="'+cls+'" data-k="'+k+'" aria-label="'+lbl+'"'+(past?' disabled':'')+'>'+dd+'<span class="p">'+(past||b?'·':'$'+(rate(d)/1000).toFixed(1)+'k')+'</span></button>';
  }
  h+='</div></div>';
 }
 this.el.innerHTML=h+'</div>';
};
function infoTxt(){if(state.ci&&state.co){var n=diff(state.ci,state.co);return fD(state.ci)+' → '+fD(state.co)+' · '+n+' noche'+(n>1?'s':'')}if(state.ci)return 'Llegada '+fD(state.ci)+' · elige salida';return 'Selecciona tu llegada'}

/* ---------- huéspedes ---------- */
var GROWS=[['adults','Adultos','13 años o más'],['children','Niños','De 2 a 12 años'],['infants','Bebés','Menos de 2 años'],['pets','Mascotas','Máximo 2, con cargo de limpieza']];
function renderGuests(el){
 el.innerHTML=GROWS.map(function(r){var v=state.g[r[0]],tot=state.g.adults+state.g.children,
  minus=r[0]==='adults'?v<=1:v<=0, plus=(r[0]==='adults'||r[0]==='children')?tot>=8:r[0]==='infants'?v>=3:v>=2;
  return '<div class="g-row"><div><b>'+r[1]+'</b><small>'+r[2]+'</small></div><div class="step"><button type="button" data-g="'+r[0]+'" data-d="-1" aria-label="Quitar '+r[1]+'" '+(minus?'disabled':'')+'>−</button><output aria-live="polite">'+v+'</output><button type="button" data-g="'+r[0]+'" data-d="1" aria-label="Agregar '+r[1]+'" '+(plus?'disabled':'')+'>+</button></div></div>'}).join('');
}
document.addEventListener('click',function(e){var b=e.target.closest('[data-g]');if(!b)return;state.g[b.dataset.g]+=+b.dataset.d;update()});

/* ---------- render global ---------- */
function update(done){
 cals.forEach(function(c){c.render()});
 renderGuests($('#guestsBox'));renderGuests($('#guestsBk'));
 var bi=$('#bfIn'),bo=$('#bfOut');
 bi.textContent=state.ci?fD(state.ci,{weekday:'short',day:'numeric',month:'short'}):'Agregar fecha';bi.classList.toggle('ph',!state.ci);
 bo.textContent=state.co?fD(state.co,{weekday:'short',day:'numeric',month:'short'}):'Agregar fecha';bo.classList.toggle('ph',!state.co);
 $('#bfG').textContent=guestsTxt();
 renderSummary();renderSide();renderSeasons();
 var q=quote();$('#mbPrice').textContent=q?money(q.total):moneyS(seasons[seasons.length-1].price)+' MXN';$('#mbSub').textContent=q?q.n+' noches · total':'por noche · desde';
 if(done===true&&$('#popCal').classList.contains('is-open'))setTimeout(closePops,450);
}
function renderSummary(){
 var q=quote(),low=Math.min.apply(null,seasons.map(function(s){return s.price})),h='';
 h+='<h3>'+(q?money(q.total):moneyS(low)+' <small>MXN / noche · desde</small>')+'</h3>';
 if(q)h+='<p style="color:var(--mute);font-size:14px;margin-top:4px">Total por '+q.n+' noches, impuestos incluidos</p>';
 h+='<div class="sum-fields"><div><small>Llegada</small><b>'+(state.ci?fD(state.ci,{weekday:'short',day:'numeric',month:'short'}):'—')+'</b></div><div><small>Salida</small><b>'+(state.co?fD(state.co,{weekday:'short',day:'numeric',month:'short'}):'—')+'</b></div><div class="full"><small>Huéspedes</small><b>'+guestsTxt()+'</b></div></div>';
 if(q){h+=brkHTML(q);
  h+='<form class="coupon" id="cpForm"><input id="cpIn" placeholder="Código de cupón" aria-label="Código de cupón" value="'+(state.coupon?state.coupon.code:'')+'"><button>Aplicar</button></form><p style="font-size:12px;color:var(--mute);margin-top:-6px">Prueba <b>DEMO10</b> o crea uno en el panel.</p>';
  h+='<button class="btn btn-terra" style="width:100%;margin-top:18px" data-book>Reservar y pagar <svg><use href="#i-arrow"/></svg></button>';
 }else h+='<p style="color:var(--mute);font-size:14.5px;margin:6px 0 18px">Selecciona llegada y salida en el calendario para ver el desglose exacto.</p><button class="btn btn-ghost" style="width:100%" id="quickPick">Sugerir próximas fechas libres</button>';
 h+='<p class="fine"><svg><use href="#i-shield"/></svg>Pago seguro 100 % en línea · Confirmación inmediata por correo · Cancelación gratis hasta 14 días antes.</p>';
 $('#summary').innerHTML=h;
}
function renderSide(){
 var q=quote(),h='<div class="side-prop"><img src="'+U(IMG.hero,300,240)+'" alt=""><div><b>Casa Ameyalli</b><small>Casa completa · Tepoztlán, Morelos</small><br><small style="color:var(--terra);font-weight:700">★ 4.9 · ejemplo</small></div></div>';
 h+='<div class="sum-fields"><div><small>Llegada</small><b>'+(state.ci?fD(state.ci,{weekday:'short',day:'numeric',month:'short'}):'—')+'</b></div><div><small>Salida</small><b>'+(state.co?fD(state.co,{weekday:'short',day:'numeric',month:'short'}):'—')+'</b></div><div class="full"><small>Huéspedes</small><b>'+guestsTxt()+'</b></div></div>';
 h+=q?brkHTML(q):'<p style="color:var(--mute);font-size:14px">Elige tus fechas para calcular el total.</p>';
 h+='<p class="fine"><svg><use href="#i-lock"/></svg>Tus datos viajan cifrados. El pago se procesa directamente en la pasarela.</p>';
 $('#bkSide').innerHTML=h;
 var pl=$('#payLbl');if(pl)pl.textContent=q?'Pagar '+money(q.total):'Pagar';
}
function renderSeasons(){$('#seasonList').innerHTML=seasons.map(function(s){return '<span>'+s.name+' · '+s.range+' · <b>'+moneyS(s.price)+'</b></span>'}).join('')+'<span>Limpieza '+moneyS(FEES.clean)+'</span><span>−10 % por 7+ noches</span>'}

document.addEventListener('submit',function(e){
 if(e.target.id!=='cpForm')return;e.preventDefault();
 var v=$('#cpIn').value.trim().toUpperCase(),c=coupons.filter(function(x){return x.code===v})[0];
 if(!v){state.coupon=null;update();return}
 if(!c){toast('Cupón no válido');return}
 var q=quote();if(q&&q.n<c.min){toast('Ese cupón requiere '+c.min+' noches mínimo');return}
 state.coupon=c;update();toast('Cupón '+c.code+' aplicado: −'+c.pct+' %');
});
document.addEventListener('click',function(e){
 if(e.target.closest('#quickPick')){
  for(var i=1;i<120;i++){var d=add(TODAY,i);if(d.getDay()===5&&!booked[key(d)]&&!booked[key(add(d,1))]){state.ci=d;state.co=add(d,2);break}}
  cals.forEach(function(c){c.msg('')});update();
 }
});

/* ---------- popovers barra hero ---------- */
function closePops(){$$('.pop').forEach(function(p){p.classList.remove('is-open')});$$('.bfield').forEach(function(b){b.classList.remove('is-open')})}
$$('.bfield').forEach(function(b){b.addEventListener('click',function(e){
 e.stopPropagation();var id=b.dataset.open==='cal'?'#popCal':'#popGuests',p=$(id),was=p.classList.contains('is-open');closePops();
 if(!was){p.classList.add('is-open');b.classList.add('is-open');if(b.dataset.open==='cal')$$('.bfield[data-open=cal]').forEach(function(x){x.classList.add('is-open')})}
})});
$$('.pop').forEach(function(p){p.addEventListener('click',function(e){e.stopPropagation()})});
document.addEventListener('click',function(e){if(!e.target.closest('.pop'))closePops()});
$$('[data-close-pop]').forEach(function(b){b.addEventListener('click',closePops)});
$('[data-clear]').addEventListener('click',function(){state.ci=state.co=null;update()});
$('#bbarGo').addEventListener('click',function(e){e.stopPropagation();if(quote())openBooking();else{closePops();$('#popCal').classList.add('is-open');$$('.bfield[data-open=cal]').forEach(function(x){x.classList.add('is-open')})}});

/* ---------- espacios (páginas) ---------- */
var ROOMS=[
 {id:'suite',name:'Suite principal',short:'King size, vestidor y baño con regadera de lluvia.',chips:['Cama king','Baño completo','Vista al jardín'],imgs:[IMG.bed1,IMG.bath2,IMG.bed4],desc:'La recámara más amplia de la casa, con ventanales hacia el jardín y el Tepozteco. Blancos de algodón egipcio, cortinas blackout y escritorio para trabajar si lo necesitas.',amen:['Cama king size','Baño con regadera de lluvia','Vestidor','Aire acondicionado','Smart TV 55"','Caja fuerte']},
 {id:'rec2',name:'Recámara Jardín',short:'Queen size con salida directa a la terraza.',chips:['Cama queen','Baño completo','Terraza'],imgs:[IMG.bed2,IMG.bath1,IMG.liv3],desc:'Luminosa y fresca, abre directamente a la terraza y la alberca. Ideal para parejas.',amen:['Cama queen size','Baño completo','Salida a terraza','Ventilador de techo','Clóset','Secadora de cabello']},
 {id:'rec3',name:'Recámaras 3 y 4',short:'Dos recámaras con camas individuales o matrimoniales.',chips:['2 matrimoniales','2 individuales','2 baños'],imgs:[IMG.bed3,IMG.bed4,IMG.bath1],desc:'Perfectas para niños o amigos: una con dos camas matrimoniales y otra con dos individuales, cada una con baño.',amen:['2 camas matrimoniales','2 camas individuales','Baño en cada recámara','Ventiladores','Cuna disponible','Clóset']},
 {id:'sala',name:'Sala y comedor',short:'Doble altura, chimenea y comedor para 10.',chips:['Chimenea','Comedor 10','Smart TV'],imgs:[IMG.liv1,IMG.liv2,IMG.liv3],desc:'El corazón de la casa: sala de doble altura con chimenea, comedor de madera para 10 personas y bocina Bluetooth.',amen:['Chimenea de leña','Comedor para 10','Smart TV con streaming','Bocina Bluetooth','Juegos de mesa','Wifi 200 Mbps']},
 {id:'cocina',name:'Cocina equipada',short:'Todo para cocinar como en casa.',chips:['Cafetera','Horno','Lavavajillas'],imgs:[IMG.kit,IMG.liv3,IMG.liv2],desc:'Cocina abierta con isla, totalmente equipada. Te dejamos café de Morelos de cortesía.',amen:['Estufa y horno','Refrigerador grande','Lavavajillas','Cafetera y licuadora','Vajilla para 12','Agua purificada']},
 {id:'alberca',name:'Alberca y jardín',short:'Alberca climatizada, asador y camastros.',chips:['Climatizada','Asador','1,200 m²'],imgs:[IMG.pool,IMG.pool2,IMG.glass],desc:'Alberca climatizada a 28 °C, camastros, palapa con asador y un jardín amplio para que los niños jueguen.',amen:['Alberca climatizada','Asador y palapa','Camastros','Jardín de 1,200 m²','Fogatero','Regadera exterior']}
];
$('#rooms').innerHTML=ROOMS.map(function(r){return '<button type="button" class="room" data-room="'+r.id+'" data-rcard><figure><img src="'+U(r.imgs[0],800,600)+'" alt="'+r.name+' (imagen ilustrativa)" loading="lazy"><span class="tag-ill">Imagen ilustrativa</span></figure><div class="rb"><h3>'+r.name+'</h3><p>'+r.short+'</p><div class="chips">'+r.chips.map(function(c){return '<span class="chip">'+c+'</span>'}).join('')+'</div><span class="more">Ver espacio <svg><use href="#i-arrow"/></svg></span></div></button>'}).join('');
function openRoom(id,push){
 var r=ROOMS.filter(function(x){return x.id===id})[0];if(!r)return;
 var low=Math.min.apply(null,seasons.map(function(s){return s.price}));
 $('#roomBody').innerHTML='<div class="rv-hero">'+r.imgs.map(function(im,i){return '<figure data-lb-room="'+i+'"><img src="'+U(im,i?800:1400)+'" alt="'+r.name+' foto '+(i+1)+' (ilustrativa)"><span class="tag-ill">Ilustrativa</span></figure>'}).join('')+'</div><div class="rv-body"><div><span class="crumb">Casa Ameyalli / Espacios / '+r.name+'</span><h2 id="rvTitle">'+r.name+'</h2><p class="lead" style="margin-top:18px">'+r.desc+'</p><ul class="rv-am">'+r.amen.map(function(a){return '<li>'+a+'</li>'}).join('')+'</ul></div><div class="rv-side"><small style="color:var(--mute);font-weight:700">Casa completa desde</small><h3 style="font-family:var(--serif);font-weight:400;font-size:32px">'+moneyS(low)+' <small style="font-size:14px;font-family:var(--sans);color:var(--mute)">MXN/noche</small></h3><p style="font-size:14px;color:var(--mute);margin:8px 0 18px">Reservas la casa completa: los 6 espacios son para tu grupo.</p><button class="btn btn-terra" style="width:100%" data-room-avail>Ver disponibilidad <svg><use href="#i-arrow"/></svg></button></div></div>';
 $$('[data-lb-room]',$('#roomBody')).forEach(function(f){f.addEventListener('click',function(){openLB(r.imgs.map(function(im){return {src:U(im,1800),cap:r.name+' · imagen ilustrativa'}}),+f.dataset.lbRoom)})});
 $('[data-room-avail]').addEventListener('click',function(){closeModal($('#roomModal'));setTimeout(function(){go('#disponibilidad')},350)});
 openModal($('#roomModal'));
 if(push!==false&&location.hash!=='#espacio/'+id)history.pushState({room:id},'','#espacio/'+id);
}
document.addEventListener('click',function(e){var c=e.target.closest('[data-rcard]');if(c)openRoom(c.dataset.room)});
function routeHash(){var m=location.hash.match(/^#espacio\/(\w+)/);if(m)openRoom(m[1],false);else if($('#roomModal').classList.contains('is-open'))closeModal($('#roomModal'),true)}
addEventListener('popstate',routeHash);

/* ---------- galería + lightbox ---------- */
var GAL=[[IMG.hero,'Fachada y alberca','w3'],[IMG.liv1,'Sala','w2'],[IMG.pool,'Terraza','w1'],[IMG.bed1,'Suite principal','w2'],[IMG.kit,'Cocina','w1'],[IMG.glass,'Doble altura','w2'],[IMG.dusk,'Atardecer','w3'],[IMG.bath2,'Baño principal','w2'],[IMG.pool2,'Jardín','w1'],[IMG.bed2,'Recámara Jardín','w2']];
$('#galTrack').innerHTML=GAL.map(function(g,i){return '<figure class="gal-item '+g[2]+'" data-lb="'+i+'" tabindex="0" role="button" aria-label="Ver foto: '+g[1]+'"><img src="'+U(g[0],1100)+'" alt="'+g[1]+' (imagen ilustrativa)" loading="lazy"><figcaption>'+g[1]+'</figcaption></figure>'}).join('');
var galList=GAL.map(function(g){return {src:U(g[0],1900),cap:g[1]+' · imagen ilustrativa (Unsplash)'}});
$$('[data-lb]').forEach(function(f){var o=function(){openLB(galList,+f.dataset.lb)};f.addEventListener('click',o);f.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();o()}})});
var lb={list:[],i:0};
function openLB(list,i){lb.list=list;lb.i=i;showLB();var el=$('#lb');el.classList.add('is-open');el.setAttribute('aria-hidden','false');lockScroll(true);$('.x',el).focus()}
function showLB(){var it=lb.list[lb.i];$('#lb img').src=it.src;$('#lb img').alt=it.cap;$('#lb .lb-cap').textContent=(lb.i+1)+' / '+lb.list.length+' · '+it.cap}
$('#lb .lb-prev').addEventListener('click',function(){lb.i=(lb.i-1+lb.list.length)%lb.list.length;showLB()});
$('#lb .lb-next').addEventListener('click',function(){lb.i=(lb.i+1)%lb.list.length;showLB()});
$('#lb [data-close]').addEventListener('click',closeLB);
function closeLB(){var el=$('#lb');el.classList.remove('is-open');el.setAttribute('aria-hidden','true');if(!$('.modal.is-open'))lockScroll(false)}
(function(){var x0=null;$('#lb').addEventListener('touchstart',function(e){x0=e.touches[0].clientX},{passive:true});$('#lb').addEventListener('touchend',function(e){if(x0===null)return;var dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>40){lb.i=(lb.i+(dx<0?1:-1)+lb.list.length)%lb.list.length;showLB()}x0=null})})();

/* ---------- amenidades, reseñas, faq ---------- */
var AM=[['i-pool','Alberca climatizada','28 °C todo el año'],['i-wifi','Wifi 200 Mbps','Ideal para home office'],['i-car','Estacionamiento','Privado, 3 autos'],['i-fire','Chimenea y fogatero','Leña incluida'],['i-chef','Cocina equipada','Con lavavajillas'],['i-snow','Aire acondicionado','En recámaras'],['i-tv','Smart TV','Netflix y Disney+'],['i-paw','Pet friendly','Hasta 2 mascotas'],['i-sun','Terraza y camastros','Con palapa y asador'],['i-shield','Llegada autónoma','Cerradura con código'],['i-users','Ideal para familias','Cuna y silla alta'],['i-clock','Atención 24/7','Por WhatsApp']];
$('#amen').innerHTML=AM.map(function(a){return '<div class="am" data-am><svg><use href="#'+a[0]+'"/></svg><div><b>'+a[1]+'</b><span>'+a[2]+'</span></div></div>'}).join('');
var REV=[['La casa es todavía más bonita que en las fotos. La alberca climatizada fue lo mejor para los niños y reservar directo fue facilísimo.','Daniela M.','Ciudad de México','Web'],['Llegamos de noche y el código de entrada funcionó perfecto. Todo limpio, cocina completa y el jardín enorme.','Jorge L.','Puebla','Airbnb'],['Fuimos 8 amigos y sobró espacio. El anfitrión respondió rapidísimo por WhatsApp. Volveremos en Semana Santa.','Valeria P.','Querétaro','Web']];
$('#revs').innerHTML=REV.map(function(r){return '<figure class="rev" data-rv><div class="stars" aria-label="5 estrellas">★★★★★</div><q>'+r[0]+'</q><figcaption class="who"><span class="av">'+r[1][0]+'</span><span><b>'+r[1]+'</b><br><small style="color:var(--mute)">'+r[2]+' · reseña de ejemplo</small></span><span class="src">'+r[3]+'</span></figcaption></figure>'}).join('');
var FAQ=[['¿Cómo sé que las fechas están realmente disponibles?','El calendario se sincroniza con Airbnb: las reservas hechas allá se bloquean aquí y las de esta web se bloquean en Airbnb, para evitar dobles reservas.'],['¿Qué métodos de pago aceptan?','Tarjeta de crédito o débito (Stripe), Mercado Pago con OXXO, SPEI y meses sin intereses, y PayPal. Pagas el total en línea y recibes tu recibo por correo.'],['¿Cuál es la política de cancelación?','Cancelación gratuita hasta 14 días antes de la llegada con reembolso del 100 %. Entre 14 y 7 días, 50 %. Menos de 7 días, no reembolsable.'],['¿Pueden emitir factura?','Sí. Marca la opción “Necesito factura” al reservar y te enviamos el CFDI a tu correo.'],['¿Se aceptan mascotas?','Sí, hasta 2 mascotas con un cargo de limpieza de $450 MXN cada una.'],['¿A qué hora puedo llegar?','Check-in desde las 15:00 con llegada autónoma; check-out antes de las 12:00. Pregunta por llegada anticipada.']];
$('#faqList').innerHTML=FAQ.map(function(f,i){return '<details'+(i===0?' open':'')+'><summary>'+f[0]+'<i aria-hidden="true"></i></summary><div class="ans">'+f[1]+'</div></details>'}).join('');

/* ---------- modales ---------- */
var lastFocus=null,lenis=null;
function lockScroll(on){document.documentElement.style.overflow=on?'hidden':'';if(lenis)on?lenis.stop():lenis.start()}
function openModal(m){lastFocus=document.activeElement;m.classList.add('is-open');m.setAttribute('aria-hidden','false');lockScroll(true);$('.sheet',m).scrollTop=0;setTimeout(function(){$('.x',m).focus()},60)}
function closeModal(m,fromPop){if(m.id==='bkModal'&&state.done){state.done=false;state.ci=state.co=null;state.coupon=null;setTimeout(update,400)}m.classList.remove('is-open');m.setAttribute('aria-hidden','true');lockScroll(false);if(m.id==='roomModal'&&!fromPop&&/^#espacio/.test(location.hash))history.replaceState(null,'',location.pathname+location.search);if(lastFocus&&lastFocus.focus)lastFocus.focus()}
$$('.modal').forEach(function(m){$$('[data-close]',m).forEach(function(b){b.addEventListener('click',function(){closeModal(m)})})});
document.addEventListener('keydown',function(e){if(e.key!=='Escape')return;if($('#lb').classList.contains('is-open'))return closeLB();var m=$('.modal.is-open');if(m)return closeModal(m);closePops();closeMenu()});
document.addEventListener('keydown',function(e){if(!$('#lb').classList.contains('is-open'))return;if(e.key==='ArrowRight')$('#lb .lb-next').click();if(e.key==='ArrowLeft')$('#lb .lb-prev').click()});

/* ---------- flujo de reserva ---------- */
var step=1;
function setStep(s){step=s;$$('.bk-step').forEach(function(x){x.classList.toggle('on',+x.dataset.step===s)});$$('#steps li').forEach(function(li){var n=+li.dataset.s;li.classList.toggle('on',n===s);li.classList.toggle('done',n<s)});$('#bkModal .sheet').scrollTop=0}
function openBooking(){closePops();setStep(quote()?2:1);if(!quote())setStep(1);openModal($('#bkModal'))}
document.addEventListener('click',function(e){var b=e.target.closest('[data-book]');if(!b)return;e.preventDefault();openBooking()});
$$('#bkModal [data-next]').forEach(function(b){b.addEventListener('click',function(){
 if(step===1){if(!quote()){$('#calBkMsg').textContent='Elige llegada y salida para continuar.';return}setStep(2)}
 else if(step===2){var ok=$('#fName').value.trim()&&/\S+@\S+\.\S+/.test($('#fMail').value);if(!ok){toast('Completa nombre y un correo válido');return}if(!$('#fRules').checked){toast('Acepta las reglas de la casa para continuar');return}setStep(3)}
})});
$$('#bkModal [data-prev]').forEach(function(b){b.addEventListener('click',function(){setStep(step-1)})});
$$('[data-pm]').forEach(function(b){b.addEventListener('click',function(){state.pm=b.dataset.pm;$$('[data-pm]').forEach(function(x){x.setAttribute('aria-pressed',x===b)});$$('[data-pmbox]').forEach(function(x){x.hidden=x.dataset.pmbox!==state.pm});$('#payBtn').style.display=state.pm==='pp'?'none':''})});
$('#cNum').addEventListener('input',function(e){var v=e.target.value.replace(/\D/g,'').slice(0,16);e.target.value=v.replace(/(.{4})/g,'$1 ').trim();$('#ccNum').textContent=e.target.value||'•••• •••• •••• ••••'});
$('#cExp').addEventListener('input',function(e){var v=e.target.value.replace(/\D/g,'').slice(0,4);if(v.length>2)v=v.slice(0,2)+'/'+v.slice(2);e.target.value=v;$('#ccExp').textContent=v||'MM/AA'});
$('#fName').addEventListener('input',syncName);$('#fLast').addEventListener('input',syncName);
function syncName(){$('#ccName').textContent=($('#fName').value+' '+$('#fLast').value.replace(/\(.*\)/,'')).trim().toUpperCase()||'NOMBRE'}
var PMN={stripe:'Tarjeta · Stripe',mp:'Mercado Pago',pp:'PayPal'};
$$('[data-pay]').forEach(function(b){b.addEventListener('click',function(){
 var q=quote();if(!q)return setStep(1);
 var pr=$('#processing'),t=$('#procTxt');pr.classList.add('on');
 t.textContent=state.pm==='pp'?'Conectando con PayPal…':state.pm==='mp'?'Conectando con Mercado Pago…':'Procesando pago seguro con Stripe…';
 setTimeout(function(){t.textContent='Confirmando disponibilidad con Airbnb…'},1000);
 setTimeout(function(){
  pr.classList.remove('on');
  var code='CA-'+(Math.floor(Math.random()*9000)+1000),name=$('#fName').value.trim()+' '+$('#fLast').value.replace(/\(.*\)/,'').trim();
  var nb={s:state.ci,e:state.co,n:q.n,src:'web',guest:name,pay:'Pagado · '+PMN[state.pm],total:Math.round(q.total),isNew:true};
  bookings.push(nb);rebuildBooked();
  $('#confCode').textContent=code;
  var mail=$('#mail');mail.innerHTML='<div class="mh">De: Casa Ameyalli &lt;reservas@casa-ejemplo.mx&gt; · Para: <span data-m></span><br>Asunto: Reserva confirmada '+code+' · recibo adjunto</div><div class="mb"><h5>¡Hola, <span data-n></span>! Te esperamos.</h5><p style="color:var(--mute)">Llegada <b>'+fD(state.ci,{weekday:'long',day:'numeric',month:'long'})+'</b> desde las 15:00 · Salida <b>'+fD(state.co,{weekday:'long',day:'numeric',month:'long'})+'</b> antes de las 12:00 · '+guestsTxt()+'.</p>'+brkHTML(q)+'<p style="font-size:13px;color:var(--mute)">Pagado con '+PMN[state.pm]+' · Recibo-'+code+'.pdf adjunto · 3 días antes recibirás el código de acceso y la ubicación exacta.</p></div>';
  $('[data-m]',mail).textContent=$('#fMail').value;$('[data-n]',mail).textContent=$('#fName').value;
  addLog('Reserva web '+code+' exportada a Airbnb · fechas bloqueadas');
  state.done=true;
  setStep(4);update();renderAdmin();
  toast('Reserva '+code+' confirmada (demo) · correo y recibo enviados');
 },2200);
})});

/* ---------- sincronización ---------- */
var syncLog=[['Calendario importado desde Airbnb (iCal) · 7 reservas',4],['Calendario de la web exportado a Airbnb (iCal)',4],['Tarifas de temporada enviadas a Airbnb vía channel manager',35],['Mensaje de Mariana R. importado desde Airbnb',52],['Reserva Airbnb de Renata S. importada y bloqueada',180]].map(function(x){return {t:x[0],m:x[1]}});
function addLog(t){syncLog.unshift({t:t,m:0});renderLog()}
function renderLog(){$('#syncLog').innerHTML=syncLog.map(function(l){return '<li><i></i>'+l.t.replace(/</g,'&lt;')+'<time>'+(l.m===0?'justo ahora':l.m<60?'hace '+l.m+' min':'hace '+Math.round(l.m/60)+' h')+'</time></li>'}).join('')}
$('#syncBtn').addEventListener('click',function(){var b=$('#syncBadge');b.classList.add('is-spin');setTimeout(function(){b.classList.remove('is-spin');$('#syncAgo').textContent='hace unos segundos';addLog('Sincronización manual con Airbnb · sin cambios nuevos');toast('Calendario sincronizado con Airbnb')},1400)});

/* ---------- panel admin ---------- */
var TITLES={res:'Reservas y pagos',rates:'Tarifas y temporadas',coupons:'Cupones',promo:'Promociones y redes',msgs:'Mensajes',sync:'Sincronización'};
$$('.tab').forEach(function(t){t.addEventListener('click',function(){$$('.tab').forEach(function(x){x.setAttribute('aria-selected',x===t)});$$('.pane').forEach(function(p){p.classList.toggle('is-on',p.dataset.pane===t.dataset.tab)});$('#dashTitle').textContent=TITLES[t.dataset.tab]})});
function renderAdmin(){
 var list=bookings.slice().sort(function(a,b){return a.s-b.s}),in30=0,rev=0,cnt=0,nights=0,paidN=0;
 list.forEach(function(b){var tot=b.total||bTotal(b);b._t=tot;if(b.src!=='blk'){if(diff(TODAY,b.s)<=30&&b.e>TODAY){in30+=Math.min(b.n,Math.max(0,30-diff(TODAY,b.s)));}if(b.s>=TODAY){cnt++}rev+=tot;nights+=b.n;paidN+=tot}});
 $('#kpis').innerHTML=[['Ingresos programados',money(rev),'+18 % vs. mes anterior (ej.)'],['Ocupación 30 días',Math.round(in30/30*100)+' %','Airbnb + web'],['Próximas reservas',cnt,'0 conflictos'],['Tarifa promedio',moneyS(paidN/(nights||1)/(1+FEES.tax)),'por noche']].map(function(k){return '<div class="kpi"><small>'+k[0]+'</small><b>'+k[1]+'</b><em>'+k[2]+'</em></div>'}).join('');
 $('#resRows').innerHTML=list.map(function(b){return '<tr class="'+(b.isNew?'new':'')+'"><td><b data-gn></b></td><td>'+fD(b.s)+' – '+fD(b.e)+'</td><td>'+b.n+'</td><td><span class="src src-'+b.src+'">'+SRC[b.src]+'</span></td><td>'+(b.src==='blk'?'—':moneyS(b._t))+'</td><td class="'+(b.src==='blk'?'':'st-ok')+'">'+b.pay+'</td></tr>'}).join('');
 $$('#resRows [data-gn]').forEach(function(el,i){el.textContent=list[i].guest});
 list.forEach(function(b){b.isNew=false});
}
function renderRates(){
 $('#rateForm').innerHTML=seasons.map(function(s,i){return '<div class="row" style="grid-template-columns:1.5fr 1fr 1fr auto"><label><b style="color:#fff;font-size:14px">'+s.name+'</b><span>'+s.range+'</span></label><label>Precio / noche (MXN)<input class="din" type="number" min="500" step="50" value="'+s.price+'" data-rate="'+i+'"></label><label>Noches mínimas<input class="din" type="number" min="1" max="14" value="'+s.min+'" data-min="'+i+'"></label><span class="src src-air">Airbnb ✓</span></div>'}).join('');
}
$('#ratePublish').addEventListener('click',function(){
 $$('[data-rate]').forEach(function(inp){var v=Math.max(500,+inp.value||0);seasons[+inp.dataset.rate].price=v});
 $$('[data-min]').forEach(function(inp){seasons[+inp.dataset.min].min=Math.max(1,+inp.value||1)});
 update();renderAdmin();addLog('Tarifas actualizadas en la web y enviadas a Airbnb');toast('Tarifas publicadas en la web y enviadas a Airbnb (demo)');
});
$('#rateReset').addEventListener('click',function(){seasons=SEASONS_DEF.map(function(s){return Object.assign({},s)});renderRates();update();renderAdmin();toast('Tarifas de ejemplo restauradas')});
function renderCoupons(){var el=$('#cpList');el.innerHTML='';coupons.forEach(function(c){var s=document.createElement('span');s.textContent=c.code+' · −'+c.pct+' % · mín. '+c.min+' noches';el.appendChild(s)})}
$('#cpAdd').addEventListener('click',function(){
 var code=$('#cpCode').value.trim().toUpperCase().replace(/[^A-Z0-9]/g,''),pct=Math.min(60,Math.max(1,+$('#cpPct').value||0)),min=Math.max(1,+$('#cpMin').value||1);
 if(!code){toast('Escribe un código');return}
 coupons=coupons.filter(function(c){return c.code!==code});coupons.push({code:code,pct:pct,min:min});renderCoupons();addLog('Cupón '+code+' creado y activo en la web');toast('Cupón '+code+' creado: pruébalo en el resumen de reserva');
});
['Title','Offer','Text'].forEach(function(f){$('#pr'+f).addEventListener('input',function(e){$('#pv'+f).textContent=e.target.value})});
$('#prPub').addEventListener('click',function(){
 var nets=$$('.net input:checked').map(function(i){return i.value});if(!nets.length){toast('Elige al menos una red');return}
 var log=$('#prLog');log.innerHTML='';
 nets.forEach(function(n,i){setTimeout(function(){var li=document.createElement('li');li.innerHTML='<i></i><span></span><time>publicado (demo)</time>';$('span',li).textContent=n+' · '+$('#prTitle').value;log.appendChild(li);if(i===nets.length-1)toast('Promoción publicada en '+nets.join(', ')+' (simulado)')},450*(i+1))});
});
var THREADS=[{n:'Mariana R.',src:'air',m:[['¿Podemos llegar a las 13:00? Venimos con dos niños.',0],['¡Claro! Si la limpieza termina antes te aviso por aquí.',1],['Perfecto, gracias 🙌',0]]},{n:'Luis P.',src:'web',m:[['Hola, ¿la alberca está climatizada en noviembre?',0]]},{n:'Familia Ortega',src:'air',m:[['¿Hay cuna disponible?',0]]}];
var cur=0;
function renderThreads(){
 $('#threads').innerHTML=THREADS.map(function(t,i){return '<button type="button" aria-pressed="'+(i===cur)+'" data-th="'+i+'"><b><span data-tn></span><span class="src src-'+t.src+'">'+SRC[t.src]+'</span></b><span data-tl></span></button>'}).join('');
 $$('#threads [data-th]').forEach(function(b,i){$('[data-tn]',b).textContent=THREADS[i].n;$('[data-tl]',b).textContent=THREADS[i].m[THREADS[i].m.length-1][0]});
 var t=THREADS[cur],c=$('#chat');c.innerHTML='<div style="font-size:12px;color:#8d8577">Conversación de '+SRC[t.src]+' · las respuestas se envían al mismo canal</div>';
 t.m.forEach(function(m){var d=document.createElement('div');d.className='bub'+(m[1]?' me':'');d.textContent=m[0];c.appendChild(d)});
 var f=document.createElement('form');f.innerHTML='<input class="din" placeholder="Escribe una respuesta…" aria-label="Respuesta"><button class="dbtn">Enviar</button>';c.appendChild(f);
 f.addEventListener('submit',function(e){e.preventDefault();var v=$('input',f).value.trim();if(!v)return;t.m.push([v,1]);renderThreads();toast('Respuesta enviada a '+(t.src==='air'?'Airbnb':'correo del huésped')+' (demo)')});
}
$('#threads').addEventListener('click',function(e){var b=e.target.closest('[data-th]');if(b){cur=+b.dataset.th;renderThreads()}});

/* ---------- navegación ---------- */
function go(h){var t=$(h);if(!t)return;if(lenis)lenis.scrollTo(t,{offset:-70,duration:1.4});else t.scrollIntoView({behavior:reduce?'auto':'smooth'})}
document.addEventListener('click',function(e){var a=e.target.closest('a[href^="#"]');if(!a||a.hasAttribute('data-book'))return;var h=a.getAttribute('href');if(h.length<2)return;e.preventDefault();closeMenu();go(h)});
function closeMenu(){var m=$('#mmenu');if(!m.classList.contains('is-open'))return;m.classList.remove('is-open');m.setAttribute('aria-hidden','true');$('#burger').setAttribute('aria-expanded','false');lockScroll(false)}
$('#burger').addEventListener('click',function(){var m=$('#mmenu');m.classList.add('is-open');m.setAttribute('aria-hidden','false');this.setAttribute('aria-expanded','true');lockScroll(true)});
$('[data-close-menu]').addEventListener('click',closeMenu);
var nav=$('#nav'),lastY=0;
addEventListener('scroll',function(){var y=scrollY;nav.classList.toggle('is-scrolled',y>40);var anyOpen=$('.pop.is-open');nav.classList.toggle('is-away',y>innerHeight*.9&&y>lastY+2&&!anyOpen);if(y<lastY-2)nav.classList.remove('is-away');lastY=y},{passive:true});

/* ---------- init ---------- */
new Cal($('#calPop'),{months:function(){return innerWidth>820?2:1}});
new Cal($('#calMain'),{months:function(){return innerWidth>820?2:1},msg:'#calMsg'});
new Cal($('#calBk'),{months:1,msg:'#calBkMsg'});
var rz;addEventListener('resize',function(){clearTimeout(rz);rz=setTimeout(function(){cals.forEach(function(c){c.render()})},150)});
update();renderAdmin();renderRates();renderCoupons();renderThreads();renderLog();
if(/^#espacio\//.test(location.hash))routeHash();

/* ---------- animaciones (GSAP + ScrollTrigger + Lenis) ---------- */
function splitWords(el){
 var out=document.createDocumentFragment();
 Array.prototype.slice.call(el.childNodes).forEach(function(n){
  var holder=n.nodeType===1?n.cloneNode(false):null,txt=n.textContent,parts=txt.split(/(\s+)/);
  var target=holder||out;
  parts.forEach(function(p){if(!p)return;if(/^\s+$/.test(p)){target.appendChild(document.createTextNode(' '));return}var w=document.createElement('span');w.className='w';w.style.cssText='display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.1em;margin-bottom:-.1em';var i=document.createElement('span');i.style.display='inline-block';i.textContent=p;w.appendChild(i);target.appendChild(w)});
  if(holder)out.appendChild(holder);
 });
 el.innerHTML='';el.appendChild(out);el.setAttribute('aria-label',el.textContent);
 return $$('.w>span',el);
}
function motion(){
 if(reduce||!window.gsap||!window.ScrollTrigger){document.documentElement.classList.remove('anim');return}
 gsap.registerPlugin(ScrollTrigger);
 if(window.Lenis){lenis=new Lenis({lerp:.085,smoothWheel:true});lenis.on('scroll',ScrollTrigger.update);gsap.ticker.add(function(t){lenis.raf(t*1000)});gsap.ticker.lagSmoothing(0)}
 var tl=gsap.timeline({defaults:{ease:'expo.out'}});
 tl.to('.hero-media img',{scale:1,duration:2.4,ease:'power3.out'},0)
   .to('.hero h1 .ln>span',{y:0,duration:1.5,stagger:.14},.25)
   .fromTo('.hero-fade',{autoAlpha:0,y:24},{autoAlpha:1,y:0,duration:1.2,stagger:.12},.6)
   .add(function(){document.documentElement.classList.remove('anim')});
 gsap.to('.hero-media img',{yPercent:12,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
 $$('[data-split]').forEach(function(h){var w=splitWords(h);gsap.from(w,{yPercent:110,duration:1.2,ease:'expo.out',stagger:.045,scrollTrigger:{trigger:h,start:'top 86%',once:true}})});
 gsap.set('[data-reveal]:not([data-reveal=img])',{autoAlpha:0});
 ScrollTrigger.batch('[data-reveal]:not([data-reveal=img])',{start:'top 90%',once:true,onEnter:function(els){gsap.fromTo(els,{autoAlpha:0,y:40},{autoAlpha:1,y:0,duration:1.1,ease:'expo.out',stagger:.08,overwrite:true})}});
 $$('[data-reveal=img]').forEach(function(el){gsap.fromTo(el,{clipPath:'inset(100% 0% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:1.5,ease:'expo.inOut',scrollTrigger:{trigger:el,start:'top 85%',once:true}})});
 $$('[data-speed]').forEach(function(im){gsap.fromTo(im,{yPercent:-12},{yPercent:0,ease:'none',scrollTrigger:{trigger:im.parentNode,start:'top bottom',end:'bottom top',scrub:true}})});
 gsap.fromTo('.cta .bg',{yPercent:-8},{yPercent:8,ease:'none',scrollTrigger:{trigger:'.cta',start:'top bottom',end:'bottom top',scrub:true}});
 $$('[data-count]').forEach(function(el){var to=+el.dataset.count,dec=+(el.dataset.dec||0),o={v:0};ScrollTrigger.create({trigger:el,start:'top 90%',once:true,onEnter:function(){gsap.to(o,{v:to,duration:2,ease:'power3.out',onUpdate:function(){el.textContent=dec?o.v.toFixed(dec):Math.round(o.v).toLocaleString('es-MX')}})}})});
 ['.room','.am','.rev','.post'].forEach(function(sel){ScrollTrigger.batch(sel,{start:'top 92%',once:true,onEnter:function(els){gsap.fromTo(els,{autoAlpha:0,y:60},{autoAlpha:1,y:0,duration:1.1,ease:'expo.out',stagger:.09,overwrite:true})}});gsap.set(sel,{autoAlpha:0})});
 var mm=gsap.matchMedia();
 mm.add('(min-width:821px)',function(){
  var track=$('#galTrack');
  var dist=function(){return Math.max(0,track.scrollWidth-innerWidth+parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--pad'))||0)};
  gsap.to(track,{x:function(){return -(track.scrollWidth-innerWidth+80)},ease:'none',scrollTrigger:{trigger:'#galeria',start:'top top',end:function(){return '+='+(track.scrollWidth-innerWidth+80)},pin:true,scrub:1,invalidateOnRefresh:true,anticipatePin:1}});
  $$('.gal-item img').forEach(function(im){gsap.fromTo(im,{scale:1.15},{scale:1,ease:'none',scrollTrigger:{trigger:'#galeria',start:'top top',end:function(){return '+='+(track.scrollWidth-innerWidth)},scrub:true}})});
 });
 if(matchMedia('(hover:hover)').matches){$$('.btn').forEach(function(b){b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();gsap.to(b,{x:(e.clientX-r.left-r.width/2)*.18,y:(e.clientY-r.top-r.height/2)*.25,duration:.5,ease:'power3.out'})});b.addEventListener('mouseleave',function(){gsap.to(b,{x:0,y:0,duration:.7,ease:'elastic.out(1,.5)'})})})}
 addEventListener('load',function(){ScrollTrigger.refresh()});
}
motion();
})();
