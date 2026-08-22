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

  /* APROVADA — pode trabalhar */
  if(d.situacao === "aprovada"){
    const faltaReceber = !d.feito.recebimento;
    return {
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
      pct: p.pct,
    };
  }

  /* EM ANÁLISE — mandou tudo, espera a gente */
  if(d.situacao === "analise" || portao2Pronto){
    return {
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
      pct: p.pct,
    };
  }

  /* INCOMPLETO — ainda falta documento */
  return {
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
    pct: p.pct,
  };
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
    +   '<div class="aviso roxo">🚶<div><b>Atendemos num raio de '
    +     DESLOCAMENTO.raioMaximoKm + ' km</b>'
    +     'De propósito: perto significa menos tempo de trânsito e mais tempo seu. '
    +     'Acima de ' + DESLOCAMENTO.gratisAteKm + ' km, o cliente paga '
    +     moeda(DESLOCAMENTO.valor) + ' de deslocamento — e esse valor é '
    +     '<b>todo seu</b>.</div></div>'
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
   escrito à mão. */
const OPORTUNIDADES = [
  { emDias:1, periodo:"manha", bairro:"Vila Madalena", km:2.1,
    pedido:{ categoria:"diarista", respostas:{tipo:"padrao", comodos:3, banheiros:1}, adicionais:[] } },
  { emDias:1, periodo:"tarde", bairro:"Pinheiros", km:3.4,
    pedido:{ categoria:"diarista", respostas:{tipo:"completa", comodos:4, banheiros:2}, adicionais:["passar"] } },
  { emDias:2, periodo:"manha", bairro:"Perdizes", km:4.8,
    pedido:{ categoria:"diarista", respostas:{tipo:"padrao", comodos:5, banheiros:2}, adicionais:[] } },
  { emDias:2, periodo:"tarde", bairro:"Butantã", km:5.9,
    pedido:{ categoria:"diarista", respostas:{tipo:"padrao", comodos:2, banheiros:1}, adicionais:[] } },
  { emDias:3, periodo:"manha", bairro:"Lapa", km:4.2,
    pedido:{ categoria:"diarista", respostas:{tipo:"completa", comodos:3, banheiros:2}, adicionais:[] } },
  { emDias:3, periodo:"tarde", bairro:"Pompeia", km:6.3,
    pedido:{ categoria:"diarista", respostas:{tipo:"padrao", comodos:4, banheiros:2}, adicionais:[] } },
  { emDias:4, periodo:"tarde", bairro:"Perdizes", km:4.6,
    pedido:{ categoria:"diarista", respostas:{tipo:"padrao", comodos:3, banheiros:2}, adicionais:["geladeira"] } },
];

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
        receber: conta.repasseUnitario,
        resumo: tipo + " · " + c.pedido.respostas.comodos + " cômodos, "
              + c.pedido.respostas.banheiros
              + (c.pedido.respostas.banheiros === 1 ? " banheiro" : " banheiros"),
      };

      const veredito = cabeNaAgenda(o, d.agenda);
      o.cabe = veredito.cabe;
      o.porQueNaoCabe = veredito.motivo;
      o.jaAceito = (d.agenda || []).some(function(s){ return s.oportunidadeId === o.id; });
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

    +   (pode ? faixaDoCadastro() : interruptorTravado())

    +   (pode
      ? '<div class="chave ' + (d.disponivel ? "ligada" : "") + '" onclick="alternarDisponivel()">'
        + '<div class="txt"><b>Disponível para trabalhar</b>'
        + '<span>' + (d.disponivel
            ? "O celular toca quando aparecer pedido para voc\u00ea."
            : "Ligue para ser avisada de novos pedidos.") + '</span></div>'
        + '<div class="botao"></div></div>'
        + botaoDeTestarOSom()
        /* Sempre vis\u00edvel, n\u00e3o s\u00f3 com a chave ligada: ela precisa poder
           acertar os dias ANTES de come\u00e7ar a receber alerta. */
        + '<button class="btn btn-texto" style="margin:-4px 0 12px;min-height:44px" '
        /* \ud83d\udcc5 e n\u00e3o \ud83d\uddd3: o segundo sai como quadradinho vazio no Windows. */
        +   'onclick="ir(\'diaristaDisponibilidade\')">\ud83d\udcc5 Meus dias de trabalho \u203a</button>'
        + avisoDeQuePausou()
        + cartaoDoAlerta()
      : "")

    +   agendaDela()
    +   '<div class="rotulo">Oportunidades na sua região</div>'
    +   (lista.length ? cards
      : '<div class="aviso roxo">🔍<div><b>Nada nos seus bairros agora</b>'
        + 'Aparecem pedidos novos o dia inteiro. Marcar mais bairros aumenta '
        + 'suas chances — dá para mudar quando quiser.</div></div>'
        + '<button class="btn btn-contorno" onclick="ir(\'diaristaRegiao\')">'
        + 'Escolher mais bairros</button>')
    +   escondidasPorConflito()
    +   '<div class="rodape-seguro">Estes são pedidos reais da sua região.<br>'
    +     'O endereço exato aparece quando você aceita.</div>'
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
    +   '<div class="rodape-seguro">O endereço completo aparece quando você aceita.</div>'
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

TELAS.diaristaAceitou = {
  html: function(){
    return ''
    + '<div class="centro">'
    +   '<div class="circulo-ok">✓</div>'
    +   '<h2 class="titulo">Pedido aceito! ✅</h2>'
    +   '<p class="apoio">Combinamos com o cliente. O endereço completo já está na sua agenda.</p>'
    + '</div>'
    + '<div class="rodape">'
    +   '<button class="btn btn-principal" onclick="ir(\'diaristaHome\',{limparHistorico:true})">Voltar ao início</button>'
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
    +     '<input type="text" placeholder="CPF, telefone ou e-mail"></div>'
    +   '<div class="aviso verde">' + icone("escudo", 18) + '<div><b>Pagamento garantido</b>'
    +     'O valor do serviço fica retido antes de você começar. Se o cliente sumir, '
    +     'você recebe do mesmo jeito.</div></div>'
    + '</div>'
    + '<div class="rodape">'
    +   '<button class="btn btn-principal" onclick="marcarEtapa(\'recebimento\')">Salvar</button>'
    + '</div>';
  }
};

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
  const marcados = (d.agenda || []).slice().sort(function(a, b){
    return (a.data + a.inicio) < (b.data + b.inicio) ? -1 : 1;
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
  return '<div class="cartao" style="background:transparent;box-shadow:none;'
    + 'border:1px dashed var(--borda);padding:13px 15px">'
    + '<b style="font-size:13px">' + fora.length
    + (fora.length === 1 ? ' pedido não aparece' : ' pedidos não aparecem')
    + ' na sua lista</b>' + itens
    + '<div style="font-size:11.5px;color:var(--suave);margin-top:5px;line-height:1.5">'
    + 'A gente separa ' + AGENDA.folgaEntreServicosMinutos + ' minutos entre um serviço e '
    + 'outro, para você ter tempo de chegar sem correria.</div></div>';
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
  }]);
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
    /* nada na tela: se ela está disponível, um pedido chega em instantes */
    if(d.disponivel && podeAceitarServico() && proximaParaAlertar()){
      agendar(dispararAlerta, 4000);
    }
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

    if(E.alerta.restam > 0){ salvar(); desenhar(); return; }

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

    const restam = E.alerta.restam;
    const total = DISPONIBILIDADE.alertaExpiraEmSegundos;
    const m = Math.floor(restam / 60);
    const seg = String(restam % 60).padStart(2, "0");
    const apertado = restam <= 30;
    const fatia = Math.max(0, Math.min(100, (restam / total) * 100));

    return ''
    + '<div class="alerta-cheio' + (apertado ? " apertado" : "") + '">'

    +   '<div class="topo">'
    +     '<div class="sino">🔔</div>'
    +     '<div class="chamada">Novo pedido para você!</div>'
    +     '<div class="relogio">' + m + ':' + seg + '</div>'
    +     '<div class="trilho"><div style="width:' + fatia + '%"></div></div>'
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
    +     '</div>'
    +   '</div>'

    +   '<div class="pe">'
    +     '<button class="btn btn-principal grandao" onclick="aceitarDoAlerta()">'
    +       'Aceitar agora</button>'
    +     '<button class="btn btn-claro" onclick="recusarDoAlerta()">Agora não</button>'
    +     '<div class="miudo">Deixar passar não é falta. Não conta nada contra você.'
    +       '<br>🔊 o som tocou ' + (E.toquesDoAlerta || 0)
    +       (E.toquesDoAlerta === 1 ? ' vez' : ' vezes')
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


/* --------------------------------------------------------------------------
   A BARRA DE ABAS DELA
   -------------------------------------------------------------------------- */
function abasDaDiarista(ativa){
  const itens = [
    { id:"inicio",  ic:"casa",   nome:"Início",  tela:"diaristaHome" },
    { id:"agenda",  ic:"lista",  nome:"Agenda",  tela:"diaristaEmBreve" },
    { id:"ganhos",  ic:"escudo", nome:"Ganhos",  tela:"diaristaEmBreve" },
    { id:"perfil",  ic:"pessoa", nome:"Perfil",  tela:"diaristaPerfil" },
  ];
  return '<div class="abas">' + itens.map(function(i){
    return '<button class="' + (i.id === ativa ? "ativa" : "") + '" onclick="ir(\'' + i.tela + '\')">'
         + '<span class="ic">' + icone(i.ic, 21) + '</span>' + i.nome + '</button>';
  }).join("") + '</div>';
}
