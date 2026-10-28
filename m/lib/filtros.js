/* Xouty · filtros.js — estrutura de filtros do catálogo: país → cidade → tipo → quando → estilo → bairro.
   Numa página:
     <div class="fbar" data-filtros data-resultados="#lista" data-dias="#dias" data-bairros="#bairros"></div>
     <div id="lista" data-resultados data-cartao="poster|lista" data-max="12"></div>
   Ganchos opcionais: [data-f-cidade] nome da cidade · [data-f-conta="lugares|eventos|semana|agora"] números
     · [data-f-agora] texto "pessoas no Lux agora" · [data-f-dias] faixa de dias · [data-f-bairros] grelha de bairros
     · [data-f-link="hoje.html"] link que leva o estado · [data-f-set="pt/porto"] atalho que escolhe uma cidade
   Estado na URL: #onde=pt/porto&tipo=clube&quando=hoje&estilo=techno&bairro=Ribeira
   No site real a lista vem da API: GET /catalogo?pais=pt&cidade=porto&tipo=clube&quando=hoje&bairro=Ribeira */
(function(){
'use strict';
/* cache: a página sabe que versão do dados-bot.js espera (data-v); se o navegador serviu uma velha, recarrega uma vez */
{ const sc = document.querySelector('script[src^="dados-bot.js"]'), esperado = sc && sc.dataset.v;
  if (esperado && esperado !== '0' && window.STREETFY_DADOS_V !== esperado) {
    let ja = false; try { ja = sessionStorage.getItem('streetfy:dados-recarregado') === esperado; if (!ja) sessionStorage.setItem('streetfy:dados-recarregado', esperado); } catch (e) {}
    if (!ja) location.reload();
  } }
const SEMPRE = ['hoje', 'amanha', 'fds'];

/* ---------- catálogo (hoje local; amanhã, API) ---------- */
const PAISES = [
 {id:'pt', nome:'Portugal', nomeEn:'Portugal', cidades:[
   {id:'lisboa', nome:'Lisboa', nomeEn:'Lisbon', aberta:true, lugares:1248, eventos:37, semana:150, agora:214, centro:[38.7118, -9.1405], zoom:13, agoraOnde:{pt:'no Lux', en:'at Lux'},
    bairros:[['Cais do Sodré', 412, 'Pink Street, B.Leza, Musicbox, Time Out Market'], ['Bairro Alto', 388, '23 bares, Park no topo do parque de estacionamento'], ['Santa Apolónia', 214, 'Lux Frágil e o terraço sobre o rio'], ['Santos', 96, 'Alcântara, LX Factory e os armazéns'], ['Alfama', 71, 'fado, miradouros e tascas'], ['Príncipe Real', 58, 'bares de autor e jardins']],
    dias:[['23', 'sex', 37], ['24', 'sáb', 44], ['25', 'dom', 18], ['26', 'seg', 9], ['27', 'ter', 11], ['28', 'qua', 14], ['29', 'qui', 21]]},
   {id:'porto', nome:'Porto', nomeEn:'Porto', aberta:true, lugares:412, eventos:14, semana:60, agora:96, centro:[41.1482, -8.6190], zoom:13, agoraOnde:{pt:'no Plano B', en:'at Plano B'},
    bairros:[['Galerias de Paris', 320, 'Rua Cândido dos Reis e Galeria de Paris: 30 bares em 200 m, Plano B, Base'], ['Ribeira', 180, 'cais, esplanadas e o Hard Club no Mercado Ferreira Borges'], ['Baixa', 140, 'Passos Manuel, Maus Hábitos, Coliseu, Gare e o Time Out Market em São Bento'], ['Bonfim', 64, 'Pérola Negra, galerias e cafés de bairro'], ['Cedofeita', 58, 'Miguel Bombarda, galerias e lojas de discos'], ['Boavista', 52, 'Casa da Música e a rotunda'], ['Foz do Douro', 38, 'pôr do sol, Praia da Luz, esplanadas'], ['Cais de Gaia', 44, 'outra margem: Mercado Beira-Rio e as caves']],
    dias:[['23', 'sex', 14], ['24', 'sáb', 19], ['25', 'dom', 8], ['26', 'seg', 3], ['27', 'ter', 4], ['28', 'qua', 6], ['29', 'qui', 9]]},
   {id:'faro', nome:'Faro e Algarve', nomeEn:'Faro and the Algarve', aberta:false, abre:{pt:'no verão de 2027', en:'in summer 2027'}}]},
 {id:'es', nome:'Espanha', nomeEn:'Spain', cidades:[{id:'madrid', nome:'Madrid', aberta:false}, {id:'barcelona', nome:'Barcelona', aberta:false}]},
 {id:'fr', nome:'França', nomeEn:'France', cidades:[{id:'paris', nome:'Paris', aberta:false}]},
 {id:'de', nome:'Alemanha', nomeEn:'Germany', cidades:[{id:'berlim', nome:'Berlim', nomeEn:'Berlin', aberta:false}]},
 {id:'br', nome:'Brasil', nomeEn:'Brazil', cidades:[{id:'sao-paulo', nome:'São Paulo', aberta:false}, {id:'rio', nome:'Rio de Janeiro', aberta:false}]}
];
const TIPOS = ['tudo', 'festa', 'concerto', 'bar', 'clube', 'restaurante', 'livre'];
const QUANDO = ['hoje', 'amanha', 'fds', 'semana'];

/* lugares reais; eventos, números e pessoas fictícios */
const ITENS = [
 /* Lisboa */
 {id:'l1', lat:38.7069, lng:-9.1459, cidade:'lisboa', kind:'lugar', tipos:['restaurante', 'bar', 'livre'], estilo:'concertos', tag:'Entrada livre', titulo:'Sexta no Mercado', lugar:'Time Out Market', bairro:'Cais do Sodré', hora:'21:00', preco:0, aqui:120, star:'4,5', img:'ribeira', href:'lugar.html', quando:SEMPRE, pp:'concertos no palco ao fundo · 400 m'},
 {id:'l2', lat:38.7067, lng:-9.144, cidade:'lisboa', kind:'lugar', tipos:['bar'], estilo:'cocktails', tag:'Bar · até às 3h', titulo:'Pensão Amor', lugar:'Pensão Amor', bairro:'Cais do Sodré', hora:'', preco:'€€', aqui:38, star:'4,6', img:'pink', href:'lugar.html', quando:SEMPRE, pp:'cocktails e burlesco às quintas'},
 {id:'l3', lat:38.7057, lng:-9.1486, cidade:'lisboa', kind:'evento', tipos:['festa', 'concerto'], estilo:'kizomba', tag:'Kizomba', titulo:'Baile do B.Leza', lugar:'B.Leza', bairro:'Cais do Sodré', hora:'22:30', preco:8, aqui:51, amigos:3, star:'4,8', img:'dj', href:'evento.html', quando:['hoje'], pp:'música ao vivo, bilhete na porta ou no app'},
 {id:'l4', lat:38.7141, lng:-9.121, cidade:'lisboa', kind:'evento', tipos:['festa', 'clube'], estilo:'techno', tag:'Techno', titulo:'Noite X', lugar:'Lux Frágil', bairro:'Santa Apolónia', hora:'23:00', preco:15, aqui:214, vao:47, amigos:3, star:'4,7', img:'lux', href:'evento.html', quando:['hoje'], pp:'Vera Lux e Tiago Reis até às 6h', origem:'patrocinado'},
 {id:'l5', lat:38.7166, lng:-9.1446, cidade:'lisboa', kind:'evento', tipos:['concerto'], estilo:'jazz', tag:'Jazz', titulo:'Sessão de jazz', lugar:'Hot Clube de Portugal', bairro:'Príncipe Real', hora:'23:30', preco:12, vao:12, img:'noite', href:'evento.html', quando:['hoje'], pp:'o clube de jazz mais antigo da Europa'},
 {id:'l6', lat:38.7074, lng:-9.1358, cidade:'lisboa', kind:'evento', tipos:['festa', 'clube'], estilo:'house', tag:'House', titulo:'Ministerium Sessions', lugar:'Ministerium Club', bairro:'Terreiro do Paço', hora:'00:00', preco:10, vao:31, img:'club', href:'evento.html', quando:['hoje'], pp:'terraço com vista para o rio'},
 {id:'l7', lat:38.7099, lng:-9.1304, cidade:'lisboa', kind:'evento', tipos:['restaurante', 'concerto'], estilo:'fado', tag:'Fado', titulo:'Noite de fado', lugar:'Clube de Fado', bairro:'Alfama', hora:'21:00', preco:25, img:'alfama', href:'lugar.html', quando:SEMPRE, pp:'jantar com fado, 2 sessões · reserva de mesa no app'},
 {id:'l8', lat:38.7034, lng:-9.1786, cidade:'lisboa', kind:'evento', tipos:['concerto'], estilo:'indie', tag:'Indie', titulo:'Concerto na LX', lugar:'LX Factory', bairro:'Santos', hora:'22:00', preco:12, vao:19, img:'lx', href:'evento.html', quando:['hoje'], pp:'sala pequena, chegar cedo'},
 {id:'l9', lat:38.7128, lng:-9.1448, cidade:'lisboa', kind:'lugar', tipos:['bar', 'livre'], estilo:'bar a bar', tag:'Entrada livre', titulo:'Bairro Alto', lugar:'23 bares abertos', bairro:'Bairro Alto', hora:'22:00', preco:0, aqui:412, img:'tram', href:'cais-do-sodre.html', quando:SEMPRE, pp:'a rua inteira, bar a bar · 1,1 km'},
 {id:'l10', lat:38.7111, lng:-9.148, cidade:'lisboa', kind:'lugar', tipos:['bar'], estilo:'rooftop', tag:'Rooftop', titulo:'Park', lugar:'Park Bar', bairro:'Bairro Alto', hora:'17:00', preco:'€€', aqui:88, star:'4,4', img:'bairro', href:'lugar.html', quando:SEMPRE, pp:'no topo do parque de estacionamento, pôr do sol'},
 {id:'l11', lat:38.7145, lng:-9.1206, cidade:'lisboa', kind:'evento', tipos:['festa', 'clube'], estilo:'house', tag:'House', titulo:'Lux Sessions', lugar:'Lux Frágil', bairro:'Santa Apolónia', hora:'sáb 23:30', preco:12, vao:31, img:'club', href:'evento.html', quando:['amanha', 'fds'], pp:'residentes da casa · 23:30 – 06:00', soSeguidores:true},
 {id:'l12', lat:38.7137, lng:-9.1214, cidade:'lisboa', kind:'evento', tipos:['festa', 'livre'], estilo:'house', tag:'Entrada livre', titulo:'Terraço de domingo', lugar:'Lux Frágil', bairro:'Santa Apolónia', hora:'dom 17:00', preco:0, img:'lux', href:'lugar.html', quando:['fds'], pp:'pôr do sol e house calmo'},
 {id:'l13', lat:38.7038, lng:-9.1782, cidade:'lisboa', kind:'evento', tipos:['festa', 'restaurante'], estilo:'disco', tag:'Disco', titulo:'Brunch eletrónico', lugar:'LX Factory', bairro:'Santos', hora:'dom 13:00', preco:15, vao:64, img:'lx', href:'evento.html', quando:['fds'], pp:'brunch incluído até às 15h'},
 /* Porto */
 {id:'p1', lat:41.1467, lng:-8.615, cidade:'porto', kind:'evento', tipos:['festa', 'clube'], estilo:'disco', tag:'Disco', titulo:'Plano B · Sexta', lugar:'Plano B', bairro:'Galerias de Paris', hora:'23:00', preco:6, aqui:96, vao:40, amigos:2, star:'4,6', img:'pgaleria', href:'evento.html', quando:['hoje'], pp:'duas salas, cave e galeria, até às 6h', origem:'patrocinado'},
 {id:'p2', lat:41.1472, lng:-8.6063, cidade:'porto', kind:'evento', tipos:['concerto', 'bar'], estilo:'indie', tag:'Indie', titulo:'Maus Hábitos ao vivo', lugar:'Maus Hábitos', bairro:'Baixa', hora:'22:00', preco:8, vao:54, star:'4,7', img:'pclerigos', href:'evento.html', quando:['hoje'], pp:'4.º andar da Rua Passos Manuel, terraço e exposição'},
 {id:'p3', lat:41.1414, lng:-8.615, cidade:'porto', kind:'evento', tipos:['concerto'], estilo:'rock', tag:'Rock', titulo:'Noite de rock', lugar:'Hard Club', bairro:'Ribeira', hora:'21:30', preco:18, vao:220, img:'pmercado', href:'evento.html', quando:['hoje'], pp:'no Mercado Ferreira Borges, sala 1'},
 {id:'p4', lat:41.1588, lng:-8.6307, cidade:'porto', kind:'evento', tipos:['concerto'], estilo:'jazz', tag:'Jazz', titulo:'Jazz na Casa da Música', lugar:'Casa da Música', bairro:'Boavista', hora:'21:00', preco:14, vao:60, img:'pmusica', href:'evento.html', quando:['hoje'], pp:'Sala 2 · ciclo de outono'},
 {id:'p5', lat:41.1515, lng:-8.608, cidade:'porto', kind:'evento', tipos:['festa', 'clube'], estilo:'kizomba', tag:'Kizomba', titulo:'Baile da Pérola Negra', lugar:'Pérola Negra', bairro:'Bonfim', hora:'23:30', preco:10, vao:38, img:'pponte', href:'evento.html', quando:['hoje'], pp:'o antigo cabaré, pista única'},
 {id:'p6', lat:41.1455, lng:-8.608, cidade:'porto', kind:'evento', tipos:['festa', 'clube'], estilo:'techno', tag:'Techno', titulo:'Gare · Sexta', lugar:'Gare Porto', bairro:'Baixa', hora:'00:00', preco:8, vao:73, img:'pponte', href:'evento.html', quando:['hoje'], pp:'Rua da Madeira, junto a São Bento, até às 6h'},
 {id:'p7', lat:41.1465, lng:-8.614, cidade:'porto', kind:'lugar', tipos:['bar', 'livre'], estilo:'ao ar livre', tag:'Entrada livre', titulo:'Base', lugar:'Jardim das Oliveiras', bairro:'Galerias de Paris', hora:'17:00', preco:0, aqui:120, star:'4,5', img:'pclerigos', href:'lugar.html', quando:SEMPRE, pp:'relva, cervejas e os Clérigos ao fundo · até à 00h'},
 {id:'p8', lat:41.148, lng:-8.6155, cidade:'porto', kind:'lugar', tipos:['bar'], estilo:'livraria-bar', tag:'Bar · até às 2h', titulo:'Café Candelabro', lugar:'Café Candelabro', bairro:'Galerias de Paris', hora:'', preco:'€€', aqui:41, star:'4,6', img:'pgaleria', href:'lugar.html', quando:SEMPRE, pp:'livros, vinho e esplanada na Rua da Conceição'},
 {id:'p9', lat:41.1405, lng:-8.612, cidade:'porto', kind:'lugar', tipos:['bar', 'restaurante'], estilo:'bar a bar', tag:'Bar a bar', titulo:'Cais da Ribeira', lugar:'14 bares e esplanadas', bairro:'Ribeira', hora:'', preco:'€€', aqui:180, img:'pribeira', href:'hoje.html#onde=pt/porto&bairro=Ribeira', quando:SEMPRE, pp:'a ponte D. Luís acesa do outro lado · 600 m'},
 {id:'p10', lat:41.1456, lng:-8.6107, cidade:'porto', kind:'lugar', tipos:['restaurante', 'livre'], estilo:'mercado', tag:'Entrada livre', titulo:'Noite no Time Out Market', lugar:'Time Out Market Porto', bairro:'Baixa', hora:'21:00', preco:0, aqui:140, img:'pponte', href:'lugar.html', quando:SEMPRE, pp:'na estação de São Bento, 15 cozinhas'},
 {id:'p11', lat:41.1545, lng:-8.6835, cidade:'porto', kind:'lugar', tipos:['bar', 'restaurante'], estilo:'pôr do sol', tag:'Pôr do sol', titulo:'Praia da Luz', lugar:'Praia da Luz', bairro:'Foz do Douro', hora:'18:30', preco:'€€', aqui:62, star:'4,4', img:'pfoz', href:'lugar.html', quando:SEMPRE, pp:'esplanada sobre as rochas, cocktails ao pôr do sol'},
 {id:'p12', lat:41.1503, lng:-8.6195, cidade:'porto', kind:'evento', tipos:['livre'], estilo:'arte', tag:'Entrada livre', titulo:'Inaugurações simultâneas', lugar:'Rua Miguel Bombarda', bairro:'Cedofeita', hora:'sáb 16:00', preco:0, vao:300, img:'pclerigos', href:'evento.html', quando:['amanha', 'fds'], pp:'as galerias abrem ao mesmo tempo, rua cheia'},
 {id:'p13', lat:41.1592, lng:-8.6303, cidade:'porto', kind:'evento', tipos:['concerto'], estilo:'clássica', tag:'Clássica', titulo:'Domingo na Casa da Música', lugar:'Casa da Música', bairro:'Boavista', hora:'dom 18:00', preco:12, img:'pmusica', href:'evento.html', quando:['fds'], pp:'Orquestra Sinfónica · Sala Suggia'},
 {id:'p14', lat:41.1382, lng:-8.6128, cidade:'porto', kind:'lugar', tipos:['restaurante', 'bar', 'livre'], estilo:'mercado', tag:'Entrada livre', titulo:'Mercado Beira-Rio', lugar:'Cais de Gaia', bairro:'Cais de Gaia', hora:'20:00', preco:0, aqui:77, img:'pponte', href:'lugar.html', quando:SEMPRE, pp:'outra margem, vista para a Ribeira inteira'},
 {id:'p15', lat:41.1471, lng:-8.6146, cidade:'porto', kind:'evento', tipos:['festa', 'clube'], estilo:'house', tag:'House', titulo:'Sábado no Plano B', lugar:'Plano B', bairro:'Galerias de Paris', hora:'sáb 23:00', preco:8, vao:52, img:'pgaleria', href:'evento.html', quando:['amanha', 'fds'], pp:'convidado internacional na cave'},
 {id:'p16', lat:41.147, lng:-8.606, cidade:'porto', kind:'evento', tipos:['festa', 'clube'], estilo:'house', tag:'House', titulo:'Passos Manuel · Sábado', lugar:'Passos Manuel', bairro:'Baixa', hora:'sáb 00:00', preco:10, vao:25, img:'pclerigos', href:'evento.html', quando:['amanha', 'fds'], pp:'o antigo cinema do Coliseu, até às 6h'}
];

/* ---------- textos ---------- */
const L = {
 pt:{pais:'País', cidade:'Cidade', tipo:'Tipo', quando:'Quando', estilo:'Estilo', tudo:'Tudo', festa:'Festas', concerto:'Concertos', bar:'Bares', clube:'Clubes', restaurante:'Restaurantes', livre:'Entrada livre', patrocinado:'Patrocinado', via:'via', por:'por', vista:'Vista', cartoes:'Cartões', lista:'Lista', todasCid:'Todas', portugal:'Portugal', maisArredores:'+ 25 km à volta', todas:'Todas as datas', todasCurto:'Todas', todasSub:'ativos e futuros', procurar:'Procurar', procurarPh:'nome do lugar ou do evento', nadaNome:'Nada neste dia com esse nome.', semanaToda:n => 'Ver a semana inteira (' + n + ')', perfilDe:'Perfil de', procura:'procura', g_rolando:'A rolar', gs_rolando:'agora', g_jaja:'Já já rola', gs_jaja:'começa nas próximas 2 horas', g_vai:'Vai rolar', gs_vai:'mais tarde e nos próximos dias', g_rolou:'Já rolou', gs_rolou:'já acabou', g_diatodo:'O dia todo', gs_diatodo:'sem hora marcada', gt_rolando:'A <em>ROLAR</em>', gt_jaja:'JÁ JÁ <em>ROLA</em>', gt_vai:'VAI <em>ROLAR</em>', gt_diatodo:'O DIA <em>TODO</em>', gt_rolou:'JÁ <em>ROLOU</em>', gosto:'Gosto', jaGosto:'Já gostas · tirar', gostos:n => n === 1 ? '1 gosto primeiro' : n + ' gostos primeiro', pelosGostos:'e pelo que gostas', mais:n => 'Mostrar mais ' + n, hoje:'Hoje', amanha:'Amanhã', fds:'Fim de semana', semana:'Semana', todos:'Todos', breve:'em breve', aqui:'aqui', aquiAgora:'aqui agora', vao:'vão', amigos:'amigos', noApp:'bilhete e reserva no app',
   destaque:n => n + ' em destaque', limpar:'Limpar filtros', nada:'NADA COM ESTES FILTROS', nadaTxt:c => 'Em ' + c + ' nenhum lugar bate com tudo o que escolheste. Tira o tipo ou muda o dia.',
   naoAbriu:'AINDA NÃO ABRIU', breveTxt:(c, q) => 'O Xouty chega a ' + c + ' ' + (q || 'em breve') + '. Deixa o e-mail e avisamos-te primeiro.', avisar:'Avisa-me quando abrir', agora:o => 'pessoas ' + o + ' agora', agoraNada:'pessoas aqui agora', tags:{}},
 en:{pais:'Country', cidade:'City', tipo:'Type', quando:'When', estilo:'Style', tudo:'All', festa:'Parties', concerto:'Concerts', bar:'Bars', clube:'Clubs', restaurante:'Restaurants', livre:'Free entry', patrocinado:'Sponsored', via:'via', por:'by', vista:'View', cartoes:'Cards', lista:'List', todasCid:'All', portugal:'Portugal', maisArredores:'+ 25 km around', todas:'All dates', todasCurto:'All', todasSub:'live and upcoming', procurar:'Search', procurarPh:'venue or event name', nadaNome:'Nothing on this day with that name.', semanaToda:n => 'See the whole week (' + n + ')', perfilDe:'Profile of', procura:'search', g_rolando:'On now', gs_rolando:'right now', g_jaja:'Up next', gs_jaja:'starts within 2 hours', g_vai:'Later', gs_vai:'later tonight and the next days', g_rolou:'Already happened', gs_rolou:'over', g_diatodo:'All day', gs_diatodo:'no set time', gt_rolando:'ON <em>NOW</em>', gt_jaja:'UP <em>NEXT</em>', gt_vai:'<em>LATER</em>', gt_diatodo:'ALL <em>DAY</em>', gt_rolou:'ALREADY <em>HAPPENED</em>', gosto:'Like', jaGosto:'Liked · remove', gostos:n => n === 1 ? '1 like first' : n + ' likes first', pelosGostos:'and by what you like', mais:n => 'Show ' + n + ' more', hoje:'Tonight', amanha:'Tomorrow', fds:'Weekend', semana:'This week', todos:'All styles', breve:'coming soon', aqui:'here', aquiAgora:'here now', vao:'going', amigos:'friends', noApp:'tickets and bookings in the app',
   destaque:n => n + ' featured', limpar:'Clear filters', nada:'NOTHING MATCHES', nadaTxt:c => 'In ' + c + ' nothing matches all your filters. Drop the type or change the day.',
   naoAbriu:'NOT OPEN YET', breveTxt:(c, q) => 'Xouty reaches ' + c + ' ' + (q || 'soon') + '. Leave your e-mail and we tell you first.', avisar:'Tell me when it opens', agora:o => 'people ' + o + ' right now', agoraNada:'people here right now',
   tags:{'Entrada livre':'Free entry', 'Bar · até às 3h':'Bar · open till 3am', 'Bar · até às 2h':'Bar · open till 2am', 'Bar a bar':'Bar to bar', 'Pôr do sol':'Sunset', 'Clássica':'Classical'}}
};
/* camadas (R73–R79): 0 patrocinado · 1 parceiro · 2 promoter · 3 bot. Os itens do catálogo são do parceiro salvo indicação; os do bot chegam de dados-bot.js com crédito à fonte. */
const tiposDe = e => e.tipo === 'tudo' ? [] : String(e.tipo).split(',').filter(x => TIPOS.includes(x) && x !== 'tudo');
const estilosSel = e => e.estilo === 'todos' ? [] : String(e.estilo).split(',').map(x => x.trim()).filter(x => x && x !== 'todos');
const CAMADA = {patrocinado:0, parceiro:1, promoter:2, bot:3};
ITENS.forEach(i => { if (!i.origem) i.origem = 'parceiro'; });
(window.STREETFY_BOT || []).forEach(i => ITENS.push(i));
/* eventos criados pela casa (evento-novo.html, guardados em streetfy:eventos-casa): os publicados entram no catálogo como os outros do parceiro.
   Um evento do catálogo editado pela casa guarda-se com o mesmo id e sobrepõe-se ao original. Rascunhos e agendados ainda por sair ficam só no portal. */
const EV_CASA = {k:'lisboa/lux fragil', lugar:'Lux Frágil', bairro:'Santa Apolónia', cidade:'lisboa', lat:38.7141, lng:-9.121};
function deEventoCasa(e){
  const lotes = (e.lotes || []).filter(l => +l.qtd > 0), livre = e.entrada !== 'paga' || !lotes.length;
  const hoje = new Date().toISOString().slice(0, 10), ativo = lotes.find(l => !l.ate || l.ate >= hoje) || lotes[lotes.length - 1];
  const nomes = (e.lineup || []).map(x => x.nome).filter(Boolean);
  const LC = e.casa || EV_CASA;
  return {id:e.id, lat:LC.lat, lng:LC.lng, cidade:LC.cidade, kind:'evento', tipos:[...new Set((e.tipos && e.tipos.length ? e.tipos : ['festa']).concat(livre ? ['livre'] : []))], estilo:e.estilo || 'house',
    tag:livre ? 'Entrada livre' : (e.estilo ? e.estilo.charAt(0).toUpperCase() + e.estilo.slice(1) : 'Festa'), titulo:e.titulo || 'Novo evento', lugar:LC.lugar, bairro:LC.bairro,
    hora:e.hora || '', horaFim:e.horaFim || '', preco:livre ? 0 : +ativo.preco, img:e.capa || 'lux', href:'evento.html', data:e.data, fim:e.data, pp:e.resumo || '', descricao:e.desc || '',
    subtitulo:nomes.join(', '), setsHora:(e.lineup || []).filter(x => x.nome).map(x => x.hora || ''), lineup:(e.lineup || []).map(x => x.dj).filter(Boolean), idade:e.idade, lotes:livre ? [] : lotes, vendaAte:livre ? '' : (e.vendaAte || ''), lotacao:+e.lotacao || 0, soSeguidores:!!e.seguidores, origem:e.origem === 'promoter' ? 'promoter' : 'parceiro', daCasa:true, criadoPor:e.criadoPor || '', porNome:e.origem === 'promoter' ? (e.criadoPorNome || '') : '', vao:e.vao || 0};
}
const publicado = e => e.estado === 'publicado' || (e.estado === 'agendado' && e.pubEm && new Date(e.pubEm) <= new Date());
try { (JSON.parse(localStorage.getItem('streetfy:eventos-casa') || '[]') || []).filter(publicado).forEach(e => { const it = deEventoCasa(e), j = ITENS.findIndex(x => x.id === e.id); if (j >= 0) ITENS[j] = Object.assign({}, ITENS[j], it, {vao:ITENS[j].vao, aqui:ITENS[j].aqui, star:ITENS[j].star, origem:ITENS[j].origem}); else ITENS.push(it); }); } catch (e) {}
/* cidades do bot (Portugal inteiro): abrem no filtro se tiverem eventos; Faro, que estava "em breve", abre também */
{ const pt = PAISES[0];
  { const tot = (window.STREETFY_CIDADES || []).reduce((a, c) => ({e:a.e + c.eventos, l:a.l + c.lugares}), {e:0, l:0});
    pt.cidades.unshift({id:'todas', nome:'Todas', nomeEn:'All', titulo:'Portugal', aberta:true, lugares:tot.l || 1248, eventos:tot.e || 37, semana:tot.e || 150, agora:0, centro:[39.55, -8.1], zoom:7, agoraOnde:{pt:'em Portugal', en:'in Portugal'}, bairros:[]}); }
  (window.STREETFY_CIDADES || []).forEach(c => {
    let x = pt.cidades.find(y => y.id === c.id);
    if (x && x.aberta) return;
    if (!x) { x = {id:c.id, nome:c.nome}; pt.cidades.push(x); }
    Object.assign(x, {aberta:true, lugares:c.lugares, eventos:c.eventos, semana:c.eventos, agora:0, centro:c.centro || [39.5, -8.0], zoom:c.centro ? 13 : 7, agoraOnde:{pt:'em ' + c.nome, en:'in ' + c.nome}, bairros:[]});
  });
  const ordem = ['todas', 'lisboa', 'porto']; pt.cidades.sort((a, b) => (ordem.indexOf(b.id) + 1 && ordem.indexOf(a.id) + 1) ? ordem.indexOf(a.id) - ordem.indexOf(b.id) : (ordem.indexOf(b.id) + 1) - (ordem.indexOf(a.id) + 1) || (b.aberta - a.aberta) || a.nome.localeCompare(b.nome, 'pt')); }
/* R85: sem conta ligada no portal, o Instagram do lugar vem da lista manual (perfis.json → STREETFY_PERFIS) */
const chaveNome = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
{ const PERF = window.STREETFY_PERFIS || {}; ITENS.forEach(i => { if (!i.instagram) { const h = PERF[chaveNome(i.lugar)] || PERF[chaveNome(i.titulo)]; if (h) i.instagram = h; } }); }
const camada = i => (CAMADA[i.origem] === undefined ? 1 : CAMADA[i.origem]);
/* gostos (coração nos cartões): ficam no aparelho e mandam na ordem. O que gostaste vem primeiro; depois, dentro de cada
   camada, sobe o que se parece com o que gostaste (mesmo lugar > mesmo estilo > mesmo tipo). No site real isto vem da conta. */
const GOSTOS_K = 'streetfy:gostos';
let GOSTOS = new Set(); try { GOSTOS = new Set(JSON.parse(localStorage.getItem(GOSTOS_K) || '[]')); } catch (e) {}
const POR_ID = {}; ITENS.forEach(i => { POR_ID[i.id] = i; });
const gosta = i => GOSTOS.has(i.id);
function afinidade(i){
  let a = 0;
  GOSTOS.forEach(id => { const g = POR_ID[id]; if (!g || g === i) return; if (g.lugar && g.lugar === i.lugar) a += 10; if (g.estilo && g.estilo === i.estilo) a += 3; if ((g.tipos || []).some(t => (i.tipos || []).includes(t))) a += 1; });
  return a;
}
function ordenar(lista){
  const l = lista.slice().sort((a, b) => camada(a) - camada(b));
  let n = 0; /* no máximo 2 patrocinados por ecrã; o resto desce para a camada do parceiro (R74) */
  const base = l.map(i => (camada(i) === 0 && ++n > 2) ? Object.assign({}, i, {origem:'parceiro'}) : i);
  const pat = i => camada(i) === 0 ? 0 : 1;
  const af = new Map(base.map(i => [i.id, GOSTOS.size ? afinidade(i) : 0]));
  return base.sort((a, b) => (gosta(b) - gosta(a)) || (pat(a) - pat(b)) || (importancia(b) + af.get(b.id) - importancia(a) - af.get(a.id)) || ((a._fora ? 1 : 0) - (b._fora ? 1 : 0)) || (camada(a) - camada(b)));
}
const im = i => /^(https?:|data:|img\/)/.test(i.img || '') ? i.img : 'img/' + i.img + '.jpg';
const lugarKey = i => i.cidade + '/' + chaveNome(i.lugar || i.titulo);
const hrefPerfil = i => 'perfil.html#lugar=' + encodeURIComponent(lugarKey(i)) + '&evento=' + encodeURIComponent(i.id);
const PADRAO = {pais:'pt', cidade:'todas', tipo:'tudo', quando:'hoje', estilo:'todos', bairro:'', q:'', preco:'', hora:'', extra:''};
/* cidade escolhida = a cidade + os arredores (25 km do centro); "todas" = o país inteiro */
const RAIO_KM = 25;
const km = (a, b, c, d) => { const r = Math.PI / 180, x = (d - b) * r * Math.cos((a + c) / 2 * r), y = (c - a) * r; return Math.sqrt(x * x + y * y) * 6371; };
function emCidade(i, cid){
  if (cid === 'todas' || i.cidade === cid) { i._fora = ''; return true; }
  if (i.lat && i.lng && i._dentro === undefined) i._dentro = null;
  const c = (PAISES[0].cidades.find(x => x.id === cid) || {}).centro;
  if (c && i.lat && i.lng && km(c[0], c[1], i.lat, i.lng) <= RAIO_KM) { i._fora = perto(i, cid); return true; }
  return false;
}
/* o nome do arredor sai da posição (a cidade mais próxima com centro conhecido), não da etiqueta da fonte, que às vezes é só o distrito */
const PERTO = {};
function perto(i, cid){
  const k = i.lat.toFixed(3) + ',' + i.lng.toFixed(3) + ',' + cid;
  if (PERTO[k] !== undefined) return PERTO[k];
  let melhor = null, d0 = 1e9;
  PAISES[0].cidades.forEach(x => { if (!x.centro || x.id === 'todas') return; const d = km(x.centro[0], x.centro[1], i.lat, i.lng); if (d < d0) { d0 = d; melhor = x; } });
  const c0 = (PAISES[0].cidades.find(x => x.id === cid) || {centro:[i.lat, i.lng]}).centro, dc = km(c0[0], c0[1], i.lat, i.lng);
  if (dc <= 6) return (PERTO[k] = '');                                  /* dentro da cidade: só a etiqueta da fonte estava errada */
  return (PERTO[k] = (!melhor || melhor.id === cid || d0 > 12) ? Math.round(dc) + ' km' : melhor.nome);
}
/* importância: curtidas e cliques. No protótipo: os "vão" e "aqui" do catálogo + os gostos e cliques deste aparelho; no site real, as contagens de todos vêm da API */
const CLIQUES_K = 'streetfy:cliques';
let CLIQUES = {}; try { CLIQUES = JSON.parse(localStorage.getItem(CLIQUES_K) || '{}'); } catch (e) {}
const curtidas = i => (+i.curtidas || 0) + (+i.vao || 0) + (GOSTOS.has(i.id) ? 1 : 0);
const cliques = i => (+i.cliques || 0) + (+i.aqui || 0) + (+CLIQUES[i.id] || 0);
const importancia = i => curtidas(i) * 2 + cliques(i);
document.addEventListener('click', ev => { const a = ev.target.closest('a[data-id]'); if (!a || ev.target.closest('[data-f="gosto"]')) return; const id = a.dataset.id; CLIQUES[id] = (+CLIQUES[id] || 0) + 1; try { localStorage.setItem(CLIQUES_K, JSON.stringify(CLIQUES)); } catch (x) {} }, true);
/* procura por nome: todas as palavras têm de bater no lugar, no título ou no bairro, sem acentos */
const bate = (i, q) => { const n = chaveNome((i.lugar || '') + ' ' + (i.titulo || '') + ' ' + (i.bairro || '')); return chaveNome(q).split(' ').filter(Boolean).every(w => n.includes(w)); };
const LUGARES_CID = {};
const lugaresDe = cid => LUGARES_CID[cid] || (LUGARES_CID[cid] = [...new Set(ITENS.filter(i => emCidade(i, cid) && i.lugar).map(i => i.lugar.trim()))].sort((a, b) => a.localeCompare(b, 'pt')));
const ICO_BUSCA = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M16.5 16.5L21 21" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';

/* ---------- tempo: a rolar · já já rola · vai rolar · já rolou ----------
   A hora de fim vem da fonte (horaFim) ou de um intervalo no texto ("23:30 – 06:00"); sem nada, uma duração por tipo.
   "Agora" é o relógio do aparelho; #agora=HH:MM no link finge outra hora, para testar e para fotografias. */
const SEM_FIM_H = 4;
const DIA_PT = {seg:1, ter:2, qua:3, qui:4, sex:5, sab:6, dom:0};
const SEM = {pt:['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'], en:['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']};
const SEM_LONGO = {pt:['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'], en:['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']};
const MESES = {pt:['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'], en:['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']};
function AGORA(){ const d = new Date(); const m = (new URLSearchParams(location.hash.slice(1)).get('agora') || '').match(/^(\d{1,2}):(\d{2})$/); if (m) d.setHours(+m[1], +m[2], 0, 0); return d; }
const HOJE0 = agora => new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
const maisDias = (d, k) => { const x = new Date(d); x.setDate(x.getDate() + k); return x; };
const parseData = s => { const p = String(s).split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); };
/* "fim de semana" = sex, sáb e dom até ao primeiro domingo a partir de hoje (ao domingo é só hoje) */
function fdsK(hoje){ const ks = []; for (let k = 0; k <= 6; k++) { const wd = (hoje.getDay() + k) % 7; if (wd === 5 || wd === 6 || wd === 0) { ks.push(k); if (wd === 0) break; } } return ks; }
function diasDe(quando, hoje){ if (quando === 'todas') return [0, 1, 2, 3, 4, 5, 6]; if (quando === 'hoje') return [0]; if (quando === 'amanha') return [1]; if (quando === 'fds') return fdsK(hoje); const m = /^d([0-6])$/.exec(quando); if (m) return [+m[1]]; return [0, 1, 2, 3, 4, 5, 6]; }
function etiquetasDeK(k, hoje){ const q = ['semana', 'd' + k]; if (k === 0) q.push('hoje'); if (k === 1) q.push('amanha'); if (fdsK(hoje).includes(k)) q.push('fds'); return q; }
const PREFIXO = h => String(h || '').match(/^(seg|ter|qua|qui|sex|s[áa]b|dom)\b/i);
/* dias (0..6 a contar de hoje) em que o item acontece: datas do bot, ou o dia da semana no texto, ou as etiquetas do catálogo */
function diasDoItem(i, hoje){
  if (i.datas && i.datas.length) return i.datas.map(d => Math.round((parseData(d) - hoje) / 864e5)).filter(k => k >= 0 && k <= 6);
  if (i.data) { const a = parseData(i.data), b = i.dataFim ? parseData(i.dataFim) : a; const ks = []; for (let k = 0; k <= 6; k++) { const d = maisDias(hoje, k); if (d >= a && d <= b) ks.push(k); } return ks; }
  const m = PREFIXO(i.hora);
  if (m) return [(DIA_PT[m[1].toLowerCase().replace('á', 'a')] - hoje.getDay() + 7) % 7];
  const q = i.quando || [];
  if (q.includes('hoje') && q.includes('amanha')) return [0, 1, 2, 3, 4, 5, 6];   /* casa aberta todos os dias */
  if (q.includes('amanha')) return [1];
  if (q.includes('fds')) return fdsK(hoje);
  return [0];
}
/* corrige as etiquetas hoje/amanhã/fds/semana de todos os itens pela data real (a página deixa de viver numa sexta inventada) */
function normalizaTempo(){
  const hoje = HOJE0(AGORA());
  ITENS.forEach(i => { if (!i._q0) i._q0 = (i.quando || []).slice(); const ks = diasDoItem(Object.assign({}, i, {quando:i._q0}), hoje); i._ks = ks; const tags = new Set(); ks.forEach(k => etiquetasDeK(k, hoje).forEach(t => tags.add(t))); i.quando = [...tags]; });
}
/* a ocorrência que interessa: a primeira dentro dos dias escolhidos; senão, a primeira que vem */
function dataDe(i, agora, ks){
  const hoje = HOJE0(agora), dias = i._ks || diasDoItem(i, hoje);
  const k = ks ? dias.find(d => ks.includes(d)) : undefined;
  return maisDias(hoje, k !== undefined ? k : (dias.length ? dias[0] : 0));
}
function rotuloQuando(q, t, hoje){ if (q === 'todas') return t.todas.toLowerCase(); const m = /^d([0-6])$/.exec(q); if (!m) return String(t[q] || q).toLowerCase(); const d = maisDias(hoje, +m[1]); return SEM[lang()][d.getDay()] + ' ' + d.getDate(); }
function textoHoje(hoje){ return lang() === 'en' ? SEM_LONGO.en[hoje.getDay()] + ', ' + hoje.getDate() + ' ' + MESES.en[hoje.getMonth()] : SEM_LONGO.pt[hoje.getDay()] + ', ' + hoje.getDate() + ' de ' + MESES.pt[hoje.getMonth()]; }
function horasDe(i){
  const h = String(i.hora || ''), m = h.match(/(\d{1,2})[:h](\d{2})?/); if (!m) return null;
  const ini = +m[1] + (+(m[2] || 0)) / 60; let fim = null;
  const f = String(i.horaFim || '').match(/(\d{1,2})[:h](\d{2})?/);
  if (f) fim = +f[1] + (+(f[2] || 0)) / 60;
  else { const r = ((i.pp || '') + ' ' + h).match(/\d{1,2}[:h]\d{2}\s*[–-]\s*(\d{1,2})[:h](\d{2})/); if (r) fim = +r[1] + (+r[2]) / 60; }
  if (fim == null) fim = ini + SEM_FIM_H;   /* sem hora de fim: ativo até 4 horas depois de começar (um evento das 23h ainda está a rolar às 2h do dia seguinte) */
  if (fim <= ini) fim += 24;
  return [ini, fim];
}
/* evento com várias sessões: se a sessão do primeiro dia escolhido já acabou, conta a próxima dentro do período */
function grupoDe(i, agora, ks){
  const hojeD = HOJE0(agora), dias = (i._ks || []).filter(k => !ks || ks.includes(k)).sort((a, b) => a - b);
  for (let n = 0; n < dias.length - 1; n++) { const g = grupoDeDia(i, agora, ks, maisDias(hojeD, dias[n])); if (g !== 'rolou') return g; }
  return grupoDeDia(i, agora, ks, dias.length ? maisDias(hojeD, dias[dias.length - 1]) : null);
}
function grupoDeDia(i, agora, ks, diaFixo){
  const dia = diaFixo || dataDe(i, agora, ks), hs = horasDe(i), hojeD = HOJE0(agora);
  if (!hs) { /* sem hora de fim não há "a rolar": exposições e casas sem hora marcada vão para "o dia todo" */
    const fimD = i.dataFim ? new Date(i.dataFim + 'T23:59:59') : new Date(dia.getTime() + 86399e3);
    return fimD < agora ? 'rolou' : 'diatodo';
  }
  const H = 3600e3, kDia = Math.round((dia - hojeD) / 864e5);
  /* noite que atravessou a meia-noite: só conta se o dia anterior também estiver no período escolhido (com "amanhã" escolhido, o bar aberto hoje não está "a rolar") */
  if (hs[1] > 24 && (kDia === 0 || !ks || ks.includes(kDia - 1))) { const ontem = dia.getTime() - 86400e3; if (agora >= ontem + hs[0] * H && agora < ontem + hs[1] * H) return 'rolando'; }
  const ini = dia.getTime() + hs[0] * H, fim = dia.getTime() + hs[1] * H;
  if (agora >= fim) return 'rolou';
  if (agora >= ini) return 'rolando';
  if (ini - agora <= 2 * H) return 'jaja';
  return 'vai';
}
const GRUPOS = ['rolando', 'jaja', 'vai', 'diatodo', 'rolou'];
const cabecalhoGrupo = (g, n, t) => '<h2 class="fgrupo ' + g + '"><span class="s-eyebrow">' + t['gs_' + g] + ' · ' + n + '</span><span class="tit">' + t['gt_' + g] + '</span></h2>';
/* vista dos resultados: cartões ou lista. Preferência do aparelho, fora do link (quem recebe o link vê os cartões). */
let VISTA = 'cartoes'; try { if (localStorage.getItem('streetfy:vista') === 'lista') VISTA = 'lista'; } catch (e) {}
const ICO = {
  grade:'<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor"/><rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor"/><rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor"/><rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor"/></svg>',
  lista:'<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><rect x="3" y="4" width="18" height="3" rx="1.5" fill="currentColor"/><rect x="3" y="10.5" width="18" height="3" rx="1.5" fill="currentColor"/><rect x="3" y="17" width="18" height="3" rx="1.5" fill="currentColor"/></svg>',
  coracao:'<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 21.3l-1.4-1.3C5.4 15.3 2 12.3 2 8.5 2 5.4 4.4 3 7.5 3c1.7 0 3.4.8 4.5 2.1C13.1 3.8 14.8 3 16.5 3 19.6 3 22 5.4 22 8.5c0 3.8-3.4 6.8-8.6 11.5L12 21.3z"/></svg>'
};
const coracao = (i, t) => '<button type="button" class="s-gosto' + (gosta(i) ? ' on' : '') + '" data-f="gosto" data-v="' + esc(i.id) + '" aria-pressed="' + gosta(i) + '" aria-label="' + esc(gosta(i) ? t.jaGosto : t.gosto) + '" title="' + esc(gosta(i) ? t.jaGosto : t.gosto) + '">' + ICO.coracao + '</button>';

/* na lista, cada card é uma noite (mesmo os de kind 'lugar', ex.: "Base" no Jardim das Oliveiras): curte-se; o Seguir fica nos cards de locais */
const acao = (i, t) => coracao(i, t);

/* ---------- ajudantes ---------- */
const lang = () => (document.documentElement.lang || 'pt').slice(0, 2) === 'en' ? 'en' : 'pt';
const T = () => L[lang()];
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const fmt = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const nome = x => (lang() === 'en' && x.nomeEn) ? x.nomeEn : x.nome;
const paisDe = id => PAISES.find(p => p.id === id) || PAISES[0];
const cidadeDe = (pais, id) => pais.cidades.find(c => c.id === id) || pais.cidades[0];
/* estilos nos chips: primeiro os do catálogo do parceiro, só depois os que o bot trouxe (R75) */
const estilosDe = cid => { const n = {}; ITENS.filter(i => emCidade(i, cid)).forEach(i => { n[i.estilo] = (n[i.estilo] || 0) + (i.origem === 'bot' ? 0.001 : 1); }); return Object.keys(n).sort((a, b) => n[b] - n[a]).slice(0, 8); };
const preco = i => i.preco === 0 ? T().livre : (typeof i.preco === 'number' ? '€' + i.preco : i.preco);
const tag = i => T().tags[i.tag] || i.tag;

/* os filtros do modelo A além de tipo, quando e estilo: preço, hora e extras */
const valPreco = i => i.preco === 0 || (i.tipos || []).includes('livre') ? ['gratis', '10', '20'] : typeof i.preco === 'number' ? (i.preco <= 10 ? ['10', '20'] : i.preco <= 20 ? ['20'] : ['mais']) : [];
const valHora = i => { const m = /(\d{1,2}):\d{2}/.exec(i.hora || ''); if (!m) return []; const h = +m[1]; return [h >= 6 && h < 20 ? 'tarde' : h >= 20 ? 'noite' : 'madrugada']; };
const valExtra = i => [(i.origem === 'parceiro' || i.origem === 'patrocinado') && 'streetfy', i.aqui && 'agora', i.amigos && 'amigos'].filter(Boolean);
const lst = v => String(v || '').split(',').filter(Boolean);
const passaE = (i, e) => emCidade(i, e.cidade)
    && (e.tipo === 'tudo' || tiposDe(e).some(tp => i.tipos.includes(tp)))
    && (e.quando === 'semana' || e.quando === 'todas' || i.quando.includes(e.quando))
    && (e.estilo === 'todos' || estilosSel(e).includes(i.estilo))
    && (!e.bairro || i.bairro === e.bairro)
    && (!e.preco || valPreco(i).includes(e.preco))
    && (!e.hora || lst(e.hora).some(h => valHora(i).includes(h)))
    && (!e.extra || lst(e.extra).every(x => valExtra(i).includes(x)))
    && (!e.q || bate(i, e.q));
function filtrar(e){ return ordenar(ITENS.filter(i => passaE(i, e))); }
function hashDe(e){
  const q = new URLSearchParams(); q.set('onde', e.pais + '/' + e.cidade);
  ['tipo', 'quando', 'estilo', 'bairro', 'q', 'preco', 'hora', 'extra'].forEach(k => { if (e[k] && e[k] !== PADRAO[k]) q.set(k, e[k]); });
  return q.toString().replace(/%2F/g, '/').replace(/%2C/g, ',');
}
function lerUrl(){
  const e = Object.assign({}, PADRAO);
  const q = new URLSearchParams(location.hash.slice(1) + '&' + location.search.slice(1));
  if (q.get('onde')) { const [p, c] = q.get('onde').split('/'); if (p) e.pais = p; if (c) e.cidade = c; }
  if (q.get('cidade')) { e.cidade = q.get('cidade'); const p = PAISES.find(x => x.cidades.some(c => c.id === e.cidade)); if (p) e.pais = p.id; }
  ['tipo', 'quando', 'estilo', 'bairro', 'q', 'preco', 'hora', 'extra'].forEach(k => { if (q.get(k)) e[k] = q.get(k); });
  e.q = String(e.q || '').slice(0, 60);
  { const ts = String(e.tipo).split(',').filter(x => TIPOS.includes(x) && x !== 'tudo'); e.tipo = ts.length ? ts.join(',') : 'tudo'; }
  { const es = estilosSel(e); e.estilo = es.length ? es.join(',') : 'todos'; }
  if (!QUANDO.includes(e.quando) && e.quando !== 'todas' && !/^d[0-6]$/.test(e.quando)) e.quando = 'hoje';
  const p = paisDe(e.pais); e.pais = p.id; e.cidade = cidadeDe(p, e.cidade).id;
  return e;
}
const temEstado = () => /(^|[#&?])(onde|cidade|tipo|quando|estilo|bairro|q|preco|hora|extra)=/.test(location.hash + location.search);

/* ---------- peças de interface ---------- */
function grupo(k, lbl, ops, cur){
  return '<div class="fchips" role="group" aria-label="' + esc(lbl) + '"><small>' + esc(lbl) + '</small>'
    + ops.map(o => '<button type="button" data-f="' + k + '" data-v="' + esc(o[0]) + '"' + ((Array.isArray(cur) ? cur.includes(o[0]) : o[0] === cur) ? ' class="on" aria-pressed="true"' : ' aria-pressed="false"') + '>' + esc(o[1]) + '</button>').join('') + '</div>';
}
/* a barra no modelo A (filtro-a.js): pesquisa, o quadro do lugar, as pílulas de tipo e, com um tipo escolhido, as perguntas */
const FA_T = {
  pt:{quando:'Quando?', estilo:'Que estilo?', preco:'Quanto?', hora:'A que horas?', extra:'Mais alguma coisa?', semana:'Esta semana', gratis:'Grátis', p10:'Até €10', p20:'Até €20', pmais:'Mais de €20', tarde:'Fim de tarde', noite:'Noite', madrugada:'Madrugada', streetfy:'Bilhete no Xouty', agora:'Gente lá agora', amigos:'Amigos vão', pais:'todo o país', raio:'+ 25 km à volta', ev:n => n + (n === 1 ? ' evento' : ' eventos')},
  en:{quando:'When?', estilo:'What style?', preco:'How much?', hora:'What time?', extra:'Anything else?', semana:'This week', gratis:'Free', p10:'Up to €10', p20:'Up to €20', pmais:'Over €20', tarde:'Late afternoon', noite:'Night', madrugada:'After midnight', streetfy:'Ticket on Xouty', agora:'People there now', amigos:'Friends going', pais:'the whole country', raio:'+ 25 km around', ev:n => n + (n === 1 ? ' event' : ' events')}
};
const contaCidade = cid => { const c = (PAISES[0].cidades.find(x => x.id === cid) || {}).centro; return ITENS.filter(i => cid === 'todas' || i.cidade === cid || (c && i.lat && i.lng && km(c[0], c[1], i.lat, i.lng) <= RAIO_KM)).length; };
function passosFA(e, t, semQuando){
  const ft = FA_T[lang()], conta = (k, neutro, f) => { const e2 = Object.assign({}, e, {[k]:neutro}); const b = ITENS.filter(i => passaE(i, e2)); return v => b.filter(i => f(i, v)).length; };
  const ps = [];
  if (semQuando) { const c = conta('quando', 'semana', (i, v) => v === 'semana' || i.quando.includes(v)); ps.push({k:'quando', pq:ft.quando, um:true, ops:[['hoje', t.hoje], ['amanha', t.amanha], ['fds', t.fds], ['semana', ft.semana]].map(([v, n]) => [v, n, c(v)])}); }
  const cidade = cidadeDe(paisDe(e.pais), e.cidade);
  { const c = conta('estilo', 'todos', (i, v) => i.estilo === v); ps.push({k:'estilo', pq:ft.estilo, ops:(cidade.aberta ? estilosDe(cidade.id) : []).map(v => [v, cap(v), c(v)])}); }
  { const c = conta('preco', '', (i, v) => valPreco(i).includes(v)); ps.push({k:'preco', pq:ft.preco, um:true, ops:[['gratis', ft.gratis], ['10', ft.p10], ['20', ft.p20], ['mais', ft.pmais]].map(([v, n]) => [v, n, c(v)])}); }
  { const c = conta('hora', '', (i, v) => valHora(i).includes(v)); ps.push({k:'hora', pq:ft.hora, ops:[['tarde', ft.tarde], ['noite', ft.noite], ['madrugada', ft.madrugada]].map(([v, n]) => [v, n, c(v)])}); }
  { const c = conta('extra', '', (i, v) => valExtra(i).includes(v)); ps.push({k:'extra', pq:ft.extra, ops:[['streetfy', ft.streetfy], ['agora', ft.agora], ['amigos', ft.amigos]].map(([v, n]) => [v, n, c(v)])}); }
  return ps;
}
const selDeE = (e, semQuando) => Object.assign(semQuando ? {quando:[e.quando]} : {}, {estilo:estilosSel(e), preco:e.preco ? [e.preco] : [], hora:lst(e.hora), extra:lst(e.extra)});
function eDeSel(e, st, semQuando){
  const s = st.sel;
  e.tipo = Array.isArray(st.tops) ? (st.tops.length ? st.tops.join(',') : 'tudo') : (st.top || 'tudo');
  if (semQuando) e.quando = (s.quando || [])[0] || 'hoje';
  e.estilo = (s.estilo || []).join(',') || 'todos'; e.preco = (s.preco || [])[0] || ''; e.hora = (s.hora || []).join(','); e.extra = (s.extra || []).join(',');
}
function barra(e, t, fa, semQuando){
  const pais = paisDe(e.pais), cidade = cidadeDe(pais, e.cidade), ft = FA_T[lang()], FA = window.STREETFY_FILTRO_A;
  let h = '<label class="f fbusca' + (e.q ? ' on' : '') + '">' + ICO_BUSCA + '<input type="search" data-f-q list="lugares-' + esc(cidade.id) + '" value="' + esc(e.q) + '" placeholder="' + esc(t.procurarPh) + '" aria-label="' + esc(t.procurar) + '" autocomplete="off" spellcheck="false" enterkeyhint="search"><button type="button" data-f="q" data-v="" aria-label="' + esc(t.limpar) + '">×</button></label>'
    + '<datalist id="lugares-' + esc(cidade.id) + '">' + (cidade.aberta ? lugaresDe(cidade.id).map(l => '<option value="' + esc(l) + '">').join('') : '') + '</datalist>';
  if (!FA) return h;
  const nCid = cidade.aberta ? contaCidade(cidade.id) : 0;
  h += '<div class="fa">' + FA.onde({pais:{id:pais.id, nome:nome(pais)}, cid:{id:cidade.id, nome:cidade.id === 'todas' ? t.todasCid : nome(cidade)}, sub:(cidade.id === 'todas' ? ft.pais : ft.raio) + ' · ' + ft.ev(nCid),
      paises:PAISES.map(p => ({id:p.id, nome:nome(p) + (p.cidades.some(c => c.aberta) ? '' : ' · ' + t.breve), breve:!p.cidades.some(c => c.aberta)})),
      cidades:pais.cidades.map(c => ({id:c.id, nome:c.id === 'todas' ? t.todasCid : nome(c), n:c.aberta ? contaCidade(c.id) : null, breve:!c.aberta})), raio:null}, fa.ui);
  const st = {top:e.tipo === 'tudo' ? null : tiposDe(e)[0], tops:tiposDe(e), sel:selDeE(e, semQuando), feito:fa.feito, todos:fa.todos};
  if (cidade.aberta) {
    const nT = v => { const e2 = Object.assign({}, e, {tipo:v, estilo:'todos', preco:'', hora:'', extra:''}); return ITENS.filter(i => passaE(i, e2)).length; };
    fa.passos = st.top ? passosFA(e, t, semQuando) : [];
    h += FA.painel(st, {multi:true, tudo:t.tudo, topo:TIPOS.filter(x => x !== 'tudo').map(x => [x, t[x], nT(x)]), passos:fa.passos});
  }
  return h + '</div>';
}
function linha(e, t, pais, cidade, n, ng, lista){
  let h = '<p class="fres"><b>' + (cidade.aberta ? t.destaque(n) : esc(nome(cidade)) + ' · ' + t.breve) + '</b><span>' + (cidade.id === 'todas' ? esc(nome(pais)) : esc(nome(cidade)) + ' ' + esc(t.maisArredores) + ', ' + esc(nome(pais))) + ' · ' + rotuloQuando(e.quando, t, HOJE0(AGORA()))
    + (e.tipo !== 'tudo' ? ' · ' + tiposDe(e).map(x => t[x].toLowerCase()).join(' + ') : '') + (e.estilo !== 'todos' ? ' · ' + esc(estilosSel(e).join(' + ')) : '') + (e.q ? ' · ' + t.procura + ' "' + esc(e.q) + '"' : '') + '</span>';
  if (e.q && lista && lista.length) { const ks = [...new Set(lista.map(lugarKey))]; if (ks.length === 1) h += '<a class="fperfil" href="perfil.html#lugar=' + encodeURIComponent(ks[0]) + '">' + t.perfilDe + ' ' + esc(lista[0].lugar || lista[0].titulo) + ' ›</a>'; }
  if (ng) h += '<span class="fgostos" title="' + esc(t.pelosGostos) + '">' + ICO.coracao + ' ' + esc(t.gostos(ng)) + '</span>';
  if (e.bairro) h += '<span class="bchip">' + esc(e.bairro) + '<button type="button" data-f="bairro" data-v="' + esc(e.bairro) + '" aria-label="remover bairro">×</button></span>';
  if (e.tipo !== 'tudo' || e.quando !== 'hoje' || e.estilo !== 'todos' || e.bairro || e.q) h += '<a href="#" data-f="limpar">' + t.limpar + '</a>';
  const vb = (v, ico, txt) => '<button type="button" data-f="vista" data-v="' + v + '"' + (VISTA === v ? ' class="on" aria-pressed="true"' : ' aria-pressed="false"') + ' title="' + esc(txt) + '">' + ico + '<span>' + esc(txt) + '</span></button>';
  h += '<span class="fvista" role="group" aria-label="' + esc(t.vista) + '">' + vb('cartoes', ICO.grade, t.cartoes) + vb('lista', ICO.lista, t.lista) + '</span>';
  return h + '</p>';
}
function presenca(i, t){
  const a = [];
  if (i.aqui) a.push('● ' + i.aqui + ' ' + t.aquiAgora);
  if (i.vao) a.push(i.vao + ' ' + t.vao);
  if (i.amigos) a.push(i.amigos + ' ' + t.amigos);
  return a.join(' · ') || t.noApp;
}
function cartaoPoster(i, k, t){
  const livre = i.preco === 0;
  return '<a class="s-card pop' + (gosta(i) ? ' gostado' : '') + '" data-id="' + esc(i.id) + '" style="animation-delay:' + (k * 60) + 'ms" href="' + esc(hrefPerfil(i)) + '"><div class="s-im" style="background-image:url(' + im(i) + ')"></div>' + acao(i, t, 'no-card')
    + '<span class="s-tag' + (livre ? ' mint' : '') + '">' + esc(tag(i)) + '</span>' + (i.origem === 'patrocinado' ? '<span class="s-pat">' + t.patrocinado + '</span>' : '') + '<h3>' + esc(i.titulo) + '</h3>'
    + '<p><b>' + esc(i.lugar) + '</b>' + (i._fora ? ' · ' + esc(i._fora) : '') + (i.hora ? ' · ' + esc(i.hora) : '') + (livre ? '' : ' · ' + esc(preco(i)))
    + (i.aqui ? ' <span class="s-here">● ' + i.aqui + ' ' + t.aqui + '</span>' : (i.vao ? ' <span class="s-here" style="color:#dcdcdc">' + i.vao + ' ' + t.vao + '</span>' : '')) + (i.origem === 'bot' ? '<span class="s-via">' + t.via + ' ' + esc(i.fonte) + '</span>' : i.porNome ? '<span class="s-via">' + t.por + ' ' + esc(i.porNome) + '</span>' : '') + '</p></a>';
}
function cartaoLista(i, k, t){
  const livre = i.preco === 0;
  const topo = livre ? (i.hora ? i.hora + ' · ' : '') + t.livre : (i.hora ? i.hora + ' · ' : '') + i.estilo;
  return '<a class="card-l pop' + (gosta(i) ? ' gostado' : '') + '" data-id="' + esc(i.id) + '" style="animation-delay:' + (k * 60) + 'ms" href="' + esc(hrefPerfil(i)) + '">' + acao(i, t, 'no-card') + '<div class="s-im" style="background-image:url(' + im(i) + ')">'
    + '<span class="s-tag' + (livre ? ' mint' : '') + '">' + esc(topo) + '</span>' + (i.origem === 'patrocinado' ? '<span class="s-pat">' + t.patrocinado + '</span>' : '') + (livre ? '' : '<span class="s-price">' + esc(preco(i)) + '</span>') + '</div>'
    + '<div class="bd"><h3>' + esc(i.titulo) + '</h3><p>' + esc(i.lugar) + ((i._fora || i.bairro) ? ' · ' + esc(i._fora || i.bairro) : '') + (i.star ? ' · ★ ' + i.star : '') + '</p>'
    + '<div class="op"><i>✓</i>' + presenca(i, t) + '</div><span class="pp">' + esc(i.pp || '') + (i.origem === 'bot' ? (i.pp ? ' · ' : '') + t.via + ' ' + esc(i.fonte) : i.porNome ? (i.pp ? ' · ' : '') + t.por + ' ' + esc(i.porNome) : '') + (i.instagram ? '<span class="s-ig">@' + esc(i.instagram) + '</span>' : '') + '</span></div></a>';
}
/* vista em lista: uma linha por evento, com miniatura, lugar, hora, preço e presença */
function cartaoLinha(i, k, t){
  const livre = i.preco === 0, pr = preco(i);
  const pres = i.aqui ? '● ' + i.aqui + ' ' + t.aqui : (i.vao ? i.vao + ' ' + t.vao : '');
  return '<a class="ev-row pop' + (gosta(i) ? ' gostado' : '') + '" data-id="' + esc(i.id) + '" style="animation-delay:' + (Math.min(k, 12) * 40) + 'ms" href="' + esc(hrefPerfil(i)) + '"><div class="im" style="background-image:url(' + im(i) + ')"></div>'
    + '<div class="bd"><h3>' + esc(i.titulo) + '</h3><p><b>' + esc(i.lugar) + '</b>' + (i._fora ? ' · ' + esc(i._fora) : '') + (i.bairro ? ' · ' + esc(i.bairro) : '') + (i.hora ? ' · ' + esc(i.hora) : '') + (i.estilo ? ' · ' + esc(cap(i.estilo)) : '') + (i.star ? ' · ★ ' + i.star : '') + '</p>'
    + '<p class="et">' + (i.origem === 'patrocinado' ? '<span class="ev-tag pat">' + t.patrocinado + '</span>' : '') + (i.origem === 'bot' ? '<span class="ev-tag">' + t.via + ' ' + esc(i.fonte) + '</span>' : i.porNome ? '<span class="ev-tag">' + t.por + ' ' + esc(i.porNome) + '</span>' : '') + (i.instagram ? '<span class="ev-tag ig">@' + esc(i.instagram) + '</span>' : '') + (i.pp && i.origem !== 'bot' ? '<span class="pp">' + esc(i.pp) + '</span>' : '') + '</p></div>'
    + '<div class="dir">' + (pr ? '<span class="pr' + (livre ? ' mint' : '') + '">' + esc(pr) + '</span>' : '') + (pres ? '<span class="pres">' + pres + '</span>' : '') + '</div>' + acao(i, t) + '</a>';
}
function vazio(e, t, cidade){
  const espera = document.getElementById('espera') ? '#espera' : 'cidades.html#espera';
  if (!cidade.aberta) return '<div class="fempty pop"><b>' + esc(nome(cidade)) + '<br>' + t.naoAbriu + '</b><p>' + esc(t.breveTxt(nome(cidade), cidade.abre && cidade.abre[lang()])) + '</p><a class="s-btn ink" href="' + espera + '">' + t.avisar + '</a></div>';
  if (e.q && e.quando !== 'semana') { const n = filtrar(Object.assign({}, e, {quando:'semana'})).length; if (n) return '<div class="fempty pop"><b>' + t.nadaNome + '</b><p>' + esc(nome(cidade)) + ' · "' + esc(e.q) + '"</p><div style="display:flex;gap:10px;flex-wrap:wrap"><button type="button" class="s-btn ink" data-f="quando" data-v="3">' + t.semanaToda(n) + '</button><button type="button" class="s-btn ghost" data-f="q" data-v="">' + t.limpar + '</button></div></div>'; }
  return '<div class="fempty pop"><b>' + t.nada + '</b><p>' + esc(t.nadaTxt(nome(cidade))) + '</p><button type="button" class="s-btn ink" data-f="limpar">' + t.limpar + '</button></div>';
}

/* ---------- montagem ---------- */
function montar(bar){
  const q = s => s ? document.querySelector(s) : null;
  const res = q(bar.dataset.resultados) || document.querySelector('[data-resultados]');
  const dias = q(bar.dataset.dias) || document.querySelector('[data-f-dias]');
  const bairros = q(bar.dataset.bairros) || document.querySelector('[data-f-bairros]');
  const mapa = q(bar.dataset.mapa) || document.querySelector('[data-f-mapa]');
  let cidadeNoMapa = '';
  let e = lerUrl();
  const semQuando = !dias;
  const fa = {ui:{aberto:false, passo:''}, feito:{}, todos:false, passos:[]};
  const marcaFeito = () => { fa.feito = {}; fa.todos = false; ['estilo', 'preco', 'hora', 'extra'].forEach(k => { if (e[k] && e[k] !== PADRAO[k]) fa.feito[k] = 1; }); if (semQuando && e.quando !== 'hoje') fa.feito.quando = 1; };
  marcaFeito();
  function render(gravar, parcial){
    const t = T(), pais = paisDe(e.pais), cidade = cidadeDe(pais, e.cidade);
    let lista = cidade.aberta ? filtrar(e) : [];
    if (e.quando === 'todas') { const ag = AGORA(), ks0 = diasDe('todas', HOJE0(ag)); lista = lista.filter(i => grupoDe(i, ag, ks0) !== 'rolou'); }
    if (parcial && bar.querySelector('.fres')) { bar.querySelector('.fres').outerHTML = linha(e, t, pais, cidade, lista.length, lista.filter(gosta).length, lista); bar.querySelector('.fbusca').classList.toggle('on', !!e.q); }
    else { if (e.tipo === 'tudo') { fa.feito = {}; fa.todos = false; } bar.innerHTML = barra(e, t, fa, semQuando) + linha(e, t, pais, cidade, lista.length, lista.filter(gosta).length, lista); }
    if (res) {
      const max = +(res.dataset.max || 12), emLista = VISTA === 'lista', tipo = emLista ? 'linha' : (res.dataset.cartao || 'poster');
      res.classList.toggle('vista-lista', emLista);
      const cartao = tipo === 'linha' ? cartaoLinha : tipo === 'lista' ? cartaoLista : cartaoPoster;
      const agora = AGORA(), ks = diasDe(e.quando, HOJE0(agora)), por = {rolando:[], jaja:[], vai:[], diatodo:[], rolou:[]}; lista.forEach(i => por[grupoDe(i, agora, ks)].push(i));
      if (res.dataset.grupos !== undefined) {
        /* a rolar primeiro, o que já acabou no fundo (só com scroll); o corte do "mostrar mais" segue essa ordem */
        const seq = []; GRUPOS.forEach(g => por[g].forEach(i => seq.push([g, i])));
        let ultimo = '';
        res.innerHTML = (!cidade.aberta || !lista.length) ? vazio(e, t, cidade) : seq.slice(0, max).map(([g, i], k) => { let h = ''; if (g !== ultimo) { ultimo = g; h = cabecalhoGrupo(g, por[g].length, t); } return h + (g === 'rolou' ? cartao(i, k, t).replace(/^<a class="/, '<a class="passou ') : cartao(i, k, t)); }).join('')
          + (seq.length > max ? '<div class="fmais"><a href="#" class="s-btn ink" data-f="mais">' + t.mais(seq.length - max) + '</a></div>' : '');
      } else {
        const vivos = lista.filter(i => grupoDe(i, agora, ks) !== 'rolou'); /* na inicial, o que já acabou não aparece */
        res.innerHTML = (!cidade.aberta || !vivos.length) ? vazio(e, t, cidade) : vivos.slice(0, max).map((i, k) => cartao(i, k, t)).join('')
          + (vivos.length > max ? '<div class="fmais"><a href="#" class="s-btn ink" data-f="mais">' + t.mais(vivos.length - max) + '</a></div>' : '');
      }
    }
    document.querySelectorAll('[data-f-cidade]').forEach(x => { x.textContent = (cidade.titulo || nome(cidade)).toUpperCase(); });
    document.querySelectorAll('[data-f-conta]').forEach(x => { const v = cidade.aberta ? cidade[x.dataset.fConta] : 0; if (v === undefined) return; x.dataset.count = v; x.textContent = fmt(v); });
    document.querySelectorAll('[data-f-agora]').forEach(x => { x.textContent = cidade.aberta ? t.agora(cidade.agoraOnde[lang()]) : t.agoraNada; });
    document.querySelectorAll('[data-f-link]').forEach(a => { a.href = a.dataset.fLink + '#' + hashDe(e); });
    { const hoje = HOJE0(AGORA()); document.querySelectorAll('[data-f-hoje]').forEach(x => { x.textContent = textoHoje(hoje); });
      if (dias) { const ks = diasDe(e.quando, hoje), todos = ITENS.filter(i => emCidade(i, cidade.id));
        const todasOn = e.quando === 'todas';
        dias.innerHTML = cidade.aberta ? '<button type="button" class="todas' + (todasOn ? ' on' : '') + '" data-f="dia" data-v="todas" aria-pressed="' + todasOn + '"><b>' + t.todasCurto + '</b><small>' + t.todasSub + '</small><i>' + todos.filter(i => grupoDe(i, AGORA(), [0, 1, 2, 3, 4, 5, 6]) !== 'rolou').length + '</i></button>' + [0, 1, 2, 3, 4, 5, 6].map(k => { const d = maisDias(hoje, k), n = todos.filter(i => (i._ks || []).includes(k)).length, on = !todasOn && ks.includes(k); return '<button type="button" data-f="dia" data-v="' + k + '"' + (on ? ' class="on"' : '') + ' aria-pressed="' + on + '"><b>' + d.getDate() + '</b><small>' + SEM[lang()][d.getDay()] + '</small><i>' + n + '</i></button>'; }).join('') : ''; } }
    if (bairros) bairros.innerHTML = cidade.aberta ? (cidade.bairros || []).map(b => '<a href="#' + hashDe(Object.assign({}, e, {bairro:b[0]})) + '" data-f="bairro" data-v="' + esc(b[0]) + '"' + (e.bairro === b[0] ? ' class="on"' : '') + '><span class="n">● ' + b[1] + ' ' + t.aqui + '</span><b>' + esc(b[0]) + '</b><span>' + esc(b[2]) + '</span></a>').join('') : '';
    if (mapa && window.BORA_MAPA && cidade.aberta) {
      const pinos = lista.filter(i => i.lat && i.lng && (cidade.id === 'todas' || !cidade.centro || km(cidade.centro[0], cidade.centro[1], i.lat, i.lng) <= RAIO_KM)).map(i => ({lat:i.lat, lng:i.lng, t:i.titulo + (i.lugar && chaveNome(i.lugar) !== chaveNome(i.titulo) ? ' · ' + i.lugar : ''), hot:!!i.aqui && i.aqui >= 100, n:i.aqui ? i.aqui + ' ' + t.aqui : '', href:hrefPerfil(i),
        s:i.lugar + (i.hora ? ' · ' + i.hora : '') + (i.preco === 0 ? ' · ' + t.livre : (typeof i.preco === 'number' ? ' · €' + i.preco : '')) + (i.bairro ? ' · ' + i.bairro : '')}));
      const trocou = cidadeNoMapa !== cidade.id; cidadeNoMapa = cidade.id;
      const comRaio = window.BORA_MAPA.raio && cidade.id !== 'todas' && cidade.centro;
      window.BORA_MAPA.atualizar(mapa, pinos, cidade.centro, cidade.zoom, e.bairro ? 'pinos' : (trocou && !comRaio));
      if (window.BORA_MAPA.raio && !e.bairro && trocou) window.BORA_MAPA.raio(mapa, comRaio ? cidade.centro : null, RAIO_KM);   /* o mesmo raio de 25 km da lista; o mapa enquadra o círculo */
    }
    if (gravar) history.replaceState(null, '', '#' + hashDe(e));
  }
  function set(k, v){
    if (k === 'pais') { e.pais = v; e.cidade = paisDe(v).cidades[0].id; e.estilo = 'todos'; e.bairro = ''; }
    else if (k === 'cidade') { e.cidade = v; e.estilo = 'todos'; e.bairro = ''; }
    else if (k === 'estilo') { if (v === 'todos') e.estilo = 'todos'; else { const es = estilosSel(e), i = es.indexOf(v); if (i >= 0) es.splice(i, 1); else es.push(v); e.estilo = es.length ? es.join(',') : 'todos'; } }
    else if (k === 'tipo') { if (v === 'tudo') e.tipo = 'tudo'; else { const ts = tiposDe(e), i = ts.indexOf(v); if (i >= 0) ts.splice(i, 1); else ts.push(v); e.tipo = ts.length ? ts.join(',') : 'tudo'; } }
    else if (k === 'dia') { e.quando = v === 'todas' ? 'todas' : +v === 0 ? 'hoje' : +v === 1 ? 'amanha' : 'd' + (+v); }
    else if (k === 'mais') { if (res) res.dataset.max = (+(res.dataset.max || 12)) + 24; render(false); return; }
    else if (k === 'gosto') { if (GOSTOS.has(v)) GOSTOS.delete(v); else GOSTOS.add(v); try { localStorage.setItem(GOSTOS_K, JSON.stringify([...GOSTOS])); } catch (x) {} render(false); return; }
    else if (k === 'vista') { VISTA = v === 'lista' ? 'lista' : 'cartoes'; try { localStorage.setItem('streetfy:vista', VISTA); } catch (x) {} render(false); return; }
    else if (k === 'bairro') { e.bairro = e.bairro === v ? '' : v; }
    else if (k === 'limpar') { e = Object.assign({}, PADRAO, {pais:e.pais, cidade:e.cidade}); }
    else if (k === 'q') { e.q = String(v || '').slice(0, 60); }
    else e[k] = v;
    render(true);
  }
  const click = ev => {
    const bf = ev.target.closest('[data-fa]');
    if (bf && bar.contains(bf) && window.STREETFY_FILTRO_A) {
      ev.preventDefault(); if (bf.disabled || bf.dataset.fa === 'raio') return;
      const FA = window.STREETFY_FILTRO_A, o = FA.acaoOnde(fa.ui, bf);
      if (o && o.pais) { set('pais', o.pais); return; }
      if (o && o.cid) { set('cidade', o.cid); return; }
      if (o) { render(false); return; }
      const st = {top:e.tipo === 'tudo' ? null : tiposDe(e)[0], tops:tiposDe(e), sel:selDeE(e, semQuando), feito:fa.feito, todos:fa.todos};
      if (FA.acao(st, bf, fa.passos)) { fa.feito = st.feito; fa.todos = st.todos; if (bf.dataset.fa === 'top' || bf.dataset.fa === 'top-voltar') { st.sel = semQuando ? {quando:[e.quando]} : {}; } eDeSel(e, st, semQuando); render(true); }
      return;
    }
    const b = ev.target.closest('[data-f]'); if (!b || b.tagName === 'SELECT') return;
    ev.preventDefault(); set(b.dataset.f, b.dataset.v);
    if (b.dataset.f === 'bairro' && res && b.closest('[data-f-bairros]')) res.scrollIntoView({behavior:'smooth', block:'start'});
  };
  bar.addEventListener('change', ev => { const s = ev.target.closest('select[data-f]'); if (s) set(s.dataset.f, s.value); });
  let tmQ = 0;
  bar.addEventListener('input', ev => { const inp = ev.target.closest('input[data-f-q]'); if (!inp) return; e.q = inp.value.slice(0, 60); inp.closest('.fbusca').classList.toggle('on', !!e.q); clearTimeout(tmQ); tmQ = setTimeout(() => render(true, true), 140); });
  bar.addEventListener('keydown', ev => { const inp = ev.target.closest('input[data-f-q]'); if (!inp) return; if (ev.key === 'Enter') { ev.preventDefault(); clearTimeout(tmQ); e.q = inp.value.slice(0, 60); render(true, true); inp.blur(); if (res) res.scrollIntoView({behavior:'smooth', block:'start'}); } if (ev.key === 'Escape') { inp.value = ''; set('q', ''); } });
  [bar, res, dias, bairros].forEach(el => { if (el) el.addEventListener('click', click); });
  document.querySelectorAll('[data-f-set]').forEach(a => a.addEventListener('click', () => { const p = a.dataset.fSet.split('/'); e = Object.assign({}, PADRAO, {pais:p[0], cidade:p[1] || paisDe(p[0]).cidades[0].id}); render(false); }));
  document.addEventListener('bora:lang', () => render(false));
  window.addEventListener('hashchange', () => { if (temEstado()) { e = lerUrl(); marcaFeito(); render(false); } });
  render(false);
  return {estado:() => e, set, render};
}
normalizaTempo();
window.STREETFY_CATALOGO = {itens:ITENS, chave:chaveNome, lugarKey, CAMADA, deEventoCasa, publicado, EV_CASA};
const montados = [...document.querySelectorAll('[data-filtros]')].map(montar);
window.BORA_FILTROS = {PAISES, ITENS, TIPOS, QUANDO, filtrar, lerUrl, hashDe, montados, valPreco, valHora, valExtra, RAIO_KM, km, gostos:() => [...GOSTOS], grupoDe, AGORA, normalizaTempo};
/* o mesmo gosto nas páginas do evento e do perfil: ler, alternar e o ícone */
window.STREETFY_GOSTOS = {tem:id => GOSTOS.has(id), lista:() => [...GOSTOS], icone:ICO.coracao,
  alternar(id){ if (GOSTOS.has(id)) GOSTOS.delete(id); else GOSTOS.add(id); try { localStorage.setItem(GOSTOS_K, JSON.stringify([...GOSTOS])); } catch (x) {} montados.forEach(m => m.render(false)); return GOSTOS.has(id); }};
})();
