/* FCosta: deslizar o dedo sobre a foto do cartão troca a foto (usa as mesmas setas da página). */
(function(){var x0=null,y0=null,alvo=null;
document.addEventListener('touchstart',function(e){var f=e.target.closest&&e.target.closest('.im-foto');if(!f||e.target.closest('.im-fn'))return;alvo=f;x0=e.touches[0].clientX;y0=e.touches[0].clientY;},{passive:true});
document.addEventListener('touchend',function(e){if(!alvo)return;var dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0,f=alvo;alvo=null;
if(Math.abs(dx)<40||Math.abs(dx)<Math.abs(dy))return;var b=f.querySelector(dx<0?'.im-fx':'.im-fp');if(b)b.click();},{passive:true});
})();
