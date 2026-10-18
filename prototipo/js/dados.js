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


/* O NOME DO APP, num lugar só (R36: o nome ainda não foi escolhido, e
   "Limpah" é provisório). Os textos novos que dizem o nome (o cartão de
   instalar o app) leem daqui. O servidor tem o dele (app/limpah/marca.py:
   o manifest e o título do app instalado), e um teste confere que os dois
   são iguais. Trocar o nome = trocar nos dois. O ícone não tem o nome. */
const NOME_DO_APP = "Limpah";


/* --------------------------------------------------------------------------
   1. TABELA DE PREÇOS  (documento, seção 11)
   -------------------------------------------------------------------------- */
/* A TABELA (decisão R15, aprovada em 21/08/2026).

   As "horas" são a JANELA DE PRESENÇA, não horas de trabalho — ver R9.
   Piso de R$ 25/h para ela em qualquer duração.

   O porquê de cada valor está no DECISOES.md, R15 — e só lá, de propósito:
   este arquivo é público (vai para o link da maquete e para o celular de
   quem usa o app). */
const FAIXAS_DE_PRECO = [
  { horas: 4, clientePaga: 160, profissionalRecebe: 110 },
  { horas: 6, clientePaga: 205, profissionalRecebe: 150 },
  { horas: 8, clientePaga: 270, profissionalRecebe: 200 },
];

/* O RAIO E O TRANSPORTE (decisão R16, REVISTA pelo dono em 12/10/2026)

   A diarista é autônoma e o transporte é por conta dela. O cliente NÃO paga
   taxa de deslocamento, e nada é descontado dela: o valor que ela vê é a
   tabela R15 + a parte dela nos adicionais (A2) — exatamente o que recebe.
   Ela vê bairro e distância ANTES de aceitar, e decide.

   Quem segura o trajeto é o raio, e as ondas do alerta (ONDAS, R22)
   chamam primeiro quem está mais perto (o porquê: DECISOES.md, R16).
   O raio é de 15 km desde a R33 (14/10/2026: a cidade de São Paulo
   inteira, sem trava de cobertura; o número é PROVISÓRIO). Era 7 km.
   É o único lugar do número na maquete; o servidor tem o seu
   (RAIO_MAXIMO_KM, app/limpah/regras.py) e um teste compara os dois.

   Só o raio manda. `gratisAteKm` e `valor` ficam aqui, neutros, apenas
   porque o teste cruzado do app de verdade (app/testes/motor_js.js) lê este
   objeto: sumir com eles derrubaria aquele teste com um erro, em vez de
   mostrar a diferença. O servidor já segue a R16 revista; as constantes
   neutras saem dos dois lados juntas, com o teste cruzado (DECISOES, R16). */
const DESLOCAMENTO = {
  raioMaximoKm: 15,     // acima disso a plataforma nem oferece o serviço (R33)
  gratisAteKm: 15,      // sem taxa em TODO o raio
  valor: 0,             // nem o cliente paga, nem ela recebe à parte
};

/* Quanto do valor de um ADICIONAL vai para a profissional: 0.65 = 65%.
   Provisório, esperando o dono (DECISOES.md, A2). */
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
      /* ehAJanela: a resposta É a janela. Do lado dela a janela aparece como
         horário ("das 8h às 12h"), nunca como "4 horas" (R9) — o detalhe do
         serviço pula esta pergunta (A18). */
      { id:"janela", tipo:"opcao", ehAJanela:true, rotulo:"Quanto tempo você precisa?", opcoes:[
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


/* As profissionais e a conta do cliente, todas fictícias, moram em
   exemplos.js: ele só é carregado na maquete. */


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
  /* O total repassado é o que SAI de verdade: cada uma recebe o valor dela
     já arredondado, vezes quantas são. Arredondar só a soma dava 1 centavo a
     menos que 2 × o de cada uma, em pedidos de duas com adicional ímpar — e
     a margem anotada ficava 1 centavo acima da real (12/10/2026). */
  const repasseUnitArredondado = Math.round(repasseUnit * 100) / 100;
  const repasseTotal = repasseUnitArredondado * quantidade;

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

    repasseUnitario: repasseUnitArredondado,
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
   6A. O QUE ELA RECEBE, LINHA POR LINHA (decisão R26, 12/10/2026)

   Uma conta só, usada pelo cartão da oportunidade, pela agenda, pelos ganhos
   e pelo extrato. Se cada tela somasse do seu jeito, um dia o cartão diria
   R$ 120 e o extrato R$ 110 — e ela ia achar que está sendo roubada.

   As duas parcelas, cada uma com a sua regra:
     - a diária, pela tabela R15 (4h R$ 110 · 6h R$ 150 · 8h R$ 200);
     - a parte dela em cada adicional (REPASSE_DO_ADICIONAL, decisão A2).

   E SÓ essas duas. Desde a R16 revista (12/10/2026) não existe parcela de
   deslocamento: o transporte é por conta dela, e a distância não muda o
   valor. Antes, somava R$ 10 entre 5 e 7 km que o cliente nunca pagava.

   E nenhuma parcela negativa: aqui não existe mensalidade nem desconto pelo
   uso do app (antipadrões, Bloco 7 do TELAS.md).
   -------------------------------------------------------------------------- */

/* Sempre zero desde a R16 revista. Nenhuma tela usa: existe só porque o
   teste cruzado do app/ a chama (ver DESLOCAMENTO). */
function taxaDeDeslocamento(km){
  return 0;
}

function extratoDoServico(pedido, km){
  const conta = calcularPedido(pedido);
  if(!conta) return null;

  const centavos = function(v){ return Math.round(v * 100) / 100; };

  const adicionais = conta.adicionais.map(function(a){
    return {
      id: a.id,
      nome: a.nome,
      dela: centavos(a.preco * REPASSE_DO_ADICIONAL / conta.quantidade),
    };
  });

  /* O TOTAL sai do MESMO arredondamento do motor do cliente
     (repasseUnitario), nunca da soma das linhas arredondadas uma a uma.
     Com duas profissionais, cada adicional é dividido por dois, e
     arredondar linha por linha dava 1 centavo a mais que o motor em 32
     combinações (geladeira + janelas: R$ 129,51 aqui, R$ 129,50 lá). Um
     lado prometeria o que o outro não paga.

     Então: o total é o do motor, e o centavo que sobrar ou faltar vai para
     a ÚLTIMA linha de adicional — assim as linhas da tela continuam fechando
     a soma. Com uma profissional não sobra centavo nenhum. */
  const somaDoMotor = centavos(conta.repasseUnitario - conta.faixa.profissionalRecebe);
  let somaDasLinhas = 0;
  adicionais.forEach(function(a){ somaDasLinhas += a.dela; });
  const sobra = centavos(somaDoMotor - somaDasLinhas);
  if(adicionais.length && sobra !== 0){
    const ultima = adicionais[adicionais.length - 1];
    ultima.dela = centavos(ultima.dela + sobra);
  }

  return {
    horas: conta.horas,                         // o tamanho da janela, para achar a faixa
    diaria: conta.faixa.profissionalRecebe,     // por pessoa, da tabela R15
    adicionais: adicionais,
    /* sempre zero (R16 revista); fica pelo teste cruzado do app/, que lê
       este campo. Nenhuma tela mostra. */
    deslocamento: 0,
    /* o que ela vê é o que ela recebe: o mesmo número do motor do cliente */
    total: centavos(conta.repasseUnitario),
  };
}

/* `km` não muda mais o valor (R16 revista). Fica na assinatura — aqui e
   no extratoDoServico — porque as telas e o teste cruzado do app/ já
   passam a distância. */
function quantoElaRecebe(pedido, km){
  const x = extratoDoServico(pedido, km);
  return x ? x.total : 0;
}

/* QUANDO O DINHEIRO CAI PARA ELA — escolha PROVISÓRIA (A7, 12/10/2026)

   O dinheiro fica retido até o serviço terminar (R12) e cai no Pix dela
   (Portão 3, R18). O prazo depois disso ninguém tinha decidido: escolhi
   ATÉ 1 DIA ÚTIL depois de concluído. Sábado e domingo não contam; feriado
   ainda não é tratado — no app real isso vem do calendário do banco. */
const REPASSE_PARA_ELA = {
  diasUteisDepoisDeConcluir: 1,
};

/* "2026-10-09" (uma sexta) -> "2026-10-12" (a segunda seguinte) */
function dataDoRepasse(isoConcluido){
  const p = String(isoConcluido || "").split("-");
  const d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  let faltam = REPASSE_PARA_ELA.diasUteisDepoisDeConcluir;
  while(faltam > 0){
    d.setDate(d.getDate() + 1);
    if(d.getDay() !== 0 && d.getDay() !== 6) faltam--;
  }
  return isoDoDia(d);
}

/* A data no fuso de quem está usando — toISOString() devolveria a data de
   Greenwich, que à noite no Brasil já é o dia seguinte. */
function isoDoDia(d){
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0")
       + "-" + String(d.getDate()).padStart(2, "0");
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

  /* Quanto o protótipo espera antes de fazer o primeiro pedido aparecer.
     É encenação: no app real quem manda o alerta é o servidor, quando um
     cliente pede de verdade. */
  demoraDoPrimeiroAlertaMs: 4000,

  /* O som REPETE, não toca uma vez.

     O dono comparou com Uber e iFood e apontou o óbvio: um bip único se
     perde. Ela pode estar com o celular no bolso, com a mão molhada, dentro
     de outro serviço. Se o som não insiste, o alerta não serve.

     8 SEGUNDOS — escolha do dono, em 22/08/2026, e a conta dele:
     a cada 3 segundos seriam 60 toques em 3 minutos, e viraria tortura;
     ela desliga o aplicativo e não volta. Uber e iFood ficam entre 5 e 10.
     8 dá 22 toques: insiste de verdade sem passar do ponto.

     E para no primeiro toque dela, aceitando ou recusando. */
  repeteOSomACadaSegundos: 8,

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
   régua da busca que o cliente vê (REGUA_DA_BUSCA, em telas-cliente.js).
   Quem está mais perto é chamada primeiro — e isso pesa mais desde a R16
   revista (12/10/2026): o transporte é por conta dela, então perto é
   dinheiro no bolso dela.

   Estendidas pela R33 (14/10/2026, PROVISÓRIO): 3, 5, 7, 10 e 15 km. Dos
   12 minutos até os 30 da régua o raio fica inteiro, e o alerta chama de
   novo quem ainda não respondeu ("as ondas se repetem"). */
const ONDAS = [
  { onda: 1, comecaAos:  0, raioKm: 3 },
  { onda: 2, comecaAos:  3, raioKm: 5 },
  { onda: 3, comecaAos:  6, raioKm: 7 },
  { onda: 4, comecaAos:  9, raioKm: 10 },
  { onda: 5, comecaAos: 12, raioKm: DESLOCAMENTO.raioMaximoKm },
];

/* O TEMPO ATÉ LÁ (R34, 17/10/2026). Ela não escolhe mais bairros: dá o CEP
   da casa dela, e as ondas acima passam a ser medidas a partir dele. O
   cartão da oportunidade diz, além do bairro e dos km, quanto tempo leva
   de ônibus ou metrô — SEMPRE como estimativa ("a cerca de 40 min"),
   nunca como promessa de horário.

   A conta é PROVISÓRIA (DECISOES, A39), até o Google calcular o trajeto de
   verdade no horário do serviço (R30): 15 minutos (andar até o ponto e
   esperar) + 4 minutos por km, arredondado PARA CIMA de 10 em 10.
   3 km → 30 min · 10 km → 1h · 15 km → 1h20.

   O servidor tem a mesma conta (minutos_ate_la, app/limpah/regras.py), e um
   teste compara as duas, como o preço. A conta é feita em DÉCIMOS inteiros,
   pela distância com uma casa decimal (como a tela mostra): assim o
   JavaScript e o Python nunca discordam por um "lixo" de ponto flutuante. */
const TEMPO_ATE_LA = {
  minutosFixos: 15,
  minutosPorKm: 4,
  arredondarEm: 10,
};

function minutosAteLa(km){
  const decimosDeKm = Math.round(Number(km) * 10);
  const decimosDeMinuto = TEMPO_ATE_LA.minutosFixos * 10 + TEMPO_ATE_LA.minutosPorKm * decimosDeKm;
  return Math.ceil(decimosDeMinuto / (TEMPO_ATE_LA.arredondarEm * 10)) * TEMPO_ATE_LA.arredondarEm;
}

/* 40 → "40 min" · 60 → "1h" · 80 → "1h20" */
function tempoAteLaEscrito(minutos){
  const m = Math.max(0, Math.round(Number(minutos) || 0));
  if(m < 60) return m + " min";
  const resto = m % 60;
  return Math.floor(m / 60) + "h" + (resto ? String(resto).padStart(2, "0") : "");
}

/* A frase inteira, a mesma no cartão, no detalhe e no alerta. */
function fraseDoTempoAteLa(minutos){
  return "a cerca de " + tempoAteLaEscrito(minutos) + " da sua casa, de ônibus ou metrô";
}

const AGENDA = {
  /* 1 hora entre um serviço e outro.

     Não basta comparar relógio: um serviço que termina às 16h na Vila
     Madalena e outro que começa às 16h30 em Guarulhos não se sobrepõem e
     mesmo assim são impossíveis. O deslocamento faz parte da agenda.

     Fixo em 1 hora no protótipo. O raio segurava isso com 7 km; com os
     15 km da R33, dois serviços do mesmo dia podem ficar mais longe um do
     outro (DECISOES, A33: a conferir com o dono). Quando virar cálculo por
     distância, muda só este número por uma função. */
  folgaEntreServicosMinutos: 60,

  /* O teto legal (LC 150/2015) já vale por serviço. Aqui ele vale pelo DIA:
     duas janelas de 4h somam 8h e cabem; 4h + 6h não cabem. */
  tetoDeHorasPorDia: 8,

  /* A MESMA profissional na MESMA casa: no máximo 2 dias por semana (R8 e
     regra de ouro 11). Três dias configura vínculo de emprego, com a conta
     caindo no cliente — é lei, não regra de produto.

     "Semana" = QUALQUER 7 dias seguidos, e não a semana do calendário:
     sexta, sábado e a segunda seguinte caem em semanas diferentes do
     calendário, mas são 3 dias na mesma casa em 4 dias. A janela que anda é
     a leitura mais protetora — escolha PROVISÓRIA (A15).

     Valia só para a recorrência (Bloco 6). Desde 12/10/2026 vale também para
     a diária avulsa: as oportunidades fictícias mudam de data todo dia com o
     mesmo endereço, e ela conseguia aceitar a mesma casa 3 dias seguidos. */
  diasNaMesmaCasaPorSemana: 2,
  diasDaSemana: 7,
};

/* Quantos dias de uma data ISO até a outra (b − a). Pelo relógio de
   Greenwich de propósito: com horário de verão, um dia de 23 horas viraria
   "zero dias" na conta local. */
function diasEntre(isoA, isoB){
  const a = String(isoA || "").split("-"), b = String(isoB || "").split("-");
  return Math.round((Date.UTC(+b[0], +b[1] - 1, +b[2]) - Date.UTC(+a[0], +a[1] - 1, +a[2]))
                    / 86400000);
}

/* A mesma casa? No protótipo a casa é o texto do endereço ("Rua dos Ipês,
   48"); no app real será o número da casa no cadastro do cliente. */
function mesmaCasa(a, b){
  const limpa = function(x){ return String(x || "").trim().toLowerCase().replace(/\s+/g, " "); };
  return limpa(a) !== "" && limpa(a) === limpa(b);
}

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
      return { cabe:false, regra:"horario", motivo:"você já tem serviço das " + doDia[i].inicio
                              + "h às " + doDia[i].fim + "h nesse dia" };
    }
  }

  /* 2. estoura as 8 horas do dia? */
  let horas = candidato.fim - candidato.inicio;
  doDia.forEach(function(s){ horas += (s.fim - s.inicio); });
  if(horas > AGENDA.tetoDeHorasPorDia){
    return { cabe:false, regra:"teto", motivo:"passaria de " + AGENDA.tetoDeHorasPorDia
                              + " horas de trabalho nesse dia" };
  }

  /* 3. seria o 3º dia na MESMA casa em 7 dias? (R8, regra de ouro 11, A15)

     Conta DIAS, não serviços: duas visitas no mesmo dia são um dia só. E
     conta também o que já passou — a semana de trabalho não zera porque o
     serviço terminou. Confere cada janela de 7 dias que contém a data nova:
     em nenhuma delas pode haver mais de 2 dias na casa. */
  if(candidato.endereco){
    const dias = [candidato.data];
    agenda.forEach(function(s){
      if(mesmaCasa(s.endereco, candidato.endereco) && dias.indexOf(s.data) < 0) dias.push(s.data);
    });
    const semana = AGENDA.diasDaSemana, maximo = AGENDA.diasNaMesmaCasaPorSemana;
    for(let comeca = -(semana - 1); comeca <= 0; comeca++){
      const naJanela = dias.filter(function(x){
        const n = diasEntre(candidato.data, x);
        return n >= comeca && n <= comeca + semana - 1;
      }).length;
      if(naJanela > maximo){
        return { cabe:false, regra:"casa", motivo:"seria o " + (maximo + 1) + "º dia na mesma casa em "
                                 + semana + " dias, e o máximo é " + maximo };
      }
    }
  }

  return { cabe:true, regra:"", motivo:"" };
}

/* QUANDO ELA VÊ A RUA E O NÚMERO — decisão do dono, 12/10/2026 (A13, que
   fecha a B2 e a Decisão D do TELAS.md)

   Antes do aceite: só bairro e distância (R18). Depois do aceite, a rua e o
   número aparecem na VÉSPERA do serviço, a partir das 18h. É segurança do
   cliente: quem aceita e desiste não leva o endereço da casa — é como os
   apps de entrega fazem. O trajeto ela já estima pelo bairro e pela
   distância.

   "Aceitou tarde" não é um caso à parte: quem aceita depois das 18h da
   véspera, ou no próprio dia, já está do lado de lá da linha e vê no aceite.
   Uma comparação só cobre os três.

   Horário de Brasília. Na maquete o relógio é o do celular dela — o mesmo
   que a agenda usa para as janelas. No app de verdade (pasta app/) o
   servidor roda em UTC: lá a conta tem que ser feita em America/Sao_Paulo,
   e quem decide é o SERVIDOR, que nem envia a rua antes da hora. Esconder
   só na tela vale aqui, onde nada é real.

   Lá, "a rua" é tudo o que aponta a casa: logradouro, número, complemento,
   CEP, latitude e longitude, e qualquer link de mapa. Nenhum deles sai do
   servidor antes da hora; a distância é calculada lá e vai só o número
   arredondado (quadro na A13). */
const HORA_DO_ENDERECO_NA_VESPERA = 18;

/* O instante em que a rua aparece: a véspera, às 18h. O dia − 1 vai para o
   próprio Date, que acerta a virada do mês e do ano sozinho. */
function momentoDoEndereco(servico){
  const p = String((servico && servico.data) || "").split("-");
  return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]) - 1,
                  HORA_DO_ENDERECO_NA_VESPERA, 0, 0);
}

/* A rua e o número deste serviço ACEITO já podem aparecer para ela?

   TODA tela pergunta aqui; nenhuma faz a conta sozinha (o mesmo espírito da
   R24). `agora` vem do relógio da agenda (relogioDaAgenda), para o teste 24
   poder adiantar a hora. Data que não dá para ler não libera: na dúvida,
   protege a casa. */
function enderecoLiberado(servico, agora){
  const quando = momentoDoEndereco(servico);
  if(isNaN(quando.getTime())) return false;
  return (agora || new Date()).getTime() >= quando.getTime();
}

/* A CONVERSA CLIENTE ↔ DIARISTA abre junto com a rua — decisão do dono,
   12/10/2026 (A18, item 2). É na conversa que se combina portão, interfone
   e apartamento: abrir antes seria entregar a rua por outro caminho. E quem
   aceita e desiste não leva o contato do cliente — a razão da A13.

   E FECHA no fim do dia do serviço, às 23h59 — PROVISÓRIO (A18-7). Depois
   disso o que sobra é reclamação, e reclamação é com o suporte.

   Vale para os DOIS lados: a tela do cliente e a dela perguntam aqui. No
   app de verdade quem decide é o servidor, no horário de Brasília. */
const ULTIMO_MINUTO_DA_CONVERSA = { hora:23, minuto:59 };

/* O instante em que ela abre: o mesmo da rua, sem conta própria. */
function momentoQueAConversaAbre(servico){ return momentoDoEndereco(servico); }

/* O instante em que ela fecha: o minuto seguinte às 23h59 do dia do serviço.
   Às 23h59 ainda dá para escrever; à meia-noite, não. */
function momentoQueAConversaFecha(servico){
  const p = String((servico && servico.data) || "").split("-");
  return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]),
                  ULTIMO_MINUTO_DA_CONVERSA.hora, ULTIMO_MINUTO_DA_CONVERSA.minuto + 1, 0);
}

/* "antes", "aberta" ou "fechada". Data que não dá para ler fica "antes":
   na dúvida, a conversa não abre — o mesmo cuidado da rua. */
function situacaoDaConversa(servico, agora){
  const abre = momentoQueAConversaAbre(servico), fecha = momentoQueAConversaFecha(servico);
  if(isNaN(abre.getTime()) || isNaN(fecha.getTime())) return "antes";
  const t = (agora || new Date()).getTime();
  if(t < abre.getTime()) return "antes";
  if(t >= fecha.getTime()) return "fechada";
  return "aberta";
}

function conversaLiberada(servico, agora){
  return situacaoDaConversa(servico, agora) === "aberta";
}


/* --------------------------------------------------------------------------
   O APP ESCONDE CONTATO ESCRITO — PROVISÓRIO (A18-8 e A18-9)

   Combinar por fora tira a proteção dos dois (pagamento guardado,
   suporte, verificação de quem entra na casa). Telefone, e-mail, link, @perfil e qualquer sequência
   de 8 dígitos ou mais (pega também CPF e cartão) viram TROCA_DE_CONTATO.

   Uma função só, de propósito: é a mesma que filtra a conversa e o recado
   do pedido (detalhesDoServico, no telas-diarista.js). No app de verdade
   ela roda no SERVIDOR, antes de guardar — a mensagem e o pedido.

   O que ela NÃO esconde, de propósito: horário (8h30, 8:30), dinheiro
   (R$ 150, R$ 1.500,00), apartamento (ap 52), interfone ("1201 e 1202"),
   data (13/10, 2026-10-13) e CEP com traço. Os limites estão no
   DECISOES.md (A18), com os casos que escapam.
   -------------------------------------------------------------------------- */
const TROCA_DE_CONTATO = "[contato escondido pelo app]";

/* Rede social escrita sem @ ("insta: carla_limpa", "me segue no insta
   carlalimpa"): a palavra que vem depois do nome da rede é o perfil — a
   não ser que seja uma palavra comum da frase ("vi no insta que...",
   "me chama no zap amanhã"). */
const REDES_SOCIAIS = ["insta", "instagram", "ig", "face", "facebook", "tiktok", "kwai", "telegram",
                       "zap", "zapzap", "whats", "whatsapp", "wpp", "twitter", "linkedin"];

/* O perfil escrito ANTES da rede ("carla.limpa no insta", "procura
   carlalimpa no instagram"). Aqui a palavra comum é a regra ("te chamo no
   zap", "postei no insta"): só vale como perfil o que tem cara de perfil
   (ponto, sublinhado ou número no meio de letras) ou o que vem logo depois
   de um pedido de busca. */
const PEDIDOS_DE_BUSCA = ("procura procure procurem pesquisa pesquise busca busque acha ache "
  + "encontra encontre segue siga sigam adiciona adicione add sou perfil conta usuario usuário "
  + "arroba").split(" ");

/* O e-mail dito pelo provedor ("meu gmail é carlalimpa", "hotmail:
   carla.limpa"). O "e-mail" genérico só com "é" ou dois-pontos depois:
   "o e-mail chegou" é frase, não endereço. */
const PROVEDORES_DE_EMAIL = ["gmail", "hotmail", "outlook", "yahoo", "icloud", "bol", "uol"];
const PALAVRAS_QUE_NAO_SAO_PERFIL = ("que quem qual como para pra pro por pelo pela com sem mas mais "
  + "tambem também tbm voce você vocês voces vcs ela ele elas eles dela dele meu minha seu sua "
  + "nosso nossa este esta esse essa isso isto aqui ali aí lá hoje amanhã amanha ontem agora "
  + "depois antes logo cedo tarde noite manhã sim não nao oi olá ola tudo bem então entao "
  + "quando onde porque pois nem ainda já só uma umas uns das dos nas nos foi ser ter tem tá "
  + "está estou mesmo mesma certo beleza dia hora horas fala falar manda mandar chama chamar "
  + "liga ligar segue seguir perfil conta número numero nome ver viu vi pode posso").split(" ");

/* Número dito por extenso, como se dita telefone: quantos dígitos vale. */
const NUMEROS_POR_EXTENSO = (function(){
  const um = ["zero","um","uma","dois","duas","tres","três","quatro","cinco","seis","meia",
              "sete","oito","nove"];
  const dois = ["dez","onze","doze","treze","catorze","quatorze","quinze","dezesseis",
                "dezasseis","dezessete","dezoito","dezenove","vinte","trinta","quarenta",
                "cinquenta","cinqüenta","sessenta","setenta","oitenta","noventa"];
  const tres = ["cem","cento","duzentos","trezentos","quatrocentos","quinhentos",
                "seiscentos","setecentos","oitocentos","novecentos"];
  const mapa = {};
  um.forEach(function(p){ mapa[p] = 1; });
  dois.forEach(function(p){ mapa[p] = 2; });
  tres.forEach(function(p){ mapa[p] = 3; });
  return mapa;
})();

const MINIMO_DE_DIGITOS_DE_UM_CONTATO = 8;

/* O NÚMERO DISFARÇADO. Antes de procurar contato, o texto passa por aqui:
   o emoji de tecla ("9️⃣8️⃣7️⃣") vira dígito comum, e também o dígito largo
   ("９８７"), o de outro alfabeto ("٩٨٧"), o circulado ("⑨") e o elevado
   ("⁹⁸⁷"); a letra larga ("ｇｍａｉｌ") vira letra comum. Sem isto o "\d"
   do filtro não via número nenhum, e "zap 9️⃣8️⃣7️⃣6️⃣5️⃣4️⃣3️⃣2️⃣1️⃣" passava
   inteiro (revisão de 12/10/2026). O texto guardado é o normalizado: para
   quem lê, é o mesmo número. Fica como está o "m²" e o "cm³": elevado logo
   depois de letra é unidade, não telefone. */
function normalizarDisfarces(texto){
  let t = String(texto == null ? "" : texto);
  /* a tecla: o dígito, o seletor de emoji (U+FE0F) e a moldura (U+20E3) */
  t = t.replace(/([0-9#*])️?⃣/g, "$1");
  /* as formas largas (U+FF01 a U+FF5E) e as letras e dígitos "matemáticos" */
  t = t.replace(/[！-～]|[\u{1D400}-\u{1D7FF}]/gu, function(c){ return c.normalize("NFKC"); });
  /* dígito de qualquer alfabeto: o Unicode guarda cada um num bloco de
     dez seguidos, do 0 ao 9 — o valor é a distância até o começo do bloco */
  t = t.replace(/\p{Nd}/gu, function(c){
    if(/[0-9]/.test(c)) return c;
    const cp = c.codePointAt(0);
    let zero = cp;
    while(zero > 0 && /\p{Nd}/u.test(String.fromCodePoint(zero - 1))) zero--;
    return String((cp - zero) % 10);
  });
  /* circulado, entre parênteses, elevado: o que o Unicode diz que é só número */
  t = t.replace(/(\p{L})?(\p{No})/gu, function(achado, letra, c){
    const n = c.normalize("NFKC");
    if(!/^\d+$/.test(n)) return achado;
    if(letra && /[¹²³]/.test(c)) return achado;      // m², cm³
    return (letra || "") + n;
  });
  return t;
}

/* "13/10" é data; "48/2" não é (não há dia 48): é o 48, apartamento 2.
   Só passa por data o que tem dia de 1 a 31 e mês de 1 a 12 — o filtro de
   contato e o aviso de mensagem perguntam aqui. */
function ehDataDeVerdade(trecho){
  const s = String(trecho || "").trim();
  const iso = s.match(/^\d{4}-(\d{1,2})-(\d{1,2})$/);
  const br = s.match(/^(\d{1,2})[\/.\-](\d{1,2})(?:[\/.\-]\d{2,4})?$/);
  const dia = iso ? Number(iso[2]) : (br ? Number(br[1]) : NaN);
  const mes = iso ? Number(iso[1]) : (br ? Number(br[2]) : NaN);
  return dia >= 1 && dia <= 31 && mes >= 1 && mes <= 12;
}

function esconderContatos(texto){
  let t = normalizarDisfarces(texto);
  let escondeu = false;
  function troca(re){
    t = t.replace(re, function(achado, antes){
      escondeu = true;
      /* o espaço de antes fica (o @perfil leva o espaço junto no padrão) */
      return (typeof antes === "string" && /^\s$/.test(antes) ? antes : "") + TROCA_DE_CONTATO;
    });
  }

  /* 1. e-mail, também ditado: "fulana arroba gmail ponto com". Vai o
     e-mail INTEIRO, o nome antes do @ também ("carla @gmail.com" deixava
     "carla @" à vista). O espaço vale dos dois lados do @ ("fulana @ gmail
     . com"), só depois, ou de nenhum; "(arroba)" com qualquer espaço. Com
     espaço só ANTES é @perfil ("segue @carla", logo abaixo) — a não ser
     que termine em .com, .br e parecidos ("carla @gmail.com"). */
  troca(/[A-Za-z0-9._%+\-]+(?:\s*(?:\(at\)|\[at\]|\(arroba\)|\[arroba\])\s*|\s+arroba\s+|\s+@\s+|@\s*)[A-Za-z0-9_\-]{2,}(?:\s*(?:\.|\bponto\b)\s*[A-Za-z]{2,})*/gi);
  troca(/[A-Za-z0-9._%+\-]+\s+@[A-Za-z0-9_\-]{2,}(?:\s*\.\s*(?:com|net|org|br|edu|gov|io|me|info))+\b/gi);

  /* 2. link: com http ou www; domínio conhecido; qualquer domínio com
     caminho (wa.me/…, bit.ly/…, linktr.ee/…); e o "ponto com" ditado */
  troca(/\b(?:https?:\/\/|www\.)[^\s]+/gi);
  troca(/\b[a-z0-9\-]+(?:\.[a-z0-9\-]+)*\.(?:com|net|org|info|site|online|app|shop|store|blog|page|bio|link)(?:\.br)?\b(?:\/[^\s]*)?/gi);
  troca(/\b[a-z0-9\-]+(?:\.[a-z0-9\-]+)*\.[a-z]{2,}\/[^\s]*/gi);
  /* "fulana ponto com" só no fim da frase: "chego às 8 em ponto com você"
     é horário, não site */
  t = t.replace(/\b([a-z0-9\-]+)\s+ponto\s+(?:com|net|org|br)(?:\s+ponto\s+br)?(?=\s*$|\s*[.,;!?)])/gi,
    function(achado, palavra){
      if(palavra.toLowerCase() === "em") return achado;
      escondeu = true;
      return TROCA_DE_CONTATO;
    });

  /* 3. @perfil de rede social — também com espaço depois do @ ("@ carla_limpa") */
  troca(/(^|\s)@\s?[A-Za-z0-9_.]{2,}/g);

  /* 4. telefone, em dígitos, por extenso ou misturado. Anda pelo texto
     juntando "pedaços de número" (dígitos ou palavras-número) separados só
     por espaço, ponto, traço, parêntese ou "+". Se a sequência somar 8
     dígitos ou mais, é contato. Dois-pontos e "h" cortam a sequência — é o
     que salva o horário. Os casos de fronteira:
       - vírgula com espaço só liga número DITADO ("zero onze, nove oito
         sete seis, ..."): entre dígitos ela separa uma lista ou o centavo;
       - "e" também só liga quando um dos lados é ditado ("oito e meia") ou
         tem 5 dígitos ou mais ("98765 e 4321"): "interfone 1201 e 1202"
         são dois apartamentos, não um telefone;
       - "+" só liga colado ("98765+4321"): com espaço ("160 + 40 + 25")
         é conta de somar;
       - barra liga dígitos ("98765/4321"), mas a DATA é separada antes
         (13/10, 13/10/2026, 2026-10-13) e nunca entra na conta — só data
         de verdade: "98/76/54/32/1" não tem dia 98 e é somado. */
  const datas = [];
  const reData = /\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b|\b\d{4}-\d{1,2}-\d{1,2}\b|\b\d{1,2}[.\-]\d{1,2}[.\-]\d{2,4}\b/g;
  let md;
  while((md = reData.exec(t)) !== null){
    if(ehDataDeVerdade(md[0])) datas.push([md.index, md.index + md[0].length]);
  }
  function dentroDeData(pos){
    return datas.some(function(d){ return pos >= d[0] && pos < d[1]; });
  }
  const pedacos = [];
  const re = /\d+|[A-Za-zÀ-ÿ]+/g;
  let m;
  while((m = re.exec(t)) !== null){
    const palavra = m[0];
    const ehDigito = /^\d+$/.test(palavra);
    /* número de data vale zero: corta a sequência em vez de somar */
    const vale = ehDigito ? (dentroDeData(m.index) ? 0 : palavra.length)
                          : (NUMEROS_POR_EXTENSO[palavra.toLowerCase()] || 0);
    pedacos.push({ de:m.index, ate:m.index + palavra.length, vale:vale, ehDigito:ehDigito,
                   ehE: palavra.toLowerCase() === "e" });
  }
  const trechos = [];
  let i = 0;
  while(i < pedacos.length){
    if(!pedacos[i].vale){ i++; continue; }
    let j = i, soma = pedacos[i].vale, fim = i;
    while(j + 1 < pedacos.length){
      const atual = pedacos[j], prox = pedacos[j + 1];
      const entre = t.slice(atual.ate, prox.de);
      const umDitado = !atual.ehDigito || !prox.ehDigito;
      const liga = (/^[\s.\-()+*_]{0,3}$/.test(entre) && !/\s\+|\+\s/.test(entre))
        || (umDitado && /^\s*,\s+$/.test(entre))
        || (atual.ehDigito && prox.ehDigito && /^\s*\/\s*$/.test(entre));
      if(!liga) break;
      if(prox.vale){ soma += prox.vale; j++; fim = j; continue; }
      /* "e" só liga dois números, e um deles ditado ("oito e meia") ou
         comprido demais para apartamento ("98765 e 4321") */
      const depois = pedacos[j + 2];
      if(prox.ehE && depois && depois.vale
         && (!atual.ehDigito || !depois.ehDigito || Math.max(atual.vale, depois.vale) >= 5)
         && /^[\s]{1,2}$/.test(t.slice(prox.ate, depois.de))){ j++; continue; }
      break;
    }
    if(soma >= MINIMO_DE_DIGITOS_DE_UM_CONTATO){
      let de = pedacos[i].de;
      const ate = pedacos[fim].ate;
      const corpo = t.slice(de, ate);
      /* o que tem cara de outra coisa fica: CEP com traço, data com ponto ou
         traço, e dinheiro (R$ antes) */
      const ehCep  = /^\d{5}-\d{3}$/.test(corpo);
      const ehData = /^\d{1,2}[.\-]\d{1,2}[.\-]\d{2,4}$/.test(corpo);
      const ehDinheiro = /R\$\s*$/i.test(t.slice(Math.max(0, de - 4), de));
      if(!ehCep && !ehData && !ehDinheiro){
        /* o "+55" e o "(" de antes vão junto, senão sobra um "(" solto */
        while(de > 0 && /[+(\s]/.test(t[de - 1]) && /[+(]/.test(t.slice(Math.max(0, de - 3), de))) de--;
        trechos.push({ de:de, ate:ate });
      }
    }
    i = fim + 1;
  }
  for(let k = trechos.length - 1; k >= 0; k--){
    t = t.slice(0, trechos[k].de).replace(/\s+$/, function(s){ return s ? " " : ""; })
      + TROCA_DE_CONTATO + t.slice(trechos[k].ate);
    escondeu = true;
  }

  /* 5. rede social sem @: "insta: carla_limpa", "no insta é carla.limpa".
     Depois do telefone de propósito: "zap 11 98765-4321" já virou aviso, e
     o "[" do aviso não é perfil. */
  const reRede = new RegExp("\\b(" + REDES_SOCIAIS.join("|") + ")(\\s*[:\\-]\\s*|\\s+(?:é|eh|e)\\s+|\\s+)"
                            + "([A-Za-zÀ-ÿ0-9_.]{3,})(?![A-Za-zÀ-ÿ0-9_])", "gi");
  t = t.replace(reRede, function(achado, rede, entre, perfil){
    const p = perfil.toLowerCase().replace(/[.]+$/, "");
    if(PALAVRAS_QUE_NAO_SAO_PERFIL.indexOf(p) >= 0 || REDES_SOCIAIS.indexOf(p) >= 0) return achado;
    escondeu = true;
    return rede + entre + TROCA_DE_CONTATO;
  });

  /* 6. o perfil ANTES da rede: "carla.limpa no insta", "procura
     carlalimpa no instagram" (PEDIDOS_DE_BUSCA, acima) */
  const reAntes = new RegExp("(^|[^A-Za-zÀ-ÿ0-9_.@\\]])([A-Za-zÀ-ÿ0-9_.]{3,})"
    + "(\\s+(?:n[oa]|d[oa]|pelo|pela|em)(?:\\s+(?:meu|minha))?\\s+(?:" + REDES_SOCIAIS.join("|") + ")\\b)", "gi");
  t = t.replace(reAntes, function(achado, antes, perfil, resto, pos, inteiro){
    const p = perfil.toLowerCase().replace(/[.]+$/, "");
    if(!/[a-zà-ÿ]/.test(p) || PALAVRAS_QUE_NAO_SAO_PERFIL.indexOf(p) >= 0 || REDES_SOCIAIS.indexOf(p) >= 0) return achado;
    const temCaraDePerfil = /[a-zà-ÿ][._0-9]|[._0-9][a-zà-ÿ]/.test(p);
    const anterior = (inteiro.slice(0, pos + antes.length).match(/([A-Za-zÀ-ÿ]+)\s*[:\-]?\s*$/) || [])[1];
    const pediuBusca = !!anterior && PEDIDOS_DE_BUSCA.indexOf(anterior.toLowerCase()) >= 0;
    if(!temCaraDePerfil && !pediuBusca) return achado;
    escondeu = true;
    return antes + TROCA_DE_CONTATO + resto;
  });

  /* 7. o e-mail dito pelo provedor: "meu gmail é carlalimpa" — sai o
     provedor junto, que sozinho já diz o que vinha depois */
  const reProvedor = new RegExp("\\b(?:" + PROVEDORES_DE_EMAIL.join("|") + ")(?:\\s*[:\\-]\\s*|\\s+(?:é|eh|e)\\s+|\\s+)"
    + "([A-Za-zÀ-ÿ0-9_.]{3,})(?![A-Za-zÀ-ÿ0-9_])", "gi");
  t = t.replace(reProvedor, function(achado, perfil){
    const p = perfil.toLowerCase().replace(/[.]+$/, "");
    if(PALAVRAS_QUE_NAO_SAO_PERFIL.indexOf(p) >= 0) return achado;
    escondeu = true;
    return TROCA_DE_CONTATO;
  });
  t = t.replace(/\b(e-?mail|email|imeio)(\s*:\s*|\s+(?:é|eh)\s+)([A-Za-zÀ-ÿ0-9_.]{3,})(?![A-Za-zÀ-ÿ0-9_])/gi,
    function(achado, palavra, entre, perfil){
      const p = perfil.toLowerCase().replace(/[.]+$/, "");
      if(PALAVRAS_QUE_NAO_SAO_PERFIL.indexOf(p) >= 0) return achado;
      escondeu = true;
      return palavra + entre + TROCA_DE_CONTATO;
    });

  /* dois avisos colados viram um só */
  const dobrado = new RegExp("(" + TROCA_DE_CONTATO.replace(/[[\]]/g, "\\$&") + "[\\s.,;:\\-]*){2,}", "g");
  t = t.replace(dobrado, TROCA_DE_CONTATO + " ").replace(/\s+$/, "");
  return { texto:t, escondeu:escondeu };
}

/* A explicação, uma vez por conversa, na primeira vez que algo é escondido. */
const EXPLICACAO_DO_CONTATO_ESCONDIDO =
  "🔒 O app esconde telefone, e-mail e link nas conversas. Combinar por fora "
  + "tira a proteção de vocês dois: o pagamento guardado, o suporte e a "
  + "verificação de quem entra na casa. Para combinar portão, interfone ou "
  + "chegada, é só escrever por aqui.";


/* --------------------------------------------------------------------------
   O AVISO DE MENSAGEM — quando quem recebe não está na conversa (A18-10)

   No app de verdade ele chega no WhatsApp (R27), e o WhatsApp aparece na
   tela bloqueada: é conteúdo público, como a notificação do alerta
   (ESPEC-ALERTA.md, seção 2). Por isso leva SÓ o primeiro nome com a
   inicial e o texto já filtrado — e o texto só vai quando, com certeza,
   não aponta a casa.

   Antes o aviso tentava APAGAR o endereço do meio do texto, e deixava
   passar o jeito comum de escrever: "R. Cel. Oscar Freire, 1200" virava
   "[endereço]. Oscar Freire, 1200"; "É na Ipês 48", "Casa 48", "apto 32
   bloco B" passavam inteiros. Apagar pedaço é uma corrida que o filtro
   perde. Agora é o contrário: se o texto tiver número de 2 dígitos ou mais
   (que não seja hora, dinheiro, duração ou data), palavra de endereço
   (rua, av., apto, bloco, casa 2, complemento, condomínio...), o número da
   casa ou uma palavra do nome da rua deste serviço, o aviso vai SEM o
   texto: "Carla M. mandou mensagem. Abra o app para ler." Esconder demais
   num aviso não faz mal; esconder de menos faz.
   -------------------------------------------------------------------------- */
const TAMANHO_MAXIMO_DO_AVISO = 100;
const AVISO_SEM_O_TEXTO = "Abra o app para ler.";

/* As contas abaixo são feitas sem acento e em minúscula: "Ipês" e "ipes"
   são a mesma rua. */
function semAcento(texto){
  return String(texto == null ? "" : texto).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/* O que denuncia endereço, mesmo sem o nome da rua deste serviço. */
const PALAVRAS_DE_ENDERECO = [
  /\b(?:rua|avenida|alameda|travessa|estrada|rodovia|praca|largo|viela|condominio|edificio|residencial|apartamento|apto|bloco|torre|complemento|compl|numero|cep|lote|quadra|fundos|sobrado|esquina)\b/,
  /* abreviação com ponto: "R. Cel. Oscar Freire", "Av. Dr. Arnaldo", "n. 48",
     "ap. 3", "Bl. B" */
  /(?:^|[^a-z])(?:r|av|al|tv|cond|ed|qd|n|ap|apt|apto|bl|blc)\.\s*\S/,
  /* abreviação sem ponto: "R dos Ipês", "Av Paulista", "Al Santos" */
  /(?:^|[^a-z])(?:r|av|al)\s+(?:d[aoe]s?\s+)?[a-z]/,
  /* "nº 48", "casa 48", "ap 52", "prédio 2", "sala 3", "bl B" */
  /\bn[º°o]\s*\d/,
  /\b(?:casa|ap|apt|predio|sala|loja|portao)\s*\d/,
  /\bbl\s*[a-z0-9]\b/,
];

/* Nome próprio logo depois de "na", "no", "da", "ao"...: "Fica na Oscar
   Freire 7", "na Santos, 7", "perto da Augusta". É o jeito de dizer OUTRA
   rua, que não está no cadastro deste serviço. Olha o texto com as
   maiúsculas: "na mesa" é frase; "na Augusta", lugar. Pega também "na Vila
   Madalena" e "no Carrefour" — esconder demais num aviso não faz mal. */
const LUGAR_COM_NOME_PROPRIO = /(?:^|[^A-Za-zÀ-ÿ])(?:[Nn][ao]s?|[Dd][ao]s?|[Aa]o|à|À)\s+[A-ZÀ-Ý]/;

/* Os números que podem ir no aviso: não apontam casa nenhuma. */
const NUMEROS_QUE_PODEM_IR = [
  /r\$\s*\d[\d.,]*/g,                                                  // R$ 150,00
  /\b\d{1,2}\s*h\s*\d{0,2}\b/g,                                        // 8h, 8h30, 14 h
  /\b\d{1,2}:\d{2}\b/g,                                                // 8:30
  /\b\d{1,3}\s*(?:min|mins|minutos?|horas?|hrs?|dias?|semanas?)\b/g,   // 15 minutos
  /\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b/g,                               // 13/10 — só data de verdade
  /\b\d{1,3}\s*%/g,                                                    // 10%
];

/* As palavras do nome da rua deste serviço que a denunciam sozinhas:
   "Rua dos Ipês, 48" -> ["ipes"]. Sem o tipo (rua, av.) e sem "de/da/dos";
   com 4 letras ou mais, para "são" de "Rua São Paulo" não barrar toda
   frase com "são" — a não ser que a rua só tenha palavra curta. */
function palavrasDaRua(ruaConhecida){
  const TIPO = ["rua","r","avenida","av","alameda","al","travessa","tv","estrada","rodovia",
                "praca","largo","viela","de","da","do","das","dos","e","d"];
  const nome = semAcento(String(ruaConhecida || "").split(",")[0]);
  const palavras = nome.split(/[^a-z]+/).filter(function(p){ return p && TIPO.indexOf(p) < 0; });
  const longas = palavras.filter(function(p){ return p.length >= 4; });
  return longas.length ? longas : palavras.filter(function(p){ return p.length >= 3; });
}

/* O número da casa, com ou sem vírgula: "Rua dos Ipês, 48" -> "48";
   "Rua das Flores 7" -> "7". Sem vírgula vale o último número. */
function numeroDaCasa(ruaConhecida){
  const r = semAcento(ruaConhecida);
  const depoisDaVirgula = r.split(",").slice(1).join(",").match(/\d+/);
  if(depoisDaVirgula) return depoisDaVirgula[0];
  const ultimo = r.match(/(\d+)\D*$/);
  return ultimo ? ultimo[1] : "";
}

/* O número escrito por extenso, sem acento: 48 -> "quarenta e oito",
   1200 -> "mil e duzentos". Até 9999; acima disso, "". */
function numeroPorExtenso(n){
  n = Math.floor(Number(n));
  if(!(n >= 0) || n > 9999) return "";
  const U = ["zero","um","dois","tres","quatro","cinco","seis","sete","oito","nove","dez","onze",
             "doze","treze","catorze","quinze","dezesseis","dezessete","dezoito","dezenove"];
  const D = ["","","vinte","trinta","quarenta","cinquenta","sessenta","setenta","oitenta","noventa"];
  const C = ["","cento","duzentos","trezentos","quatrocentos","quinhentos","seiscentos",
             "setecentos","oitocentos","novecentos"];
  function ate999(x){
    if(x === 100) return "cem";
    const partes = [];
    if(x >= 100){ partes.push(C[Math.floor(x / 100)]); x %= 100; }
    if(x >= 20){ partes.push(D[Math.floor(x / 10)]); x %= 10; }
    if(x > 0) partes.push(U[x]);
    return partes.join(" e ");
  }
  if(n === 0) return "zero";
  const mil = Math.floor(n / 1000), resto = n % 1000;
  if(!mil) return ate999(resto);
  const milhar = mil === 1 ? "mil" : ate999(mil) + " mil";
  if(!resto) return milhar;
  return milhar + (resto < 100 || resto % 100 === 0 ? " e " : " ") + ate999(resto);
}

/* O número dito por extenso logo depois de "no", "na", "número": "É no
   quarenta e oito", "Estou no sete". Vale qualquer número, não só o desta
   casa: é o jeito de dizer onde fica. */
const NUMERO_DITO_COMO_ENDERECO = new RegExp("\\b(?:no|na|n|numero)\\s+(?:"
  + Object.keys(NUMEROS_POR_EXTENSO).map(semAcento).concat(["mil"]).join("|") + ")\\b");

/* O texto (já filtrado de contato) pode aparecer na tela bloqueada? */
function textoPodeIrNoAviso(texto, ruaConhecida){
  const original = String(texto == null ? "" : texto);
  const t = semAcento(original);
  if(PALAVRAS_DE_ENDERECO.some(function(re){ return re.test(t); })) return false;
  if(LUGAR_COM_NOME_PROPRIO.test(original) || NUMERO_DITO_COMO_ENDERECO.test(t)) return false;
  let resto = t;
  NUMEROS_QUE_PODEM_IR.forEach(function(re){
    resto = resto.replace(re, function(achado){
      /* "48/2" tem cara de data e não é: fica, e cai na regra abaixo */
      return (/\//.test(achado) && !ehDataDeVerdade(achado)) ? achado : " ";
    });
  });
  if(/\d{2,}/.test(resto)) return false;
  /* O número desta casa, mesmo de um dígito só ("Estou no 7"), procurado
     no texto INTEIRO: hora e dinheiro com o mesmo número também barram.
     Antes era procurado no que sobrava depois de tirar as "datas", e
     "É o 48/2" passava inteiro. E por extenso: "É no quarenta e oito". */
  const numero = numeroDaCasa(ruaConhecida);
  if(numero){
    if(new RegExp("(^|\\D)" + numero + "(\\D|$)").test(t)) return false;
    const extenso = numeroPorExtenso(Number(numero));
    const reExtenso = extenso && new RegExp("\\b" + extenso.split(" e ").map(function(parte){
      return parte.split(" ").join("\\s+").replace("catorze", "(?:catorze|quatorze)");
    }).join("\\s+(?:e\\s+)?") + "\\b");
    if(reExtenso && reExtenso.test(t)) return false;
  }
  return !palavrasDaRua(ruaConhecida).some(function(p){
    return new RegExp("\\b" + p + "\\b").test(t);
  });
}

/* O texto que vai no aviso, ou "" quando ele não pode ir. */
function corpoDoAvisoDeMensagem(texto, ruaConhecida){
  let corpo = esconderContatos(texto).texto.replace(/\s+/g, " ").trim();
  if(!corpo || !textoPodeIrNoAviso(corpo, ruaConhecida)) return "";
  if(corpo.length > TAMANHO_MAXIMO_DO_AVISO) corpo = corpo.slice(0, TAMANHO_MAXIMO_DO_AVISO - 1).trim() + "…";
  return corpo;
}

/* "Joana T. mandou mensagem: Estou a caminho", ou, quando o texto pode
   apontar a casa, "Joana T. mandou mensagem. Abra o app para ler." */
function textoDoAvisoDeMensagem(nomeDeQuemMandou, texto, ruaConhecida){
  const corpo = corpoDoAvisoDeMensagem(texto, ruaConhecida);
  return corpo ? nomeDeQuemMandou + " mandou mensagem: " + corpo
               : nomeDeQuemMandou + " mandou mensagem. " + AVISO_SEM_O_TEXTO;
}

const PERIODOS = [
  { id:"manha", nome:"Manhã",  faixa:"8h às 12h",  inicio:8  },
  { id:"tarde", nome:"Tarde",  faixa:"12h às 16h", inicio:12 },
  { id:"noite", nome:"Noite",  faixa:"16h às 20h", inicio:16 },
];


/* ==========================================================================
   REGRAS QUE MORAVAM NAS TELAS

   Funções puras: recebem o dado por parâmetro, não olham a tela, o
   relógio nem o estado guardado. Moram aqui para que o teste cruzado do
   app (que carrega só este arquivo) consiga compará-las com o servidor.
   As telas continuam chamando pelos nomes de sempre.
   ========================================================================== */

/* NOME CURTO — regra de privacidade do produto

   O cliente nunca vê o sobrenome inteiro da profissional. "Maria Silva"
   aparece como "Maria S." em qualquer tela do cliente. É o que impede
   alguém de procurar a pessoa fora do aplicativo. */
function nomeCurto(nome){
  const partes = String(nome || "").trim().split(/\s+/);
  if(partes.length < 2) return partes[0] || "";
  return partes[0] + " " + partes[partes.length - 1][0].toUpperCase() + ".";
}

/* EM QUE ESTADO A DIARISTA ESTÁ (R24): a chave, se pode aceitar e a
   porcentagem do cadastro. As frases de cada estado continuam na tabela
   situacaoDaDiarista(), nas telas dela.

   Portão 1 vale 20%, Portão 2 vale 60%, Portão 3 vale 20%.

   `celularConfirmado` e `termosEmDia` são obrigatórios: só `true` libera.
   Sem o celular confirmado, ou com os termos novos ainda sem aceite, ela
   continua no estado em que está, mas não aceita nem fica disponível.
   Recusada e suspensa (decisão da equipe) vencem o resto.

   As chaves são as do servidor, com uma diferença de nome: o "novo" do
   servidor é o "incompleto" daqui. */
const ETAPAS_DO_PORTAO_2 = ["documentos", "selfie", "antecedentes", "termos"];

function estadoDaDiarista(d, celularConfirmado, termosEmDia){
  const feito = (d && d.feito) || {};
  const feitos2 = ETAPAS_DO_PORTAO_2.filter(function(x){ return feito[x]; }).length;

  let pct = 0;
  if(feito.dados)  pct += 10;
  if(feito.regiao) pct += 10;
  pct += Math.round((feitos2 / ETAPAS_DO_PORTAO_2.length) * 60);
  if(feito.recebimento) pct += 10;
  if(feito.experiencia) pct += 10;

  const situacao = d && d.situacao;
  let chave;
  if(situacao === "aprovada" || situacao === "recusada" || situacao === "suspensa") chave = situacao;
  else if(situacao === "analise" || feitos2 === ETAPAS_DO_PORTAO_2.length
          || selfieComAEquipe(d)) chave = "analise";
  else chave = "incompleto";

  const liberada = chave === "aprovada" && celularConfirmado === true && termosEmDia === true;
  return {
    chave: chave,
    podeAceitar: liberada,
    podeFicarDisponivel: liberada,
    faltaPix: chave === "aprovada" && !feito.recebimento,
    pct: pct,
  };
}

/* A VERIFICAÇÃO DELA (R35): o documento, a selfie e os antecedentes, por
   uma empresa especializada. As regras são as do servidor (um teste do app
   compara): a conta do CPF, a idade mínima e quantas selfies podem não
   conferir antes de a nossa equipe olhar. */
const SELFIES_QUE_NAO_CONFEREM_NO_MAXIMO = 3;
/* O trabalho doméstico é proibido para menores de 18 anos: é lei
   (Decreto 6.481/2008; LC 150/2015), não escolha do app. */
const IDADE_MINIMA = 18;
const ETAPAS_DA_VERIFICACAO = ["autorizar", "dados", "documento", "selfie", "antecedentes",
                               "equipe", "feita"];

/* Os dois dígitos do CPF conferem (a conta da Receita)? 11 números, não
   todos iguais. A mesma conta do servidor (regras.cpf_valido). */
function cpfValido(cpf){
  const n = String(cpf || "");
  if(!/^[0-9]{11}$/.test(n) || /^(\d)\1{10}$/.test(n)) return false;
  for(let posicao = 9; posicao <= 10; posicao++){
    let soma = 0;
    for(let i = 0; i < posicao; i++) soma += Number(n[i]) * (posicao + 1 - i);
    if((soma * 10) % 11 % 10 !== Number(n[posicao])) return false;
  }
  return true;
}

/* "17/05/1990" -> "1990-05-17", só se a data existe, já passou e a pessoa
   tem de 18 a 100 anos. Senão, "". */
function dataDigitadaEmIso(texto){
  const m = /^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/.exec(String(texto || "").trim());
  if(!m) return "";
  const dia = Number(m[1]), mes = Number(m[2]), ano = Number(m[3]);
  const d = new Date(ano, mes - 1, dia);
  if(d.getFullYear() !== ano || d.getMonth() !== mes - 1 || d.getDate() !== dia) return "";
  const idade = idadeNaData(ano, mes, dia, new Date());
  if(idade < IDADE_MINIMA || idade > 100) return "";
  return m[3] + "-" + m[2] + "-" + m[1];
}

function idadeNaData(ano, mes, dia, hoje){
  let idade = hoje.getFullYear() - ano;
  if(hoje.getMonth() + 1 < mes || (hoje.getMonth() + 1 === mes && hoje.getDate() < dia)) idade--;
  return idade;
}

/* As selfies não conferiram as vezes todas, e a nossa equipe confere: ela
   fica "em análise", como quem mandou tudo (o mesmo do servidor). */
function selfieComAEquipe(d){
  const v = (d && d.verificacao) || {};
  return !(d && d.feito && d.feito.selfie)
      && Number(v.tentativasDoRosto || 0) >= SELFIES_QUE_NAO_CONFEREM_NO_MAXIMO;
}

/* O QUE A EQUIPE DECIDE SOBRE ELA, E O DIREITO DE RESPOSTA (antipadrões do
   Bloco 7: conta desativada só com motivo escrito e direito de resposta;
   ninguém é punido em silêncio).

   A tabela é a mesma do servidor (um teste do app compara): de que estado
   cada decisão pode ser tomada, e para qual estado ela leva. "manter" não
   muda o estado: é a equipe respondendo, por escrito, à resposta dela. No
   app quem decide é a equipe; na maquete, os simuladores do quadro "NA
   MAQUETE" usam esta tabela. */
const DECISOES_DA_EQUIPE = {
  aprovar:   { acao:"aprovou",   de:["analise", "recusada", "suspensa"], para:"aprovada" },
  recusar:   { acao:"recusou",   de:["analise"],                         para:"recusada" },
  suspender: { acao:"suspendeu", de:["aprovada"],                        para:"suspensa" },
  manter:    { acao:"manteve",   de:["recusada", "suspensa"],            para:null },
};
/* a que decisões ela pode responder: as que tiram ou negam o acesso */
const ACOES_QUE_ELA_PODE_RESPONDER = ["recusou", "suspendeu", "manteve"];
/* quantas respostas ela manda para a MESMA decisão (a equipe responde
   mantendo, por escrito, ou mudando a decisão; aí ela pode responder de
   novo), e o tamanho de cada uma */
const RESPOSTAS_POR_DECISAO = 3;
const RESPOSTA_MAXIMA = 2000;

/* A situação dela a partir da trilha (a lista do que a equipe decidiu e do
   que ela respondeu, da mais velha para a mais nova): a última decisão da
   equipe, se ela pode responder, quantas respostas ainda cabem, e a
   conversa inteira. É a mesma conta do servidor (analise.decisao_para_ela e
   historico_para_ela; um teste do app compara). Quem decidiu nunca aparece:
   quem responde é a Limpah.
   O que aconteceu em cada linha fica em "tipo" ("recusou", "respondeu"...;
   no servidor, "acao"): nas telas, "acao" lembraria o data-acao dos
   botões, e um nome só para cada coisa evita confusão. */
function situacaoPelaTrilha(trilha){
  const linhas = Array.isArray(trilha) ? trilha : [];
  const daEquipe = Object.keys(DECISOES_DA_EQUIPE).map(function(n){ return DECISOES_DA_EQUIPE[n].acao; });
  const decisoes = linhas.filter(function(l){ return daEquipe.indexOf(l.tipo) >= 0; });
  const ultima = decisoes.length ? decisoes[decisoes.length - 1] : null;
  let decisao = null;
  if(ultima){
    const pode = ACOES_QUE_ELA_PODE_RESPONDER.indexOf(ultima.tipo) >= 0;
    const ja = linhas.filter(function(l){
      return l.tipo === "respondeu" && l.emRespostaA === ultima.id;
    }).length;
    const restantes = pode ? Math.max(0, RESPOSTAS_POR_DECISAO - ja) : 0;
    decisao = {
      id: ultima.id,
      tipo: ultima.tipo,
      antes: ultima.situacaoAntes || "",
      situacao: ultima.situacaoDepois || "",
      motivo: ultima.texto || "",
      emTexto: ultima.emTexto || "",
      podeResponder: restantes > 0,
      respostasRestantes: restantes,
    };
  }
  return {
    decisao: decisao,
    historico: linhas.map(function(l){
      return { tipo: l.tipo, quem: (l.tipo === "respondeu") ? "voce" : "equipe",
               antes: l.situacaoAntes || "", depois: l.situacaoDepois || "",
               texto: l.texto || "", emTexto: l.emTexto || "" };
    }),
  };
}

/* MEUS DIAS DE TRABALHO — a grade dela (R22; no app, a entrega 6c)

   O dia da semana ("0" = domingo, como o getDay) -> os períodos marcados.
   Nada marcado nunca = tudo serve. Com algum dia marcado, o dia que não
   aparece (ou vem vazio) não serve. O serviço conta pelo período em que
   COMEÇA. A mesma regra do servidor (regras.periodo_na_grade); um teste
   cruzado do app compara as duas. */
function periodoNaGrade(grade, dataIso, periodoId){
  grade = grade || {};
  if(!Object.keys(grade).length) return true;      // nada marcado = tudo serve
  const partes = String(dataIso || "").split("-");
  const dia = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2])).getDay();
  const doDia = grade[dia];
  if(!doDia || !doDia.length) return false;
  return doDia.indexOf(periodoId) >= 0;
}

/* A grade depois de um toque num período de um dia: uma grade NOVA (a de
   antes fica como estava). Se nada estava marcado, tudo estava valendo —
   então o primeiro toque parte de "tudo ligado", senão ela toca para
   DESmarcar um período e o app entende que ela marcou só aquele. */
function gradeAlternada(grade, dia, periodoId){
  grade = grade || {};
  const tudoAberto = !Object.keys(grade).length;
  const nova = {};
  for(let i = 0; i < 7; i++){
    const antes = tudoAberto ? PERIODOS.map(function(p){ return p.id; }) : (grade[i] || []);
    nova[i] = antes.slice();
  }
  const lista = nova[dia] || [];
  const achou = lista.indexOf(periodoId);
  if(achou >= 0) lista.splice(achou, 1); else lista.push(periodoId);
  nova[dia] = lista;
  return nova;
}


/* ==========================================================================
   O DIA DO SERVIÇO (A41; R11, R35, A40)

   Os passos de cada vaga: confirmar a presença → "Estou a caminho" →
   "Cheguei" (com a selfie) → "Terminei" → a cliente confirma (ou o prazo
   dela passa) → concluído. E a avaliação, dos dois lados.

   A MESMA CONTA do servidor (regras.estado_em_minutos, no app/limpah/
   regras.py): um teste cruzado compara as duas em milhares de momentos.
   As contas são em MINUTOS DO DIA DO SERVIÇO (0 = meia-noite do dia; antes
   do dia é negativo, depois passa de 1440): assim o fuso de quem roda não
   muda nada.

   Dentro da janela, quem administra o tempo é ELA (R9, regra de ouro 12): os
   passos dizem quando ela chegou e terminou, nunca quando ela pausa.
   ========================================================================== */
const DIA_DO_SERVICO = {
  horaDaConfirmacao: 7,             // R11: a confirmação abre às 7h do dia
  horaLimiteDaConfirmacao: 8,       // R11: sem resposta até as 8h, a equipe procura outra
  horasAntesParaSair: 2,            // "Estou a caminho", até 2h antes do início (A41)
  minutosAntesParaChegar: 60,       // "Cheguei", até 1h antes do início (A41)
  minutosDeToleranciaDaChegada: 30, // sem chegada meia hora depois do início: a equipe (A41)
  selfiesDaChegadaNoMaximo: 2,      // R35/A40: tenta mais uma vez; na segunda, a equipe
  horasParaAClienteContestar: 24,   // o prazo da cliente, depois do fim (A41)
  diasParaAvaliar: 7,               // a avaliação, até 7 dias depois (A41)
  notaQuePedeOMotivo: 3,            // nota baixa vem com motivo (antipadrões do Bloco 7)
  comentarioMaximo: 500,
  avaliacoesParaMostrarAMedia: 3,   // a cliente vê a média dela só a partir de 3
};

/* r: o que já aconteceu, em minutos do dia (null = ainda não): aceito,
   confirmou, aCaminho, chegou, tentativas, terminou, concluido, contestou,
   chamou (ela escreveu para a cliente na conversa depois do "Cheguei"). */
function estadoEmMinutos(r, inicioHora, fimHora, agora){
  r = r || {};
  const D = DIA_DO_SERVICO;
  const tem = function(x){ return x !== null && x !== undefined; };
  const inicio = inicioHora * 60, fim = fimHora * 60;
  const abreConfirmar = D.horaDaConfirmacao * 60;
  const prazo = D.horaLimiteDaConfirmacao * 60;
  const abreSair = inicio - D.horasAntesParaSair * 60;
  const abreChegar = inicio - D.minutosAntesParaChegar;
  const tolerancia = inicio + D.minutosDeToleranciaDaChegada;
  const tentativas = Number(r.tentativas) || 0;
  const confirmou = tem(r.confirmou) || tem(r.aCaminho) || (tem(r.aceito) && r.aceito >= abreConfirmar);
  const conferindo = !tem(r.chegou) && tentativas >= D.selfiesDaChegadaNoMaximo;
  let terminou = tem(r.terminou) ? r.terminou : null;
  if(terminou === null && tem(r.chegou) && agora >= fim) terminou = fim;
  const prazoParaContestar = terminou !== null ? terminou + D.horasParaAClienteContestar * 60 : null;
  const concluido = terminou !== null && !r.contestou && (tem(r.concluido) || agora >= prazoParaContestar);
  const fimDaAvaliacao = (D.diasParaAvaliar + 1) * 1440;

  let passo;
  if(terminou !== null && r.contestou) passo = "em_analise";
  else if(concluido) passo = "concluido";
  else if(terminou !== null) passo = "terminou";
  else if(tem(r.chegou)) passo = "chegou";
  else if(conferindo) passo = "conferindo";
  else if(tem(r.aCaminho)) passo = "a_caminho";
  else if(confirmou) passo = "confirmado";
  else if(agora >= abreConfirmar) passo = "confirmar";
  else passo = "antes";

  const naJanela = agora < fim;
  const abertoParaACliente = terminou !== null && !concluido && !r.contestou && agora < prazoParaContestar;
  /* R37: "a cliente não está em casa" só depois do "Cheguei", da espera e
     de ela ter chamado a cliente pela conversa (r.chamou) */
  const abreAusente = abreClienteAusente(tem(r.chegou) ? r.chegou : null, inicio);
  let problema = null;
  if(!tem(r.chegou) && terminou === null && !conferindo){
    if(!confirmou && agora >= prazo) problema = "nao_confirmou";
    else if(agora >= tolerancia) problema = "nao_chegou";
  }
  return {
    passo: passo,
    pode: {
      confirmar: !confirmou && abreConfirmar <= agora && naJanela,
      sair: !tem(r.aCaminho) && !tem(r.chegou) && abreSair <= agora && naJanela,
      chegar: tem(r.aCaminho) && !tem(r.chegou) && !conferindo && abreChegar <= agora && naJanela,
      terminar: tem(r.chegou) && !tem(r.terminou) && naJanela,
      imprevisto: terminou === null && naJanela,
      clienteAusente: abreAusente !== null && agora >= abreAusente && !!r.chamou
                      && terminou === null && naJanela,
      confirmarOFim: abertoParaACliente,
      contestar: abertoParaACliente,
      avaliar: terminou !== null && agora < fimDaAvaliacao,
    },
    abre: { confirmar: abreConfirmar, sair: abreSair, chegar: abreChegar },
    clienteAusenteAbre: abreAusente,
    prazoDaConfirmacao: prazo,
    toleranciaDaChegada: tolerancia,
    terminou: terminou,
    prazoParaContestar: prazoParaContestar,
    fimDaAvaliacao: fimDaAvaliacao,
    problema: problema,
    selfiesRestantes: Math.max(0, D.selfiesDaChegadaNoMaximo - tentativas),
  };
}

/* Minutos do dia -> "7h", "7h05" (a mesma do regras.hora_escrita). */
function horaEscrita(minutos){
  if(minutos === null || minutos === undefined || isNaN(Number(minutos))) return "";
  const m = ((Math.floor(Number(minutos)) % 1440) + 1440) % 1440;
  const hora = Math.floor(m / 60), minuto = m % 60;
  return minuto ? hora + "h" + String(minuto).padStart(2, "0") : hora + "h";
}


/* ==========================================================================
   O CANCELAMENTO E A FALTA (R37, decisão do dono de 17/10/2026, que revisa a
   R20; as escolhas do assistente estão na DECISOES, A44, PROVISÓRIAS)

   Contado até o INÍCIO DA JANELA:
     | Quanto falta          | A cliente cancela        | A diarista cancela    |
     | 24h ou mais           | grátis, devolução total  | sem consequência      |
     | menos de 24h, 3h ou + | 20%, que vai para ELA    | "cancelamento tardio" |
     | menos de 3h           | 50%, que vai para ELA    | FALTA                 |
   Nos limites, a faixa mais leve para quem cancela: 24h00 ainda é grátis,
   3h00 ainda é 20%.

   O 20% e o 50% são do VALOR QUE A CLIENTE PAGOU, e a multa INTEIRA vai
   para a diarista. Nunca passa do que ela receberia pelo serviço (Código
   Civil, art. 412). A diarista nunca paga multa para a plataforma: em
   todos os casos ela não recebe aquele serviço, e a cliente tem a
   substituta ou a devolução total (R11). Com falta, a cliente ganha um
   crédito de 20%, pago pela plataforma; com falta SEM AVISO, também a
   cláusula penal provisória (20% do valor dela, só anotada; ver R37).

   A MESMA CONTA do servidor (app/limpah/regras.py, seção 15): um teste
   cruzado compara as duas (app/testes/test_cancelamento.py).
   ========================================================================== */
const CANCELAMENTO = {
  horasParaCancelarSemCusto: 24,
  horasEmCimaDaHora: 3,
  percentualTardio: 20,               // entre 24h e 3h: para ela
  percentualEmCimaDaHora: 50,         // menos de 3h, ou a cliente não está: para ela
  minutosDeEsperaPelaCliente: 30,     // depois do "Cheguei", chamando pela conversa
  creditoDaFaltaPercentual: 20,       // pago pela plataforma, para a cliente
  clausulaPenalPercentual: 20,        // do valor dela, só na falta sem aviso
  diasDepoisDasOutras: 7,
  minutosDepoisDasOutras: 10,
  faltasParaPausar: 3,
  diasQueAFaltaConta: 90,
  diasUteisParaDecidirOProblema: 2,
  devolucaoMaximaDoProblemaPercentual: 50,
  minutosParaASubstituta: 120,        // a busca inteira cabe antes do prazo do aceite
};
/* CLAUSULA_PENAL_LIGADA: provisória, a confirmar (ver R37); a mesma do servidor */
const CLAUSULA_PENAL_LIGADA = true;

const PERCENTUAL_DO_CANCELAMENTO = { mais_de_24h: 0,
  entre_24h_e_3h: CANCELAMENTO.percentualTardio, menos_de_3h: CANCELAMENTO.percentualEmCimaDaHora };
const CONSEQUENCIA_PARA_ELA = { mais_de_24h: "nenhuma", entre_24h_e_3h: "tardio", menos_de_3h: "falta" };

function faixaDoCancelamento(minutosAntes){
  const C = CANCELAMENTO;
  if(minutosAntes >= C.horasParaCancelarSemCusto * 60) return "mais_de_24h";
  if(minutosAntes >= C.horasEmCimaDaHora * 60) return "entre_24h_e_3h";
  return "menos_de_3h";
}

/* percentual% de um valor em centavos, o meio para cima (centavos inteiros) */
function percentualDe(centavos, percentual){
  return Math.floor((Math.round(Number(centavos)) * Math.round(Number(percentual)) + 50) / 100);
}

/* o valor pago, em partes iguais por vaga; o centavo que sobra, na vaga 1 */
function partesDoValor(totalCentavos, vagas){
  const total = Math.round(Number(totalCentavos)), n = Math.round(Number(vagas));
  const base = Math.floor(total / n), sobra = total - base * n;
  const partes = [];
  for(let i = 0; i < n; i++) partes.push(base + (i < sobra ? 1 : 0));
  return partes;
}

function haTempoParaASubstituta(minutosAntes){
  return minutosAntes >= CANCELAMENTO.minutosParaASubstituta;
}

/* Os valores de UMA vaga, em centavos (o mesmo do regras.acerto_do_cancelamento). */
function acertoDoCancelamento(quem, faixa, valorPago, repasse, semAviso, reabreABusca){
  if(!Object.prototype.hasOwnProperty.call(PERCENTUAL_DO_CANCELAMENTO, faixa)) throw new Error(faixa);
  valorPago = Math.round(Number(valorPago)); repasse = Math.round(Number(repasse));
  if(quem === "cliente"){
    const percentual = PERCENTUAL_DO_CANCELAMENTO[faixa];
    const multa = Math.min(percentualDe(valorPago, percentual), repasse);
    return { percentual: percentual, multa: multa, devolucao: valorPago - multa,
             credito: 0, clausula_penal: 0, consequencia: "nenhuma" };
  }
  if(quem !== "diarista") throw new Error(quem);
  const consequencia = CONSEQUENCIA_PARA_ELA[faixa];
  const falta = consequencia === "falta";
  const clausula = (falta && semAviso && CLAUSULA_PENAL_LIGADA)
    ? Math.min(percentualDe(repasse, CANCELAMENTO.clausulaPenalPercentual), repasse) : 0;
  return { percentual: 0, multa: 0, devolucao: reabreABusca ? 0 : valorPago,
           credito: falta ? percentualDe(valorPago, CANCELAMENTO.creditoDaFaltaPercentual) : 0,
           clausula_penal: clausula, consequencia: consequencia };
}

/* "Algo não ficou bom", decidido pela equipe: refazer, ou devolver até 50%. */
function acertoDoProblema(valorPago, repasse, decisao, percentual){
  if(decisao === "refazer") return { percentual: 0, devolucao: 0, desconto_dela: 0 };
  if(decisao !== "devolver" || typeof percentual !== "number" || percentual % 1 !== 0
     || percentual < 1 || percentual > CANCELAMENTO.devolucaoMaximaDoProblemaPercentual)
    throw new Error(String(decisao) + " " + String(percentual));
  return { percentual: percentual, devolucao: percentualDe(valorPago, percentual),
           desconto_dela: percentualDe(repasse, percentual) };
}

/* Em minutos do dia: quando ela pode marcar que a cliente não está em casa. */
function abreClienteAusente(chegou, inicio){
  if(chegou === null || chegou === undefined) return null;
  return Math.max(chegou, inicio) + CANCELAMENTO.minutosDeEsperaPelaCliente;
}

/* Até que distância o pedido já chega, com a busca neste minuto (R22). */
function raioDaOnda(minutosDeBusca){
  let raio = ONDAS[0].raioKm;
  ONDAS.forEach(function(o){ if(minutosDeBusca >= o.comecaAos) raio = o.raioKm; });
  return raio;
}

/* A onda DELA: com uma falta recente, o pedido chega 10 minutos depois das
   outras à mesma distância (e não some da lista). */
function raioDaOndaDela(minutosDeBusca, depoisDasOutras){
  const m = minutosDeBusca - (depoisDasOutras ? CANCELAMENTO.minutosDepoisDasOutras : 0);
  return m < 0 ? 0 : raioDaOnda(m);
}

/* As faltas que contam (momentos em milissegundos), da mais velha à mais nova. */
function faltasQueContam(momentos, agora){
  const desde = agora - CANCELAMENTO.diasQueAFaltaConta * 86400000;
  return (momentos || []).filter(function(m){ return m > desde && m <= agora; })
    .sort(function(a, b){ return a - b; });
}

function depoisDasOutrasAte(momentos, agora){
  const ja = (momentos || []).filter(function(m){ return m <= agora; });
  if(!ja.length) return null;
  const ate = Math.max.apply(null, ja) + CANCELAMENTO.diasDepoisDasOutras * 86400000;
  return ate > agora ? ate : null;
}

function pausaPorFaltas(momentos, agora){
  return faltasQueContam(momentos, agora).length >= CANCELAMENTO.faltasParaPausar;
}

/* "aaaa-mm-dd" -> o dia (também "aaaa-mm-dd") em que vence o prazo da equipe:
   2 dias úteis (segunda a sexta). */
function prazoParaDecidirOProblema(isoDia){
  const p = String(isoDia).split("-").map(Number);
  const d = new Date(Date.UTC(p[0], p[1] - 1, p[2]));
  let faltam = CANCELAMENTO.diasUteisParaDecidirOProblema;
  while(faltam > 0){
    d.setUTCDate(d.getUTCDate() + 1);
    const semana = d.getUTCDay();
    if(semana !== 0 && semana !== 6) faltam--;
  }
  return d.toISOString().slice(0, 10);
}
