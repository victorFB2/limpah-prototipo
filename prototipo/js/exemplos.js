/* ==========================================================================
   LIMPAH — OS EXEMPLOS DA MAQUETE

   Tudo o que é de mentira mora aqui, e só aqui: as profissionais, a conta
   do cliente, as oportunidades, os serviços já feitos, as mensagens de
   exemplo da conversa e o estado com que a maquete começa.

   Por que separado: as telas são as mesmas na maquete e no app de verdade.
   O app NÃO carrega este arquivo. Se uma tela esquecer de pedir o dado ao
   servidor e procurar um destes nomes, ela quebra com erro — em vez de
   mostrar uma pessoa inventada para um cliente de verdade.

   Regra para as telas: só tocar nestes nomes DENTRO de funções, nunca ao
   carregar o arquivo.

   Ninguém daqui existe. Endereços, nomes e números são inventados.
   ========================================================================== */


/* O estado com que a maquete começa: duas favoritas e uma mensagem não
   lida, para a home não abrir vazia. No app, começa sem nada. */
const ESTADO_INICIAL_DE_EXEMPLO = {
  favoritos: [1, 2],     // ids de PROFISSIONAIS
  naoLidas: 1,
};


/* Os bairros da maquete: o cliente escolhe o da casa, e a diarista marca
   onde quer trabalhar. Desde a R32 (14/10/2026) são os 96 DISTRITOS da
   cidade de São Paulo, em ordem alfabética — a mesma lista do servidor
   (app/limpah/regras.py; um teste do app compara as duas). Os nomes são
   públicos (a lista da Prefeitura); os centros de cada um ficam só no
   servidor. No app, a lista vem do servidor. */
const BAIRROS_DE_EXEMPLO = [
  "Água Rasa", "Alto de Pinheiros", "Anhanguera", "Aricanduva",
  "Artur Alvim", "Barra Funda", "Bela Vista", "Belém", "Bom Retiro", "Brás",
  "Brasilândia", "Butantã", "Cachoeirinha", "Cambuci", "Campo Belo",
  "Campo Grande", "Campo Limpo", "Cangaíba", "Capão Redondo", "Carrão",
  "Casa Verde", "Cidade Ademar", "Cidade Dutra", "Cidade Líder",
  "Cidade Tiradentes", "Consolação", "Cursino", "Ermelino Matarazzo",
  "Freguesia do Ó", "Grajaú", "Guaianases", "Iguatemi", "Ipiranga",
  "Itaim Bibi", "Itaim Paulista", "Itaquera", "Jabaquara", "Jaçanã",
  "Jaguara", "Jaguaré", "Jaraguá", "Jardim Ângela", "Jardim Helena",
  "Jardim Paulista", "Jardim São Luís", "José Bonifácio", "Lajeado", "Lapa",
  "Liberdade", "Limão", "Mandaqui", "Marsilac", "Moema", "Mooca", "Morumbi",
  "Parelheiros", "Pari", "Parque do Carmo", "Pedreira", "Penha", "Perdizes",
  "Perus", "Pinheiros", "Pirituba", "Ponte Rasa", "Raposo Tavares",
  "República", "Rio Pequeno", "Sacomã", "Santa Cecília", "Santana",
  "Santo Amaro", "São Domingos", "São Lucas", "São Mateus", "São Miguel",
  "São Rafael", "Sapopemba", "Saúde", "Sé", "Socorro", "Tatuapé", "Tremembé",
  "Tucuruvi", "Vila Andrade", "Vila Curuçá", "Vila Formosa",
  "Vila Guilherme", "Vila Jacuí", "Vila Leopoldina", "Vila Maria",
  "Vila Mariana", "Vila Matilde", "Vila Medeiros", "Vila Prudente",
  "Vila Sônia"
];


/* --------------------------------------------------------------------------
   PROFISSIONAIS FICTÍCIAS (eram a parte 4 do dados.js)
   Nenhuma dessas pessoas existe. Servem para as telas terem conteúdo.
   -------------------------------------------------------------------------- */
/* PRIVACIDADE — regra que vale para o produto todo:
   o cliente vê primeiro nome + inicial do sobrenome ("Maria S."), nunca o
   sobrenome inteiro, telefone, rede social ou endereço dela. O sobrenome
   completo fica guardado aqui só porque o dashboard da empresa precisa
   dele; nenhuma tela do cliente pode mostrá-lo. */
const PROFISSIONAIS = [
  { id:1, nome:"Maria Silva",        cor:"#C2410C", nota:4.8, avaliacoes:134, anos:5,
    servicos:320, distancia:3.2, confianca:96, favorita:true, comparecimento:98,
    naPlataforma:"2 anos e 4 meses",
    especialidades:["Limpeza pesada","Organização","Pós-obra"],
    frase:"Sou dedicada, caprichosa e gosto de deixar tudo impecável.",
    verificacoes:["Documento conferido","Selfie conferida","Antecedentes verificados"],
    comentarios:[
      { de:"Ana P.",     nota:5, quando:"há 2 semanas", texto:"Deixou a casa impecável e ainda organizou os armários. Já agendei de novo." },
      { de:"Carlos M.",  nota:5, quando:"há 1 mês",     texto:"Pontual e muito caprichosa. Recomendo." },
      { de:"Fernanda L.",nota:4, quando:"há 2 meses",   texto:"Fez um bom trabalho. Só demorou um pouco na cozinha." },
    ] },

  { id:2, nome:"Joana Ribeiro",      cor:"#9333EA", nota:4.9, avaliacoes:87,  anos:3,
    servicos:210, distancia:1.8, confianca:98, favorita:true, comparecimento:100,
    naPlataforma:"1 ano e 7 meses",
    especialidades:["Limpeza do dia a dia","Organização","Passar roupas"],
    frase:"Trabalho com organização e atenção aos detalhes.",
    verificacoes:["Documento conferido","Selfie conferida","Antecedentes verificados"],
    comentarios:[
      { de:"Ana P.",    nota:5, quando:"há 1 semana", texto:"Chegou no horário e trabalhou muito bem. Super atenciosa." },
      { de:"Roberto S.",nota:5, quando:"há 3 semanas",texto:"Nunca faltou em nenhuma das vezes que agendei." },
    ] },

  { id:3, nome:"Cleide Souza",       cor:"#0D9488", nota:4.7, avaliacoes:56,  anos:8,
    servicos:145, distancia:5.4, confianca:92, favorita:false, comparecimento:95,
    naPlataforma:"11 meses",
    especialidades:["Limpeza pesada","Área externa"],
    frase:"Oito anos de experiência com limpeza residencial.",
    verificacoes:["Documento conferido","Selfie conferida","Antecedentes verificados"],
    comentarios:[
      { de:"Juliana R.", nota:5, quando:"há 1 mês", texto:"Muita experiência, deu conta de uma casa grande sozinha." },
    ] },

  { id:4, nome:"Rosângela Dias",     cor:"#B45309", nota:5.0, avaliacoes:23,  anos:2,
    servicos:41,  distancia:2.6, confianca:89, favorita:false, comparecimento:100,
    naPlataforma:"4 meses",
    especialidades:["Limpeza do dia a dia","Passar roupas"],
    frase:"Sou nova na plataforma, mas muito caprichosa!",
    verificacoes:["Documento conferido","Selfie conferida","Antecedentes verificados"],
    comentarios:[
      { de:"Marcos T.", nota:5, quando:"há 3 semanas", texto:"Primeira vez que chamei e já quero de novo." },
    ] },
];


/* --------------------------------------------------------------------------
   CONTA FICTÍCIA DO CLIENTE (era a parte 5 do dados.js)
   -------------------------------------------------------------------------- */
const CASA_EXEMPLO = {
  id: "casa-1",
  apelido: "Casa",
  tipoImovel: "apartamento",
  comodos: 3,
  banheiros: 1,
  rua: "Rua das Flores, 123",
  complemento: "Apto 42",
  bairro: "Vila Madalena",
  cidade: "São Paulo",
  estado: "SP",
  cep: "05435-000",
};

const CLIENTE_EXEMPLO = {
  nome:"Ana Paula Moreira",
  primeiroNome:"Ana",
  email:"ana@exemplo.com",
  telefone:"(11) 99999-9999",
  cor:"#6C3AD8",
  endereco:{
    apelido:"Casa",
    rua:"Rua das Flores, 123",
    complemento:"Apto 42",
    bairro:"Vila Madalena",
    cidade:"São Paulo",
    estado:"SP",
    cep:"05435-000",
  },
};


/* --------------------------------------------------------------------------
   AS OPORTUNIDADES DA DIARISTA (a home dela, com cadeado)
   -------------------------------------------------------------------------- */

/* Oportunidades fictícias, mas com preço calculado pela tabela DE VERDADE
   (calcularPedido). É isso que faz o Portão 1 valer a pena: ela vê o valor
   real que vai receber, não uma promessa de "ótimas oportunidades".

   Se a tabela de preços mudar, esta tela muda junto — nenhum valor aqui é
   escrito à mão.

   `rua` é o endereço completo, FICTÍCIO. Ele mora aqui e só aparece na
   agenda, depois do aceite (R18) E a partir das 18h da véspera (A13) — quem
   decide é enderecoLiberado(), no dados.js. Os testes 21 e 24 conferem.

   `cliente` é o nome inteiro, FICTÍCIO, como o sobrenome das PROFISSIONAIS:
   fica aqui e nunca chega à agenda dela. O aceite guarda só "Carla M." —
   o mesmo cuidado que o cliente tem com ela (A18, item 1; teste 26).

   `observacoes` é o recado do cliente, texto livre. Só aparece junto com a
   rua (A18, item 3): o da Butantã mostra por quê — ele traz o apartamento. */
const OPORTUNIDADES = [
  { emDias:1, periodo:"manha", bairro:"Pinheiros", km:2.1, rua:"Rua dos Ipês, 48",
    cliente:"Carla Mendes",
    pedido:{ categoria:"diarista", respostas:{tipo:"padrao", comodos:3, banheiros:1,
      observacoes:"Tenho um gato bem tranquilo. Os produtos ficam embaixo da pia."}, adicionais:[] } },
  { emDias:1, periodo:"tarde", bairro:"Pinheiros", km:3.4, rua:"Rua das Acácias, 215",
    cliente:"Beatriz Lopes",
    pedido:{ categoria:"diarista", respostas:{tipo:"completa", comodos:4, banheiros:2,
      observacoes:"As roupas para passar ficam no cesto da lavanderia."}, adicionais:["passar"] } },
  { emDias:2, periodo:"manha", bairro:"Perdizes", km:4.8, rua:"Rua Jacarandá, 90",
    cliente:"Renata Alves",
    pedido:{ categoria:"diarista", respostas:{tipo:"padrao", comodos:5, banheiros:2}, adicionais:[] } },
  { emDias:2, periodo:"tarde", bairro:"Butantã", km:5.9, rua:"Rua das Orquídeas, 37",
    cliente:"Patrícia Gomes",
    pedido:{ categoria:"diarista", respostas:{tipo:"padrao", comodos:2, banheiros:1,
      observacoes:"É o bloco B, apartamento 32. O porteiro já vai estar avisado."}, adicionais:[] } },
  { emDias:3, periodo:"manha", bairro:"Lapa", km:4.2, rua:"Rua dos Girassóis, 152",
    cliente:"Luciana Rocha",
    pedido:{ categoria:"diarista", respostas:{tipo:"completa", comodos:3, banheiros:2}, adicionais:[] } },
  { emDias:3, periodo:"tarde", bairro:"Perdizes", km:6.3, rua:"Rua das Hortênsias, 64",
    cliente:"Sandra Nunes",
    pedido:{ categoria:"diarista", respostas:{tipo:"padrao", comodos:4, banheiros:2}, adicionais:[] } },
  { emDias:4, periodo:"tarde", bairro:"Perdizes", km:4.6, rua:"Rua Manacá, 301",
    cliente:"Fernanda Costa",
    pedido:{ categoria:"diarista", respostas:{tipo:"padrao", comodos:3, banheiros:2}, adicionais:["geladeira"] } },
  /* Acrescentada em 12/10/2026 (R26): é a única que cabe no MESMO dia de
     outra (amanhã de manhã + amanhã à noite = 8h). Sem ela, a demonstração
     nunca mostraria a agenda chegando ao teto do dia. */
  { emDias:1, periodo:"noite", bairro:"Pinheiros", km:2.8, rua:"Rua dos Cedros, 19",
    cliente:"Juliana Prado",
    pedido:{ categoria:"diarista", respostas:{tipo:"padrao", comodos:2, banheiros:1}, adicionais:[] } },
];

/* A cidade das oportunidades fictícias, para o link do mapa não cair numa
   Rua dos Ipês de outro estado. No app de verdade vem da casa cadastrada. */
const CIDADE_DAS_OPORTUNIDADES = "São Paulo - SP";


/* --------------------------------------------------------------------------
   O QUE ELA JÁ FEZ (os ganhos e o extrato dela)
   -------------------------------------------------------------------------- */

/* SERVIÇOS JÁ FEITOS, DE EXEMPLO — escolha PROVISÓRIA (A11).

   Sem eles, "Recebido" e o extrato abririam vazios e não daria para ver como
   ficam. São fictícios do mesmo jeito que as OPORTUNIDADES: datas contadas a
   partir de hoje e valores calculados pela tabela de verdade. Só aparecem
   para quem já foi aprovada (antes disso ela não trabalhou), e as telas
   dizem que são de exemplo. */
const SERVICOS_FEITOS_DE_EXEMPLO = [
  { haDias:2,  periodo:"manha", bairro:"Pinheiros",     km:3.1, rua:"Rua das Paineiras, 77",
    pedido:{ categoria:"diarista", respostas:{tipo:"padrao", comodos:3, banheiros:1}, adicionais:["geladeira"] } },
  { haDias:5,  periodo:"tarde", bairro:"Pinheiros",     km:2.4, rua:"Rua dos Ipês, 112",
    pedido:{ categoria:"diarista", respostas:{tipo:"padrao", comodos:2, banheiros:1}, adicionais:[] } },
  { haDias:9,  periodo:"manha", bairro:"Perdizes",      km:5.6, rua:"Rua Cambará, 45",
    pedido:{ categoria:"diarista", respostas:{tipo:"completa", comodos:3, banheiros:1}, adicionais:["passar"] } },
  { haDias:16, periodo:"manha", bairro:"Lapa",          km:4.0, rua:"Rua dos Girassóis, 18",
    pedido:{ categoria:"diarista", respostas:{tipo:"padrao", comodos:4, banheiros:2}, adicionais:[] } },
  { haDias:23, periodo:"tarde", bairro:"Perdizes",      km:6.1, rua:"Rua das Hortênsias, 230",
    pedido:{ categoria:"diarista", respostas:{tipo:"padrao", comodos:2, banheiros:1}, adicionais:["armarios"] } },
];


/* --------------------------------------------------------------------------
   A CONVERSA
   -------------------------------------------------------------------------- */

/* AS MENSAGENS DE EXEMPLO (A18-11): quem é de mentira também escreve, para
   o aviso poder ser visto. Cada uma só aparece depois da hora dela, e nunca
   antes de a conversa abrir nem antes do aceite. Não ficam guardadas: são
   lidas do relógio, como a rua. */
function exemplosDaConversa(ctx){
  const abre = momentoQueAConversaAbre(ctx).getTime();
  const fecha = momentoQueAConversaFecha(ctx).getTime();
  if(isNaN(abre) || isNaN(fecha)) return [];
  const desde = Math.max(abre, ctx.desde || 0);
  const quando = (isoDoDia(new Date(desde)) === ctx.data) ? "Hoje" : "Amanhã";
  const janela = ctx.janela ? " " + ctx.janela : "";
  function primeiro(nome){ return String(nome || "").split(" ")[0]; }
  const lista = [];
  if(ctx.deMentira === "diarista"){
    const inicio = momentoDoServico(ctx, ctx.inicio).getTime();
    lista.push({ em:desde, texto:"Oi, " + primeiro(ctx.nomes.cliente) + "! Aqui é a "
      + primeiro(ctx.nomes.diarista) + ". 😊 " + quando + " estou aí" + janela
      + ". Qualquer coisa, é só falar por aqui." });
    lista.push({ em:inicio - 30 * 60000, texto:RESPOSTAS_PRONTAS_DELA[0] });
    lista.push({ em:inicio - 2 * 60000,
                 texto:ctx.apartamento ? "Oii, estou em frente ao prédio! 😊" : "Oii, estou aqui em frente! 😊" });
  } else {
    lista.push({ em:desde, texto:"Oi, " + primeiro(ctx.nomes.diarista) + "! Obrigada por aceitar. 😊 "
      + quando + " te espero" + janela + "." });
  }
  return lista.filter(function(m){ return m.em >= desde && m.em < fecha; })
    .map(function(m){ return { de:ctx.deMentira, texto:m.texto, em:m.em, exemplo:true }; });
}


/* --------------------------------------------------------------------------
   O QUE A EQUIPE ESCREVE, NA MAQUETE (entrega 5a)
   -------------------------------------------------------------------------- */

/* Os textos que os simuladores do quadro "NA MAQUETE" usam quando "a
   equipe" decide (no app, quem escreve é uma pessoa da equipe, sempre com o
   motivo). A primeira aprovação não tem texto: no app, a nota é opcional. */
const TEXTOS_DA_EQUIPE_DE_EXEMPLO = {
  recusar: "A foto do documento ficou escura, e não conseguimos ler o número do RG. "
         + "Se quiser, responda aqui contando como prefere mandar uma foto nova.",
  suspender: "Um cliente contou que você não foi a um serviço confirmado na terça, sem avisar. "
           + "Antes de decidir qualquer coisa, queremos ouvir o seu lado.",
  manter: "Lemos a sua resposta, obrigado por explicar. Por enquanto, a decisão continua. "
        + "Se tiver mais alguma coisa para contar, pode responder de novo por aqui.",
  aprovarDeNovo: "Lemos a sua resposta e conferimos tudo de novo. Está tudo certo: "
               + "você já pode aceitar serviços.",
};
