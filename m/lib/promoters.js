/* Xouty · promoters.js — grelha de promoters (promoters.html, [data-promoters]) e perfil do promoter (promoter.html#p=<id>, [data-promoter]).
   Cada promoter promove festas do catálogo: as escolhidas por ele (ids) e, até 6, as festas da cidade dele nos estilos que indica,
   pelas mais importantes. Pessoas fictícias; eventos e lugares reais. No site real: tabela promoter + indicacao (R66–R72). */
(function(){
'use strict';
const C = window.STREETFY_CATALOGO; if (!C) return;
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
const fmt = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const NIVEL = {cidade:'Promoter da cidade', bairro:'Promoter do bairro', rua:'Promoter da rua'};
const P = [
 {id:'rita-m', nome:'Rita M.', foto:'retrato', cidade:'lisboa', nivel:'cidade', nota:'4,7', resp:212, seg:2340, pres:612, valeu:94, estilos:['techno', 'house', 'kizomba'], bio:'Techno e house de quinta a sábado. Só indico o que eu própria vou.', ids:['l4', 'l3', 'l11'], comissao:['l4']},
 {id:'tiago-r', nome:'Tiago R.', foto:'pink', cidade:'lisboa', nivel:'bairro', nota:'4,4', resp:96, seg:410, pres:138, valeu:89, estilos:['rooftop', 'indie', 'disco'], bio:'Pôr do sol no Bairro Alto e concertos pequenos. Fila curta é comigo.', ids:['l10', 'l8', 'l13'], comissao:['l13']},
 {id:'ines-c', nome:'Inês C.', foto:'alfama', cidade:'lisboa', nivel:'bairro', nota:'4,5', resp:81, seg:380, pres:122, valeu:92, estilos:['fado', 'jazz', 'concertos'], bio:'Fado de verdade e jazz até tarde. Jantar com música, sem armadilhas para turistas.', ids:['l7', 'l5', 'l1'], comissao:[]},
 {id:'marco-s', nome:'Marco S.', foto:'bairro', cidade:'lisboa', nivel:'rua', nota:'4,1', resp:22, seg:86, pres:19, valeu:84, estilos:['cocktails', 'bar a bar'], bio:'Bar a bar no Cais do Sodré. Começo na Pensão Amor e acabo onde a noite quiser.', ids:['l2', 'l9'], comissao:['l2']},
 {id:'joana-p', nome:'Joana P.', foto:'pgaleria', cidade:'porto', nivel:'cidade', nota:'4,6', resp:174, seg:2110, pres:540, valeu:93, estilos:['disco', 'house', 'techno'], bio:'Galerias de Paris de olhos fechados. Plano B, Passos Manuel e o que abrir de novo.', ids:['p1', 'p15', 'p16'], comissao:['p1']},
 {id:'duarte-f', nome:'Duarte F.', foto:'pponte', cidade:'porto', nivel:'bairro', nota:'4,3', resp:58, seg:350, pres:104, valeu:88, estilos:['techno', 'kizomba', 'rock'], bio:'Gare às sextas, Pérola Negra ao sábado. Rock no Hard Club quando há.', ids:['p6', 'p5', 'p3'], comissao:[]},
 {id:'sofia-l', nome:'Sofia L.', foto:'noite', cidade:'coimbra', nivel:'bairro', nota:'4,4', resp:44, seg:320, pres:97, valeu:90, estilos:['música', 'festa', 'concertos'], bio:'Coimbra estudante e não só: concertos, festas e a noite da Baixa.', ids:[], comissao:[]},
 {id:'miguel-a', nome:'Miguel A.', foto:'tejo', cidade:'faro', zona:['faro', 'lagos', 'portimao', 'albufeira', 'loule', 'olhao', 'tavira'], nivel:'rua', nota:'4,2', resp:18, seg:120, pres:31, valeu:86, estilos:['música', 'festa'], bio:'Algarve fora da época: o que ainda mexe em Faro, Lagos e Portimão.', ids:[], comissao:[]},
 {id:'ana-r', nome:'Ana R.', foto:'club', cidade:'braga', zona:['braga', 'guimaraes', 'barcelos', 'vila-nova-de-famalicao'], nivel:'rua', nota:'4,3', resp:27, seg:140, pres:44, valeu:87, estilos:['música', 'festa', 'concertos'], bio:'Braga e Guimarães: salas pequenas, DJs locais e festas de associação.', ids:[], comissao:[]},
 {id:'rui-v', nome:'Rui V.', foto:'dj', cidade:'funchal', nivel:'rua', nota:'4,0', resp:12, seg:64, pres:15, valeu:83, estilos:['música', 'festa'], bio:'Funchal à noite: Zona Velha, concertos e festas de praia.', ids:[], comissao:[]}
];
const RETRATO = p => 'img/' + p.foto + '.jpg';   /* as fotos iniciais do site (em img/promoters/ ficaram os retratos de IA e os desenhos, sem uso) */
const FOTO_PESSOA = nome => 'img/pessoas/' + nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\.$/, '').replace(/[^a-z]+/g, '-').replace(/-$/, '') + '.jpg';
const NOME_CID = id => { const c = ((window.BORA_FILTROS || {}).PAISES || [{cidades:[]}])[0].cidades.find(x => x.id === id); return c ? c.nome : cap(id); };
const F = window.BORA_FILTROS || {};
const ativo = i => (i._ks || []).length > 0 && (!F.grupoDe || F.grupoDe(i, F.AGORA(), [0, 1, 2, 3, 4, 5, 6]) !== 'rolou');   /* o que já acabou não conta (regra das 4 h) */
const naZona = (p, i) => (p.zona || [p.cidade]).includes(i.cidade);
const imp = i => (+i.vao || 0) * 2 + (+i.aqui || 0) + (i.img ? 1 : 0);
const segueLugar = i => { try { return localStorage.getItem('segue:' + C.lugarKey(i)) === '1'; } catch (e) { return false; } };
function festasDe(p){
  const porId = new Map(C.itens.map(i => [i.id, i]));
  const esc1 = p.ids.map(id => porId.get(id)).filter(i => i && ativo(i));
  const extra = C.itens.filter(i => naZona(p, i) && ativo(i) && !p.ids.includes(i.id)
      && ((i.tipos || []).some(t => t === 'festa' || t === 'clube' || t === 'concerto')) && (p.estilos.includes(i.estilo) || (i.tipos || []).includes('festa')))
    .sort((a, b) => imp(b) - imp(a));
  let out = esc1.concat(extra);
  if (out.length < 3) {   /* fontes sem tipo: música, dança, espetáculo e festa da cidade */
    const ja = new Set(out.map(i => i.id));
    out = out.concat(C.itens.filter(i => naZona(p, i) && ativo(i) && !ja.has(i.id) && /m[uú]sica|festa|dan[cç]a|espet|concert|dj|party|halloween|noite/i.test((i.estilo || '') + ' ' + (i.tag || '') + ' ' + (i.titulo || ''))).sort((a, b) => imp(b) - imp(a)));
  }
  return out.slice(0, 6);
}
const hrefEv = i => 'bilhete.html#lugar=' + encodeURIComponent(C.lugarKey(i)) + '&evento=' + encodeURIComponent(i.id);
const quando = i => { const k = Math.min(...(i._ks || [0])); if (k === 0) return 'hoje'; if (k === 1) return 'amanhã'; const d = new Date(); d.setDate(d.getDate() + k); return ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'][d.getDay()] + ' ' + d.getDate(); };
const precoTxt = i => i.preco === 0 ? 'entrada livre' : (typeof i.preco === 'number' ? '€' + i.preco : (i.preco || ''));
let segue = {}; try { segue = JSON.parse(localStorage.getItem('streetfy:segue-promoters') || '{}'); } catch (e) {}
const guarda = () => { try { localStorage.setItem('streetfy:segue-promoters', JSON.stringify(segue)); } catch (e) {} };

/* galeria do promoter: fotos das festas que promove + fotos das noites dele (no site real: as que ele publica, com crédito) */
const NOITES = ['club', 'dj', 'lux', 'noite', 'pink', 'cocktail', 'shots', 'tram', 'bairro', 'alfama', 'mesa', 'lx'];
const imgDe = i => /^(https?:|data:|img\/)/.test(i.img || '') ? i.img : 'img/' + i.img + '.jpg';
function galeria(p, f){
  const fotos = f.filter(i => i.img).map(i => ({url:imgDe(i), leg:i.titulo + (i.lugar ? ' · ' + i.lugar : '')}));
  const h = p.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  for (let k = 0; fotos.length < 8 && k < NOITES.length; k++) { const n = NOITES[(h + k * 5) % NOITES.length], u = 'img/' + n + '.jpg'; if (!fotos.some(x => x.url === u)) fotos.push({url:u, leg:'Noite com ' + p.nome.split(' ')[0] + ' · ' + NOME_CID(p.cidade)}); }
  return fotos.slice(0, 8).map(x => '<figure class="p-foto"><div style="background-image:url(' + esc(x.url) + ')"></div><figcaption>' + esc(x.leg) + '</figcaption></figure>').join('');
}

/* ---------- grelha ---------- */
function grelha(el){
  /* filtro no modelo A (filtro-a.js): cidade no quadro do lugar, nível nas pílulas, estilo como pergunta */
  let filtro = 'todas', passos = [];
  const FA = window.STREETFY_FILTRO_A, st = FA ? FA.novo() : {top:null, sel:{}, feito:{}, todos:false}, ui = {aberto:false, passo:''};
  const NIV_P = [['cidade', 'Da cidade'], ['bairro', 'Do bairro'], ['rua', 'Da rua']];
  const desenha = () => {
    const cids = ['todas'].concat([...new Set(P.map(p => p.cidade))]);
    const naCid = P.filter(p => filtro === 'todas' || p.cidade === filtro), doNivel = naCid.filter(p => !st.top || p.nivel === st.top);
    const est = {}; doNivel.forEach(p => p.estilos.forEach(x => { est[x] = (est[x] || 0) + 1; }));
    passos = st.top ? [{k:'est', pq:'Que estilo?', ops:Object.keys(est).sort((a, b) => est[b] - est[a]).slice(0, 10).map(x => [x, cap(x), est[x]])}] : [];
    const lista = doNivel.filter(p => !(st.sel.est || []).length || st.sel.est.some(x => p.estilos.includes(x)));
    const nomeC = c => c === 'todas' ? 'Todas as cidades' : NOME_CID(c);
    el.innerHTML = (FA ? '<div class="fa pr-fa">' + FA.onde({pais:{id:'pt', nome:'Portugal'}, cid:{id:filtro, nome:nomeC(filtro)}, sub:naCid.length + (naCid.length === 1 ? ' promoter' : ' promoters') + ' nesta zona', paises:[{id:'pt', nome:'Portugal'}], cidades:cids.map(c => ({id:c, nome:nomeC(c), n:P.filter(p => c === 'todas' || p.cidade === c).length}))}, ui)
        + FA.painel(st, {tudo:'Todos', topo:NIV_P.map(([v, n]) => [v, n, naCid.filter(p => p.nivel === v).length]), passos}) + '</div>' : '')
      + '<div class="pr-grid">' + (lista.length ? '' : '<p class="cm-vazio">Nenhum promoter com estes filtros. Toca numa etiqueta para a mudar.</p>') + lista.map(p => { const f = festasDe(p); return '<a class="pr-card" href="promoter.html#p=' + p.id + '">'
        + '<div class="pr-foto" style="background-image:url(' + RETRATO(p) + ')"><span class="pr-nivel ' + p.nivel + '">' + NIVEL[p.nivel] + '</span></div>'
        + '<button type="button" class="pr-seguir' + (segue[p.id] ? ' on' : '') + '" data-seg="' + p.id + '" aria-pressed="' + !!segue[p.id] + '">' + (segue[p.id] ? 'A seguir ✓' : 'Seguir') + '</button>'
        + '<div class="pr-bd"><h3>' + esc(p.nome) + '</h3><p class="pr-num">★ ' + p.nota + ' · ' + fmt(p.seg) + ' seguidores · ' + esc(NOME_CID(p.cidade)) + '</p>'
        + '<p class="pr-est">' + p.estilos.map(cap).join(' · ') + '</p>'
        + '<div class="pr-prox"><small>Promove · ' + f.length + (f.length === 1 ? ' festa' : ' festas') + '</small>' + (f.slice(0, 2).map(i => '<span><b>' + esc(i.titulo) + '</b> · ' + esc(quando(i)) + (i.hora ? ' ' + esc(i.hora.replace(/^\D+\s/, '')) : '') + '</span>').join('') || '<span>sem festas esta semana</span>') + '</div>'
        + '<span class="pr-ver">Ver perfil ›</span></div></a>'; }).join('') + '</div>';
  };
  el.addEventListener('click', ev => {
    const sg = ev.target.closest('[data-seg]'); if (sg) { ev.preventDefault(); ev.stopPropagation(); const id = sg.dataset.seg; if (segue[id]) delete segue[id]; else segue[id] = 1; guarda(); desenha(); return; }
    const b = ev.target.closest('[data-fa]'); if (!b || !FA || b.disabled) return;
    const o = FA.acaoOnde(ui, b); if (o && o.cid) { filtro = o.cid; st.sel = {}; st.feito = {}; }
    if (o || FA.acao(st, b, passos)) desenha(); });
  desenha();
}

/* ---------- lista de convidados (R97–R99) ----------
   Quem quer entrar pede ("Quero entrar"); o promoter aceita ou recusa e pode marcar favoritos. Favorito do promoter põe o nome
   direto ("Pôr o meu nome"), sem esperar. No protótipo, o estado vive neste aparelho; o site real guarda-o na conta. */
const LK = 'streetfy:listas';
let LS = {}; try { LS = JSON.parse(localStorage.getItem(LK) || '{}'); } catch (e) {}
const gravaL = () => { try { localStorage.setItem(LK, JSON.stringify(LS)); } catch (e) {} };
const doP = pid => (LS[pid] = LS[pid] || {pedidos:{}, fav:{}, pessoas:{}});
const PESSOAS = ['Bruna T.', 'Hugo M.', 'Leonor S.', 'Kiko R.', 'Mariana C.', 'Nuno P.', 'Carla V.', 'André L.', 'Sara D.', 'Tomás F.'];
const comLista = (p, f) => f.filter(i => (i.tipos || []).some(t => t === 'festa' || t === 'clube') || /festa|dj|club|noite|party/i.test((i.titulo || '') + ' ' + (i.estilo || ''))).slice(0, 5).concat(f).filter((v, k, a) => a.indexOf(v) === k).slice(0, 5);
const vagas = i => 20 + ((String(i.id).split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % 40);
/* pedidos de outras pessoas, fixos por evento, para o promoter ter quem aceitar */
function pedidosDemo(p, i){
  const st = doP(p.id); const k = String(i.id);
  if (!st.pessoas[k]) { const h = k.split('').reduce((a, c) => a + c.charCodeAt(0), 0); st.pessoas[k] = [0, 1, 2].map(n => ({nome: PESSOAS[(h + n * 3) % PESSOAS.length], estado: n === 2 ? 'aceite' : 'pendente'})); gravaL(); }
  return st.pessoas[k];
}
function acaoLista(d){
  const st = doP(d.pid);
  if (d.lc === 'seguir-quero') { const i0 = C.itens.find(x => String(x.id) === d.ev); if (i0) { try { localStorage.setItem('segue:' + C.lugarKey(i0), '1'); } catch (e) {} } st.pedidos[d.ev] = st.fav.eu ? 'na-lista' : 'pendente'; }
  if (d.lc === 'quero') st.pedidos[d.ev] = st.fav.eu ? 'na-lista' : 'pendente';
  if (d.lc === 'cancelar') delete st.pedidos[d.ev];
  if (d.lc === 'eu-aceitar') st.pedidos[d.ev] = 'aceite';
  if (d.lc === 'eu-recusar') st.pedidos[d.ev] = 'recusado';
  if (d.lc === 'fav') { if (st.fav[d.quem]) delete st.fav[d.quem]; else st.fav[d.quem] = 1; }
  if (d.lc === 'aceitar' || d.lc === 'recusar') { const pe = (st.pessoas[d.ev] || [])[+d.n]; if (pe) pe.estado = d.lc === 'aceitar' ? 'aceite' : 'recusado'; }
  gravaL();
}
function listaHtml(p, f, modo){
  const st = doP(p.id), ev = comLista(p, f), fav = !!st.fav.eu;
  const abas = '<div class="lc-abas" role="tablist"><a role="tab" aria-selected="' + (modo === 'eu') + '" class="' + (modo === 'eu' ? 'on' : '') + '" href="#p=' + p.id + '&lista=1">Quero entrar</a><a role="tab" aria-selected="' + (modo === 'promoter') + '" class="' + (modo === 'promoter' ? 'on' : '') + '" href="#p=' + p.id + '&lista=1&modo=promoter">Vista do promoter</a></div>';
  let h = '<section class="s-sec tight"><div class="s-wrap"><p class="s-eyebrow">Lista de convidados</p><h2 class="s-h h2s" style="margin-bottom:10px">NA LISTA <em>DE ' + esc(p.nome.split(' ')[0].toUpperCase()) + '</em></h2>'
    + '<p class="s-lead" style="font-size:15px;margin:0 0 16px;max-width:64ch">' + (modo === 'eu' ? (fav ? 'És favorito de ' + esc(p.nome) + ': pões o teu nome na lista sem esperar.' : 'Pede para entrar; ' + esc(p.nome) + ' aceita ou recusa. Quem é favorito põe o nome direto.') : 'O que ' + esc(p.nome) + ' vê: pedidos por evento, aceitar ou recusar, e marcar favoritos. Favorito põe o nome sozinho nas próximas listas.') + '</p>' + abas;
  if (!ev.length) return h + '<p class="p-vazio" style="margin-top:16px">Sem listas abertas esta semana.</p></div></section>';
  h += '<div class="lc-lista">' + ev.map(i => {
    const k = String(i.id), meu = st.pedidos[k], dem = pedidosDemo(p, i), noLista = dem.filter(x => x.estado === 'aceite').length + (meu === 'aceite' || meu === 'na-lista' ? 1 : 0), resta = Math.max(0, vagas(i) - noLista);
    const cab = '<div class="lc-cab"><div><span class="p-ev-q">' + esc(quando(i)) + (i.hora ? ' · ' + esc(i.hora) : '') + '</span><h3>' + esc(i.titulo) + '</h3><p>' + esc(i.lugar || '') + (precoTxt(i) ? ' · ' + esc(precoTxt(i)) : '') + ' · lista até 30 min antes · <b>restam ' + resta + '</b></p></div><a class="lc-ver" href="' + esc(hrefEv(i)) + '">evento ›</a></div>';
    if (modo === 'eu') {
      const b = (lc, t, cls) => '<a href="#" class="s-btn ' + cls + '" data-lc="' + lc + '" data-pid="' + p.id + '" data-ev="' + esc(k) + '">' + t + '</a>';
      const est = meu === 'na-lista' || meu === 'aceite' ? '<span class="lc-est ok">Estás na lista ✓' + (meu === 'na-lista' ? ' · como favorito' : ' · aceite por ' + esc(p.nome.split(' ')[0])) + '</span>' + b('cancelar', 'Tirar o nome', 'ghost')
        : meu === 'pendente' ? '<span class="lc-est">Pedido enviado · à espera de ' + esc(p.nome.split(' ')[0]) + '</span>' + b('cancelar', 'Cancelar', 'ghost')
        : meu === 'recusado' ? '<span class="lc-est nao">' + esc(p.nome.split(' ')[0]) + ' não aceitou desta vez</span>'
        : (resta ? (i.soSeguidores && !segueLugar(i) ? b('seguir-quero', 'Seguir ' + esc(i.lugar || 'a casa') + ' e pedir', 'pink') : b('quero', fav ? 'Pôr o meu nome' : 'Quero entrar', fav ? 'mint' : 'pink')) : '<span class="lc-est nao">Lista cheia</span>');
      return '<article class="lc-ev">' + cab + '<div class="lc-acao">' + est + '</div></article>';
    }
    /* vista do promoter: tu (se pediste) + os outros pedidos */
    const pessoa = (nome, estado, quem, acoes) => '<li class="lc-p"><span class="lc-av">' + esc(quem === 'eu' ? 'TU' : nome.split(' ').map(x => x[0]).join('').slice(0, 2)) + '</span><b>' + esc(nome) + (st.fav[quem] ? ' <span class="lc-fav on" title="Favorito">★</span>' : '') + '</b><span class="lc-st ' + estado + '">' + ({pendente:'pediu', aceite:'na lista', 'na-lista':'na lista · favorito', recusado:'recusado'})[estado] + '</span><span class="lc-acs">' + acoes + '</span></li>';
    const ac = (lc, t, extra) => '<a href="#" class="lc-b ' + lc + '" data-lc="' + lc + '" data-pid="' + p.id + '" data-ev="' + esc(k) + '"' + extra + '>' + t + '</a>';
    let lis = '';
    if (meu) lis += pessoa('Tu (este aparelho)', meu, 'eu', (meu === 'pendente' ? ac('eu-aceitar', 'Aceitar', '') + ac('eu-recusar', 'Recusar', '') : '') + ac('fav', st.fav.eu ? '★ Favorito' : '☆ Favorito', ' data-quem="eu"'));
    dem.forEach((x, n) => { lis += pessoa(x.nome, x.estado, x.nome, (x.estado === 'pendente' ? ac('aceitar', 'Aceitar', ' data-n="' + n + '"') + ac('recusar', 'Recusar', ' data-n="' + n + '"') : '') + ac('fav', st.fav[x.nome] ? '★ Favorito' : '☆ Favorito', ' data-quem="' + esc(x.nome) + '"')); });
    return '<article class="lc-ev">' + cab + '<ul class="lc-pessoas">' + lis + '</ul></article>';
  }).join('') + '</div>'
    + (modo === 'promoter' ? '<p class="al-nota" style="margin-top:12px">Favorito vale para todas as listas de ' + esc(p.nome) + '. Na conta real só o promoter vê esta vista; aqui está aberta para testar o fluxo.</p>' : (st.fav.eu ? '' : '<p class="al-nota" style="margin-top:12px">Para testar o favorito: abre "Vista do promoter", pede para entrar num evento e marca-te com ☆.</p>'))
    + '</div></section>';
  return h;
}

/* ---------- perfil ---------- */
function perfil(el){
  const desenha = () => {
    const q = new URLSearchParams(location.hash.slice(1)), id = q.get('p') || P[0].id, p = P.find(x => x.id === id) || P[0], f = festasDe(p), s = !!segue[p.id], lista = q.get('lista') === '1', modo = q.get('modo') === 'promoter' ? 'promoter' : 'eu';
    document.title = 'Xouty · ' + p.nome + ' · ' + NIVEL[p.nivel];
    const url = location.origin + location.pathname + '#p=' + p.id;
    el.innerHTML = '<section class="p-hero perfil pr-hero"><div class="s-bg" style="background-image:url(img/' + p.foto + '.jpg)"></div><div class="s-tint"></div><div class="s-wrap">'
      + '<div class="crumbs"><a href="index.html">Xouty</a> › <a href="promoters.html#lista">Promoters</a> › <span>' + esc(p.nome) + '</span></div>'
      + '<div class="pr-cab"><div class="pr-av" style="background-image:url(' + RETRATO(p) + ')"></div><div><h1 class="s-h" style="font-size:clamp(52px,8vw,110px)">' + esc(p.nome.toUpperCase()).replace(/ ([^ ]+)$/, ' <em>$1</em>') + '</h1>'
      + '<span class="pr-nivel ' + p.nivel + '">' + NIVEL[p.nivel] + '</span> <span class="p-meta">' + esc(NOME_CID(p.cidade)) + ' · ' + p.estilos.map(cap).join(', ') + '</span></div></div>'
      + '<p class="s-lead" style="margin-top:14px;max-width:56ch">' + esc(p.bio) + '</p>'
      + '<div class="p-acoes"><a class="s-btn ' + (s ? 'mint' : 'ghost') + '" href="#" data-seguir-p="' + p.id + '" aria-pressed="' + s + '">' + (s ? 'A seguir ✓' : 'Seguir') + '</a><a class="s-btn ' + (lista ? 'mint' : 'ghost') + '" href="#p=' + p.id + (lista ? '' : '&lista=1') + '">' + (lista ? '← Festas promovidas' : 'Lista de convidados') + '</a><a class="s-btn ghost" href="' + esc(url) + '" data-partilhar-p data-titulo="' + esc(p.nome) + '">Compartilhar</a></div>'
      + '<div class="p-nums">' + [['nota', '★ ' + p.nota, 'nota · ' + p.resp + ' respostas de quem foi'], ['seguidores', fmt(p.seg + (s ? 1 : 0)), 'seguidores' + (s ? ' · tu incluído' : '')], ['presencas', p.pres, 'presenças verificadas · 30 dias'], ['valeu', p.valeu + '%', 'dizem que valeu']].map(([t, b, sp]) => '<button type="button" class="p-num u-num" data-pn="' + t + '" data-pn-id="' + p.id + '"><b>' + b + '</b><span>' + sp + ' ›</span></button>').join('') + '</div></div></section>'
      + (lista ? listaHtml(p, f, modo) : '<section class="s-sec tight"><div class="s-wrap"><div class="p-grid"><div><p class="s-eyebrow">O que promove</p><h2 class="s-h h2s" style="margin-bottom:18px">FESTAS <em>PROMOVIDAS</em></h2>'
      + (f.length ? f.map(i => '<a class="p-ev pr-ev" href="' + esc(hrefEv(i)) + '">' + (window.STREETFY_ACOES ? window.STREETFY_ACOES.coracao(i.id) : '') + '<div class="p-ev-h"><span class="p-ev-q">' + esc(quando(i)) + (i.hora ? ' · ' + esc(i.hora) : '') + '</span>' + (p.comissao.includes(i.id) ? '<span class="pr-com">comissão</span>' : '<span class="pr-com sem">sem comissão</span>') + '</div>'
          + '<h3>' + esc(i.titulo) + '</h3><p>' + esc(i.lugar || '') + (i.estilo ? ' · ' + esc(cap(i.estilo)) : '') + (precoTxt(i) ? ' · ' + esc(precoTxt(i)) : '') + (i.vao ? ' · ' + i.vao + ' vão' : '') + '</p>' + (i.origem === 'bot' ? '<span class="s-via">via ' + esc(i.fonte) + '</span>' : '') + '<span class="p-ev-abrir">bilhete ›</span></a>').join('')
          : '<p class="p-vazio">Sem festas marcadas esta semana.</p>')
      + '<p class="s-eyebrow" style="margin-top:28px">Galeria</p><h2 class="s-h h2s" style="margin-bottom:14px">FOTOS DAS <em>NOITES</em></h2><div class="p-fotos pr-galeria" data-p="fotos">' + galeria(p, f) + '</div>'
      + '</div><div><p class="s-eyebrow">Como funciona</p><div class="inc" style="margin-top:12px"><div><h4>Regra da casa</h4><ul><li>O promoter só indica festas do catálogo; não inventa eventos.</li><li>Comissão declarada pelo parceiro aparece sempre no cartão (R71). O bilhete pelo link dele custa o mesmo.</li><li>A nota só vem de quem esteve lá, com check-in.</li><li>Sobe e desce de nível sozinho: seguidores, presenças e nota dos últimos 30 dias.</li></ul></div></div>'
      + '<p class="s-eyebrow" style="margin-top:26px">Outros promoters</p><div class="pr-outros">' + P.filter(x => x.id !== p.id && x.cidade === p.cidade).concat(P.filter(x => x.cidade !== p.cidade)).slice(0, 4).map(x => '<a href="promoter.html#p=' + x.id + '"><span class="pr-av mini" style="background-image:url(' + RETRATO(x) + ')"></span><b>' + esc(x.nome) + '</b><small>' + NIVEL[x.nivel] + ' · ' + esc(NOME_CID(x.cidade)) + '</small></a>').join('') + '</div>'
      + '</div></div></div></section>');
  };
  el.addEventListener('click', ev => {
    const pn = ev.target.closest('[data-pn]'); if (pn) { painelP(P.find(x => x.id === pn.dataset.pnId), pn.dataset.pn); return; }
    const a = ev.target.closest('[data-lc]'); if (a) { ev.preventDefault(); acaoLista(a.dataset); desenha(); return; }
    const s = ev.target.closest('[data-seguir-p]'); if (s) { ev.preventDefault(); const id = s.dataset.seguirP; if (segue[id]) delete segue[id]; else segue[id] = 1; guarda(); desenha(); return; }
    const sh = ev.target.closest('[data-partilhar-p]'); if (sh) { ev.preventDefault(); const t = sh.dataset.titulo + ' · promoter no Xouty'; if (navigator.share) navigator.share({title:t, url:sh.href}).catch(() => {}); else window.open('https://wa.me/?text=' + encodeURIComponent(t + ' · ' + sh.href), '_blank', 'noopener'); }
  });
  window.addEventListener('hashchange', () => { desenha(); window.scrollTo({top:0}); });
  desenha();
}
/* painel dos números do perfil do promoter (nota, seguidores, presenças, valeu) */
const GENTE = [['mari-costa', 'Mariana Costa', 'retrato'], ['leonor-s', 'Leonor Santos', 'tram'], ['hugo-m', 'Hugo Martins', 'dj'], ['ines-c', 'Inês Carvalho', 'alfama'], ['sara-d', 'Sara Dias', 'noite'], ['bruna-t', 'Bruna Teixeira', 'cocktail']];
const semente = id => { let h = 7; for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 9973; return h; };
const FRASES = [['Indicou e acertou. Fila curta, som ótimo.', 5], ['A lista funcionou na porta, entrei sem stress.', 5], ['Boa festa, mas o bar estava lento.', 4], ['Exatamente o que prometeu. Volto.', 5], ['Ambiente bom; acabou mais cedo do que esperava.', 3]];
const MOTIVOS = [['Música', .92], ['Ambiente', .84], ['Entrada rápida', .71], ['Preço justo', .58], ['Bar', .43]];
function painelP(p, tipo){
  if (!p) return;
  let seg = 0; try { seg = JSON.parse(localStorage.getItem('streetfy:segue-promoters') || '{}')[p.id] ? 1 : 0; } catch (e) {}
  const h = semente(p.id), fs = festasDe(p).slice(0, 6);
  const pessoa = g => '<a class="u-pn-l" href="user.html#u=' + g[0] + '"><span class="u-pn-av redondo" style="background-image:url(img/' + g[2] + '.jpg)"></span><b>' + esc(g[1]) + '</b><small>@' + g[0].replace('-', '.') + '</small></a>';
  const evL = (i, txt) => '<a class="u-pn-l" href="' + esc(hrefEv(i)) + '"><span class="u-pn-av" style="background-image:url(' + esc(imgDe(i)) + ')"></span><b>' + esc(i.titulo) + '</b><small>' + txt + '</small></a>';
  const barra = (n, pct) => '<div class="pr-pn-b"><span>' + esc(n) + '</span><i><em style="width:' + Math.round(pct * 100) + '%"></em></i><b>' + Math.round(pct * 100) + '%</b></div>';
  let titulo = '', total = '', corpo = '';
  if (tipo === 'seguidores') {
    const g = GENTE.slice(h % 3).concat(GENTE.slice(0, h % 3)).slice(0, Math.min(6, p.seg)), outros = P.filter(x => x.id !== p.id && x.cidade === p.cidade).slice(0, 2);
    total = fmt(p.seg + seg); titulo = 'SEGUIDORES';
    corpo = '<p class="u-sub">Pessoas</p>' + g.map(pessoa).join('')
      + (outros.length ? '<p class="u-sub">Promoters</p>' + outros.map(x => '<a class="u-pn-l" href="promoter.html#p=' + x.id + '"><span class="u-pn-av redondo" style="background-image:url(' + RETRATO(x) + ')"></span><b>' + esc(x.nome) + '</b><small>' + esc(NIVEL[x.nivel]) + '</small></a>').join('') : '')
      + '<p class="al-nota">+ ' + fmt(Math.max(0, p.seg + seg - g.length - outros.length)) + ' perfis privados ou que não mostram quem seguem.</p>';
  } else if (tipo === 'nota') {
    total = '★ ' + p.nota; titulo = 'NOTA';
    corpo = '<p class="u-sub">' + p.resp + ' respostas de quem foi pelo link ou pela lista</p>' + (() => { const n = parseFloat(String(p.nota).replace(',', '.')), c5 = Math.max(.25, Math.min(.85, (n - 3) * .45)), c4 = (1 - c5) * .65, c3 = (1 - c5 - c4) * .6, c2 = (1 - c5 - c4 - c3) * .7; return [[5, c5], [4, c4], [3, c3], [2, c2], [1, 1 - c5 - c4 - c3 - c2]]; })().map(([e, f]) => barra(e + ' ★', f)).join('')
      + '<p class="u-sub">Últimas respostas</p>' + FRASES.map((f, k) => { const g = GENTE[(h + k) % GENTE.length], i = fs[k % (fs.length || 1)];
          return '<div class="pr-pn-av"><div><a href="user.html#u=' + g[0] + '"><b>' + esc(g[1]) + '</b></a><span>' + '★'.repeat(f[1]) + '<i>' + '★'.repeat(5 - f[1]) + '</i></span></div><p>' + esc(f[0]) + '</p>' + (i ? '<small>' + esc(i.titulo) + (i.lugar ? ' · ' + esc(i.lugar) : '') + '</small>' : '') + '</div>'; }).join('')
      + '<p class="al-nota">Só responde quem fez check-in. O promoter não apaga nem escolhe as respostas.</p>';
  } else if (tipo === 'presencas') {
    total = p.pres; titulo = 'PRESENÇAS';
    const pesos = fs.map((_, k) => 1 / (k + 1.4)), soma = pesos.reduce((a, b) => a + b, 0) || 1;
    corpo = '<p class="u-sub">Últimos 30 dias · check-in na porta com bilhete ou lista deste promoter</p>'
      + fs.map((i, k) => evL(i, (q => q + (q === 1 ? ' presença · ' : ' presenças · '))(Math.max(1, Math.round(p.pres * .6 * pesos[k] / soma))) + esc(quando(i)))).join('')
      + '<div class="pr-pn-av"><div><b>Noites anteriores</b><b>' + Math.round(p.pres * (fs.length ? .4 : 1)) + '</b></div><p>Festas que já acabaram neste período.</p></div>'
      + '<p class="al-nota">Conta só quem entrou de facto: compra pelo link sem check-in não conta. É o número que decide o nível (R70).</p>';
  } else {
    total = p.valeu + '%'; titulo = 'DIZEM QUE VALEU';
    corpo = barra('Valeu', p.valeu / 100) + barra('Não valeu', 1 - p.valeu / 100)
      + '<p class="u-sub">O que mais pesou</p>' + MOTIVOS.map(([n, f]) => barra(n, Math.min(.98, f * p.valeu / 92))).join('')
      + (fs.length ? '<p class="u-sub">Por festa</p>' + fs.slice(0, 4).map((i, k) => evL(i, Math.max(70, Math.min(99, p.valeu + ((h + k * 7) % 9) - 4)) + '% dizem que valeu')).join('') : '')
      + '<p class="al-nota">Pergunta feita no dia seguinte a quem fez check-in: valeu ou não valeu?</p>';
  }
  let pn = document.querySelector('.u-pn');
  const fecha = () => { pn.hidden = true; document.documentElement.classList.remove('lb-aberta'); };
  if (!pn) { pn = document.createElement('div'); pn.className = 'u-pn'; pn.setAttribute('role', 'dialog'); pn.setAttribute('aria-modal', 'true'); document.body.appendChild(pn);
    pn.addEventListener('click', ev => { if (ev.target === pn || ev.target.closest('.u-pn-x') || ev.target.closest('a')) fecha(); });
    document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && !pn.hidden) fecha(); }); }
  pn.innerHTML = '<div class="u-pn-cx"><div class="u-pn-h"><div><p class="s-eyebrow">' + esc(p.nome) + '</p><h2 class="s-h h2s">' + total + ' <em>' + titulo + '</em></h2></div><button type="button" class="u-pn-x" aria-label="Fechar">×</button></div><div class="u-pn-b">' + corpo + '</div></div>';
  pn.hidden = false; document.documentElement.classList.add('lb-aberta'); pn.querySelector('.u-pn-x').focus();
}
document.querySelectorAll('[data-promoters]').forEach(grelha);
document.querySelectorAll('[data-promoter]').forEach(perfil);
window.STREETFY_PROMOTERS = {lista:P, festasDe};
})();
