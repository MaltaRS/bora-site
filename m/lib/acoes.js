/* Xouty · acoes.js — o "curtir" dos cards de eventos e o "Seguir" dos cards de locais, iguais em todo o site.
   Curtir grava em streetfy:gostos (o mesmo da lista Hoje, do perfil e da página do evento).
   Seguir grava em segue:<cidade/lugar> (o mesmo do botão Seguir do perfil do local).
   Os botões podem estar dentro de um card que é link: o clique é tratado aqui e não abre o card.
   Cards estáticos (card-l para perfil.html ou bilhete.html) recebem o botão sozinhos. */
(function(){
'use strict';
const GK = 'streetfy:gostos';
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const ICO = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 21.3l-1.4-1.3C5.4 15.3 2 12.3 2 8.5 2 5.4 4.4 3 7.5 3c1.7 0 3.4.8 4.5 2.1C13.1 3.8 14.8 3 16.5 3 19.6 3 22 5.4 22 8.5c0 3.8-3.4 6.8-8.6 11.5L12 21.3z"/></svg>';
const gostos = () => { try { return JSON.parse(localStorage.getItem(GK) || '[]'); } catch (e) { return []; } };
const gosta = id => gostos().includes(id);
const segue = k => { try { return localStorage.getItem('segue:' + k) === '1'; } catch (e) { return false; } };

const coracao = (id, cls) => { const on = gosta(id); return '<button type="button" class="s-gosto' + (cls ? ' ' + cls : '') + (on ? ' on' : '') + '" data-curtir="' + esc(id) + '" aria-pressed="' + on + '" aria-label="' + (on ? 'Já curtes · tirar' : 'Curtir') + '" title="' + (on ? 'Já curtes · tirar' : 'Curtir') + '">' + ICO + '</button>'; };
const seguir = (k, cls) => { const on = segue(k); return '<button type="button" class="s-segue' + (cls ? ' ' + cls : '') + (on ? ' on' : '') + '" data-segue-lugar="' + esc(k) + '" aria-pressed="' + on + '">' + (on ? 'A seguir ✓' : 'Seguir') + '</button>'; };

function pintaCurtir(id){ const on = gosta(id); document.querySelectorAll('[data-curtir="' + CSS.escape(id) + '"]').forEach(b => { b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); b.setAttribute('aria-label', on ? 'Já curtes · tirar' : 'Curtir'); b.title = b.getAttribute('aria-label'); }); }
function pintaSeguir(k){ const on = segue(k); document.querySelectorAll('[data-segue-lugar="' + CSS.escape(k) + '"]').forEach(b => { b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); b.textContent = on ? 'A seguir ✓' : 'Seguir'; }); }

/* captura: corre antes dos outros cliques e não deixa o card-link abrir */
document.addEventListener('click', ev => {
  const c = ev.target.closest('[data-curtir]'), s = !c && ev.target.closest('[data-segue-lugar]');
  if (!c && !s) return;
  ev.preventDefault(); ev.stopImmediatePropagation();
  if (c) {
    const id = c.dataset.curtir, G = window.STREETFY_GOSTOS;
    if (G && G.alternar) G.alternar(id);
    else { const g = gostos(), i = g.indexOf(id); if (i >= 0) g.splice(i, 1); else g.push(id); try { localStorage.setItem(GK, JSON.stringify(g)); } catch (e) {} }
    pintaCurtir(id);
  } else {
    const k = s.dataset.segueLugar; try { localStorage.setItem('segue:' + k, segue(k) ? '0' : '1'); } catch (e) {}
    pintaSeguir(k);
  }
}, true);

/* cards estáticos das páginas geradas */
function decora(raiz){
  (raiz || document).querySelectorAll('a.card-l.rv[href^="perfil.html#lugar="]:not([data-ac])').forEach(a => {
    a.dataset.ac = '1'; const k = decodeURIComponent((/lugar=([^&]+)/.exec(a.getAttribute('href')) || [])[1] || ''); if (k) a.insertAdjacentHTML('afterbegin', seguir(k, 'no-card'));
  });
  (raiz || document).querySelectorAll('a.card-l.rv[href^="bilhete.html#lugar="]:not([data-ac])').forEach(a => {
    a.dataset.ac = '1'; const id = decodeURIComponent((/evento=([^&]+)/.exec(a.getAttribute('href')) || [])[1] || ''); if (id) a.insertAdjacentHTML('afterbegin', coracao(id));
  });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => decora()); else decora();
window.STREETFY_ACOES = {coracao, seguir, gosta, segue, decora};
})();
