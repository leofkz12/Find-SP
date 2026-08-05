async function buscarPersonagem() {
  const nomeInput = document.getElementById('nome-personagem').value.trim();
  const status = document.getElementById('status-mensagem');
  const card = document.getElementById('card-personagem');

  if (!nomeInput) {
    status.innerText = "Por favor, digite o nome de um personagem!";
    return;
  }

  status.innerText = "Buscando nas sombras...";
  card.classList.add('escondido');

  try {
    const resposta = await fetch(`https://api.jikan.moe/v4/characters?q=${encodeURIComponent(nomeInput)}&limit=1`);
    
    if (!resposta.ok) {
      throw new Error("Erro de conexão na API");
    }

    const dados = await resposta.json();

    if (!dados.data || dados.data.length === 0) {
      status.innerText = "Personagem não encontrado! Tente pesquisar em inglês.";
      return;
    }

    const personagem = dados.data[0];

    // Atualiza imagem e textos
    document.getElementById('img-personagem').src = personagem.images.jpg.image_url;
    document.getElementById('titulo-nome').innerText = personagem.name;
    document.getElementById('nome-japones').innerText = personagem.name_kanji ? `(Kanji: ${personagem.name_kanji})` : '';
    
    const sobre = personagem.about ? personagem.about : "Nenhuma história encontrada para este personagem.";
    document.getElementById('sobre-personagem').innerText = sobre;

    status.innerText = "";
    card.classList.remove('escondido');

  } catch (erro) {
    console.error(erro);
    status.innerText = "Erro ao carregar dados. Tente novamente em alguns segundos!";
  }
}
