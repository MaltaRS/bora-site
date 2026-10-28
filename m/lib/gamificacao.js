/* Xouty · gamificacao.js — conquistas: nível, sequência, selos, passaporte de bairros, ranking entre amigos, desafios das casas e ligas dos profissionais.
   Página: conquistas.html ([data-gami]). Também dá o bloco do perfil (user.js), o cartão "Desafios" da casa e a "Liga do mês" no portal (portal.js).
   Guardado neste aparelho: streetfy:desafios-casa (os que a casa cria), streetfy:gami-desafios (os que aceitaste), streetfy:gami-rank (ranking ligado).
   Números de pontos e selos fictícios no protótipo.
   Regras de base: os pontos só vêm do que o Xouty verifica (check-in por QR, "Eu vou" cumprido, avaliação com check-in, amigo indicado que foi);
   nada premia beber mais; o ranking entre amigos é fechado por omissão; não sair nunca tira pontos (a sequência só pausa). */
(function(){
'use strict';
const el = document.querySelector('[data-gami]');
const ler = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } };
const gravar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const av = n => 'img/pessoas/' + n + '.jpg';
const XP = [['Check-in verificado na porta', 50], ['Primeira vez numa casa', 60], ['Disseste "Eu vou" e foste', 30], ['Avaliação depois do check-in', 20], ['Amigo que indicaste foi mesmo', 40]];
const SELOS = [
  {id:'primeira', ic:'★', n:'Primeira noite', d:'O primeiro check-in no Xouty.', ok:true, q:'12 set'},
  {id:'dez', ic:'10', n:'Dez casas', d:'Check-in em 10 casas diferentes.', ok:true, q:'18 out'},
  {id:'techno', ic:'♜', n:'Rei do techno', d:'10 noites de techno.', p:[8, 10]},
  {id:'madruga', ic:'☀', n:'Madrugador', d:'Ainda na pista depois das 6h, três vezes.', ok:true, q:'25 out'},
  {id:'porto', ic:'⚓', n:'Explorador do Porto', d:'5 casas no Porto.', p:[2, 5]},
  {id:'fado', ic:'♪', n:'Fadista', d:'3 noites de fado em Alfama ou na Mouraria.', p:[1, 3]},
  {id:'sol', ic:'◐', n:'Pôr do sol', d:'4 terraços ou rooftops antes das 21h.', ok:true, q:'5 out'},
  {id:'lista', ic:'✓', n:'Na lista', d:'Entraste por lista de convidados 5 vezes.', p:[3, 5]},
  {id:'critico', ic:'✎', n:'Crítico da noite', d:'10 avaliações com check-in.', p:[6, 10]},
  {id:'padrinho', ic:'♥', n:'Padrinho', d:'3 amigos que indicaste foram mesmo.', ok:true, q:'21 out'},
  {id:'halloween', ic:'☾', n:'Halloween 2026', d:'Selo da estação: check-in numa festa de Halloween entre 30 out e 2 nov.', p:[0, 1], sazonal:true},
  {id:'agua', ic:'◇', n:'Noite leve', d:'3 noites em que pediste só bebidas sem álcool pelo menu da mesa. Conta igual a qualquer outra.', p:[1, 3]}];
const BAIRROS = {Lisboa:[['Bairro Alto', 1], ['Cais do Sodré', 1], ['Santa Apolónia', 1], ['Alfama', 1], ['Santos', 1], ['Príncipe Real', 0], ['Intendente', 0], ['Marvila', 0]], Porto:[['Galerias de Paris', 1], ['Baixa', 1], ['Ribeira', 0], ['Cedofeita', 0], ['Bonfim', 0], ['Foz do Douro', 0]]};
const NIVEIS = [[1, 'Estreante', ''], [3, 'Habitué', 'selo no perfil e o teu "Eu vou" sobe para os amigos'], [5, 'Da casa', 'fila rápida nas casas aderentes (Lux Frágil, Plano B)'], [7, 'Noctívago', 'uma bebida sem álcool oferecida por mês numa casa parceira'], [10, 'Lenda da noite', 'pré-venda 24 h antes de toda a gente']];
const AMIGOS = [['leonor-s', 'Leonor S.', 340, 3], ['mariana-c', 'Tu', 290, 2, true], ['hugo-m', 'Hugo M.', 240, 2], ['sara-d', 'Sara D.', 180, 1], ['kiko-r', 'Kiko R.', 120, 1], ['tomas-f', 'Tomás F.', 60, 1]];
const DESAFIOS0 = [
  {id:'lux', casa:'Lux Frágil', casaK:'lisboa/lux fragil', img:'lux', t:'3 noites em novembro', premio:'a 4.ª entrada é por conta da casa', p:[1, 3], fim:'30 nov', aceites:212, completos:41},
  {id:'bleza', casa:'B.Leza', casaK:'lisboa/b leza', img:'dj', t:'2 sextas de baile', premio:'aula de kizomba para dois', p:[0, 2], fim:'15 dez'},
  {id:'maus', casa:'Maus Hábitos', casaK:'porto/maus habitos', img:'pclerigos', t:'Traz 2 amigos que nunca vieram', premio:'entrada grátis para os três', p:[0, 2], fim:'31 dez'}];
const DK = 'streetfy:desafios-casa', AK = 'streetfy:gami-desafios', RK = 'streetfy:gami-rank';
const MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const fimTxt = s => { const d = new Date(s + 'T12:00'); return d.getDate() + ' ' + MES[d.getMonth()]; };
const HOJE = new Date().toISOString().slice(0, 10);
/* os da casa: {id, casa, casaK, img, t, meta, conta:'checkin'|'amigos', premio, ate, criado, fim?:'encerrado'} */
const daCasa = () => ler(DK, []);
const DESAFIOS = () => daCasa().filter(d => !d.encerrado && d.ate >= HOJE).map(d => ({id:d.id, casa:d.casa, casaK:d.casaK, img:d.img, t:d.t, premio:d.premio, p:[0, d.meta], fim:fimTxt(d.ate)})).concat(DESAFIOS0);
const LIGA = [['Rita M.', 'rita-m', 612, 'Ouro'], ['Tiago R.', 'tiago-r', 498, 'Ouro'], ['Marco S.', 'marco-s', 301, 'Prata'], ['Joana P.', '', 188, 'Bronze']];
let aceites = ler(AK, {lux:true}), rank = ler(RK, false), aberto = null;

const sec = (t, sub, corpo, cls) => '<section class="gm-s' + (cls ? ' ' + cls : '') + '"><div class="gm-sh"><h2 class="s-h">' + t + '</h2>' + (sub ? '<p>' + sub + '</p>' : '') + '</div>' + corpo + '</section>';
function desenha(){
  const ganhos = SELOS.filter(s => s.ok).length, sel = SELOS.find(s => s.id === aberto);
  el.innerHTML = '<div class="gm-top"><div class="gm-nivel"><img src="' + av('mariana-c') + '" alt=""><div><span class="gm-k">Nível 7 · Noctívaga</span><b>1 840 <small>/ 2 500 pontos</small></b><div class="gm-bar"><i style="width:73.6%"></i></div><small>Faltam 660 pontos para o nível 8. Mais ou menos 4 noites.</small></div></div>'
  + '<div class="gm-seq"><span class="gm-k">Sequência</span><b>6 <small>semanas seguidas</small></b><div class="gm-sem">' + ['s38', 's39', 's40', 's41', 's42', 's43', 's44', 's45'].map((s, k) => '<i class="' + (k < 6 ? 'on' : k === 6 ? 'agora' : '') + '" title="' + s + '">' + (k < 6 ? '✓' : k === 6 ? '?' : '') + '</i>').join('') + '</div><small>Sai até domingo para manter. Uma semana em casa por mês não quebra a sequência.</small></div></div>'
  + sec('COMO SE <em>GANHA</em>', 'Só conta o que o Xouty consegue confirmar. Comprar ou beber mais não dá pontos.', '<div class="gm-xp">' + XP.map(([t, n]) => '<div><span>' + esc(t) + '</span><b>+' + n + '</b></div>').join('') + '</div>')
  /* selos */
  + sec('SELOS · <em>' + ganhos + ' de ' + SELOS.length + '</em>', 'Toca num selo para ver como se ganha.', '<div class="gm-selos">' + SELOS.map(s => { const pct = s.p ? s.p[0] / s.p[1] * 100 : 100; return '<button type="button" class="gm-selo' + (s.ok ? ' ok' : '') + (s.sazonal ? ' saz' : '') + (aberto === s.id ? ' on' : '') + '" data-selo="' + s.id + '" aria-expanded="' + (aberto === s.id) + '"><span class="gm-ic">' + esc(s.ic) + '</span><b>' + esc(s.n) + '</b>' + (s.ok ? '<small>ganho a ' + esc(s.q) + '</small>' : '<span class="gm-pb"><i style="width:' + pct + '%"></i></span><small>' + s.p[0] + ' / ' + s.p[1] + '</small>') + (s.sazonal ? '<em>da estação</em>' : '') + '</button>'; }).join('') + '</div>'
    + (sel ? '<div class="gm-det"><span class="gm-ic">' + esc(sel.ic) + '</span><div><b>' + esc(sel.n) + '</b><p>' + esc(sel.d) + '</p><small>' + (sel.ok ? 'Ganho a ' + esc(sel.q) + '. Aparece no teu perfil se quiseres.' : 'Faltam ' + (sel.p[1] - sel.p[0]) + '.') + '</small></div><button type="button" class="gm-x" data-selo="" aria-label="Fechar">×</button></div>' : ''))
  /* passaporte */
  + sec('PASSAPORTE DE <em>BAIRROS</em>', 'Um carimbo por bairro com check-in. Completar uma cidade dá um selo.', '<div class="gm-pass">' + Object.entries(BAIRROS).map(([c, bs]) => '<div class="gm-cid"><div class="gm-cid-h"><b>' + c + '</b><small>' + bs.filter(b => b[1]).length + ' de ' + bs.length + '</small></div><div class="gm-stamps">' + bs.map(([b, ok], k) => '<span class="gm-st' + (ok ? ' ok' : '') + '" style="--r:' + ((k * 37 % 15) - 7) + 'deg">' + esc(b) + (ok ? '<i>✓</i>' : '') + '</span>').join('') + '</div></div>').join('') + '</div>')
  /* níveis */
  + sec('O QUE O NÍVEL <em>DÁ</em>', 'As vantagens são oferecidas pelas casas que aderem. O Xouty só confirma o nível.', '<ol class="gm-lad">' + NIVEIS.map(([n, nome, v]) => '<li class="' + (n <= 7 ? 'ok' : '') + (n === 7 ? ' eu' : '') + '"><span>' + n + '</span><div><b>' + nome + (n === 7 ? ' <em>estás aqui</em>' : '') + '</b><small>' + (v || 'o começo') + '</small></div></li>').join('') + '</ol>')
  /* amigos */
  + sec('ENTRE <em>AMIGOS</em>', 'Ranking da semana só entre amigos que também aceitaram. Fechado por omissão.',
    '<label class="gm-sw"><span>Participar no ranking dos amigos<small>' + (rank ? 'Os teus amigos que participam veem os teus pontos da semana.' : 'Desligado: ninguém vê os teus pontos.') + '</small></span><input type="checkbox" class="pt-sw" data-rank' + (rank ? ' checked' : '') + '></label>'
    + (rank ? '<ol class="gm-rank">' + AMIGOS.map(([f, n, p, noites, eu], k) => '<li class="' + (eu ? 'eu' : '') + '"><span class="gm-pos">' + (k + 1) + '</span><img src="' + av(f) + '" alt=""><b>' + n + '</b><small>' + noites + (noites > 1 ? ' noites' : ' noite') + '</small><em>' + p + '</em></li>').join('') + '</ol><p class="gm-turma"><b>A turma mais presente</b> · tu, Leonor e Hugo saíram juntos 3 vezes este mês. <span>+30 pontos a cada um na próxima noite em grupo.</span></p>' : '<div class="gm-fech">Liga para ver quem dos teus amigos saiu mais esta semana.</div>'))
  /* desafios */
  + sec('DESAFIOS DAS <em>CASAS</em>', 'A casa cria o desafio no portal. Aceitas, e o progresso conta sozinho com cada check-in.',
    '<div class="gm-des">' + DESAFIOS().map(d => { const a = aceites[d.id]; return '<article class="gm-d"><div class="gm-d-im" style="background-image:url(img/' + d.img + '.jpg)"><span>' + esc(d.casa) + '</span></div><div class="gm-d-bd"><b>' + esc(d.t) + '</b><p>→ ' + esc(d.premio) + '</p>'
      + (a ? '<div class="gm-pb big"><i style="width:' + (d.p[0] / d.p[1] * 100) + '%"></i></div><small>' + d.p[0] + ' de ' + d.p[1] + ' · até ' + esc(d.fim) + '</small><button type="button" class="pt-mini" data-des="' + d.id + '">Sair do desafio</button>' : '<small>até ' + esc(d.fim) + ' · só com check-in</small><button type="button" class="s-btn pink" data-des="' + d.id + '">Aceitar desafio</button>') + '</div></article>'; }).join('') + '</div>'
    + '<p class="al-nota">As casas criam os desafios no portal. Prémios com álcool não são aceites, e a casa vê quantos aceitaram e completaram, nunca quem.</p>')
  /* profissionais */
  + sec('PARA <em>PROFISSIONAIS</em>', 'Promoters e DJs já têm níveis. Aqui viram ligas mensais e selos próprios.',
    '<div class="gm-2"><div class="gm-liga"><span class="gm-k">Liga dos promoters · Lisboa · novembro</span><ol>' + LIGA.map(([n, id, p, l], k) => '<li><span class="gm-pos">' + (k + 1) + '</span>' + (id ? '<a href="promoter.html#p=' + id + '">' + n + '</a>' : '<b>' + n + '</b>') + '<small>' + p + ' presenças verificadas</small><em class="gm-l ' + l.toLowerCase() + '">' + l + '</em></li>').join('') + '</ol><small>Ouro: comissão +1 pp nas casas que aderem e destaque na grelha de promoters.</small></div>'
    + '<div class="gm-djs"><span class="gm-k">Selos de DJ</span>' + [['Pista cheia', '10 sets com lotação acima de 90%', true], ['1 000 pessoas trazidas', 'pelo link do DJ', true], ['Residente do ano', '12 meses na mesma casa', false], ['Primeiro set no Porto', 'booking aceite fora de Lisboa', false]].map(([n, d, ok]) => '<div class="gm-dj' + (ok ? ' ok' : '') + '"><span class="gm-ic">' + (ok ? '✓' : '·') + '</span><div><b>' + n + '</b><small>' + d + '</small></div></div>').join('') + '</div></div>')
  /* regras */
  + sec('AS <em>REGRAS</em>', '', '<ul class="gm-reg"><li><b>Só o verificado conta.</b> Check-in por QR, "Eu vou" cumprido, avaliação depois do check-in.</li><li><b>Nada premia beber.</b> Nem quantidade, nem garrafas, nem shots. A "Noite leve" vale o mesmo que as outras.</li><li><b>Fechado por omissão.</b> Pontos, selos e ranking só aparecem a quem tu deixares, como a presença.</li><li><b>Não sair não castiga.</b> A sequência pausa, os pontos ficam.</li><li><b>Sem comprar pontos.</b> Não há pontos pagos nem pontos que valem dinheiro.</li></ul>');
}
const ANTI = /\b(cerveja|imperial|fino|shots?|vinho|gin|garrafa|[áa]lcool|cocktails?|sangria|vodka|whisky|espumante|champanhe|mojito|caipirinha|rum|licor|aperol|ponche|tequila)\b/i;
/* ---------- portal da casa: criar, ver e encerrar desafios ---------- */
const CASA = {nome:'Lux Frágil', k:'lisboa/lux fragil', img:'lux'};
let gdErro = '';
function cardCasa(){
  const meus = daCasa().filter(d => d.casaK === CASA.k), base = DESAFIOS0.filter(d => d.casaK === CASA.k);
  const linha = (d, base) => { const ativo = base || (!d.encerrado && d.ate >= HOJE), ac = base ? d.aceites : (aceites[d.id] ? 1 : 0), co = base ? d.completos : 0;
    return '<div class="gd-r' + (ativo ? '' : ' fim') + '"><div><b>' + esc(d.t) + '</b><small>→ ' + esc(d.premio) + ' · até ' + esc(base ? d.fim : fimTxt(d.ate)) + (base ? '' : ' · conta ' + (d.conta === 'amigos' ? 'amigos novos que fazem check-in' : 'check-in verificado')) + '</small></div><span class="gd-n"><b>' + ac + '</b> aceitaram</span><span class="gd-n"><b>' + co + '</b> completaram</span>'
      + (base ? '<span class="pt-est ag">a decorrer</span>' : ativo ? '<button type="button" class="pt-mini" data-gd-fim="' + esc(d.id) + '">Encerrar</button>' : '<span class="pt-est">encerrado</span>') + '</div>'; };
  return '<div class="pt-card gd-card" data-gd><div class="pt-ch"><h3>Desafios</h3><a class="pt-mini" href="conquistas.html#desafios">Ver como aparece</a></div>'
    + '<p class="al-nota">Um objetivo e um prémio para quem vem. Conta sozinho com o check-in na porta. Vês quantos aceitaram e completaram, nunca quem.</p>'
    + '<div class="gd-l">' + meus.map(d => linha(d, false)).join('') + base.map(d => linha(d, true)).join('') + '</div>'
    + '<form class="pt-form gd-f" data-gd-form><h4>Novo desafio</h4><div class="gd-g"><label>Objetivo<input name="t" maxlength="40" required placeholder="ex.: 3 sextas em dezembro"></label><label>Quantas vezes<input name="meta" type="number" min="1" max="10" value="3" required></label>'
    + '<label>Conta como<select name="conta"><option value="checkin">check-in verificado na casa</option><option value="amigos">amigo novo que faz check-in</option></select></label><label>Até<input name="ate" type="date" min="' + HOJE + '" required></label>'
    + '<label class="gd-p">Prémio<input name="premio" maxlength="50" required placeholder="ex.: a entrada seguinte é por conta da casa"></label></div>'
    + (gdErro ? '<p class="en-err" role="alert">' + esc(gdErro) + '</p>' : '') + '<p class="al-nota">Prémios com álcool não são aceites (bebida sem álcool, entrada, comida, merch ou experiência sim). Um desafio por pessoa de cada vez.</p><button class="s-btn ink" type="submit">Lançar desafio</button></form></div>';
}
const trocaCard = () => { const c = document.querySelector('[data-gd]'); if (!c) return; const d = document.createElement('div'); d.innerHTML = cardCasa(); c.replaceWith(d.firstElementChild); };
document.addEventListener('submit', ev => {
  const f = ev.target.closest('[data-gd-form]'); if (!f) return; ev.preventDefault();
  const t = f.t.value.trim(), premio = f.premio.value.trim(), meta = +f.meta.value, ate = f.ate.value;
  gdErro = !t || !premio || !ate ? 'Preenche o objetivo, o prémio e a data.' : ANTI.test(premio) || ANTI.test(t) ? 'Prémios e desafios com álcool não são aceites. Troca por uma bebida sem álcool, a entrada ou comida.' : ate < HOJE ? 'A data já passou.' : !(meta >= 1 && meta <= 10) ? 'Entre 1 e 10 vezes.' : '';
  if (!gdErro) { const L = daCasa(); L.unshift({id:'d' + Date.now().toString(36), casa:CASA.nome, casaK:CASA.k, img:CASA.img, t, meta, conta:f.conta.value, premio, ate, criado:Date.now()}); gravar(DK, L); }
  trocaCard();
});
document.addEventListener('click', ev => {
  const b = ev.target.closest('[data-gd-fim]'); if (!b) return;
  const L = daCasa(), d = L.find(x => x.id === b.dataset.gdFim); if (d) { d.encerrado = true; gravar(DK, L); } gdErro = ''; trocaCard();
});
/* ---------- portal do promoter e do DJ: a liga do mês ---------- */
function cardPro(papel){
  const eu = papel === 'dj' ? ['NVRL', 1840, 'Ouro', 2, 'pessoas trazidas'] : ['Rita M.', 612, 'Ouro', 1, 'presenças verificadas'];
  return '<div class="pt-card"><div class="pt-ch"><h3>Liga do mês</h3><a class="pt-mini" href="conquistas.html#pro">Ver a liga</a></div><div class="gp"><span class="gm-l ' + eu[2].toLowerCase() + '">' + eu[2] + '</span><b>' + eu[3] + '.º</b><span>em Lisboa · ' + eu[1].toLocaleString('pt-PT') + ' ' + eu[4] + ' em novembro</span></div>'
    + '<p class="al-nota">Só contam presenças verificadas na porta. Ouro dá +1 pp de comissão nas casas que aderem e destaque na grelha. A liga recomeça no dia 1.</p></div>';
}
/* ---------- bloco do perfil (user.js) ---------- */
const hashN = s => String(s).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
function perfil(id, souEu){
  const nv = souEu ? 7 : 2 + hashN(id) % 6, nome = souEu ? 'Noctívaga' : (NIVEIS.slice().reverse().find(x => x[0] <= nv) || NIVEIS[0])[1];
  const selos = souEu ? SELOS.filter(s => s.ok) : SELOS.filter((s, k) => (hashN(id) + k) % 3 === 0).slice(0, 4);
  return '<div class="gu"><div class="gu-n"><span>' + nv + '</span><div><b>' + esc(nome) + '</b><small>nível ' + nv + (souEu ? ' · 1 840 pontos · sequência de 6 semanas' : '') + '</small></div></div>'
    + '<div class="gu-s">' + selos.map(s => '<span title="' + esc(s.d) + '"><i>' + esc(s.ic) + '</i>' + esc(s.n) + '</span>').join('') + '</div>'
    + (souEu ? '<a class="s-btn ghost" href="conquistas.html">Ver as conquistas</a>' : '') + '</div>';
}
window.STREETFY_GAMI = {cardCasa, cardPro, perfil, DESAFIOS, XP, SELOS, BAIRROS, NIVEIS, AMIGOS, LIGA, AK, RK, DK, ler, gravar};
if (!el) return;
el.addEventListener('click', ev => {
  const b = ev.target.closest('[data-selo],[data-des]'); if (!b) return;
  if (b.dataset.selo !== undefined) aberto = b.dataset.selo && aberto !== b.dataset.selo ? b.dataset.selo : null;
  if (b.dataset.des) { aceites[b.dataset.des] = !aceites[b.dataset.des]; gravar(AK, aceites); }
  const y = window.scrollY; desenha(); window.scrollTo(0, y);
});
el.addEventListener('change', ev => { if (ev.target.matches('[data-rank]')) { rank = ev.target.checked; gravar(RK, rank); const y = window.scrollY; desenha(); window.scrollTo(0, y); } });
desenha();
/* conquistas.html#desafios e #pro levam direto à secção */
const ir = () => { const s = {'#desafios':'DESAFIOS', '#pro':'PROFISSIONAIS'}[location.hash]; const t = s && [...el.querySelectorAll('.gm-s')].find(x => x.querySelector('h2').textContent.includes(s)); if (t) t.scrollIntoView({block:'start'}); };
ir(); window.addEventListener('hashchange', ir);
})();
