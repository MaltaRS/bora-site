/* Xouty · euvou.js — o botão "Eu vou" (R110): qualquer pessoa indica uma festa aos seus seguidores.
   Até 3 por dia de evento, só do catálogo (R66). Quem abre pela indicação e faz check-in conta como presença verificada
   de quem indicou (R68), e é isso que leva a promoter (R69). Guardado neste aparelho em streetfy:eu-vou. */
(function(){
'use strict';
const K = 'streetfy:eu-vou', MAX = 3;
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const SEM = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const diaDe = i => { const ks = (i && i._ks || []).slice().sort((a, b) => a - b); if (!ks.length) return ''; const d = new Date(); d.setDate(d.getDate() + ks[0]); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
const diaTxt = dia => { const [a, m, d] = dia.split('-').map(Number), x = new Date(a, m - 1, d), h = new Date(); const dd = Math.round((x - new Date(h.getFullYear(), h.getMonth(), h.getDate())) / 864e5); return dd === 0 ? 'hoje' : dd === 1 ? 'amanhã' : SEM[x.getDay()] + ' ' + d; };
const hojeKey = () => { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
function ler(){
  let l = []; try { l = JSON.parse(localStorage.getItem(K) || '[]') || []; } catch (e) {}
  /* o formato antigo do "Hoje vou a" ({dia, ids}) passa para a lista nova */
  try { const v = JSON.parse(localStorage.getItem('streetfy:hoje-vou') || 'null'); if (v && v.ids) { v.ids.forEach(id => { if (!l.some(x => x.id === id)) l.push({id, dia:v.dia}); }); localStorage.removeItem('streetfy:hoje-vou'); } } catch (e) {}
  const h = new Date(); h.setHours(0, 0, 0, 0);
  return l.filter(x => { const [a, m, d] = x.dia.split('-').map(Number); return new Date(a, m - 1, d) >= h; });
}
const gravar = l => { try { localStorage.setItem(K, JSON.stringify(l)); } catch (e) {} };
const tem = id => ler().some(x => x.id === id);
const doDia = dia => ler().filter(x => x.dia === dia);
/* liga ou desliga; devolve {ok, msg} */
function alterna(i){
  const l = ler(), k = l.findIndex(x => x.id === i.id);
  if (k >= 0) { l.splice(k, 1); gravar(l); return {ok:true, on:false}; }
  const dia = diaDe(i); if (!dia) return {ok:false, msg:'Este evento já passou.'};
  if (l.filter(x => x.dia === dia).length >= MAX) return {ok:false, msg:'Já indicaste ' + MAX + ' eventos para ' + diaTxt(dia) + '. Tira um para indicar este.'};
  l.push({id:i.id, dia}); gravar(l); return {ok:true, on:true};
}
/* quantas pessoas já disseram que vão (número fictício estável por evento) + tu */
const vao = i => { let h = 0; for (const c of String(i.id)) h = (h * 31 + c.charCodeAt(0)) % 997; return 12 + h % 140 + (tem(i.id) ? 1 : 0); };
/* "Indicar a amigos": manda a festa a seguidores escolhidos, com uma mensagem (não obriga a ir) */
const IK = 'streetfy:indicacoes';
const AMIGOS = [['Leonor S.', 'tram'], ['Hugo M.', 'dj'], ['Inês C.', 'alfama'], ['Tiago R.', 'pink'], ['Bruna T.', 'cocktail'], ['Sara D.', 'noite'], ['Rita M.', 'retrato'], ['Kiko R.', 'shots']];
const indic = () => { try { return JSON.parse(localStorage.getItem(IK) || '[]') || []; } catch (e) { return []; } };
const indicadosDe = id => indic().filter(x => x.id === id).reduce((a, x) => a.concat(x.para), []).filter((n, k, l) => l.indexOf(n) === k);
let aberto = '', esc2 = new Set();
/* partilhar fora do Xouty: WhatsApp (link wa.me), Instagram (folha de partilha do telemóvel; no computador copia e abre as mensagens) e copiar o link */
const ICO_WA = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>';
const ICO_IG = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.4" cy="6.6" r="1.3" fill="currentColor"/></svg>';
const ICO_LK = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const urlEv = i => new URL('bilhete.html#lugar=' + encodeURIComponent(C().lugarKey ? C().lugarKey(i) : '') + '&evento=' + encodeURIComponent(i.id), location.href).href;
const textoEv = (i, msg) => (msg || 'Bora?') + ' ' + i.titulo + (i.lugar && i.lugar !== i.titulo ? ' no ' + i.lugar : '') + ': ';
/* no telemóvel, o endereço da própria app (whatsapp://) leva sempre o texto; o wa.me no iPhone às vezes abre a app sem a mensagem */
const MOVEL = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const hrefWa = (i, msg) => (MOVEL ? 'whatsapp://send?text=' : 'https://wa.me/?text=') + encodeURIComponent(textoEv(i, msg) + urlEv(i));
const fora = i => '<div class="ev-fora"><span>Ou manda fora do Xouty</span><div><a class="ev-sh wa" href="' + esc(hrefWa(i, '')) + '" data-ev-sh="wa"' + (MOVEL ? '' : ' target="_blank" rel="noopener"') + ' aria-label="Mandar por WhatsApp" title="WhatsApp">' + ICO_WA + '<b>WhatsApp</b></a><button type="button" class="ev-sh ig" data-ev-sh="ig" aria-label="Mandar pelo Instagram" title="Instagram">' + ICO_IG + '<b>Instagram</b></button><button type="button" class="ev-sh lk" data-ev-sh="lk" aria-label="Copiar o link" title="Copiar link">' + ICO_LK + '<b>Copiar link</b></button></div></div>';
const copia = t => (navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(t) : Promise.reject()).catch(() => { const a = document.createElement('textarea'); a.value = t; a.style.position = 'fixed'; a.style.opacity = '0'; document.body.appendChild(a); a.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (e) {} a.remove(); if (!ok) throw new Error('sem cópia'); });
function painel(i){
  const ja = indicadosDe(i.id);
  return '<form class="ev-ind" data-ev-ind="' + esc(i.id) + '"><b>Indicar ' + esc(i.titulo) + '</b><small>Escolhe a quem mandar. Recebem no app com o teu nome; quem for pela tua indicação e fizer check-in conta para ti.</small>'
    + '<label class="ev-todos"><input type="checkbox" data-ev-todos' + (esc2.size === AMIGOS.length ? ' checked' : '') + '> Todos os seguidores</label>'
    + '<div class="ev-am">' + AMIGOS.map(([n, f]) => { const on = esc2.has(n), j = ja.includes(n); return '<button type="button" class="ev-a' + (on ? ' on' : '') + '" data-ev-a="' + esc(n) + '" aria-pressed="' + on + '"' + (j ? ' disabled' : '') + '><i style="background-image:url(img/' + f + '.jpg)"></i><span>' + esc(n) + '</span>' + (j ? '<em>já indicado</em>' : '') + '</button>'; }).join('') + '</div>'
    + '<input name="msg" maxlength="140" placeholder="mensagem (opcional) · ex.: bora? eu vou às 0h"><div class="ev-ind-a"><button class="s-btn pink" type="submit"' + (esc2.size ? '' : ' disabled') + '>Indicar' + (esc2.size ? ' a ' + esc2.size : '') + '</button><button type="button" class="s-btn ghost" data-ev-fechar>Cancelar</button></div>' + fora(i) + '</form>';
}
function botao(i){
  if (!i || !(i._ks || []).length) return '';
  const on = tem(i.id), n = indicadosDe(i.id).length;
  return '<span class="ev-w"><span class="ev-bs"><button type="button" class="s-btn ' + (on ? 'pink' : 'ghost') + ' ev-btn" data-eu-vou="' + esc(i.id) + '" aria-pressed="' + on + '">' + (on ? 'Eu vou ✓' : 'Eu vou') + '<small>' + vao(i) + ' vão</small></button>'
    + '<button type="button" class="s-btn ghost ev-btn" data-ev-abrir="' + esc(i.id) + '" aria-expanded="' + (aberto === i.id) + '">' + (n ? 'Indicado a ' + n + ' ✓' : 'Indicar a amigos') + '</button></span>' + (aberto === i.id ? painel(i) : '') + '</span>';
}
function troca(i, foco){ const w = document.querySelector('[data-eu-vou="' + i.id + '"]').closest('.ev-w'), t = document.createElement('span'); t.innerHTML = botao(i); const n = t.firstChild; w.replaceWith(n); if (foco) { const f = n.querySelector(foco); if (f) f.focus(); } return n; }
const nota = (w, html) => { const s = document.createElement('small'); s.className = 'ev-nota'; s.setAttribute('role', 'status'); s.innerHTML = html; w.appendChild(s); setTimeout(() => { if (s.isConnected) s.remove(); }, 7000); };
document.addEventListener('click', ev => {
  const sh = ev.target.closest('[data-ev-sh]');
  if (sh) {
    const f = sh.closest('[data-ev-ind]'), i = C().itens.find(x => x.id === f.dataset.evInd); if (!i) return;
    const url = urlEv(i), txt = textoEv(i, f.msg.value.trim()), w = f.closest('.ev-w');
    if (sh.dataset.evSh === 'wa') { sh.href = hrefWa(i, f.msg.value.trim()); return; }   /* o próprio link abre o WhatsApp */
    ev.preventDefault();
    if (sh.dataset.evSh === 'lk') { copia(url).then(() => nota(w, 'Link copiado. Cola onde quiseres.'), () => nota(w, 'Não deu para copiar: ' + url)); return; }
    /* Instagram: no telemóvel abre a folha de partilha (escolhe Instagram); no computador copia a mensagem e abre as mensagens do Instagram */
    if (navigator.share) { navigator.share({title:i.titulo + ' · Xouty', text:txt, url}).catch(() => {}); return; }
    copia(txt + url).then(() => { nota(w, 'Mensagem copiada. Cola na conversa do Instagram que abriu.'); window.open('https://www.instagram.com/direct/inbox/', '_blank', 'noopener'); }, () => nota(w, 'Não deu para copiar: ' + url));
    return;
  }
  const ab = ev.target.closest('[data-ev-abrir],[data-ev-a],[data-ev-fechar]'); if (!ab) return;
  ev.preventDefault();
  const w = ab.closest('.ev-w'), id = (w.querySelector('[data-eu-vou]') || {}).dataset.euVou, i = C().itens.find(x => x.id === id); if (!i) return;
  if (ab.dataset.evAbrir) { aberto = aberto === id ? '' : id; esc2 = new Set(); troca(i, aberto ? '[data-ev-a]:not([disabled])' : '[data-ev-abrir]'); return; }
  if (ab.dataset.evA) { const n = ab.dataset.evA; if (esc2.has(n)) esc2.delete(n); else esc2.add(n); troca(i, '[data-ev-a="' + n + '"]'); return; }
  if (ab.hasAttribute('data-ev-fechar')) { aberto = ''; troca(i, '[data-ev-abrir]'); }
});
document.addEventListener('change', ev => {
  const t = ev.target.closest('[data-ev-todos]'); if (!t) return;
  const i = C().itens.find(x => x.id === t.closest('[data-ev-ind]').dataset.evInd), ja = indicadosDe(i.id);
  esc2 = t.checked ? new Set(AMIGOS.map(a => a[0]).filter(n => !ja.includes(n))) : new Set(); troca(i, '[data-ev-todos]');
});
document.addEventListener('submit', ev => {
  const f = ev.target.closest('[data-ev-ind]'); if (!f) return;
  ev.preventDefault();
  const i = C().itens.find(x => x.id === f.dataset.evInd); if (!i || !esc2.size) return;
  const l = indic(); l.push({id:i.id, para:[...esc2], msg:f.msg.value.trim(), t:Date.now()}); try { localStorage.setItem(IK, JSON.stringify(l)); } catch (e) {}
  const n = esc2.size; aberto = ''; esc2 = new Set();
  const w = troca(i, '[data-ev-abrir]'); nota(w, 'Indicado a ' + n + (n === 1 ? ' amigo' : ' amigos') + '. Quem for pela tua indicação e fizer check-in conta para ti. <a href="trabalhar.html#trabalhar">Como isto leva a promoter</a>');
});
const C = () => window.STREETFY_CATALOGO || {itens:[]};
document.addEventListener('click', ev => {
  const b = ev.target.closest('[data-eu-vou]'); if (!b) return;
  ev.preventDefault();
  const i = C().itens.find(x => x.id === b.dataset.euVou); if (!i) return;
  const r = alterna(i), n = troca(i, '[data-eu-vou]');
  nota(n, !r.ok ? esc(r.msg) + ' <a href="trabalhar.html#trabalhar">Ver as tuas indicações</a>'
    : r.on ? 'Todos os teus seguidores veem que vais. Quem for pela tua indicação e fizer check-in conta para ti. <a href="trabalhar.html#trabalhar">Como isto leva a promoter</a>' : 'Tiraste a indicação.');
});
/* a mensagem escrita entra logo no link do WhatsApp (o link fica certo antes do toque, o que o iPhone exige) */
document.addEventListener('input', ev => {
  const m = ev.target.closest('[data-ev-ind] input[name="msg"]'); if (!m) return;
  const f = m.closest('[data-ev-ind]'), i = C().itens.find(x => x.id === f.dataset.evInd), wa = f.querySelector('[data-ev-sh="wa"]');
  if (i && wa) wa.href = hrefWa(i, m.value.trim());
});
window.STREETFY_EUVOU = {MAX, ler, gravar, tem, alterna, botao, doDia, diaDe, diaTxt, hojeKey};
})();
