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

  // Query de busca na AniList GraphQL API
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
      status.innerText = "Personagem não encontrado! Tente o nome em inglês.";
      return;
    }

    const personagem = dados.data.Character;

    // Atualiza a tela com a foto, nome e história
    document.getElementById('img-personagem').src = personagem.image.large;
    document.getElementById('titulo-nome').innerText = personagem.name.full;
    document.getElementById('nome-japones').innerText = personagem.name.native ? `(Original: ${personagem.name.native})` : '';
    
    // Limpa marcações extras da descrição caso existam
    let sobre = personagem.description || "Nenhuma história encontrada para este personagem.";
    // Remove códigos Markdown de spoilers para o texto ficar limpo
    sobre = sobre.replace(/~!|!~/g, '').substring(0, 600) + "...";

    document.getElementById('sobre-personagem').innerText = sobre;

    status.innerText = "";
    card.classList.remove('escondido');

  } catch (erro) {
    console.error("Erro na busca:", erro);
    status.innerText = "Erro ao buscar. Verifique sua conexão e tente novamente!";
  }
}
