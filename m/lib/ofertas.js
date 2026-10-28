/* Ofertas na rua: a casa oferece algo grátis (bebida, comida, bilhete ou voucher) a quem está numa zona — um raio à volta da casa
   ou uma zona desenhada no mapa (ex.: o Bairro Alto). Regras:
   · privacidade: a posição nunca sai do telemóvel; a casa recebe a zona e vê só números agregados;
   · álcool: só 18+ e uma oferta com álcool por pessoa por noite, sempre com alternativa sem álcool;
   · concorrência: a zona é de ruas e praças; não se mira quem fez check-in dentro de outra casa;
   · quem aceita recebe um voucher em QR (OF-…), válido N minutos; o funcionário com "Validar ofertas" lê-o no Modo porta e fica usado.
   Guardado neste aparelho em streetfy:ofertas. Protótipo: a casa é o Lux Frágil e "tu" és a Mariana Costa. */
(function(){
const K = 'streetfy:ofertas', LK = 'streetfy:loc-sim', EU = 'Mariana Costa';
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const ler = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } };
const gravar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const hash = s => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h; };
const nid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
const hhmm = t => { const d = new Date(t); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
const fmt = n => Math.round(n).toLocaleString('pt-PT');
const CASA = {k:'lisboa/lux fragil', nome:'Lux Frágil', bairro:'Santa Apolónia', lat:38.7141, lng:-9.121};
const SIM = [['Bairro Alto', 38.7128, -9.1446], ['Cais do Sodré', 38.7068, -9.1449], ['Alfama', 38.7115, -9.1300], ['Santa Apolónia', 38.7138, -9.1228], ['Porto · Ribeira', 41.1408, -8.6130]];
const TIPOS = {bebida:'Bebida', comida:'Comida', bilhete:'Bilhete grátis', voucher:'Voucher'};
const PUB = {todos:'Todos na zona', seguidores:'Só quem segue a casa', novos:'Só quem nunca veio'};
const R_MIN = 150, R_MAX = 2000, AREA_MIN = Math.PI * R_MIN * R_MIN;
const BAIRRO_ALTO = [[38.71455, -9.14755], [38.71470, -9.14345], [38.71160, -9.14205], [38.71035, -9.14455], [38.71150, -9.14745]];

/* ---------- geometria (metros) ---------- */
const dist = (a, b) => { const R = 6371e3, r = x => x * Math.PI / 180, dLa = r(b[0] - a[0]), dLo = r(b[1] - a[1]); const h = Math.sin(dLa / 2) ** 2 + Math.cos(r(a[0])) * Math.cos(r(b[0])) * Math.sin(dLo / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
const noPoli = (p, pts) => { let d = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [yi, xi] = pts[i], [yj, xj] = pts[j]; if (((yi > p[0]) !== (yj > p[0])) && (p[1] < (xj - xi) * (p[0] - yi) / (yj - yi) + xi)) d = !d; } return d; };
const area = pts => { if (pts.length < 3) return 0; const la0 = pts[0][0] * Math.PI / 180, kx = 111320 * Math.cos(la0), ky = 110540; let s = 0; for (let i = 0; i < pts.length; i++) { const [a1, o1] = pts[i], [a2, o2] = pts[(i + 1) % pts.length]; s += o1 * kx * a2 * ky - o2 * kx * a1 * ky; } return Math.abs(s) / 2; };
const centro = z => z.tipo === 'raio' ? z.c : [z.pts.reduce((a, p) => a + p[0], 0) / z.pts.length, z.pts.reduce((a, p) => a + p[1], 0) / z.pts.length];
const dentro = (z, p) => !!(z && p) && (z.tipo === 'raio' ? dist(z.c, p) <= z.r : noPoli(p, z.pts));
const nomeZona = z => { if (z.tipo === 'raio') return 'raio de ' + fmt(z.r) + ' m à volta da casa'; const c = centro(z); const s = SIM.slice().sort((a, b) => dist([a[1], a[2]], c) - dist([b[1], b[2]], c))[0]; return 'zona desenhada · ' + (dist([s[1], s[2]], c) < 900 ? s[0] : 'no mapa'); };
/* alcance estimado: lugares do catálogo dentro da zona × gente típica a esta hora (só números, nunca quem) */
function alcance(z){
  const C = window.STREETFY_CATALOGO; if (!C || !z) return {pessoas:0, lugares:0};
  const vistos = new Set(); let p = 0;
  C.itens.forEach(i => { if (i.lat == null || i.lng == null || !i.lugar) return; const k = C.lugarKey(i); if (vistos.has(k) || k === CASA.k) return; if (dentro(z, [+i.lat, +i.lng])) { vistos.add(k); p += 18 + hash(k) % 45; } });
  return {pessoas:p, lugares:vistos.size};
}

/* ---------- dados ---------- */
const SEMENTE = () => { const t = Date.now(), z = {tipo:'poli', pts:BAIRRO_ALTO};
  return {ofertas:[{id:'o1', casa:CASA, tipo:'bebida', titulo:'1 cerveja', alcool:true, alt:'ou 1 refrigerante', qtd:40, validade:45, inicio:t - 20 * 6e4, fim:t + 100 * 6e4, zona:z, publico:'todos', criada:t - 20 * 6e4, base:{aceites:7, usadas:4}, alcanceIni:0},
    {id:'o2', casa:CASA, tipo:'bilhete', titulo:'entrada grátis até à 1h', alcool:false, alt:'', qtd:25, validade:120, inicio:t - 10 * 6e4, fim:t + 150 * 6e4, zona:z, publico:'seguidores', criada:t - 10 * 6e4, base:{aceites:3, usadas:1}, alcanceIni:0}], vouchers:{}}; };
let S = null;
const carrega = () => { S = ler(K, null); if (!S || !S.ofertas) { S = SEMENTE(); S.ofertas.forEach(o => { o.alcanceIni = alcance(o.zona).pessoas || 260; }); gravar(K, S); } return S; };
const grava = () => gravar(K, S);
const vouchersDe = o => Object.values(S.vouchers).filter(v => v.oferta === o.id);
const aceites = o => (o.base ? o.base.aceites : 0) + vouchersDe(o).length;
const usadas = o => (o.base ? o.base.usadas : 0) + vouchersDe(o).filter(v => v.usado).length;
const restantes = o => Math.max(0, o.qtd - aceites(o));
const ativa = o => !o.terminada && o.fim > Date.now() && o.inicio <= Date.now() && restantes(o) > 0;
const estadoTxt = o => o.terminada ? 'terminada' : o.fim <= Date.now() ? 'acabou o tempo' : restantes(o) <= 0 ? 'esgotada' : 'ativa até ' + hhmm(o.fim);
const oQue = o => o.titulo + (o.alcool && o.alt ? ' (' + o.alt.replace(/^ou\s+/i, 'ou ') + ')' : '');

/* ---------- regras do lado de quem recebe ---------- */
const idade = () => { const p = ler('streetfy:perfil-user', {}) || {}; if (!p.nasc) return 27; const n = new Date(p.nasc), h = new Date(); let a = h.getFullYear() - n.getFullYear(); if (h < new Date(h.getFullYear(), n.getMonth(), n.getDate())) a--; return a; };
const segueCasa = o => { try { return localStorage.getItem('segue:' + o.casa.k) === '1'; } catch (e) { return false; } };
const jaVeio = o => o.casa.k === CASA.k; /* protótipo: a Mariana já esteve no Lux (Já fui) */
const noite = t => { const d = new Date(t - 6 * 36e5); return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate(); }; /* a noite vai até às 6h */
const meus = () => Object.values(S.vouchers).filter(v => v.nome === EU).sort((a, b) => b.aceite - a.aceite);
function motivo(o, loc, semSeg){
  if (!ativa(o)) return 'Esta oferta já não está ativa.';
  if (!dentro(o.zona, loc)) return 'Só para quem está na zona da oferta.';
  if (o.publico === 'seguidores' && !segueCasa(o) && !semSeg) return 'Só para quem segue o ' + o.casa.nome + '.';
  if (o.publico === 'novos' && jaVeio(o)) return 'Só para quem nunca foi ao ' + o.casa.nome + '.';
  if (o.alcool && idade() < 18) return 'Ofertas com álcool são só para maiores de 18.';
  if (meus().some(v => v.oferta === o.id)) return 'Já aceitaste esta oferta.';
  if (o.alcool && meus().some(v => { const x = S.ofertas.find(y => y.id === v.oferta); return x && x.alcool && noite(v.aceite) === noite(Date.now()); })) return 'Só uma oferta com álcool por pessoa por noite.';
  return '';
}
const precisaSeguir = o => o.publico === 'seguidores' && !segueCasa(o);
const seguir = o => { try { localStorage.setItem('segue:' + o.casa.k, '1'); } catch (e) {} };
function aceitar(id, loc){
  carrega(); const o = S.ofertas.find(x => x.id === id); if (!o) return {ok:false, txt:'Oferta não encontrada.'};
  const m = motivo(o, loc); if (m) return {ok:false, txt:m};
  const c = 'OF-' + (hash(id + EU + Date.now()).toString(36).toUpperCase() + '000000').slice(0, 6), t = Date.now();
  S.vouchers[c] = {c, oferta:o.id, nome:EU, aceite:t, expira:t + o.validade * 6e4, usado:0}; grava();
  return {ok:true, v:S.vouchers[c], o};
}
/* no Modo porta: só da casa, não usado, dentro do prazo */
function validar(c, por){
  carrega(); const v = S.vouchers[String(c || '').trim().toUpperCase()];
  if (!v) return {ok:false, t:'Voucher inválido', s:'Este código não é de nenhuma oferta.'};
  const o = S.ofertas.find(x => x.id === v.oferta);
  if (!o || o.casa.k !== CASA.k) return {ok:false, t:'Voucher de outra casa', s:'Não serve aqui.'};
  if (v.usado) return {ok:false, t:'Voucher já usado', s:v.nome + ' usou às ' + hhmm(v.usado) + (v.por ? ' (' + v.por + ')' : '') + '.'};
  if (v.expira < Date.now()) return {ok:false, t:'Voucher expirado', s:'Valia até às ' + hhmm(v.expira) + '.'};
  v.usado = Date.now(); v.por = por || ''; grava();
  return {ok:true, t:'Entregar: ' + oQue(o), s:v.nome + ' · ' + (o.alcool ? 'confirma que é maior de 18 · ' : '') + 'voucher usado às ' + hhmm(v.usado)};
}

/* ---------- mapas (Leaflet) ---------- */
const TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>';
const novoMapa = (el, c, z) => { if (!window.L) { el.innerHTML = '<p class="al-nota" style="padding:12px">Mapa indisponível.</p>'; return null; } const m = L.map(el, {scrollWheelZoom:false}); L.tileLayer(TILES, {attribution:ATTR, maxZoom:19}).addTo(m); m.setView(c, z || 15); return m; };
const casaPino = m => L.circleMarker([CASA.lat, CASA.lng], {radius:8, color:'#0b0b0b', weight:3, fillColor:'#ff2e6e', fillOpacity:1}).addTo(m).bindTooltip(CASA.nome, {permanent:true, direction:'top', offset:[0, -8], className:'of-tip'});
const ESTILO = {color:'#ff2e6e', weight:3, fillColor:'#ff2e6e', fillOpacity:.18};
const desenhaZona = (m, z, st) => z.tipo === 'raio' ? L.circle(z.c, Object.assign({radius:z.r}, st || ESTILO)).addTo(m) : L.polygon(z.pts, st || ESTILO).addTo(m);

/* ---------- cartão do portal (casa) ---------- */
const F = {aberto:false, tipo:'bebida', titulo:'1 cerveja', alcool:true, alt:'ou 1 refrigerante', qtd:40, validade:45, dur:120, publico:'todos', zona:'poli', r:500, pts:BAIRRO_ALTO.map(p => p.slice()), msg:''};
let mapaF = null, camadaF = null;
const zonaF = () => F.zona === 'raio' ? {tipo:'raio', c:[CASA.lat, CASA.lng], r:F.r} : {tipo:'poli', pts:F.pts};
const alcTxt = () => { const z = zonaF(); if (F.zona === 'poli' && F.pts.length < 3) return 'Toca no mapa para marcar pelo menos 3 pontos.'; const a = alcance(z); return '≈ <b>' + fmt(a.pessoas) + ' pessoas</b> na zona agora · ' + a.lugares + ' lugares abertos · ' + (F.zona === 'poli' ? fmt(area(F.pts) / 1e4) + ' ha' : 'raio ' + fmt(F.r) + ' m') + '<small>Só números: a casa nunca vê quem está na zona.</small>'; };
function card(){
  carrega();
  const lista = S.ofertas.slice().sort((a, b) => (ativa(b) ? 1 : 0) - (ativa(a) ? 1 : 0) || b.criada - a.criada);
  const linha = o => { const ac = aceites(o), us = usadas(o), on = ativa(o);
    return '<div class="of-c' + (on ? ' on' : '') + '"><div class="of-ch"><div><b>' + esc(oQue(o)) + '</b><span>' + esc(TIPOS[o.tipo]) + ' · ' + esc(nomeZona(o.zona)) + ' · ' + esc(PUB[o.publico]) + (o.alcool ? ' · 18+ · 1 por pessoa por noite' : '') + ' · voucher válido ' + o.validade + ' min</span></div><span class="of-est' + (on ? ' on' : '') + '">' + esc(estadoTxt(o)) + '</span></div>'
      + '<div class="of-num"><div><b>≈ ' + fmt(o.alcanceIni) + '</b><span>receberam</span></div><div><b>' + ac + '</b><span>aceitaram</span></div><div><b>' + us + '</b><span>usaram na casa</span></div><div><b>' + restantes(o) + '</b><span>restam de ' + o.qtd + '</span></div><div><b>' + (ac ? Math.round(us / ac * 100) : 0) + '%</b><span>conversão</span></div></div>'
      + (on ? '<button type="button" class="cd-lnk" data-of-fim="' + o.id + '">Terminar agora</button>' : '') + '</div>'; };
  const form = F.aberto ? '<div class="bf-form of-form"><h4>Nova oferta na rua</h4>'
    + '<div class="pt-2"><label>Tipo<select data-of-in="tipo">' + Object.entries(TIPOS).map(([k, n]) => '<option value="' + k + '"' + (F.tipo === k ? ' selected' : '') + '>' + n + '</option>').join('') + '</select></label><label>O quê<input data-of-in="titulo" value="' + esc(F.titulo) + '" maxlength="40" placeholder="ex.: 1 cerveja, 1 shot, entrada grátis até 1h, 20% no bar"></label></div>'
    + '<label class="pt-r"><input type="checkbox" data-of-in="alcool"' + (F.alcool ? ' checked' : '') + '> Tem álcool <small>só 18+, uma por pessoa por noite</small></label>'
    + (F.alcool ? '<label>Alternativa sem álcool <small>obrigatória</small><input data-of-in="alt" value="' + esc(F.alt) + '" maxlength="40" placeholder="ou 1 refrigerante"></label>' : '')
    + '<div class="pt-2"><label>Quantidade<input type="number" min="1" max="500" data-of-in="qtd" value="' + F.qtd + '"></label><label>Voucher válido (min)<input type="number" min="10" max="180" data-of-in="validade" value="' + F.validade + '"></label><label>A oferta dura (min)<input type="number" min="15" max="360" data-of-in="dur" value="' + F.dur + '"></label></div>'
    + '<label>Para quem<select data-of-in="publico">' + Object.entries(PUB).map(([k, n]) => '<option value="' + k + '"' + (F.publico === k ? ' selected' : '') + '>' + n + '</option>').join('') + '</select></label>'
    + '<div class="bf-lbl">Zona</div><div class="bf-modo" role="group" aria-label="Tipo de zona"><button type="button" data-of-zona="raio" class="' + (F.zona === 'raio' ? 'on' : '') + '">Raio à volta da casa</button><button type="button" data-of-zona="poli" class="' + (F.zona === 'poli' ? 'on' : '') + '">Desenhar no mapa</button></div>'
    + (F.zona === 'raio' ? '<label>Raio · <b data-of-rv>' + fmt(F.r) + ' m</b><input type="range" min="' + R_MIN + '" max="' + R_MAX + '" step="50" data-of-in="r" value="' + F.r + '"></label>' : '<p class="of-dica">Toca no mapa para marcar os cantos da zona (ruas e praças). <button type="button" class="cd-lnk" data-of="desfaz">Desfazer ponto</button> <button type="button" class="cd-lnk" data-of="limpa">Limpar</button> <button type="button" class="cd-lnk" data-of="ba">Bairro Alto</button></p>')
    + '<div class="of-mapa" id="of-mapa-f"></div><p class="of-alc" id="of-alc">' + alcTxt() + '</p>'
    + '<p class="of-regra">Regra: a zona é de ruas e praças. Não dá para mirar quem fez check-in dentro de outra casa, e a posição de ninguém sai do telemóvel.</p>'
    + (F.msg ? '<p class="bf-msg" role="alert">' + esc(F.msg) + '</p>' : '')
    + '<div class="pt-2"><button type="button" class="s-btn pink" data-of="lanca">Lançar oferta</button><button type="button" class="s-btn ghost" data-of="fecha">Cancelar</button></div></div>' : '';
  return '<div class="pt-card of" id="ofertas"><div class="pt-ch"><h3>Ofertas na rua</h3>' + (F.aberto ? '' : '<button type="button" class="s-btn pink pt-novo" data-of="abre">+ Nova oferta</button>') + '</div>'
    + '<p class="bf-priv"><span>Oferece algo grátis a quem está perto: uma cerveja, um shot, comida, um bilhete ou um voucher. Escolhe um raio à volta da casa ou desenha a zona no mapa (ex.: o Bairro Alto). Quem aceita recebe um voucher em QR; a equipa com "Validar ofertas" lê-o no <a href="modo-porta.html">Modo porta</a>.</span></p>'
    + form + (lista.length ? lista.map(linha).join('') : '<p class="al-nota">Ainda não lançaste ofertas.</p>') + '</div>';
}
function montaForm(){
  const el = document.getElementById('of-mapa-f'); if (!el || !window.L) return;
  if (mapaF) { mapaF.remove(); mapaF = null; }
  const z = zonaF(), c = F.zona === 'raio' || F.pts.length < 3 ? [CASA.lat, CASA.lng] : centro(z);
  mapaF = novoMapa(el, c, 15); if (!mapaF) return; casaPino(mapaF);
  const redesenha = () => { if (camadaF) camadaF.remove(); camadaF = null; const z = zonaF();
    if (F.zona === 'raio') camadaF = desenhaZona(mapaF, z);
    else if (F.pts.length >= 3) camadaF = desenhaZona(mapaF, z);
    else if (F.pts.length) camadaF = L.layerGroup(F.pts.map(p => L.circleMarker(p, {radius:5, color:'#ff2e6e', weight:3}))).addTo(mapaF);
    const a = document.getElementById('of-alc'); if (a) a.innerHTML = alcTxt(); };
  redesenha();
  if (F.zona === 'raio') mapaF.fitBounds(L.latLng(CASA.lat, CASA.lng).toBounds(F.r * 2.4));
  else if (F.pts.length >= 3) mapaF.fitBounds(L.polygon(F.pts).getBounds().pad(.4));
  mapaF.on('click', ev => { if (F.zona !== 'poli') return; F.pts.push([+ev.latlng.lat.toFixed(5), +ev.latlng.lng.toFixed(5)]); redesenha(); });
  montaForm.redesenha = redesenha;
}
const refaz = () => { const c = document.getElementById('ofertas'); if (!c) return; if (mapaF) { mapaF.remove(); mapaF = null; } c.outerHTML = card(); montaForm(); };
function lanca(){
  const n = (v, a, b) => Math.max(a, Math.min(b, Math.round(+v || 0)));
  F.qtd = n(F.qtd, 1, 500); F.validade = n(F.validade, 10, 180); F.dur = n(F.dur, 15, 360); F.r = n(F.r, R_MIN, R_MAX);
  if (!String(F.titulo).trim()) { F.msg = 'Escreve o que ofereces.'; return refaz(); }
  if (F.alcool && !String(F.alt).trim()) { F.msg = 'Com álcool, põe uma alternativa sem álcool.'; return refaz(); }
  if (F.zona === 'poli' && F.pts.length < 3) { F.msg = 'Marca pelo menos 3 pontos no mapa.'; return refaz(); }
  if (F.zona === 'poli' && area(F.pts) < AREA_MIN) { F.msg = 'Zona demasiado pequena: tem de ter pelo menos a área de um raio de ' + R_MIN + ' m, para nunca identificar ninguém.'; return refaz(); }
  const z = zonaF(), t = Date.now();
  S.ofertas.unshift({id:'o' + nid(), casa:CASA, tipo:F.tipo, titulo:String(F.titulo).trim(), alcool:F.alcool, alt:F.alcool ? String(F.alt).trim() : '', qtd:F.qtd, validade:F.validade, inicio:t, fim:t + F.dur * 6e4, zona:JSON.parse(JSON.stringify(z)), publico:F.publico, criada:t, alcanceIni:alcance(z).pessoas});
  grava(); F.aberto = false; F.msg = ''; refaz();
}
document.addEventListener('click', ev => {
  const c = ev.target.closest('#ofertas'); if (!c) return;
  const b = ev.target.closest('button'); if (!b) return;
  const a = b.dataset.of;
  if (a === 'abre') { F.aberto = true; F.msg = ''; return refaz(); }
  if (a === 'fecha') { F.aberto = false; return refaz(); }
  if (a === 'lanca') return lanca();
  if (a === 'desfaz') { F.pts.pop(); return montaForm.redesenha && montaForm.redesenha(); }
  if (a === 'limpa') { F.pts = []; return montaForm.redesenha && montaForm.redesenha(); }
  if (a === 'ba') { F.pts = BAIRRO_ALTO.map(p => p.slice()); return refaz(); }
  if (b.dataset.ofZona) { F.zona = b.dataset.ofZona; return refaz(); }
  if (b.dataset.ofFim) { carrega(); const o = S.ofertas.find(x => x.id === b.dataset.ofFim); if (o) { o.terminada = true; grava(); } return refaz(); }
});
document.addEventListener('input', ev => {
  const i = ev.target.closest('#ofertas [data-of-in]'); if (!i) return;
  const k = i.dataset.ofIn; if (i.type === 'checkbox' || i.tagName === 'SELECT') return;
  F[k] = i.type === 'number' || i.type === 'range' ? +i.value : i.value;
  if (k === 'r') { const v = document.querySelector('[data-of-rv]'); if (v) v.textContent = fmt(F.r) + ' m'; if (montaForm.redesenha) montaForm.redesenha(); }
});
document.addEventListener('change', ev => {
  const i = ev.target.closest('#ofertas [data-of-in]'); if (!i) return;
  const k = i.dataset.ofIn;
  if (i.type === 'checkbox') { F[k] = i.checked; return refaz(); }
  if (i.tagName === 'SELECT') { F[k] = i.value; if (k === 'tipo') { F.alcool = i.value === 'bebida'; if (!F.titulo || /cerveja|shot|prato|entrada|%/i.test(F.titulo)) F.titulo = {bebida:'1 cerveja', comida:'1 prato do dia', bilhete:'entrada grátis até 1h', voucher:'20% no bar'}[i.value]; return refaz(); } }
});

/* ---------- página do utilizador: ofertas perto de ti ---------- */
function pagina(el){
  let loc = null, locNome = '', msg = null, mapa = null, ag = null, pergunta = '', qrAberto = '';
  const hrefCasa = o => 'perfil.html#lugar=' + encodeURIComponent(o.casa.k);
  try { const s = JSON.parse(sessionStorage.getItem(LK) || 'null'); if (s) { loc = s.p; locNome = s.n; } } catch (e) {}
  const guarda = () => { try { sessionStorage.setItem(LK, JSON.stringify({p:loc, n:locNome})); } catch (e) {} };
  const QR = c => window.STREETFY_ENTRADAS ? window.STREETFY_ENTRADAS.qrSvg(c) : '';
  const desenha = () => {
    carrega();
    const jaTenho = new Set(meus().map(v => v.oferta)), at = S.ofertas.filter(o => ativa(o) && !jaTenho.has(o.id)), perto = loc ? at.filter(o => dentro(o.zona, loc)) : [], longe = at.filter(o => !perto.includes(o));
    const vs = meus(), vAt = vs.filter(v => !v.usado && v.expira > Date.now()), vOut = vs.filter(v => !vAt.includes(v));
    const of = (o, aqui) => { const m = aqui ? motivo(o, loc, true) : '', d = loc ? dist(loc, [o.casa.lat, o.casa.lng]) : 0;
      return '<article class="of-u' + (aqui ? '' : ' fora') + '"><div class="of-uc"><span class="of-ut">' + esc(o.tipo === 'bilhete' ? 'Bilhete' : TIPOS[o.tipo]) + ' grátis · ' + esc(o.casa.nome) + '</span><b>' + esc(oQue(o)) + '</b>'
        + '<span>' + (aqui ? 'Estás na zona · ' : 'Só para quem está em ' + esc(nomeZona(o.zona).replace(/^zona desenhada · /, '')) + ' · ') + 'faltam ' + restantes(o) + ' · até às ' + hhmm(o.fim) + (loc ? ' · a ' + (d < 1000 ? fmt(d) + ' m' : (d / 1000).toFixed(1).replace('.', ',') + ' km') : '') + '</span>'
        + '<span class="of-chips">' + (o.alcool ? '<i>18+</i><i>1 com álcool por noite</i>' : '') + '<i>voucher ' + o.validade + ' min</i>' + (o.publico !== 'todos' ? '<i>' + esc(PUB[o.publico]) + '</i>' : '') + '</span></div>'
        + (aqui ? (m ? '<p class="of-m">' + esc(m) + '</p>' : '<button type="button" class="s-btn pink" data-ofu="aceita" data-id="' + o.id + '">Aceitar oferta</button>' + (precisaSeguir(o) ? '<small class="of-sg">só para seguidores do ' + esc(o.casa.nome) + '</small>' : '')) : '')
        + '<a class="s-btn ghost" href="https://www.google.com/maps/dir/?api=1&destination=' + o.casa.lat + ',' + o.casa.lng + '" target="_blank" rel="noopener">Como chegar</a></article>'; };
    const vc = v => { const o = S.ofertas.find(x => x.id === v.oferta) || {titulo:'Oferta', casa:CASA}, st = v.usado ? 'usado às ' + hhmm(v.usado) : v.expira < Date.now() ? 'expirou às ' + hhmm(v.expira) : 'válido até às ' + hhmm(v.expira) + ' · faltam ' + Math.max(0, Math.ceil((v.expira - Date.now()) / 6e4)) + ' min';
      return '<article class="of-v' + (v.usado || v.expira < Date.now() ? ' off' : '') + '"><button type="button" class="of-vb" data-ofu="qr" data-c="' + esc(v.c) + '" aria-label="Abrir o QR do voucher ' + esc(v.c) + ' em grande"></button><div class="of-qr">' + QR(v.c) + (v.usado ? '<em>USADO</em>' : v.expira < Date.now() ? '<em>EXPIROU</em>' : '') + '</div><div><span class="of-ut">' + esc(o.casa.nome) + '</span><b>' + esc(oQue(o)) + '</b><span class="of-code">' + esc(v.c) + '</span><span>' + esc(st) + '</span>' + (!v.usado && v.expira > Date.now() ? '<small>Toca para abrir o QR em grande. Mostra no bar ou na porta: a equipa lê o QR e entrega. Só serve uma vez.</small>' : '') + '<span class="of-va"><a class="s-btn ghost" href="' + hrefCasa(o) + '">Ver perfil</a><a class="s-btn ghost" href="https://www.google.com/maps/dir/?api=1&destination=' + o.casa.lat + ',' + o.casa.lng + '" target="_blank" rel="noopener">Como chegar</a></span></div></article>'; };
    const grande = () => { const v = S.vouchers[qrAberto]; if (!v) return ''; const o = S.ofertas.find(x => x.id === v.oferta) || {titulo:'Oferta', casa:CASA}, off = v.usado || v.expira < Date.now();
      return '<div class="ct-modal" role="dialog" aria-modal="true" aria-label="Voucher ' + esc(v.c) + '"><div class="ct-modal-c of-big' + (off ? ' usado' : '') + '"><button type="button" class="pe-x" data-ofu="qr-x" aria-label="Fechar">✕</button><span class="of-ut">' + esc(o.casa.nome) + '</span><b>' + esc(oQue(o)) + '</b><div class="ct-qrw">' + QR(v.c) + (v.usado ? '<em>USADO</em>' : v.expira < Date.now() ? '<em>EXPIROU</em>' : '') + '</div><p class="of-code">' + esc(v.c) + '</p><p>' + (v.usado ? 'Usado às ' + hhmm(v.usado) + '.' : v.expira < Date.now() ? 'Expirou às ' + hhmm(v.expira) + '.' : 'Válido até às ' + hhmm(v.expira) + ' · faltam ' + Math.max(0, Math.ceil((v.expira - Date.now()) / 6e4)) + ' min. Aumenta o brilho e mostra no bar ou na porta.') + '</p><div class="pt-2"><a class="s-btn ink" href="' + hrefCasa(o) + '">Ver perfil</a><a class="s-btn ghost" href="https://www.google.com/maps/dir/?api=1&destination=' + o.casa.lat + ',' + o.casa.lng + '" target="_blank" rel="noopener">Como chegar</a></div></div></div>'; };
    el.innerHTML = '<div class="of-pg">'
      + '<p class="bf-priv"><span><b>A tua posição não sai do telemóvel.</b> O Xouty manda as zonas das ofertas e é o teu telemóvel que vê se estás dentro. As casas só veem quantas pessoas receberam, nunca quem.</span></p>'
      + '<div class="of-loc"><b>' + (loc ? 'Estás em: ' + esc(locNome) : 'Onde estás?') + '</b><div class="of-locb"><button type="button" class="s-btn ink" data-ofu="geo">Usar a minha localização</button>' + SIM.map(s => '<button type="button" class="bf-tag' + (locNome === s[0] ? ' on' : '') + '" data-ofu="sim" data-n="' + esc(s[0]) + '">' + esc(s[0]) + '</button>').join('') + '</div><small>Protótipo: escolhe um sítio para simular onde estás.</small></div>'
      + (msg ? '<p class="pt-portam ' + (msg.ok ? 'ok' : 'erro') + '" role="status">' + esc(msg.txt) + '</p>' : '')
      + (vAt.length ? '<h3 class="po-t">Os teus vouchers</h3>' + vAt.map(vc).join('') : '')
      + '<div class="of-mapa of-mapa-u" id="of-mapa-u"></div>'
      + '<h3 class="po-t">' + (loc ? 'Perto de ti agora · ' + perto.length : 'Ofertas ativas · ' + at.length) + '</h3>'
      + (loc ? (perto.length ? perto.map(o => of(o, true)).join('') : '<p class="al-nota">Nenhuma oferta para a zona onde estás. Experimenta o Bairro Alto.</p>') + (longe.length ? '<h3 class="po-t">Noutras zonas</h3>' + longe.map(o => of(o, false)).join('') : '') : at.map(o => of(o, false)).join(''))
      + (vOut.length ? '<h3 class="po-t">Vouchers usados e expirados</h3>' + vOut.map(vc).join('') : '') + '</div>'
      + (pergunta ? (() => { const o = S.ofertas.find(x => x.id === pergunta); return o ? '<div class="ct-modal" role="dialog" aria-modal="true" aria-labelledby="of-sg-t"><div class="ct-modal-c of-sgm"><b id="of-sg-t">Somente para seguidores</b><p>Esta oferta (' + esc(oQue(o)) + ') é só para quem segue o ' + esc(o.casa.nome) + '. Deseja seguir o ' + esc(o.casa.nome) + '?</p><small>Passas a ver os eventos e as ofertas da casa no teu Xouty. Podes deixar de seguir quando quiseres.</small><div class="pt-2"><button type="button" class="s-btn pink" data-ofu="seg-sim">Seguir e aceitar</button><button type="button" class="s-btn ghost" data-ofu="seg-nao">Agora não</button></div></div></div>' : ''; })() : '');
    if (qrAberto && !pergunta) el.insertAdjacentHTML('beforeend', grande());
    if (pergunta) { const b = el.querySelector('[data-ofu="seg-sim"]'); if (b) b.focus(); }
    else if (qrAberto) { const b = el.querySelector('[data-ofu="qr-x"]'); if (b) b.focus(); }
    montaMapa(S.ofertas.filter(ativa));
  };
  const montaMapa = at => {
    const m = document.getElementById('of-mapa-u'); if (!m || !window.L) return;
    if (mapa) { mapa.remove(); mapa = null; }
    mapa = novoMapa(m, loc || [CASA.lat, CASA.lng], 14); if (!mapa) return;
    const camadas = at.map(o => desenhaZona(mapa, o.zona).bindTooltip(oQue(o) + ' · ' + o.casa.nome));
    casaPino(mapa);
    if (loc) L.circleMarker(loc, {radius:9, color:'#fff', weight:3, fillColor:'#1f6bff', fillOpacity:1}).addTo(mapa).bindTooltip('Tu (só no teu telemóvel)', {direction:'top', offset:[0, -8]});
    const b = L.latLngBounds([[CASA.lat, CASA.lng]].concat(loc ? [loc] : [])); camadas.forEach(c => b.extend(c.getBounds())); mapa.fitBounds(b.pad(.2), {maxZoom:16});
  };
  el.addEventListener('click', ev => {
    const b = ev.target.closest('[data-ofu]'); if (!b) return;
    const a = b.dataset.ofu;
    if (a === 'sim') { const s = SIM.find(x => x[0] === b.dataset.n); loc = [s[1], s[2]]; locNome = s[0] + ' (simulado)'; msg = null; guarda(); return desenha(); }
    if (a === 'geo') { if (!navigator.geolocation) { msg = {ok:false, txt:'Este navegador não dá a localização.'}; return desenha(); } b.textContent = 'A procurar…'; navigator.geolocation.getCurrentPosition(p => { loc = [p.coords.latitude, p.coords.longitude]; locNome = 'a tua localização'; msg = null; guarda(); desenha(); }, () => { msg = {ok:false, txt:'Sem acesso à localização. Podes simular um sítio.'}; desenha(); }, {timeout:8000, maximumAge:60000}); return; }
    if (a === 'seg-nao') { pergunta = ''; return desenha(); }
    if (a === 'qr') { qrAberto = b.dataset.c; return desenha(); }
    if (a === 'qr-x') { const c = qrAberto; qrAberto = ''; desenha(); const v = el.querySelector('[data-ofu="qr"][data-c="' + c + '"]'); if (v) v.focus(); return; }
    if (a === 'aceita' || a === 'seg-sim') {
      const id = a === 'seg-sim' ? pergunta : b.dataset.id; carrega(); const o = S.ofertas.find(x => x.id === id);
      if (a === 'aceita' && o && precisaSeguir(o)) { pergunta = id; return desenha(); }
      if (a === 'seg-sim' && o) seguir(o);
      pergunta = '';
      const r = aceitar(id, loc); msg = r.ok ? {ok:true, txt:(a === 'seg-sim' ? 'Já segues o ' + r.o.casa.nome + '. ' : '') + 'Aceite! O teu voucher está em cima: mostra-o no ' + r.o.casa.nome + ' até às ' + hhmm(r.v.expira) + '.'} : {ok:false, txt:r.txt}; desenha(); window.scrollTo({top:0, behavior:'smooth'}); }
  });
  window.addEventListener('storage', ev => { if (ev.key === K) desenha(); });
  document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && (pergunta || qrAberto)) { pergunta = ''; qrAberto = ''; desenha(); } });
  el.addEventListener('click', ev => { if ((pergunta || qrAberto) && ev.target.classList.contains('ct-modal')) { pergunta = ''; qrAberto = ''; desenha(); } });
  clearInterval(ag); ag = setInterval(() => { if (!document.hidden && !document.activeElement.matches('input')) desenha(); }, 60000);
  desenha();
}

window.STREETFY_OFERTAS = {card, monta:montaForm, validar, carrega, CASA, aceitar, meus, motivo, precisaSeguir, seguir, dentro, oQue, ativa, estadoTxt, restantes, hhmm, SIM, PUB, TIPOS, estado:() => S};
const pg = document.querySelector('[data-ofertas]'); if (pg) pagina(pg);
})();
