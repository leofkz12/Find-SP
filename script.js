// ==========================================
// O banco de dados das HQs (variável "hqs") mora em dados.js.
// Esse script só tem a LÓGICA do site.
// ==========================================

let hqAtual = "spider-gwen";
let capituloAtual = "cap-1";
let paginaAtual = 0;
let filtroAtualBiblioteca = "todas";
let modoLeitura = "pagina"; // "pagina" ou "scroll"
let observerScroll = null;

const CHAVE_FAVORITOS = "spiderReaderFavoritos";
const CHAVE_USUARIO = "spiderReaderUsuario";
const CHAVE_MODO_LEITURA = "spiderReaderModoLeitura";
const CHAVE_PROGRESSO = "spiderReaderProgresso";
const CHAVE_LEITURAS = "spiderReaderLeituras";
const CHAVE_TEMA = "spiderReaderTema";

let ordenacaoAtual = "recente";
let filtrosTags = new Set();

const ROTULOS_SECAO = {
  todas: "Destaques",
  hq: "HQs",
  manga: "Mangás",
  favoritos: "Favoritos ♥"
};

// ==========================================
// TEMAS DE COR
// Cada tema troca a cor de destaque do site inteiro (o degradê preto de
// fundo continua o mesmo, só muda a cor que "brilha" nele). As cores reais
// de cada tema estão no style.css, em html[data-tema="..."]. Aqui é só
// pra montar a lista de opções e mostrar a bolinha com a cor certa.
// ==========================================
const TEMAS = [
  { id: "vermelho", nome: "Vermelho padrão", cor: "#ff1e27" },
  { id: "preto", nome: "Preto", cor: "#5c5c5c" },
  { id: "branco", nome: "Branco", cor: "#f2f2f2" },
  { id: "rosa", nome: "Rosa", cor: "#ff4d9e" },
  { id: "azul", nome: "Azul escuro", cor: "#3b6bff" }
];

function obterTemaSalvo() {
  const salvo = localStorage.getItem(CHAVE_TEMA);
  return TEMAS.some(t => t.id === salvo) ? salvo : "vermelho";
}

// Aplica o tema (troca o atributo data-tema na <html>, que o CSS usa
// pra trocar as variáveis de cor) e guarda a escolha no navegador.
function aplicarTema(idTema) {
  document.documentElement.setAttribute('data-tema', idTema);
  localStorage.setItem(CHAVE_TEMA, idTema);
  montarListaTemas();
}

// Monta a lista de opções dentro do modal, marcando qual está ativa
function montarListaTemas() {
  const container = document.getElementById('lista-temas');
  if (!container) return;

  const temaAtual = obterTemaSalvo();
  container.innerHTML = '';

  TEMAS.forEach(tema => {
    const opcao = document.createElement('button');
    opcao.type = 'button';
    opcao.className = 'tema-opcao' + (tema.id === temaAtual ? ' ativo' : '');
    opcao.innerHTML = `
      <span class="tema-swatch" style="background: ${tema.cor}"></span>
      <span>${tema.nome}</span>
      <span class="tema-opcao-check">✓</span>
    `;
    opcao.onclick = () => aplicarTema(tema.id);
    container.appendChild(opcao);
  });
}

function abrirTemas() {
  montarListaTemas();
  document.getElementById('modal-temas')?.classList.remove('escondido');
  fecharMenu();
  document.getElementById('overlay')?.classList.add('ativo');
}

function fecharTemas() {
  document.getElementById('modal-temas')?.classList.add('escondido');
  document.getElementById('overlay')?.classList.remove('ativo');
}

// Monta o caminho da imagem sozinho a partir do número da página.
// Ex: caminhoPagina("spider-gwen", "cap-1", 3) -> "assets/hqs/spider-gwen/cap-1/pagina3.jpg"
function caminhoPagina(chaveHQ, capitulo, numeroPagina) {
  return `assets/hqs/${chaveHQ}/${capitulo}/pagina${numeroPagina}.jpg`;
}

// ==========================================
// PROGRESSO DE LEITURA ("continuar de onde parou")
// Guarda, pra cada HQ, em qual capítulo e página a pessoa parou.
// ==========================================
function obterProgressoTodos() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_PROGRESSO)) || {};
  } catch (erro) {
    return {};
  }
}

function obterProgresso(chaveHQ) {
  const todos = obterProgressoTodos();
  return todos[chaveHQ] || null;
}

function salvarProgresso(chaveHQ, capitulo, pagina) {
  const todos = obterProgressoTodos();
  todos[chaveHQ] = { capitulo, pagina };
  localStorage.setItem(CHAVE_PROGRESSO, JSON.stringify(todos));
}

// ==========================================
// CONTAGEM DE LEITURAS (pra "Mais lido")
// ==========================================
function obterTodasLeituras() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_LEITURAS)) || {};
  } catch (erro) {
    return {};
  }
}

function obterLeituras(chaveHQ) {
  return obterTodasLeituras()[chaveHQ] || 0;
}

function registrarLeitura(chaveHQ) {
  const todas = obterTodasLeituras();
  todas[chaveHQ] = (todas[chaveHQ] || 0) + 1;
  localStorage.setItem(CHAVE_LEITURAS, JSON.stringify(todas));
}

// ==========================================
// ORDENAÇÃO E FILTRO DE TAGS
// ==========================================
function parseDataBR(data) {
  if (!data) return new Date(0);
  const [dia, mes, ano] = data.split('/').map(Number);
  return new Date(ano || 1970, (mes || 1) - 1, dia || 1);
}

function ordenarChaves(chaves) {
  const lista = [...chaves];
  if (ordenacaoAtual === 'alfabetica') {
    lista.sort((a, b) => hqs[a].titulo.localeCompare(hqs[b].titulo, 'pt-BR'));
  } else if (ordenacaoAtual === 'lido') {
    lista.sort((a, b) => obterLeituras(b) - obterLeituras(a));
  } else {
    lista.sort((a, b) => parseDataBR(hqs[b].lancamento) - parseDataBR(hqs[a].lancamento));
  }
  return lista;
}

function passaFiltroTags(chave) {
  if (filtrosTags.size === 0) return true;
  const tags = hqs[chave].tags || [];
  return tags.some(t => filtrosTags.has(t));
}

function mudarOrdenacao() {
  const select = document.getElementById('select-ordenar');
  if (select) ordenacaoAtual = select.value;
  exibirBiblioteca(filtroAtualBiblioteca);
}

function alternarFiltroTag(tag) {
  if (filtrosTags.has(tag)) {
    filtrosTags.delete(tag);
  } else {
    filtrosTags.add(tag);
  }
  exibirBiblioteca(filtroAtualBiblioteca);
}

// Monta os "chips" clicáveis com todas as tags que existem no banco de dados
function montarChipsTags() {
  const container = document.getElementById('lista-tags');
  if (!container) return;

  const todasTags = new Set();
  Object.values(hqs).forEach(hq => (hq.tags || []).forEach(t => todasTags.add(t)));

  container.innerHTML = '';
  [...todasTags].sort((a, b) => a.localeCompare(b, 'pt-BR')).forEach(tag => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip-tag' + (filtrosTags.has(tag) ? ' ativo' : '');
    chip.textContent = tag;
    chip.onclick = () => alternarFiltroTag(tag);
    container.appendChild(chip);
  });

  const select = document.getElementById('select-ordenar');
  if (select) select.value = ordenacaoAtual;
}

// ==========================================
// CARD PEQUENO (usado nas fileiras "Continuar lendo" e "Recomendados")
// ==========================================
function criarCardMini(chave, mostrarProgresso) {
  const hq = hqs[chave];
  const card = document.createElement('div');
  card.className = 'hq-card-mini';

  let barraProgresso = '';
  if (mostrarProgresso) {
    const progresso = obterProgresso(chave);
    if (progresso && hq.capitulos[progresso.capitulo]) {
      const totalPaginas = hq.capitulos[progresso.capitulo];
      const percentual = Math.min(100, Math.round(((progresso.pagina + 1) / totalPaginas) * 100));
      barraProgresso = `
        <div class="mini-progresso">
          <div class="mini-progresso-preenchido" style="width: ${percentual}%"></div>
        </div>`;
    }
  }

  card.innerHTML = `
    <div class="capa-wrapper">
      <img src="${hq.capa}" alt="${hq.titulo}" loading="lazy">
    </div>
    <div class="mini-info">
      <p class="mini-titulo">${hq.titulo}</p>
      ${barraProgresso}
    </div>
  `;

  card.onclick = () => {
    if (mostrarProgresso) {
      hqAtual = chave;
      continuarLeitura();
    } else {
      selecionarDaBiblioteca(chave);
    }
  };

  return card;
}

// ==========================================
// FILEIRA "CONTINUAR LENDO"
// ==========================================
function montarContinuarLendo() {
  const secao = document.getElementById('secao-continuar');
  const linha = document.getElementById('continuar-lendo-linha');
  if (!secao || !linha) return;

  linha.innerHTML = '';
  const todosProgressos = obterProgressoTodos();

  const chaves = Object.keys(todosProgressos).filter(chave => {
    const hq = hqs[chave];
    const progresso = todosProgressos[chave];
    if (!hq || !hq.capitulos[progresso.capitulo]) return false;

    const capsDaHQ = Object.keys(hq.capitulos);
    const ultimoCap = capsDaHQ[capsDaHQ.length - 1];
    const totalPaginasCapAtual = hq.capitulos[progresso.capitulo];

    // Se já terminou a última página do último capítulo, não conta como "em andamento"
    if (progresso.capitulo === ultimoCap && progresso.pagina >= totalPaginasCapAtual - 1) {
      return false;
    }
    return true;
  });

  if (!chaves.length) {
    secao.classList.add('escondido');
    return;
  }

  chaves.forEach(chave => linha.appendChild(criarCardMini(chave, true)));
  secao.classList.remove('escondido');
}

// ==========================================
// FILEIRA "RECOMENDADOS" (baseada nos favoritos)
// ==========================================
function montarRecomendados() {
  const secao = document.getElementById('secao-recomendados');
  const linha = document.getElementById('recomendados-linha');
  if (!secao || !linha) return;

  linha.innerHTML = '';
  const favoritos = obterFavoritos();

  if (!favoritos.length) {
    secao.classList.add('escondido');
    return;
  }

  const tagsFavoritas = new Set();
  const generosFavoritos = new Set();
  favoritos.forEach(chave => {
    const hq = hqs[chave];
    if (!hq) return;
    (hq.tags || []).forEach(t => tagsFavoritas.add(t));
    generosFavoritos.add(hq.genero);
  });

  const candidatos = Object.keys(hqs).filter(chave => {
    if (favoritos.includes(chave)) return false;
    const hq = hqs[chave];
    const temTagEmComum = (hq.tags || []).some(t => tagsFavoritas.has(t));
    const mesmoGenero = generosFavoritos.has(hq.genero);
    return temTagEmComum || mesmoGenero;
  });

  if (!candidatos.length) {
    secao.classList.add('escondido');
    return;
  }

  candidatos.slice(0, 8).forEach(chave => linha.appendChild(criarCardMini(chave, false)));
  secao.classList.remove('escondido');
}

// ==========================================
// LOGIN BÁSICO (só visual, guardado no navegador)
// ==========================================
function obterUsuario() {
  return localStorage.getItem(CHAVE_USUARIO) || "";
}

function salvarUsuario(nome) {
  localStorage.setItem(CHAVE_USUARIO, nome);
  aplicarUsuarioNaUI();
}

function removerUsuario() {
  localStorage.removeItem(CHAVE_USUARIO);
  aplicarUsuarioNaUI();
}

function aplicarUsuarioNaUI() {
  const nome = obterUsuario();
  const chipNome = document.getElementById('chip-nome');
  const chipAvatar = document.getElementById('chip-avatar');
  const textoSidebar = document.getElementById('perfil-texto-sidebar');
  const avatarSidebar = document.getElementById('perfil-avatar-sidebar');

  const iniciais = nome ? nome.trim().charAt(0).toUpperCase() : '';

  if (nome) {
    if (chipNome) chipNome.textContent = nome;
    if (chipAvatar) chipAvatar.textContent = iniciais || '👤';
    if (textoSidebar) textoSidebar.textContent = nome;
    if (avatarSidebar) avatarSidebar.textContent = iniciais || '👤';
  } else {
    if (chipNome) chipNome.textContent = 'Entrar';
    if (chipAvatar) chipAvatar.textContent = '👤';
    if (textoSidebar) textoSidebar.textContent = 'Entrar';
    if (avatarSidebar) avatarSidebar.textContent = '👤';
  }
}

function abrirLogin() {
  const modal = document.getElementById('modal-login');
  const input = document.getElementById('input-login-nome');
  const btnSair = document.getElementById('btn-sair');
  const nomeAtual = obterUsuario();

  if (input) input.value = nomeAtual;
  if (btnSair) btnSair.classList.toggle('escondido', !nomeAtual);

  if (modal) modal.classList.remove('escondido');
  fecharMenu();
  document.getElementById('overlay')?.classList.add('ativo');

  setTimeout(() => input?.focus(), 50);
}

function fecharLogin() {
  document.getElementById('modal-login')?.classList.add('escondido');
  document.getElementById('overlay')?.classList.remove('ativo');
}

function confirmarLogin() {
  const input = document.getElementById('input-login-nome');
  const nome = input?.value.trim();

  if (!nome) {
    input?.focus();
    return;
  }

  salvarUsuario(nome);
  fecharLogin();
}

function sairLogin() {
  removerUsuario();
  fecharLogin();
}

// Fecha modais e menu lateral juntos (usado pelo overlay)
function fecharTudo() {
  fecharMenu();
  fecharLogin();
  fecharTemas();
}

// ==========================================
// FAVORITOS (salvos no navegador da pessoa, sem precisar de login)
// ==========================================
function obterFavoritos() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_FAVORITOS)) || [];
  } catch (erro) {
    return [];
  }
}

function ehFavorito(chave) {
  return obterFavoritos().includes(chave);
}

function alternarFavorito(chave, evento) {
  if (evento) evento.stopPropagation();

  let favoritos = obterFavoritos();
  if (favoritos.includes(chave)) {
    favoritos = favoritos.filter(f => f !== chave);
  } else {
    favoritos.push(chave);
  }
  localStorage.setItem(CHAVE_FAVORITOS, JSON.stringify(favoritos));

  // Atualiza só o botão clicado, sem redesenhar a grade inteira
  const botao = document.querySelector(`.btn-favorito[data-chave="${chave}"]`);
  if (botao) {
    const ativo = ehFavorito(chave);
    botao.classList.toggle('ativo', ativo);
    botao.innerHTML = ativo ? '♥' : '♡';
  }

  // Se a pessoa estiver vendo a aba de Favoritos e desmarcar um, some da lista
  if (filtroAtualBiblioteca === 'favoritos') {
    exibirBiblioteca('favoritos');
  }
}

// ==========================================
// LÓGICA DO MENU LATERAL
// ==========================================
function toggleMenu() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  if (sidebar && overlay) {
    sidebar.classList.toggle('aberto');
    overlay.classList.toggle('ativo');
  }
}

function fecharMenu() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  if (sidebar) sidebar.classList.remove('aberto');

  const loginAberto = !document.getElementById('modal-login')?.classList.contains('escondido');
  const temasAberto = !document.getElementById('modal-temas')?.classList.contains('escondido');
  if (overlay && (loginAberto || temasAberto)) return;
  if (overlay) overlay.classList.remove('ativo');
}

// Marca como "active" só os links (sidebar + navbar) que combinam com a categoria atual
function marcarNavAtivo(categoria) {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.categoria === categoria);
  });
}

function filtrarHQs(categoria) {
  if (categoria === 'todas' || categoria === 'hq' || categoria === 'manga' || categoria === 'favoritos') {
    exibirBiblioteca(categoria);
  }
  fecharMenu();
  return false;
}

// ==========================================
// CRIA O CARD VISUAL DE UMA HQ (usado na biblioteca e na busca)
// ==========================================
function criarCardHQ(chave) {
  const hq = hqs[chave];
  const favoritoAtivo = ehFavorito(chave);

  const card = document.createElement('div');
  card.className = 'hq-card';
  card.innerHTML = `
    <div class="capa-wrapper">
      <img src="${hq.capa}" alt="${hq.titulo}" loading="lazy">
      <button class="btn-favorito ${favoritoAtivo ? 'ativo' : ''}" data-chave="${chave}"
        onclick="alternarFavorito('${chave}', event)" aria-label="Favoritar ${hq.titulo}">${favoritoAtivo ? '♥' : '♡'}</button>
    </div>
    <div class="hq-info">
      <h3>${hq.titulo}</h3>
      <button class="btn-card" onclick="selecionarDaBiblioteca('${chave}')">📖 Ver mais</button>
    </div>
  `;
  return card;
}

// ==========================================
// BANNER GIRATÓRIO (só aparece na aba "Todas"/Destaques)
// Troca de slide sozinho a cada 5s; as setas deixam navegar na mão.
// ==========================================
let bannerIndice = 0;
let bannerTimer = null;
const BANNER_INTERVALO_MS = 10000;

function montarBanner() {
  const slidesEl = document.getElementById('banner-slides');
  const pontosEl = document.getElementById('banner-pontos');
  if (!slidesEl || !pontosEl) return;

  slidesEl.innerHTML = '';
  pontosEl.innerHTML = '';

  const chaves = Object.keys(hqs);

  chaves.forEach((chave, indice) => {
    const hq = hqs[chave];

    const slide = document.createElement('div');
    slide.className = 'banner-slide' + (indice === 0 ? ' ativo' : '');
    slide.innerHTML = `
      <img src="${hq.capa}" alt="${hq.titulo}">
      <div class="banner-legenda">
        <h3>${hq.titulo}</h3>
        <p class="banner-resumo">${hq.resumo || ''}</p>
        <button class="btn-card" onclick="selecionarDaBiblioteca('${chave}')">📖 Ver mais</button>
      </div>
    `;
    slidesEl.appendChild(slide);

    const ponto = document.createElement('span');
    ponto.className = 'banner-ponto' + (indice === 0 ? ' ativo' : '');
    ponto.onclick = () => irParaSlideBanner(indice);
    pontosEl.appendChild(ponto);
  });

  bannerIndice = 0;
  iniciarAutoBanner();
}

function mostrarSlideBanner(indice) {
  const slides = document.querySelectorAll('.banner-slide');
  const pontos = document.querySelectorAll('.banner-ponto');
  if (!slides.length) return;

  bannerIndice = (indice + slides.length) % slides.length;

  slides.forEach((slide, i) => slide.classList.toggle('ativo', i === bannerIndice));
  pontos.forEach((ponto, i) => ponto.classList.toggle('ativo', i === bannerIndice));
}

function bannerProximo() {
  mostrarSlideBanner(bannerIndice + 1);
  reiniciarAutoBanner();
}

function bannerAnterior() {
  mostrarSlideBanner(bannerIndice - 1);
  reiniciarAutoBanner();
}

function irParaSlideBanner(indice) {
  mostrarSlideBanner(indice);
  reiniciarAutoBanner();
}

function iniciarAutoBanner() {
  pararAutoBanner();
  bannerTimer = setInterval(() => mostrarSlideBanner(bannerIndice + 1), BANNER_INTERVALO_MS);
}

function pararAutoBanner() {
  if (bannerTimer) {
    clearInterval(bannerTimer);
    bannerTimer = null;
  }
}

// Clicar numa seta reinicia a contagem dos 5s, pra não trocar de novo
// "no meio" da pessoa escolhendo o que quer ver
function reiniciarAutoBanner() {
  iniciarAutoBanner();
}

// ==========================================
// EXIBIR BIBLIOTECA (GALERIA) - agora é a TELA INICIAL do site
// Aceita um filtro: 'todas', 'hq', 'manga' ou 'favoritos'
// ==========================================
function exibirBiblioteca(filtroGenero = 'todas') {
  filtroAtualBiblioteca = filtroGenero;

  const grid = document.getElementById('biblioteca-hqs');
  const areaLeitor = document.getElementById('area-leitor');
  const cardCapa = document.getElementById('card-capa');
  const seletores = document.getElementById('seletores-topo');
  const btnVoltar = document.getElementById('btn-voltar');
  const titulo = document.getElementById('titulo-secao');
  const banner = document.getElementById('banner-destaques');

  if (!grid) return;
  grid.innerHTML = '';

  const chavesOrdenadas = ordenarChaves(Object.keys(hqs));

  for (const chave of chavesOrdenadas) {
    const hq = hqs[chave];

    if (filtroGenero === 'favoritos') {
      if (!ehFavorito(chave)) continue;
    } else if (filtroGenero !== 'todas' && hq.genero !== filtroGenero) {
      continue;
    }

    if (!passaFiltroTags(chave)) continue;

    grid.appendChild(criarCardHQ(chave));
  }

  if (!grid.hasChildNodes()) {
    grid.innerHTML = filtroGenero === 'favoritos'
      ? '<p style="grid-column: 1 / -1;">Você ainda não favoritou nada. Toque no ♡ de um card pra salvar aqui.</p>'
      : '<p style="grid-column: 1 / -1;">Nenhuma história encontrada nessa categoria.</p>';
  }

  if (titulo) titulo.textContent = ROTULOS_SECAO[filtroGenero] || 'Destaques';
  marcarNavAtivo(filtroGenero);

  // Ao voltar pra biblioteca, o painel listrado e o título voltam a aparecer
  titulo?.classList.remove('escondido');
  document.getElementById('grade-painel')?.classList.remove('escondido');

  grid.classList.remove('escondido');
  if (areaLeitor) areaLeitor.classList.add('escondido');
  if (cardCapa) cardCapa.classList.add('escondido');
  if (seletores) seletores.classList.add('escondido');
  if (btnVoltar) btnVoltar.classList.add('escondido');

  // O banner giratório e as fileiras "Continuar lendo"/"Recomendados"
  // só fazem sentido na aba "Todas" (Destaques)
  if (filtroGenero === 'todas') {
    if (banner) banner.classList.remove('escondido');
    montarBanner();
    montarContinuarLendo();
    montarRecomendados();
  } else {
    if (banner) banner.classList.add('escondido');
    pararAutoBanner();
    document.getElementById('secao-continuar')?.classList.add('escondido');
    document.getElementById('secao-recomendados')?.classList.add('escondido');
  }

  document.getElementById('barra-filtros')?.classList.remove('escondido');
  montarChipsTags();

  document.body.classList.remove('pagina-leitura');
  pararObservadorScroll();
}

function selecionarDaBiblioteca(chave) {
  hqAtual = chave;
  const selectHQ = document.getElementById('select-hq');
  if (selectHQ) selectHQ.value = chave;

  // Mostra a ficha da HQ (capa, título, lançamento, resumo) antes de ler.
  // Quem inicia a leitura de fato é o botão "Capítulos" dentro da ficha.
  carregarCapitulos();
}

// ==========================================
// BARRA DE PESQUISA
// ==========================================
function pesquisarHQ() {
  const termoOriginal = document.getElementById('input-busca')?.value.trim();
  const termo = termoOriginal?.toLowerCase();

  if (!termo) {
    voltarInicio();
    return;
  }

  const grid = document.getElementById('biblioteca-hqs');
  const areaLeitor = document.getElementById('area-leitor');
  const cardCapa = document.getElementById('card-capa');
  const seletores = document.getElementById('seletores-topo');
  const btnVoltar = document.getElementById('btn-voltar');
  const titulo = document.getElementById('titulo-secao');
  const banner = document.getElementById('banner-destaques');

  if (!grid) return;
  grid.innerHTML = '';

  for (let chave in hqs) {
    const hq = hqs[chave];
    if (hq.titulo.toLowerCase().includes(termo)) {
      grid.appendChild(criarCardHQ(chave));
    }
  }

  if (!grid.hasChildNodes()) {
    grid.innerHTML = '<p style="grid-column: 1 / -1;">Nenhuma história encontrada com esse nome.</p>';
  }

  if (titulo) titulo.textContent = `Resultado da busca: "${termoOriginal}"`;
  marcarNavAtivo(null); // nenhum item de menu fica ativo durante a busca

  // A busca também acontece na tela inicial: garante que o painel/título estejam visíveis
  titulo?.classList.remove('escondido');
  document.getElementById('grade-painel')?.classList.remove('escondido');

  grid.classList.remove('escondido');
  if (areaLeitor) areaLeitor.classList.add('escondido');
  if (cardCapa) cardCapa.classList.add('escondido');
  if (seletores) seletores.classList.add('escondido');
  if (btnVoltar) btnVoltar.classList.add('escondido');

  // Busca não mostra o banner giratório, filtros nem as fileiras
  if (banner) banner.classList.add('escondido');
  pararAutoBanner();
  document.getElementById('secao-continuar')?.classList.add('escondido');
  document.getElementById('secao-recomendados')?.classList.add('escondido');
  document.getElementById('barra-filtros')?.classList.add('escondido');
  document.body.classList.remove('pagina-leitura');
  pararObservadorScroll();
}

// ==========================================
// BOTÃO VOLTAR (volta pra tela inicial / biblioteca)
// ==========================================
function voltarInicio() {
  const inputBusca = document.getElementById('input-busca');
  if (inputBusca) inputBusca.value = '';
  exibirBiblioteca('todas');
}

// ==========================================
// LÓGICA DO LEITOR DE HQs / QUADRINHOS
// ==========================================
function carregarMenu() {
  const selectHQ = document.getElementById('select-hq');
  if (!selectHQ) return;
  selectHQ.innerHTML = '';

  for (let chave in hqs) {
    let option = document.createElement('option');
    option.value = chave;
    option.textContent = hqs[chave].titulo;
    selectHQ.appendChild(option);
  }

  carregarCapitulos();
}

function carregarCapitulos() {
  const selectCap = document.getElementById('select-capitulo');
  if (!selectCap) return;
  selectCap.innerHTML = '';

  const caps = hqs[hqAtual].capitulos;
  for (let cap in caps) {
    let option = document.createElement('option');
    option.value = cap;
    option.textContent = `Capítulo ${cap.replace('cap-', '')}`;
    selectCap.appendChild(option);
  }

  capituloAtual = Object.keys(caps)[0];
  paginaAtual = 0;
  exibirFicha();
}

function mudarHQ() {
  hqAtual = document.getElementById('select-hq').value;
  carregarCapitulos();
}

function mudarCapitulo() {
  capituloAtual = document.getElementById('select-capitulo').value;
  paginaAtual = 0;
  exibirFicha();
}

// Clicar num item da lista de capítulos: define qual capítulo e já começa a ler
function abrirCapitulo(cap) {
  capituloAtual = cap;
  const selectCap = document.getElementById('select-capitulo');
  if (selectCap) selectCap.value = cap;
  paginaAtual = 0;
  iniciarLeitura();
}

// Monta a lista visual de capítulos (nome + nº de páginas), clicável
function montarListaCapitulos() {
  const lista = document.getElementById('lista-capitulos');
  const totalEl = document.getElementById('ficha-total-capitulos');
  if (!lista) return;

  const caps = hqs[hqAtual].capitulos;
  const chaves = Object.keys(caps);
  const progresso = obterProgresso(hqAtual);

  lista.innerHTML = '';
  chaves.forEach(cap => {
    const totalPaginas = caps[cap];
    const emProgresso = progresso && progresso.capitulo === cap;
    const item = document.createElement('button');
    item.className = 'item-capitulo' + (emProgresso ? ' item-capitulo-progresso' : '');
    item.innerHTML = `
      <span>Capítulo ${cap.replace('cap-', '')}${emProgresso ? '<span class="capitulo-badge">Continuando</span>' : ''}</span>
      <span class="capitulo-paginas">${totalPaginas} página${totalPaginas === 1 ? '' : 's'}</span>
    `;
    item.onclick = () => abrirCapitulo(cap);
    lista.appendChild(item);
  });

  if (totalEl) totalEl.textContent = `(${chaves.length})`;
}

// Mostra a "ficha" da HQ: fundo com a capa desfocada, título, ano, resumo e lista de capítulos.
function exibirFicha() {
  const cardCapa = document.getElementById('card-capa');
  const areaLeitor = document.getElementById('area-leitor');
  const grid = document.getElementById('biblioteca-hqs');
  const banner = document.getElementById('banner-destaques');
  const imgCapa = document.getElementById('imagem-capa');
  const btnVoltar = document.getElementById('btn-voltar');
  const hq = hqs[hqAtual];

  if (cardCapa && areaLeitor && imgCapa && hq) {
    imgCapa.src = hq.capa;
    cardCapa.style.setProperty('--ficha-fundo', `url("${hq.capa}")`);

    const tituloEl = document.getElementById('ficha-titulo');
    const lancamentoEl = document.getElementById('ficha-lancamento');
    const resumoEl = document.getElementById('ficha-resumo-texto');

    if (tituloEl) tituloEl.textContent = hq.titulo;
    if (lancamentoEl) lancamentoEl.textContent = hq.lancamento || 'Não informado';
    if (resumoEl) resumoEl.textContent = hq.resumo || 'Resumo ainda não adicionado.';

    // Mostra o botão "Continuar de onde parou" só se existir progresso salvo
    // pra essa HQ e o capítulo salvo ainda existir nos dados.
    const progresso = obterProgresso(hqAtual);
    const continuarBox = document.getElementById('ficha-continuar');
    const spanCap = document.getElementById('continuar-capitulo');
    const spanPag = document.getElementById('continuar-pagina');
    if (progresso && hq.capitulos[progresso.capitulo]) {
      if (spanCap) spanCap.textContent = progresso.capitulo.replace('cap-', '');
      if (spanPag) spanPag.textContent = progresso.pagina + 1;
      continuarBox?.classList.remove('escondido');
    } else {
      continuarBox?.classList.add('escondido');
    }

    montarListaCapitulos();

    cardCapa.classList.remove('escondido');
    areaLeitor.classList.add('escondido');
    if (grid) grid.classList.add('escondido');
    if (banner) banner.classList.add('escondido');
    if (btnVoltar) btnVoltar.classList.remove('escondido');

    // Esconde o painel listrado, o título "Destaques" e as fileiras/filtros ao entrar na ficha
    document.getElementById('grade-painel')?.classList.add('escondido');
    document.getElementById('titulo-secao')?.classList.add('escondido');
    document.getElementById('secao-continuar')?.classList.add('escondido');
    document.getElementById('secao-recomendados')?.classList.add('escondido');
    document.getElementById('barra-filtros')?.classList.add('escondido');
  }

  document.body.classList.add('pagina-leitura');
  pararAutoBanner();
  pararObservadorScroll();
}

function iniciarLeitura(manterPagina = false) {
  const cardCapa = document.getElementById('card-capa');
  const areaLeitor = document.getElementById('area-leitor');
  const grid = document.getElementById('biblioteca-hqs');
  const seletores = document.getElementById('seletores-topo');
  const btnVoltar = document.getElementById('btn-voltar');

  if (cardCapa && areaLeitor) {
    cardCapa.classList.add('escondido');
    if (grid) grid.classList.add('escondido');
    if (seletores) seletores.classList.remove('escondido');
    if (btnVoltar) btnVoltar.classList.remove('escondido');
    areaLeitor.classList.remove('escondido');
    if (!manterPagina) paginaAtual = 0;
    atualizarLeitor();
  }

  // Mantém o painel listrado, o título "Destaques" e as fileiras/filtros escondidos durante a leitura
  document.getElementById('grade-painel')?.classList.add('escondido');
  document.getElementById('titulo-secao')?.classList.add('escondido');
  document.getElementById('secao-continuar')?.classList.add('escondido');
  document.getElementById('secao-recomendados')?.classList.add('escondido');
  document.getElementById('barra-filtros')?.classList.add('escondido');

  registrarLeitura(hqAtual);

  document.body.classList.add('pagina-leitura');
}

// Chamada pelo botão "Continuar de onde parou" na ficha da HQ
function continuarLeitura() {
  const progresso = obterProgresso(hqAtual);
  if (!progresso) return;

  capituloAtual = progresso.capitulo;
  const selectCap = document.getElementById('select-capitulo');
  if (selectCap) selectCap.value = capituloAtual;

  paginaAtual = progresso.pagina;
  iniciarLeitura(true);
}

// ==========================================
// MODO DE LEITURA: "pagina" (uma a uma) ou "scroll" (arrastar e carregando)
// ==========================================
function obterModoLeituraPadrao() {
  const salvo = localStorage.getItem(CHAVE_MODO_LEITURA);
  if (salvo === 'pagina' || salvo === 'scroll') return salvo;
  // Sem preferência salva: celular começa em modo scroll, PC começa em modo página
  return window.matchMedia('(max-width: 760px)').matches ? 'scroll' : 'pagina';
}

function alternarModoLeitura() {
  modoLeitura = modoLeitura === 'pagina' ? 'scroll' : 'pagina';
  localStorage.setItem(CHAVE_MODO_LEITURA, modoLeitura);
  atualizarLeitor();
}

function atualizarLeitor() {
  const btnModo = document.getElementById('btn-modo-leitor');
  if (btnModo) {
    btnModo.textContent = modoLeitura === 'pagina' ? '📜 Scroll' : '📄 Página';
  }

  if (modoLeitura === 'scroll') {
    montarLeitorScroll();
  } else {
    montarLeitorPagina();
  }
}

// --- Modo página: como já funcionava, uma imagem por vez ---
function montarLeitorPagina() {
  pararObservadorScroll();

  const totalPaginas = hqs[hqAtual].capitulos[capituloAtual];
  const imgElement = document.getElementById('pagina-imagem');
  const contador = document.getElementById('contador-pagina');
  const leitorPagina = document.getElementById('leitor-pagina');
  const leitorScroll = document.getElementById('leitor-scroll');
  const btnAnterior = document.getElementById('btn-anterior');
  const btnProxima = document.getElementById('btn-proxima');

  if (leitorPagina) leitorPagina.classList.remove('escondido');
  if (leitorScroll) leitorScroll.classList.add('escondido');
  if (btnAnterior) btnAnterior.classList.remove('escondido');
  if (btnProxima) btnProxima.classList.remove('escondido');

  if (imgElement && totalPaginas) {
    imgElement.src = caminhoPagina(hqAtual, capituloAtual, paginaAtual + 1);
  }
  if (contador && totalPaginas) {
    contador.innerText = `Página ${paginaAtual + 1} de ${totalPaginas}`;
  }

  salvarProgresso(hqAtual, capituloAtual, paginaAtual);

  // Pré-carrega a próxima página em segundo plano, pra trocar sem "flash" branco
  if (totalPaginas && paginaAtual + 1 < totalPaginas) {
    const preCarrega = new Image();
    preCarrega.src = caminhoPagina(hqAtual, capituloAtual, paginaAtual + 2);
  }

  // Volta o zoom ao normal sempre que a página muda
  if (typeof resetarZoomLeitor === 'function') resetarZoomLeitor();
}

function proximaPagina() {
  if (modoLeitura !== 'pagina') return;
  const totalPaginas = hqs[hqAtual].capitulos[capituloAtual];
  if (paginaAtual < totalPaginas - 1) {
    paginaAtual++;
    montarLeitorPagina();
  }
}

function paginaAnterior() {
  if (modoLeitura !== 'pagina') return;
  if (paginaAtual > 0) {
    paginaAtual--;
    montarLeitorPagina();
  }
}

// --- Modo scroll: todas as páginas em lista vertical, sem bordas, carregando sob demanda ---
function montarLeitorScroll() {
  const totalPaginas = hqs[hqAtual].capitulos[capituloAtual];
  const leitorPagina = document.getElementById('leitor-pagina');
  const leitorScroll = document.getElementById('leitor-scroll');
  const contador = document.getElementById('contador-pagina');
  const btnAnterior = document.getElementById('btn-anterior');
  const btnProxima = document.getElementById('btn-proxima');

  if (leitorPagina) leitorPagina.classList.add('escondido');
  if (btnAnterior) btnAnterior.classList.add('escondido');
  if (btnProxima) btnProxima.classList.add('escondido');
  if (!leitorScroll || !totalPaginas) return;

  leitorScroll.classList.remove('escondido');
  leitorScroll.innerHTML = '';

  // Cria todas as páginas do capítulo, mas com loading="lazy": o navegador só
  // baixa a imagem quando ela está perto de aparecer na tela (economiza dados).
  for (let i = 1; i <= totalPaginas; i++) {
    const img = document.createElement('img');
    img.src = caminhoPagina(hqAtual, capituloAtual, i);
    img.alt = `Página ${i}`;
    img.loading = 'lazy';
    img.dataset.pagina = i;
    img.className = 'scroll-pagina';
    leitorScroll.appendChild(img);
  }

  // Aviso de fim de capítulo + atalho pro próximo, se existir
  const caps = Object.keys(hqs[hqAtual].capitulos);
  const indiceAtual = caps.indexOf(capituloAtual);
  const proximoCap = caps[indiceAtual + 1];

  const fim = document.createElement('div');
  fim.className = 'scroll-fim';
  fim.innerHTML = proximoCap
    ? `<button class="btn-nav" onclick="irParaProximoCapitulo()">Fim do capítulo — Ir para o Capítulo ${proximoCap.replace('cap-', '')} ▶</button>`
    : `<p>Fim do capítulo 🕸️</p>`;
  leitorScroll.appendChild(fim);

  if (contador) contador.innerText = `Página 1 de ${totalPaginas}`;

  iniciarObservadorScroll(totalPaginas);
}

function irParaProximoCapitulo() {
  const caps = Object.keys(hqs[hqAtual].capitulos);
  const indiceAtual = caps.indexOf(capituloAtual);
  const proximoCap = caps[indiceAtual + 1];
  if (!proximoCap) return;

  capituloAtual = proximoCap;
  paginaAtual = 0;
  const selectCap = document.getElementById('select-capitulo');
  if (selectCap) selectCap.value = proximoCap;

  montarLeitorScroll();
  document.getElementById('leitor-scroll')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Atualiza o contador "Página X de Y" conforme a pessoa arrasta a tela
function iniciarObservadorScroll(totalPaginas) {
  pararObservadorScroll();

  const contador = document.getElementById('contador-pagina');
  if (!contador || typeof IntersectionObserver === 'undefined') return;

  observerScroll = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
      if (entrada.isIntersecting) {
        const numero = entrada.target.dataset.pagina;
        paginaAtual = Number(numero) - 1;
        contador.innerText = `Página ${numero} de ${totalPaginas}`;
        salvarProgresso(hqAtual, capituloAtual, paginaAtual);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.scroll-pagina').forEach(img => observerScroll.observe(img));
}

function pararObservadorScroll() {
  if (observerScroll) {
    observerScroll.disconnect();
    observerScroll = null;
  }
}

// ==========================================
// ZOOM NA PÁGINA (modo página): roda do mouse no PC, pinça no celular,
// arrastar quando tiver zoom, e duplo clique/toque pra voltar ao normal.
// ==========================================
function configurarZoomLeitor() {
  const caixa = document.getElementById('leitor-pagina');
  const img = document.getElementById('pagina-imagem');
  if (!caixa || !img) return;

  let escala = 1;
  let transladoX = 0;
  let transladoY = 0;

  let distanciaInicialPinça = 0;
  let escalaInicialPinça = 1;

  let arrastando = false;
  let arrastoInicioX = 0;
  let arrastoInicioY = 0;
  let transladoInicioX = 0;
  let transladoInicioY = 0;

  function distanciaEntreToques(toques) {
    const dx = toques[0].clientX - toques[1].clientX;
    const dy = toques[0].clientY - toques[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function aplicarZoom(comTransicao) {
    img.style.transition = comTransicao ? 'transform 0.15s ease-out' : 'none';
    img.style.transform = `translate(${transladoX}px, ${transladoY}px) scale(${escala})`;
    caixa.classList.toggle('zoom-ativo', escala > 1);
  }

  function resetarZoom() {
    escala = 1;
    transladoX = 0;
    transladoY = 0;
    aplicarZoom(true);
  }

  // Exposto globalmente pra resetar sempre que a pessoa troca de página
  window.resetarZoomLeitor = resetarZoom;

  // --- PC: roda do mouse dá zoom ---
  caixa.addEventListener('wheel', (evento) => {
    if (modoLeitura !== 'pagina') return;
    evento.preventDefault();
    const variacao = -evento.deltaY * 0.0015;
    escala = Math.min(3, Math.max(1, escala + variacao));
    if (escala === 1) { transladoX = 0; transladoY = 0; }
    aplicarZoom(false);
  }, { passive: false });

  // --- PC: duplo clique reseta o zoom ---
  caixa.addEventListener('dblclick', () => resetarZoom());

  // --- PC: arrastar a imagem quando já tem zoom ---
  caixa.addEventListener('mousedown', (evento) => {
    if (escala <= 1) return;
    arrastando = true;
    arrastoInicioX = evento.clientX;
    arrastoInicioY = evento.clientY;
    transladoInicioX = transladoX;
    transladoInicioY = transladoY;
  });

  window.addEventListener('mousemove', (evento) => {
    if (!arrastando) return;
    transladoX = transladoInicioX + (evento.clientX - arrastoInicioX);
    transladoY = transladoInicioY + (evento.clientY - arrastoInicioY);
    aplicarZoom(false);
  });

  window.addEventListener('mouseup', () => { arrastando = false; });

  // --- Celular: pinça com 2 dedos dá zoom; 1 dedo arrasta se já tiver zoom ---
  caixa.addEventListener('touchstart', (evento) => {
    if (evento.touches.length === 2) {
      distanciaInicialPinça = distanciaEntreToques(evento.touches);
      escalaInicialPinça = escala;
    } else if (evento.touches.length === 1 && escala > 1) {
      arrastando = true;
      arrastoInicioX = evento.touches[0].clientX;
      arrastoInicioY = evento.touches[0].clientY;
      transladoInicioX = transladoX;
      transladoInicioY = transladoY;
    }
  }, { passive: true });

  caixa.addEventListener('touchmove', (evento) => {
    if (evento.touches.length === 2) {
      evento.preventDefault();
      const distanciaAtual = distanciaEntreToques(evento.touches);
      const fator = distanciaAtual / distanciaInicialPinça;
      escala = Math.min(3, Math.max(1, escalaInicialPinça * fator));
      if (escala === 1) { transladoX = 0; transladoY = 0; }
      aplicarZoom(false);
    } else if (evento.touches.length === 1 && arrastando) {
      evento.preventDefault();
      transladoX = transladoInicioX + (evento.touches[0].clientX - arrastoInicioX);
      transladoY = transladoInicioY + (evento.touches[0].clientY - arrastoInicioY);
      aplicarZoom(false);
    }
  }, { passive: false });

  caixa.addEventListener('touchend', (evento) => {
    if (evento.touches.length === 0) arrastando = false;
  });

  // --- Celular: duplo toque reseta o zoom ---
  let ultimoToqueEm = 0;
  caixa.addEventListener('touchend', () => {
    const agora = Date.now();
    if (agora - ultimoToqueEm < 300) resetarZoom();
    ultimoToqueEm = agora;
  });
}

// ==========================================
// ATALHOS DE TECLADO NO MODO PÁGINA (← página anterior, → próxima página)
// Só funciona quando a pessoa está de fato lendo, no modo página.
// ==========================================
document.addEventListener('keydown', (evento) => {
  if (modoLeitura !== 'pagina') return;
  if (!document.body.classList.contains('pagina-leitura')) return;

  const areaLeitor = document.getElementById('area-leitor');
  if (!areaLeitor || areaLeitor.classList.contains('escondido')) return;

  if (evento.key === 'ArrowRight') {
    proximaPagina();
  } else if (evento.key === 'ArrowLeft') {
    paginaAnterior();
  }
});

// ==========================================
// INICIALIZAÇÃO: carrega os dropdowns, aplica o tema salvo
// e já mostra a grade de Destaques
// ==========================================
function iniciarApp() {
  document.documentElement.setAttribute('data-tema', obterTemaSalvo());
  modoLeitura = obterModoLeituraPadrao();
  aplicarUsuarioNaUI();
  carregarMenu();
  exibirBiblioteca('todas');
  configurarZoomLeitor();
}

window.onload = iniciarApp;

