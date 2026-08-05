// VARIÁVEIS GLOBAIS
let hqs = {}; // Será preenchido automaticamente pelo arquivo hqs.json
let hqAtual = "";
let capituloAtual = "";
let paginaAtual = 0;

// ==========================================
// CARREGAR DADOS DO ARQUIVO hqs.json (FETCH)
// ==========================================
async function carregarBancoDeDados() {
  try {
    const resposta = await fetch('hqs.json');
    const listaHQs = await resposta.json();

    // Converte a lista em um objeto fácil de acessar
    hqs = {};
    listaHQs.forEach(hq => {
      hqs[hq.id] = hq;
    });

    // Define a primeira HQ como padrão inicial
    const chaves = Object.keys(hqs);
    if (chaves.length > 0) {
      hqAtual = chaves[0];
    }

    // Inicializa o menu e exibe a biblioteca
    carregarMenu();
    exibirBiblioteca();

  } catch (erro) {
    console.error("Erro ao carregar o arquivo hqs.json:", erro);
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

function filtrarHQs(categoria) {
  const itens = document.querySelectorAll('.nav-item');
  itens.forEach(item => item.classList.remove('active'));
  
  if (window.event && window.event.currentTarget) {
    window.event.currentTarget.classList.add('active');
  }

  if (categoria === 'todas') {
    exibirBiblioteca();
  }

  toggleMenu();
}

// ==========================================
// EXIBIR BANCO DE TODAS AS HQS (GALERIA)
// ==========================================
function exibirBiblioteca() {
  const grid = document.getElementById('biblioteca-hqs');
  const areaLeitor = document.getElementById('area-leitor');
  const cardCapa = document.getElementById('card-capa');
  const seletores = document.getElementById('seletores-topo');

  if (!grid) return;
  grid.innerHTML = '';

  // Monta a galeria lendo o banco de dados carregado
  for (let chave in hqs) {
    const hq = hqs[chave];
    const card = document.createElement('div');
    card.className = 'hq-card';
    card.innerHTML = `
      <img src="${hq.capa}" alt="${hq.titulo}">
      <div class="hq-info">
        <h3>${hq.titulo}</h3>
        <button class="btn-card" onclick="selecionarDaBiblioteca('${chave}')">🚀 LER</button>
      </div>
    `;
    grid.appendChild(card);
  }

  grid.classList.remove('escondido');
  if (areaLeitor) areaLeitor.classList.add('escondido');
  if (cardCapa) cardCapa.classList.add('escondido');
  if (seletores) seletores.classList.add('escondido');
}

function selecionarDaBiblioteca(chave) {
  hqAtual = chave;
  const selectHQ = document.getElementById('select-hq');
  if (selectHQ) selectHQ.value = chave;
  
  carregarCapitulos();
  iniciarLeitura();
}

// ==========================================
// LÓGICA DO LEITOR DE HQs
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
  if (!selectCap || !hqs[hqAtual]) return;
  selectCap.innerHTML = '';
  
  const caps = hqs[hqAtual].capitulos;
  for (let cap in caps) {
    let option = document.createElement('option');
    option.value = cap;
    option.textContent = `Capítulo ${cap.replace('cap-', '')}`;
    selectCap.appendChild(option);
  }

  capituloAtual = Object.keys(caps)[0] || "";
  paginaAtual = 0;
  exibirCapa();
}

function mudarHQ() {
  hqAtual = document.getElementById('select-hq').value;
  carregarCapitulos();
}

function mudarCapitulo() {
  capituloAtual = document.getElementById('select-capitulo').value;
  paginaAtual = 0;
  exibirCapa();
}

function exibirCapa() {
  const cardCapa = document.getElementById('card-capa');
  const areaLeitor = document.getElementById('area-leitor');
  const grid = document.getElementById('biblioteca-hqs');
  const imgCapa = document.getElementById('imagem-capa');

  if (cardCapa && areaLeitor && imgCapa && hqs[hqAtual]) {
    imgCapa.src = hqs[hqAtual].capa;
    cardCapa.classList.remove('escondido');
    areaLeitor.classList.add('escondido');
    if (grid) grid.classList.add('escondido');
  }
}

function iniciarLeitura() {
  const cardCapa = document.getElementById('card-capa');
  const areaLeitor = document.getElementById('area-leitor');
  const grid = document.getElementById('biblioteca-hqs');
  const seletores = document.getElementById('seletores-topo');

  if (cardCapa && areaLeitor) {
    cardCapa.classList.add('escondido');
    if (grid) grid.classList.add('escondido');
    if (seletores) seletores.classList.remove('escondido');
    areaLeitor.classList.remove('escondido');
    paginaAtual = 0;
    atualizarLeitor();
  }
}

function atualizarLeitor() {
  if (!hqs[hqAtual] || !hqs[hqAtual].capitulos[capituloAtual]) return;
  
  const paginas = hqs[hqAtual].capitulos[capituloAtual];
  const imgElement = document.getElementById('pagina-imagem');
  const contador = document.getElementById('contador-pagina');

  if (imgElement && paginas) {
    imgElement.src = paginas[paginaAtual];
  }
  if (contador && paginas) {
    contador.innerText = `Página ${paginaAtual + 1} de ${paginas.length}`;
  }
}

function proximaPagina() {
  if (!hqs[hqAtual] || !hqs[hqAtual].capitulos[capituloAtual]) return;
  const paginas = hqs[hqAtual].capitulos[capituloAtual];
  if (paginaAtual < paginas.length - 1) {
    paginaAtual++;
    atualizarLeitor();
  }
}

function paginaAnterior() {
  if (paginaAtual > 0) {
    paginaAtual--;
    atualizarLeitor();
  }
}

// INICIA O SITE LENDO O JSON
window.onload = carregarBancoDeDados;

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
        name { full native }
        image { large }
        description(asHtml: false)
      }
    }
  `;

  try {
    const resposta = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ query: query, variables: { search: nomeInput } })
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
