// ==========================================
// BANCO DE DADOS DAS HQS / MANGÁS
// ==========================================
// "lancamento" e "resumo" são só placeholders — troque pelo texto real
// de cada história. Eles aparecem na ficha que abre ao clicar em "Ver mais".

const hqs = {
  "spider-gwen": {
    titulo: "Spider-Gwen: Shadow Clones",
    capa: "assets/capas/spider-gwen.jpg",
    genero: "hq",
    lancamento: "1/3/2023", // <-- troque pela data real
    resumo: "A nova aventura da Spider-Gwen, a Mulher-Aranha da Terra-65, coloca a heroína contra um exército de clones de Gwen baseados nos maiores vilões do Homem-Aranha.Colocará a Spider-Gwen contra seus clones a Gwen Doutor Octopus, a Gwen-Areia e a Gwen Abutre. ", // <-- troque pelo resumo real
    capitulos: {
      "cap-1": 31, // <-- troque pelo número real de páginas desse capítulo
      "cap-2": 21,
      "cap-3": 21,
      "cap-4": 1,
      "cap-5": 1
    }
  },
  "frieren": {
    titulo: "Sousou no Frieren",
    capa: "assets/capas/frieren.jpg",
    genero: "manga",
    lancamento: "28/4/2020",
    resumo: "A história acompanha a maga elfa Frieren, que, após uma década de jornada para derrotar o Rei Demônio junto ao herói humano Himmel, retorna à vida comum.  Devido à sua longa vida élfica, Frieren não compreende a efemeridade da vida humana e testemunha seus companheiros envelhecerem e morrerem. Anos após a morte de Himmel, ela embarca em uma nova jornada com sua aprendiz humana, Fern, e posteriormente com o guerreiro Stark.",
    capitulos: {
      "cap-1": 1
    }
  },
  "miles-morales": {
    titulo: "Miles-Morales Absolute Carnage",
    capa: "assets/capas/miles-morales.jpg",
    genero: "hq",
    lancamento: "28/8/2019",
    resumo: "A história foca no Miles Morales enfrentando o Escorpião (Mac Gargan), que possui o simbionte Venom.  Quando uma horda de acólitos do Carnificina ataca Nova York, Miles é infectado pelo simbionte vermelho e possuído, transformando-se temporariamente em um vilão. ",
    capitulos: {
      "cap-1": 21,
      "cap-2": 1,
      "cap-3": 1,
      "cap-4": 1,
      "cap-5": 1
    }
  },
  "solo-leveling": {
    titulo: "Solo-Leveling",
    capa: "assets/capas/sololeveling.jpg",
    genero: "manga",
    lancamento: "12/7/2016",
    resumo: "Solo Leveling é uma obra que se passa em um mundo onde portais conectam a Terra a dimensões repletas de monstros, obrigando humanos com poderes mágicos, chamados Caçadores, a protegê-la.  A história acompanha Sung Jinwoo, conhecido como o Caçador de Rank E mais fraco da humanidade, que, após sobreviver milagrosamente a uma masmorra dupla quase fatal, torna-se o único indivíduo com acesso a um misterioso Sistema que permite que ele suba de nível e se torne o ser mais poderoso.",
    capitulos: {
      "cap-1": 1,
      "cap-2": 1
    }
  },
  "overlord": {
    titulo: "Overlord",
    capa: "assets/capas/overlord.jpg",
    genero: "manga",
    lancamento: "20/1/2021",
    resumo: "A história acompanha Momonga, um jogador dedicado do MMORPG Yggdrasil, que decide não deslogar quando os servidores são encerrados.  Ele se vê transportado para um novo mundo e transformado em seu avatar de esqueleto, o poderoso feiticeiro Ainz Ooal Gown, enquanto seus NPCs ganham vida própria e lealdade absoluta. ",
    capitulos: {
      "cap-1": 1,
      "cap-2": 1
    }
  },
  "spider-man-2099": {
    titulo: "Spider-Man 2099 Exodus",
    capa: "assets/capas/spider-man2099.jpg",
    genero: "hq",
    lancamento: "4/5/2022",
    resumo: "Miguel O'Hara (Homem-Aranha 2099) retorna ao seu presente para investigar o evento cósmico e proteger o novo paraíso da ameaçadora Cabal, liderada por Norman Osborn.  A série apresenta versões futuras de personagens como Soldado Invernal 13, Loki, Motoqueiro Fantasma e uma nova formação de X-Men 2099, além de introduzir os Novos Vingadores de 2099 liderados pelo Cavaleiro da Lua.",
    capitulos: {
      "cap-1": 31,
      "cap-2": 1
    }
  }

  // Adicione novas HQs/mangás aqui embaixo, seguindo o mesmo modelo.
  // Ex: "nome-da-hq": { titulo: "...", capa: "...", genero: "hq"|"manga",
  //   lancamento: "2024", resumo: "...",
  //   capitulos: { "cap-1": 25, "cap-2": 30 } }
};