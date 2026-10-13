/* ==========================================================================
   LIMPAH — TELAS DA DIARISTA (Bloco 3)

   O CADASTRO EM TRÊS PORTÕES (decisão R18)

   A versão antiga era uma escada de 10 degraus: documento, selfie,
   antecedentes e dados bancários ANTES de ela ver um centavo. Abandono
   altíssimo, e com razão — ninguém manda foto do RG para um aplicativo que
   ainda não mostrou nada.

   As 10 etapas continuam todas aqui. O que mudou é QUANDO cada uma é
   cobrada:

     PORTÃO 1 — ENTRAR E VER      nome, telefone, região.  2 minutos.
                                  E ela já vê oportunidades reais, com valor
                                  real, na região dela — com cadeado.

     PORTÃO 2 — PODER ACEITAR     documento, selfie, antecedentes, termos,
                                  análise, aprovação. Só o que a segurança
                                  exige.

     PORTÃO 3 — PODER RECEBER     dados bancários e experiência. Só quando
                                  já existe dinheiro para receber.

   A REGRA QUE NÃO PODE QUEBRAR: ela não aceita nada antes de aprovada.
   Isso é verificado por teste automático.
   ========================================================================== */


/* --------------------------------------------------------------------------
   O ESTADO DELA
   -------------------------------------------------------------------------- */
function diaristaNova(){
  return {
    nome: "",
    telefone: "",
    regiao: "",
    bairros: [],
    situacao: "novo",        // novo · analise · aprovada
    disponivel: false,

    /* Quando ela aceita receber alerta. Vazio = qualquer dia, qualquer
       período — é o começo mais generoso, e ela aperta depois se quiser. */
    diasDeTrabalho: {},

    /* Os serviços que ela já aceitou. É isto que impede o app de oferecer
       um horário que ela não tem. */
    agenda: [],

    /* Alertas ignorados SEGUIDOS. Zera em qualquer sinal de vida. */
    ignoradosSeguidos: 0,

    /* O dia em que ela cadastrou a chave Pix ("2026-10-12"). Antes disso
       nenhum dinheiro pode ter caído no Pix dela: sem esta data, o que
       esperava a chave aparecia como "caiu no Pix 21/09" assim que ela
       cadastrava — num dia em que ela nem tinha chave. Vazio em quem já
       tinha Pix antes de a data existir: para essas, vale o prazo de sempre. */
    pixDesde: "",
    /* o que já foi entregue */
    feito: {
      dados: false, regiao: false,
      documentos: false, selfie: false, antecedentes: false, termos: false,
      recebimento: false, experiencia: false,
    },
  };
}

function euSouDiarista(){
  if(!E.diarista) E.diarista = diaristaNova();
  return E.diarista;
}

/* Ela pode aceitar serviço? Só depois do Portão 2 inteiro. */
function podeAceitarServico(){
  const d = euSouDiarista();
  return d.situacao === "aprovada";
}

/* Quanto do cadastro está feito, e o que falta agora. */
function progressoDoCadastro(){
  const d = euSouDiarista();
  const portao2 = ["documentos", "selfie", "antecedentes", "termos"];
  const feitos2 = portao2.filter(function(x){ return d.feito[x]; }).length;

  /* o Portão 1 vale 20%, o 2 vale 60%, o 3 vale 20% */
  let pct = 0;
  if(d.feito.dados)  pct += 10;
  if(d.feito.regiao) pct += 10;
  pct += Math.round((feitos2 / portao2.length) * 60);
  if(d.feito.recebimento) pct += 10;
  if(d.feito.experiencia) pct += 10;

  let falta = "";
  if(d.situacao === "novo" && feitos2 < portao2.length){
    falta = "faltam os documentos para você aceitar serviços";
  } else if(d.situacao === "analise"){
    falta = "seu cadastro está em análise";
  } else if(!d.feito.recebimento){
    falta = "falta informar onde você quer receber";
  } else if(!d.feito.experiencia){
    falta = "conte sua experiência para receber mais oportunidades";
  }
  return { pct: pct, falta: falta };
}


/* ==========================================================================
   EM QUE ESTADO ELA ESTÁ — e o que cada tela diz sobre isso (decisão R24)

   Em 22/08/2026 o dono terminou o cadastro e as telas se contradisseram:
   o mapa dizia "complete o segundo passo" com o segundo passo todo feito,
   os cartões diziam "complete seu cadastro" sem nada a completar, e a faixa
   tinha sumido.

   **A causa não foi um bug — foi cada tela decidindo sozinha o que dizer**,
   a partir de um sim/não (`podeAceitarServico`). Sim/não não comporta três
   estados. Enquanto cada tela fizer a própria conta, elas voltam a discordar.

   Agora existe UM lugar que decide, e as telas só leem daqui. Frase nova
   sobre o estado dela entra NESTA tabela, nunca solta dentro de uma tela.
   ========================================================================== */
function situacaoDaDiarista(){
  const d = euSouDiarista();
  const p = progressoDoCadastro();
  const portao2 = ["documentos", "selfie", "antecedentes", "termos"];
  const portao2Pronto = portao2.every(function(x){ return d.feito[x]; });

  /* O PIX, nos três estados (R26). Antes só a aprovada sabia se tinha chave:
     o extrato de quem estava em análise prometia "cai em até 1 dia útil" a
     quem nunca cadastrou chave nenhuma. As frases do Pix que os ganhos e o
     extrato usam moram aqui, não soltas nas telas. */
  const temPix = !!d.feito.recebimento;
  const pix = {
    pixFalta: !temPix,
    /* desde quando a chave existe — antes disso nada pode ter caído */
    pixDesde: temPix ? (d.pixDesde || "") : "",
    pixSelo: "Esperando sua chave Pix",
    pixEsperando: "esperando sua chave Pix",          // "R$ 711,75 esperando sua chave Pix"
    pixQuando: temPix ? prazoDoPix() : "depois que você cadastrar a chave",
    /* o passo 3 de "Como o dinheiro chega até você" */
    pixPassoTitulo: temPix ? "Cai no seu Pix " + prazoDoPix()
                           : "Cai no seu Pix depois que você cadastrar a chave",
    pixPassoFrase:  temPix ? "Contado a partir do dia em que o serviço terminou. "
                             + "Sábado e domingo não contam."
                           : "Até lá o dinheiro fica guardado com a gente, e não se perde.",
  };
  /* Antes da aprovação a chave ainda não é pedida (Portão 3) — a frase diz
     quando ela entra, em vez de prometer prazo a quem não tem chave. */
  const pixAntesDeAprovar = temPix ? {} : {
    pixPassoTitulo: "Cai no seu Pix",
    pixPassoFrase:  "A chave Pix a gente pede depois da aprovação. Com ela cadastrada, "
                  + "cada serviço cai " + prazoDoPix() + " depois de terminar.",
  };

  /* APROVADA — pode trabalhar */
  if(d.situacao === "aprovada"){
    const faltaReceber = !temPix;
    return Object.assign({
      chave: "aprovada",
      podeAceitar: true,
      /* na faixa do topo */
      faixaTitulo: faltaReceber ? "Falta onde você recebe" : "",
      faixaFrase:  faltaReceber ? "sem isso o dinheiro não tem para onde ir" : "",
      faixaDestino: "diaristaRecebimento",
      /* no interruptor */
      interruptorTravado: false,
      /* no cartão de oportunidade */
      noCartao: "",
      /* no mapa do cadastro */
      mapaFrase: "Você já pode aceitar serviços. O resto melhora seu perfil.",
      /* na tela de uma oportunidade */
      oportunidadeTitulo: "",
      oportunidadeFrase: "",
      /* na agenda e nos ganhos (R26): aprovada já trabalha, nada a explicar */
      trabalhoTitulo: "",
      trabalhoFrase: "",
      ganhosTitulo: "",
      ganhosFrase: "",
      trabalhoBotao: "",
      trabalhoDestino: "",
      /* no extrato e nos ganhos: sem Pix, o dinheiro não tem para onde ir.
         "Segue" e não "cai": depois do cadastro ele ainda leva o prazo do
         Pix para cair (A7) — e a tela mostra o dia. */
      pixTitulo: faltaReceber ? "Falta sua chave Pix" : "",
      pixFrase:  faltaReceber
        ? "Seu dinheiro fica guardado com a gente e não se perde. Ele segue "
          + "para o seu Pix assim que você cadastrar a chave."
        : "",
      pixBotao: "Cadastrar minha chave Pix",
      pixDestino: "diaristaRecebimento",
      pct: p.pct,
    }, pix);
  }

  /* EM ANÁLISE — mandou tudo, espera a gente */
  if(d.situacao === "analise" || portao2Pronto){
    return Object.assign({
      chave: "analise",
      podeAceitar: false,
      faixaTitulo: "Cadastro completo",
      faixaFrase:  "aguardando nossa aprovação",
      faixaDestino: "diaristaAnalise",
      /* Aqui a porcentagem seria contradição: ela conta também o Portão 3,
         que NÃO é exigido para aprovar. Dizer "Cadastro completo" ao lado de
         "90%" é o mesmo erro que o dono encontrou, em miniátura. */
      faixaSelo: "✓",
      faixaTrilho: 100,
      interruptorTravado: true,
      interruptorFrase: "Liga assim que a gente aprovar. Já estamos conferindo.",
      noCartao: "Você poderá aceitar assim que aprovarmos",
      mapaFrase: "Está tudo enviado. Agora é com a gente — e a gente avisa você.",
      oportunidadeTitulo: "Seu cadastro está em análise",
      oportunidadeFrase: "Você não precisa fazer mais nada. Assim que aprovarmos, "
                       + "este botão libera sozinho.",
      trabalhoTitulo: "Sua agenda começa assim que aprovarmos",
      /* a rua e o número só a partir das 18h da véspera (A13) — prometer
         "o endereço" aqui seria prometer no aceite */
      trabalhoFrase: "Está tudo enviado. Depois da aprovação, cada serviço que você "
                   + "aceitar aparece aqui, com o dia, o bairro e quanto você recebe. "
                   + "A rua e o número chegam na véspera, a partir das "
                   + HORA_DO_ENDERECO_NA_VESPERA + "h.",
      /* nos ganhos e no extrato o endereço nunca aparece — a frase da agenda
         prometeria algo que essas telas não mostram */
      ganhosTitulo: "Seus ganhos começam assim que aprovarmos",
      ganhosFrase: "Está tudo enviado. Depois da aprovação, cada serviço que você "
                 + "fizer aparece aqui, com quanto você recebe e quando cai no seu Pix.",
      trabalhoBotao: "Ver como está meu cadastro",
      trabalhoDestino: "diaristaAnalise",
      pct: p.pct,
    }, pix, pixAntesDeAprovar);
  }

  /* INCOMPLETO — ainda falta documento */
  return Object.assign({
    chave: "incompleto",
    podeAceitar: false,
    faixaTitulo: "Cadastro " + p.pct + "%",
    faixaFrase:  p.falta || "faltam os documentos para você aceitar serviços",
    faixaDestino: "diaristaCadastro",
    interruptorTravado: true,
    interruptorFrase: "Liga quando seu cadastro for aprovado.",
    noCartao: "Complete seu cadastro para aceitar",
    mapaFrase: "Complete o segundo passo para começar a aceitar serviços.",
    oportunidadeTitulo: "Falta pouco para você aceitar",
    oportunidadeFrase: "Envie seus documentos e, assim que a gente aprovar, "
                     + "este botão libera.",
    trabalhoTitulo: "Falta pouco para sua agenda começar",
    trabalhoFrase: "Envie seus documentos. Depois da aprovação, cada serviço que você "
                 + "aceitar aparece aqui, com o dia, o bairro e quanto você recebe. "
                 + "A rua e o número chegam na véspera, a partir das "
                 + HORA_DO_ENDERECO_NA_VESPERA + "h.",
    ganhosTitulo: "Falta pouco para você começar a ganhar",
    ganhosFrase: "Envie seus documentos. Depois da aprovação, cada serviço que você "
               + "fizer aparece aqui, com quanto você recebe e quando cai no seu Pix.",
    trabalhoBotao: "Continuar meu cadastro",
    trabalhoDestino: "diaristaCadastro",
    pct: p.pct,
  }, pix, pixAntesDeAprovar);
}

/* O atalho do protótipo, que precisa estar visível onde ela está esperando.

   Ele existia só dentro da tela de análise — e essa tela só era alcançável
   uma vez, no instante em que o cadastro fechava, com o histórico limpo.
   Quem saísse dali nunca mais voltava, e o dono ficou preso com o cadastro
   completo e nenhum caminho adiante. */
function atalhoDeAprovacao(){
  if(situacaoDaDiarista().chave !== "analise") return "";
  return '<div class="cartao" style="border:1.5px dashed var(--ambar);background:#FFF8EC">'
    + '<b style="font-size:13px;color:var(--ambar)">⚙ ATALHO DO PROTÓTIPO</b>'
    + '<div style="font-size:12.5px;color:var(--texto);margin-top:6px;line-height:1.55">'
    +   'No aplicativo de verdade quem aprova é a nossa equipe, depois de '
    +   'conferir os documentos — leva algumas horas. Aqui dá para pular a '
    +   'espera.</div>'
    + '<button class="btn btn-principal" style="margin:12px 0 0" '
    +   'onclick="simularAprovacao()">Simular: cadastro aprovado</button></div>';
}


/* A FAIXA DO CADASTRO — fixa no alto, fora da rolagem.

   Ela já existia como cartão no meio da tela. Em 22/08/2026 o dono abriu o
   protótipo no celular, procurou o interruptor "Disponível", não achou, e
   não achou também como continuar o cadastro. Aconteceu com ele exatamente
   o que eu tinha escrito que aconteceria sem a barra.

   Duas lições viraram este código:

   1. **Cartão no meio da lista rola para fora da tela.** Chamado para ação
      que some com o dedo não é chamado para ação. Agora é faixa fixa, no
      mesmo lugar do cabeçalho das outras telas: ela não rola nunca.

   2. **Cartão branco entre cartões brancos parece conteúdo, não botão.**
      Agora é roxa cheia, com seta — a mesma linguagem dos botões principais. */
function faixaDoCadastro(){
  const e = situacaoDaDiarista();

  /* Sem título não há o que dizer — é o caso de quem está aprovada e com
     tudo em dia. Antes a faixa sumia a 100%, o que deixou o dono a 100% e
     em análise sem faixa nenhuma: completo, esperando, e sem saber disso. */
  if(!e.faixaTitulo) return "";

  return '<button class="faixa-cadastro" onclick="ir(\'' + e.faixaDestino + '\')">'
    +   '<div class="txt">'
    +     '<b>' + esc(e.faixaTitulo) + '</b>'
    +     (e.faixaFrase ? '<span>' + esc(e.faixaFrase) + '</span>' : "")
    +   '</div>'
    +   '<div class="anel">' + (e.faixaSelo || (e.pct + "%")) + '</div>'
    +   '<div class="seta">›</div>'
    + '</button>'
    + '<div class="faixa-trilho"><div style="width:'
    +   (e.faixaTrilho !== undefined ? e.faixaTrilho : e.pct) + '%"></div></div>';
}

/* nome antigo, ainda usado na tela de perfil dela */
function barraDoCadastro(){ return faixaDoCadastro(); }


/* O INTERRUPTOR TRAVADO.

   Antes, quem não estava aprovada simplesmente não via interruptor nenhum —
   e o dono passou minutos procurando por ele no celular. Se confundiu quem
   construiu a regra, confunde qualquer diarista.

   **Ausência não explica nada.** Agora o interruptor aparece, apagado, com o
   motivo escrito e o caminho ao lado. É a mesma escolha do cadeado nas
   oportunidades: mostrar o que existe e dizer o que falta, em vez de sumir. */
function interruptorTravado(){
  const e = situacaoDaDiarista();
  return '<div class="chave travada">'
    +   '<div class="txt"><b>🔒 Disponível para trabalhar</b>'
    +     '<span>' + esc(e.interruptorFrase) + '</span></div>'
    +   '<div class="botao"></div>'
    + '</div>'
    + (e.chave === "analise"
      ? '<button class="btn btn-contorno" style="margin-bottom:14px" '
        + 'onclick="ir(\'diaristaAnalise\')">Ver como está meu cadastro</button>'
      : '<button class="btn btn-principal" style="margin-bottom:14px" '
        + 'onclick="ir(\'diaristaCadastro\')">Continuar meu cadastro</button>');
}


/* ==========================================================================
   PORTÃO 1 — ENTRAR E VER
   ========================================================================== */

/* A tela de dados já existe em telas-acesso.js (cadastroDiarista).
   Aqui ela ganha continuação. */
function salvarDadosDaDiarista(){
  const v = function(id){ const e = document.getElementById(id); return e ? e.value.trim() : ""; };
  const nome = v("dia-nome");
  if(nome.length < 3){
    document.getElementById("dia-erro").textContent = "Digite seu nome completo para continuar.";
    return;
  }
  const d = euSouDiarista();
  d.nome = nome;
  d.telefone = v("dia-tel");
  d.feito.dados = true;
  E.perfil = "diarista";
  E.logado = true;
  salvar();
  ir("diaristaRegiao");
}

TELAS.diaristaRegiao = {
  html: function(){
    const d = euSouDiarista();
    const bairros = ["Vila Madalena", "Pinheiros", "Perdizes", "Lapa", "Butantã", "Pompeia"];
    let lista = "";
    bairros.forEach(function(b){
      const marcado = d.bairros.indexOf(b) >= 0;
      lista += '<button class="opcao ' + (marcado ? "marcada" : "") + '" '
        + 'onclick="alternarBairro(\'' + b + '\')">'
        + '<div class="txt"><b>' + esc(b) + '</b></div>'
        + (marcado ? '<div class="seta">✓</div>' : "") + '</button>';
    });

    return ''
    + cabecalho("", { passos:[2,5] })
    + '<div class="corpo">'
    +   '<h2 class="titulo">Onde você quer trabalhar? 📍</h2>'
    +   '<p class="apoio">Escolha os bairros que ficam bons para você. Dá para mudar quando quiser.</p>'
    +   lista
    /* R16 revista (12/10/2026): o transporte é dela, e o valor da tela é o
       que ela recebe. Dito aqui, antes da primeira oportunidade, para ela
       nunca esperar um acréscimo que não vem. */
    +   '<div class="aviso roxo">🚶<div><b>Atendemos num raio de '
    +     DESLOCAMENTO.raioMaximoKm + ' km</b>'
    +     'De propósito: perto significa menos tempo de trânsito e mais tempo seu. '
    /* sem <b> no meio da frase: dentro do .aviso o <b> vira título, em
       linha própria (o "todo seu" de antes quebrava a frase assim) */
    +     'O transporte é por sua conta, e o valor de cada oportunidade é '
    +     'exatamente o que você recebe. Você vê o bairro e a distância '
    +     'antes de aceitar.</div></div>'
    + '</div>'
    + '<div class="rodape">'
    +   '<button class="btn btn-principal" ' + (d.bairros.length ? "" : "disabled")
    +     ' onclick="terminarPortaoUm()">Ver oportunidades na minha região</button>'
    + '</div>';
  }
};

function alternarBairro(b){
  const d = euSouDiarista();
  const i = d.bairros.indexOf(b);
  if(i >= 0) d.bairros.splice(i, 1); else d.bairros.push(b);
  salvar();
  desenhar();
}

function terminarPortaoUm(){
  const d = euSouDiarista();
  d.regiao = d.bairros.join(", ");
  d.feito.regiao = true;
  salvar();
  ir("diaristaHome", { limparHistorico:true });
}


/* --------------------------------------------------------------------------
   A HOME DELA — com oportunidades reais e cadeado
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
  { emDias:1, periodo:"manha", bairro:"Vila Madalena", km:2.1, rua:"Rua dos Ipês, 48",
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
  { emDias:3, periodo:"tarde", bairro:"Pompeia", km:6.3, rua:"Rua das Hortênsias, 64",
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

const NOME_DA_LIMPEZA = { padrao:"Limpeza padrão", completa:"Limpeza completa" };

/* Monta a lista inteira, com data, horário e o veredito da agenda.

   Só entra bairro que ela escolheu. Prometer "oportunidades na sua região" e
   listar bairro que ela não marcou é quebrar a promessa na primeira tela. */
function todasAsOportunidades(){
  const d = euSouDiarista();
  const meus = d.bairros || [];
  const dias = proximosDias(8);

  return OPORTUNIDADES
    .map(function(c, i){ return { caso:c, id:i }; })
    .filter(function(x){ return meus.length === 0 || meus.indexOf(x.caso.bairro) >= 0; })
    .map(function(x){
      const c = x.caso;
      const conta = calcularPedido(c.pedido);
      const janela = janelaDoServico(c.periodo, conta.horas);
      const tipo = NOME_DA_LIMPEZA[c.pedido.respostas.tipo] || conta.categoria.nome;
      const dia = dias[c.emDias] || dias[0];

      const o = {
        id: x.id,
        data: dia.iso,
        quando: dia.rotulo + ", " + dia.curto,
        periodo: c.periodo,
        inicio: janela ? janela.inicio : 8,
        fim: janela ? janela.fim : 12,
        bairro: c.bairro,
        km: c.km,
        janela: janela ? janela.texto : conta.horas + "h",
        horas: conta.horas,
        /* tabela + a parte dela nos adicionais, em qualquer distância (R16
           revista) — a mesma conta da agenda e do extrato, para o valor
           nunca divergir */
        receber: quantoElaRecebe(c.pedido, c.km),
        /* guardados para o aceite; NENHUMA tela anterior ao aceite usa */
        endereco: c.rua || "",
        /* já curto: o sobrenome do cliente não sai daqui (A18) */
        cliente: nomeCurto(c.cliente),
        pedido: c.pedido,
        resumo: tipo + " · " + c.pedido.respostas.comodos + " cômodos, "
              + c.pedido.respostas.banheiros
              + (c.pedido.respostas.banheiros === 1 ? " banheiro" : " banheiros"),
      };

      const veredito = cabeNaAgenda(o, d.agenda);
      o.cabe = veredito.cabe;
      o.porQueNaoCabe = veredito.motivo;
      o.regraQueBarrou = veredito.regra || "";
      /* Pelo id E pela data: as oportunidades fictícias mudam de data todo
         dia, e um aceite antigo (de agosto, com o mesmo id) escondia para
         sempre a oportunidade de amanhã — a agenda dizia "livre" e a home
         não oferecia nada naquele lugar. */
      o.jaAceito = (d.agenda || []).some(function(s){
        return s.oportunidadeId === o.id && s.data === o.data;
      });
      /* Efeito colateral do "id E data": a mesma casa fictícia volta a ser
         oferecida no dia seguinte. Quem segura o 3º dia na mesma casa em 7
         dias é o cabeNaAgenda, logo acima (R8, A15) — o teste 21 confere. */
      return o;
    });
}

/* O que ela pode aceitar: cabe na agenda e ainda não é dela. */
function oportunidadesDaRegiao(){
  return todasAsOportunidades().filter(function(o){ return o.cabe && !o.jaAceito; });
}

/* O que ficou de fora por conflito — e a tela DIZ isso.

   Sumir com a oportunidade sem explicar parece defeito, e ela ficaria
   achando que o app está escondendo trabalho dela. */
function oportunidadesQueNaoCabem(){
  return todasAsOportunidades().filter(function(o){ return !o.cabe && !o.jaAceito; });
}

/* A oportunidade aberta é procurada pelo id, não pela posição — a lista
   encolhe quando ela muda de bairro, e a posição deixaria de valer. */
function oportunidadePorId(id){
  const lista = todasAsOportunidades();
  const achada = lista.filter(function(o){ return o.id === id; })[0];
  return achada || lista[0] || null;
}

TELAS.diaristaHome = {
  html: function(){
    const d = euSouDiarista();
    const pode = podeAceitarServico();
    const lista = oportunidadesDaRegiao();

    let cards = "";
    lista.forEach(function(o){
      cards += '<button class="cartao" style="width:100%;text-align:left;border:0;font-family:inherit;'
        + 'cursor:pointer;display:block;' + (pode ? "" : "position:relative") + '" '
        + 'onclick="abrirOportunidade(' + o.id + ')">'
        +   '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">'
        +     '<div style="flex:1;min-width:0">'
        +       '<b style="font-size:15px">' + esc(o.quando) + ' · ' + esc(o.janela) + '</b>'
        +       '<div style="font-size:12.5px;color:var(--suave);margin-top:4px;line-height:1.5">'
        +         esc(o.resumo) + '<br>📍 ' + esc(o.bairro) + ' · '
        +         String(o.km).replace(".", ",") + ' km de você</div>'
        +     '</div>'
        +     '<div style="text-align:right;flex:none">'
        +       '<div style="font-size:11px;color:var(--suave)">você recebe</div>'
        +       '<div style="font-size:17px;font-weight:800;color:var(--verde)">'
        +         moeda(o.receber) + '</div>'
        +     '</div>'
        +   '</div>'
        +   (pode
          ? '<div style="display:flex;gap:8px;margin-top:12px">'
            + '<span class="btn btn-principal" style="padding:11px;font-size:14px">Ver detalhes</span></div>'
          : '<div style="display:flex;align-items:center;gap:7px;margin-top:12px;padding-top:11px;'
            + 'border-top:1px solid var(--borda);font-size:12.5px;color:var(--roxo);font-weight:600">'
            + icone("escudo", 15) + esc(situacaoDaDiarista().noCartao) + '</div>')
        + '</button>';
    });

    return ''
    /* A faixa vem ANTES do corpo: assim ela fica fora da rolagem e não some
       quando a diarista desce a lista de oportunidades. */
    + (pode ? "" : faixaDoCadastro())
    + '<div class="corpo">'
    +   '<div style="padding:6px 0 14px">'
    +     '<div style="font-size:12.5px;color:var(--suave)">📍 ' + esc(d.regiao || "sua região") + '</div>'
    +   '</div>'
    +   '<h2 class="titulo">Olá, ' + esc((d.nome || "").split(" ")[0] || "tudo bem") + '! 👋<br>'
    +     (pode ? "Veja o que tem para hoje." : "Veja o que está esperando por você.") + '</h2>'

    /* mensagem nova de um cliente, com o app fora da conversa (A18) */
    +   (pode ? cartaoDeMensagemNova("diarista") : "")

    +   (pode ? faixaDoCadastro() : interruptorTravado())

    +   (pode
      ? '<div class="chave ' + (d.disponivel ? "ligada" : "") + '" onclick="alternarDisponivel()">'
        + '<div class="txt"><b>Disponível para trabalhar</b>'
        + '<span>' + (d.disponivel
            ? (ehIPhone()
               ? "Com o aplicativo aberto, o pedido aparece aqui."
               : "O celular toca quando aparecer pedido para voc\u00ea.")
            : "Ligue para ser avisada de novos pedidos.") + '</span></div>'
        + '<div class="botao"></div></div>'
        + botaoDeTestarOSom()
        + botaoDeVerOAlerta()
        + avisoDoSomNoIPhone()
        /* Sempre vis\u00edvel, n\u00e3o s\u00f3 com a chave ligada: ela precisa poder
           acertar os dias ANTES de come\u00e7ar a receber alerta. */
        + '<button class="btn btn-texto" style="margin:-4px 0 12px;min-height:44px" '
        /* \ud83d\udcc5 e n\u00e3o \ud83d\uddd3: o segundo sai como quadradinho vazio no Windows. */
        +   'onclick="ir(\'diaristaDisponibilidade\')">\ud83d\udcc5 Meus dias de trabalho \u203a</button>'
        + avisoDeQuePausou()
        + cartaoDoAlerta()
      : "")

    +   agendaDela()
    +   cartaoDaRendaDoConjunto()
    +   '<div class="rotulo">Oportunidades na sua região</div>'
    +   (lista.length ? cards
      : '<div class="aviso roxo">🔍<div><b>Nada nos seus bairros agora</b>'
        + 'Aparecem pedidos novos o dia inteiro. Marcar mais bairros aumenta '
        + 'suas chances — dá para mudar quando quiser.</div></div>'
        + '<button class="btn btn-contorno" onclick="ir(\'diaristaRegiao\')">'
        + 'Escolher mais bairros</button>')
    +   escondidasPorConflito()
    /* A13: não "quando você aceita". A frase vale para qualquer pedido —
       quem aceita depois das 18h da véspera já vê na hora. */
    +   '<div class="rodape-seguro">Estes são pedidos reais da sua região.<br>'
    +     'Depois do aceite, a rua e o número aparecem a partir das '
    +     HORA_DO_ENDERECO_NA_VESPERA + 'h da véspera.</div>'
    +   avisoDoPushParaOTime()
    + '</div>'
    + abasDaDiarista("inicio");
  },

  /* O relógio do alerta vive aqui: desenhar() apaga todos os relógios, e o
     aoEntrar roda a cada desenho, então ele se rearma sozinho. */
  aoEntrar: function(){ relogioDoAlerta(); }
};

function alternarDisponivel(){
  const d = euSouDiarista();
  if(!podeAceitarServico()) return;
  d.disponivel = !d.disponivel;

  /* ligar de novo é sinal de vida, e apaga o aviso da pausa automática */
  E.desligouSozinho = false;
  d.ignoradosSeguidos = 0;
  if(!d.disponivel){ E.alerta = null; }
  salvar();

  /* O toque nesta chave é o que libera o som no navegador: ele só deixa
     tocar depois que a pessoa tocou em alguma coisa. Um bip curtinho aqui
     confirma para ela que o som funciona — e destrava o alerta de verdade. */
  if(d.disponivel) tocarAlerta();

  desenhar();
}

function abrirOportunidade(id){
  E.oportunidadeAberta = id;
  salvar();
  ir("diaristaOportunidade");
}

TELAS.diaristaOportunidade = {
  html: function(){
    const o = oportunidadePorId(E.oportunidadeAberta || 0);
    if(!o) return cabecalho("Oportunidade")
      + '<div class="corpo"><p class="apoio">Esta oportunidade não está mais na sua região.</p></div>';
    const pode = podeAceitarServico();

    return ''
    + cabecalho("Oportunidade")
    + '<div class="corpo">'
    +   '<div style="text-align:center;padding:6px 0 14px">'
    +     '<div style="font-size:12px;color:var(--suave)">você recebe</div>'
    +     '<div style="font-size:34px;font-weight:800;color:var(--verde)">' + moeda(o.receber) + '</div>'
    +   '</div>'
    +   '<div class="cartao">'
    +     '<div class="linha"><span class="rot">Quando</span><span class="val">' + esc(o.quando) + '</span></div>'
    +     '<div class="linha"><span class="rot">Você fica na casa</span><span class="val">' + esc(o.janela) + '</span></div>'
    +     '<div class="linha"><span class="rot">Serviço</span><span class="val">' + esc(o.resumo) + '</span></div>'
    +     '<div class="linha"><span class="rot">Região</span><span class="val">' + esc(o.bairro) + '</span></div>'
    +     '<div class="linha"><span class="rot">Distância</span><span class="val">'
    +       String(o.km).replace(".", ",") + ' km</span></div>'
    +   '</div>'
    +   (o.horas > 6
      ? '<div class="aviso roxo">☕<div><b>Janela de ' + o.horas + ' horas</b>'
        + 'Você tem direito a intervalo de descanso. A hora é você quem escolhe.</div></div>'
      : "")
    /* A13: o trajeto pesa na decisão de aceitar — por isso ela fica sabendo
       AQUI, antes de aceitar, o dia em que a rua aparece */
    +   '<div class="rodape-seguro">' + esc(quandoARuaApareceSeAceitar(o)) + '</div>'
    + '</div>'
    + '<div class="rodape">'
    +   (pode
      ? '<button class="btn btn-principal" onclick="aceitarOportunidade()">Aceitar este serviço</button>'
        + '<button class="btn btn-texto" onclick="voltar()">Agora não</button>'
      : (function(){
          const e = situacaoDaDiarista();
          return '<div class="aviso roxo" style="margin:0 0 10px">' + icone("escudo", 18)
            + '<div><b>' + esc(e.oportunidadeTitulo) + '</b>'
            + esc(e.oportunidadeFrase) + '</div></div>'
            + (e.chave === "analise"
              ? '<button class="btn btn-contorno" onclick="ir(\'diaristaAnalise\')">'
                + 'Ver como está meu cadastro</button>'
              : '<button class="btn btn-principal" onclick="ir(\'diaristaCadastro\')">'
                + 'Completar meu cadastro</button>');
        })())
    + '</div>';
  }
};

/* O serviço que ela acabou de aceitar, para a tela do aceite dizer quando a
   rua aparece NELE. Sem o registro (um dado antigo, de antes de 12/10/2026),
   fica o último que entrou na agenda. */
function servicoQueAcabouDeAceitar(){
  const agenda = euSouDiarista().agenda || [];
  const a = E.aceitoAgora;
  const achado = a ? agenda.filter(function(s){
    return s.oportunidadeId === a.oportunidadeId && s.data === a.data;
  })[0] : null;
  return achado || agenda[agenda.length - 1] || null;
}

TELAS.diaristaAceitou = {
  html: function(){
    /* A13: "o endereço completo já está na sua agenda" só é verdade a partir
       das 18h da véspera. Antes disso a tela diz o dia em que a rua chega. */
    const s = servicoQueAcabouDeAceitar();
    const jaTemARua = !!s && enderecoLiberado(s, relogioDaAgenda());
    return ''
    + '<div class="centro">'
    +   '<div class="circulo-ok">✓</div>'
    +   '<h2 class="titulo">Pedido aceito! ✅</h2>'
    +   (jaTemARua
      ? '<p class="apoio">Combinamos com o cliente. O endereço completo já está na sua agenda.</p>'
      : '<p class="apoio">Combinamos com o cliente. O serviço já está na sua agenda, '
        + 'com o bairro e a distância.</p>'
        + '<div class="aviso roxo" style="text-align:left;margin:4px 0 0">🔒<div>'
        +   '<b>' + esc(s ? fraseDaRuaNaVespera(s) : "A rua e o número aparecem a partir das "
                       + HORA_DO_ENDERECO_NA_VESPERA + "h da véspera.") + '</b>'
        +   'É para proteger a casa do cliente. Até lá, o bairro e a distância já '
        +   'ajudam você a planejar o caminho.</div></div>')
    + '</div>'
    + '<div class="rodape">'
    +   '<button class="btn btn-principal" onclick="ir(\'diaristaHome\',{limparHistorico:true})">Voltar ao início</button>'
    /* a frase de cima aponta para a agenda — então tem que dar para ir lá */
    +   '<button class="btn btn-texto" style="min-height:44px" '
    +     'onclick="ir(\'diaristaAgenda\',{limparHistorico:true})">Ver na minha agenda ›</button>'
    + '</div>';
  }
};


/* ==========================================================================
   PORTÃO 2 — PODER ACEITAR
   A tela-mapa do cadastro: mostra os três portões e o que falta em cada um.
   ========================================================================== */
TELAS.diaristaCadastro = {
  html: function(){
    const d = euSouDiarista();
    const p = progressoDoCadastro();
    const est = situacaoDaDiarista();

    function passo(feito, titulo, detalhe, destino, bloqueado){
      return '<button class="item" ' + (bloqueado ? "disabled" : 'onclick="ir(\'' + destino + '\')"') + '>'
        + '<div style="width:26px;color:' + (feito ? "var(--verde)" : "var(--roxo)") + '">'
        +   (feito ? icone("escudo", 20) : '<span style="font-size:19px">○</span>') + '</div>'
        + '<div class="txt"><b>' + esc(titulo) + '</b><span>' + esc(detalhe) + '</span></div>'
        + (feito ? '<span class="selo verde">feito</span>' : '<div class="seta">›</div>')
        + '</button>';
    }

    return ''
    + cabecalho("Meu cadastro")
    + '<div class="corpo">'
    +   '<h2 class="titulo">' + (est.chave === "analise"
        ? "Cadastro completo ✅" : "Cadastro " + p.pct + "%") + '</h2>'
    +   '<p class="apoio">' + esc(est.mapaFrase) + '</p>'
    +   atalhoDeAprovacao()

    +   '<div class="rotulo">1 · Entrar e ver <span class="selo verde">feito</span></div>'
    +   passo(d.feito.dados,  "Seus dados", "Nome e telefone", "diaristaCadastro", true)
    +   passo(d.feito.regiao, "Onde você trabalha", d.regiao || "—", "diaristaRegiao")

    +   '<div class="rotulo">2 · Para poder aceitar</div>'
    +   passo(d.feito.documentos,   "Documento com foto", "RG ou CNH, e CPF", "diaristaDocumentos")
    +   passo(d.feito.selfie,       "Selfie", "Para conferir que é você mesma", "diaristaSelfie")
    +   passo(d.feito.antecedentes, "Antecedentes", "A gente consulta, você não faz nada", "diaristaAntecedentes")
    +   passo(d.feito.termos,       "Termos e regras", "Leitura rápida", "diaristaTermos")

    +   '<div class="rotulo">3 · Para poder receber</div>'
    +   passo(d.feito.recebimento, "Onde você recebe", "Pix ou conta bancária", "diaristaRecebimento")
    +   passo(d.feito.experiencia, "Sua experiência", "Melhora sua posição na fila", "diaristaExperiencia")

    +   '<div class="aviso roxo">🔒<div><b>Por que só agora pedimos documento</b>'
    +     'Você já viu quanto pode ganhar aqui. Agora sim faz sentido a gente '
    +     'conferir quem você é — é o que dá segurança ao cliente e o que '
    +     'permite você entrar na casa dele.</div></div>'
    + '</div>';
  }
};

/* A ORDEM DO PORTÃO 2 — cada etapa emenda na seguinte.

   Voltar ao mapa do cadastro depois de cada etapa custaria quatro toques a
   mais no meio do caminho mais frágil do aplicativo. Ela segue direto, e só
   cai no mapa quando o portão inteiro termina. */
const ORDEM_DO_PORTAO_2 = [
  { etapa:"documentos",   tela:"diaristaDocumentos"   },
  { etapa:"selfie",       tela:"diaristaSelfie"       },
  { etapa:"antecedentes", tela:"diaristaAntecedentes" },
  { etapa:"termos",       tela:"diaristaTermos"       },
];

function proximaEtapaDoPortaoDois(){
  const d = euSouDiarista();
  const falta = ORDEM_DO_PORTAO_2.filter(function(x){ return !d.feito[x.etapa]; })[0];
  return falta ? falta.tela : null;
}

function marcarEtapa(nome, destino){
  const d = euSouDiarista();
  if(nome === "recebimento") anotarChavePix(d);   // guarda também o dia da chave
  d.feito[nome] = true;
  salvar();

  if(destino){ ir(destino); return; }

  /* Ainda falta alguma etapa do Portão 2? Emenda direto nela. */
  const seguinte = proximaEtapaDoPortaoDois();
  if(seguinte && ORDEM_DO_PORTAO_2.some(function(x){ return x.etapa === nome; })){
    ir(seguinte);
    return;
  }

  /* Terminou o Portão 2 inteiro? Vai para análise. */
  if(d.situacao === "novo" && !seguinte){
    d.situacao = "analise";
    salvar();
    ir("diaristaAnalise", { limparHistorico:true });
    return;
  }

  ir("diaristaCadastro");
}

/* --- documentos --- */
TELAS.diaristaDocumentos = {
  html: function(){
    const docs = [
      { nome:"RG ou CNH", detalhe:"Documento oficial com foto", chave:"documento" },
      { nome:"CPF", detalhe:"Se não estiver no documento acima", chave:"cpf" },
      { nome:"Comprovante de endereço", detalhe:"Conta de luz, água ou telefone", chave:"comprovante" },
    ];
    let lista = "";
    docs.forEach(function(x){
      lista += '<div class="opcao" style="cursor:default">'
        + '<div class="icone">' + icone("documento", 21) + '</div>'
        + '<div class="txt"><b>' + esc(x.nome) + '</b><span>' + esc(x.detalhe) + '</span></div>'
        + '<div style="font-size:20px;color:var(--roxo)">📷</div></div>';
    });
    return ''
    + cabecalho("", { passos:[3,5] })
    + '<div class="corpo">'
    +   '<h2 class="titulo">Envie seus documentos</h2>'
    +   '<p class="apoio">São conferidos por uma pessoa da nossa equipe, não por robô.</p>'
    +   lista
    +   '<div class="aviso verde">' + icone("escudo", 18) + '<div><b>Seus documentos ficam guardados</b>'
    +     'O cliente nunca vê seu documento. Ele vê apenas que você foi verificada.</div></div>'
    + '</div>'
    + '<div class="rodape">'
    +   '<button class="btn btn-principal" onclick="marcarEtapa(\'documentos\')">Enviei os três</button>'
    + '</div>';
  }
};

/* --- selfie --- */
TELAS.diaristaSelfie = {
  html: function(){
    return ''
    + cabecalho("", { passos:[4,5] })
    + '<div class="corpo">'
    +   '<h2 class="titulo">Agora uma selfie 🤳</h2>'
    +   '<p class="apoio">Comparamos com a foto do documento para confirmar que é você.</p>'
    +   '<div class="cartao" style="text-align:center;padding:36px 16px">'
    +     '<div style="color:var(--roxo);display:flex;justify-content:center;margin-bottom:12px">'
    +       icone("rosto", 52) + '</div>'
    +     '<div style="font-size:13.5px;color:var(--suave);line-height:1.6">'
    +       'Fique num lugar claro,<br>sem boné e sem óculos escuros.</div>'
    +   '</div>'
    +   '<div class="aviso roxo">🔒<div><b>Esta foto não vira foto de perfil</b>'
    +     'Ela serve só para a conferência. Sua foto de perfil você escolhe depois.</div></div>'
    + '</div>'
    + '<div class="rodape">'
    +   '<button class="btn btn-principal" onclick="marcarEtapa(\'selfie\')">Tirar selfie</button>'
    + '</div>';
  }
};

/* --- antecedentes --- */
TELAS.diaristaAntecedentes = {
  html: function(){
    const itens = ["Consulta criminal", "Processos judiciais", "Restrições financeiras"];
    let lista = "";
    itens.forEach(function(i){
      lista += '<div style="display:flex;align-items:center;gap:10px;padding:11px 0;'
        + 'border-bottom:1px solid var(--borda);font-size:14px">'
        + '<span style="color:var(--verde)">' + icone("escudo", 18) + '</span>' + esc(i) + '</div>';
    });
    return ''
    + cabecalho("", { passos:[5,5] })
    + '<div class="corpo">'
    +   '<h2 class="titulo">Verificação de antecedentes</h2>'
    +   '<p class="apoio">Para a segurança de todos, verificamos seus antecedentes. '
    +     'Você não precisa fazer nada — nós consultamos.</p>'
    +   '<div class="cartao">' + lista + '</div>'
    +   '<p class="ajuda">Esta etapa pode levar alguns minutos.</p>'
    + '</div>'
    + '<div class="rodape">'
    +   '<button class="btn btn-principal" onclick="marcarEtapa(\'antecedentes\')">Autorizar consulta</button>'
    + '</div>';
  }
};

/* --- termos --- */
TELAS.diaristaTermos = {
  html: function(){
    const regras = [
      ["Você escolhe quando trabalhar", "Ficar indisponível não penaliza você."],
      ["Dispensar pedido não é falta", "Recusar é seu direito. Só faltar sem avisar é problema."],
      ["Avaliação baixa vem com motivo", "E você pode contestar."],
      ["O combinado é o escopo", "Dentro da janela, você organiza seu tempo — inclusive a pausa."],
    ];
    let lista = "";
    regras.forEach(function(r){
      lista += '<div class="cartao" style="margin-bottom:10px">'
        + '<b style="font-size:14px">' + esc(r[0]) + '</b>'
        + '<div style="font-size:13px;color:var(--suave);margin-top:4px;line-height:1.5">'
        + esc(r[1]) + '</div></div>';
    });
    return ''
    + cabecalho("Termos e regras")
    + '<div class="corpo">'
    +   '<h2 class="titulo">Como funciona aqui</h2>'
    +   '<p class="apoio">Quatro regras que valem dos dois lados.</p>'
    +   lista
    +   '<div class="chave" id="chave-termos-dia" onclick="alternarChaveVisual(this)">'
    +     '<div class="txt"><b>Li e aceito os termos</b>'
    +     '<span>Regras de conduta e política de cancelamento.</span></div>'
    +     '<div class="botao"></div></div>'
    +   '<div id="dia-termos-erro" style="color:var(--vermelho);font-size:13px;font-weight:600"></div>'
    + '</div>'
    + '<div class="rodape">'
    +   '<button class="btn btn-principal" onclick="aceitarTermosDaDiarista()">Continuar</button>'
    + '</div>';
  }
};

function aceitarTermosDaDiarista(){
  const c = document.getElementById("chave-termos-dia");
  if(!c || !c.classList.contains("ligada")){
    document.getElementById("dia-termos-erro").textContent = "Para continuar, aceite os termos.";
    return;
  }
  marcarEtapa("termos");
}

/* --- análise e aprovação --- */
TELAS.diaristaAnalise = {
  html: function(){
    return ''
    + '<div class="centro">'
    +   '<div class="pulsando" style="font-size:60px">🔎</div>'
    +   '<h2 class="titulo">Seu cadastro está em análise</h2>'
    +   '<p class="apoio">Uma pessoa da nossa equipe está conferindo seus documentos. '
    +     'Costuma levar algumas horas — a gente avisa assim que terminar.</p>'
    +   '<div class="girando roxo"></div>'
    + '</div>'
    + '<div class="corpo" style="flex:none">' + atalhoDeAprovacao() + '</div>'
    + '<div class="rodape">'
    +   '<button class="btn btn-principal" onclick="ir(\'diaristaHome\',{limparHistorico:true})">'
    +     'Ver oportunidades enquanto isso</button>'
    + '</div>';
  }
};

function simularAprovacao(){
  const d = euSouDiarista();
  d.situacao = "aprovada";
  salvar();
  ir("diaristaAprovada", { limparHistorico:true });
}

TELAS.diaristaAprovada = {
  html: function(){
    return ''
    + '<div class="centro">'
    +   '<div class="circulo-ok">✓</div>'
    +   '<h2 class="titulo">Cadastro aprovado! 🎉</h2>'
    +   '<p class="apoio">Agora é só ficar disponível e aceitar os serviços que combinarem com você.</p>'
    +   '<div class="aviso verde" style="text-align:left">' + icone("escudo", 18)
    +     '<div><b>Você está verificada</b>'
    +     'Documento conferido, identidade confirmada e antecedentes verificados. '
    +     'O cliente vê esses selos no seu perfil.</div></div>'
    + '</div>'
    + '<div class="rodape">'
    +   '<button class="btn btn-principal" onclick="ir(\'diaristaHome\',{limparHistorico:true})">'
    +     'Ver oportunidades</button>'
    + '</div>';
  }
};


/* ==========================================================================
   PORTÃO 3 — PODER RECEBER
   ========================================================================== */
TELAS.diaristaRecebimento = {
  html: function(){
    return ''
    + cabecalho("Onde você recebe")
    + '<div class="corpo">'
    +   '<h2 class="titulo">Onde você quer receber? 💰</h2>'
    +   '<p class="apoio">Pedimos isto só agora, porque agora existe dinheiro para você receber.</p>'
    +   '<div class="campo"><label>Chave Pix</label>'
    +     '<input type="text" id="dia-pix" placeholder="CPF, telefone ou e-mail"></div>'
    +   '<div id="dia-pix-erro" style="color:var(--vermelho);font-size:13px;font-weight:600"></div>'
    +   '<div class="aviso verde">' + icone("escudo", 18) + '<div><b>Pagamento garantido</b>'
    +     'O valor do serviço fica retido antes de você começar. Se o cliente sumir, '
    +     'você recebe do mesmo jeito.</div></div>'
    + '</div>'
    + '<div class="rodape">'
    +   '<button class="btn btn-principal" onclick="salvarChavePix()">Salvar</button>'
    + '</div>';
  }
};

/* Quem chega aqui pelos ganhos ou pelo extrato ("Cadastrar minha chave Pix")
   volta para lá depois de salvar — é lá que ela vê o dinheiro mudar de
   "esperando sua chave" para "a caminho". Antes caía no mapa do cadastro, e
   o voltar passava de novo por esta tela. Vindo de qualquer outro lugar,
   segue como sempre (marcarEtapa).

   Campo vazio não salva: é este botão que tira o aviso da chave dos ganhos
   e manda o dinheiro para o Pix — "cadastrar" sem chave nenhuma seria
   prometer um dinheiro que não tem para onde ir. */
function salvarChavePix(){
  const campo = document.getElementById("dia-pix");
  if(!campo || !campo.value.trim()){
    const erro = document.getElementById("dia-pix-erro");
    if(erro) erro.textContent = "Falta a chave Pix. Pode ser seu CPF, telefone ou e-mail.";
    if(campo) campo.focus();
    return;
  }
  const anterior = E.historico[E.historico.length - 1];
  if(anterior === "diaristaGanhos" || anterior === "diaristaExtrato"){
    const d = euSouDiarista();
    anotarChavePix(d);
    d.feito.recebimento = true;
    salvar();
    voltar();
    return;
  }
  marcarEtapa("recebimento");
}

/* Guarda o DIA em que a chave passou a existir — só na primeira vez. Trocar
   a chave depois não pode "descair" o dinheiro que já caiu. */
function anotarChavePix(d){
  if(!d.feito.recebimento) d.pixDesde = hojeIso();
}

TELAS.diaristaExperiencia = {
  html: function(){
    const opcoes = ["Limpeza do dia a dia", "Limpeza pesada", "Organização", "Passar roupas", "Pós-obra", "Área externa"];
    let lista = "";
    opcoes.forEach(function(o){
      lista += '<span class="selo" style="margin:0 6px 8px 0;cursor:pointer">' + esc(o) + '</span>';
    });
    return ''
    + cabecalho("Sua experiência")
    + '<div class="corpo">'
    +   '<h2 class="titulo">Conte um pouco de você</h2>'
    +   '<p class="apoio">Isto não é obrigatório — mas quem preenche recebe mais oportunidades.</p>'
    +   '<div class="rotulo">Há quanto tempo você trabalha com limpeza?</div>'
    +   '<div class="campo"><input type="text" placeholder="Ex.: 5 anos"></div>'
    +   '<div class="rotulo">No que você é boa</div>'
    +   '<div>' + lista + '</div>'
    +   '<div class="rotulo">Uma frase sobre você</div>'
    +   '<div class="campo"><textarea placeholder="Ex.: Sou caprichosa e gosto de deixar tudo no lugar."></textarea></div>'
    + '</div>'
    + '<div class="rodape">'
    +   '<button class="btn btn-principal" onclick="marcarEtapa(\'experiencia\')">Salvar</button>'
    + '</div>';
  }
};





/* O que ela já aceitou, no alto da tela — é o que dá sentido ao resto:
   sem ver a própria agenda, "esse horário não cabe" vira mistério. */
function agendaDela(){
  const d = euSouDiarista();
  /* Comparava data + hora como TEXTO: "2026-10-13" + 16 vinha antes de
     "2026-10-13" + 8, porque "1" < "8". Só aparecia com dois serviços no
     mesmo dia — o que a demonstração passou a ter em 12/10/2026.

     E o que já terminou sai daqui, como sai da agenda (A8): senão a mesma
     tela dizia "Você já tem: hoje, 12h às 16h" depois das 16h, logo acima
     do cartão da renda do conjunto, que já não contava esse serviço. */
  const marcados = (d.agenda || []).filter(function(s){ return !servicoJaTerminou(s); })
    .sort(function(a, b){
    if(a.data !== b.data) return a.data < b.data ? -1 : 1;
    return a.inicio - b.inicio;
  });
  if(!marcados.length) return "";

  let itens = "";
  marcados.forEach(function(s){
    itens += '<div class="linha"><span class="rot">' + esc(dataPorExtenso(s.data))
      + '</span><span class="val">' + s.inicio + 'h às ' + s.fim + 'h · '
      + esc(s.bairro) + '</span></div>';
  });
  return '<div class="rotulo">Você já tem</div><div class="cartao">' + itens + '</div>';
}

/* O que NÃO aparece, e por quê.

   Sumir com a oportunidade sem explicar parece defeito — ela ficaria
   achando que o app está escondendo trabalho dela. Dizer o motivo transforma
   uma ausência suspeita numa proteção visível. */
function escondidasPorConflito(){
  const fora = oportunidadesQueNaoCabem();
  if(!fora.length) return "";
  let itens = "";
  fora.forEach(function(o){
    itens += '<div style="font-size:12.5px;color:var(--suave);padding:7px 0;line-height:1.5">'
      + '· ' + esc(o.quando) + ', ' + esc(o.bairro) + ' — ' + esc(o.porQueNaoCabe) + '</div>';
  });
  /* A explicação de baixo acompanha o motivo: a da folga não explica o
     limite da mesma casa (A15), e vice-versa. */
  const porCasa = fora.some(function(o){ return o.regraQueBarrou === "casa"; });
  const porAgenda = fora.some(function(o){ return o.regraQueBarrou !== "casa"; });
  const nota = function(t){
    return '<div style="font-size:11.5px;color:var(--suave);margin-top:5px;line-height:1.5">' + t + '</div>';
  };
  return '<div class="cartao" style="background:transparent;box-shadow:none;'
    + 'border:1px dashed var(--borda);padding:13px 15px">'
    + '<b style="font-size:13px">' + fora.length
    + (fora.length === 1 ? ' pedido não aparece' : ' pedidos não aparecem')
    + ' na sua lista</b>' + itens
    + (porAgenda
      ? nota('A gente separa ' + AGENDA.folgaEntreServicosMinutos + ' minutos entre um serviço e '
             + 'outro, para você ter tempo de chegar sem correria.') : "")
    + (porCasa
      ? nota('Na mesma casa, no máximo ' + AGENDA.diasNaMesmaCasaPorSemana + ' dias por semana: '
             + 'com ' + (AGENDA.diasNaMesmaCasaPorSemana + 1) + ', a lei trata como emprego, '
             + 'e não como diária.') : "")
    + '</div>';
}

/* ⚠️ O aviso mais importante desta tela — e ele é para o TIME DE
   DESENVOLVIMENTO, não para a diarista. Fica visível de propósito: um
   protótipo que parece pronto e não está é pior que um que assume o que
   falta. */
function avisoDoPushParaOTime(){
  function linha(faz, texto){
    return '<div style="display:flex;gap:8px;align-items:flex-start;padding:3px 0">'
      + '<span style="flex:none;width:16px">' + (faz ? "✅" : "❌") + '</span>'
      + '<span>' + texto + '</span></div>';
  }

  return '<div class="cartao" style="border:2px solid var(--ambar);background:#FFF8EC;'
    + 'margin-top:16px">'
    + '<b style="font-size:14px;color:var(--ambar)">'
    +   '⚠️ ESTE PROTÓTIPO NÃO DEMONSTRA O ALERTA</b>'

    + '<div style="font-size:12.5px;color:var(--texto);margin-top:9px;line-height:1.6">'
    +   'O que você acabou de ouvir é <b>o desenho da tela</b>, não o alerta. '
    +   'Um site não consegue avisar ninguém com o aplicativo fechado — e é '
    /* Sem citar aplicativo de mensagem por nome: o teste 3 varre as telas
       atrás de contato vazado, e ele está certo em não abrir exceção para
       texto que "é só um exemplo". Regra com exceção deixa de ser regra. */
    +   'exatamente assim que a diarista vai estar: no ônibus, dentro de outro '
    +   'serviço, respondendo uma mensagem.</div>'

    + '<div style="font-size:12.5px;margin-top:11px;line-height:1.5">'
    +   linha(true,  'som gerado por código, repetindo a cada '
                   + DISPONIBILIDADE.repeteOSomACadaSegundos + 's')
    +   linha(true,  'vibração junto, no Android')
    +   linha(false, '<b>com o app fechado</b> — impossível num site')
    +   linha(false, '<b>no modo silencioso</b>')
    +   linha(false, '<b>na central de notificações</b>')
    +   linha(false, '<b>botões Aceitar / Agora não no aviso</b>')
    + '</div>'

    + '<div style="font-size:12.5px;color:var(--texto);margin-top:11px;padding-top:11px;'
    +   'border-top:1px solid #EBD9B8;line-height:1.6">'
    +   '<b>As quatro linhas vermelhas são o produto</b>, e nenhuma delas dá para '
    +   'ver aqui. Quem for construir <b>precisa ler <code>ESPEC-ALERTA.md</code></b>, '
    +   'na pasta do projeto: está tudo lá, inclusive o que depende de aprovação '
    +   'da Apple e do Google.</div></div>';
}

/* Aceitar de verdade: entra na agenda dela. É isto que faz o próximo pedido
   do mesmo horário parar de aparecer. */
function aceitarOportunidade(){
  const d = euSouDiarista();
  if(!podeAceitarServico()) return;               // a trava, de novo e por último

  const o = oportunidadePorId(E.oportunidadeAberta || 0);
  if(!o) return;

  /* confere outra vez na hora de aceitar: entre ver e tocar, ela pode ter
     aceitado outro pedido pelo alerta */
  const veredito = cabeNaAgenda(o, d.agenda);
  if(!veredito.cabe){
    E.recusadoPelaAgenda = veredito.motivo;
    salvar();
    ir("diaristaConflito");
    return;
  }

  d.agenda = (d.agenda || []).concat([{
    oportunidadeId: o.id, data: o.data, inicio: o.inicio, fim: o.fim,
    bairro: o.bairro, resumo: o.resumo, receber: o.receber,
    /* o que a agenda e o extrato precisam (R26): o endereço completo — que
       fica guardado, mas só APARECE a partir das 18h da véspera (A13,
       enderecoLiberado) — e o pedido, para o extrato refazer a conta pelas
       regras em vez de confiar num número guardado */
    periodo: o.periodo, km: o.km, endereco: o.endereco,
    pedido: JSON.parse(JSON.stringify(o.pedido || null)),
    /* "Carla M.", para o detalhe do serviço (A18) — nunca o sobrenome */
    cliente: o.cliente || "",
    /* a hora do aceite: quem aceita depois das 18h da véspera conversa na
       hora, e nenhuma mensagem de exemplo pode ser de antes do aceite */
    aceitoEm: relogioDaAgenda().getTime(),
  }]);
  /* para a tela do aceite dizer quando a rua aparece NESTE serviço */
  E.aceitoAgora = { oportunidadeId: o.id, data: o.data };
  E.alerta = null;
  d.ignoradosSeguidos = 0;
  salvar();
  ir("diaristaAceitou", { limparHistorico:true });
}

/* Quando o horário some debaixo dela. Raro, mas precisa ter tela: um "não"
   sem explicação parece defeito do aplicativo. */
TELAS.diaristaConflito = {
  html: function(){
    return ''
    + cabecalho("Não deu")
    + '<div class="corpo">'
    +   '<div class="centro" style="flex:none;padding:20px 6px 6px">'
    +     '<div class="emojao">📅</div>'
    +     '<h2 class="titulo">Esse horário não cabe mais</h2>'
    +     '<p class="apoio">' + esc(E.recusadoPelaAgenda || "Você já tem serviço nesse dia.")
    +       '.<br>Nada foi anotado contra você.</p>'
    +   '</div>'
    + '</div>'
    + '<div class="rodape">'
    +   '<button class="btn btn-principal" onclick="ir(\'diaristaHome\',{limparHistorico:true})">'
    +     'Ver outros pedidos</button>'
    + '</div>';
  }
};

/* ==========================================================================
   O ALERTA (decisão R22)

   É a ideia central do produto: o cliente pede, e quem está disponível perto
   é avisada. Sem isso a plataforma vira catálogo.

   ⚠️  PARA O TIME DE DESENVOLVIMENTO — O QUE ESTE PROTÓTIPO NÃO FAZ

   Aqui o som só toca com o aplicativo ABERTO na tela dela. Um site não
   consegue tocar nada com o aplicativo fechado ou o celular no bolso — e é
   exatamente assim que a diarista vai estar na vida real.

   NO APLICATIVO DE VERDADE isto é NOTIFICAÇÃO PUSH do celular (APNs no
   iPhone, FCM no Android), que chega com a tela apagada, faz o aparelho
   tocar e vibrar, e abre no serviço certo quando ela toca no aviso.

   **Isso não é detalhe de acabamento: é o coração do produto.** Um alerta
   que só funciona com o app aberto é o mesmo que alerta nenhum. Está
   escrito também na tela, em cima, para ninguém achar que está pronto.
   ========================================================================== */

/* O SOM, FABRICADO POR CÓDIGO.

   Não existe arquivo de som no projeto, e não vai existir: a regra da stack
   é nada de arquivo externo, nada de baixar nada. O navegador consegue
   sintetizar o som na hora — duas notas curtas, como um sino.

   E ele só deixa tocar depois que a pessoa tocou em alguma coisa. Como ela
   acabou de tocar em "Disponível", esse toque é justamente o que libera. */
/* ==========================================================================
   O SOM — e por que a primeira versão não tocava no iPhone

   O dono testou no iPhone e não ouviu nada. A primeira versão usava Web
   Audio, criando um contexto de som novo a cada toque. Isso tinha TRÊS
   problemas, todos específicos do iPhone:

   1. **Contexto criado fora de um toque nasce mudo.** O iPhone só libera som
      para o contexto criado DENTRO de um toque da pessoa. O primeiro bip
      (no toque da chave "Disponível") até saía; do segundo em diante o som
      vinha do relógio, sem toque nenhum — e nascia suspenso, mudo.

   2. **O iPhone limita quantos contextos de som existem** (por volta de 4).
      Criando um a cada 15 segundos, os seguintes simplesmente falhavam.

   3. **Web Audio obedece à chavinha de silencioso.** Mesmo tudo certo, com
      o celular no mudo não sai som nenhum.

   A SAÍDA: um elemento <audio> comum, com o som fabricado em código e
   entregue como texto (data URI). No iPhone o <audio> usa o canal de mídia,
   que **não obedece à chavinha de silencioso** — é por isso que vídeo no
   Safari toca com o celular no mudo. E, uma vez liberado por um toque, ele
   pode ser tocado de novo pelo relógio, quantas vezes for preciso.

   ⚠️ Continua sem arquivo externo: o som é CALCULADO aqui, amostra por
   amostra, e vira texto. Nada é baixado.
   ========================================================================== */

/* Fabrica um WAV de duas notas curtas e devolve como texto. */
function fabricarSomDeAlerta(){
  const taxa = 22050;
  const partes = [
    { hz: 880,    dur: 0.15 },
    { hz: 0,      dur: 0.04 },   // silêncio entre as notas
    { hz: 1174.7, dur: 0.17 },
  ];
  let amostras = 0;
  partes.forEach(function(p){ amostras += Math.floor(p.dur * taxa); });

  const bytes = 44 + amostras * 2;
  const buf = new ArrayBuffer(bytes);
  const v = new DataView(buf);
  function escrever(pos, txt){
    for(let i = 0; i < txt.length; i++) v.setUint8(pos + i, txt.charCodeAt(i));
  }
  /* cabeçalho WAV: mono, 16 bits */
  escrever(0, "RIFF");  v.setUint32(4, bytes - 8, true);  escrever(8, "WAVE");
  escrever(12, "fmt "); v.setUint32(16, 16, true);        v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);      v.setUint32(24, taxa, true);
  v.setUint32(28, taxa * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  escrever(36, "data"); v.setUint32(40, amostras * 2, true);

  let pos = 44;
  partes.forEach(function(p){
    const n = Math.floor(p.dur * taxa);
    for(let k = 0; k < n; k++){
      let amostra = 0;
      if(p.hz){
        /* sobe e desce o volume nas bordas, senão estala */
        const env = Math.min(1, k / 220, (n - k) / 600);
        amostra = Math.sin(2 * Math.PI * p.hz * k / taxa) * env * 0.75;
      }
      v.setInt16(pos, Math.max(-1, Math.min(1, amostra)) * 32767, true);
      pos += 2;
    }
  });

  let texto = "";
  const arr = new Uint8Array(buf);
  for(let i = 0; i < arr.length; i++) texto += String.fromCharCode(arr[i]);
  return "data:audio/wav;base64," + btoa(texto);
}

let SOM_DO_ALERTA = null;

/* Toca. Precisa ter sido chamada UMA vez de dentro de um toque dela — e foi:
   o toque na chave "Disponível" é exatamente isso. Daí em diante o relógio
   pode tocar sozinho. */
function tocarAlerta(){
  try{
    if(!SOM_DO_ALERTA){
      SOM_DO_ALERTA = new Audio(fabricarSomDeAlerta());
      SOM_DO_ALERTA.preload = "auto";
      SOM_DO_ALERTA.setAttribute("playsinline", "");
    }
    SOM_DO_ALERTA.currentTime = 0;
    const promessa = SOM_DO_ALERTA.play();
    if(promessa && promessa.then){
      promessa.then(function(){ E.somBloqueado = false; })
              .catch(function(){ E.somBloqueado = true; });
    }
  }catch(e){ E.somBloqueado = true; }

  /* quantas vezes já tocou neste alerta — aparece na tela, para dar para
     saber se o som foi PEDIDO mesmo quando não dá para ouvir */
  E.toquesDoAlerta = (E.toquesDoAlerta || 0) + 1;

  /* vibração: funciona no Android; o iPhone ignora sem reclamar */
  try{ if(navigator.vibrate) navigator.vibrate([140, 70, 140]); }catch(e){}
}

/* Botão de testar o som.

   Existe porque eu NÃO consigo testar no iPhone do dono — o navegador dos
   meus testes não tem alto-falante. Sem isto, a única forma de saber se o
   som funciona é ele tentar e me contar. */
function testarOSom(){
  E.toquesDoAlerta = 0;
  tocarAlerta();
  E.testouOSom = true;
  salvar();
  agendar(desenhar, 400);
}



/* O botão de testar o som.

   Existe porque eu não consigo testar no celular do dono: o navegador dos
   meus testes não tem alto-falante. Sem isto, a única forma de saber se o
   som sai é esperar o alerta chegar e torcer.

   E ele também é o desbloqueio: o iPhone só libera som depois de um toque
   dela, e este é um toque. */
/* --------------------------------------------------------------------------
   O QUE O iPHONE NÃO FAZ — e por que paramos de tentar (22/08/2026)

   Três tentativas de fazer o som tocar sozinho no Safari do iPhone. Nenhuma
   funcionou: o dono ouve o som quando toca no botão de testar, e não ouve
   quando o alerta chega sozinho.

   A investigação dessa terceira vez chegou numa conclusão diferente das
   outras duas: **o problema não é o código.**

   O que o produto precisa é que o celular chame a atenção dela quando ela
   NÃO está olhando para o aplicativo — celular no bolso, tela apagada. E
   isso um site não faz no iPhone, de jeito nenhum: quando o Safari sai da
   frente, o iOS congela a página. Relógio parado, nada toca. Não existe
   truque, biblioteca ou permissão que contorne isso, porque não é uma
   trava do Safari — é como o iOS administra bateria.

   Sobra o caso de a tela estar acesa e o aplicativo aberto. Aí é
   teoricamente possível (destravar o elemento de som num toque e reusá-lo
   depois), e é exatamente o que o código abaixo faz. Continua sem tocar
   para o dono. **E eu não tenho iPhone para investigar** — só sei o que ele
   me conta.

   Então: para de tentar. O som automático fica valendo para Android e
   computador, e no iPhone a tela **diz a verdade** em vez de fingir que
   funciona. Quem depende disso é o aplicativo nativo, na seção 3 do
   ESPEC-ALERTA.md.

   Esconder essa limitação seria pior: uma diarista de iPhone confiaria num
   alerta que nunca vem, e perderia serviço achando que não apareceu nenhum.
   -------------------------------------------------------------------------- */

/* Safari de iPhone ou iPad. O iPad moderno se anuncia como computador, daí
   a segunda checagem. */
function ehIPhone(){
  try{
    const ua = navigator.userAgent || "";
    const iOS = /iPad|iPhone|iPod/.test(ua)
      || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    const safari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
    return iOS && safari;
  }catch(e){ return false; }
}

/* O recado que aparece para quem está no iPhone.

   A primeira versão deste aviso falava só do SOM. O dono viu que o problema
   é maior e mais grave: com o aplicativo fora da frente não falha só o som
   — **o alerta inteiro não chega**, nem o som, nem a tela.

   Esconder a metade grave seria o pior tipo de meia-verdade: ela leria "o
   som não toca", concluiria que ainda assim seria avisada NA TELA, e
   perderia serviço esperando um aviso que nunca veio. */
function avisoDoSomNoIPhone(){
  if(!ehIPhone()) return "";
  return '<div class="aviso ambar" style="margin:-2px 0 12px">\ud83d\udcf5<div>'
    + '<b>No iPhone, o aviso só chega com o aplicativo aberto na tela</b>'
    + 'Com o Limpah aberto na sua frente, o pedido aparece aqui — mas '
    + '<b>sem som</b>. Toque em "Testar o som" acima para ouvir como é.'
    + '<br><br>Com o celular no bolso, a tela apagada, ou você em outro '
    + 'aplicativo: <b>nada chega</b>. Nem som, nem aviso na tela. O iPhone '
    + 'congela as páginas que saem da frente, e isso um site não contorna.'
    + '<br><br><b>No aplicativo de verdade funciona dos dois jeitos</b>, '
    + 'porque aí o alerta é notificação do celular, não página aberta.'
    + '</div></div>';
}

/* --------------------------------------------------------------------------
   "VER COMO É O ALERTA" — um botão de diagnóstico, e por que ele existe

   O dono perguntou uma coisa que eu NÃO consigo responder daqui: com o
   Safari aberto e na frente, o alerta aparece no iPhone dele?

   Eu varri o código atrás do que costuma quebrar só no Safari — data lida
   de texto, sintaxe que ele não entende, som travando o resto, ouvinte de
   redimensionamento. **Não achei nada.** E o som não bloqueia o visual: o
   tocarAlerta() inteiro está dentro de try/catch, então mesmo mudo a tela
   do alerta abre.

   Mas "eu não achei" não é "não existe". Este botão dispara o alerta na
   hora, sem espera e sem relógio nenhum: um toque no iPhone dele separa,
   de uma vez, as duas coisas que hoje estão misturadas.

     apareceu  → a tela funciona; o que falta é só segundo plano (CASO 2)
     não apareceu → é defeito de verdade, e aí eu tenho por onde começar
   -------------------------------------------------------------------------- */
function verComoEhOAlerta(){
  const d = euSouDiarista();
  if(!d.disponivel || !podeAceitarServico()) return;
  E.jaAlertadas = [];        /* senão na segunda vez não sobra o que alertar */
  E.alerta = null;
  E.esperandoAlertaDesde = null;
  dispararAlerta();
}

function botaoDeVerOAlerta(){
  const d = euSouDiarista();
  if(!d.disponivel || !podeAceitarServico()) return "";
  return '<button class="btn btn-texto" style="min-height:44px;margin:-10px 0 4px" '
    +   'onclick="verComoEhOAlerta()">\ud83d\udd14 Ver como é o alerta (agora)</button>';
}

function botaoDeTestarOSom(){
  const bloqueado = !!E.somBloqueado;
  return '<button class="btn btn-texto" style="min-height:44px;margin:-6px 0 4px" '
    +   'onclick="testarOSom()">🔊 Testar o som do alerta</button>'
    + (E.testouOSom && !bloqueado
      ? '<div style="font-size:12px;color:var(--verde);text-align:center;margin-bottom:10px">'
        + 'Som enviado. Não ouviu? Confira o volume — e no iPhone, a chavinha '
        + 'lateral de silencioso.</div>'
      : "")
    + (bloqueado
      ? '<div class="aviso ambar" style="margin-top:6px">🔇<div>'
        + '<b>Seu navegador bloqueou o som</b>'
        + 'Toque em "Testar o som do alerta" uma vez — o navegador só libera '
        + 'som depois que você toca em alguma coisa.</div></div>'
      : "");
}

/* A grade "meus dias de trabalho" diz se este período serve para ela. */
function periodoServeParaEla(dataIso, periodoId){
  const d = euSouDiarista();
  const grade = d.diasDeTrabalho || {};
  if(!Object.keys(grade).length) return true;      // nada marcado = tudo serve
  const partes = dataIso.split("-");
  const dia = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2])).getDay();
  const doDia = grade[dia];
  if(!doDia || !doDia.length) return false;
  return doDia.indexOf(periodoId) >= 0;
}

/* O que pode virar alerta: cabe na agenda, cabe na grade dela, e ela ainda
   não viu. */
function proximaParaAlertar(){
  return oportunidadesDaRegiao().filter(function(o){
    return periodoServeParaEla(o.data, o.periodo)
        && (E.jaAlertadas || []).indexOf(o.id) < 0;
  })[0] || null;
}

/* Dispara o alerta — só se ela estiver disponível e aprovada. */
function dispararAlerta(){
  const d = euSouDiarista();
  if(!d.disponivel || !podeAceitarServico()) return;
  if(E.alerta) return;                       // um de cada vez

  const o = proximaParaAlertar();
  if(!o) return;

  E.jaAlertadas = (E.jaAlertadas || []).concat([o.id]);
  E.esperandoAlertaDesde = null;
  E.alerta = { oportunidadeId: o.id, restam: DISPONIBILIDADE.alertaExpiraEmSegundos,
               pergunta: false };
  E.toquesDoAlerta = 0;

  /* De onde ela veio — para o "Agora não" devolver ela no mesmo lugar.
     Tomar a tela é aceitável; tomar a tela E perder o lugar dela não é. */
  E.telaAntesDoAlerta = E.tela;
  salvar();
  tocarAlerta();
  ir("diaristaAlerta");
}

/* A pergunta "ainda está disponível?", depois de 3 ignorados seguidos. */
function perguntarSeAindaEsta(){
  E.alerta = { oportunidadeId: null, pergunta: true,
               restam: DISPONIBILIDADE.segundosParaResponderAPergunta };
  salvar();
  tocarAlerta();
  desenhar();
}

/* O relógio do alerta. Mora no aoEntrar da home, porque desenhar() apaga
   todos os relógios — então ele se rearma sozinho a cada desenho, e quem
   guarda o tempo é o estado, não o relógio. */
function relogioDoAlerta(){
  const d = euSouDiarista();

  if(!E.alerta){
    /* Nada na tela ainda: se ela está disponível, um pedido chega em
       instantes.

       ⚠️ QUEM CONTA É O ESTADO, NÃO O RELÓGIO.

       Isto já foi um agendar(dispararAlerta, 4000), e era um defeito: o
       desenhar() apaga todos os relógios, então QUALQUER toque na tela
       dentro dos 4 segundos zerava a contagem e ela recomeçava do começo.

       No computador ninguém nota — a pessoa liga a chave e fica parada
       olhando. No celular ela rola a lista e toca nas coisas, e a contagem
       nunca fechava. O alerta simplesmente não chegava.

       Guardando a HORA em que a espera começou, o tempo passa mesmo que o
       relógio seja morto e recriado vinte vezes. É o mesmo padrão que o som
       repetindo já usava. */
    if(!(d.disponivel && podeAceitarServico() && proximaParaAlertar())){
      E.esperandoAlertaDesde = null;
      return;
    }
    if(!E.esperandoAlertaDesde){
      E.esperandoAlertaDesde = Date.now();
      salvar();
    }
    repetir(function(){
      if(E.alerta || !E.esperandoAlertaDesde) return;
      if(Date.now() - E.esperandoAlertaDesde >= DISPONIBILIDADE.demoraDoPrimeiroAlertaMs){
        E.esperandoAlertaDesde = null;
        dispararAlerta();
      }
    }, 400);
    return;
  }

  repetir(function(){
    if(!E.alerta) return;
    E.alerta.restam -= 1;

    /* O SOM REPETINDO.

       Ele mora aqui dentro, e não num relógio próprio, porque desenhar()
       apaga todos os relógios uma vez por segundo — um relógio de 15s nunca
       chegaria aos 15s. Quem conta é o ESTADO: toca quando o tempo já
       decorrido é múltiplo de 15. Sobrevive a qualquer redesenho. */
    const total = E.alerta.pergunta
      ? DISPONIBILIDADE.segundosParaResponderAPergunta
      : DISPONIBILIDADE.alertaExpiraEmSegundos;
    const decorrido = total - E.alerta.restam;
    if(E.alerta.restam > 0
       && decorrido > 0
       && decorrido % DISPONIBILIDADE.repeteOSomACadaSegundos === 0){
      tocarAlerta();
    }

    if(E.alerta.restam > 0){
      salvar();
      if(!atualizarRelogioDoAlertaNaTela()) desenhar();
      return;
    }

    if(E.alerta.pergunta){
      /* não respondeu à pergunta: desliga sozinho, sem punição nenhuma */
      E.alerta = null;
      d.disponivel = false;
      d.ignoradosSeguidos = 0;
      E.desligouSozinho = true;
      salvar();
      desenhar();
      return;
    }

    /* o alerta expirou sem resposta */
    E.alerta = null;
    d.ignoradosSeguidos = (d.ignoradosSeguidos || 0) + 1;
    salvar();
    if(d.ignoradosSeguidos >= DISPONIBILIDADE.alertasIgnoradosAtePerguntar){
      E.telaAntesDoAlerta = null;
      ir("diaristaHome", { limparHistorico:true });
      perguntarSeAindaEsta();
    } else {
      voltarDeOndeVeio();
    }
  }, 1000);
}

/* O RELÓGIO SEM REDESENHAR A TELA.

   Redesenhar o alerta inteiro a cada segundo trocava todo o conteúdo: a
   ficha do pedido voltava para o topo e, no celular, o dedo que estava
   rolando perdia o que segurava. O dono não conseguia descer para ver o
   pedido (12/10/2026). Agora o segundo a segundo troca só o que muda — o
   número, a barra, o aperto dos 30s e a contagem do som. A tela inteira só
   é redesenhada quando muda de verdade (expirou, virou pergunta).

   Os textos vêm das mesmas funções que o html() usa, para os dois nunca
   discordarem. Devolve false quando não há o que atualizar no lugar — aí
   quem chamou redesenha, como antes. */
function atualizarRelogioDoAlertaNaTela(){
  if(!E.alerta || E.alerta.pergunta || E.tela !== "diaristaAlerta") return false;
  const caixa = document.querySelector("#palco .alerta-cheio");
  if(!caixa) return false;
  const relogio = caixa.querySelector(".relogio");
  const barra = caixa.querySelector(".trilho div");
  const toques = caixa.querySelector(".toques");
  if(!relogio || !barra || !toques) return false;

  relogio.textContent = textoDoRelogioDoAlerta(E.alerta.restam);
  barra.style.width = fatiaDoTrilhoDoAlerta(E.alerta.restam) + "%";
  caixa.classList.toggle("apertado", E.alerta.restam <= 30);
  toques.textContent = textoDosToquesDoAlerta();
  return true;
}

function textoDoRelogioDoAlerta(restam){
  return Math.floor(restam / 60) + ":" + String(restam % 60).padStart(2, "0");
}

function fatiaDoTrilhoDoAlerta(restam){
  return Math.max(0, Math.min(100, (restam / DISPONIBILIDADE.alertaExpiraEmSegundos) * 100));
}

function textoDosToquesDoAlerta(){
  const n = E.toquesDoAlerta || 0;
  return n + (n === 1 ? " vez" : " vezes");
}

/* Qualquer sinal de vida zera a conta de ignorados. Recusar TAMBÉM — recusar
   é resposta, e resposta boa: libera a onda na hora em vez de gastar três
   minutos esperando. Punir quem recusa seria punir o comportamento que a
   gente quer. */
function deiSinalDeVida(){
  const d = euSouDiarista();
  d.ignoradosSeguidos = 0;
  salvar();
}

function aceitarDoAlerta(){
  const id = E.alerta ? E.alerta.oportunidadeId : null;
  E.alerta = null;
  deiSinalDeVida();
  if(id === null || id === undefined){ desenhar(); return; }
  E.oportunidadeAberta = id;
  salvar();
  aceitarOportunidade();
}

function voltarDeOndeVeio(){
  const antes = E.telaAntesDoAlerta;
  E.telaAntesDoAlerta = null;
  salvar();
  ir(antes && TELAS[antes] ? antes : "diaristaHome", { limparHistorico:true });
}

function recusarDoAlerta(){
  E.alerta = null;
  deiSinalDeVida();
  salvar();
  voltarDeOndeVeio();
}

function continuoDisponivel(){
  E.alerta = null;
  deiSinalDeVida();
  desenhar();
}

function pausarAgora(){
  const d = euSouDiarista();
  E.alerta = null;
  d.disponivel = false;
  d.ignoradosSeguidos = 0;
  salvar();
  desenhar();
}

/* O cartão — agora só para a pergunta "ainda está disponível?".

   O alerta de serviço virou tela inteira (decisão do dono, opção B). A
   pergunta continua cartão de propósito: ali não tem cliente esperando do
   outro lado, e tomar a tela para uma conversa nossa com ela seria abuso. */
function cartaoDoAlerta(){
  if(!E.alerta || !E.alerta.pergunta) return "";
  const m = Math.floor(E.alerta.restam / 60);
  const seg = String(E.alerta.restam % 60).padStart(2, "0");
  const tempo = m + ":" + seg;

  if(E.alerta.pergunta){
    return '<div class="cartao destaque" style="border-color:var(--roxo);background:var(--roxo-claro)">'
      + '<b style="font-size:15.5px">Você ainda está disponível? \u{1F44B}</b>'
      + '<div style="font-size:13px;color:var(--texto);margin-top:6px;line-height:1.55">'
      +   'Passamos alguns pedidos e você não respondeu — o que é normal, '
      +   'a vida acontece. <b>Isto não é advertência e não muda nada no seu '
      +   'perfil.</b> Só queremos não deixar o cliente esperando à toa.</div>'
      + '<div style="font-size:12px;color:var(--suave);margin-top:8px">'
      +   'Sem resposta em <b>' + tempo + '</b>, a gente pausa por você. '
      +   'Você religa quando quiser.</div>'
      + '<div style="display:flex;gap:8px;margin-top:13px">'
      +   '<button class="btn btn-principal" style="margin:0" onclick="continuoDisponivel()">'
      +     'Estou aqui</button>'
      +   '<button class="btn btn-claro" style="margin:0" onclick="pausarAgora()">Pausar</button>'
      + '</div></div>';
  }

  const o = oportunidadePorId(E.alerta.oportunidadeId);
  if(!o) return "";
  const apertado = E.alerta.restam <= 30;

  return '<div class="cartao destaque" style="border-color:var(--roxo);background:var(--roxo-claro)">'
    + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">'
    +   '<b style="font-size:15.5px">Novo pedido para você! \u{1F514}</b>'
    +   '<span style="font-size:15px;font-weight:800;color:'
    +     (apertado ? "var(--vermelho)" : "var(--roxo)") + '">' + tempo + '</span>'
    + '</div>'
    + '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">'
    +   '<div style="flex:1;min-width:0;font-size:13px;line-height:1.6">'
    +     '<b>' + esc(o.quando) + ' · ' + esc(o.janela) + '</b><br>'
    +     esc(o.resumo) + '<br>\u{1F4CD} ' + esc(o.bairro) + ' · '
    +     String(o.km).replace(".", ",") + ' km</div>'
    +   '<div style="text-align:right;flex:none">'
    +     '<div style="font-size:11px;color:var(--suave)">você recebe</div>'
    +     '<div style="font-size:19px;font-weight:800;color:var(--verde)">'
    +       moeda(o.receber) + '</div></div>'
    + '</div>'
    + '<div style="display:flex;gap:8px;margin-top:13px">'
    +   '<button class="btn btn-principal" style="margin:0" onclick="aceitarDoAlerta()">'
    +     'Aceitar</button>'
    +   '<button class="btn btn-claro" style="margin:0" onclick="recusarDoAlerta()">Agora não</button>'
    + '</div>'
    + '<div style="font-size:11.5px;color:var(--suave);margin-top:9px;line-height:1.5">'
    +   'Deixar passar não é falta. Não conta nada contra você.</div>'
    + '</div>';
}


/* --------------------------------------------------------------------------
   O ALERTA EM TELA INTEIRA (opção B, escolhida pelo dono em 22/08/2026)

   Era um cartão no meio da lista. O dono comparou com Uber e iFood e pediu
   "impossível não ver" — e cartão entre cartões é exatamente o contrário.

   E é honesto: no aplicativo real isto é uma notificação de tela cheia
   (`setFullScreenIntent` no Android, ver ESPEC-ALERTA.md). A tela cheia aqui
   representa o que vai acontecer lá, em vez de inventar um formato que o
   produto não vai ter.
   -------------------------------------------------------------------------- */
TELAS.diaristaAlerta = {
  html: function(){
    /* Sem alerta de pé esta tela não tem assunto. Pode acontecer ao recarregar
       a página depois de expirar — e tela sem assunto não pode ficar em branco. */
    if(!E.alerta || E.alerta.pergunta || !podeAceitarServico()){
      return ''
      + '<div class="centro">'
      +   '<div class="emojao">⏰</div>'
      +   '<h2 class="titulo">Esse pedido já passou</h2>'
      +   '<p class="apoio">Ele foi para outra profissional. Aparecem pedidos '
      +     'novos o dia inteiro.</p>'
      + '</div>'
      + '<div class="rodape">'
      +   '<button class="btn btn-principal" onclick="voltarDeOndeVeio()">'
      +     'Ver outros pedidos</button>'
      + '</div>';
    }

    const o = oportunidadePorId(E.alerta.oportunidadeId);
    if(!o) return TELAS.diaristaHome.html();

    /* o segundo a segundo NÃO passa por aqui: ver atualizarRelogioDoAlertaNaTela() */
    const restam = E.alerta.restam;
    const apertado = restam <= 30;

    return ''
    + '<div class="alerta-cheio' + (apertado ? " apertado" : "") + '">'

    +   '<div class="topo">'
    +     '<div class="sino">🔔</div>'
    +     '<div class="chamada">Novo pedido para você!</div>'
    +     '<div class="relogio">' + textoDoRelogioDoAlerta(restam) + '</div>'
    +     '<div class="trilho"><div style="width:' + fatiaDoTrilhoDoAlerta(restam) + '%"></div></div>'
    +   '</div>'

    +   '<div class="miolo">'
    +     '<div class="rotulo-valor">você recebe</div>'
    +     '<div class="valorzao">' + moeda(o.receber) + '</div>'

    +     '<div class="ficha">'
    +       '<div class="linha"><span class="rot">Quando</span>'
    +         '<span class="val">' + esc(o.quando) + '</span></div>'
    +       '<div class="linha"><span class="rot">Você fica na casa</span>'
    +         '<span class="val">' + esc(o.janela) + '</span></div>'
    +       '<div class="linha"><span class="rot">Serviço</span>'
    +         '<span class="val">' + esc(o.resumo) + '</span></div>'
    +       '<div class="linha"><span class="rot">Onde</span>'
    +         '<span class="val">' + esc(o.bairro) + ' · '
    +           String(o.km).replace(".", ",") + ' km</span></div>'
    /* A13: "Aceitar agora" é o caminho principal do aceite — ela fica
       sabendo AQUI, como na tela da oportunidade, o dia em que a rua chega.
       O trajeto pesa na decisão. A mesma frase, da mesma função. Fora da
       .linha de propósito: a .linha é flex e poria a frase ao lado. */
    +       '<div class="nota">🔒 ' + esc(quandoARuaApareceSeAceitar(o)) + '</div>'
    +     '</div>'
    +   '</div>'

    +   '<div class="pe">'
    +     '<button class="btn btn-principal grandao" onclick="aceitarDoAlerta()">'
    +       'Aceitar agora</button>'
    +     '<button class="btn btn-claro" onclick="recusarDoAlerta()">Agora não</button>'
    +     '<div class="miudo">Deixar passar não é falta. Não conta nada contra você.'
    +       '<br>🔊 o som tocou <span class="toques">' + textoDosToquesDoAlerta() + '</span>'
    +       ' · repete a cada ' + DISPONIBILIDADE.repeteOSomACadaSegundos + 's</div>'
    +   '</div>'
    + '</div>';
  },

  aoEntrar: function(){ relogioDoAlerta(); }
};

/* O aviso de que o próprio app pausou. */
function avisoDeQuePausou(){
  if(!E.desligouSozinho) return "";
  return '<div class="aviso roxo">\u{1F634}<div><b>Pausamos por você</b>'
    + 'Você não respondeu aos últimos pedidos, então paramos de mandar para não '
    + 'deixar cliente esperando. <b>Nada foi anotado contra você e sua posição '
    + 'continua a mesma.</b> É só ligar de novo aí em cima.</div></div>';
}


/* --------------------------------------------------------------------------
   MEUS DIAS DE TRABALHO

   Sem isto, uma diarista que só trabalha terça e quinta de manhã seria
   acordada às 6h de domingo. Alerta que incomoda é desligado para sempre —
   e aí perdemos ela inteira, não só aquele domingo.

   E tem um lado jurídico a favor: ela definir a própria agenda reforça que é
   trabalhadora autônoma. Plataforma que decide quando ela trabalha caminha
   para vínculo empregatício — o mesmo motivo da janela de presença (R9).
   -------------------------------------------------------------------------- */
TELAS.diaristaDisponibilidade = {
  html: function(){
    const d = euSouDiarista();
    const grade = d.diasDeTrabalho || {};
    const tudoAberto = !Object.keys(grade).length;

    let linhas = "";
    DIAS_SEMANA.forEach(function(nome, dia){
      const marcados = grade[dia] || [];
      let botoes = "";
      PERIODOS.forEach(function(p){
        const on = tudoAberto || marcados.indexOf(p.id) >= 0;
        botoes += '<button onclick="alternarPeriodoDoDia(' + dia + ',\'' + p.id + '\')" '
          + 'style="flex:1;min-height:44px;border-radius:10px;font-family:inherit;font-size:12.5px;'
          + 'font-weight:700;cursor:pointer;border:1.5px solid '
          + (on ? "var(--roxo)" : "var(--borda)") + ';'
          + 'background:' + (on ? "var(--roxo-claro)" : "var(--branco)") + ';'
          + 'color:' + (on ? "var(--roxo)" : "var(--suave)") + '">'
          + esc(p.nome) + '</button>';
      });
      linhas += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">'
        + '<div style="width:38px;flex:none;font-size:13px;font-weight:700;color:var(--suave)">'
        +   esc(nome) + '</div>'
        + '<div style="flex:1;display:flex;gap:6px">' + botoes + '</div></div>';
    });

    return ''
    + cabecalho("Meus dias de trabalho")
    + '<div class="corpo">'
    +   '<h2 class="titulo">Quando você quer ser avisada?</h2>'
    +   '<p class="apoio">Só chega alerta nos dias e períodos que você marcar. '
    +     'Dá para mudar quando quiser.</p>'
    +   linhas
    +   (tudoAberto
      ? '<div class="aviso roxo">✨<div><b>Está tudo aberto</b>'
        + 'Você recebe alerta em qualquer dia e período. Desmarque o que não '
        + 'serve para você.</div></div>'
      : '')
    +   '<div class="aviso verde">' + icone("escudo", 18) + '<div><b>Quem manda na sua agenda é você</b>'
    +     'A gente não escolhe seus dias, nem cobra nada por você ficar fora. '
    +     'Ficar indisponível não penaliza você.</div></div>'
    + '</div>'
    + '<div class="rodape">'
    +   '<button class="btn btn-principal" onclick="voltar()">Pronto</button>'
    + '</div>';
  }
};

function alternarPeriodoDoDia(dia, periodoId){
  const d = euSouDiarista();
  if(!d.diasDeTrabalho) d.diasDeTrabalho = {};

  /* Se nada estava marcado, tudo estava valendo — então o primeiro toque
     precisa partir de "tudo ligado", senão ela toca para DESmarcar um
     período e o app entende que ela marcou só aquele. */
  if(!Object.keys(d.diasDeTrabalho).length){
    DIAS_SEMANA.forEach(function(_, i){
      d.diasDeTrabalho[i] = PERIODOS.map(function(p){ return p.id; });
    });
  }

  const lista = d.diasDeTrabalho[dia] || [];
  const i = lista.indexOf(periodoId);
  if(i >= 0) lista.splice(i, 1); else lista.push(periodoId);
  d.diasDeTrabalho[dia] = lista;
  salvar();
  desenhar();
}

/* --------------------------------------------------------------------------
   A CONTA DELA — e a porta de saída

   Esta tela nasceu de um travamento real: o dono entrou como diarista e não
   conseguiu mais voltar para a tela que escolhe entre cliente e diarista.

   O lado do cliente sempre teve "Sair da conta" dentro do perfil dele. O lado
   da diarista não tinha equivalente nenhum — a aba "Perfil" abria o mapa do
   cadastro, que não tem saída. Entrou, ficou.

   Toda parte do aplicativo onde dá para entrar precisa ter por onde sair.
   -------------------------------------------------------------------------- */
TELAS.diaristaPerfil = {
  html: function(){
    const d = euSouDiarista();
    const p = progressoDoCadastro();
    const verificada = podeAceitarServico();

    return ''
    + '<div class="corpo">'
    +   '<h2 class="titulo">Minha conta</h2>'

    +   '<div class="cartao">'
    +     '<div style="display:flex;align-items:center;gap:13px">'
    +       '<div style="width:52px;height:52px;border-radius:50%;background:var(--roxo);'
    +         'color:#fff;display:flex;align-items:center;justify-content:center;flex:none">'
    +         icone("pessoa", 27) + '</div>'
    +       '<div style="flex:1;min-width:0">'
    +         '<b style="font-size:16px">' + esc(d.nome || "Sua conta") + '</b>'
    +         '<div style="font-size:12.5px;color:var(--suave);margin-top:3px">'
    +           esc(d.telefone || "telefone não informado") + '</div>'
    +       '</div>'
    +     '</div>'
    +     (verificada
      ? '<div style="display:flex;align-items:center;gap:7px;margin-top:13px;padding-top:12px;'
        + 'border-top:1px solid var(--borda);font-size:12.5px;color:var(--verde);font-weight:600">'
        + icone("escudo", 16) + 'Profissional verificada</div>'
      : "")
    +   '</div>'

    +   barraDoCadastro()

    +   '<div class="rotulo">Sua conta</div>'
    +   '<button class="item" onclick="ir(\'diaristaCadastro\')">'
    +     '<div class="txt"><b>Meu cadastro</b><span>' + p.pct + '% completo</span></div>'
    +     '<div class="seta">›</div></button>'
    +   '<button class="item" onclick="ir(\'diaristaRegiao\')">'
    +     '<div class="txt"><b>Onde eu trabalho</b><span>'
    +       esc(d.regiao || "nenhum bairro escolhido") + '</span></div>'
    +     '<div class="seta">›</div></button>'
    +   '<button class="item" onclick="ir(\'diaristaRecebimento\')">'
    +     '<div class="txt"><b>Onde eu recebo</b><span>'
    +       (d.feito.recebimento ? "Pix cadastrado" : "ainda não informado") + '</span></div>'
    +     '<div class="seta">›</div></button>'

    +   '<div class="rotulo">Ajuda</div>'
    +   '<button class="item" onclick="ir(\'diaristaEmBreve\')">'
    +     '<div class="txt"><b>Falar com o suporte</b><span>Uma pessoa responde</span></div>'
    +     '<div class="seta">›</div></button>'

    +   '<button class="btn btn-perigo" style="margin-top:18px" onclick="sairDaConta()">'
    +     'Sair da conta</button>'
    + '</div>'
    + abasDaDiarista("perfil");
  }
};


/* ==========================================================================
   AGENDA E GANHOS DELA — etapa 4 (decisão R26, 12/10/2026)

   Três telas: Minha agenda, Meus ganhos e o Extrato.

   Duas regras atravessam as três:
   - NENHUM valor é escrito à mão: tudo sai de extratoDoServico() (dados.js),
     a mesma conta que monta o cartão da oportunidade;
   - o que elas dizem sobre o ESTADO dela (ainda não aprovada, sem Pix) vem
     de situacaoDaDiarista() — nenhuma tela decide sozinha (R24).
   ========================================================================== */

/* Os recortes do "Recebido" — escolha PROVISÓRIA (A9).
   Janelas que andam com o dia, e não semana e mês do calendário: numa
   segunda-feira "esta semana" estaria sempre vazia, e no dia 1º "este mês"
   também. Ela abriria a tela de ganhos e veria zero. */
const RECORTES_DOS_GANHOS = [
  { id:"7",  nome:"Últimos 7 dias",  dias:7  },
  { id:"30", nome:"Últimos 30 dias", dias:30 },
];
const RECORTE_PADRAO = "30";

/* A renda do conjunto só aparece na HOME a partir de 2 diárias agendadas:
   a ideia do dono fala em "várias" (TELAS.md, IDEIA GUARDADA). Em Meus
   ganhos ela aparece sempre. Escolha PROVISÓRIA (A10). */
const MINIMO_DE_DIARIAS_PARA_A_HOME = 2;

/* SERVIÇOS JÁ FEITOS, DE EXEMPLO — escolha PROVISÓRIA (A11).

   Sem eles, "Recebido" e o extrato abririam vazios e não daria para ver como
   ficam. São fictícios do mesmo jeito que as OPORTUNIDADES: datas contadas a
   partir de hoje e valores calculados pela tabela de verdade. Só aparecem
   para quem já foi aprovada (antes disso ela não trabalhou), e as telas
   dizem que são de exemplo. */
const SERVICOS_FEITOS_DE_EXEMPLO = [
  { haDias:2,  periodo:"manha", bairro:"Pinheiros",     km:3.1, rua:"Rua das Paineiras, 77",
    pedido:{ categoria:"diarista", respostas:{tipo:"padrao", comodos:3, banheiros:1}, adicionais:["geladeira"] } },
  { haDias:5,  periodo:"tarde", bairro:"Vila Madalena", km:2.4, rua:"Rua dos Ipês, 112",
    pedido:{ categoria:"diarista", respostas:{tipo:"padrao", comodos:2, banheiros:1}, adicionais:[] } },
  { haDias:9,  periodo:"manha", bairro:"Perdizes",      km:5.6, rua:"Rua Cambará, 45",
    pedido:{ categoria:"diarista", respostas:{tipo:"completa", comodos:3, banheiros:1}, adicionais:["passar"] } },
  { haDias:16, periodo:"manha", bairro:"Lapa",          km:4.0, rua:"Rua dos Girassóis, 18",
    pedido:{ categoria:"diarista", respostas:{tipo:"padrao", comodos:4, banheiros:2}, adicionais:[] } },
  { haDias:23, periodo:"tarde", bairro:"Pompeia",       km:6.1, rua:"Rua das Hortênsias, 230",
    pedido:{ categoria:"diarista", respostas:{tipo:"padrao", comodos:2, banheiros:1}, adicionais:["armarios"] } },
];


/* --- datas e horas ------------------------------------------------------- */

function hojeIso(){ return isoDoDia(new Date()); }

function isoDeHaDias(n){
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return isoDoDia(d);
}

/* "2026-10-06" -> "06/10" */
function diaCurto(iso){
  const p = String(iso || "").split("-");
  return p.length === 3 ? p[2] + "/" + p[1] : "";
}

function momentoDoServico(s, hora){
  const p = String(s.data || "").split("-");
  return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]), Number(hora) || 0, 0, 0);
}

/* Serviço que já passou SAI da agenda e vai para os ganhos — escolha
   PROVISÓRIA (A8). No app real quem diz "terminou" é a tela de concluir o
   serviço (Bloco 5), que ainda não existe; no protótipo, acabou a janela,
   acabou o serviço. */
function servicoJaTerminou(s){ return momentoDoServico(s, s.fim) <= relogioDaAgenda(); }

function servicoAcontecendoAgora(s){
  const agora = relogioDaAgenda();
  return momentoDoServico(s, s.inicio) <= agora && agora < momentoDoServico(s, s.fim);
}

/* A hora de agora, para a agenda, num lugar só. Existe para o teste 21
   poder adiantar o relógio ("são 17h de amanhã") e conferir um dia em que
   um serviço já terminou e outro está acontecendo — sem depender da hora em
   que o teste roda. */
function relogioDaAgenda(){ return new Date(); }

/* QUANDO A RUA APARECE, com a data de verdade (A13).

   "Na véspera" sozinho obriga ela a fazer a conta; a data pronta não:
   "na véspera, sex 16/10," — ou "hoje, seg 12/10," e "amanhã, ter 13/10,"
   quando é o caso. Quem decide SE já apareceu é enderecoLiberado(), no
   dados.js; estas frases só dizem QUANDO. */
function quandoARuaAparece(s){
  const m = momentoDoEndereco(s);
  /* Data ilegível (dado estragado): a frase sai sem o dia, em vez de quebrar
     a tela. Sem isto, DIAS_SEMANA[NaN] derrubava a Agenda, os Ganhos, o
     Extrato e o cartão da renda na home — todos passam por aqui. A rua
     continua escondida: enderecoLiberado() não libera data que não lê. */
  if(isNaN(m.getTime())) return "na véspera,";
  const agora = relogioDaAgenda();
  const iso = isoDoDia(m);
  const dia = DIAS_SEMANA[m.getDay()].toLowerCase() + " " + diaCurto(iso);
  if(iso === isoDoDia(agora)) return "hoje, " + dia + ",";
  const amanha = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + 1);
  if(iso === isoDoDia(amanha)) return "amanhã, " + dia + ",";
  return "na véspera, " + dia + ",";
}

/* "A rua e o número aparecem na véspera, sex 16/10, a partir das 18h." */
function fraseDaRuaNaVespera(s){
  return "A rua e o número aparecem " + quandoARuaAparece(s) + " a partir das "
       + HORA_DO_ENDERECO_NA_VESPERA + "h.";
}

/* Na tela da oportunidade, ANTES do aceite: o que vai acontecer se ela
   aceitar. Pedido para hoje, ou para amanhã depois das 18h, já mostra a rua
   no aceite — a mesma regra, sem caso à parte. */
function quandoARuaApareceSeAceitar(o){
  if(enderecoLiberado(o, relogioDaAgenda()))
    return "A rua e o número aparecem assim que você aceitar.";
  return "Se você aceitar, a rua e o número aparecem " + quandoARuaAparece(o)
       + " a partir das " + HORA_DO_ENDERECO_NA_VESPERA + "h.";
}


/* --- um serviço, num formato só ------------------------------------------ */

function resumoDoPedido(pedido){
  const r = (pedido && pedido.respostas) || {};
  const cat = CATALOGO.filter(function(c){ return c.id === (pedido || {}).categoria; })[0];
  const tipo = NOME_DA_LIMPEZA[r.tipo] || (cat ? cat.nome : "Serviço");
  if(r.comodos == null) return tipo;
  return tipo + " · " + r.comodos + " cômodos, " + r.banheiros
       + (r.banheiros === 1 ? " banheiro" : " banheiros");
}

/* Junta o que as telas precisam saber de um serviço — venha ele da agenda
   (aceito por ela) ou dos exemplos (já feito).

   Serviço aceito antes de 12/10/2026 não guardava o pedido nem o endereço.
   Para esse, procura a oportunidade de onde ele veio; se não achar, mostra o
   valor combinado no aceite, sem inventar linha nenhuma. */
function detalhesDoServico(s){
  let pedido = s.pedido, km = s.km, endereco = s.endereco, cliente = s.cliente;
  /* a oportunidade de onde ele veio — só se for a mesma casa */
  const origem = OPORTUNIDADES[s.oportunidadeId];
  const daOrigem = (origem && origem.bairro === s.bairro) ? origem : null;
  if(!pedido && daOrigem){
    pedido = daOrigem.pedido;
    if(km == null) km = daOrigem.km;
    if(!endereco) endereco = daOrigem.rua;
  }
  /* aceito antes da A18 (12/10/2026): o nome do cliente não foi guardado */
  if(!cliente && daOrigem) cliente = daOrigem.cliente;
  const extrato = pedido ? extratoDoServico(pedido, km) : null;

  /* A RUA SÓ A PARTIR DAS 18H DA VÉSPERA (A13). O corte é aqui, e não no
     cartão: toda tela que recebe um serviço por esta função já o recebe sem
     a rua antes da hora — nenhuma consegue mostrar por engano. */
  const liberado = enderecoLiberado(s, relogioDaAgenda());

  /* E A RUA SAI QUANDO O SERVIÇO TERMINA (A18-14, provisória). O detalhe
     continua aberto pelo extrato e pela linha "Já terminou hoje" — é o
     caminho até a conversa —, mas a rua, o "Como chegar" e o recado não
     servem mais para nada: guardar à mostra o endereço de quem já foi
     atendido é guardar dado pessoal sem motivo (LGPD). Antes da A18-14 a
     rua sumia junto com o cartão da agenda (A8); assim continua. Ficam o
     bairro e a distância. */
  const terminou = servicoJaTerminou(s);
  const mostraACasa = liberado && !terminou;

  /* O RECADO DO CLIENTE vai junto com a rua (A18, item 3): é texto livre, e
     o cliente pode ter escrito o apartamento ou a própria rua ali.

     E passa pelo MESMO filtro da conversa (A18-8): telefone, e-mail, link e
     @perfil viram "[contato escondido pelo app]". Sem isto, o que o app
     esconde na conversa passava pelo recado ("me chama no zap 11 9..."). No
     app de verdade o servidor filtra ao SALVAR o pedido: o celular dela
     nunca recebe o contato original. */
  const recado = esconderContatos(
    String((pedido && pedido.respostas && pedido.respostas.observacoes) || "").trim()).texto;

  /* O VALOR É O COMBINADO NO ACEITE (s.receber) — é o contrato. A conta pela
     tabela de hoje serve só para quebrar o valor em linhas. Antes o valor
     era sempre recalculado: se a tabela ou o 65% mudassem, todo serviço já
     aceito mudava de valor sem aviso. Aconteceu com a R16 revista
     (12/10/2026): um Butantã aceito na maquete por R$ 120, com o
     deslocamento de antes, continua valendo R$ 120 — a tabela de hoje daria
     R$ 110. É dado antigo de maquete: no app de verdade nenhum serviço nasce
     com deslocamento (DECISOES, R16). Os exemplos não têm combinado: para
     eles vale a tabela. */
  const combinado = Number(s.receber);
  const temCombinado = s.receber != null && isFinite(combinado) && combinado > 0;
  const valor = temCombinado ? combinado : (extrato ? extrato.total : 0);
  return {
    /* para o cartão da agenda abrir o detalhe certo (diaristaServico) */
    oportunidadeId: s.oportunidadeId,
    data: s.data, inicio: s.inicio, fim: s.fim,
    /* a JANELA, nunca "N horas" (R9) */
    janela: "das " + s.inicio + "h às " + s.fim + "h",
    horasDaJanela: s.fim - s.inicio,
    bairro: s.bairro || "",
    endereco: mostraACasa ? (endereco || "") : "",
    /* a frase com o dia em que a rua chega — só enquanto ela não chegou */
    ruaDepois: (!liberado && !terminou && endereco) ? fraseDaRuaNaVespera(s) : "",
    /* depois do serviço: a rua saiu, e a tela diz por quê */
    ruaSaiu: terminou && !!endereco,
    recado: mostraACasa ? recado : "",
    recadoDepois: !liberado && !terminou && !!recado,
    /* a conversa com o cliente abre junto com a rua (A18, item 2) e fecha
       às 23h59 do dia do serviço (A18-7) */
    conversaAberta: conversaLiberada(s, relogioDaAgenda()),
    conversaSituacao: situacaoDaConversa(s, relogioDaAgenda()),
    /* "Carla M." — nomeCurto de novo, caso um dado antigo traga o nome inteiro */
    cliente: cliente ? nomeCurto(cliente) : "",
    pedido: pedido || null,
    km: km,
    resumo: pedido ? resumoDoPedido(pedido) : (s.resumo || ""),
    extrato: extrato,
    /* as linhas da tabela só aparecem no extrato se fecham o combinado */
    linhasFecham: !!extrato && Math.abs(extrato.total - valor) < 0.005,
    valor: valor,
    exemplo: !!s.exemplo,
  };
}

function somarValores(lista){
  let t = 0;
  lista.forEach(function(s){ t += s.valor; });
  return Math.round(t * 100) / 100;
}


/* --- o que ela tem pela frente, e o que já fez ---------------------------- */

/* O que ela aceitou e ainda não fez, do mais próximo ao mais distante. */
function servicosAgendados(){
  const d = euSouDiarista();
  return (d.agenda || [])
    .filter(function(s){ return !servicoJaTerminou(s); })
    .map(detalhesDoServico)
    .sort(function(a, b){
      if(a.data !== b.data) return a.data < b.data ? -1 : 1;
      return a.inicio - b.inicio;
    });
}

/* Por dia, com a soma das janelas contra o teto do DIA (R8 + R22): duas
   janelas de 4h fecham o dia; 4h + 6h nem chegam a ser oferecidas.

   Os CARTÕES são só do que ainda não terminou (A8). Mas a SOMA conta TODOS
   os serviços daquele dia, inclusive o que já acabou — exatamente como o
   cabeNaAgenda conta na hora de aceitar. Antes a soma pulava o que tinha
   terminado: às 17h, com 8h–12h feito e 16h–20h acontecendo, a tela dizia
   "4h de 8h no dia" num dia que já tinha batido o teto da lei, enquanto o
   aceite recusava mais serviço "porque passaria de 8 horas". */
function agendaPorDia(){
  const d = euSouDiarista();
  const dias = [];
  servicosAgendados().forEach(function(s){
    let dia = dias.filter(function(x){ return x.data === s.data; })[0];
    if(!dia){ dia = { data: s.data, horas: 0, servicos: [], jaFeitos: [] }; dias.push(dia); }
    dia.servicos.push(s);
  });
  dias.forEach(function(dia){
    (d.agenda || []).forEach(function(s){
      if(s.data !== dia.data) return;
      dia.horas += (s.fim - s.inicio);
      if(servicoJaTerminou(s)) dia.jaFeitos.push(s);
    });
  });
  return dias;
}

/* O que ela já fez: os exemplos e os da agenda cuja janela terminou, do mais
   recente ao mais antigo. Só para quem já foi aprovada. */
function servicosFeitos(){
  /* a tabela de estados decide (R24), não o sim/não antigo */
  if(!situacaoDaDiarista().podeAceitar) return [];
  const d = euSouDiarista();
  const exemplos = SERVICOS_FEITOS_DE_EXEMPLO.map(function(c){
    const conta = calcularPedido(c.pedido);
    const janela = janelaDoServico(c.periodo, conta.horas);
    return { data: isoDeHaDias(c.haDias), inicio: janela.inicio, fim: janela.fim,
             bairro: c.bairro, km: c.km, endereco: c.rua, pedido: c.pedido, exemplo: true };
  });
  const daAgenda = (d.agenda || []).filter(servicoJaTerminou);
  return exemplos.concat(daAgenda).map(detalhesDoServico)
    .sort(function(a, b){
      if(a.data !== b.data) return a.data < b.data ? 1 : -1;
      return b.inicio - a.inicio;
    });
}

function recorteAtual(){
  return RECORTES_DOS_GANHOS.filter(function(r){ return r.id === E.recorteGanhos; })[0]
      || RECORTES_DOS_GANHOS.filter(function(r){ return r.id === RECORTE_PADRAO; })[0];
}

/* O recorte (A9) vale para o que JÁ CAIU e para a contagem de serviços.

   Esta é a CONTAGEM de serviços feitos: vai pela data do serviço. */
function feitosNoRecorte(){
  const desde = isoDeHaDias(recorteAtual().dias);
  return servicosFeitos().filter(function(s){ return s.data > desde; });
}

/* E este é o que JÁ CAIU no recorte: vai pela data em que o dinheiro CAIU,
   não pela do serviço. Numa quarta, o serviço da quarta anterior caiu na
   quinta — dentro dos últimos 7 dias — e ficava de fora porque o serviço
   foi há 7 dias. */
function caiuNoRecorte(){
  const desde = isoDeHaDias(recorteAtual().dias);
  return servicosFeitos().filter(function(s){
    const p = situacaoDoPagamento(s);
    return p.chave === "pago" && p.cai > desde;
  });
}

/* O que terminou e ainda NÃO caiu no Pix dela — SEM recorte de data.

   Antes isto passava pelo filtro de 7/30 dias: um serviço de 40 dias atrás,
   esperando a chave Pix, sumia dos ganhos e do extrato, e trocar de "30"
   para "7 dias" fazia desaparecer R$ 475,50 que continuavam sendo dela.
   Dinheiro devido não some porque ela mexeu num filtro. */
function feitosAindaNaoPagos(chave){
  return servicosFeitos().filter(function(s){
    const c = situacaoDoPagamento(s).chave;
    return chave ? c === chave : c !== "pago";
  });
}

function escolherRecorte(id){
  E.recorteGanhos = id;
  salvar();
  desenhar();
}

/* Onde está o dinheiro de um serviço já feito. O Pix vem da tabela única de
   estados (R24) — esta função não decide se ela tem Pix.

   O dia em que cai é o MAIS TARDE entre o prazo contado do serviço e o
   prazo contado do dia em que ela cadastrou a chave (pixDesde). Antes só
   contava o serviço: o dinheiro que esperava a chave virava "Caiu no Pix
   21/09" no instante do cadastro — num dia em que ela nem tinha chave (A11:
   chamar de recebido o que ainda não caiu seria mentira). Agora ele passa
   por "a caminho" e só depois cai. */
function situacaoDoPagamento(s){
  const e = situacaoDaDiarista();
  if(e.pixFalta) return { chave:"semPix", selo:"ambar", texto:e.pixSelo, cai:"" };
  let cai = dataDoRepasse(s.data);
  if(e.pixDesde){
    const desdeAChave = dataDoRepasse(e.pixDesde);
    if(desdeAChave > cai) cai = desdeAChave;
  }
  const hoje = hojeIso();
  if(cai < hoje)   return { chave:"pago",     selo:"verde", texto:"Caiu no Pix " + diaCurto(cai), cai:cai };
  if(cai === hoje) return { chave:"aCaminho", selo:"",      texto:"Cai no Pix hoje", cai:cai };
  return              { chave:"aCaminho", selo:"",      texto:"Cai no Pix até " + diaCurto(cai), cai:cai };
}

/* "em até 1 dia útil" — escrito a partir da regra, não à mão */
function prazoDoPix(){
  const n = REPASSE_PARA_ELA.diasUteisDepoisDeConcluir;
  return "em até " + n + (n === 1 ? " dia útil" : " dias úteis");
}


/* --- a renda do conjunto (IDEIA GUARDADA do dono, TELAS.md Bloco 6) -------

   "Se fizer as 5 diárias: R$ ___". É a porta de entrada da recorrência: ver
   o conjunto é o que faz a diária avulsa virar "minha agenda da semana" na
   cabeça dela. A soma é exatamente o que ela recebe pelos aceitos — o
   teste 22 confere. */
function rendaDoConjunto(){
  const lista = servicosAgendados();
  return { quantidade: lista.length, total: somarValores(lista) };
}

function rotuloDaRendaDoConjunto(r){
  return r.quantidade === 1
    ? "Se fizer a diária agendada"
    : "Se fizer as " + r.quantidade + " diárias agendadas";
}

/* O cartão discreto da home (tela 42). Só isto foi acrescentado lá. */
function cartaoDaRendaDoConjunto(){
  if(!situacaoDaDiarista().podeAceitar) return "";
  const r = rendaDoConjunto();
  if(r.quantidade < MINIMO_DE_DIARIAS_PARA_A_HOME) return "";
  return '<button class="item renda-conjunto" onclick="ir(\'diaristaGanhos\')">'
    +   '<div class="icone">' + icone("carteira", 20) + '</div>'
    +   '<div class="txt"><b>' + esc(rotuloDaRendaDoConjunto(r)) + ': '
    /* <i> e não <span>: o .item já transforma todo span de dentro em linha
       de legenda, e o valor iria parar embaixo, cinza e pequeno */
    +     '<i style="font-style:normal;white-space:nowrap">' + moeda(r.total) + '</i></b>'
    +     '<span>Ver meus ganhos</span></div>'
    +   '<div class="seta">›</div>'
    + '</button>';
}


/* --- pedaços que as três telas repetem ----------------------------------- */

/* Antes da aprovação não há agenda nem ganhos. A frase e o caminho vêm da
   tabela de estados (R24): quem está em análise não pode ler "complete seu
   cadastro" — foi exatamente a contradição que o dono achou a 100%. */
function blocoAntesDeTrabalhar(e, nosGanhos){
  /* a agenda fala de dia e endereço; ganhos e extrato, só de dinheiro */
  const titulo = nosGanhos ? e.ganhosTitulo : e.trabalhoTitulo;
  const frase  = nosGanhos ? e.ganhosFrase  : e.trabalhoFrase;
  return '<div class="aviso roxo">' + icone("escudo", 18)
    +   '<div><b>' + esc(titulo) + '</b>' + esc(frase) + '</div></div>'
    + '<button class="btn ' + (e.chave === "analise" ? "btn-contorno" : "btn-principal") + '" '
    +   'onclick="ir(\'' + e.trabalhoDestino + '\')">' + esc(e.trabalhoBotao) + '</button>';
}

/* Sem Pix: o aviso e o caminho para a chave. Lê só a tabela de estados
   (pixFalta, R24) — e por isso aparece mesmo sem nenhum serviço feito, que
   é o caso normal de quem acabou de ser aprovada. Quando já existe dinheiro
   parado, o título diz quanto (somado SEM recorte de data). */
function avisoDoPix(e, esperando){
  if(!e.pixFalta) return "";
  const titulo = esperando > 0 ? moeda(esperando) + " " + e.pixEsperando : e.pixTitulo;
  return '<div class="aviso ambar">🔑<div><b>' + esc(titulo) + '</b>' + esc(e.pixFrase) + '</div></div>'
    + '<button class="btn btn-principal" onclick="ir(\'' + e.pixDestino + '\')">'
    +   esc(e.pixBotao) + '</button>';
}

/* O que terminou e está a caminho do Pix — sem recorte, pelo mesmo motivo.

   Diz o DIA, e não "1 dia útil depois de concluído": o dinheiro que
   esperava a chave conta o prazo a partir do cadastro dela, e a frase
   antiga ficaria errada justamente para ele. */
function avisoACaminho(lista){
  if(!lista.length) return "";
  let ultimo = "";
  lista.forEach(function(s){
    const cai = situacaoDoPagamento(s).cai;
    if(cai > ultimo) ultimo = cai;
  });
  return '<div class="aviso roxo">⏳<div><b>' + moeda(somarValores(lista))
    + ' a caminho do seu Pix</b>O serviço terminou, o dinheiro já é seu. '
    + (ultimo === hojeIso() ? "Ele cai no seu Pix hoje." : "Ele cai no seu Pix até " + diaCurto(ultimo) + ".")
    + '</div></div>';
}

/* O antipadrão nº 2 da concorrência é cobrar ~R$ 28 por mês da diarista
   pelo uso do app. Aqui não — e a tela diz, em vez de deixar ela desconfiar. */
function avisoSemMensalidade(){
  return '<div class="aviso verde">' + icone("escudo", 18)
    + '<div><b>Sem mensalidade, sem desconto</b>'
    + 'O aplicativo não cobra nada de você para trabalhar. O valor que aparece '
    + 'aqui é o que cai no seu Pix.</div></div>';
}

function avisoDosExemplos(lista){
  if(!lista.some(function(s){ return s.exemplo; })) return "";
  return '<div class="aviso ambar">⚙<div><b>Protótipo</b>'
    + 'Os serviços feitos antes de hoje são de exemplo, para você ver como esta '
    + 'tela fica. No aplicativo de verdade aparece só o que você fez.</div></div>';
}

function seletorDeRecorte(){
  const atual = recorteAtual();
  return '<div class="recorte">' + RECORTES_DOS_GANHOS.map(function(r){
    return '<button class="' + (r.id === atual.id ? "marcada" : "") + '" '
      + 'onclick="escolherRecorte(\'' + r.id + '\')">' + esc(r.nome) + '</button>';
  }).join("") + '</div>';
}

/* Espaço que não quebra entre o número e "km": a 320px o "km" caía sozinho
   na linha de baixo. */
function kmEscrito(km){ return String(km).replace(".", ",") + " km"; }


/* --------------------------------------------------------------------------
   MINHA AGENDA (tela 44 / 47)
   -------------------------------------------------------------------------- */
/* O cartão inteiro é o botão do detalhe (A18): "clicar e obter mais
   informações", nas palavras do dono. Dentro dele não há outro botão — um
   botão dentro de outro o celular não sabe qual apertar.

   O número e a data vão limpos para dentro do onclick: são do próprio app,
   mas um dado estragado com aspas quebraria o toque. */
function toqueDoDetalhe(s){
  const id = Number(s.oportunidadeId);
  const data = String(s.data || "").replace(/[^0-9-]/g, "");
  return 'abrirServicoDaAgenda(' + (isFinite(id) ? id : "null") + ',\'' + data + '\')';
}

/* Quantas mensagens do cliente deste serviço ela ainda não leu — só com a
   conversa aberta. O cartão de aviso no topo mostra UMA conversa (a mais
   recente); a marca em cada cartão é como ela acha as outras (A18-16). */
function novasDoServico(s){
  if(!s.conversaAberta) return 0;
  const ctx = contextoDaConversa(chaveDaConversaDoServico(s));
  return ctx ? naoLidasDaConversa(ctx, "diarista", relogioDaAgenda()).length : 0;
}

function marcaDeMensagemNova(s){
  const novas = novasDoServico(s);
  if(!novas) return "";
  const primeiro = String(s.cliente || "").split(" ")[0] || "o cliente";
  return '<div class="servico-msg">💬 ' + (novas > 1 ? novas + ' mensagens novas' : 'Mensagem nova')
    + ' de ' + esc(primeiro) + '</div>';
}

function cartaoDaAgenda(s){
  const adicionais = s.extrato ? s.extrato.adicionais : [];
  return '<button class="cartao servico-toque" onclick="' + toqueDoDetalhe(s) + '">'
    + (servicoAcontecendoAgora(s)
      ? '<div style="margin-bottom:8px"><span class="selo verde">acontecendo agora</span></div>' : "")
    + '<div class="servico-topo">'
    +   '<div class="txt"><b>' + esc(s.janela) + '</b>'
    +     '<span>' + esc(s.resumo) + '</span>'
    +     (adicionais.length
        ? '<span>+ ' + esc(adicionais.map(function(a){ return a.nome; }).join(", ")) + '</span>' : "")
    +   '</div>'
    +   '<div class="valor"><small>você recebe</small><b>' + moeda(s.valor) + '</b></div>'
    + '</div>'
    /* a rua e o número a partir das 18h da véspera (A13) — s.endereco já
       chega vazio antes disso (detalhesDoServico). Até lá, bairro e
       distância, e o dia em que a rua chega. */
    + '<div class="servico-onde">📍 '
    +   (s.endereco ? '<b>' + esc(s.endereco) + '</b> · ' : "") + esc(s.bairro)
    +   (s.km != null ? ' · ' + kmEscrito(s.km) : "") + '</div>'
    + (s.ruaDepois ? '<div class="servico-rua">🔒 ' + esc(s.ruaDepois) + '</div>' : "")
    + marcaDeMensagemNova(s)
    /* R9: a pausa é direito dela, e a hora é ela quem escolhe */
    + (s.horasDaJanela > 6
      ? '<div class="servico-pausa">☕ Janela longa: você tem direito a intervalo de descanso. '
        + 'A hora é você quem escolhe.</div>' : "")
    + '<div class="servico-ver">Ver detalhes do serviço ›</div>'
    + '</button>';
}

/* JÁ TERMINOU HOJE (A18-14, provisória). O cartão do que terminou sai da
   agenda (A8), mas a conversa com o cliente fica aberta até as 23h59 do dia
   (A18-7) — e sem este caminho ela não tinha como chegar lá à tarde para
   escrever "esqueci o guarda-chuva". Uma linha por serviço, só enquanto a
   conversa dele está aberta. Depois disso o caminho é o extrato. */
function terminaramComAConversaAberta(){
  const agora = relogioDaAgenda();
  return (euSouDiarista().agenda || [])
    .filter(function(s){ return servicoJaTerminou(s) && situacaoDaConversa(s, agora) === "aberta"; })
    .map(detalhesDoServico)
    .sort(function(a, b){ return a.inicio - b.inicio; });
}

function blocoJaTerminouHoje(){
  const lista = terminaramComAConversaAberta();
  if(!lista.length) return "";
  return '<div class="rotulo">Já terminou hoje</div>'
    + lista.map(function(s){
        const primeiro = String(s.cliente || "").split(" ")[0];
        return '<button class="item ja-terminou" onclick="' + toqueDoDetalhe(s) + '">'
          +   '<div class="icone">✓</div>'
          +   '<div class="txt"><b>' + esc(s.janela) + ' · ' + esc(s.bairro) + '</b>'
          +     '<span>A conversa com ' + esc(primeiro || "o cliente") + ' fica aberta até as '
          +     ULTIMO_MINUTO_DA_CONVERSA.hora + 'h'
          +     String(ULTIMO_MINUTO_DA_CONVERSA.minuto).padStart(2, "0") + '</span>'
          +     marcaDeMensagemNova(s) + '</div>'
          +   '<div class="seta">›</div>'
          + '</button>';
      }).join("");
}

function diaDaAgenda(dia){
  const teto = AGENDA.tetoDeHorasPorDia;
  const estado = dia.horas > teto ? "passou" : (dia.horas === teto ? "cheio" : "");
  return '<div class="dia-agenda"><b>' + esc(dataPorExtenso(dia.data)) + '</b>'
    +   '<span>' + dia.horas + 'h de ' + teto + 'h no dia</span></div>'
    + '<div class="medidor ' + estado + '"><i style="width:'
    +   Math.min(100, Math.round(dia.horas / teto * 100)) + '%"></i></div>'
    /* O cartão do que já terminou saiu da agenda (A8), mas as horas dele
       continuam valendo para o dia — a tela diz isso, senão a soma parece
       não bater com os cartões que estão embaixo. */
    + (dia.jaFeitos && dia.jaFeitos.length
      ? '<div class="nota-dia">Conta também ' + dia.jaFeitos.map(function(s){
          return "das " + s.inicio + "h às " + s.fim + "h";
        }).join(" e ") + (dia.jaFeitos.length === 1 ? ", que já terminou." : ", que já terminaram.")
        + '</div>' : "")
    + (estado === "cheio"
      ? '<div class="nota-dia">Dia completo: é o máximo de um dia de trabalho, por lei.</div>' : "")
    /* Não deveria acontecer — o aceite já recusa (cabeNaAgenda). Mas se um
       dado antigo trouxer isso, a tela avisa em vez de esconder. */
    + (estado === "passou"
      ? '<div class="nota-dia passou">Passou do máximo de um dia de trabalho. '
        + 'Fale com o suporte para reorganizar.</div>' : "")
    + dia.servicos.map(cartaoDaAgenda).join("");
}

TELAS.diaristaAgenda = {
  html: function(){
    const e = situacaoDaDiarista();
    let miolo = "";

    if(!e.podeAceitar){
      miolo = blocoAntesDeTrabalhar(e);
    } else {
      const dias = agendaPorDia();
      miolo = dias.length
        ? dias.map(diaDaAgenda).join("")
          + blocoJaTerminouHoje()
          + '<div class="rodape-seguro">Para proteger a casa de cada cliente, a rua e o número '
          + 'aparecem a partir das ' + HORA_DO_ENDERECO_NA_VESPERA + 'h da véspera. '
          + 'Eles são só para você chegar lá.</div>'
        : blocoJaTerminouHoje()
          + '<div class="centro" style="flex:none;padding:18px 6px 6px;gap:10px">'
          + '<div class="emojao" style="font-size:52px">📅</div>'
          + '<b style="font-size:17px">Sua agenda está livre</b>'
          + '<p class="apoio" style="margin:0">Quando você aceitar um serviço, ele aparece aqui — '
          + 'com o dia, o horário, o bairro e quanto você recebe. A rua e o número chegam '
          + 'na véspera, a partir das ' + HORA_DO_ENDERECO_NA_VESPERA + 'h.</p></div>'
          + '<button class="btn btn-principal" style="margin-top:14px" '
          +   'onclick="ir(\'diaristaHome\',{limparHistorico:true})">Ver oportunidades</button>';

      miolo += '<button class="btn btn-texto" style="min-height:44px;margin-top:10px" '
        +   'onclick="ir(\'diaristaDisponibilidade\')">📅 Meus dias de trabalho ›</button>'
        + '<button class="btn btn-texto" style="min-height:44px" '
        +   'onclick="ir(\'diaristaGanhos\')">Os que já passaram estão em Meus ganhos ›</button>';
    }

    return ''
    + '<div class="corpo">'
    +   '<h2 class="titulo">Minha agenda 📅</h2>'
    +   '<p class="apoio">Os serviços que você aceitou, do mais próximo ao mais distante.</p>'
    /* mensagem nova de um cliente (A18) — só para quem já trabalha (R24) */
    +   (e.podeAceitar ? cartaoDeMensagemNova("diarista") : "")
    +   miolo
    + '</div>'
    + abasDaDiarista("agenda");
  },

  /* Com a agenda aberta na véspera, às 18h a rua aparece sozinha, sem ela
     precisar sair e voltar. Pelo agendar(), como todo relógio do app:
     trocar de tela desliga. */
  aoEntrar: function(){ redesenharQuandoARuaChegar(); }
};

/* Teto de 6 horas por espera: um relógio de vários dias, no celular que
   dorme, atrasa à toa. Acordar antes e reagendar não custa nada. */
const ESPERA_MAXIMA_DO_RELOGIO_DA_RUA_MS = 6 * 3600 * 1000;

function redesenharQuandoARuaChegar(){
  const agora = relogioDaAgenda().getTime();
  let proximo = Infinity;
  (euSouDiarista().agenda || []).forEach(function(s){
    if(servicoJaTerminou(s)) return;
    /* A mesma pergunta que o cartão faz: "ainda falta a rua?". Olhar só
       s.endereco deixava de fora o serviço aceito antes de 12/10/2026, que
       não guardou a rua — detalhesDoServico a acha pela oportunidade de
       origem, e o cartão dele também espera as 18h. */
    if(!detalhesDoServico(s).ruaDepois) return;
    const quando = momentoDoEndereco(s).getTime();
    /* data ilegível: nada a esperar. Sem esta trava, Math.min com NaN dava
       uma espera de NaN — que o navegador lê como zero, e a agenda se
       redesenharia sem parar */
    if(isNaN(quando)) return;
    proximo = Math.min(proximo, quando);
  });
  if(proximo === Infinity) return;
  /* +1s: acordar um tiquinho depois das 18h, nunca um tiquinho antes */
  agendar(desenhar, Math.min(ESPERA_MAXIMA_DO_RELOGIO_DA_RUA_MS, proximo - agora + 1000));
}


/* --------------------------------------------------------------------------
   DETALHE DO SERVIÇO (tela 47B) — A18, 12/10/2026

   Pedido do dono: "na agenda a diarista clicar e obter mais informações".
   Tudo o que ela precisa para ir trabalhar, numa tela só.

   Nenhuma regra mora aqui. A rua, o recado e a conversa chegam prontos de
   detalhesDoServico() — que pergunta a enderecoLiberado() e a
   conversaLiberada(), no dados.js —, o dinheiro sai de extratoDoServico(),
   e o que fazer sai do CATALOGO e dos ADICIONAIS.
   -------------------------------------------------------------------------- */

/* Os aplicativos de mapa DELA (ROTA E CHEGADA, no TELAS.md): navegação
   própria não. Cada link já leva o endereço escrito. Dois botões lado a
   lado, e não um que pergunta qual: escolha provisória (A18, item 5).

   Na maquete o endereço é fictício; no app de verdade o link só é montado
   depois das 18h da véspera, porque antes o servidor nem envia a rua. */
const COMO_CHEGAR = [
  { nome:"Google Maps",
    link:function(q){ return "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(q); } },
  { nome:"Waze",
    link:function(q){ return "https://waze.com/ul?q=" + encodeURIComponent(q) + "&navigate=yes"; } },
];

function abrirServicoDaAgenda(id, data){
  E.servicoAberto = { oportunidadeId: id, data: data };
  salvar();
  ir("diaristaServico");
}

/* Procurado pelo número E pela data, como o aceite — e só na agenda dela:
   oportunidade que ela não aceitou não tem detalhe (lá vale a tela da
   oportunidade, sem a rua). */
function servicoAberto(){
  const a = E.servicoAberto;
  if(!a) return null;
  const s = (euSouDiarista().agenda || []).filter(function(x){
    return x.oportunidadeId === a.oportunidadeId && x.data === a.data;
  })[0];
  return s ? detalhesDoServico(s) : null;
}

/* A conversa com o cliente DESTE serviço (A18, 12/10/2026). A chave é o
   número da oportunidade e a data — os mesmos que acham o serviço na agenda. */
function abrirConversaComOCliente(){
  const a = E.servicoAberto || {};
  prepararConversa(chaveDaConversaDoServico({ oportunidadeId:a.oportunidadeId, data:a.data }));
  ir("diaristaConversa");
}

/* O ESCOPO ESCRITO (Bloco 7): o que ela vai fazer, lido do catálogo — outra
   categoria (passadeira, faxina pesada) se monta sozinha. A pergunta que é
   a própria janela (a da passadeira) não entra: a janela já está no topo,
   como horário, e "4 horas" aqui seria vender horas (R9). O recado do
   cliente também não: ele tem lugar próprio, junto com a rua. */
function linhasDoQueFazer(pedido){
  const r = (pedido && pedido.respostas) || {};
  const cat = CATALOGO.filter(function(c){ return c.id === (pedido || {}).categoria; })[0];
  let linhas = "";
  ((cat && cat.perguntas) || []).forEach(function(p){
    const v = r[p.id];
    if(v == null || v === "" || p.ehAJanela) return;
    if(p.tipo === "opcao"){
      const op = (p.opcoes || []).filter(function(o){ return String(o.id) === String(v); })[0];
      if(!op) return;
      linhas += '<div class="linha"><span class="rot">' + esc(p.rotulo) + '</span>'
        + '<span class="val">' + esc(NOME_DA_LIMPEZA[op.id] || op.nome)
        + (op.detalhe ? '<small>' + esc(op.detalhe) + '</small>' : "") + '</span></div>';
    } else if(p.tipo === "contador"){
      linhas += '<div class="linha"><span class="rot">' + esc(p.rotulo) + '</span>'
        + '<span class="val">' + esc(v) + '</span></div>';
    }
  });
  (pedido && pedido.adicionais || []).forEach(function(id){
    const a = ADICIONAIS.filter(function(x){ return x.id === id; })[0];
    if(!a) return;
    linhas += '<div class="linha"><span class="rot">Adicional</span>'
      + '<span class="val">' + esc(a.nome) + '<small>' + esc(a.detalhe) + '</small></span></div>';
  });
  if(pedido && pedido.duasProfissionais)
    linhas += '<div class="linha"><span class="rot">Com você</span>'
      + '<span class="val">mais uma profissional<small>O trabalho é dividido entre vocês duas.</small></span></div>';
  return linhas;
}

function blocoComoChegar(s){
  /* s.endereco chega vazio antes das 18h da véspera (detalhesDoServico):
     sem rua, não há link — nem escondido */
  if(!s.endereco) return "";
  const destino = s.endereco + ", " + s.bairro + ", " + CIDADE_DAS_OPORTUNIDADES;
  return '<div class="rotulo">Como chegar 🧭</div>'
    + '<div class="como-chegar">' + COMO_CHEGAR.map(function(m){
        return '<a class="btn btn-claro" href="' + esc(m.link(destino)) + '" '
          + 'target="_blank" rel="noopener noreferrer">' + esc(m.nome) + '</a>';
      }).join("") + '</div>'
    + '<div class="ajuda">Abre o aplicativo de mapa do seu celular, com o endereço já preenchido.</div>';
}

function blocoDoCliente(s){
  const nome = s.cliente || "";
  const primeiro = nome ? nome.split(" ")[0] : "";
  /* mensagem nova do cliente aparece no próprio botão */
  const novas = novasDoServico(s);
  const conversa = s.conversaAberta
    ? '<button class="btn btn-claro" style="margin-top:14px" onclick="abrirConversaComOCliente()">'
      + '💬 Conversar com ' + esc(primeiro || "o cliente")
      + (novas ? ' · ' + novas + (novas > 1 ? ' novas' : ' nova') : "") + '</button>'
    : (s.conversaSituacao === "fechada"
      /* depois das 23h59 do dia: dá para ler, não para escrever (A18-7) */
      ? '<button class="btn btn-claro" style="margin-top:14px" onclick="abrirConversaComOCliente()">'
        + '💬 Ver a conversa com ' + esc(primeiro || "o cliente") + '</button>'
        + '<div class="ajuda">A conversa fechou às 23h59 do dia do serviço. Precisa de algo? Fale com o suporte.</div>'
      /* o dia vem da mesma frase da rua: as duas chegam juntas (A18, item 2) */
      : '<div class="servico-rua" style="margin-top:12px">💬 A conversa com '
        + esc(primeiro || "o cliente") + ' abre ' + esc(quandoARuaAparece(s)) + ' a partir das '
        + HORA_DO_ENDERECO_NA_VESPERA + 'h, junto com a rua e o número.</div>');
  return '<div class="rotulo">Quem pediu</div>'
    + '<div class="cartao">'
    +   '<div class="pessoa">' + avatar(nome || "Cliente", "var(--roxo)", "pequeno")
    +     '<div class="info"><b>' + esc(nome || "Cliente") + '</b>'
    +     '<span>Cliente Limpah</span></div></div>'
    +   conversa
    + '</div>';
}

function blocoDoDinheiro(s, e){
  const x = s.extrato;
  let linhas = "";
  if(x && s.linhasFecham){
    linhas += linhaDoExtrato("Diária · " + s.janela, x.diaria);
    x.adicionais.forEach(function(a){ linhas += linhaDoExtrato(a.nome + " · sua parte", a.dela); });
  } else {
    /* a tabela mudou depois do aceite, ou é um dado antigo: vale o
       combinado, como no extrato (R26) */
    linhas += linhaDoExtrato("Valor combinado no aceite", s.valor);
  }
  /* Depois do serviço, o que vale é onde o dinheiro está AGORA — a mesma
     frase do cartão do extrato (situacaoDoPagamento). Antes o detalhe
     continuava no futuro ("fica guardado até o serviço terminar") dias
     depois, ao lado de um extrato que dizia que já tinha caído. */
  const pagamento = servicoJaTerminou(s) ? situacaoDoPagamento(s) : null;
  return '<div class="rotulo">Quanto você recebe</div>'
    + '<div class="cartao extrato">'
    +   linhas
    +   '<div class="linha total"><span class="rot">Você recebe</span>'
    +     '<span class="val">' + moeda(s.valor) + '</span></div>'
    +   (pagamento
      ? '<div class="extrato-sub" style="margin-top:8px">Sem desconto nenhum. '
        + '<span class="selo ' + pagamento.selo + '">' + esc(pagamento.texto) + '</span></div>'
      : '<div class="extrato-sub" style="margin-top:8px">Sem desconto nenhum. O cliente já pagou: '
        + 'o valor fica guardado com a gente até o serviço terminar e cai no seu Pix '
        + esc(e.pixQuando) + '.</div>')
    + '</div>';
}

TELAS.diaristaServico = {
  html: function(){
    const e = situacaoDaDiarista();
    /* o estado dela vem da tabela (R24): antes da aprovação não há serviço */
    if(!e.podeAceitar){
      return cabecalho("Detalhes do serviço")
        + '<div class="corpo">' + blocoAntesDeTrabalhar(e) + '</div>';
    }

    const s = servicoAberto();
    if(!s){
      return cabecalho("Detalhes do serviço")
        + '<div class="corpo">'
        +   '<div class="centro" style="flex:none;padding:18px 6px 6px;gap:10px">'
        +     '<div class="emojao" style="font-size:52px">📅</div>'
        +     '<b style="font-size:17px">Este serviço não está mais na sua agenda</b>'
        +     '<p class="apoio" style="margin:0">Os que já terminaram ficam em Meus ganhos, '
        +     'com quanto você recebeu por cada um.</p></div>'
        +   '<button class="btn btn-principal" style="margin-top:14px" '
        +     'onclick="ir(\'diaristaAgenda\',{limparHistorico:true})">Ver minha agenda</button>'
        +   '<button class="btn btn-texto" style="min-height:44px" '
        +     'onclick="ir(\'diaristaGanhos\',{limparHistorico:true})">Ver meus ganhos ›</button>'
        + '</div>';
    }

    const terminou = servicoJaTerminou(s);
    const que = linhasDoQueFazer(s.pedido);

    return ''
    + cabecalho("Detalhes do serviço")
    + '<div class="corpo">'
    +   '<div style="text-align:center;padding:6px 0 14px">'
    +     (servicoAcontecendoAgora(s)
        ? '<div style="margin-bottom:8px"><span class="selo verde">acontecendo agora</span></div>'
        : (terminou ? '<div style="margin-bottom:8px"><span class="selo cinza">já terminou</span></div>' : ""))
    +     '<div style="font-size:12px;color:var(--suave)">você recebe</div>'
    +     '<div style="font-size:34px;font-weight:800;color:var(--verde)">' + moeda(s.valor) + '</div>'
    +   '</div>'

    /* QUANDO E ONDE — a janela, nunca "N horas" (R9); a rua só a partir das
       18h da véspera (A13) */
    +   '<div class="rotulo">Quando e onde</div>'
    +   '<div class="cartao servico-ficha">'
    +     '<div class="linha"><span class="rot">Dia</span><span class="val">'
    +       esc(dataPorExtenso(s.data)) + '</span></div>'
    +     '<div class="linha"><span class="rot">Você fica na casa</span><span class="val">'
    +       esc(s.janela) + '</span></div>'
    +     '<div class="linha"><span class="rot">Bairro</span><span class="val">' + esc(s.bairro)
    +       (s.km != null ? ' · ' + kmEscrito(s.km) : "") + '</span></div>'
    +     (s.endereco
        ? '<div class="linha"><span class="rot">Endereço</span><span class="val">'
          + esc(s.endereco) + '</span></div>'
        : "")
    +     (s.ruaDepois
        ? '<div class="servico-rua">🔒 ' + esc(s.ruaDepois) + '</div>'
          + '<div class="servico-pausa">É para proteger a casa do cliente. Junto com elas chega o '
          + 'botão Como chegar, que abre o Google Maps ou o Waze do seu celular.</div>'
        : "")
    /* depois do serviço a rua sai (A18-14): a tela diz isso, em vez de
       deixar o lugar vazio como se faltasse alguma coisa */
    +     (s.ruaSaiu
        ? '<div class="servico-rua">🔒 A rua e o número saíram daqui quando o serviço terminou.</div>'
          + '<div class="servico-pausa">É para proteger a casa do cliente. A conversa com '
          + esc((s.cliente || "o cliente").split(" ")[0]) + ' continua aqui embaixo.</div>'
        : "")
    +   '</div>'
    +   blocoComoChegar(s)

    /* O QUE FAZER — o escopo escrito (Bloco 7) */
    +   (que
        ? '<div class="rotulo">O que fazer 🧹</div><div class="cartao servico-ficha">' + que + '</div>'
        : '<div class="rotulo">O que fazer 🧹</div><div class="cartao servico-ficha">'
          + '<div class="linha"><span class="rot">Serviço</span><span class="val">'
          + esc(s.resumo) + '</span></div></div>')
    +   (s.horasDaJanela > 6
        ? '<div class="aviso roxo">☕<div><b>Janela longa</b>Você tem direito a intervalo de '
          + 'descanso. A hora é você quem escolhe.</div></div>'
        : "")
    /* o recado do cliente, junto com a rua (A18, item 3) */
    +   (s.recado
        ? '<div class="aviso roxo">📝<div><b>Recado de ' + esc(s.cliente || "quem pediu") + '</b>'
          + esc(s.recado) + '</div></div>'
        : (s.recadoDepois
          ? '<div class="servico-rua" style="margin:0 0 12px">📝 '
            + esc((s.cliente || "O cliente").split(" ")[0]) + ' deixou um recado. Ele aparece '
            + 'junto com a rua e o número.</div>'
          : ""))

    +   blocoDoDinheiro(s, e)
    +   blocoDoCliente(s)

    /* Sem botão de cancelar: a política não foi decidida (A5, R20), e um
       botão teria que dizer se há multa. O caminho é o suporte (A18, item 4). */
    +   '<div class="rotulo">Precisa de ajuda?</div>'
    +   (terminou
        ? '<div class="aviso roxo" style="margin-top:0">🛟<div><b>Algum problema com este serviço?</b>'
          + 'Fale com o suporte. Uma pessoa vê com você o que fazer.</div></div>'
        : '<div class="aviso roxo" style="margin-top:0">🛟<div><b>Algum imprevisto, ou não vai conseguir ir?</b>'
          + 'Fale com o suporte o quanto antes. Uma pessoa vê com você o que fazer.</div></div>')
    +   '<button class="btn btn-claro" onclick="ir(\'diaristaEmBreve\')">Falar com o suporte</button>'
    + '</div>';
  },

  /* Aberta na véspera, às 18h a rua, o recado e a conversa aparecem
     sozinhos — o mesmo relógio da agenda, pelo agendar() */
  aoEntrar: function(){ redesenharQuandoARuaChegar(); }
};


/* --------------------------------------------------------------------------
   A CONVERSA COM O CLIENTE (tela 47C) — A18, 12/10/2026

   A mesma cara da conversa do cliente (telaDaConversa, no telas-cliente.js),
   do lado dela, com as respostas de um toque. Abre na véspera às 18h, junto
   com a rua, e fecha às 23h59 do dia do serviço: quem decide é
   situacaoDaConversa(), no dados.js. O estado dela vem de
   situacaoDaDiarista() (R24): antes da aprovação não há serviço, e a
   conversa nem existe (contextoDaConversa devolve vazio).

   Na maquete, a mesma tela também mostra o lado da profissional de mentira
   de um pedido do cliente — pelo quadro "NA MAQUETE" (A18-12).
   -------------------------------------------------------------------------- */
TELAS.diaristaConversa = {
  html: function(){ return telaDaConversa("diarista"); },
  aoEntrar: function(){ aoEntrarNaConversa(); }
};


/* --------------------------------------------------------------------------
   MEUS GANHOS (tela 45 / 48)
   -------------------------------------------------------------------------- */
TELAS.diaristaGanhos = {
  html: function(){
    const e = situacaoDaDiarista();
    let miolo = "";

    if(!e.podeAceitar){
      miolo = blocoAntesDeTrabalhar(e, true) + avisoSemMensalidade();
    } else {
      const r = rendaDoConjunto();
      /* o recorte (A9) só para o que já caiu e para a contagem; o que ainda
         é dela e não caiu aparece inteiro, de qualquer data */
      const feitos = feitosNoRecorte();          // a contagem: pela data do serviço
      const pagos = caiuNoRecorte();             // o que caiu: pela data em que caiu
      const aCaminho = feitosAindaNaoPagos("aCaminho"), semPix = feitosAindaNaoPagos("semPix");

      /* SEM PIX — no topo, lendo da tabela de estados (R24), mesmo sem
         nenhum serviço feito: é o caso de quem acabou de ser aprovada */
      miolo += avisoDoPix(e, somarValores(semPix));

      /* A RECEBER — a renda do conjunto, e o que já terminou e vem a caminho */
      miolo += '<div class="rotulo">A receber</div>'
        + '<div class="cartao destaque">'
        + (r.quantidade
          ? '<div style="font-size:13.5px;font-weight:600">' + esc(rotuloDaRendaDoConjunto(r)) + ':</div>'
            + '<div class="valor-grande">' + moeda(r.total) + '</div>'
            + '<div class="ajuda" style="margin:0">Cada diária fica guardada com a gente até o '
            +   'serviço terminar, e cai no seu Pix ' + esc(e.pixQuando) + '.</div>'
            + '<button class="btn btn-texto" style="min-height:44px;margin-top:6px" '
            +   'onclick="ir(\'diaristaAgenda\')">Ver minha agenda ›</button>'
          : '<b style="font-size:14.5px">Nenhuma diária agendada agora</b>'
            + '<div class="ajuda">Quando você aceitar serviços, aparece aqui quanto você '
            +   'recebe pelo conjunto.</div>'
            + '<button class="btn btn-texto" style="min-height:44px;margin-top:6px" '
            +   'onclick="ir(\'diaristaHome\',{limparHistorico:true})">Ver oportunidades ›</button>')
        + '</div>'
        + avisoACaminho(aCaminho);

      /* RECEBIDO — no recorte escolhido. A lista embaixo do título é SÓ do
         que já caiu (A11): antes ela listava todo serviço feito, e o que
         ainda estava a caminho, ou esperando a chave, aparecia sob
         "Recebido" ao lado de "R$ 0,00 caiu no seu Pix". */
      const recorteEscrito = esc(recorteAtual().nome.toLowerCase());
      miolo += '<div class="rotulo">Recebido</div>'
        + seletorDeRecorte()
        + '<div class="grade-2">'
        +   '<div class="mini"><b>' + moeda(somarValores(pagos)) + '</b><span>caiu no seu Pix</span></div>'
        +   '<div class="mini"><b>' + feitos.length + '</b><span>'
        +     (feitos.length === 1 ? "serviço feito" : "serviços feitos") + '</span></div>'
        + '</div>'
        + (pagos.length
          ? '<div class="cartao" style="margin-top:12px">' + pagos.map(function(s){
              return '<div class="linha"><span class="rot">' + esc(dataPorExtenso(s.data))
                + ' · ' + esc(s.bairro) + '</span><span class="val" style="white-space:nowrap">'
                + moeda(s.valor) + '</span></div>';
            }).join("") + '</div>'
          : '<div class="vazio" style="padding:18px 10px">Nada caiu no seu Pix nos '
            + recorteEscrito + '.<br>'
            + (aCaminho.length || semPix.length
              ? "O que já terminou e ainda não caiu está logo acima."
              : "Cada serviço aparece aqui quando o dinheiro cai.")
            + '</div>')
        + '<button class="btn btn-claro" style="margin-top:4px" onclick="ir(\'diaristaExtrato\')">'
        +   'Ver extrato serviço a serviço</button>'
        + avisoSemMensalidade()
        + avisoDosExemplos(feitos.concat(pagos, aCaminho, semPix));
    }

    return ''
    + '<div class="corpo">'
    +   '<h2 class="titulo">Meus ganhos 💰</h2>'
    +   '<p class="apoio">Quanto você tem para receber e quanto já caiu no seu Pix.</p>'
    +   miolo
    + '</div>'
    + abasDaDiarista("ganhos");
  }
};


/* --------------------------------------------------------------------------
   EXTRATO — serviço a serviço (tela 48B), escolha PROVISÓRIA (A12): tela
   própria, aberta pelos ganhos, e não um pedaço da tela de ganhos — a de
   ganhos responde "quanto", esta responde "de onde veio cada real".
   -------------------------------------------------------------------------- */
function linhaDoExtrato(rotulo, valor){
  return '<div class="linha"><span class="rot">' + esc(rotulo) + '</span>'
    + '<span class="val">' + moeda(valor) + '</span></div>';
}

function cartaoDoExtrato(s, pagamento){
  const x = s.extrato;
  let linhas = "";
  if(x && s.linhasFecham){
    linhas += linhaDoExtrato("Diária · " + s.janela, x.diaria);
    x.adicionais.forEach(function(a){ linhas += linhaDoExtrato(a.nome + " · sua parte", a.dela); });
  } else {
    /* sem pedido guardado, ou a tabela mudou depois do aceite: vale o
       combinado, e as linhas de hoje não fechariam com ele */
    linhas += linhaDoExtrato("Valor combinado no aceite", s.valor);
    if(x) linhas += '<div class="extrato-sub" style="margin-top:6px">A tabela de preços mudou '
                  + 'depois que você aceitou. Vale o que foi combinado.</div>';
  }
  /* Serviço da agenda dela (os de exemplo não têm detalhe): o cartão leva
     ao detalhe, e de lá à conversa — "Ver a conversa" depois que ela fecha
     (A18-7). É o caminho para reler o que foi combinado, dias depois. */
  const naAgenda = !s.exemplo && (euSouDiarista().agenda || []).some(function(x){
    return x.oportunidadeId === s.oportunidadeId && x.data === s.data;
  });
  return '<div class="cartao extrato">'
    + '<div class="extrato-cab"><b>' + esc(dataPorExtenso(s.data)) + '</b>'
    +   (pagamento
        ? '<span class="selo ' + pagamento.selo + '">' + esc(pagamento.texto) + '</span>'
        : '<span class="selo">Agendado</span>')
    + '</div>'
    + '<div class="extrato-sub">' + esc(s.bairro) + ' · ' + esc(s.resumo) + '</div>'
    + linhas
    + '<div class="linha total"><span class="rot">Você recebe</span>'
    +   '<span class="val">' + moeda(s.valor) + '</span></div>'
    + (naAgenda
      ? '<button class="btn btn-texto" style="min-height:44px;margin-top:6px" onclick="'
        + toqueDoDetalhe(s) + '">Ver detalhes do serviço ›</button>'
      : "")
    + '</div>';
}

/* R12 + R18 em três passos. Sem prometer nada que ainda não foi decidido
   (cliente ausente e cancelamento são do Bloco 5 e da proposta pendente). */
function comoODinheiroChega(e){
  function passo(sinal, titulo, frase){
    return '<div style="display:flex;gap:11px;align-items:flex-start;padding:8px 0">'
      + '<div style="flex:none;width:24px;font-size:17px;line-height:1.2">' + sinal + '</div>'
      + '<div style="flex:1;min-width:0"><b style="font-size:14px;display:block">' + esc(titulo) + '</b>'
      + '<span style="font-size:12.5px;color:var(--suave);line-height:1.5;display:block;margin-top:2px">'
      + esc(frase) + '</span></div></div>';
  }
  return '<div class="rotulo">Como o dinheiro chega até você</div>'
    + '<div class="cartao">'
    + passo("🔒", "O cliente paga antes",
            "O valor fica guardado com a gente até o serviço terminar.")
    + passo("✅", "Você termina o serviço", "O dinheiro é liberado para você.")
    /* o passo do Pix vem da tabela de estados (R24): sem chave, a frase de
       apoio não pode falar de prazo contado do serviço */
    + passo("💸", e.pixPassoTitulo, e.pixPassoFrase)
    + '</div>';
}

TELAS.diaristaExtrato = {
  html: function(){
    const e = situacaoDaDiarista();
    let miolo = "";

    if(!e.podeAceitar){
      miolo = blocoAntesDeTrabalhar(e, true) + comoODinheiroChega(e) + avisoSemMensalidade();
    } else {
      const agendados = servicosAgendados();
      /* O que ainda não caiu aparece INTEIRO, de qualquer data; o recorte
         (A9) só filtra o que já caiu — senão o dinheiro devido a ela sumia
         do extrato quando ela trocava de "30" para "7 dias". */
      const naoCaiu = feitosAindaNaoPagos();
      const caiu = caiuNoRecorte();         // pela data em que caiu, não a do serviço
      miolo = avisoDoPix(e, somarValores(feitosAindaNaoPagos("semPix")))
        + comoODinheiroChega(e)
        + '<div class="rotulo">Agendados · a receber</div>'
        + (agendados.length
          ? agendados.map(function(s){ return cartaoDoExtrato(s, null); }).join("")
          : '<div class="vazio" style="padding:14px 10px">Nenhum serviço agendado agora.</div>')
        + (naoCaiu.length
          ? '<div class="rotulo">Feitos · ainda não caiu no Pix</div>'
            + naoCaiu.map(function(s){ return cartaoDoExtrato(s, situacaoDoPagamento(s)); }).join("")
          : "")
        + '<div class="rotulo">Feitos · já caiu no Pix</div>'
        + seletorDeRecorte()
        + (caiu.length
          ? caiu.map(function(s){ return cartaoDoExtrato(s, situacaoDoPagamento(s)); }).join("")
          : '<div class="vazio" style="padding:14px 10px">Nada caiu no seu Pix nos '
            + esc(recorteAtual().nome.toLowerCase()) + '.</div>')
        + avisoSemMensalidade()
        + avisoDosExemplos(naoCaiu.concat(caiu));
    }

    return ''
    + cabecalho("Extrato")
    + '<div class="corpo">'
    +   '<h2 class="titulo">Serviço a serviço 🧾</h2>'
    +   '<p class="apoio">Cada valor sai da tabela de preços. Nenhum é descontado de você.</p>'
    +   miolo
    + '</div>';
  }
};


/* --------------------------------------------------------------------------
   A BARRA DE ABAS DELA
   -------------------------------------------------------------------------- */
function abasDaDiarista(ativa){
  /* Agenda e Ganhos existem desde 12/10/2026 (R26). Antes as duas abas
     caíam no "em construção". Os ícones também mudaram: escudo é o desenho
     de "verificada" no app inteiro, e numa aba de dinheiro confundia. */
  const itens = [
    { id:"inicio",  ic:"casa",       nome:"Início",  tela:"diaristaHome" },
    { id:"agenda",  ic:"calendario", nome:"Agenda",  tela:"diaristaAgenda" },
    { id:"ganhos",  ic:"carteira",   nome:"Ganhos",  tela:"diaristaGanhos" },
    { id:"perfil",  ic:"pessoa",     nome:"Perfil",  tela:"diaristaPerfil" },
  ];
  return '<div class="abas">' + itens.map(function(i){
    return '<button class="' + (i.id === ativa ? "ativa" : "") + '" onclick="ir(\'' + i.tela + '\')">'
         + '<span class="ic">' + icone(i.ic, 21) + '</span>' + i.nome + '</button>';
  }).join("") + '</div>';
}
