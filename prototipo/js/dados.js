/* ==========================================================================
   LIMPAH — DADOS E REGRAS DE NEGÓCIO
   --------------------------------------------------------------------------
   Este é o arquivo mais importante do protótipo.

   Tudo que é REGRA (preço, duração, adicionais, categorias de serviço) mora
   aqui, separado das telas. Isso não é capricho de programador: é a decisão
   de arquitetura que permite a plataforma crescer para além de diaristas.

   Para acrescentar "Eletricista" no futuro, ninguém precisa mexer nas telas.
   Basta acrescentar um item em CATALOGO com as perguntas daquele serviço.
   As telas se montam sozinhas a partir daqui.

   No aplicativo real, tudo neste arquivo vira configuração no dashboard
   administrativo — o documento pede isso na seção 10.
   ========================================================================== */


/* A lista de telas do app. Cada arquivo telas-*.js acrescenta as suas aqui.
   Precisa nascer antes deles, por isso mora neste arquivo. */
const TELAS = {};


/* --------------------------------------------------------------------------
   1. TABELA DE PREÇOS  (documento, seção 11)
   -------------------------------------------------------------------------- */
const FAIXAS_DE_PRECO = [
  { horas: 4, clientePaga: 160, profissionalRecebe: 110 },
  { horas: 6, clientePaga: 181, profissionalRecebe: 131 },
  { horas: 8, clientePaga: 200, profissionalRecebe: 150 },
];

/* Quanto do valor de um ADICIONAL vai para a profissional.
   0.65 = 65% para ela, 35% fica com a plataforma.
   >>> Este número foi escolhido por mim para o protótipo funcionar.
       Precisa da sua decisão. Está anotado no DECISOES.md.            */
const REPASSE_DO_ADICIONAL = 0.65;


/* --------------------------------------------------------------------------
   2. ADICIONAIS  (documento, seção 10)
   Cada um tem preço para o cliente e quanto tempo ele acrescenta ao serviço.
   -------------------------------------------------------------------------- */
const ADICIONAIS = [
  { id:"passar",    nome:"Passar roupas",              icone:"👔", preco:40, minutos:60,
    detalhe:"Até uma cesta de roupas" },
  { id:"geladeira", nome:"Interior da geladeira",      icone:"🧊", preco:25, minutos:30,
    detalhe:"Limpeza interna completa" },
  { id:"armarios",  nome:"Interior dos armários",      icone:"🚪", preco:30, minutos:45,
    detalhe:"Armários da cozinha" },
  { id:"janelas",   nome:"Interior das janelas",       icone:"🪟", preco:35, minutos:45,
    detalhe:"Somente parte interna, por segurança" },
  { id:"externa",   nome:"Área externa",               icone:"🌿", preco:30, minutos:45,
    detalhe:"Quintal ou varanda, até 20m²" },
  { id:"estofado",  nome:"Aspirar tapete ou estofado", icone:"🛋️", preco:20, minutos:30,
    detalhe:"Um sofá ou um tapete" },
  { id:"lavar",     nome:"Lavar roupas",               icone:"🧺", preco:30, minutos:45,
    detalhe:"Uso da máquina da casa" },
];


/* --------------------------------------------------------------------------
   3. CATÁLOGO DE SERVIÇOS
   Cada categoria diz quais perguntas o cliente responde e como o tempo é
   estimado. É aqui que outras profissões entram no futuro.
   -------------------------------------------------------------------------- */
const CATALOGO = [

  {
    id:"diarista",
    nome:"Diarista",
    descricao:"Limpeza e organização da sua casa",
    icone:"🧹",
    cor:"#6C3AD8",
    disponivel:true,
    aceitaAdicionais:true,
    aceitaDuasProfissionais:true,
    comoChamamos:"diarista",     // usado nos textos das telas
    comoChamamosPlural:"diaristas",

    perguntas:[
      { id:"tipo", tipo:"opcao", rotulo:"Tipo de limpeza", opcoes:[
        { id:"padrao",   nome:"Padrão",   detalhe:"Limpeza do dia a dia",    icone:"🧽" },
        { id:"completa", nome:"Completa", detalhe:"Limpeza mais detalhada",  icone:"✨" },
      ]},
      { id:"comodos",   tipo:"contador", rotulo:"Número de cômodos", min:1, max:12, inicial:3,
        ajuda:"Conte quartos, sala, cozinha e área de serviço." },
      { id:"banheiros", tipo:"contador", rotulo:"Banheiros", min:0, max:6, inicial:1 },
      { id:"observacoes", tipo:"texto", rotulo:"Observações (opcional)",
        exemplo:"Ex.: tenho um cachorro, o portão é o do lado direito..." },
    ],

    /* Quanto tempo o serviço deve levar, em minutos.
       >>> Esta fórmula foi criada por mim. O material original não definia
           como o número de cômodos vira duração. Precisa da sua revisão. */
    estimarMinutos: function(r){
      const base    = (r.tipo === "completa") ? 90 : 60;
      const porComodo   = (r.tipo === "completa") ? 45 : 30;
      const porBanheiro = (r.tipo === "completa") ? 45 : 30;
      return base + (r.comodos * porComodo) + (r.banheiros * porBanheiro);
    },
  },

  {
    id:"faxina-pesada",
    nome:"Faxina pesada",
    descricao:"Limpeza completa e pesada",
    icone:"🧴",
    cor:"#7C3AED",
    disponivel:true,
    aceitaAdicionais:true,
    aceitaDuasProfissionais:true,
    comoChamamos:"profissional",
    comoChamamosPlural:"profissionais",

    perguntas:[
      { id:"situacao", tipo:"opcao", rotulo:"Qual é a situação?", opcoes:[
        { id:"pos-obra",  nome:"Pós-obra",       detalhe:"Poeira fina e resíduo de obra", icone:"🧱" },
        { id:"mudanca",   nome:"Mudança",        detalhe:"Casa vazia, antes ou depois",   icone:"📦" },
        { id:"acumulada", nome:"Muito tempo sem limpar", detalhe:"Sujeira acumulada",     icone:"🕰️" },
      ]},
      { id:"comodos",   tipo:"contador", rotulo:"Número de cômodos", min:1, max:12, inicial:3 },
      { id:"banheiros", tipo:"contador", rotulo:"Banheiros", min:0, max:6, inicial:1 },
      { id:"observacoes", tipo:"texto", rotulo:"Observações (opcional)",
        exemplo:"Ex.: sobrou entulho da reforma na área de serviço." },
    ],

    estimarMinutos: function(r){
      const extra = (r.situacao === "pos-obra") ? 60 : 30;
      return 120 + extra + (r.comodos * 50) + (r.banheiros * 50);
    },
  },

  {
    id:"passadeira",
    nome:"Passadeira",
    descricao:"Passa as roupas do dia a dia",
    icone:"👕",
    cor:"#DB2777",
    disponivel:true,
    aceitaAdicionais:false,
    aceitaDuasProfissionais:false,
    comoChamamos:"passadeira",
    comoChamamosPlural:"passadeiras",

    /* Repare: esta categoria NÃO pergunta cômodos nem banheiros.
       As perguntas são outras — e as telas se adaptam sozinhas.
       É esta a prova de que a estrutura não é exclusiva de limpeza. */
    perguntas:[
      { id:"volume", tipo:"opcao", rotulo:"Quanta roupa?", opcoes:[
        { id:"pouca",  nome:"Até 1 cesto",  detalhe:"Aproximadamente 20 peças", icone:"🧺" },
        { id:"media",  nome:"2 cestos",     detalhe:"Aproximadamente 40 peças", icone:"🧺" },
        { id:"muita",  nome:"3 ou mais",    detalhe:"Acima de 60 peças",        icone:"🧺" },
      ]},
      { id:"delicadas", tipo:"contador", rotulo:"Peças delicadas (seda, linho)", min:0, max:20, inicial:0 },
      { id:"observacoes", tipo:"texto", rotulo:"Observações (opcional)",
        exemplo:"Ex.: as camisas sociais precisam de goma." },
    ],

    estimarMinutos: function(r){
      const porVolume = { pouca:120, media:240, muita:360 };
      return (porVolume[r.volume] || 120) + (r.delicadas * 5);
    },
  },

  /* Espaço reservado — mostra ao cliente e ao time de TI que a plataforma
     nasce preparada para outras profissões. */
  {
    id:"outros",
    nome:"Outros serviços",
    descricao:"Eletricista, encanador, montador e mais",
    icone:"🔧",
    cor:"#0891B2",
    disponivel:false,
    emBreve:"Estamos preparando novas categorias. Comece pela limpeza que o resto vem logo.",
  },
];


/* --------------------------------------------------------------------------
   4. PROFISSIONAIS FICTÍCIAS
   Nenhuma dessas pessoas existe. Servem para as telas terem conteúdo.
   -------------------------------------------------------------------------- */
const PROFISSIONAIS = [
  { id:1, nome:"Maria Silva",        cor:"#C2410C", nota:4.8, avaliacoes:134, anos:5,
    servicos:320, distancia:3.2, confianca:96, favorita:true,
    frase:"Sou dedicada, caprichosa e gosto de deixar tudo impecável.",
    verificacoes:["Documento conferido","Selfie conferida","Antecedentes verificados"] },

  { id:2, nome:"Joana Ribeiro",      cor:"#9333EA", nota:4.9, avaliacoes:87,  anos:3,
    servicos:210, distancia:1.8, confianca:98, favorita:true,
    frase:"Trabalho com organização e atenção aos detalhes.",
    verificacoes:["Documento conferido","Selfie conferida","Antecedentes verificados"] },

  { id:3, nome:"Cleide Souza",       cor:"#0D9488", nota:4.7, avaliacoes:56,  anos:8,
    servicos:145, distancia:5.4, confianca:92, favorita:false,
    frase:"Oito anos de experiência com limpeza residencial.",
    verificacoes:["Documento conferido","Selfie conferida","Antecedentes verificados"] },

  { id:4, nome:"Rosângela Dias",     cor:"#B45309", nota:5.0, avaliacoes:23,  anos:2,
    servicos:41,  distancia:2.6, confianca:89, favorita:false,
    frase:"Sou nova na plataforma, mas muito caprichosa!",
    verificacoes:["Documento conferido","Selfie conferida","Antecedentes verificados"] },
];


/* --------------------------------------------------------------------------
   5. CONTA FICTÍCIA DO CLIENTE
   -------------------------------------------------------------------------- */
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


/* ==========================================================================
   6. O MOTOR DE PREÇO
   Recebe o que o cliente pediu e devolve duração, preço e repasse.
   Uma função só, usada por todas as telas — assim o valor nunca diverge
   entre a tela de resumo, a de pagamento e a notificação da profissional.
   ========================================================================== */
/* Acha em qual faixa de duração um serviço cai.
   Devolve também se estourou o teto de 8 horas por pessoa. */
function faixaPara(minutosPorPessoa){
  const horas = minutosPorPessoa / 60;
  const achou = FAIXAS_DE_PRECO.find(f => horas <= f.horas);
  return achou
    ? { faixa: achou, acimaDoMaximo: false }
    : { faixa: FAIXAS_DE_PRECO[FAIXAS_DE_PRECO.length - 1], acimaDoMaximo: true };
}

function calcularPedido(pedido){
  const categoria = CATALOGO.find(c => c.id === pedido.categoria);
  if(!categoria || !categoria.perguntas) return null;

  const quantidade = pedido.duasProfissionais ? 2 : 1;

  // 1. Tempo só do serviço principal, sem nenhum adicional
  const minutosServico = categoria.estimarMinutos(pedido.respostas || {});

  // 2. Tempo e preço que os adicionais acrescentam
  let minutosAdicionais = 0;
  let precoAdicionais = 0;
  const escolhidos = [];
  (pedido.adicionais || []).forEach(id => {
    const a = ADICIONAIS.find(x => x.id === id);
    if(!a) return;
    minutosAdicionais += a.minutos;
    precoAdicionais   += a.preco;
    escolhidos.push(a);
  });

  const minutos = minutosServico + minutosAdicionais;

  /* 3. Duas faixas: a do serviço sozinho e a do serviço com os adicionais.
        A diferença entre elas é o "tempo extra" — o salto de faixa que os
        adicionais provocaram. O cliente precisa ver isso com nome próprio,
        senão parece pegadinha: ele soma os adicionais e o total não bate. */
  const semAdicionais = faixaPara(minutosServico / quantidade);
  const comAdicionais = faixaPara(minutos / quantidade);

  const faixa = comAdicionais.faixa;
  const acimaDoMaximo = comAdicionais.acimaDoMaximo;

  const precoServico = semAdicionais.faixa.clientePaga * quantidade;
  const tempoExtra   = (faixa.clientePaga - semAdicionais.faixa.clientePaga) * quantidade;
  const total        = precoServico + tempoExtra + precoAdicionais;

  const repasseUnit  = faixa.profissionalRecebe + (precoAdicionais * REPASSE_DO_ADICIONAL / quantidade);
  const repasseTotal = repasseUnit * quantidade;

  return {
    categoria,
    minutos,                 // trabalho total, somando todas as pessoas
    minutosServico,
    minutosAdicionais,
    horas: faixa.horas,      // quanto tempo CADA profissional fica na casa
    horasSemAdicionais: semAdicionais.faixa.horas,
    horasReais: Math.round((minutos / quantidade / 60) * 10) / 10,
    faixa,
    quantidade,
    adicionais: escolhidos,

    precoServico,            // a diária, como se não houvesse adicional nenhum
    tempoExtra,              // o salto de faixa provocado pelos adicionais
    mudouDeFaixa: tempoExtra > 0,
    precoAdicionais,
    precoBase: precoServico + tempoExtra,   // nome antigo, mantido por compatibilidade
    total,

    repasseUnitario: Math.round(repasseUnit * 100) / 100,
    repasseTotal:    Math.round(repasseTotal * 100) / 100,
    margem:          Math.round((total - repasseTotal) * 100) / 100,
    acimaDoMaximo,
    sugereDuas: acimaDoMaximo && categoria.aceitaDuasProfissionais && quantidade === 1,
  };
}


/* O que acontece com a duração se este adicional for marcado (ou desmarcado).
   É isto que permite avisar no próprio item — "este muda o serviço para 6h" —
   antes de o cliente clicar, e apontar o responsável depois que ele clicou. */
function impactoDoAdicional(pedido, idDoAdicional){
  const agora = calcularPedido(pedido);
  if(!agora) return null;

  const marcado = (pedido.adicionais || []).indexOf(idDoAdicional) >= 0;
  const outros  = marcado
    ? (pedido.adicionais || []).filter(x => x !== idDoAdicional)
    : (pedido.adicionais || []).concat([idDoAdicional]);

  const alternativo = calcularPedido(Object.assign({}, pedido, { adicionais: outros }));
  if(!alternativo || alternativo.horas === agora.horas) return null;

  return {
    marcado,
    horasAgora: agora.horas,
    horasSe: alternativo.horas,
    /* quanto do preço é só o salto de faixa, sem contar o preço do adicional */
    diferenca: Math.abs(agora.faixa.clientePaga - alternativo.faixa.clientePaga) * agora.quantidade,
  };
}


/* --------------------------------------------------------------------------
   7. PERÍODOS DO DIA
   -------------------------------------------------------------------------- */
const PERIODOS = [
  { id:"manha", nome:"Manhã",  faixa:"8h às 12h",  inicio:8  },
  { id:"tarde", nome:"Tarde",  faixa:"12h às 16h", inicio:12 },
  { id:"noite", nome:"Noite",  faixa:"16h às 20h", inicio:16 },
];
