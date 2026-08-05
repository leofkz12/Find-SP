// ==========================================
// ESTRUTURA DE DADOS DAS HQS
// ==========================================
const hqs = {
  "aranha-verso": {
    titulo: "Aranhaverso #1",
    capa: "assets/capas/capa-teste.jpg",
    capitulos: {
      "cap-1": [
        "https://via.placeholder.com/600x800/ff0000/ffffff?text=Capitulo+1+-+Pagina+1",
        "https://via.placeholder.com/600x800/ff0000/ffffff?text=Capitulo+1+-+Pagina+2"
      ],
      "cap-2": [
        "https://via.placeholder.com/600x800/800000/ffffff?text=Capitulo+2+-+Pagina+1"
      ]
    }
  }
};

let hqAtual = "aranha-verso";
let capituloAtual = "cap-1";
let paginaAtual = 0;

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
  } else {
    console.log("Categoria selecionada:", categoria);
  }

  toggleMenu();
}

// ==========================================
// LÓGICA DA BIBLIOTECA DE HQS
// ==========================================
function exibirBiblioteca() {
  const grid = document.getElementById('biblioteca-hqs');
  const areaLeitor = document.getElementById('area-leitor');
  const cardCapa = document.getElementById('card-capa');
  const seletores = document.getElementById('seletores-topo');

  if (!grid) return;
  grid.innerHTML = '';

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

  if (cardCapa && areaLeitor && imgCapa) {
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

window.onload = carregarMenu;

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
