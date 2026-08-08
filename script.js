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

const ROTULOS_SECAO = {
  todas: "Destaques",
  hq: "HQs",
  manga: "Mangás",
  favoritos: "Favoritos ♥"
};

// Monta o caminho da imagem sozinho a partir do número da página.
// Ex: caminhoPagina("spider-gwen", "cap-1", 3) -> "assets/hqs/spider-gwen/cap-1/pagina3.jpg"
function caminhoPagina(chaveHQ, capitulo, numeroPagina) {
  return `assets/hqs/${chaveHQ}/${capitulo}/pagina${numeroPagina}.jpg`;
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

// Fecha modal e menu lateral juntos (usado pelo overlay)
function fecharTudo() {
  fecharMenu();
  fecharLogin();
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
  if (overlay && !document.getElementById('modal-login')?.classList.contains('escondido')) return;
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
const BANNER_INTERVALO_MS = 5000;

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

  for (let chave in hqs) {
    const hq = hqs[chave];

    if (filtroGenero === 'favoritos') {
      if (!ehFavorito(chave)) continue;
    } else if (filtroGenero !== 'todas' && hq.genero !== filtroGenero) {
      continue;
    }

    grid.appendChild(criarCardHQ(chave));
  }

  if (!grid.hasChildNodes()) {
    grid.innerHTML = filtroGenero === 'favoritos'
      ? '<p style="grid-column: 1 / -1;">Você ainda não favoritou nada. Toque no ♡ de um card pra salvar aqui.</p>'
      : '<p style="grid-column: 1 / -1;">Nenhuma história encontrada nessa categoria.</p>';
  }

  if (titulo) titulo.textContent = ROTULOS_SECAO[filtroGenero] || 'Destaques';
  marcarNavAtivo(filtroGenero);

  grid.classList.remove('escondido');
  if (areaLeitor) areaLeitor.classList.add('escondido');
  if (cardCapa) cardCapa.classList.add('escondido');
  if (seletores) seletores.classList.add('escondido');
  if (btnVoltar) btnVoltar.classList.add('escondido');

  // O banner giratório só faz sentido na aba "Todas" (Destaques)
  if (filtroGenero === 'todas') {
    if (banner) banner.classList.remove('escondido');
    montarBanner();
  } else {
    if (banner) banner.classList.add('escondido');
    pararAutoBanner();
  }

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

  grid.classList.remove('escondido');
  if (areaLeitor) areaLeitor.classList.add('escondido');
  if (cardCapa) cardCapa.classList.add('escondido');
  if (seletores) seletores.classList.add('escondido');
  if (btnVoltar) btnVoltar.classList.add('escondido');

  // Busca não mostra o banner giratório
  if (banner) banner.classList.add('escondido');
  pararAutoBanner();
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

// Mostra a "ficha" da HQ: capa, título, data de lançamento e resumo,
// com o botão que leva pros capítulos.
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

    const tituloEl = document.getElementById('ficha-titulo');
    const lancamentoEl = document.getElementById('ficha-lancamento');
    const resumoEl = document.getElementById('ficha-resumo-texto');

    if (tituloEl) tituloEl.textContent = hq.titulo;
    if (lancamentoEl) lancamentoEl.textContent = hq.lancamento || 'Não informado';
    if (resumoEl) resumoEl.textContent = hq.resumo || 'Resumo ainda não adicionado.';

    cardCapa.classList.remove('escondido');
    areaLeitor.classList.add('escondido');
    if (grid) grid.classList.add('escondido');
    if (banner) banner.classList.add('escondido');
    if (btnVoltar) btnVoltar.classList.remove('escondido');
  }

  pararAutoBanner();
  pararObservadorScroll();
}

function iniciarLeitura() {
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
    paginaAtual = 0;
    atualizarLeitor();
  }
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
// INICIALIZAÇÃO: carrega os dropdowns e já mostra a grade de Destaques
// ==========================================
function iniciarApp() {
  modoLeitura = obterModoLeituraPadrao();
  aplicarUsuarioNaUI();
  carregarMenu();
  exibirBiblioteca('todas');
}

window.onload = iniciarApp;

// ==========================================
// SUA FUNÇÃO DE BUSCA DE PERSONAGEM (ANILIST)
// ==========================================
async function buscarPersonagem() {
  const nomeInput = document.getElementById('nome-personagem')?.value.trim();
  const status = document.getElementById('status-mensagem');
  const card = document.getElementById('card-personagem');

  if (!nomeInput) {
    if (status) status.innerText = "Por favor, digite o nome de um personagem!";
    return;
  }

  if (status) status.innerText = "Buscando nas sombras...";
  if (card) card.classList.add('escondido');

  const query = `
    query ($search: String) {
      Character (search: $search) {
        name {
          full
          native
        }
        image {
          large
        }
        description(asHtml: false)
      }
    }
  `;

  try {
    const resposta = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        variables: { search: nomeInput }
      })
    });

    const dados = await resposta.json();

    if (!dados.data || !dados.data.Character) {
      if (status) status.innerText = "Personagem não encontrado! Tente o nome em inglês.";
      return;
    }

    const personagem = dados.data.Character;

    if (document.getElementById('img-personagem')) {
      document.getElementById('img-personagem').src = personagem.image.large;
    }
    if (document.getElementById('titulo-nome')) {
      document.getElementById('titulo-nome').innerText = personagem.name.full;
    }
    if (document.getElementById('nome-japones')) {
      document.getElementById('nome-japones').innerText = personagem.name.native ? `(Original: ${personagem.name.native})` : '';
    }

    let sobre = personagem.description || "Nenhuma história encontrada para este personagem.";
    sobre = sobre.replace(/~!|!~/g, '').substring(0, 600) + "...";

    if (document.getElementById('sobre-personagem')) {
      document.getElementById('sobre-personagem').innerText = sobre;
    }

    if (status) status.innerText = "";
    if (card) card.classList.remove('escondido');

  } catch (erro) {
    console.error("Erro na busca:", erro);
    if (status) status.innerText = "Erro ao buscar. Verifique sua conexão e tente novamente!";
  }
}