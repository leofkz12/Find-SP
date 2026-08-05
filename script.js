// Dados de exemplo (você pode trocar os links pelas URLs reais das suas páginas)
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

// Inicializa os seletores na tela
function carregarMenu() {
  const selectHQ = document.getElementById('select-hq');
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

  imgElement.src = paginas[paginaAtual];
  contador.innerText = `Página ${paginaAtual + 1} de ${paginas.length}`;
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

// Executa assim que a página carrega
window.onload = carregarMenu;
