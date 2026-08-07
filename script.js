// ==========================================
// O banco de dados das HQs (variável "hqs") mora em dados.js.
// Esse script só tem a LÓGICA do site.
// ==========================================

let hqAtual = "spider-gwen";
let capituloAtual = "cap-1";
let paginaAtual = 0;

// Monta o caminho da imagem sozinho a partir do número da página.
// Ex: caminhoPagina("spider-gwen", "cap-1", 3) -> "assets/hqs/spider-gwen/cap-1/pagina3.jpg"
function caminhoPagina(chaveHQ, capitulo, numeroPagina) {
  return `assets/hqs/${chaveHQ}/${capitulo}/pagina${numeroPagina}.jpg`;
}

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

  if (categoria === 'todas' || categoria === 'hq' || categoria === 'manga') {
    exibirBiblioteca(categoria);
  } else {
    console.log("Categoria selecionada:", categoria);
  }

  toggleMenu();
}

function exibirBiblioteca(filtroGenero = 'todas') {
  const grid = document.getElementById('biblioteca-hqs');
  const areaLeitor = document.getElementById('area-leitor');
  const cardCapa = document.getElementById('card-capa');
  const seletores = document.getElementById('seletores-topo');
  const btnVoltar = document.getElementById('btn-voltar');

  if (!grid) return;
  grid.innerHTML = '';

  for (let chave in hqs) {
    const hq = hqs[chave];
    if (filtroGenero !== 'todas' && hq.genero !== filtroGenero) continue;

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

  if (!grid.hasChildNodes()) {
    grid.innerHTML = '<p style="grid-column: 1 / -1;">Nenhuma história encontrada nessa categoria.</p>';
  }

  grid.classList.remove('escondido');
  if (areaLeitor) areaLeitor.classList.add('escondido');
  if (cardCapa) cardCapa.classList.add('escondido');
  if (seletores) seletores.classList.add('escondido');
  if (btnVoltar) btnVoltar.classList.remove('escondido');
}

function selecionarDaBiblioteca(chave) {
  hqAtual = chave;
  const selectHQ = document.getElementById('select-hq');
  if (selectHQ) selectHQ.value = chave;

  carregarCapitulos();
  iniciarLeitura();
}

function pesquisarHQ() {
  const termo = document.getElementById('input-busca')?.value.trim().toLowerCase();

  if (!termo) {
    voltarInicio();
    return;
  }

  const grid = document.getElementById('biblioteca-hqs');
  const areaLeitor = document.getElementById('area-leitor');
  const cardCapa = document.getElementById('card-capa');
  const seletores = document.getElementById('seletores-topo');
  const btnVoltar = document.getElementById('btn-voltar');

  if (!grid) return;
  grid.innerHTML = '';

  for (let chave in hqs) {
    const hq = hqs[chave];
    if (hq.titulo.toLowerCase().includes(termo)) {
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
  }

  if (!grid.hasChildNodes()) {
    grid.innerHTML = '<p style="grid-column: 1 / -1;">Nenhuma história encontrada com esse nome.</p>';
  }

  grid.classList.remove('escondido');
  if (areaLeitor) areaLeitor.classList.add('escondido');
  if (cardCapa) cardCapa.classList.add('escondido');
  if (seletores) seletores.classList.add('escondido');
  if (btnVoltar) btnVoltar.classList.remove('escondido');
}

function voltarInicio() {
  const seletores = document.getElementById('seletores-topo');
  if (seletores) seletores.classList.remove('escondido');

  const itens = document.querySelectorAll('.nav-item');
  itens.forEach(item => item.classList.remove('active'));
  const primeiro = document.querySelector('.nav-item');
  if (primeiro) primeiro.classList.add('active');

  const inputBusca = document.getElementById('input-busca');
  if (inputBusca) inputBusca.value = '';

  exibirCapa();
}

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
  const btnVoltar = document.getElementById('btn-voltar');

  if (cardCapa && areaLeitor && imgCapa) {
    imgCapa.src = hqs[hqAtual].capa;
    cardCapa.classList.remove('escondido');
    areaLeitor.classList.add('escondido');
    if (grid) grid.classList.add('escondido');
    if (btnVoltar) btnVoltar.classList.add('escondido');
  }
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
    if (btnVoltar) btnVoltar.classList.add('escondido');
    areaLeitor.classList.remove('escondido');
    paginaAtual = 0;
    atualizarLeitor();
  }
}

function atualizarLeitor() {
  const totalPaginas = hqs[hqAtual].capitulos[capituloAtual];
  const imgElement = document.getElementById('pagina-imagem');
  const contador = document.getElementById('contador-pagina');

  if (imgElement && totalPaginas) {
    imgElement.src = caminhoPagina(hqAtual, capituloAtual, paginaAtual + 1);
  }
  if (contador && totalPaginas) {
    contador.innerText = `Página ${paginaAtual + 1} de ${totalPaginas}`;
  }
}

function proximaPagina() {
  const totalPaginas = hqs[hqAtual].capitulos[capituloAtual];
  if (paginaAtual < totalPaginas - 1) {
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