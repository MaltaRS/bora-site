/* Xouty · parcerias.js — convites e pedidos de parceria entre locais, promoters e concierges (R105–R107).
   Só entre eles: o local vê "Convidar" no perfil de um promoter ou concierge; o promoter e o concierge veem "Ser parceiro" no perfil de um local.
   Nada entra sem aceitação manual de quem recebe. Protótipo: quem está a ver escolhe-se em "Ver como"; tudo fica neste aparelho. */
(function(){
'use strict';
const PK = 'streetfy:parcerias', SK = 'streetfy:sessao';
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
/* quem "sou eu" em cada papel, no protótipo */
const EU = {local:{id:'lisboa/lux fragil', nome:'Lux Frágil'}, promoter:{id:'rita-m', nome:'Rita M.'}, concierge:{id:'lara-v', nome:'Lara V.'}, utilizador:{id:'mari-costa', nome:'Mariana Costa'}};
const USERS = {'mari-costa':'Mariana Costa'};
const CONC_NOMES = {'lara-v':'Lara V.', 'joao-r':'João R.', 'marta-s':'Marta S.', 'ricardo-p':'Ricardo P.', 'beatriz-c':'Beatriz C.', 'tiago-a':'Tiago A.'};
const nomeDe = (tipo, id) => USERS[id] ? USERS[id] : tipo === 'concierge' ? CONC_NOMES[id] || id : ((((window.STREETFY_PROMOTERS || {}).lista || []).find(p => p.id === id) || {}).nome || id);
const DIA = 864e5, agora = Date.now();
const PADRAO = () => [
  {id:'p1', local:'lisboa/lux fragil', localNome:'Lux Frágil', tipo:'promoter', quem:'rita-m', dir:'convite', estado:'aceite', t:agora - 200 * DIA, msg:'', comissao:8, perm:{evento:false, lista:true, mesa:false}},
  {id:'p2', local:'lisboa/lux fragil', localNome:'Lux Frágil', tipo:'promoter', quem:'tiago-r', dir:'pedido', estado:'aceite', t:agora - 120 * DIA, msg:'', comissao:6, perm:{evento:true, lista:true, mesa:true}},
  {id:'p3', local:'lisboa/lux fragil', localNome:'Lux Frágil', tipo:'promoter', quem:'marco-s', dir:'convite', estado:'aceite', t:agora - 60 * DIA, msg:'', comissao:0},
  {id:'p4', local:'lisboa/lux fragil', localNome:'Lux Frágil', tipo:'concierge', quem:'lara-v', dir:'pedido', estado:'aceite', t:agora - 90 * DIA, msg:''},
  {id:'p5', local:'lisboa/lux fragil', localNome:'Lux Frágil', tipo:'concierge', quem:'beatriz-c', dir:'convite', estado:'aceite', t:agora - 40 * DIA, msg:''},
  {id:'p6', local:'lisboa/lux fragil', localNome:'Lux Frágil', tipo:'concierge', quem:'ricardo-p', dir:'pedido', estado:'pendente', t:agora - 2 * DIA, msg:'Trago grupos de empresa às sextas, 6 a 10 pessoas por mesa.'},
  {id:'p7', local:'lisboa/lux fragil', localNome:'Lux Frágil', tipo:'promoter', quem:'ines-c', dir:'pedido', estado:'pendente', t:agora - DIA, msg:'Faço techno há dois anos; levo 40 a 60 pessoas por noite.'},
  {id:'p8', local:'lisboa/lux fragil', localNome:'Lux Frágil', tipo:'promoter', quem:'joana-p', dir:'convite', estado:'pendente', t:agora - 3 * DIA, msg:'Gostávamos de te ter nas Lux Sessions de sábado.', comissao:8},
  {id:'p9', local:'lisboa/b leza', localNome:'B.Leza', tipo:'promoter', quem:'rita-m', dir:'convite', estado:'pendente', t:agora - DIA / 2, msg:'Queremos-te nas sextas de kizomba. Comissão de 10%.', comissao:10},
  {id:'p10', local:'lisboa/ministerium club', localNome:'Ministerium Club', tipo:'concierge', quem:'lara-v', dir:'pedido', estado:'pendente', t:agora - 4 * DIA, msg:'Tenho clientes para mesa às sextas e sábados.'}];
const ler = () => { try { const g = JSON.parse(localStorage.getItem(PK) || 'null'); if (Array.isArray(g)) return g; } catch (e) {} return PADRAO(); };
const gravar = l => { try { localStorage.setItem(PK, JSON.stringify(l)); } catch (e) {} };
/* a relação atual entre um local e uma pessoa: o registo mais recente que não foi cancelado */
const relacao = (local, tipo, quem) => ler().filter(r => r.local === local && r.tipo === tipo && r.quem === quem && r.estado !== 'cancelado').sort((a, b) => b.t - a.t)[0] || null;
function criar(r){ const l = ler(); r = Object.assign({id:'p' + Date.now().toString(36), estado:'pendente', t:Date.now(), msg:''}, r); l.push(r); gravar(l); return r; }
/* permissões automáticas que o local dá a um promoter parceiro: criar evento e lista sem passar pela aprovação (regra de 27/10) */
function mudarPerm(id, k, v){ const l = ler(), r = l.find(x => x.id === id); if (r) { r.perm = Object.assign({}, r.perm || {}, {[k]:!!v}); gravar(l); } return r; }
function responder(id, estado){ const l = ler(), r = l.find(x => x.id === id); if (r) { r.estado = estado; r.resp = Date.now(); gravar(l); } return r; }
const sessao = () => { try { return localStorage.getItem(SK) || 'utilizador'; } catch (e) { return 'utilizador'; } };
const mudarSessao = v => { try { localStorage.setItem(SK, v); } catch (e) {} };
/* ---------- o utilizador comum que um local convidou (R113–R114) ----------
   Convidado e aceite, passa a promoter da casa desse local (só para os eventos dele). Para pedir parceria a outros locais
   precisa de reputação: 30 dias como promoter da casa, 20 presenças verificadas e nota ≥ 4,3. */
const RK = 'streetfy:reputacao';
const REP = [['Dias como promoter da casa', 'dias', 30], ['Presenças verificadas pelas tuas indicações', 'presencas', 20], ['Nota "Valeu?"', 'nota', 4.3]];
const casasDe = id => ler().filter(r => r.tipo === 'promoter' && r.quem === id && r.estado === 'aceite' && r.estado !== 'cancelado');
const ePromoterDaCasa = id => casasDe(id).length > 0;
function reputacao(id){
  const cs = casasDe(id), desde = cs.length ? Math.min(...cs.map(r => r.resp || r.t)) : 0;
  let sim = null; try { sim = JSON.parse(localStorage.getItem(RK) || 'null'); } catch (e) {}
  const v = sim && sim[id] ? sim[id] : {dias:desde ? Math.floor((Date.now() - desde) / DIA) : 0, presencas:desde ? 4 : 0, nota:4.4};
  return {v, itens:REP.map(([n, k, alvo]) => [n, k, v[k], alvo, v[k] >= alvo]), ok:cs.length > 0 && REP.every(([, k, alvo]) => v[k] >= alvo)};
}
function simularReputacao(id){ let sim = {}; try { sim = JSON.parse(localStorage.getItem(RK) || '{}') || {}; } catch (e) {} sim[id] = {dias:31, presencas:24, nota:4.6}; try { localStorage.setItem(RK, JSON.stringify(sim)); } catch (e) {} }
window.STREETFY_PARCERIAS = {EU, nomeDe, ler, gravar, relacao, criar, responder, mudarPerm, sessao, mudarSessao, PADRAO, PK, RK, REP, casasDe, ePromoterDaCasa, reputacao, simularReputacao};

/* ---------- botões nos perfis ---------- */
const pagina = document.querySelector('[data-perfil]') ? 'local' : document.querySelector('[data-promoter]') ? 'promoter' : document.querySelector('[data-concierge]') ? 'concierge' : document.querySelector('[data-user]') ? 'user' : '';
if (!pagina) return;
/* quem está a ver escolhe-se na conta, no cabeçalho (nav.js) */
/* no perfil da Mariana, quem não é ela vê a vista pública (sem "Editar perfil") */
const vistaUser = () => { if (pagina !== 'user') return; const v = document.querySelector('[data-ver="' + (sessao() === 'utilizador' || sessao() === 'visitante' ? 'eu' : 'pub') + '"]'); if (v && !v.classList.contains('on')) v.click(); };
let aberto = false;
/* de quem é a página que estou a ver */
function alvo(){
  const q = new URLSearchParams(location.hash.slice(1));
  if (pagina === 'local') { const n = document.querySelector('[data-p="nome"]'); return {local:q.get('lugar') || '', localNome:n ? n.textContent.trim() : 'este local', ia:!!document.querySelector('.p-estado.ia')}; }
  if (pagina === 'user') return {tipo:'promoter', quem:EU.utilizador.id, user:true};
  if (pagina === 'promoter') { const P = (window.STREETFY_PROMOTERS || {}).lista || []; const id = q.get('p') || (P[0] || {}).id; return {tipo:'promoter', quem:id}; }
  return {tipo:'concierge', quem:q.get('c') || 'lara-v'};
}
function botao(){
  const s = sessao(), a = alvo();
  /* a Mariana, utilizadora comum, num perfil de local: aceita convites; pede parceria só com reputação */
  if (pagina === 'local' && s === 'utilizador') {
    if (!a.local || /NÃO ENCONTRADO/.test(a.localNome)) return '';
    const me = EU.utilizador.id, r = relacao(a.local, 'promoter', me), nl = esc(a.localNome);
    if (r && r.estado === 'aceite') return '<span class="s-btn mint pc-ok">Promoter da casa de ' + nl + ' ✓</span>';
    if (r && r.estado === 'pendente' && r.dir === 'convite') return '<span class="pc-conv">' + nl + ' convidou-te para promoter<a href="#" class="s-btn pink" data-pc="aceitar" data-id="' + r.id + '">Aceitar</a><a href="#" class="s-btn ghost" data-pc="recusar" data-id="' + r.id + '">Recusar</a></span>';
    if (!ePromoterDaCasa(me)) return '';
    if (r && r.estado === 'pendente') return '<span class="s-btn ghost pc-esp">Pedido enviado · à espera de ' + nl + '</span>';
    if (!reputacao(me).ok) return '<a class="s-btn ghost pc-lock" href="trabalhar.html#trabalhar" title="Precisas de reputação: 30 dias como promoter da casa, 20 presenças verificadas e nota 4,3">Ser parceiro · 🔒 falta reputação</a>';
    return '<a href="#" class="s-btn pink" data-pc="abrir">' + (r ? 'Pedir de novo para ser parceiro' : 'Ser parceiro') + '</a>';
  }
  if (pagina === 'local' && (s === 'promoter' || s === 'concierge')) {
    if (!a.local || /NÃO ENCONTRADO/.test(a.localNome)) return '';
    const r = relacao(a.local, s, EU[s].id), nl = esc(a.localNome);
    if (!r || r.estado === 'recusado') return '<a href="#" class="s-btn pink" data-pc="abrir">' + (r ? 'Pedir de novo para ser parceiro' : 'Ser parceiro') + '</a>';
    if (r.estado === 'aceite') return '<span class="s-btn mint pc-ok">Parceiro de ' + nl + ' ✓</span>';
    if (r.dir === 'convite') return '<span class="pc-conv">' + nl + ' convidou-te<a href="#" class="s-btn pink" data-pc="aceitar" data-id="' + r.id + '">Aceitar</a><a href="#" class="s-btn ghost" data-pc="recusar" data-id="' + r.id + '">Recusar</a></span>';
    return '<span class="s-btn ghost pc-esp">Pedido enviado · à espera de ' + nl + '</span>';
  }
  if (pagina === 'user' && s !== 'local') return '';
  if (pagina !== 'local' && s === 'local') {
    const r = relacao(EU.local.id, a.tipo, a.quem), nome = esc(nomeDe(a.tipo, a.quem).split(' ')[0]);
    if (!r || r.estado === 'recusado') return '<a href="#" class="s-btn pink" data-pc="abrir">' + (r ? 'Convidar de novo' : a.user ? 'Convidar para promoter do ' + esc(EU.local.nome) : 'Convidar para o ' + esc(EU.local.nome)) + '</a>';
    if (r.estado === 'aceite') return '<span class="s-btn mint pc-ok">' + (a.tipo === 'promoter' ? 'Promoter da casa' : 'Concierge parceiro') + ' ✓</span>';
    if (a.user && r.dir === 'convite' && r.estado === 'pendente') return '<span class="s-btn ghost pc-esp">Convite enviado · à espera de ' + nome + '</span><a href="#" class="pc-cancel" data-pc="cancelar" data-id="' + r.id + '">cancelar</a>';
    if (r.dir === 'pedido') return '<span class="pc-conv">' + nome + ' pediu para ser parceiro<a href="#" class="s-btn pink" data-pc="aceitar" data-id="' + r.id + '">Aceitar</a><a href="#" class="s-btn ghost" data-pc="recusar" data-id="' + r.id + '">Recusar</a></span>';
    return '<span class="s-btn ghost pc-esp">Convite enviado · à espera de ' + nome + '</span><a href="#" class="pc-cancel" data-pc="cancelar" data-id="' + r.id + '">cancelar</a>';
  }
  return '';
}
function formulario(){
  const s = sessao(), a = alvo();
  if (pagina === 'local') return '<form class="pc-form" data-pc-form><b>Ser parceiro de ' + esc(a.localNome) + '</b><small>Como ' + (s === 'concierge' ? 'concierge' : 'promoter') + (s === 'utilizador' ? ', com a reputação que ganhaste como promoter da casa' : '') + '. ' + esc(a.localNome) + ' recebe o pedido no portal e aceita ou recusa.' + (a.ia ? ' Este perfil ainda é gerido pela IA: o pedido fica guardado até o dono o assumir.' : '') + '</small>'
    + '<textarea name="msg" rows="3" maxlength="300" placeholder="' + (s === 'promoter' ? 'que noites fazes, quantas pessoas levas…' : 'que clientes trazes, em que noites…') + '"></textarea><div><button class="s-btn pink" type="submit">Enviar pedido</button><button class="s-btn ghost" type="button" data-pc="fechar">Cancelar</button></div></form>';
  const nome = nomeDe(a.tipo, a.quem);
  return '<form class="pc-form" data-pc-form><b>Convidar ' + esc(nome) + (a.user ? ' para promoter do ' : ' para o ') + esc(EU.local.nome) + '</b><small>' + (a.user ? esc(nome.split(' ')[0]) + ' ainda não é promoter. Se aceitar, passa a promoter da casa, só para os teus eventos, com selo, indicações e lista de convidados. Para pedir parceria a outros locais vai precisar de reputação.' : esc(nome.split(' ')[0]) + ' recebe o convite no portal e aceita ou recusa. Só depois ' + (a.tipo === 'promoter' ? 'passa a promoter da casa.' : 'pode reservar mesas e pôr nomes nas tuas listas.')) + '</small>'
    + (a.tipo === 'promoter' ? '<label>Comissão por bilhete<span><input name="comissao" type="number" min="0" max="30" value="8"> %</span></label>' : '')
    + '<textarea name="msg" rows="3" maxlength="300" placeholder="uma mensagem curta (opcional)"></textarea><div><button class="s-btn pink" type="submit">Enviar convite</button><button class="s-btn ghost" type="button" data-pc="fechar">Cancelar</button></div></form>';
}
function poe(){
  const caixa = pagina === 'local' ? document.querySelector('[data-p="acoes"]') : document.querySelector('.p-acoes');
  if (!caixa) return;
  /* o botão vai para a fila de ações; o formulário abre por baixo dela, em linha própria */
  let w = caixa.querySelector('.pc-w'), f = caixa.nextElementSibling && caixa.nextElementSibling.classList.contains('pc-fw') ? caixa.nextElementSibling : null;
  const h = botao(), hf = h && aberto ? formulario() : '';
  if (!h) { if (w) w.remove(); } else {
    if (!w) { w = document.createElement('span'); w.className = 'pc-w'; caixa.insertBefore(w, caixa.firstChild); }
    if (w.dataset.h !== h) { w.innerHTML = h; w.dataset.h = h; }
  }
  if (!hf) { if (f) f.remove(); return; }
  if (!f) { f = document.createElement('div'); f.className = 'pc-fw'; caixa.after(f); }
  if (f.dataset.h !== hf) { f.innerHTML = hf; f.dataset.h = hf; }
}
document.addEventListener('click', ev => {
  const b = ev.target.closest('[data-pc]'); if (!b) return;
  ev.preventDefault();
  const x = b.dataset.pc;
  if (x === 'abrir') aberto = true;
  if (x === 'fechar') aberto = false;
  if (x === 'aceitar') responder(b.dataset.id, 'aceite');
  if (x === 'recusar') responder(b.dataset.id, 'recusado');
  if (x === 'cancelar') responder(b.dataset.id, 'cancelado');
  poe();
  if (x === 'abrir') { const t = document.querySelector('.pc-form textarea'); if (t) t.focus(); }
});
document.addEventListener('submit', ev => {
  const f = ev.target.closest('[data-pc-form]'); if (!f) return;
  ev.preventDefault();
  const s = sessao(), a = alvo(), msg = f.msg.value.trim();
  if (pagina === 'local') criar({local:a.local, localNome:a.localNome, tipo:s === 'utilizador' ? 'promoter' : s, quem:EU[s].id, dir:'pedido', msg, origem:s === 'utilizador' ? 'user' : undefined});
  else criar({local:EU.local.id, localNome:EU.local.nome, tipo:a.tipo, quem:a.quem, dir:'convite', msg, origem:a.user ? 'user' : undefined, comissao:f.comissao ? Math.max(0, Math.min(30, +f.comissao.value || 0)) : undefined});
  aberto = false; poe();
});
window.addEventListener('hashchange', () => { aberto = false; setTimeout(poe, 0); });
window.addEventListener('storage', ev => { if (ev.key === PK || ev.key === SK || ev.key === RK) { vistaUser(); poe(); } });
/* os perfis redesenham-se sozinhos (seguir, trocar de evento): volto a pôr o botão sempre que a caixa muda */
new MutationObserver(() => poe()).observe(document.querySelector('[data-perfil],[data-promoter],[data-concierge],[data-user]'), {childList:true, subtree:true});
vistaUser(); poe();
})();
