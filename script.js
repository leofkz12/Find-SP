async function buscarPersonagem() {
  const nome = document.getElementById('nome-personagem').value;
  const status = document.getElementById('status-mensagem');
  const card = document.getElementById('card-personagem');

  if (!nome) {
    status.innerText = "Por favor, digite o nome de um personagem!";
    return;
  }

  status.innerText = "Buscando nas sombras...";
  card.classList.add('escondido');

  try {
    // Faz a busca na API do MyAnimeList (Jikan API)
    const resposta = await fetch(`https://api.jikan.moe/v4/characters?q=${encodeURIComponent(nome)}&limit=1`);
    const dados = await resposta.json();

    if (dados.data.length === 0) {
      status.innerText = "Personagem não encontrado!";
      return;
    }

    const personagem = dados.data[0];

    // Preenche os dados no HTML
    document.getElementById('img-personagem').src = personagem.images.jpg.image_url;
    document.getElementById('titulo-nome').innerText = personagem.name;
    document.getElementById('nome-japones').innerText = personagem.name_kanji ? `(Kanji: ${personagem.name_kanji})` : '';
    
    // A API traz a biografia detalhada do personagem
    const sobre = personagem.about ? personagem.about : "Nenhuma história encontrada para este personagem.";
    document.getElementById('sobre-personagem').innerText = sobre;

    status.innerText = "";
    card.classList.remove('escondido');

  } catch (erro) {
    console.error(erro);
    status.innerText = "Ocorreu um erro ao buscar os dados.";
  }
}
