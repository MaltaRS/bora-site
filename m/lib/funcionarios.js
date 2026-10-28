/* Funcionários da casa: o local atribui utilizadores comuns do Xouty a uma função (portaria, segurança, bar…),
   com data de início e fim, ou indeterminado. Cada função tem as suas permissões; "Ler QR na entrada" dá acesso ao Modo porta,
   onde o QR lido passa a usado e a pessoa fica com check-in feito (entradas.js).
   Guardado neste aparelho em streetfy:funcionarios. Protótipo: a casa é o Lux Frágil e "tu" és a Mariana Costa. */
(function(){
const K = 'streetfy:funcionarios', CASA = {k:'lisboa/lux fragil', nome:'Lux Frágil'};
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const norm = s => String(s || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const nid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
const hoje = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const dTxt = s => { if (!s) return ''; const [y, m, d] = s.split('-').map(Number); return d + ' ' + MESES[m - 1] + (y !== new Date().getFullYear() ? ' ' + y : ''); };
const PERMS = [['qr', 'Ler QR na entrada'], ['lista', 'Ver as listas de convidados'], ['mesas', 'Ver reservas de mesa'], ['pedidos', 'Receber pedidos do menu'], ['ofertas', 'Validar ofertas (vouchers)']];
const permNome = k => (PERMS.find(p => p[0] === k) || [k, k])[1];
const GENTE = [['mari-costa', 'Mariana Costa', 'retrato'], ['leonor-s', 'Leonor Santos', 'tram'], ['hugo-m', 'Hugo Martins', 'dj'], ['ines-c', 'Inês Carvalho', 'alfama'], ['sara-d', 'Sara Dias', 'noite'], ['bruna-t', 'Bruna Teixeira', 'cocktail'], ['kiko-r', 'Kiko Rocha', 'club'], ['duarte-p', 'Duarte Pinto', 'shots']].map(([id, nome, foto]) => ({id, nome, foto, user:id.replace('-', '.')}));
const perfilDe = nome => GENTE.find(g => norm(g.nome) === norm(nome));
const ini = n => n.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
const avatar = nome => { const g = perfilDe(nome); return g ? '<span class="bf-av" style="background-image:url(img/' + g.foto + '.jpg)" aria-hidden="true"></span>' : '<span class="bf-av" aria-hidden="true">' + esc(ini(nome)) + '</span>'; };
const PADRAO = () => ({
  funcoes:[{id:'f1', nome:'Portaria', perms:['qr', 'lista', 'ofertas']}, {id:'f2', nome:'Segurança', perms:['qr']}, {id:'f3', nome:'Hostess', perms:['lista', 'mesas']}, {id:'f4', nome:'Bar', perms:['pedidos', 'ofertas']}],
  pessoas:[{id:'s1', nome:'Mariana Costa', funcao:'f1', inicio:hoje(), fim:''}, {id:'s2', nome:'Duarte Pinto', funcao:'f2', inicio:'2026-09-01', fim:''}, {id:'s3', nome:'Bruna Teixeira', funcao:'f4', inicio:'2026-10-01', fim:'2026-12-31'}]
});
const ler = () => { try { const g = JSON.parse(localStorage.getItem(K) || 'null'); if (g && g.funcoes && g.pessoas) return g; } catch (e) {} return PADRAO(); };
let S = ler();
const grava = () => { try { localStorage.setItem(K, JSON.stringify(S)); } catch (e) {} };
const funcao = id => S.funcoes.find(f => f.id === id) || {nome:'sem função', perms:[]};
/* estado da atribuição hoje: ativo, ainda não começou, ou terminou */
const estado = p => { const h = hoje(); return p.inicio && p.inicio > h ? 'futuro' : p.fim && p.fim < h ? 'fim' : 'ativo'; };
const periodo = p => 'desde ' + dTxt(p.inicio) + ' · ' + (p.fim ? 'até ' + dTxt(p.fim) : 'indeterminado');
/* as funções ativas de alguém na casa, e se pode X */
const minhas = nome => { S = ler(); return S.pessoas.filter(p => norm(p.nome) === norm(nome)); };
const pode = (nome, perm) => minhas(nome).some(p => estado(p) === 'ativo' && funcao(p.funcao).perms.includes(perm));

/* ---------- cartão do portal (só o local) ---------- */
const U = {aberto:false, nome:'', escolhido:false, funcao:'f1', inicio:'', fim:'', indet:true, msg:'', gerir:false, nf:'', nfp:['qr']};
const sugestoes = q => { const t = norm(q), ja = S.pessoas.filter(p => estado(p) !== 'fim').map(p => norm(p.nome)); return GENTE.filter(g => !t || norm(g.nome).includes(t) || g.user.includes(t)).slice(0, 6).map(g => '<li><button type="button" data-st-sug="' + esc(g.nome) + '">' + avatar(g.nome) + '<span><b>' + esc(g.nome) + '</b><small>@' + esc(g.user) + (ja.includes(norm(g.nome)) ? ' · já trabalha cá' : '') + '</small></span></button></li>').join(''); };
function card(){
  S = ler();
  const ord = {ativo:0, futuro:1, fim:2}, lista = S.pessoas.slice().sort((a, b) => ord[estado(a)] - ord[estado(b)] || a.nome.localeCompare(b.nome, 'pt'));
  const permChips = (sel, attr, fid) => PERMS.map(([k, n]) => '<button type="button" class="bf-tag' + (sel.includes(k) ? ' on' : '') + '" ' + attr + '="' + k + '"' + (fid ? ' data-fid="' + fid + '"' : '') + ' aria-pressed="' + sel.includes(k) + '">' + (sel.includes(k) ? '✓ ' : '') + esc(n) + '</button>').join('');
  const form = U.aberto ? '<div class="bf-form st-form"><h4>Atribuir funcionário</h4>'
    + (U.escolhido ? '<div class="bf-esc"><span class="bf-lbl">Pessoa</span><div class="bf-escp">' + avatar(U.nome) + '<span><b>' + esc(U.nome) + '</b><small>' + (perfilDe(U.nome) ? '@' + esc(perfilDe(U.nome).user) : '') + '</small></span><button type="button" class="cd-lnk" data-st="trocar">Trocar</button></div></div>'
      : '<label class="bf-busca">Utilizador do Xouty<input data-st-in="nome" value="' + esc(U.nome) + '" placeholder="procura pelo nome ou @" autocomplete="off"></label><ul class="bf-sug" id="st-sug">' + sugestoes(U.nome) + '</ul>')
    + '<label>Função<select data-st-in="funcao">' + S.funcoes.map(f => '<option value="' + f.id + '"' + (U.funcao === f.id ? ' selected' : '') + '>' + esc(f.nome) + ' · ' + esc(f.perms.map(permNome).join(', ') || 'sem permissões') + '</option>').join('') + '</select></label>'
    + '<div class="pt-2"><label>Início<input type="date" data-st-in="inicio" value="' + esc(U.inicio || hoje()) + '"></label><label>Fim<input type="date" data-st-in="fim" value="' + esc(U.fim) + '"' + (U.indet ? ' disabled' : '') + '></label></div>'
    + '<label class="pt-r"><input type="checkbox" data-st-in="indet"' + (U.indet ? ' checked' : '') + '> Indeterminado (sem data de fim)</label>'
    + (U.msg ? '<p class="bf-msg" role="alert">' + esc(U.msg) + '</p>' : '')
    + '<div class="pt-2"><button type="button" class="s-btn mint" data-st="add">Atribuir</button><button type="button" class="s-btn ghost" data-st="fechar">Cancelar</button></div></div>' : '';
  const gerir = U.gerir ? '<div class="st-funcs"><h4>Funções e permissões</h4>' + S.funcoes.map(f => '<div class="st-f"><div class="st-fh"><b>' + esc(f.nome) + '</b>' + (S.pessoas.some(p => p.funcao === f.id && estado(p) !== 'fim') ? '<small>em uso</small>' : '<button type="button" class="cd-lnk" data-st-frm="' + f.id + '">Apagar</button>') + '</div><div class="bf-tags">' + permChips(f.perms, 'data-st-fperm', f.id) + '</div></div>').join('')
    + '<div class="st-f nova"><div class="st-fh"><input data-st-in="nf" value="' + esc(U.nf) + '" placeholder="nova função, ex.: Bengaleiro" maxlength="24" aria-label="Nova função"></div><div class="bf-tags">' + permChips(U.nfp, 'data-st-nperm') + '</div><button type="button" class="s-btn ghost" data-st="novaf">Criar função</button></div></div>' : '';
  const linha = p => { const f = funcao(p.funcao), e = estado(p), g = perfilDe(p.nome);
    return '<li class="st-p ' + e + '">' + avatar(p.nome) + '<div class="bf-pc"><b>' + (g ? '<a href="' + (g.id === 'mari-costa' ? 'user.html' : 'user.html#u=' + g.id) + '">' + esc(p.nome) + '</a>' : esc(p.nome)) + ' <span class="st-fn">' + esc(f.nome) + '</span></b>'
      + '<span class="st-per">' + esc(periodo(p)) + ' · <i class="st-e ' + e + '">' + (e === 'ativo' ? 'ativo' : e === 'futuro' ? 'começa a ' + dTxt(p.inicio) : 'terminou') + '</i></span>'
      + '<span class="bf-pt">' + (f.perms.length ? f.perms.map(k => '<em>' + esc(permNome(k)) + '</em>').join('') : '<small>sem permissões no Xouty</small>') + '</span></div>'
      + '<span class="bf-pa">' + (e !== 'fim' ? '<button type="button" class="cd-lnk" data-st-fim="' + p.id + '">Terminar hoje</button>' : '') + '<button type="button" class="cd-lnk" data-st-rm="' + p.id + '">Tirar</button></span></li>'; };
  return '<div class="pt-card st" id="funcionarios"><div class="pt-ch"><h3>Funcionários da casa <span class="bf-n">' + S.pessoas.filter(p => estado(p) === 'ativo').length + '</span></h3>'
    + (U.aberto ? '' : '<button type="button" class="s-btn mint pt-novo" data-st="abrir">+ Atribuir funcionário</button>') + '</div>'
    + '<p class="bf-priv"><span>Utilizadores comuns do Xouty que trabalham cá. Cada um tem uma função, com início e fim (ou indeterminado), e só pode o que a função deixa. Quem tem "Ler QR na entrada" abre o <b>Modo porta</b> no menu da conta: o QR lido fica usado e a pessoa fica com check-in.</span></p>'
    + form
    + '<div class="bf-lbl">Equipa <button type="button" class="cd-lnk" data-st="gerir">' + (U.gerir ? 'Feito' : 'Gerir funções') + '</button></div>' + gerir
    + '<ul class="bf-l st-l">' + lista.map(linha).join('') + '</ul>'
    + '<p class="al-nota">Protótipo: a Mariana (a tua conta) está como Portaria, para experimentares o <a href="modo-porta.html">Modo porta</a>.</p></div>';
}
const refaz = foco => { const c = document.getElementById('funcionarios'); if (!c) return; c.outerHTML = card(); if (foco) { const n = document.querySelector('#funcionarios ' + foco); if (n) n.focus({preventScroll:true}); } };
const atribui = () => {
  const nome = String(U.nome || '').trim();
  if (!nome || !U.escolhido) { U.msg = 'Escolhe um utilizador do Xouty.'; return refaz(); }
  const inicio = U.inicio || hoje(), fim = U.indet ? '' : U.fim;
  if (!U.indet && !fim) { U.msg = 'Põe a data de fim ou marca "Indeterminado".'; return refaz(); }
  if (fim && fim < inicio) { U.msg = 'O fim não pode ser antes do início.'; return refaz(); }
  S.pessoas.push({id:nid(), nome, funcao:U.funcao, inicio, fim}); grava();
  Object.assign(U, {aberto:false, nome:'', escolhido:false, inicio:'', fim:'', indet:true, msg:''}); refaz();
};
document.addEventListener('click', ev => {
  const c = ev.target.closest('#funcionarios'); if (!c) return;
  const b = ev.target.closest('button'); if (!b) return;
  const a = b.dataset.st;
  if (a === 'abrir') { Object.assign(U, {aberto:true, nome:'', escolhido:false, msg:''}); return refaz('[data-st-in="nome"]'); }
  if (a === 'fechar') { U.aberto = false; U.msg = ''; return refaz(); }
  if (a === 'trocar') { Object.assign(U, {escolhido:false, nome:''}); return refaz('[data-st-in="nome"]'); }
  if (b.dataset.stSug) { Object.assign(U, {nome:b.dataset.stSug, escolhido:true, msg:''}); return refaz(); }
  if (a === 'add') return atribui();
  if (a === 'gerir') { U.gerir = !U.gerir; return refaz(); }
  if (b.dataset.stFperm) { const f = S.funcoes.find(x => x.id === b.dataset.fid), k = b.dataset.stFperm; if (f) { f.perms = f.perms.includes(k) ? f.perms.filter(x => x !== k) : f.perms.concat(k); grava(); } return refaz(); }
  if (b.dataset.stNperm) { const k = b.dataset.stNperm; U.nfp = U.nfp.includes(k) ? U.nfp.filter(x => x !== k) : U.nfp.concat(k); return refaz(); }
  if (a === 'novaf') { const n = String(U.nf || '').trim().slice(0, 24); if (!n || S.funcoes.some(f => norm(f.nome) === norm(n))) return; S.funcoes.push({id:'f' + nid(), nome:n.charAt(0).toUpperCase() + n.slice(1), perms:U.nfp.slice()}); U.nf = ''; U.nfp = ['qr']; grava(); return refaz(); }
  if (b.dataset.stFrm) { S.funcoes = S.funcoes.filter(f => f.id !== b.dataset.stFrm); grava(); return refaz(); }
  if (b.dataset.stFim) { const p = S.pessoas.find(x => x.id === b.dataset.stFim); if (p) { p.fim = hoje() < p.inicio ? p.inicio : hoje(); if (p.inicio > hoje()) p.inicio = hoje(); grava(); } return refaz(); }
  if (b.dataset.stRm) { S.pessoas = S.pessoas.filter(x => x.id !== b.dataset.stRm); grava(); return refaz(); }
});
document.addEventListener('input', ev => {
  const i = ev.target.closest('#funcionarios [data-st-in]'); if (!i) return;
  const k = i.dataset.stIn;
  if (k === 'nome') { U.nome = i.value; U.msg = ''; const l = document.getElementById('st-sug'); if (l) l.innerHTML = sugestoes(i.value); }
  if (k === 'nf') U.nf = i.value;
  if (k === 'inicio' || k === 'fim') U[k] = i.value;
});
document.addEventListener('change', ev => {
  const i = ev.target.closest('#funcionarios [data-st-in]'); if (!i) return;
  const k = i.dataset.stIn;
  if (k === 'funcao') U.funcao = i.value;
  if (k === 'inicio' || k === 'fim') U[k] = i.value;
  if (k === 'indet') { U.indet = i.checked; refaz(); }
});
document.addEventListener('keydown', ev => {
  if (ev.key !== 'Enter') return;
  const i = ev.target.closest('#funcionarios [data-st-in="nome"], #funcionarios [data-st-in="nf"]'); if (!i) return;
  ev.preventDefault();
  if (i.dataset.stIn === 'nome') { const f = document.querySelector('#st-sug [data-st-sug]'); if (f) f.click(); }
  else { const b = document.querySelector('#funcionarios [data-st="novaf"]'); if (b) b.click(); }
});

/* ---------- Modo porta (modo-porta.html): só para quem tem uma função ativa com "Ler QR na entrada" ---------- */
function porta(el){
  const EN = window.STREETFY_ENTRADAS, EU = EN ? EN.EU : 'Mariana Costa';
  let res = null, lidos = [];
  const ativa = () => minhas(EU).find(p => estado(p) === 'ativo' && (funcao(p.funcao).perms.includes('qr') || funcao(p.funcao).perms.includes('ofertas')));
  const desenha = foco => {
    const a = ativa(), todas = minhas(EU);
    if (!a) {
      el.innerHTML = '<div class="po-sem"><h2 class="s-h h2s">SEM ACESSO À <em>PORTA</em></h2><p>O Modo porta é só para quem a casa atribuiu uma função com "Ler QR na entrada" ou "Validar ofertas", dentro das datas.</p>'
        + (todas.length ? '<ul class="po-hist">' + todas.map(p => '<li><b>' + esc(funcao(p.funcao).nome) + ' · ' + esc(CASA.nome) + '</b><span>' + esc(periodo(p)) + ' · ' + (estado(p) === 'ativo' ? 'a função não lê QR' : estado(p) === 'futuro' ? 'ainda não começou' : 'já terminou') + '</span></li>').join('') + '</ul>' : '')
        + '<p class="al-nota">Protótipo: no <a href="portal.html#parceiro">Portal › Funcionários da casa</a> atribui-te a Portaria ou a Segurança.</p></div>';
      return;
    }
    const f = funcao(a.funcao), daCasa = EN ? Object.values(JSON.parse(localStorage.getItem('streetfy:entradas') || '{}')).filter(e => e.local === CASA.k) : [];
    el.innerHTML = '<div class="po"><div class="po-quem">' + avatar(EU) + '<div><b>' + esc(f.nome) + ' · ' + esc(CASA.nome) + '</b><span>' + esc(EU) + ' · ' + esc(periodo(a)) + '</span></div></div>'
      + '<div class="po-ler"><label for="po-c">Código do QR' + (f.perms.includes('ofertas') ? ' (entrada XY-… ou voucher OF-…)' : '') + '</label><div class="pt-portaf"><input id="po-c" data-po-in placeholder="XY-…" autocapitalize="characters" autocomplete="off"><button type="button" class="s-btn ink" data-po="ler">Ler</button></div>'
      + '<small>No telemóvel da porta, a câmara lê o QR. No protótipo escreves o código' + (f.perms.includes('lista') ? ' ou tocas em "Ler" num nome da lista.' : '.') + '</small></div>'
      + (res ? '<div class="po-res ' + (res.ok ? 'ok' : 'erro') + '" role="status"><b>' + esc(res.t) + '</b><span>' + esc(res.s) + '</span></div>' : '')
      + (f.perms.includes('lista') ? '<h3 class="po-t">Listas de hoje · ' + esc(CASA.nome) + '</h3>' + (daCasa.length ? '<ul class="po-l">' + daCasa.sort((x, y) => (x.usado ? 1 : 0) - (y.usado ? 1 : 0) || x.nome.localeCompare(y.nome, 'pt')).map(e => '<li class="' + (e.usado ? 'usado' : '') + '">' + avatar(e.nome) + '<div><b>' + esc(e.nome) + '</b><span>' + esc(e.listaNome) + ' · ' + esc(e.c) + '</span></div>' + (e.usado ? '<i>entrou ' + EN.hhmm(e.usado) + (e.por ? ' · ' + esc(e.por) : '') + '</i>' : '<button type="button" class="s-btn mint" data-po-c="' + esc(e.c) + '">Ler</button>') + '</li>').join('') + '</ul>' : '<p class="al-nota">Ainda não há QR emitidos para listas desta casa. Abre uma lista no portal para os nomes receberem QR.</p>') : '<p class="al-nota">A tua função lê QR, mas não vê as listas.</p>')
      + (lidos.length ? '<h3 class="po-t">Lidos por ti agora</h3><ul class="po-hist">' + lidos.map(r => '<li class="' + (r.ok ? 'ok' : 'erro') + '"><b>' + esc(r.t) + '</b><span>' + esc(r.h) + '</span></li>').join('') + '</ul>' : '') + '</div>';
    if (foco) { const n = el.querySelector(foco); if (n) n.focus(); }
  };
  const le = c => {
    const a = ativa(); if (!a || !EN) return desenha();
    const agora = EN.hhmm(Date.now()), pf = funcao(a.funcao).perms;
    if (/^OF-/i.test(String(c).trim())) {
      const O = window.STREETFY_OFERTAS;
      res = !pf.includes('ofertas') ? {ok:false, t:'Sem permissão', s:'A tua função não valida ofertas.'} : O ? O.validar(c, EU + ' · ' + funcao(a.funcao).nome) : {ok:false, t:'Ofertas indisponíveis', s:''};
      lidos.unshift({ok:res.ok, t:res.t, h:agora}); lidos = lidos.slice(0, 8); return desenha('[data-po-in]');
    }
    if (!pf.includes('qr')) { res = {ok:false, t:'Sem permissão', s:'A tua função não lê QR de entrada.'}; lidos.unshift({ok:false, t:res.t, h:agora}); return desenha('[data-po-in]'); }
    const e = EN.de(c);
    if (!e) res = {ok:false, t:'QR inválido', s:'Este código não está em nenhuma lista.'};
    else if (e.local !== CASA.k) res = {ok:false, t:'QR de outra casa', s:e.nome + ' · ' + e.localNome + '. Não serve aqui.'};
    else { const r = EN.lerQR(e.c, EU + ' · ' + funcao(a.funcao).nome); res = r.ok ? {ok:true, t:'Pode entrar: ' + e.nome, s:e.listaNome + ' · QR usado às ' + EN.hhmm(r.e.usado) + ' · check-in feito'} : r.motivo === 'fechada' ? {ok:false, t:'Lista fechada', s:e.listaNome + ' fechou às ' + EN.hhmm(e.fechaEm) + '. ' + e.nome + ' já não entra por lista.'} : {ok:false, t:'QR já usado', s:e.nome + ' entrou às ' + EN.hhmm(e.usado) + (e.por ? ' (' + e.por + ')' : '') + '. Não entra outra vez.'}; }
    lidos.unshift({ok:res.ok, t:res.t, h:agora}); lidos = lidos.slice(0, 8);
    desenha('[data-po-in]');
  };
  el.addEventListener('click', ev => { const b = ev.target.closest('[data-po],[data-po-c]'); if (!b) return; if (b.dataset.poC) return le(b.dataset.poC); const i = el.querySelector('[data-po-in]'); le(i ? i.value : ''); });
  el.addEventListener('keydown', ev => { if (ev.key === 'Enter' && ev.target.matches('[data-po-in]')) { ev.preventDefault(); le(ev.target.value); } });
  window.addEventListener('storage', ev => { if (ev.key === K || ev.key === 'streetfy:entradas') desenha(); });
  desenha('[data-po-in]');
}
window.STREETFY_FUNC = {card, pode, minhas, porta, CASA};
const el = document.querySelector('[data-porta]'); if (el) porta(el);
})();
