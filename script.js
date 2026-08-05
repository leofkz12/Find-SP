// ==========================================
// LÓGICA DO MENU LATERAL
// ==========================================
function toggleMenu() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');

  sidebar.classList.toggle('aberto');
  overlay.classList.toggle('ativo');
}

function filtrarHQs(categoria) {
  const itens = document.querySelectorAll('.nav-item');
  itens.forEach(item => item.classList.remove('active'));
  
  if (event && event.currentTarget) {
    event.currentTarget.classList.add('active');
  }

  console.log("Categoria selecionada:", categoria);
  toggleMenu();
}

// ==========================================
// LÓGICA DO LEITOR DE HQs / QUADRINHOS
// ==========================================
const hqs = {
  "aranha-verso": {
    titulo: "Aranhaverso #1",
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
  atualizarLeitor();
}

function mudarHQ() {
  hqAtual = document.getElementById('select-hq').value;
  carregarCapitulos();
}

function mudarCapitulo() {
  capituloAtual = document.getElementById('select-capitulo').value;
  paginaAtual = 0;
  atualizarLeitor();
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
