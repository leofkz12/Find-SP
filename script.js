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
    // Requisição para a API do Jikan (MyAnimeList)
    const url = `https://api.jikan.moe/v4/characters?q=${encodeURIComponent(nomeInput)}&limit=1`;
    const resposta = await fetch(url);

    if (!resposta.ok) {
      throw new Error(`Erro na API: ${resposta.status}`);
    }

    const dados = await resposta.json();

    if (!dados.data || dados.data.length === 0) {
      status.innerText = "Personagem não encontrado! Tente pesquisar em inglês (ex: Goku, Naruto).";
      return;
    }

    const personagem = dados.data[0];

    // Preenche as informações
    document.getElementById('img-personagem').src = personagem.images.jpg.image_url;
    document.getElementById('titulo-nome').innerText = personagem.name;
    document.getElementById('nome-japones').innerText = personagem.name_kanji ? `(Kanji: ${personagem.name_kanji})` : '';
    
    // Tratamento para limpar formatações estranhas da biografia
    let sobre = personagem.about ? personagem.about : "Nenhuma história/descrição encontrada para este personagem.";
    
    document.getElementById('sobre-personagem').innerText = sobre;

    status.innerText = "";
    card.classList.remove('escondido');

  } catch (erro) {
    console.error("Detalhes do erro:", erro);
    status.innerText = "A API está ocupada no momento. Aguarde 3 segundos e tente clicar em Buscar novamente!";
  }
}
