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
/* A TABELA (decisão R15, aprovada em 21/08/2026)

   As "horas" são a JANELA DE PRESENÇA, não horas de trabalho — ver R9.

   | Janela | Cliente | Ela recebe | Margem | R$/h dela |
   |    4h  | R$ 160  |  R$ 110    |  31%   |  R$ 27,50 |
   |    6h  | R$ 205  |  R$ 150    |  27%   |  R$ 25,00 |
   |    8h  | R$ 270  |  R$ 200    |  26%   |  R$ 25,00 |

   Piso de R$ 25/h para ela em qualquer duração. Isso mata o incentivo
   perverso da tabela antiga, onde ela ganhava R$ 27,50/h numa diária de 4h
   e R$ 18,75/h numa de 8h — e ia perceber.

   Somos mais caros que a Mary Help para o cliente (R$ 160 contra R$ 131 na
   faixa de 4h) e pagamos bem melhor para ela (R$ 110 contra R$ 71). É
   proposital: sem oferta de profissional não existe plataforma. As
   garantias justificam o preço maior.

   A faixa de 2h foi adiada: dava margem líquida negativa no volume de
   lançamento, e o deslocamento pesa demais num serviço curto. */
const FAIXAS_DE_PRECO = [
  { horas: 4, clientePaga: 160, profissionalRecebe: 110 },
  { horas: 6, clientePaga: 205, profissionalRecebe: 150 },
  { horas: 8, clientePaga: 270, profissionalRecebe: 200 },
];

/* DESLOCAMENTO (decisão R16)

   Não sai do bolso da plataforma: é cobrado do cliente como linha separada
   e repassado INTEGRALMENTE a ela. Foi o que evitou a reclamação que
   aparece na concorrência — lá o cliente paga condução e a diarista diz
   que não recebe.

   E o raio pequeno resolve de graça o que o subsídio resolveria caro. */
const DESLOCAMENTO = {
  raioMaximoKm: 7,      // acima disso a plataforma nem oferece o serviço
  gratisAteKm: 5,
  valor: 10,            // vai 100% para ela
};

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
  { id:"passar",    nome:"Passar roupas",              icone:"ferro", preco:40, minutos:60,
    detalhe:"Até uma cesta de roupas" },
  { id:"geladeira", nome:"Interior da geladeira",      icone:"geladeira", preco:25, minutos:30,
    detalhe:"Limpeza interna completa" },
  { id:"armarios",  nome:"Interior dos armários",      icone:"armario", preco:30, minutos:45,
    detalhe:"Armários da cozinha" },
  { id:"janelas",   nome:"Interior das janelas",       icone:"janela", preco:35, minutos:45,
    detalhe:"Somente parte interna, por segurança" },
  { id:"externa",   nome:"Área externa",               icone:"planta", preco:30, minutos:45,
    detalhe:"Quintal ou varanda, até 20m²" },
  { id:"estofado",  nome:"Aspirar tapete ou estofado", icone:"sofa", preco:20, minutos:30,
    detalhe:"Um sofá ou um tapete" },
  { id:"lavar",     nome:"Lavar roupas",               icone:"maquina", preco:30, minutos:45,
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
    icone:"vassoura",
    cor:"#6C3AD8",
    disponivel:true,
    aceitaAdicionais:true,
    aceitaDuasProfissionais:true,
    comoChamamos:"diarista",     // usado nos textos das telas
    comoChamamosPlural:"diaristas",

    perguntas:[
      { id:"tipo", tipo:"opcao", rotulo:"Tipo de limpeza", opcoes:[
        { id:"padrao",   nome:"Padrão",   detalhe:"Limpeza do dia a dia",    icone:"pano" },
        { id:"completa", nome:"Completa", detalhe:"Limpeza mais detalhada",  icone:"brilho" },
      ]},
      /* vemDaCasa: estas duas são preenchidas pelo cadastro da casa e não
         aparecem em toda compra. O cliente só as vê se tocar em
         "ajustar só desta vez". */
      { id:"comodos",   tipo:"contador", rotulo:"Número de cômodos", min:1, max:12, inicial:3,
        vemDaCasa:true, ajuda:"Conte quartos, sala, cozinha e área de serviço." },
      { id:"banheiros", tipo:"contador", rotulo:"Banheiros", min:0, max:6, inicial:1,
        vemDaCasa:true },
      { id:"observacoes", tipo:"texto", rotulo:"Observações (opcional)",
        exemplo:"Ex.: tenho um cachorro, o portão é o do lado direito..." },
    ],

    /* Quanto tempo o serviço deve levar, em minutos.
       >>> Esta fórmula foi criada por mim. O material original não definia
           como o número de cômodos vira duração. Precisa da sua revisão. */
    /* RECALIBRADO em 21/08/2026 (decisão R15).

       A "completa" assumia ser 50% mais lenta que a padrão. Uma simulação de
       10.752 combinações mostrou o estrago: 69,8% de TODAS as combinações
       passavam de 8 horas e travavam, e um apartamento comum de 3 quartos
       com 2 banheiros já ia para a faixa de 8h.

       Passou para 25% mais lenta. Nas casas típicas, os travamentos caíram
       de 14,7% para 2,6%, e aquele apartamento voltou para 6h.

       A "padrão" não mudou: ela bate com a referência de mercado (até 40m²
       = 4h, até 70m² = 6h). */
    estimarMinutos: function(r){
      const base        = (r.tipo === "completa") ? 75 : 60;
      const porComodo   = (r.tipo === "completa") ? 38 : 30;
      const porBanheiro = (r.tipo === "completa") ? 38 : 30;
      return base + (r.comodos * porComodo) + (r.banheiros * porBanheiro);
    },
  },

  {
    id:"faxina-pesada",
    nome:"Faxina pesada",
    descricao:"Limpeza completa e pesada",
    icone:"spray",
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
      { id:"comodos",   tipo:"contador", rotulo:"Número de cômodos", min:1, max:12, inicial:3, vemDaCasa:true },
      { id:"banheiros", tipo:"contador", rotulo:"Banheiros", min:0, max:6, inicial:1, vemDaCasa:true },
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
    icone:"camisa",
    cor:"#DB2777",
    disponivel:true,
    aceitaAdicionais:false,
    aceitaDuasProfissionais:false,
    comoChamamos:"passadeira",
    comoChamamosPlural:"passadeiras",

    /* Repare: esta categoria NÃO pergunta cômodos nem banheiros.
       As perguntas são outras — e as telas se adaptam sozinhas.
       É esta a prova de que a estrutura não é exclusiva de limpeza. */
    /* VENDIDA POR JANELA, não por peça (decisão R15).

       A versão antiga perguntava quantos cestos e tentava estimar quantas
       peças cabem em quantas horas. Ninguém sabe isso com precisão — nem
       quem passa roupa. E a estimativa errada vira briga sobre a roupa que
       sobrou.

       Agora o cliente compra a janela direto, com uma referência
       aproximada. O escopo passa a ser o TEMPO, que é o que a plataforma
       consegue garantir. É a mesma lógica da janela de presença (R9). */
    perguntas:[
      { id:"janela", tipo:"opcao", rotulo:"Quanto tempo você precisa?", opcoes:[
        { id:"4", nome:"4 horas", detalhe:"Dá para cerca de um cesto e meio", icone:"camisa" },
        { id:"6", nome:"6 horas", detalhe:"Dá para cerca de dois cestos e meio", icone:"camisa" },
      ]},
      { id:"observacoes", tipo:"texto", rotulo:"Observações (opcional)",
        exemplo:"Ex.: as camisas sociais precisam de goma." },
    ],

    estimarMinutos: function(r){
      /* devolve exatamente o trabalho que cabe na janela escolhida, para a
         faixa cair certinho nela */
      return trabalhoQueCabeNaJanela(Number(r.janela) || 4);
    },
  },

  /* Espaço reservado — mostra ao cliente e ao time de TI que a plataforma
     nasce preparada para outras profissões. */
  {
    id:"outros",
    nome:"Outros serviços",
    descricao:"Eletricista, encanador, montador e mais",
    icone:"ferramenta",
    cor:"#0891B2",
    disponivel:false,
    emBreve:"Estamos preparando novas categorias. Comece pela limpeza que o resto vem logo.",
  },
];


/* --------------------------------------------------------------------------
   4. PROFISSIONAIS FICTÍCIAS
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
   5. CONTA FICTÍCIA DO CLIENTE
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


/* ==========================================================================
   6. O MOTOR DE PREÇO
   Recebe o que o cliente pediu e devolve duração, preço e repasse.
   Uma função só, usada por todas as telas — assim o valor nunca diverge
   entre a tela de resumo, a de pagamento e a notificação da profissional.
   ========================================================================== */
/* Acha em qual faixa de duração um serviço cai.
   Devolve também se estourou o teto de 8 horas por pessoa. */
function faixaPara(minutosPorPessoa){
  /* procura a menor janela em que o trabalho CABE, já descontada a pausa */
  const achou = FAIXAS_DE_PRECO.find(f => minutosPorPessoa <= trabalhoQueCabeNaJanela(f.horas));
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

    /* --- O TETO LEGAL (ver decisão R8 no DECISOES.md) --- */

    /* Quanto trabalho sobra para cada uma, de verdade, sem o teto. */
    horasPorPessoa: Math.round((minutos / quantidade / 60) * 10) / 10,

    /* Passou das 8 horas por pessoa. Não é "atenção ao tempo": é serviço
       que a plataforma NÃO PODE vender assim. */
    acimaDoMaximo,

    /* Trava: com este pedido do jeito que está, ninguém pode continuar.
       As saídas são duas profissionais ou dividir em dois dias. */
    bloqueadoPorLimiteLegal: acimaDoMaximo,

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
   6B. AS CASAS DO CLIENTE (decisão R10)

   A casa é cadastrada uma vez e reaproveitada. Ela guarda o TAMANHO e o
   ENDEREÇO — nunca o serviço. Tipo de limpeza e adicionais mudam a cada
   pedido: hoje padrão, no mês que vem completa. Se a casa guardasse isso, o
   cliente teria que desconfigurar toda vez.
   -------------------------------------------------------------------------- */
const TIPOS_DE_IMOVEL = [
  { id:"apartamento", nome:"Apartamento", icone:"predio" },
  { id:"casa",        nome:"Casa",        icone:"casa" },
  { id:"escritorio",  nome:"Escritório",  icone:"maleta" },
];


/* --------------------------------------------------------------------------
   7. PERÍODOS DO DIA E OS PRAZOS DE AGENDAMENTO
   -------------------------------------------------------------------------- */

/* Quanto tempo precisa faltar para um período começar, para ele ainda poder
   ser pedido. Ninguém consegue diarista para hoje às 20h.

   A conta que deu esse número:
     até 30 min  a busca encontrar alguém (régua R1)
     ~30 min     ela confirmar e se organizar
     30 a 60 min o deslocamento
     ~30 min     margem para imprevisto
   Dá umas 2h30. Arredondado para 3h.

   Com muita oferta dá para baixar para 2 e ganhar pedido de última hora;
   com pouca oferta, 4 protege contra frustração. No aplicativo real isto
   vira configuração no dashboard. */
const ANTECEDENCIA_MINIMA_HORAS = 3;

/* A PAUSA DENTRO DA JANELA (ver decisão R9)

   A plataforma não vende "8 horas de trabalho": vende uma JANELA DE
   PRESENÇA com um escopo combinado. "Maria estará na sua casa das 8h às
   16h para fazer estes cômodos."

   Dentro da janela quem administra o tempo é ela — inclusive a pausa. A
   plataforma não manda na autônoma: mandar seria subordinação, que é
   justamente o que caracteriza vínculo empregatício.

   Mas a pausa existe, e ocupa a janela. Por isso o trabalho que cabe numa
   janela é menor que a janela:

     janela de 4h  ->  15 min de pausa  ->  cabem 3h45 de trabalho
     janela de 6h  ->  15 min de pausa  ->  cabem 5h45 de trabalho
     janela de 8h  ->  1 hora de pausa  ->  cabem 7h de trabalho

   Sem isto, o app vendia janela de 8h para 8h de trabalho — e o serviço
   não terminava. */
const PAUSA_NA_JANELA = { 4: 15, 6: 15, 8: 60 };

function trabalhoQueCabeNaJanela(horasDaJanela){
  return horasDaJanela * 60 - (PAUSA_NA_JANELA[horasDaJanela] || 0);
}

/* Até quantos dias para frente o cliente pode agendar.

   Quinze, não sessenta. Ninguém sabe a agenda de dois meses — nem ela. E,
   pior: um pedido marcado para daqui a 60 dias trava a agenda dela por dois
   meses inteiros, com alta chance de furar. */
const DIAS_PARA_ESCOLHER = 15;

/* ==========================================================================
   DISPONIBILIDADE, ALERTA E AGENDA (decisão R22, 22/08/2026)

   O produto inteiro depende disto: o cliente pede, e quem está disponível
   perto recebe um alerta. Sem alerta que funcione, a plataforma vira um
   catálogo — que é exatamente o que ela não quer ser.
   ========================================================================== */

const DISPONIBILIDADE = {
  /* 3 MINUTOS para responder ao alerta.

     A primeira proposta era 90 segundos. O dono corrigiu, com razão: ela
     pode estar dentro de um serviço, no ônibus, com a mão molhada. Perder
     por um minuto e meio é frustração à toa.

     E cabe: a régua prometida ao cliente avisa aos 15 minutos e desiste aos
     30. Com ondas de 3 minutos são 5 ondas antes do aviso e 10 antes do
     limite — porque cada onda alerta VÁRIAS profissionais ao mesmo tempo,
     não uma de cada vez. */
  alertaExpiraEmSegundos: 180,

  /* Depois de 3 alertas ignorados SEGUIDOS, o app pergunta se ela ainda
     está disponível. Sem resposta, desliga sozinho.

     Isto NÃO É PUNIÇÃO, e as três regras abaixo existem para nunca virar:
       1. recusar NÃO conta como ignorado — recusar é resposta, e resposta
          boa, porque libera a onda na hora;
       2. qualquer sinal de vida zera a conta (aceitar, recusar, abrir o app);
       3. desligar assim NÃO mexe na posição dela na fila. Se mexesse, seria
          punição escondida — pior que punição assumida.

     A razão de existir não é cobrar dela: é que enquanto ela figura como
     disponível e não responde, o cliente espera à toa e as ondas se gastam. */
  alertasIgnoradosAtePerguntar: 3,

  /* 5 minutos para responder à pergunta — mais que os 3 do alerta normal,
     porque aqui não tem cliente esperando do outro lado. */
  segundosParaResponderAPergunta: 300,
};

/* As ondas: quem recebe o alerta, e quando. O raio cresce junto com a
   régua da busca que o cliente vê (REGUA_DA_BUSCA, em telas-cliente.js). */
const ONDAS = [
  { onda: 1, comecaAos:  0, raioKm: 3 },
  { onda: 2, comecaAos:  3, raioKm: 5 },
  { onda: 3, comecaAos:  6, raioKm: DESLOCAMENTO.raioMaximoKm },
  { onda: 4, comecaAos:  9, raioKm: DESLOCAMENTO.raioMaximoKm },
  { onda: 5, comecaAos: 12, raioKm: DESLOCAMENTO.raioMaximoKm },
];

const AGENDA = {
  /* 1 hora entre um serviço e outro.

     Não basta comparar relógio: um serviço que termina às 16h na Vila
     Madalena e outro que começa às 16h30 em Guarulhos não se sobrepõem e
     mesmo assim são impossíveis. O deslocamento faz parte da agenda.

     Fixo em 1 hora no protótipo. O raio de 7 km segura isso. Quando virar
     cálculo por distância, muda só este número por uma função. */
  folgaEntreServicosMinutos: 60,

  /* O teto legal (LC 150/2015) já vale por serviço. Aqui ele vale pelo DIA:
     duas janelas de 4h somam 8h e cabem; 4h + 6h não cabem. */
  tetoDeHorasPorDia: 8,
};

/* A janela ocupada por um serviço é a contratada MAIS a folga.
   Devolve em minutos desde a meia-noite, que é mais fácil de comparar. */
function janelaOcupada(servico){
  return {
    data: servico.data,
    de:  servico.inicio * 60,
    ate: servico.fim * 60 + AGENDA.folgaEntreServicosMinutos,
  };
}

/* Este serviço cabe na agenda dela? Devolve o motivo quando não cabe —
   sem motivo, a tela só sabe dizer "não", e "não" sem motivo parece defeito. */
function cabeNaAgenda(candidato, agenda){
  agenda = agenda || [];
  const doDia = agenda.filter(function(s){ return s.data === candidato.data; });

  /* 1. bate de frente com algum serviço já aceito? */
  const meuDe  = candidato.inicio * 60;
  const meuAte = candidato.fim * 60 + AGENDA.folgaEntreServicosMinutos;
  for(let i = 0; i < doDia.length; i++){
    const o = janelaOcupada(doDia[i]);
    if(meuDe < o.ate && o.de < meuAte){
      return { cabe:false, motivo:"você já tem serviço das " + doDia[i].inicio
                              + "h às " + doDia[i].fim + "h nesse dia" };
    }
  }

  /* 2. estoura as 8 horas do dia? */
  let horas = candidato.fim - candidato.inicio;
  doDia.forEach(function(s){ horas += (s.fim - s.inicio); });
  if(horas > AGENDA.tetoDeHorasPorDia){
    return { cabe:false, motivo:"passaria de " + AGENDA.tetoDeHorasPorDia
                              + " horas de trabalho nesse dia" };
  }

  return { cabe:true, motivo:"" };
}

const PERIODOS = [
  { id:"manha", nome:"Manhã",  faixa:"8h às 12h",  inicio:8  },
  { id:"tarde", nome:"Tarde",  faixa:"12h às 16h", inicio:12 },
  { id:"noite", nome:"Noite",  faixa:"16h às 20h", inicio:16 },
];
