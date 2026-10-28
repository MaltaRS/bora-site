/* Xouty · djs.js — DJs: o mesmo papel do promoter (lista de convidados, link e comissão, aprovação pela casa) mais o que é só do DJ:
   sets na agenda, pedidos de booking das casas (aceitar, recusar, contraproposta de cachê), rider técnico, mixes e residências.
   Grelha (djs.html, [data-djs]) e perfil (dj.html#d=<id>, [data-dj-perfil]). Pessoas e nomes artísticos fictícios.
   Guardado neste aparelho: streetfy:segue-djs, streetfy:dj-bookings, streetfy:dj-listas, streetfy:dj-rider, streetfy:dj-mixes. */
(function(){
'use strict';
const C = window.STREETFY_CATALOGO || {itens:[], lugarKey:() => ''};
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
const fmt = n => Math.round(n).toLocaleString('pt-PT');
const ler = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } };
const gravar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const NIVEL = {residente:'DJ residente', convidado:'DJ convidado', ascensao:'DJ em ascensão'};
const CID = {lisboa:'Lisboa', porto:'Porto', coimbra:'Coimbra', faro:'Faro'};
const RIDER0 = ['2 × CDJ-3000 em link', 'Mesa DJM-V10 ou DJM-900NXS2', '2 monitores de cabine à altura do ouvido', 'Entrada USB e cartão SD', 'Água e toalha na cabine'];
const D = [
 {id:'nuno-v', nome:'Nuno Varela', art:'NVRL', foto:'dj', cidade:'lisboa', nivel:'residente', casa:'Lux Frágil', generos:['techno', 'house'], estilos:['techno', 'house', 'festa'], nota:'4,8', resp:318, seg:5120, sets:9, publico:1840, cache:600, comissao:6, bio:'Residente às sextas no Lux. Techno de madrugada, house quando o sol nasce sobre o rio.', ids:['l4', 'l11'], mixes:[['Sexta no Lux · 04h–06h', 118, 'SoundCloud'], ['Warm-up de domingo', 62, 'Mixcloud']]},
 {id:'kiara-s', nome:'Kiara Sol', art:'KIARA', foto:'club', cidade:'lisboa', nivel:'convidado', casa:'B.Leza', generos:['afro house', 'kizomba', 'afrobeats'], estilos:['kizomba', 'afrobeats', 'festa'], nota:'4,7', resp:204, seg:3870, sets:7, publico:1260, cache:450, comissao:5, bio:'Afro house e kizomba que enchem a pista sem pedir licença. Do B.Leza às festas de praia.', ids:['l3'], mixes:[['Baile do B.Leza ao vivo', 95, 'SoundCloud']]},
 {id:'tomas-b', nome:'Tomás Brito', art:'TOMBRI', foto:'pink', cidade:'lisboa', nivel:'ascensao', casa:'', generos:['disco', 'funk'], estilos:['disco', 'funk', 'festa'], nota:'4,5', resp:61, seg:860, sets:4, publico:410, cache:250, comissao:5, bio:'Disco, funk e boogie em vinil. Bares do Cais do Sodré e rooftops ao fim da tarde.', ids:[], mixes:[['Só vinil · Cais do Sodré', 74, 'Mixcloud']]},
 {id:'beatriz-c', nome:'Beatriz Costa', art:'BEA C', foto:'cocktail', cidade:'lisboa', nivel:'ascensao', casa:'', generos:['indie', 'rock'], estilos:['indie', 'rock', 'concertos'], nota:'4,4', resp:38, seg:540, sets:3, publico:260, cache:200, comissao:4, bio:'Indie e rock para cantar alto. Depois dos concertos, até fechar.', ids:[], mixes:[['Depois do concerto', 55, 'SoundCloud']]},
 {id:'mafalda-r', nome:'Mafalda Rio', art:'MAFA', foto:'noite', cidade:'porto', nivel:'residente', casa:'Gare Porto', generos:['techno', 'minimal'], estilos:['techno', 'house', 'festa'], nota:'4,8', resp:276, seg:4410, sets:8, publico:1520, cache:550, comissao:6, bio:'Residente na Gare. Techno escuro e minimal, horas a fio.', ids:[], mixes:[['Gare · fecho', 130, 'SoundCloud']]},
 {id:'joao-p', nome:'João Pires', art:'JP GROOVE', foto:'lx', cidade:'porto', nivel:'convidado', casa:'', generos:['house', 'disco'], estilos:['house', 'disco', 'festa'], nota:'4,6', resp:142, seg:1980, sets:6, publico:880, cache:380, comissao:5, bio:'House com alma e disco nas Galerias de Paris. Pista cheia, cara feliz.', ids:[], mixes:[['Galerias de Paris · sábado', 88, 'Mixcloud']]}
];
const porId = id => D.find(x => x.id === id);
const PR = window.STREETFY_PROMOTERS || {};
/* os sets do DJ: festas do catálogo com o estilo dele, na cidade (o mesmo critério das festas do promoter) */
/* os eventos onde a casa o pôs no line-up contam como sets dele */
const setsDe = d => PR.festasDe ? PR.festasDe({ids:d.ids.concat(C.itens.filter(i => (i.lineup || []).includes(d.id) && !d.ids.includes(i.id)).map(i => i.id)), cidade:d.cidade, estilos:d.estilos, zona:[d.cidade]}).slice(0, 5) : [];
const horaSet = (d, i) => { const h = (String(d.id + i.id).split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 4); return ['23:00 – 01:00', '00:30 – 02:30', '01:00 – 03:00', '02:30 – 05:00'][h]; };
const hrefEv = i => 'bilhete.html#lugar=' + encodeURIComponent(C.lugarKey(i)) + '&evento=' + encodeURIComponent(i.id);
const segueLugar = i => { try { return localStorage.getItem('segue:' + C.lugarKey(i)) === '1'; } catch (e) { return false; } };
const quando = i => { const k = Math.min(...(i._ks || [0])); if (k === 0) return 'hoje'; if (k === 1) return 'amanhã'; const d = new Date(); d.setDate(d.getDate() + k); return ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'][d.getDay()] + ' ' + d.getDate(); };
const rider = d => (ler('streetfy:dj-rider', {})[d.id]) || RIDER0;
const mixes = d => (ler('streetfy:dj-mixes', {})[d.id]) || d.mixes;
/* bookings: a casa pede, o DJ responde. Começa com dois pedidos para o Nuno (o DJ da sessão "DJ" no protótipo) */
const BK = 'streetfy:dj-bookings';
const bookings = () => { let b = ler(BK, null); if (!b) { const dia = k => { const x = new Date(); x.setDate(x.getDate() + k); return x.toISOString().slice(0, 10); }; b = [
  {id:'b1', dj:'nuno-v', casa:'Lux Frágil', casaK:'lisboa/lux fragil', data:dia(10), hora:'01:00 – 03:00', cache:600, estado:'pendente', t:Date.now() - 36e5, nota:'Noite X · sala de baixo'},
  {id:'b2', dj:'nuno-v', casa:'B.Leza', casaK:'lisboa/b leza', data:dia(11), hora:'23:00 – 01:00', cache:450, estado:'pendente', t:Date.now() - 5 * 36e5, nota:'Abertura antes do baile'},
  {id:'b3', dj:'nuno-v', casa:'Lux Frágil', casaK:'lisboa/lux fragil', data:dia(3), hora:'02:30 – 05:00', cache:600, estado:'pago', t:Date.now() - 4 * 864e5, pagoT:Date.now() - 3 * 864e5, metodo:'repasse', nota:'Lux Sessions'}]; gravar(BK, b); }
  return passaTempo(b); };
/* ---------- pagamento do booking (lado de quem contrata) ----------
   pendente → (contraproposta) → aceite: a casa tem 48 h para pagar (e nunca menos de 72 h antes do set), senão expira e a data volta ao DJ
   → pago: o dinheiro fica retido no Xouty até ao set → realizado: o DJ fez check-in na cabine ou a casa confirmou; a casa tem até à libertação para abrir um problema
   → libertado: o DJ recebe 2 dias depois do set (D+2, como os bilhetes). Ramos: recusado, expirado, cancelado (pela casa ou pelo DJ), problema.
   A casa paga o cachê + taxa de serviço do Xouty (6%) + IVA da taxa; o DJ recebe o cachê inteiro e passa a fatura-recibo à casa. */
const TAXA = 0.06, IVA = 0.23, H = 36e5;
const contas = c => { const taxa = Math.round(c * TAXA * 100) / 100, iva = Math.round(taxa * IVA * 100) / 100; return {cache:c, taxa, iva, total:Math.round((c + taxa + iva) * 100) / 100}; };
const inicioSet = x => new Date(x.data + 'T' + (String(x.hora).match(/\d{2}:\d{2}/) || ['23:00'])[0]);
/* sinal: set marcado com mais de 60 dias de antecedência paga só 30% do cachê (mais a taxa toda) na marcação; o sinal segue para o DJ
   2 dias depois e não fica retido. O resto (70%) abre 45 dias antes e paga-se até 30 dias antes, por isso nunca fica retido mais de ~32 dias
   (o Stripe limita a 90 dias o dinheiro parado numa conta ligada com levantamentos manuais). */
const SINAL_DIAS = 60, SINAL = 0.3, RESTO_ABRE = 45, RESTO_ATE = 30, D1 = 864e5;
const r2 = n => Math.round(n * 100) / 100;
const diasAte = x => (inicioSet(x) - Date.now()) / D1;
const sinalDe = x => r2(x.cache * SINAL);
/* o que se paga agora: o total, o sinal (com a taxa toda) ou o resto (sem taxa) */
function parte(x){
  const t = contas(x.cache);
  if (x.estado === 'sinal') { const c = r2(x.cache - sinalDe(x)); return {tipo:'resto', cache:c, taxa:0, iva:0, total:c}; }
  if (x.sinal) { const c = sinalDe(x); return {tipo:'sinal', cache:c, taxa:t.taxa, iva:t.iva, total:r2(c + t.taxa + t.iva)}; }
  return Object.assign({tipo:'total'}, t);
}
const pagoAte = x => r2((x.pagamentos || []).reduce((a, p) => a + p.valor, 0) || (x.pagoT ? contas(x.cache).total : 0));
const abreResto = x => inicioSet(x).getTime() - RESTO_ABRE * D1;
/* Multibanco: só com o set a mais de 7 dias; a referência dá 5 dias para pagar (o banco pode demorar a confirmar), nunca a menos de 72 h do set */
const mbPode = x => diasAte(x) > 7;
const prazoPagar = x => x.estado === 'sinal' ? inicioSet(x).getTime() - RESTO_ATE * D1 : Math.min(x.refT ? x.refT + 5 * D1 : (x.aceiteT || Date.now()) + 48 * H, inicioSet(x).getTime() - 72 * H);
/* faturas: a taxa de serviço é faturada pelo Xouty no InvoiceXpress (fatura-recibo finalizada e enviada por e-mail no momento do pagamento);
   o cachê é faturado pelo DJ à casa (fatura-recibo dele). Se o DJ cancelar, sai uma nota de crédito da taxa. */
function docIX(serie, desc, valor){ let n = ler('streetfy:ix-seq', 0) + 1; gravar('streetfy:ix-seq', n); return {n:serie + ' XOUTY/' + new Date().getFullYear() + '/' + n, desc, valor:r2(valor), t:Date.now(), ix:'finalizado · enviado por e-mail'}; }
/* faturação do DJ: com o acordo assinado no portal, o Xouty emite em nome do DJ a fatura-recibo do cachê (InvoiceXpress, série do DJ)
   quando o dinheiro lhe chega: o sinal, o resto depois do set, ou a parte que fica para ele num cancelamento. Sem acordo, o DJ passa-a ele.
   Guarda-se só o NIF mascarado. streetfy:dj-faturacao = {<dj>: {on, nif, regime:'isento'|'iva', ret:'dispensado'|'sujeito', t}} */
const FK = 'streetfy:dj-faturacao';
const FAT0 = {'tomas-b':{on:true, modo:'ligada', emissor:'InvoiceXpress', conta:'tombri', chave:'••••k7Qz', ret:'dispensado', t:Date.now() - 40 * D1}, 'kiara-s':{on:true, modo:'ligada', emissor:'Moloni', conta:'kiarasol', chave:'••••9aTw', ret:'dispensado', t:Date.now() - 90 * D1}};
const EMISSORES = ['InvoiceXpress', 'Moloni', 'Outro com API'];
const fatDe = dj => Object.assign({}, (ler(FK, null) || FAT0)[dj] || {on:false});
const gravaFat = (dj, v) => { const F = ler(FK, null) || FAT0; F[dj] = v; gravar(FK, F); };
const REGIME = {isento:'isento de IVA (art. 53.º do CIVA)', iva:'IVA a 23% incluído'};
function emiteDJ(x, valor, desc){
  const f = fatDe(x.dj); if (!f.on || !(valor > 0)) return;
  const d = porId(x.dj) || {art:x.dj}, k = 'streetfy:ix-seq-' + x.dj, n = ler(k, 0) + 1; gravar(k, n);
  x.docs = x.docs || [];
  const ret = f.ret === 'sujeito' ? ' · sujeita a retenção de IRS pela casa' : '';
  /* conta ligada: a fatura sai pela conta do próprio DJ no emissor dele (série, IVA e numeração são da conta, nunca do Xouty) */
  if (f.modo === 'ligada') x.docs.push({n:'FR ' + String(f.conta || d.art).replace(/\W+/g, '').toUpperCase() + '/' + new Date().getFullYear() + '/' + n, desc:desc + ret, valor:r2(valor), t:Date.now(), ix:'emitida pela conta ' + (f.emissor || 'do emissor') + ' do DJ · enviada à casa e ao DJ', dj:x.dj});
  /* recibo verde à mão: fica por emitir até o DJ o passar no Portal das Finanças e anexar o PDF */
  else x.docs.push({n:'Recibo verde ' + n + ' · por emitir', desc:desc + ret, valor:r2(valor), t:Date.now(), ix:'lembrete enviado ao DJ · anexa o PDF quando o emitir', dj:x.dj, pendente:true});
}
function registaPagamento(x, metodo){
  const p = parte(x), t = Date.now();
  x.pagamentos = (x.pagamentos || []).concat([{tipo:p.tipo, valor:p.total, cache:p.cache, metodo, t}]);
  x.docs = x.docs || [];
  if (p.taxa) x.docs.push(docIX('FR', 'Fatura-recibo · taxa de serviço do booking', p.taxa + p.iva));
  if (p.tipo === 'sinal') { x.estado = 'sinal'; x.sinalLibertaEm = diaMais(new Date().toISOString().slice(0, 10), 2); emiteDJ(x, p.cache, 'Fatura-recibo do DJ · sinal do cachê'); }
  else x.estado = 'pago';
  if (!x.pagoT) x.pagoT = t; x.metodo = metodo; delete x.refT;
  return p;
}
/* cancelamento pela casa: mais de 14 dias antes, o cachê volta todo; entre 14 dias e 72 h, metade fica para o DJ; com menos de 72 h, fica tudo para o DJ. A taxa não volta. */
const multa = x => { const d = (inicioSet(x) - Date.now()) / H; return d > 14 * 24 ? 0 : d > 72 ? 0.5 : 1; };
/* quanto do cachê fica para o DJ se a casa cancelar agora: a tabela, mas nunca menos do que o sinal */
const paraDJ = x => x.estado === 'sinal' ? sinalDe(x) : Math.max(x.sinal ? sinalDe(x) : 0, r2(x.cache * multa(x)));
const diaMais = (s, k) => { const d = new Date(s + 'T12:00'); d.setDate(d.getDate() + k); return d.toISOString().slice(0, 10); };
function passaTempo(b){
  let mudou = false; const agora = Date.now(), hoje = new Date().toISOString().slice(0, 10);
  b.forEach(x => {
    if (x.estado === 'confirmado') { x.estado = 'pago'; x.pagoT = x.pagoT || x.t; x.metodo = x.metodo || 'repasse'; mudou = true; }   /* os antigos "confirmado" eram já pagos */
    if (x.estado === 'aceite' && x.sinal == null) { x.sinal = diasAte(x) > SINAL_DIAS; mudou = true; }
    if (x.estado === 'aceite' && agora > prazoPagar(x)) { x.estado = 'expirado'; mudou = true; }
    if (x.estado === 'sinal' && agora > prazoPagar(x)) { x.estado = 'cancelado'; x.cancelTxt = 'O resto não foi pago até 30 dias antes do set. O booking caiu e o sinal ficou com o DJ.'; mudou = true; }
    if (x.estado === 'realizado' && hoje >= x.liberaEm) { x.estado = 'libertado'; emiteDJ(x, x.cache - (x.sinal ? sinalDe(x) : 0), 'Fatura-recibo do DJ · ' + (x.sinal ? 'resto do cachê' : 'cachê do set')); mudou = true; }
  });
  /* um set já tocado, à espera da confirmação da casa (para se ver o passo depois do set) */
  if (!b.some(x => x.id === 'b4')) { b.push({id:'b4', dj:'kiara-s', casa:'Lux Frágil', casaK:'lisboa/lux fragil', data:diaMais(hoje, -1), hora:'23:30 – 01:30', cache:450, estado:'pago', t:agora - 9 * 864e5, pagoT:agora - 8 * 864e5, metodo:'cartao', nota:'Terraço · warm-up'}); mudou = true; }
  /* com sinal: um já com o sinal pago e o resto aberto, outro aceite à espera do sinal */
  if (!b.some(x => x.id === 'b5')) { const c = 800, t = contas(c); b.push({id:'b5', dj:'tomas-b', casa:'Lux Frágil', casaK:'lisboa/lux fragil', data:diaMais(hoje, 40), hora:'00:30 – 02:30', cache:c, sinal:true, estado:'sinal', t:agora - 30 * 864e5, aceiteT:agora - 29 * 864e5, pagoT:agora - 29 * 864e5, metodo:'repasse', sinalLibertaEm:diaMais(hoje, -27), pagamentos:[{tipo:'sinal', valor:r2(c * SINAL + t.taxa + t.iva), cache:r2(c * SINAL), metodo:'repasse', t:agora - 29 * 864e5}], docs:[{n:'FR XOUTY/2026/0', desc:'Fatura-recibo · taxa de serviço do booking', valor:r2(t.taxa + t.iva), t:agora - 29 * 864e5, ix:'finalizado · enviado por e-mail'}, {n:'FR TOMBRI/2026/0', desc:'Fatura-recibo do DJ · sinal do cachê', valor:r2(c * SINAL), t:agora - 29 * 864e5, ix:'emitida pela conta InvoiceXpress do DJ · enviada à casa e ao DJ', dj:'tomas-b'}], nota:'Noite de dezembro · aquecimento'}); mudou = true; }
  if (!b.some(x => x.id === 'b6')) { b.push({id:'b6', dj:'mafalda-r', casa:'Lux Frágil', casaK:'lisboa/lux fragil', data:diaMais(hoje, 75), hora:'01:00 – 03:00', cache:700, sinal:true, estado:'aceite', t:agora - 2 * 864e5, aceiteT:agora - 2 * H, nota:'Lux Sessions · janeiro'}); mudou = true; }
  if (mudou) gravar(BK, b);
  return b;
}
const METODO = {repasse:'descontado do repasse de bilhetes', mbway:'MB WAY', multibanco:'referência Multibanco', cartao:'cartão'};   /* MB WAY no Stripe é só B2C: fica para os bilhetes, não para o booking */
const quandoH = t => { const d = new Date(t); return dataTxt(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')) + ' às ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
const eurC = n => '€' + (Math.round(n * 100) / 100).toFixed(2).replace('.', ',').replace(/,00$/, '');
const gravaB = b => gravar(BK, b);
const dataTxt = s => { const d = new Date(s + 'T12:00'); return ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'][d.getDay()] + ' ' + d.getDate() + ' ' + ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'][d.getMonth()]; };
let segue = ler('streetfy:segue-djs', {});
const guardaSeg = () => gravar('streetfy:segue-djs', segue);

/* ---------- grelha ---------- */
function grelha(el){
  let cid = 'todas', gen = [];   /* vários estilos: mostra quem toca pelo menos um */
  const desenha = () => {
    const gens = [...new Set(D.flatMap(d => d.generos))];
    const L = D.filter(d => (cid === 'todas' || d.cidade === cid) && (!gen.length || gen.some(g => d.generos.includes(g))));
    el.innerHTML = '<div class="dj-fil"><div class="fa-pills">' + [['todas', 'Todas as cidades']].concat(Object.entries(CID).filter(([k]) => D.some(d => d.cidade === k))).map(([k, n]) => '<button type="button" class="fa-pill' + (cid === k ? ' on rosa' : '') + '" data-dj-cid="' + k + '">' + n + '</button>').join('') + '</div>'
      + '<div class="fa-pills">' + gens.map(g => '<button type="button" class="fa-pill' + (gen.includes(g) ? ' on' : '') + '" data-dj-gen="' + esc(g) + '" aria-pressed="' + gen.includes(g) + '">' + esc(cap(g)) + '</button>').join('') + (gen.length ? '<button type="button" class="fa-lnk" data-dj-gen-limpa>Limpar estilos</button>' : '') + '</div></div>'
      + '<div class="dj-grid">' + L.map(d => { const s = setsDe(d); return '<a class="dj-card" href="dj.html#d=' + d.id + '">' + (() => { const on = !!segue[d.id]; return '<button type="button" class="s-segue no-card' + (on ? ' on' : '') + '" data-dj-segc="' + d.id + '" aria-pressed="' + on + '" aria-label="' + (on ? 'Deixar de seguir ' : 'Seguir ') + esc(d.art) + '">' + (on ? 'A seguir ✓' : 'Seguir') + '</button>'; })() + '<div class="dj-im" style="background-image:url(img/' + d.foto + '.jpg)"><span class="dj-art">' + esc(d.art) + '</span><span class="dj-niv ' + d.nivel + '">' + NIVEL[d.nivel] + '</span></div><div class="dj-b"><b>' + esc(d.nome) + '</b><span>' + esc(CID[d.cidade] || cap(d.cidade)) + ' · ' + d.generos.map(cap).join(', ') + '</span><span>★ ' + d.nota + ' · ' + fmt(d.seg) + ' seguidores · ' + d.sets + ' sets em 30 dias</span>' + (s[0] ? '<span class="dj-prox">Próximo set: <b>' + esc(s[0].titulo) + '</b> · ' + esc(quando(s[0])) + '</span>' : '') + '</div></a>'; }).join('') + '</div>'
      + (L.length ? '' : '<p class="al-nota">Nenhum DJ com estes filtros.</p>');
  };
  el.addEventListener('click', ev => { const sg = ev.target.closest('[data-dj-segc]'); if (sg) { ev.preventDefault(); ev.stopPropagation(); const id = sg.dataset.djSegc; segue = ler('streetfy:segue-djs', {}); if (segue[id]) delete segue[id]; else segue[id] = 1; guardaSeg(); desenha(); return; }
    const b = ev.target.closest('[data-dj-cid],[data-dj-gen],[data-dj-gen-limpa]'); if (!b) return; if (b.dataset.djCid) cid = b.dataset.djCid; if (b.dataset.djGen) { const g = b.dataset.djGen; gen = gen.includes(g) ? gen.filter(x => x !== g) : gen.concat(g); } if (b.hasAttribute('data-dj-gen-limpa')) gen = []; desenha(); });
  desenha();
}

/* ---------- perfil ---------- */
function perfil(el){
  let msg = null, form = false;
  const desenha = () => {
    const q = new URLSearchParams(location.hash.slice(1)), d = porId(q.get('d')) || D[0], s = !!segue[d.id], sets = setsDe(d), LS = ler('streetfy:dj-listas', {}), minha = LS[d.id] || {};
    document.title = 'Xouty · ' + d.art + ' · ' + NIVEL[d.nivel];
    const url = location.origin + location.pathname + '#d=' + d.id;
    el.innerHTML = '<section class="p-hero perfil pr-hero"><div class="s-bg" style="background-image:url(img/' + d.foto + '.jpg)"></div><div class="s-tint"></div><div class="s-wrap">'
      + '<div class="crumbs"><a href="index.html">Xouty</a> › <a href="djs.html">DJs</a> › <span>' + esc(d.art) + '</span></div>'
      + '<div class="pr-cab"><div class="pr-av" style="background-image:url(img/' + d.foto + '.jpg)"></div><div><h1 class="s-h" style="font-size:clamp(52px,8vw,110px)">' + esc(d.art) + '</h1>'
      + '<span class="pr-nivel cidade">' + NIVEL[d.nivel] + (d.casa ? ' · ' + esc(d.casa) : '') + '</span> <span class="p-meta">' + esc(d.nome) + ' · ' + esc(CID[d.cidade] || cap(d.cidade)) + ' · ' + d.generos.map(cap).join(', ') + '</span></div></div>'
      + '<p class="s-lead" style="margin-top:14px;max-width:56ch">' + esc(d.bio) + '</p>'
      + '<div class="p-acoes"><a class="s-btn ' + (s ? 'mint' : 'ghost') + '" href="#" data-dj-seg="' + d.id + '" aria-pressed="' + s + '">' + (s ? 'A seguir ✓' : 'Seguir') + '</a><a class="s-btn ghost" href="#" data-dj-book>Pedir booking</a><a class="s-btn ghost" href="' + esc(url) + '" data-partilhar data-titulo="' + esc(d.art + ' · DJ no Xouty') + '">Compartilhar</a></div>'
      + '<div class="p-nums">' + [['★ ' + d.nota, 'nota · ' + d.resp + ' respostas de quem esteve'], [fmt(d.seg + (s ? 1 : 0)), 'seguidores' + (s ? ' · tu incluído' : '')], [d.sets, 'sets · 30 dias'], [fmt(d.publico), 'pessoas trazidas · 30 dias']].map(([v, t]) => '<div class="p-num u-num"><b>' + v + '</b><span>' + t + '</span></div>').join('') + '</div></div></section>'
      + (form ? '<section class="s-sec tight"><div class="s-wrap"><div class="bf-form dj-bk"><h4>Pedir booking a ' + esc(d.art) + '</h4><p class="al-nota">Protótipo: pedes como o Lux Frágil. O DJ responde no portal: aceita, recusa ou faz uma contraproposta.</p>'
          + '<div class="pt-2"><label>Data<input type="date" data-djb="data" value="' + new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10) + '"></label><label>Horário<select data-djb="hora">' + ['23:00 – 01:00', '00:30 – 02:30', '01:00 – 03:00', '02:30 – 05:00'].map(h => '<option>' + h + '</option>').join('') + '</select></label><label>Cachê proposto (€)<input type="number" min="0" step="10" data-djb="cache" value="' + d.cache + '"></label></div>'
          + '<label>Nota para o DJ<input data-djb="nota" maxlength="80" placeholder="ex.: Noite X · sala de baixo"></label><div class="pt-2"><button type="button" class="s-btn pink" data-dj-envia="' + d.id + '">Enviar pedido</button><button type="button" class="s-btn ghost" data-dj-book>Cancelar</button></div></div></div></section>' : '')
      + (msg ? '<section class="s-sec tight"><div class="s-wrap"><p class="pt-portam ok" role="status">' + esc(msg) + '</p></div></section>' : '')
      + '<section class="s-sec tight"><div class="s-wrap"><div class="p-grid"><div>'
      + '<p class="s-eyebrow">Na cabine</p><h2 class="s-h h2s" style="margin-bottom:18px">PRÓXIMOS <em>SETS</em></h2>'
      + (sets.length ? sets.map(i => { const st = minha[i.id]; return '<div class="p-ev pr-ev dj-set"><a class="dj-setl" href="' + esc(hrefEv(i)) + '"><div class="p-ev-h"><span class="p-ev-q">' + esc(quando(i)) + ' · set ' + horaSet(d, i) + '</span></div><h3>' + esc(i.titulo) + '</h3><p>' + esc(i.lugar || '') + (i.estilo ? ' · ' + esc(cap(i.estilo)) : '') + '</p></a>'
          + '<div class="dj-setac">' + (st ? '<span class="dj-pedido">' + (st === 'pedido' ? 'Pedido na lista do DJ enviado · o DJ aceita e a casa aprova' : 'Na lista do DJ ✓') + '</span>' : (i.soSeguidores && !segueLugar(i) ? '<button type="button" class="s-btn pink" data-dj-lista="' + esc(i.id) + '" data-seg="1">Seguir ' + esc(i.lugar || 'a casa') + ' e pedir lugar</button>' : '<button type="button" class="s-btn ghost" data-dj-lista="' + esc(i.id) + '">Pedir lugar na lista do DJ</button>')) + '</div></div>'; }).join('') : '<p class="p-vazio">Sem sets marcados esta semana.</p>')
      + '<p class="s-eyebrow" style="margin-top:28px">Para ouvir</p><h2 class="s-h h2s" style="margin-bottom:14px">MIXES</h2><ul class="dj-mixes">' + mixes(d).map(([t, min, pl]) => '<li><span class="dj-play" aria-hidden="true">▶</span><div><b>' + esc(t) + '</b><span>' + min + ' min · ' + esc(pl) + '</span></div></li>').join('') + '</ul>'
      + '</div><div>'
      + (d.casa ? '<p class="s-eyebrow">Residência</p><div class="inc" style="margin-top:12px"><div><h4>' + esc(d.casa) + '</h4><p>' + esc(NIVEL[d.nivel]) + ' · toca lá todos os meses.</p></div></div>' : '')
      + '<p class="s-eyebrow" style="margin-top:22px">Rider técnico</p><ul class="dj-rider">' + rider(d).map(r => '<li>' + esc(r) + '</li>').join('') + '</ul>'
      + '<p class="s-eyebrow" style="margin-top:22px">Como funciona</p><div class="inc" style="margin-top:12px"><div><h4>Regra da casa</h4><ul><li>O DJ tem o que o promoter tem: lista de convidados, link e comissão declarada pela casa.</li><li>A lista do DJ passa pela aprovação da casa, como a do promoter.</li><li>Bookings: a casa pede, o DJ aceita, recusa ou faz contraproposta de cachê.</li></ul></div></div>'
      + '<p class="s-eyebrow" style="margin-top:26px">Outros DJs</p><div class="pr-outros">' + D.filter(x => x.id !== d.id).sort((a, b) => (b.cidade === d.cidade) - (a.cidade === d.cidade)).slice(0, 4).map(x => '<a href="dj.html#d=' + x.id + '"><span class="pr-av mini" style="background-image:url(img/' + x.foto + '.jpg)"></span><b>' + esc(x.art) + '</b><small>' + esc(NIVEL[x.nivel]) + '</small></a>').join('') + '</div>'
      + '</div></div></div></section>';
  };
  el.addEventListener('click', ev => {
    const sg = ev.target.closest('[data-dj-seg]'); if (sg) { ev.preventDefault(); const id = sg.dataset.djSeg; if (segue[id]) delete segue[id]; else segue[id] = 1; guardaSeg(); desenha(); return; }
    const bk = ev.target.closest('[data-dj-book]'); if (bk) { ev.preventDefault(); form = !form; msg = null; desenha(); return; }
    const en = ev.target.closest('[data-dj-envia]'); if (en) { const v = k => (el.querySelector('[data-djb="' + k + '"]') || {}).value || '', d = porId(en.dataset.djEnvia); const b = bookings(); b.unshift({id:'b' + Date.now().toString(36), dj:d.id, casa:'Lux Frágil', casaK:'lisboa/lux fragil', data:v('data'), hora:v('hora'), cache:Math.max(0, +v('cache') || 0), estado:'pendente', t:Date.now(), nota:v('nota').trim()}); gravaB(b); form = false; msg = 'Pedido enviado a ' + d.art + ' para ' + dataTxt(v('data')) + ' · ' + v('hora') + ' · €' + fmt(+v('cache') || 0) + '. O DJ responde no portal.'; desenha(); return; }
    const li = ev.target.closest('[data-dj-lista]'); if (li) { if (li.dataset.seg) { const i0 = C.itens.find(x => String(x.id) === li.dataset.djLista); if (i0) { try { localStorage.setItem('segue:' + C.lugarKey(i0), '1'); } catch (e) {} } } const d = porId(new URLSearchParams(location.hash.slice(1)).get('d')) || D[0], L = ler('streetfy:dj-listas', {}); (L[d.id] = L[d.id] || {})[li.dataset.djLista] = 'pedido'; gravar('streetfy:dj-listas', L); desenha(); }
  });
  window.addEventListener('hashchange', () => { msg = null; form = false; desenha(); window.scrollTo({top:0}); });
  desenha();
}

/* ---------- portal: o que é só do DJ (bookings, agenda, rider, mixes) ---------- */
const EU = 'nuno-v';
let contra = {};
function portalDJ(){
  const d = porId(EU), b = bookings().filter(x => x.dj === EU), pend = b.filter(x => x.estado === 'pendente' || x.estado === 'contraproposta'), conf = b.filter(x => /^(aceite|sinal|pago|realizado|libertado|problema)$/.test(x.estado)).sort((x, y) => x.data.localeCompare(y.data)), sets = setsDe(d);
  const EST = {pendente:'à espera de ti', contraproposta:'contraproposta enviada', aceite:'à espera do pagamento', sinal:'sinal pago', pago:'pago · garantido', realizado:'a receber', libertado:'recebido', problema:'em análise'};
  const estDJ = x => x.estado === 'aceite' ? 'a casa paga ' + (x.sinal ? 'o sinal' : '') + ' até ' + quandoH(prazoPagar(x)) + '; só fica garantido depois' : x.estado === 'sinal' ? 'sinal de €' + fmt(sinalDe(x)) + (new Date().toISOString().slice(0, 10) >= x.sinalLibertaEm ? ' já na tua conta' : ' chega a ' + dataTxt(x.sinalLibertaEm)) + '; o resto é pago até ' + quandoH(prazoPagar(x)) : x.estado === 'pago' ? 'o cachê está retido no Xouty até ao set' : x.estado === 'realizado' ? 'recebes €' + fmt(x.cache) + ' a ' + dataTxt(x.liberaEm) : x.estado === 'libertado' ? '€' + fmt(x.cache) + ' na tua conta · passa a fatura-recibo à casa' : x.estado === 'problema' ? 'a casa abriu um problema; o Xouty responde em 48 h' : '';
  return '<div class="pt-2c"><div class="pt-card dj-bks" id="bookings"><div class="pt-ch"><h3>Pedidos de booking</h3><span class="pt-mini-t">as casas pedem; aceitas, recusas ou propões outro cachê</span></div>'
      + (pend.length ? pend.map(x => '<div class="dj-bk-i"><div><b>' + esc(x.casa) + '</b><span>' + esc(dataTxt(x.data)) + ' · ' + esc(x.hora) + (x.nota ? ' · ' + esc(x.nota) : '') + '</span><span>Cachê proposto: <b>€' + fmt(x.cache) + '</b>' + (x.estado === 'contraproposta' ? ' · pediste <b>€' + fmt(x.contra) + '</b>, à espera da casa' : '') + '</span></div>'
          + '<div class="dj-bk-ac"><button type="button" class="s-btn mint" data-djp="aceita" data-id="' + x.id + '">Aceitar €' + fmt(x.cache) + '</button><button type="button" class="s-btn ghost" data-djp="recusa" data-id="' + x.id + '">Recusar</button>' + (x.estado === 'pendente' ? '<span class="dj-cp"><input type="number" min="0" step="10" placeholder="€ outro valor" data-djc="' + x.id + '" value="' + esc(contra[x.id] || '') + '" aria-label="Contraproposta em euros"><button type="button" class="s-btn ghost" data-djp="contra" data-id="' + x.id + '">Contraproposta</button></span>' : '') + '</div></div>').join('') : '<p class="al-nota">Sem pedidos novos.</p>')
      + '</div><div class="pt-card"><div class="pt-ch"><h3>Agenda de sets</h3><span class="pt-mini-t">confirmados e festas onde tocas</span></div><ul class="dj-ag">'
      + conf.map(x => '<li><b>' + esc(dataTxt(x.data)) + ' · ' + esc(x.hora) + '</b><span>' + esc(x.casa) + (x.nota ? ' · ' + esc(x.nota) : '') + ' · €' + fmt(x.cache) + '</span><small class="dj-est">' + esc(estDJ(x)) + '</small>' + (x.estado === 'pago' && x.data === new Date().toISOString().slice(0, 10) ? '<button type="button" class="s-btn mint" data-djp="cheguei" data-id="' + x.id + '">Cheguei à cabine</button>' : '') + (x.estado === 'pago' || x.estado === 'sinal' ? '<button type="button" class="cd-lnk" data-djp="dj-cancela" data-id="' + x.id + '">Não posso ir</button>' : '') + '<i class="' + (x.estado === 'aceite' || x.estado === 'problema' ? '' : 'ok') + '">' + EST[x.estado] + '</i></li>').join('')
      + sets.map(i => '<li><b>' + esc(quando(i)) + ' · ' + horaSet(d, i) + '</b><span>' + esc(i.titulo) + ' · ' + esc(i.lugar || '') + '</span><i>no cartaz</i></li>').join('') + '</ul></div></div>'
    + '<div class="pt-2c"><div class="pt-card"><div class="pt-ch"><h3>Rider técnico</h3><span class="pt-mini-t">aparece no teu perfil; uma linha por item</span></div><textarea class="dj-rid" data-dj-rider rows="6">' + esc(rider(d).join('\n')) + '</textarea><p class="al-nota" data-dj-rok></p></div>'
    + '<div class="pt-card"><div class="pt-ch"><h3>Mixes</h3><span class="pt-mini-t">os que aparecem no teu perfil</span></div><ul class="dj-mixes">' + mixes(d).map(([t, m, p], k) => '<li><span class="dj-play" aria-hidden="true">▶</span><div><b>' + esc(t) + '</b><span>' + m + ' min · ' + esc(p) + '</span></div><button type="button" class="cd-lnk" data-djp="mixrm" data-k="' + k + '">Tirar</button></li>').join('') + '</ul>'
    + '<div class="dj-mixf"><input data-djm="t" placeholder="nome do mix" maxlength="50"><input type="number" data-djm="m" placeholder="min" min="1" max="600"><select data-djm="p"><option>SoundCloud</option><option>Mixcloud</option><option>YouTube</option></select><button type="button" class="s-btn ghost" data-djp="mixadd">Juntar</button></div></div></div>'
    + cardFat();
}
/* cartão "Faturação" no portal do DJ: a fatura-recibo do cachê é do DJ; ele liga a conta do emissor dele ou passa o recibo verde à mão (decisão de 28/10) */
let fatForm = false, fatErro = '', fatModo = 'ligada', fatVals = {};   /* o que foi escrito sobrevive aos redesenhos do cartão */
function cardFat(){
  const f = fatDe(EU), meus = bookings().flatMap(x => (x.docs || []).filter(dd => dd.dj === EU).map(dd => Object.assign({casa:x.casa, bk:x.id}, dd)));
  const resumo = !f.on ? 'Desligado: a casa fica à espera da tua fatura-recibo e o Xouty não trata de nada por ti.'
    : f.modo === 'ligada' ? 'Conta ligada: ' + esc(f.emissor) + ' · ' + esc(f.conta) + ' · chave ' + esc(f.chave) + ' · ' + (f.ret === 'sujeito' ? 'sujeito a retenção de IRS' : 'dispensado de retenção') + ' · desde ' + esc(dataTxt(new Date(f.t).toISOString().slice(0, 10)))
    : 'Recibo verde à mão: recebes um lembrete quando o dinheiro te chegar e anexas o PDF aqui para a casa.';
  const sel = (k, ops, v) => '<select data-djfat="' + k + '">' + ops.map(([val, t]) => '<option value="' + val + '"' + (val === (fatVals[k] || v) ? ' selected' : '') + '>' + t + '</option>').join('') + '</select>';
  const formHtml = '<div class="pt-form dj-fatf"><h4>Como saem as tuas faturas-recibo</h4>'
    + '<div class="en-seg" role="radiogroup"><button type="button" role="radio" aria-checked="' + (fatModo === 'ligada') + '" class="' + (fatModo === 'ligada' ? 'on' : '') + '" data-djfat-modo="ligada">Ligar a minha conta de faturação</button><button type="button" role="radio" aria-checked="' + (fatModo === 'manual') + '" class="' + (fatModo === 'manual' ? 'on' : '') + '" data-djfat-modo="manual">Passo eu o recibo verde</button></div>'
    + (fatModo === 'ligada'
      ? '<div class="gd-g"><label>Emissor' + sel('emissor', EMISSORES.map(e => [e, e]), 'InvoiceXpress') + '</label><label>Nome da conta<input data-djfat="conta" maxlength="40" placeholder="ex.: tombri" value="' + esc(fatVals.conta || '') + '"></label><label>Chave da API<input data-djfat="chave" type="password" autocomplete="off" placeholder="cola a chave do emissor" value="' + esc(fatVals.chave || '') + '"></label><label>Retenção de IRS' + sel('ret', [['dispensado', 'Dispensado de retenção na fonte'], ['sujeito', 'Sujeito a retenção (a casa retém)']], 'dispensado') + '</label></div>'
        + '<label class="bp-chk"><input type="checkbox" data-djfat="aut"' + (fatVals.aut ? ' checked' : '') + '> Autorizo o Xouty a emitir, pela minha conta e em meu nome, as faturas-recibo dos bookings pagos pelo Xouty. Recebo cópia de cada uma e posso desligar quando quiser; as já emitidas não mudam.</label>'
        + '<p class="al-nota">A chave fica cifrada no servidor; neste aparelho guardamos só os últimos 4 caracteres. A série, a numeração e o IVA são os da tua conta no emissor, nunca do Xouty. Precisas de atividade aberta nas Finanças.</p>'
      : '<div class="gd-g"><label>Retenção de IRS' + sel('ret', [['dispensado', 'Dispensado de retenção na fonte'], ['sujeito', 'Sujeito a retenção (a casa retém)']], 'dispensado') + '</label></div>'
        + '<label class="bp-chk"><input type="checkbox" data-djfat="ativ"' + (fatVals.ativ ? ' checked' : '') + '> Tenho atividade aberta nas Finanças como trabalhador independente</label>'
        + '<p class="al-nota">Quando o cachê te chegar, recebes um lembrete. Passas o recibo verde no Portal das Finanças e anexas o PDF aqui; a casa recebe-o pelo Xouty.</p>')
    + (fatErro ? '<p class="en-err" role="alert">' + esc(fatErro) + '</p>' : '')
    + '<div class="dj-bk-ac"><button type="button" class="s-btn ink" data-djfat="ok">Ativar</button><button type="button" class="s-btn ghost" data-djfat="cancela">Cancelar</button></div></div>';
  return '<div class="pt-card dj-fat" id="faturacao"><div class="pt-ch"><h3>Faturação</h3><span class="pt-mini-t">a fatura-recibo do cachê é tua; escolhe como sai</span></div>'
    + '<label class="en-sw"><span>Faturas do cachê tratadas pelo Xouty<small>' + resumo + '</small></span><input type="checkbox" class="pt-sw" data-djfat="sw"' + (f.on || fatForm ? ' checked' : '') + '></label>'
    + (!f.on && fatForm ? formHtml : '')
    + (meus.length ? '<ul class="bp-docs">' + meus.map(dd => '<li' + (dd.pendente ? ' class="pend"' : '') + '><span class="bp-doc-i">' + (dd.pendente ? 'RV' : 'FR') + '</span><div><b>' + esc(dd.n) + '</b><small>' + esc(dd.casa) + ' · ' + esc(dd.desc) + ' · ' + esc(dd.ix) + '</small></div><b>' + eurC(dd.valor) + '</b>' + (dd.pendente ? '<button type="button" class="pt-mini" data-djfat-anexa="' + esc(dd.bk) + '|' + esc(dd.n) + '">Já emiti · anexar PDF</button>' : '') + '</li>').join('') + '</ul>' : (f.on ? '<p class="al-nota">Ainda nenhuma fatura. Sai a primeira quando receberes um sinal ou um cachê.</p>' : ''))
    + '</div>';
}
['input', 'change'].forEach(tp => document.addEventListener(tp, ev => { const i = ev.target.closest('[data-djfat]'); if (i && i.dataset.djfat !== 'sw') fatVals[i.dataset.djfat] = i.type === 'checkbox' ? i.checked : i.value; }));
document.addEventListener('change', ev => {
  const t = ev.target.closest('[data-djfat="sw"]'); if (!t) return;
  const f = fatDe(EU);
  if (t.checked) { fatForm = true; fatErro = ''; } else { fatForm = false; if (f.on) gravaFat(EU, Object.assign(f, {on:false})); }
  document.dispatchEvent(new CustomEvent('streetfy-dj'));
});
document.addEventListener('click', ev => {
  const mb = ev.target.closest('[data-djfat-modo]'); if (mb) { fatModo = mb.dataset.djfatModo; fatErro = ''; document.dispatchEvent(new CustomEvent('streetfy-dj')); return; }
  const ax = ev.target.closest('[data-djfat-anexa]'); if (ax) { const [bk, n] = ax.dataset.djfatAnexa.split('|'), L = bookings(), x = L.find(y => y.id === bk), dd = x && (x.docs || []).find(y => y.n === n); if (dd) { dd.pendente = false; dd.n = dd.n.replace(' · por emitir', ''); dd.ix = 'PDF anexado pelo DJ · enviado à casa'; gravaB(L); } document.dispatchEvent(new CustomEvent('streetfy-dj')); return; }
  const b = ev.target.closest('[data-djfat="ok"],[data-djfat="cancela"]'); if (!b) return;
  if (b.dataset.djfat === 'cancela') { fatForm = false; fatVals = {}; document.dispatchEvent(new CustomEvent('streetfy-dj')); return; }
  const q = k => document.querySelector('[data-djfat="' + k + '"]'), v = k => (q(k) || {}).value || '';
  if (fatModo === 'ligada') {
    const conta = v('conta').trim(), chave = v('chave').trim();
    fatErro = !conta ? 'Diz o nome da conta no emissor.' : chave.length < 8 ? 'A chave da API parece curta demais.' : !q('aut').checked ? 'Falta autorizar a emissão pela tua conta.' : '';
    if (!fatErro) { gravaFat(EU, {on:true, modo:'ligada', emissor:v('emissor'), conta, chave:'••••' + chave.slice(-4), ret:v('ret'), t:Date.now()}); fatForm = false; fatVals = {}; }
  } else {
    fatErro = !q('ativ').checked ? 'Para passar recibos verdes precisas de atividade aberta nas Finanças.' : '';
    if (!fatErro) { gravaFat(EU, {on:true, modo:'manual', ret:v('ret'), t:Date.now()}); fatForm = false; fatVals = {}; }
  }
  document.dispatchEvent(new CustomEvent('streetfy-dj'));
});
/* o que a casa vê e pode fazer em cada estado */
function linhaCasa(x, passou){
  const c = contas(x.cache);
  if (x.estado === 'aceite') return '<span class="dj-prazo">' + (x.sinal ? 'Marcado com mais de ' + SINAL_DIAS + ' dias: agora pagas só o sinal (' + Math.round(SINAL * 100) + '% do cachê) e a taxa. ' : '') + 'Paga até <b>' + esc(quandoH(prazoPagar(x))) + '</b>. Sem pagamento, o booking expira e o DJ fica livre.</span>';
  if (x.estado === 'sinal') return '<span>Sinal de €' + fmt(sinalDe(x)) + ' pago. O resto, <b>€' + fmt(x.cache - sinalDe(x)) + '</b>, ' + (Date.now() >= abreResto(x) ? 'já pode ser pago' : 'abre a ' + esc(quandoH(abreResto(x)))) + ' e paga-se até <b>' + esc(quandoH(prazoPagar(x))) + '</b>. Sem o resto, o booking cai e o sinal fica com o DJ.</span>';
  if (x.estado === 'pago') return '<span>' + eurC(pagoAte(x) || c.total) + ' pagos' + (x.sinal ? ' (sinal + resto)' : ' (' + esc(METODO[x.metodo] || '') + ')') + (passou ? ' · o set já passou: confirma que o DJ tocou' : ' · se cancelares agora, o DJ fica com €' + fmt(paraDJ(x)) + ' do cachê') + '</span>';
  if (x.estado === 'realizado') return '<span>O DJ recebe a ' + esc(dataTxt(x.liberaEm)) + '. Até lá podes abrir um problema.</span>';
  if (x.estado === 'libertado') return '<span>€' + fmt(x.cache) + ' entregues ao DJ. A fatura-recibo dele e a fatura da taxa do Xouty ficam nos documentos da casa.</span>';
  if (x.estado === 'cancelado') return '<span>' + esc(x.cancelTxt || '') + '</span>';
  if (x.estado === 'problema') return '<span>Abriste: "' + esc(x.problema) + '". O dinheiro fica parado até o Xouty decidir (48 h).</span>';
  if (x.estado === 'expirado') return '<span>Não foi pago a tempo. <a href="dj.html#d=' + esc(x.dj) + '">Pedir de novo</a></span>';
  return '';
}
let cancelAberto = '', probAberto = '';
const probForm = x => probAberto === x.id ? '<span class="dj-prob"><select data-djprob="' + x.id + '" aria-label="O que aconteceu"><option>O DJ não apareceu</option><option>Chegou muito atrasado</option><option>Tocou bem menos tempo</option><option>Outro</option></select><button type="button" class="pt-mini" data-djp="casa-prob" data-id="' + x.id + '">Enviar</button><button type="button" class="pt-mini" data-djp="prob-nao" data-id="' + x.id + '">Fechar</button></span>' : '<button type="button" class="pt-mini" data-djp="prob-abre" data-id="' + x.id + '">Houve um problema</button>';
function acoesCasa(x, passou){
  const ac = h => '<div class="dj-bk-ac">' + h + '</div>';
  const pag = '<a class="pt-mini" href="booking-pagar.html#b=' + encodeURIComponent(x.id) + '">Recibo e faturas</a>';
  const cancela = txt => cancelAberto === x.id ? '<span class="dj-conf">Cancelar? ' + txt + ' <button type="button" class="pt-mini" data-djp="casa-cancela" data-id="' + x.id + '">Sim, cancelar</button><button type="button" class="pt-mini" data-djp="cancel-nao" data-id="' + x.id + '">Não</button></span>' : '<button type="button" class="pt-mini" data-djp="cancel-abre" data-id="' + x.id + '">Cancelar booking</button>';
  if (x.estado === 'sinal') return ac((Date.now() >= abreResto(x) ? '<a class="s-btn pink" href="booking-pagar.html#b=' + encodeURIComponent(x.id) + '">Pagar o resto €' + fmt(parte(x).total) + '</a>' : '<button type="button" class="s-btn ghost" disabled>O resto abre a ' + esc(dataTxt(new Date(abreResto(x)).toISOString().slice(0, 10))) + '</button>') + pag + cancela('O sinal de €' + fmt(sinalDe(x)) + ' fica com o DJ.'));
  if (x.estado === 'aceite') return ac('<a class="s-btn pink" href="booking-pagar.html#b=' + encodeURIComponent(x.id) + '">' + (x.sinal ? 'Pagar o sinal ' : 'Pagar ') + eurC(parte(x).total) + '</a><button type="button" class="s-btn ghost" data-djp="casa-desiste" data-id="' + x.id + '">Desistir</button>');
  if (x.estado === 'pago' && passou) return ac('<button type="button" class="s-btn mint" data-djp="casa-tocou" data-id="' + x.id + '">O DJ tocou ✓</button>' + probForm(x));
  if (x.estado === 'pago') { const dj = paraDJ(x), volta = r2(x.cache - dj); return ac(pag + cancela((dj ? 'O DJ fica com €' + fmt(dj) + '.' : '') + (volta ? ' Recebes de volta €' + fmt(volta) + ' (a taxa não volta).' : ''))); }
  if (x.estado === 'realizado') return ac(pag + probForm(x));
  if (x.estado === 'libertado' || (x.estado === 'cancelado' && x.docs)) return ac(pag);
  return '';
}
/* lado da casa (portal do local): os bookings que pediu e as contrapropostas dos DJs */
function portalCasa(casaK){
  const L = bookings().filter(x => x.casaK === casaK).sort((a, b) => b.t - a.t), EST = {pendente:'à espera do DJ', contraproposta:'contraproposta do DJ', aceite:'aceite · falta pagar', sinal:'sinal pago · falta o resto', pago:'pago · retido até ao set', realizado:'set confirmado', libertado:'pago ao DJ', recusado:'recusado', expirado:'expirou sem pagamento', cancelado:'cancelado', problema:'problema em análise'};
  const cls = e => /^(sinal|pago|realizado|libertado)$/.test(e) ? 'aprovada' : /^(recusado|expirado|cancelado)$/.test(e) ? 'recusada' : 'pendente';
  const passou = x => Date.now() > inicioSet(x).getTime();
  return '<div class="pt-card dj-bks" id="casa-djs"><div class="pt-ch"><h3>DJs · bookings</h3><a class="pt-mini" href="djs.html">Procurar DJs</a></div>'
    + (L.length ? L.map(x => { const d = porId(x.dj) || {art:x.dj, foto:'dj'}; return '<div class="dj-bk-i"><div><b><a href="dj.html#d=' + x.dj + '">' + esc(d.art) + '</a> · ' + esc(dataTxt(x.data)) + ' · ' + esc(x.hora) + '</b><span>' + (x.nota ? esc(x.nota) + ' · ' : '') + 'cachê €' + fmt(x.cache) + (x.estado === 'contraproposta' ? ' · o DJ pede <b>€' + fmt(x.contra) + '</b>' : '') + '</span><span class="pt-ap ' + cls(x.estado) + '">' + EST[x.estado] + '</span>' + linhaCasa(x, passou(x)) + '</div>'
        + (x.estado === 'contraproposta' ? '<div class="dj-bk-ac"><button type="button" class="s-btn mint" data-djp="casa-ok" data-id="' + x.id + '">Aceitar €' + fmt(x.contra) + ' e pagar</button><button type="button" class="s-btn ghost" data-djp="casa-no" data-id="' + x.id + '">Recusar</button></div>' : '')
        + acoesCasa(x, passou(x)) + '</div>'; }).join('') : '<p class="al-nota">Ainda não pediste nenhum DJ. Abre o perfil de um DJ e toca em "Pedir booking".</p>')
    + '</div>';
}
document.addEventListener('click', ev => {
  const b = ev.target.closest('[data-djp]'); if (!b) return;
  const a = b.dataset.djp, L = bookings(), x = L.find(y => y.id === b.dataset.id), d = porId(EU);
  if (a === 'aceita' && x) { x.estado = 'aceite'; x.aceiteT = Date.now(); x.sinal = diasAte(x) > SINAL_DIAS; }
  if (a === 'casa-ok' && x) { x.cache = x.contra; x.estado = 'aceite'; x.aceiteT = Date.now(); x.sinal = diasAte(x) > SINAL_DIAS; gravaB(L); location.href = 'booking-pagar.html#b=' + encodeURIComponent(x.id); return; }
  if (a === 'casa-desiste' && x) { x.estado = 'cancelado'; x.cancelTxt = 'Desististe antes de pagar. Nada foi cobrado.'; }
  if (a === 'cancel-abre') cancelAberto = b.dataset.id;
  if (a === 'cancel-nao') cancelAberto = '';
  if (a === 'prob-abre') probAberto = b.dataset.id;
  if (a === 'prob-nao') probAberto = '';
  if (a === 'casa-cancela' && x) { const dj = paraDJ(x), m = dj / x.cache; x.estado = 'cancelado'; x.multa = m; { const ja = (x.docs || []).filter(dd => dd.dj).reduce((a2, dd) => a2 + dd.valor, 0); emiteDJ(x, r2(dj - ja), 'Fatura-recibo do DJ · parte do cachê por cancelamento'); } const pago = r2(pagoAte(x) - (x.docs || []).reduce((a, d) => a + d.valor, 0)), volta = Math.max(0, r2(pago - dj)); x.cancelTxt = 'Cancelaste. ' + (dj ? 'O DJ fica com €' + fmt(dj) + '. ' : '') + (volta ? '€' + fmt(volta) + ' voltam pelo mesmo meio em até 5 dias úteis.' : ''); cancelAberto = ''; }
  if (a === 'casa-tocou' && x) { x.estado = 'realizado'; x.realizadoT = Date.now(); x.por = 'casa'; x.liberaEm = diaMais(x.data, 2); }
  if (a === 'cheguei' && x) { x.chegouT = Date.now(); x.por = 'dj'; x.estado = 'realizado'; x.liberaEm = diaMais(x.data, 2); }
  if (a === 'casa-prob' && x) { const sl = document.querySelector('[data-djprob="' + x.id + '"]'); x.problema = sl ? sl.value : 'Outro'; x.estado = 'problema'; probAberto = ''; }
  if (a === 'dj-cancela' && x) { const tx = (x.docs || []).filter(d => /^FR/.test(d.n)).reduce((s2, d) => s2 + d.valor, 0); if (tx) x.docs.push(docIX('NC', 'Nota de crédito · taxa devolvida (o DJ cancelou)', -tx)); x.estado = 'cancelado'; x.cancelTxt = 'O DJ cancelou. Recebes de volta tudo o que pagaste' + (x.sinal ? ', sinal incluído' : '') + ', e a taxa, em até 5 dias úteis.'; }
  if (a === 'casa-no' && x) x.estado = 'recusado';
  if (a === 'recusa' && x) x.estado = 'recusado';
  if (a === 'contra' && x) { const v = +(document.querySelector('[data-djc="' + x.id + '"]') || {}).value; if (!v) return; x.estado = 'contraproposta'; x.contra = v; }
  if (a === 'mixadd') { const g = k => (document.querySelector('[data-djm="' + k + '"]') || {}).value || ''; if (!g('t').trim()) return; const M = ler('streetfy:dj-mixes', {}); M[EU] = mixes(d).concat([[g('t').trim(), Math.max(1, +g('m') || 60), g('p')]]); gravar('streetfy:dj-mixes', M); }
  if (a === 'mixrm') { const M = ler('streetfy:dj-mixes', {}); M[EU] = mixes(d).filter((_, k) => k !== +b.dataset.k); gravar('streetfy:dj-mixes', M); }
  gravaB(L); document.dispatchEvent(new CustomEvent('streetfy-dj'));
});
document.addEventListener('input', ev => {
  const c = ev.target.closest('[data-djc]'); if (c) { contra[c.dataset.djc] = c.value; return; }
  const r = ev.target.closest('[data-dj-rider]'); if (r) { const R = ler('streetfy:dj-rider', {}); R[EU] = r.value.split('\n').map(s => s.trim()).filter(Boolean); gravar('streetfy:dj-rider', R); const ok = document.querySelector('[data-dj-rok]'); if (ok) ok.textContent = 'Guardado ✓ · já aparece no teu perfil.'; }
});

document.querySelectorAll('[data-djs]').forEach(grelha);
document.querySelectorAll('[data-dj-perfil]').forEach(perfil);
window.STREETFY_DJS = {lista:D, setsDe, porId, portalDJ, portalCasa, NIVEL, EU, bookings, gravaB, contas, parte, registaPagamento, fatDe, REGIME, sinalDe, pagoAte, abreResto, mbPode, SINAL, SINAL_DIAS, RESTO_ATE, prazoPagar, inicioSet, multa, quandoH, dataTxt, eurC, METODO, diaMais, TAXA, IVA};
})();
