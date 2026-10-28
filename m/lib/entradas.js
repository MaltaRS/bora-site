/* Entradas por lista de convidados: cada nome aceite numa lista recebe um QR único.
   Na porta, a equipa lê o QR: o QR passa a usado (não entra duas vezes) e a pessoa fica com check-in feito no local.
   Se a pessoa tem a presença pública (perfil › privacidade › "Onde estou agora"), todos a veem "lá agora"; só seguidores, ou só ela.
   Guardado neste aparelho em streetfy:entradas; o check-in da própria conta vai para streetfy:eu-a-caminho (o mesmo do mapa dos amigos). */
(function(){
const K = 'streetfy:entradas', EK = 'streetfy:eu-a-caminho', EU = 'Mariana Costa', VALE = 6 * 36e5;
const norm = s => String(s || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const ler = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } };
const gravar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const hash = s => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h; };
const codigo = (lista, nome) => 'XY-' + (hash(lista + '|' + norm(nome)).toString(36).toUpperCase() + '000000').slice(0, 6);
const todas = () => ler(K, {});
/* cria (ou devolve) a entrada de um nome numa lista; o código é sempre o mesmo para o mesmo nome na mesma lista */
function garante(lista, listaNome, nome, local, localNome, quando){
  const E = todas(), c = codigo(lista, nome);
  if (!E[c]) { E[c] = {c, lista, listaNome, nome, local, localNome, quando:quando || '', criado:Date.now(), usado:0}; gravar(K, E); }
  else if (E[c].listaNome !== listaNome || E[c].local !== local || (quando && E[c].quando !== quando)) { Object.assign(E[c], {listaNome, local, localNome}, quando ? {quando} : {}); gravar(K, E); }
  return E[c];
}
/* quem já estava marcado como entrou antes de haver QR: fica usado, sem novo check-in */
const jaUsado = (c, t) => { const E = todas(); if (E[c] && !E[c].usado) { E[c].usado = t || Date.now(); gravar(K, E); } return E[c]; };
/* a casa tirou a pessoa da lista (excluída, banida ou lista não aprovada): o QR deixa de existir, se ainda não foi usado */
const anula = c => { const E = todas(); if (E[c] && !E[c].usado) { delete E[c]; gravar(K, E); } };
const de = c => todas()[String(c || '').trim().toUpperCase()] || null;
/* a lista fecha a uma hora: depois dela o QR deixa de valer (a casa decide os minutos antes do evento) */
const fecha = (c, t) => { const E = todas(); if (E[c] && E[c].fechaEm !== t) { E[c].fechaEm = t; gravar(K, E); } };
/* a leitura na porta: inválido, já usado, ou entra e faz check-in */
function lerQR(c, por){
  const E = todas(), k = String(c || '').trim().toUpperCase(), e = E[k];
  if (!e) return {ok:false, motivo:'invalido'};
  if (e.usado) return {ok:false, motivo:'usado', e};
  if (e.fechaEm && Date.now() > e.fechaEm) return {ok:false, motivo:'fechada', e};
  e.usado = Date.now(); if (por) e.por = por; gravar(K, E);
  if (norm(e.nome) === norm(EU)) gravar(EK, {k:e.local, st:'la', t:e.usado, via:'qr'});
  document.dispatchEvent(new CustomEvent('streetfy-entrada', {detail:e}));
  return {ok:true, e};
}
const minhas = () => Object.values(todas()).filter(e => norm(e.nome) === norm(EU)).sort((a, b) => (a.usado ? 1 : 0) - (b.usado ? 1 : 0) || b.criado - a.criado);
/* presença da própria conta: pub = todos, seg = seguidores, eu = só eu */
const presenca = () => { const p = ler('streetfy:perfil-user', {}) || {}; return (p.vis && p.vis.presenca) || 'eu'; };
const aquiAgora = local => { const s = ler(EK, null); return s && s.st === 'la' && s.k === local && Date.now() - s.t < VALE ? s : null; };
const hhmm = t => { const d = new Date(t); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
const qrSvg = seed => { let h = hash(seed); let r = ''; for (let y = 0; y < 21; y++) for (let x = 0; x < 21; x++) { const canto = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13); h = (Math.imul(h, 1103515245) + 12345) >>> 0; const cx = x > 13 ? x - 14 : x, cy = y > 13 ? y - 14 : y; const on = canto ? (cx === 0 || cx === 6 || cy === 0 || cy === 6 || (cx > 1 && cx < 5 && cy > 1 && cy < 5)) : (h >>> 16) % 2 === 0; if (on) r += '<rect x="' + x + '" y="' + y + '" width="1" height="1"/>'; } return '<svg class="qr-svg" viewBox="-1 -1 23 23" role="img" aria-label="QR de entrada ' + seed + '"><rect x="-1" y="-1" width="23" height="23" fill="#fff"/><g fill="#0b0b0b">' + r + '</g></svg>'; };
window.STREETFY_ENTRADAS = {codigo, garante, jaUsado, anula, de, fecha, lerQR, minhas, presenca, aquiAgora, hhmm, qrSvg, EU, norm};
})();
