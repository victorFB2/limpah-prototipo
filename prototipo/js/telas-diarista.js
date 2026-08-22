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

/* A barra que fica sempre visível na home dela.
   Sem ela, o Portão 1 vira um beco: a diarista entra, vê as oportunidades,
   não entende por que não consegue aceitar, e some. */
function barraDoCadastro(){
  const p = progressoDoCadastro();
  if(p.pct >= 100) return "";
  const cor = podeAceitarServico() ? "var(--verde)" : "var(--roxo)";
  return '<button class="cartao" style="width:100%;text-align:left;border:0;font-family:inherit;'
    + 'cursor:pointer;display:block" onclick="ir(\'diaristaCadastro\')">'
    +   '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'
    +     '<b style="font-size:13.5px">Cadastro ' + p.pct + '%</b>'
    +     '<span style="font-size:12px;color:var(--roxo);font-weight:700">continuar ›</span>'
    +   '</div>'
    +   '<div style="height:7px;background:var(--borda);border-radius:4px;overflow:hidden">'
    +     '<div style="height:100%;width:' + p.pct + '%;background:' + cor + ';border-radius:4px"></div>'
    +   '</div>'
    +   (p.falta ? '<div style="font-size:12px;color:var(--suave);margin-top:7px;line-height:1.45">'
        + esc(p.falta) + '</div>' : "")
    + '</button>';
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
  { quando:"Amanhã", periodo:"manha", bairro:"Vila Madalena", km:2.1,
    pedido:{ categoria:"diarista", respostas:{tipo:"padrao", comodos:3, banheiros:1}, adicionais:[] } },
  { quando:"Amanhã", periodo:"tarde", bairro:"Pinheiros", km:3.4,
    pedido:{ categoria:"diarista", respostas:{tipo:"completa", comodos:4, banheiros:2}, adicionais:["passar"] } },
  { quando:"Sexta",  periodo:"manha", bairro:"Perdizes", km:4.8,
    pedido:{ categoria:"diarista", respostas:{tipo:"padrao", comodos:5, banheiros:2}, adicionais:[] } },
  { quando:"Sexta",  periodo:"tarde", bairro:"Butantã", km:5.9,
    pedido:{ categoria:"diarista", respostas:{tipo:"padrao", comodos:2, banheiros:1}, adicionais:[] } },
  { quando:"Sábado", periodo:"manha", bairro:"Lapa", km:4.2,
    pedido:{ categoria:"diarista", respostas:{tipo:"completa", comodos:3, banheiros:2}, adicionais:[] } },
  { quando:"Sábado", periodo:"manha", bairro:"Pompeia", km:6.3,
    pedido:{ categoria:"diarista", respostas:{tipo:"padrao", comodos:4, banheiros:2}, adicionais:[] } },
  { quando:"Segunda", periodo:"tarde", bairro:"Perdizes", km:4.6,
    pedido:{ categoria:"diarista", respostas:{tipo:"padrao", comodos:3, banheiros:2}, adicionais:["geladeira"] } },
];

const NOME_DA_LIMPEZA = { padrao:"Limpeza padrão", completa:"Limpeza completa" };

/* Só mostra o que está nos bairros que ela escolheu. Prometer "oportunidades
   na sua região" e listar bairro que ela não marcou é quebrar a promessa na
   primeira tela — e é o tipo de detalhe que faz ela desconfiar do resto. */
function oportunidadesDaRegiao(){
  const d = euSouDiarista();
  const meus = d.bairros || [];

  return OPORTUNIDADES
    .map(function(c, i){ return { caso:c, id:i }; })
    .filter(function(x){ return meus.length === 0 || meus.indexOf(x.caso.bairro) >= 0; })
    .map(function(x){
      const c = x.caso;
      const conta = calcularPedido(c.pedido);
      const janela = janelaDoServico(c.periodo, conta.horas);
      const tipo = NOME_DA_LIMPEZA[c.pedido.respostas.tipo] || conta.categoria.nome;
      return {
        id: x.id,
        quando: c.quando,
        bairro: c.bairro,
        km: c.km,
        janela: janela ? janela.texto : conta.horas + "h",
        horas: conta.horas,
        receber: conta.repasseUnitario,
        resumo: tipo + " · " + c.pedido.respostas.comodos + " cômodos, "
              + c.pedido.respostas.banheiros
              + (c.pedido.respostas.banheiros === 1 ? " banheiro" : " banheiros"),
      };
    });
}

/* A oportunidade aberta é procurada pelo id, não pela posição — a lista
   encolhe quando ela muda de bairro, e a posição deixaria de valer. */
function oportunidadePorId(id){
  const lista = oportunidadesDaRegiao();
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
            + icone("escudo", 15) + 'Complete seu cadastro para aceitar</div>')
        + '</button>';
    });

    return ''
    + '<div class="corpo">'
    +   '<div style="padding:6px 0 14px">'
    +     '<div style="font-size:12.5px;color:var(--suave)">📍 ' + esc(d.regiao || "sua região") + '</div>'
    +   '</div>'
    +   '<h2 class="titulo">Olá, ' + esc((d.nome || "").split(" ")[0] || "tudo bem") + '! 👋<br>'
    +     (pode ? "Veja o que tem para hoje." : "Veja o que está esperando por você.") + '</h2>'

    +   barraDoCadastro()

    +   (pode
      ? '<div class="chave ' + (d.disponivel ? "ligada" : "") + '" onclick="alternarDisponivel()">'
        + '<div class="txt"><b>Disponível para trabalhar</b>'
        + '<span>' + (d.disponivel ? "Você está recebendo oportunidades." : "Ligue para receber oportunidades.") + '</span></div>'
        + '<div class="botao"></div></div>'
      : "")

    +   '<div class="rotulo">Oportunidades na sua região</div>'
    +   (lista.length ? cards
      : '<div class="aviso roxo">🔍<div><b>Nada nos seus bairros agora</b>'
        + 'Aparecem pedidos novos o dia inteiro. Marcar mais bairros aumenta '
        + 'suas chances — dá para mudar quando quiser.</div></div>'
        + '<button class="btn btn-contorno" onclick="ir(\'diaristaRegiao\')">'
        + 'Escolher mais bairros</button>')
    +   '<div class="rodape-seguro">Estes são pedidos reais da sua região.<br>'
    +     'O endereço exato aparece quando você aceita.</div>'
    + '</div>'
    + abasDaDiarista("inicio");
  }
};

function alternarDisponivel(){
  const d = euSouDiarista();
  if(!podeAceitarServico()) return;
  d.disponivel = !d.disponivel;
  salvar();
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
      ? '<button class="btn btn-principal" onclick="ir(\'diaristaAceitou\')">Aceitar este serviço</button>'
        + '<button class="btn btn-texto" onclick="voltar()">Agora não</button>'
      : '<div class="aviso roxo" style="margin:0 0 10px">' + icone("escudo", 18)
        + '<div><b>Falta pouco para você aceitar</b>'
        + 'Envie seus documentos e, assim que a gente aprovar, este botão libera.</div></div>'
        + '<button class="btn btn-principal" onclick="ir(\'diaristaCadastro\')">Completar meu cadastro</button>')
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
    +   '<h2 class="titulo">Cadastro ' + p.pct + '%</h2>'
    +   '<p class="apoio">' + (podeAceitarServico()
        ? "Você já pode aceitar serviços. O resto melhora seu perfil."
        : "Complete o segundo passo para começar a aceitar serviços.") + '</p>'

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
    + cabecalho("Documentos", { passos:[3,5] })
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
    + cabecalho("Selfie", { passos:[4,5] })
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
    + cabecalho("Antecedentes", { passos:[5,5] })
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
    + '<div class="rodape">'
    +   '<button class="btn btn-contorno" onclick="ir(\'diaristaHome\',{limparHistorico:true})">'
    +     'Ver oportunidades enquanto isso</button>'
    +   '<p class="ajuda" style="text-align:center;margin-top:10px">'
    +     '⚙ <a href="#" onclick="simularAprovacao();return false;" style="color:var(--suave)">'
    +     'simular: cadastro aprovado</a></p>'
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


/* --------------------------------------------------------------------------
   A BARRA DE ABAS DELA
   -------------------------------------------------------------------------- */
function abasDaDiarista(ativa){
  const itens = [
    { id:"inicio",  ic:"casa",   nome:"Início",  tela:"diaristaHome" },
    { id:"agenda",  ic:"lista",  nome:"Agenda",  tela:"diaristaEmBreve" },
    { id:"ganhos",  ic:"escudo", nome:"Ganhos",  tela:"diaristaEmBreve" },
    { id:"perfil",  ic:"pessoa", nome:"Perfil",  tela:"diaristaCadastro" },
  ];
  return '<div class="abas">' + itens.map(function(i){
    return '<button class="' + (i.id === ativa ? "ativa" : "") + '" onclick="ir(\'' + i.tela + '\')">'
         + '<span class="ic">' + icone(i.ic, 21) + '</span>' + i.nome + '</button>';
  }).join("") + '</div>';
}
