/* FCosta: troca os emojis da página por ícones de traço fino (estilo profissional dos portais).
   Só aparência: o texto continua o mesmo. Para voltar, remova o <script> deste arquivo. */
(function(){
var P={
pin:'<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
bed:'<path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/>',
bath:'<path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.7 3 4 3.7 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5M10 5 8 7M2 12h20M7 19v2M17 19v2"/>',
area:'<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0ZM14.5 12.5l2-2M11.5 9.5l2-2M8.5 6.5l2-2M17.5 15.5l2-2"/>',
car:'<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2M9 17h6"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>',
chat:'<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
home:'<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
build:'<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
tag:'<path d="M12 2H2v10l9.3 9.3a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4L12 2ZM7 7h.01"/>',
search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
phone:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/>',
mobile:'<rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/>',
clip:'<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',
bank:'<path d="M3 22h18M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 2l8 5H4z"/>',
info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
star:'<path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
cal:'<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
money:'<rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
key:'<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
grad:'<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
file:'<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M16 13H8M16 17H8M10 9H8"/>',
book:'<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
case:'<rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
ok:'<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
warn:'<path d="m21.7 18-8-14a2 2 0 0 0-3.5 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3M12 9v4M12 17h.01"/>',
stop:'<circle cx="12" cy="12" r="10"/><path d="M4.9 4.9l14.2 14.2"/>',
lock:'<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
news:'<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2M18 14h-8M15 18h-5M10 6h8v4h-8z"/>',
idea:'<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5M9 18h6M10 22h4"/>',
chart:'<path d="M3 3v18h18M18 17V9M13 17V5M8 17v-3"/>',
scale:'<path d="m16 16 3-8 3 8c-.9.7-1.9 1-3 1s-2.1-.3-3-1ZM2 16l3-8 3 8c-.9.7-1.9 1-3 1s-2.1-.3-3-1ZM7 21h10M12 3v18M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
img:'<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
user:'<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/><circle cx="9" cy="7" r="4"/>',
link:'<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
mute:'<path d="M11 5 6 9H2v6h4l5 4V5zM22 9l-6 6M16 9l6 6"/>',
sound:'<path d="M11 5 6 9H2v6h4l5 4V5zM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
bolt:'<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
shield:'<path d="M20 13c0 5-3.5 7.5-7.7 9a1 1 0 0 1-.7 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1.2 1.2 0 0 1 1.6 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z"/>',
award:'<circle cx="12" cy="8" r="6"/><path d="M15.5 12.9 17 22l-5-3-5 3 1.5-9.1"/>',
send:'<path d="m22 2-7 20-4-9-9-4zM22 2 11 13"/>',
tool:'<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z"/>',
help:'<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"/>',
pen:'<path d="M12 20h9M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z"/>',
map:'<path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15"/>',
monitor:'<rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8M12 17v4"/>',
calc:'<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M8 6h8M16 14v4M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01"/>',
leaf:'<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z"/><path d="M2 21c0-3 1.9-5.4 5.1-6"/>',
globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20"/>',
sparkle:'<path d="M12 3l1.9 5.8L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.2z"/>',
wave:'<path d="M18 11V6a2 2 0 0 0-4 0M14 10V4a2 2 0 0 0-4 0v2M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-6-2.4l-3.6-3.6a2 2 0 0 1 2.8-2.8L7 15"/>',
dot:'<circle cx="12" cy="12" r="5" fill="currentColor"/>'
};
var M={'🏠':'home','🏡':'home','🏘':'home','⚠':'warn','✅':'ok','✔':'ok','📄':'file','📜':'file','🗒':'file','💡':'idea','📍':'pin','📌':'pin','💬':'chat','📋':'clip','🔍':'search','⭐':'star','📐':'area','🖼':'img','📊':'chart','📈':'chart','📉':'chart','⏱':'clock','💰':'money','⚖':'scale','📲':'mobile','📱':'mobile','🔑':'key','🏦':'bank','🏛':'bank','🛏':'bed','🚿':'bath','🛁':'bath','🚗':'car','ℹ':'info','🏢':'build','🏙':'build','🏗':'build','🌆':'build','📰':'news','⛔':'stop','💼':'case','📘':'book','📖':'book','📞':'phone','👤':'user','👨':'user','👥':'users','⚡':'bolt','🔗':'link','🔇':'mute','🔊':'sound','🎓':'grad','🔒':'lock','🛡':'shield','🏅':'award','📤':'send','📡':'send','🔧':'tool','❓':'help','✏':'pen','✍':'pen','🗺':'map','🖥':'monitor','🧮':'calc','🌾':'leaf','✈':'globe','✨':'sparkle','🎉':'sparkle','👋':'wave','🔖':'tag','🟢':'dot','🟡':'dot','🔴':'dot','📅':'cal','📆':'cal'};
var RE=new RegExp('('+Object.keys(M).join('|')+')\\uFE0F?','g');
var PULA={SCRIPT:1,STYLE:1,TEXTAREA:1,SELECT:1,OPTION:1,INPUT:1,TITLE:1,NOSCRIPT:1,svg:1,SVG:1,CODE:1,PRE:1};
var cor={'🟢':'#25D366','🟡':'#E3C04A','🔴':'#E25555'};
function svg(k,e){return '<svg class="fc-ic fc-ic-'+k+'" viewBox="0 0 24 24" aria-hidden="true"'+(cor[e]?' style="color:'+cor[e]+'"':'')+'>'+P[k]+'</svg>';}
function troca(t){var s=t.nodeValue;RE.lastIndex=0;if(!RE.test(s))return;var p=t.parentNode;if(!p||PULA[p.nodeName]||p.closest&&p.closest('[contenteditable],svg,select,textarea'))return;
 var tmp=document.createElement('span');tmp.innerHTML=s.replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c];}).replace(RE,function(m,e){return svg(M[e],e);});
 var fr=document.createDocumentFragment();while(tmp.firstChild)fr.appendChild(tmp.firstChild);p.replaceChild(fr,t);}
function varre(n){if(!n)return;if(n.nodeType===3){troca(n);return;}if(n.nodeType!==1||PULA[n.nodeName])return;
 var w=document.createTreeWalker(n,NodeFilter.SHOW_TEXT,null),l=[],x;while(x=w.nextNode())l.push(x);l.forEach(troca);}
function ini(){varre(document.body);new MutationObserver(function(ms){ms.forEach(function(m){if(m.type==='characterData')troca(m.target);else m.addedNodes.forEach(varre);});}).observe(document.body,{childList:true,subtree:true,characterData:true});}
var st=document.createElement('style');st.textContent='.fc-ic{display:inline-block;width:1.1em;height:1.1em;vertical-align:-.18em;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;color:#C9A96E;flex:none}a .fc-ic,button .fc-ic,.btn .fc-ic{color:currentColor}';
document.head.appendChild(st);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ini);else ini();
})();
