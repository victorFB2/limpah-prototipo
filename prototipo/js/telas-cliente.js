/* ==========================================================================
   LIMPAH — TELAS DO CLIENTE
   Do "quero uma diarista" até o serviço confirmado, mais as abas
   Meus serviços, Mensagens e Perfil.
   Corresponde ao bloco 2 do desenho aprovado.
   ========================================================================== */


/* --------------------------------------------------------------------------
   01. HOME
   -------------------------------------------------------------------------- */
TELAS.home = {
  html: function(){
    const c = FONTE.ler.cliente();
    /* no app, os pedidos vêm do servidor (enquanto não chegam, a lista
       fica vazia, e a tela se redesenha quando eles chegam) */
    const pedidos = FONTE.ler.pedidos() || [];
    const proximo = pedidos.find(function(p){ return p.situacao === "confirmado"; });
    const naBusca = pedidos.find(pedidoNaBusca);
    const aPagar = proximoPedidoAPagar(pedidos);
    const lugar = lugarDoCliente(c);

    /* --- próximo serviço --- */
    let blocoProximo;
    if(proximo){
      const prof = FONTE.ler.profissionalDoPedido(proximo) || { nome:"", cor:"" };
      blocoProximo = '<button class="item" onclick="abrirPedido(\'' + idSeguro(proximo.id) + '\')">'
        + avatar(prof.nome, prof.cor, "pequeno")
        + '<div class="txt"><b>' + esc(nomeCurto(prof.nome) || proximo.resumoTexto) + '</b>'
        + '<span>' + esc(dataPorExtenso(proximo.data)) + ' · '
        + esc(nomePeriodoComAJanela(proximo.periodo, janelaDoPedidoEmTexto(proximo))) + '</span></div>'
        + '<span class="selo verde">Confirmado</span></button>';
    } else if(naBusca || aPagar){
      /* O pedido que ainda procura profissional (2b) e o que acabou de nascer
         "Aguardando o pagamento" aparecem aqui, com o selo de "Meus
         serviços": sem eles, o início dizia "Nenhum serviço agendado" logo
         depois do "Confirmar pedido", e a pessoa podia achar que o pedido
         sumiu e pedir de novo. */
      const p = naBusca || aPagar;
      const cat = CATALOGO.find(function(x){ return x.id === p.categoria; }) || { icone:"" };
      blocoProximo = '<button class="item" onclick="abrirPedido(\'' + idSeguro(p.id) + '\')">'
        + '<div style="color:var(--roxo);width:26px">' + icone(cat.icone, 21) + '</div>'
        + '<div class="txt"><b>' + esc(p.resumoTexto) + '</b>'
        /* com a janela maior que a faixa (6 h à tarde), só "Tarde": a faixa
           padrão contradiria o detalhe ("das 12h às 18h") */
        + '<span>' + esc(dataPorExtenso(p.data)) + ' · '
        + esc(nomePeriodoComAJanela(p.periodo, janelaDoPedidoEmTexto(p))) + '</span></div>'
        + (SELO_DA_SITUACAO[p.situacao] || "") + '</button>';
    } else {
      blocoProximo = '<div class="cartao" style="display:flex;gap:12px;align-items:center">'
        + '<div style="font-size:26px">📅</div>'
        + '<div><b style="font-size:14px">Nenhum serviço agendado</b>'
        + '<div style="font-size:12.5px;color:var(--suave);margin-top:3px">Que tal agendar para amanhã?</div></div></div>';
    }

    /* --- serviços recentes --- */
    const concluidos = pedidos.filter(function(p){ return p.situacao === "concluido"; });
    let blocoRecentes = "";
    if(concluidos.length){
      blocoRecentes = '<div class="rotulo" style="display:flex;justify-content:space-between">'
        + '<span>Serviços recentes</span>'
        + '<a href="#" onclick="trocarAba(\'servicos\');return false;" style="color:var(--roxo);font-weight:600;text-decoration:none;font-size:12.5px">Ver todos</a></div>';
      concluidos.slice(0, 2).forEach(function(p){
        const prof = FONTE.ler.profissionalDoPedido(p) || { nome:"", cor:"" };
        blocoRecentes += '<button class="item" onclick="abrirPedido(\'' + idSeguro(p.id) + '\')">'
          + avatar(prof.nome, prof.cor, "pequeno")
          + '<div class="txt"><b>' + esc(p.resumoTexto) + '</b>'
          + '<span>' + esc(dataPorExtenso(p.data)) + ' · Concluído · ' + moeda(p.total) + '</span></div></button>';
      });
    }

    /* --- favoritas (no app, ainda não existem: a lista vem vazia) --- */
    const favoritas = FONTE.ler.favoritas() || [];
    let blocoFavoritas = "";
    if(favoritas.length){
      blocoFavoritas = '<div class="rotulo">Suas favoritas ❤️</div><div class="fileira">';
      favoritas.forEach(function(p){
        blocoFavoritas += '<button onclick="abrirPerfil(' + Number(p.id) + ')" '
          + 'style="flex:none;width:88px;text-align:center;background:var(--branco);border:0;'
          + 'font-family:inherit;color:var(--texto);cursor:pointer;'
          + 'border-radius:14px;padding:12px 6px;box-shadow:var(--sombra)">'
          + '<div style="display:flex;justify-content:center;margin-bottom:6px">' + avatar(p.nome, p.cor, "pequeno") + '</div>'
          + '<div style="font-size:12px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'
          + esc(p.nome.split(" ")[0]) + '</div>'
          + '<div style="font-size:11px;color:var(--suave);margin-top:2px">' + estrelas(p.nota) + '</div></button>';
      });
      blocoFavoritas += '</div>';
    }

    return ''
    + '<div class="corpo">'
    +   '<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0 14px">'
    +     '<div style="font-size:12.5px;color:var(--suave)">' + (lugar ? '📍 ' + esc(lugar) : '') + '</div>'
    +     '<div style="position:relative">' + avatar(c.nome, c.cor, "pequeno")
    +       (naoLidasDoCliente() ? '<span style="position:absolute;top:-2px;right:-2px;width:12px;height:12px;'
    +         'background:var(--vermelho);border:2px solid var(--fundo);border-radius:50%"></span>' : "")
    +     '</div>'
    +   '</div>'

    /* mensagem nova da profissional, com o app fechado (A18): o cartão vem
       antes de tudo — "estou em frente ao prédio" não pode esperar rolagem */
    +   cartaoDeMensagemNova("cliente")
    +   '<h2 class="titulo">Olá, ' + esc(c.primeiroNome) + '! 👋<br>O que você precisa hoje?</h2>'

    +   '<button class="btn btn-principal" style="margin:18px 0 22px" onclick="comecarPedido()">Novo serviço</button>'

    +   '<div class="rotulo">Próximo serviço</div>'
    +   blocoProximo
    +   blocoRecentes
    +   blocoFavoritas
    + '</div>'
    + abas("inicio");
  },
  /* no app: os pedidos de agora (a cada visita), as casas (a cidade) e as
     conversas (o cartão de mensagem nova) */
  aoEntrar: function(){ pedirPedidosNestaVisita(); pedirCasasSeFaltar(); pedirAsConversasNestaVisita(); }
};

/* O pedido esperando o pagamento com o dia mais perto (de hoje em diante). */
function proximoPedidoAPagar(pedidos){
  const hoje = isoDoDia(new Date());
  return pedidos
    .filter(function(p){ return p.situacao === "aguardando_pagamento" && String(p.data) >= hoje; })
    .sort(function(a, b){ return String(a.data) < String(b.data) ? -1 : (String(a.data) > String(b.data) ? 1 : 0); })[0]
    || null;
}

/* A cidade do alto do início: a do endereço do cadastro (maquete) ou a da
   primeira casa (app). Sem nenhuma, nada. */
function lugarDoCliente(c){
  const en = (c && c.endereco) || (FONTE.ler.casas() || [])[0] || null;
  if(!en || !en.cidade) return "";
  return en.cidade + (en.estado ? ", " + en.estado : "");
}

/* OS PEDIDOS QUE AINDA NÃO CHEGARAM (só no app: na maquete moram no
   aparelho). As telas da lista ("Meus serviços", o início) perguntam ao
   servidor a cada visita — um pedido pode ter mudado desde a última vez;
   o detalhe, só se a lista ainda não veio. Sem resposta, a frase e o
   "Tentar de novo", só nesta visita. */
let PEDIDOS_PEDIDOS_NA_NAVEGACAO = -1;
let ERRO_DOS_PEDIDOS = null;    // { frase, navegacao }

function erroDosPedidosAgora(){
  return (ERRO_DOS_PEDIDOS && ERRO_DOS_PEDIDOS.navegacao === NAVEGACAO) ? ERRO_DOS_PEDIDOS.frase : "";
}

function pedirPedidosNestaVisita(){
  if(PEDIDOS_PEDIDOS_NA_NAVEGACAO === NAVEGACAO || erroDosPedidosAgora()) return;
  PEDIDOS_PEDIDOS_NA_NAVEGACAO = NAVEGACAO;
  FONTE.carregarPedidos(depoisDosPedidos);
}

function pedirPedidosSeFaltar(){
  if(FONTE.ler.pedidos() !== null) return;
  pedirPedidosNestaVisita();
}

/* Telas sem campo para digitar: redesenhar não apaga nada. Na maquete a
   resposta chega na hora, e redesenhar seria trabalho à toa. */
function depoisDosPedidos(r){
  if(r.destino) return seguirPeloErro(r);
  ERRO_DOS_PEDIDOS = r.ok ? null : { frase: r.erro || "", navegacao: NAVEGACAO };
  if(!FONTE.ehMaquete) desenhar();
}

function pedidosAindaNao(){
  const erro = erroDosPedidosAgora();
  if(!erro) return '<p class="apoio">Carregando seus pedidos…</p>';
  return '<div class="aviso ambar">⚠️<div>' + esc(erro) + '</div></div>'
    + '<button class="btn btn-contorno" onclick="tentarOsPedidosDeNovo()">Tentar de novo</button>';
}

function tentarOsPedidosDeNovo(){
  ERRO_DOS_PEDIDOS = null;
  PEDIDOS_PEDIDOS_NA_NAVEGACAO = -1;
  desenhar();
}

function comecarPedido(){
  E.pedido = pedidoNovo();
  salvar();
  ir("novoServico");
}


/* --------------------------------------------------------------------------
   02. ESCOLHA DO SERVIÇO
   A lista sai do CATALOGO — acrescentar uma profissão lá faz ela aparecer aqui.
   -------------------------------------------------------------------------- */
TELAS.novoServico = {
  html: function(){
    let lista = "";
    CATALOGO.forEach(function(cat){
      if(categoriaVendida(cat)){
        lista += '<button class="opcao" onclick="escolherCategoria(\'' + idSeguro(cat.id) + '\')">'
          + '<div class="icone">' + icone(cat.icone, 22) + '</div>'
          + '<div class="txt"><b>' + esc(cat.nome) + '</b><span>' + esc(cat.descricao) + '</span></div>'
          + '<div class="seta">›</div></button>';
      } else {
        lista += '<button class="opcao" disabled>'
          + '<div class="icone">' + icone(cat.icone, 22) + '</div>'
          + '<div class="txt"><b>' + esc(cat.nome) + '</b><span>' + esc(cat.descricao) + '</span></div>'
          + '<span class="selo cinza">Em breve</span></button>';
      }
    });

    return ''
    + cabecalho("Novo serviço")
    + '<div class="corpo">'
    +   '<h2 class="titulo">Qual serviço você precisa?</h2>'
    +   '<p class="apoio">Escolha uma categoria para continuar.</p>'
    +   lista
    +   erroDoCampo("casas-erro", "novoServico", "")
    + '</div>';
  }
};

/* O serviço pode ser pedido agora? O do catálogo marcado como disponível
   e, no app, só os que o servidor vende agora (os outros aparecem como
   "Em breve"). */
function categoriaVendida(cat){
  const vendidas = FONTE.ler.categoriasVendidas();
  return !!cat && cat.disponivel === true && (vendidas === null || vendidas.indexOf(cat.id) >= 0);
}

function escolherCategoria(id){
  const cat = CATALOGO.find(function(c){ return c.id === id; });
  if(!categoriaVendida(cat)) return;

  E.pedido = pedidoNovo();
  E.pedido.categoria = id;

  /* Já deixa as perguntas com uma resposta inicial, para o cliente não
     precisar preencher tudo do zero. */
  cat.perguntas.forEach(function(p){
    if(p.tipo === "opcao")    E.pedido.respostas[p.id] = p.opcoes[0].id;
    if(p.tipo === "contador") E.pedido.respostas[p.id] = p.inicial;
    if(p.tipo === "texto")    E.pedido.respostas[p.id] = "";
  });

  salvar();

  /* NOVA ORDEM (decisão R10): a casa vem antes do horário.
     Sem saber o tamanho, o app não tem como oferecer horários que caibam.
     No app, as casas de agora vêm do servidor antes de escolher o caminho
     (sem internet, a frase fica nesta tela). */
  mostrarErro("casas-erro", "");
  FONTE.carregarCasas(function(r){
    if(r.destino) return seguirPeloErro(r);
    if(!r.ok) return mostrarErro("casas-erro", r.erro);
    seguirParaACasa();
  });
}

/* Sem casa: cadastrar. Uma só, e atendida: segue com ela. Mais de uma, ou
   uma que está fora da área ou precisa ser conferida (só no app): a
   escolha, onde a casa em âmbar abre a ficha dela, e não o pedido. */
function seguirParaACasa(){
  const casas = FONTE.ler.casas() || [];
  if(casas.length === 0) novaCasa();
  else if(casas.length === 1 && !NOTA_DA_AREA[casas[0].area]) usarCasa(casas[0].id);
  else ir("escolherCasa");
}

/* Escolhida a casa, o tamanho dela entra no pedido. */
function usarCasa(casaId){
  E.pedido.casaId = casaId;
  E.pedido.ajustadoDestaVez = false;
  const casa = casaDoPedido(E.pedido);
  if(casa){
    if(E.pedido.respostas.comodos   !== undefined) E.pedido.respostas.comodos   = casa.comodos;
    if(E.pedido.respostas.banheiros !== undefined) E.pedido.respostas.banheiros = casa.banheiros;
  }
  salvar();
  ir("detalhes");
}


/* ==========================================================================
   79, 80 e 81. AS CASAS DO CLIENTE (decisão R10)

   A casa é cadastrada uma vez e reaproveitada. Guarda o TAMANHO e o
   ENDEREÇO — nunca o tipo de limpeza nem os adicionais, que mudam a cada
   pedido.

   Três telas, uma função cada:
     escolherCasa   — qual delas, quando há mais de uma
     cadastrarCasa  — cadastrar ou editar
     minhasCasas    — a lista, dentro do Perfil

   As casas vêm da tomada (FONTE): na maquete, deste aparelho; no app, do
   servidor, que descobre a posição pelo endereço e diz se a casa está na
   área atendida ("area": atendida, fora ou conferir). A tela só mostra.
   ========================================================================== */

/* O que dizer de uma casa que não está na área (no app; na maquete, toda
   casa é atendida). */
const NOTA_DA_AREA = {
  fora: "Ainda não atendemos este endereço",
  conferir: "Toque para conferir este endereço",
};

function cartaoDeCasa(casa, aoTocar, extra){
  const nota = NOTA_DA_AREA[casa.area] || "";
  return '<button class="item" onclick="' + aoTocar + '">'
    + '<div style="color:var(--roxo);width:26px">'
    +   icone(casa.tipoImovel === "casa" ? "casa" : (casa.tipoImovel === "escritorio" ? "maleta" : "predio"), 21)
    + '</div>'
    + '<div class="txt"><b>' + esc(casa.apelido) + '</b>'
    +   '<span>' + esc(casa.rua) + (casa.bairro ? " · " + esc(casa.bairro) : "")
    +     '<br>' + Number(casa.comodos) + ' cômodos · ' + Number(casa.banheiros) + ' banheiro'
    +     (Number(casa.banheiros) === 1 ? "" : "s") + '</span>'
    +   (nota ? '<span class="nota-da-area">' + esc(nota) + '</span>' : '')
    + '</div>'
    + (extra || '<div class="seta">›</div>')
    + '</button>';
}

/* AS CASAS QUE AINDA NÃO CHEGARAM (só no app: na maquete elas moram no
   aparelho e estão sempre à mão). A lista é pedida ao servidor quando a
   tela abre; enquanto isso, "Carregando". Sem resposta, a frase e o
   "Tentar de novo" — e só nesta visita à tela: voltando a ela, pergunta de
   novo. */
let ERRO_DAS_CASAS = null;    // { frase, navegacao }

function erroDasCasasAgora(){
  return (ERRO_DAS_CASAS && ERRO_DAS_CASAS.navegacao === NAVEGACAO) ? ERRO_DAS_CASAS.frase : "";
}

function casasAindaNao(){
  const erro = erroDasCasasAgora();
  if(!erro) return '<p class="apoio">Carregando seus endereços…</p>';
  return '<div class="aviso ambar">⚠️<div>' + esc(erro) + '</div></div>'
    + '<button class="btn btn-contorno" onclick="tentarAsCasasDeNovo()">Tentar de novo</button>';
}

/* Pede as casas, se faltarem, e redesenha quando chegam (telas sem campo
   para digitar: redesenhar não apaga nada). Uma vez por visita: o início
   pede também os pedidos, e redesenhar quando eles chegam não pede as
   casas de novo. */
let CASAS_PEDIDAS_NA_NAVEGACAO = -1;

function pedirCasasSeFaltar(){
  if(FONTE.ler.casas() !== null || erroDasCasasAgora() || CASAS_PEDIDAS_NA_NAVEGACAO === NAVEGACAO) return;
  CASAS_PEDIDAS_NA_NAVEGACAO = NAVEGACAO;
  FONTE.carregarCasas(function(r){
    if(r.destino) return seguirPeloErro(r);
    ERRO_DAS_CASAS = r.ok ? null : { frase: r.erro || "", navegacao: NAVEGACAO };
    desenhar();
  });
}

function tentarAsCasasDeNovo(){
  ERRO_DAS_CASAS = null;
  CASAS_PEDIDAS_NA_NAVEGACAO = -1;
  desenhar();
}


/* ---- 79. QUAL CASA ---- */
TELAS.escolherCasa = {
  html: function(){
    const casas = FONTE.ler.casas();
    let lista = "";
    if(casas === null) lista = casasAindaNao();
    else casas.forEach(function(c){
      /* casa fora da área (ou para conferir) abre a ficha dela, e não o pedido */
      if(NOTA_DA_AREA[c.area]) lista += cartaoDeCasa(c, "editarCasa('" + idSeguro(c.id) + "')");
      else lista += cartaoDeCasa(c, "usarCasa('" + idSeguro(c.id) + "')");
    });

    return ''
    + cabecalho("Qual casa?")
    + '<div class="corpo">'
    +   '<h2 class="titulo">Onde vai ser o serviço?</h2>'
    +   '<p class="apoio">Escolha um dos endereços que você já cadastrou.</p>'
    +   lista
    +   '<button class="btn btn-contorno" style="margin-top:6px" onclick="novaCasa()">'
    +     '+ Cadastrar outro endereço</button>'
    +   erroDoCampo("casas-erro", "escolherCasa", "")
    + '</div>';
  },
  aoEntrar: function(){ pedirCasasSeFaltar(); }
};


/* ---- 80. CADASTRAR OU EDITAR A CASA ---- */

/* O que a pessoa já digitou na ficha, guardado na MEMÓRIA (nunca no
   aparelho) quando a tela precisa ser redesenhada (o tipo de imóvel, os
   contadores) ou quando ela vai ver "Onde atendemos": sem isso, um toque
   no "+" apagava o endereço digitado. Some ao abrir outra ficha, ao salvar
   e ao apagar. */
let CASA_DIGITADA = null;
const CAMPOS_DA_FICHA_DA_CASA = { apelido:"casa-apelido", cep:"casa-cep", rua:"casa-rua",
                                  numero:"casa-numero", complemento:"casa-comp",
                                  bairro:"casa-bairro", cidade:"casa-cidade" };

function guardarOQueFoiDigitadoNaCasa(){
  if(E.tela !== "cadastrarCasa") return;
  const desenhada = document.getElementById("casa-apelido");
  if(!desenhada) return;
  CASA_DIGITADA = {};
  Object.keys(CAMPOS_DA_FICHA_DA_CASA).forEach(function(k){
    CASA_DIGITADA[k] = valorDoCampo(CAMPOS_DA_FICHA_DA_CASA[k]);
  });
}

/* Abrir a ficha: no app, a lista dos bairros vem antes (sem internet, a
   frase aparece na tela de onde a pessoa veio, no lugar "casas-erro"). */
function abrirAFichaDaCasa(id, opcoes){
  mostrarErro("casas-erro", "");
  FONTE.carregarArea(function(r){
    if(r.destino) return seguirPeloErro(r);
    if(!r.ok) return mostrarErro("casas-erro", r.erro);
    E.casaEditando = id;
    E.casaRascunhoTipo = null;
    E.casaRascunhoComodos = null;
    E.casaRascunhoBanheiros = null;
    CASA_DIGITADA = null;
    salvar();
    ir("cadastrarCasa", opcoes);
  });
}

function novaCasa(){
  abrirAFichaDaCasa(null);
}

function editarCasa(id){
  abrirAFichaDaCasa(id);
}

TELAS.cadastrarCasa = {
  html: function(){
    const casas = FONTE.ler.casas() || [];
    const editando = E.casaEditando
      ? casas.find(function(c){ return c.id === E.casaEditando; })
      : null;
    /* no app, quem acabou de criar a conta encontra o endereço do cadastro */
    const doCadastro = editando ? null : FONTE.ler.casaDoCadastro();
    /* o endereço do cadastro não diz o tamanho nem o tipo: vêm do padrão */
    const c = editando || Object.assign({
      apelido:"", tipoImovel:"apartamento", comodos:3, banheiros:1,
      rua:"", complemento:"", bairro:"", cidade:"São Paulo", estado:"SP", cep:"",
    }, doCadastro || {});
    const primeira = casas.length === 0;
    const rua = ruaENumero(c);
    const d = function(k, padrao){ return (CASA_DIGITADA && CASA_DIGITADA[k] != null) ? CASA_DIGITADA[k] : padrao; };
    const cidadeEstado = [c.cidade || "São Paulo", c.estado || "SP"].join(" - ");

    /* tipo de imóvel */
    let tipos = "";
    TIPOS_DE_IMOVEL.forEach(function(t){
      const marcado = (E.casaRascunhoTipo || c.tipoImovel || "apartamento") === t.id;
      tipos += '<button class="opcao ' + (marcado ? "marcada" : "") + '" '
        + 'onclick="escolherTipoDeImovel(\'' + idSeguro(t.id) + '\')" style="margin-bottom:8px">'
        + '<div class="icone">' + icone(t.icone === "predio" ? "predio" : t.icone, 22) + '</div>'
        + '<div class="txt"><b>' + esc(t.nome) + '</b></div>'
        + (marcado ? '<div class="seta">✓</div>' : "") + '</button>';
    });

    return ''
    + cabecalho(editando ? "Editar endereço" : "Sua casa")
    + '<div class="corpo">'
    +   '<h2 class="titulo">' + (primeira ? "Conte sobre a sua casa" : (editando ? "Editar endereço" : "Novo endereço")) + '</h2>'
    +   '<p class="apoio">' + (primeira
        ? "Você faz isso uma vez só. Nos próximos pedidos é só escolher a data."
        : "Assim você não precisa descrever tudo de novo a cada pedido.") + '</p>'

    +   (c.veioDoHistorico
        ? '<div class="aviso roxo">👋<div><b>Preenchemos com o que já sabíamos</b>'
          + 'Tiramos do seu último pedido. Confira se está certo.</div></div>' : "")
    +   (doCadastro
        ? '<div class="aviso roxo">👋<div><b>Preenchemos com o endereço do cadastro</b>'
          + 'Confira se está tudo certo e conte o tamanho da casa.</div></div>' : "")
    +   (editando && editando.area === "fora"
        ? '<div class="aviso ambar">📍<div><b>Ainda não atendemos este endereço</b>'
          + 'Veja abaixo os bairros onde já atendemos.</div></div>' : "")
    +   (editando && editando.area === "conferir"
        ? '<div class="aviso ambar">📍<div><b>Confira este endereço</b>'
          + 'Salve de novo para conferirmos no mapa.</div></div>' : "")

    +   '<div class="rotulo">Tipo de imóvel</div>'
    +   tipos

    +   '<div class="rotulo">Tamanho</div>'
    +   '<div class="contador">'
    +     '<span class="nome">Número de cômodos</span>'
    +     '<span class="controles">'
    +       '<button onclick="contarNaCasa(\'comodos\',-1)">−</button>'
    +       '<span class="valor" id="casa-comodos">' + Number(E.casaRascunhoComodos != null ? E.casaRascunhoComodos : c.comodos) + '</span>'
    +       '<button onclick="contarNaCasa(\'comodos\',1)">+</button>'
    +     '</span></div>'
    +   '<p class="ajuda">Conte quartos, sala, cozinha e área de serviço.</p>'
    +   '<div class="contador" style="margin-top:10px">'
    +     '<span class="nome">Banheiros</span>'
    +     '<span class="controles">'
    +       '<button onclick="contarNaCasa(\'banheiros\',-1)">−</button>'
    +       '<span class="valor" id="casa-banheiros">' + Number(E.casaRascunhoBanheiros != null ? E.casaRascunhoBanheiros : c.banheiros) + '</span>'
    +       '<button onclick="contarNaCasa(\'banheiros\',1)">+</button>'
    +     '</span></div>'

    +   '<div class="rotulo">Endereço</div>'
    +   '<div class="campo"><label>Como você chama este lugar</label>'
    +     '<input id="casa-apelido" type="text" placeholder="Casa, Apartamento, Escritório..." value="' + esc(d("apelido", c.apelido)) + '">'
    +     erroDoCampo("casa-apelido-erro", "cadastrarCasa", "apelido") + '</div>'
    +   '<div class="campo"><label>CEP</label><input id="casa-cep" type="text" inputmode="numeric" '
    +     'autocomplete="postal-code" value="' + esc(d("cep", c.cep)) + '">'
    +     erroDoCampo("casa-cep-erro", "cadastrarCasa", "cep") + '</div>'
    +   camposDaRua("casa-rua", "casa-numero",
                    { logradouro:d("rua", rua.logradouro), numero:d("numero", rua.numero) }, "cadastrarCasa")
    +   '<div class="campo"><label>Complemento</label><input id="casa-comp" type="text" value="' + esc(d("complemento", c.complemento)) + '">'
    +     erroDoCampo("casa-comp-erro", "cadastrarCasa", "complemento") + '</div>'
    +   campoDeBairro("casa-bairro", d("bairro", c.bairro), "cadastrarCasa")
    +   '<div class="campo"><label>Cidade e estado</label>'
    +     '<input id="casa-cidade" type="text" value="' + esc(d("cidade", cidadeEstado)) + '">'
    +     erroDoCampo("casa-cidade-erro", "cadastrarCasa", "cidade") + '</div>'

    +   avisoDePrivacidadeDoEndereco()
    + '</div>'
    /* a frase que não é de um campo (o endereço com pedido marcado, o mapa
       fora do ar, "Preencha ao menos...") fica no rodapé, junto do botão:
       no fim da ficha ela aparecia fora da vista, e o "Salvar" parecia um
       botão morto (revisão da 1c e da 2a) */
    + '<div class="rodape">'
    +   '<button class="btn btn-principal" onclick="salvarCasa(this)">'
    +     (editando ? "Salvar alterações" : "Salvar e continuar") + '</button>'
    +   '<div id="casa-erro" class="erro-do-campo"></div>'
    +   (editando && casas.length > 1
       ? '<button class="btn btn-perigo" onclick="apagarCasa(\'' + idSeguro(editando.id) + '\', this)">Apagar este endereço</button>'
       : "")
    + '</div>';
  },
  aoEntrar: function(){ pedirBairrosSeFaltar(); }
};

function escolherTipoDeImovel(id){
  guardarOQueFoiDigitadoNaCasa();
  E.casaRascunhoTipo = id;
  salvar();
  desenhar();
}

function contarNaCasa(qual, delta){
  const casas = FONTE.ler.casas() || [];
  const editando = E.casaEditando ? casas.find(function(c){ return c.id === E.casaEditando; }) : null;
  const limites = { comodos:[1,12], banheiros:[0,6] };
  const chave = qual === "comodos" ? "casaRascunhoComodos" : "casaRascunhoBanheiros";
  const atual = (E[chave] != null) ? E[chave] : (editando ? editando[qual] : (qual === "comodos" ? 3 : 1));
  const novo = atual + delta;
  if(novo < limites[qual][0] || novo > limites[qual][1]) return;
  guardarOQueFoiDigitadoNaCasa();
  E[chave] = novo;
  salvar();
  desenhar();
}

/* qual lugar de erro, embaixo de qual campo da ficha */
const ERRO_DO_CAMPO_DA_CASA = {
  apelido:"casa-apelido-erro", cep:"casa-cep-erro", rua:"casa-rua-erro", numero:"casa-numero-erro",
  complemento:"casa-comp-erro", bairro:"casa-bairro-erro", cidade:"casa-cidade-erro",
};

function limparErrosDaCasa(){
  Object.keys(ERRO_DO_CAMPO_DA_CASA).forEach(function(k){ mostrarErro(ERRO_DO_CAMPO_DA_CASA[k], ""); });
  mostrarErro("casa-erro", "");
}

/* A frase de uma casa recusada (no app: bairro fora da área, endereço que o
   mapa não achou, localizador fora do ar...), embaixo do campo. Nada do que
   foi digitado é apagado. */
function mostrarErroDaCasa(r){
  if(r.destino) return seguirPeloErro(r);
  mostrarErro(ERRO_DO_CAMPO_DA_CASA[r.campo] || "casa-erro", r.erro);
}

function salvarCasa(botao){
  const valor = function(id){ return valorDoCampo(id).trim(); };
  limparErrosDaCasa();
  const apelido = valor("casa-apelido");
  const rua = valor("casa-rua");
  if(apelido.length < 2 || rua.length < 3){
    mostrarErro("casa-erro", "Preencha ao menos como você chama o lugar e o endereço.");
    return;
  }
  const cidadeEstado = separarCidadeEEstado(valor("casa-cidade"));
  const casas = FONTE.ler.casas() || [];
  const editando = E.casaEditando ? casas.find(function(c){ return c.id === E.casaEditando; }) : null;

  FONTE.salvarCasa({
    id: editando ? editando.id : null,
    apelido: apelido,
    tipoImovel: E.casaRascunhoTipo || (editando ? editando.tipoImovel : "apartamento"),
    comodos:   (E.casaRascunhoComodos   != null) ? E.casaRascunhoComodos   : (editando ? editando.comodos : 3),
    banheiros: (E.casaRascunhoBanheiros != null) ? E.casaRascunhoBanheiros : (editando ? editando.banheiros : 1),
    logradouro: rua,
    numero: valor("casa-numero"),
    complemento: valor("casa-comp"),
    bairro: valor("casa-bairro"),
    cidade: cidadeEstado.cidade,
    estado: cidadeEstado.estado,
    cep: valor("casa-cep"),
  }, function(r){
    if(!r.ok) return mostrarErroDaCasa(r);
    E.casaEditando = null;
    E.casaRascunhoTipo = null;
    E.casaRascunhoComodos = null;
    E.casaRascunhoBanheiros = null;
    CASA_DIGITADA = null;
    /* A casa do pedido em montagem foi salva de novo: no app ela pode
       ganhar outro número (o endereço mudou numa casa que já teve pedido:
       o servidor grava uma nova e desliga a antiga), e o pedido passa a ser
       dela — senão o "Confirmar" mandaria a antiga, e o servidor diria
       "Não achamos esse endereço" para sempre. O tamanho novo também vale,
       a não ser que a pessoa tenha ajustado só para este pedido. */
    if(E.pedido && r.trocou && E.pedido.casaId === r.trocou){
      E.pedido.casaId = r.id;
      const nova = casaDoPedido(E.pedido);
      if(nova && !E.pedido.ajustadoDestaVez){
        if(E.pedido.respostas.comodos   !== undefined) E.pedido.respostas.comodos   = nova.comodos;
        if(E.pedido.respostas.banheiros !== undefined) E.pedido.respostas.banheiros = nova.banheiros;
      }
    }
    salvar();
    /* Se veio de dentro de um pedido, segue o pedido. Senão, volta para
       onde estava — ou, sem para onde voltar (veio da boas-vindas), para a
       lista dos endereços, com a casa nova nela. */
    if(E.pedido && E.pedido.categoria && !E.pedido.casaId) return usarCasa(r.id);
    if(E.historico.length) return voltar();
    ir("minhasCasas", { limparHistorico:true });
  }, { botao: botao || null });
}

function apagarCasa(id, botao){
  const casas = FONTE.ler.casas() || [];
  if(casas.length <= 1) return;   // ninguém fica sem nenhuma casa
  mostrarErro("casa-erro", "");
  FONTE.apagarCasa(id, function(r){
    if(!r.ok) return mostrarErroDaCasa(r);
    E.casaEditando = null;
    CASA_DIGITADA = null;
    salvar();
    voltar();
  }, { botao: botao || null });
}


/* ---- 81. MINHAS CASAS (dentro do Perfil) ---- */
TELAS.minhasCasas = {
  html: function(){
    const casas = FONTE.ler.casas();
    let lista = "";
    if(casas === null) lista = casasAindaNao();
    else casas.forEach(function(c){
      lista += cartaoDeCasa(c, "editarCasa('" + idSeguro(c.id) + "')");
    });
    if(casas && !casas.length) lista = '<div class="vazio">Você ainda não cadastrou nenhum endereço.</div>';

    return ''
    + cabecalho("Meus endereços")
    + '<div class="corpo">'
    +   lista
    +   '<p class="ajuda">O tamanho fica guardado aqui. O tipo de limpeza você escolhe '
    +     'a cada pedido — hoje pode ser padrão, no mês que vem completa.</p>'
    + '</div>'
    + '<div class="rodape">'
    +   '<button class="btn btn-principal" onclick="novaCasa()">+ Cadastrar endereço</button>'
    +   erroDoCampo("casas-erro", "minhasCasas", "")
    + '</div>';
  },
  aoEntrar: function(){ pedirCasasSeFaltar(); }
};


/* --------------------------------------------------------------------------
   03. DATA E HORÁRIO
   -------------------------------------------------------------------------- */
TELAS.dataHorario = {
  html: function(){
    const dias = proximosDias(DIAS_PARA_ESCOLHER + 1);
    const hoje = dias[0], amanha = dias[1];
    const temHoje = hojeAindaServe();

    /* Se o que estava escolhido deixou de servir (o cliente demorou na tela
       e passou da hora), cai para amanhã em vez de ficar num dia inválido. */
    if(!E.pedido.data || (E.pedido.data === hoje.iso && !temHoje)) E.pedido.data = amanha.iso;

    const escolhida = E.pedido.data;
    const ehOutraData = escolhida !== hoje.iso && escolhida !== amanha.iso;

    /* EXCEÇÃO AUTORIZADA Nº 5: a imagem mostra quatro dias fixos numa fileira
       que rola. Vira Hoje · Amanhã · Escolher data, porque na imagem não havia
       como pedir para daqui a duas semanas. */
    let chips = '<div class="fileira">';

    if(temHoje){
      chips += '<button class="chip-data ' + (escolhida === hoje.iso ? "marcada" : "") + '" '
        + 'onclick="escolherData(\'' + idSeguro(hoje.iso) + '\')">'
        + '<span>Hoje</span><b>' + esc(hoje.curto) + '</b></button>';
    }

    chips += '<button class="chip-data ' + (escolhida === amanha.iso ? "marcada" : "") + '" '
      + 'onclick="escolherData(\'' + idSeguro(amanha.iso) + '\')">'
      + '<span>Amanhã</span><b>' + esc(amanha.curto) + '</b></button>';

    chips += '<button class="chip-data ' + (ehOutraData ? "marcada" : "") + '" '
      + 'style="width:auto;padding-left:14px;padding-right:14px" onclick="ir(\'calendario\')">'
      + '<span>' + (ehOutraData ? "Escolhida" : "Escolher") + '</span>'
      + '<b>' + (ehOutraData ? esc(dataPorExtenso(escolhida).replace(/^\w+, /, "")) : "data") + '</b>'
      + '</button>';

    chips += '</div>';

    /* Aviso de quando o "Hoje" não cabe mais */
    let avisoHoje = "";
    if(!temHoje){
      avisoHoje = '<p class="ajuda" style="margin:2px 0 0">'
        + 'Para hoje já não dá tempo: a diarista precisa de pelo menos '
        + ANTECEDENCIA_MINIMA_HORAS + ' horas para se organizar e chegar até você.</p>';
    }

    /* Agora a tela sabe de quantas horas o serviço precisa, porque ela vem
       DEPOIS do tamanho da casa (decisão R10). Então só oferece horário que
       realmente cabe — antes ela oferecia "12h às 16h" e a tela seguinte
       dizia que o serviço precisava de 8 horas. */
    const contaDoPedido = calcularPedido(E.pedido);
    const janelaHoras = contaDoPedido ? contaDoPedido.horas : 4;

    let periodos = "";
    PERIODOS.forEach(function(p){
      const marcado = E.pedido.periodo === p.id;
      const cabeNoDia = (p.inicio + janelaHoras) <= FIM_DO_DIA;
      /* "Mudar data ou período" (A25): o dia e o período do pedido de agora
         não mudariam nada — ele seria cancelado para nascer um igual, pago
         de novo, e a busca recomeçaria do zero */
      const ehODeAgora = ehOHorarioDoPedidoDeAgora(escolhida, p.id);
      const serve = periodoAindaServe(escolhida, p.id) && cabeNoDia && !ehODeAgora;

      /* EXCEÇÃO AUTORIZADA Nº 3: os ícones do período. */
      periodos += '<button class="opcao ' + (marcado && serve ? "marcada" : "") + '" '
        + (serve ? 'onclick="escolherPeriodo(\'' + idSeguro(p.id) + '\')"' : "disabled")
        + '>'
        + '<div class="icone">' + icone(p.id, 22) + '</div>'
        + '<div class="txt"><b>' + esc(p.nome) + ' · das ' + p.inicio + 'h às '
        +   (p.inicio + janelaHoras) + 'h</b>'
        + (serve ? "" : '<span>'
            + (ehODeAgora
               ? "é o dia e o período do seu pedido de agora"
               : !cabeNoDia
               ? "uma janela de " + janelaHoras + "h começando aqui passaria das " + FIM_DO_DIA + "h"
               : "a diarista precisa de pelo menos " + ANTECEDENCIA_MINIMA_HORAS
                 + "h para se organizar e chegar até você")
            + '</span>')
        + '</div>'
        + (marcado && serve ? '<div class="seta">✓</div>' : "") + '</button>';
    });

    /* Se o período escolhido deixou de servir (ou virou o do pedido de
       agora, ao trocar o dia), desmarca. */
    if(E.pedido.periodo && (!periodoAindaServe(escolhida, E.pedido.periodo)
                            || ehOHorarioDoPedidoDeAgora(escolhida, E.pedido.periodo)))
      E.pedido.periodo = null;

    const pronto = !!(E.pedido.data && E.pedido.periodo);

    return ''
    + cabecalho("Data e horário")
    + '<div class="corpo">'
    +   '<h2 class="titulo">Para quando você precisa?</h2>'
    +   chips
    +   avisoHoje
    +   '<div class="rotulo">Período</div>'
    +   periodos
    +   '<p class="ajuda">Seu serviço precisa de uma janela de ' + janelaHoras
    +     ' horas. Os horários apagados não comportam essa janela.</p>'
    + '</div>'
    + '<div class="rodape"><button class="btn btn-principal" ' + (pronto ? "" : "disabled")
    +   ' onclick="ir(\'resumo\')">Continuar</button></div>';
  }
};


/* --------------------------------------------------------------------------
   03B. CALENDÁRIO — escolher qualquer dia dentro da janela

   Sem navegação por mês de propósito: a janela é curta (quinze dias), então
   basta desenhar as semanas que a contêm. Menos botão, menos engano.
   -------------------------------------------------------------------------- */
TELAS.calendario = {
  html: function(){
    const dias = proximosDias(DIAS_PARA_ESCOLHER + 1);
    const permitidos = {};
    dias.forEach(function(d){ permitidos[d.iso] = d; });

    const hoje = new Date(); hoje.setHours(0,0,0,0);
    const ultimo = new Date(hoje); ultimo.setDate(hoje.getDate() + DIAS_PARA_ESCOLHER);

    /* começa no domingo da semana de hoje e vai até fechar a semana do último dia */
    const comeco = new Date(hoje); comeco.setDate(hoje.getDate() - hoje.getDay());
    const fim = new Date(ultimo); fim.setDate(ultimo.getDate() + (6 - ultimo.getDay()));

    let grade = '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center">';
    DIAS_SEMANA.forEach(function(d){
      grade += '<div style="font-size:11px;color:var(--suave);font-weight:700;padding:6px 0">' + d + '</div>';
    });

    let mesAtual = -1, cabecalhosDeMes = "";
    const celulas = [];
    for(let d = new Date(comeco); d <= fim; d.setDate(d.getDate() + 1)){
      const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0,10);
      const dentro = !!permitidos[iso];
      const ehHoje = iso === dias[0].iso;
      const podeHoje = !ehHoje || hojeAindaServe();
      const livre = dentro && podeHoje;
      const marcado = E.pedido.data === iso;
      if(d.getMonth() !== mesAtual){ mesAtual = d.getMonth(); }
      celulas.push(
        '<button class="dia-calendario" '
        + (livre ? 'onclick="escolherDataDoCalendario(\'' + idSeguro(iso) + '\')"' : "disabled")
        + ' style="'
        + 'font-weight:' + (marcado ? "800" : "600") + ';cursor:' + (livre ? "pointer" : "default") + ';'
        + 'background:' + (marcado ? "var(--roxo)" : (livre ? "var(--branco)" : "transparent")) + ';'
        + 'color:' + (marcado ? "#fff" : (livre ? "var(--texto)" : "#C9C4D6")) + ';'
        + (livre && !marcado ? "box-shadow:var(--sombra);" : "")
        + '">' + d.getDate() + '</button>');
    }
    grade += celulas.join("") + '</div>';

    /* nome do mês por extenso, com só a primeira letra maiúscula — o
       capitalize do CSS deixava "Ago E Set", com o "e" gritando */
    const m1 = MESES_LONGOS[hoje.getMonth()], m2 = MESES_LONGOS[ultimo.getMonth()];
    const junto = (m1 === m2) ? m1 : (m1 + " e " + m2);
    const titulo = junto.charAt(0).toUpperCase() + junto.slice(1);

    return ''
    + cabecalho("Escolher data")
    + '<div class="corpo">'
    +   '<h2 class="titulo">Qual dia?</h2>'
    +   '<p class="apoio">Você pode agendar até ' + DIAS_PARA_ESCOLHER + ' dias para frente.</p>'
    +   '<div class="rotulo">' + esc(titulo) + '</div>'
    +   grade
    +   '<p class="ajuda">Os dias apagados estão fora do prazo de agendamento. '
    +     'Guardar a agenda dela por muito tempo aumenta a chance de o serviço furar.</p>'
    + '</div>';
  }
};

function escolherDataDoCalendario(iso){
  E.pedido.data = iso;
  if(E.pedido.periodo && !periodoAindaServe(iso, E.pedido.periodo)) E.pedido.periodo = null;
  salvar();
  voltar();
}

function escolherData(iso){ E.pedido.data = iso; salvar(); desenhar(); }
function escolherPeriodo(id){ E.pedido.periodo = id; salvar(); desenhar(); }


/* --------------------------------------------------------------------------
   04. DETALHES DO SERVIÇO
   As perguntas NÃO estão escritas aqui — são montadas a partir do CATALOGO.
   Trocar de categoria troca as perguntas sem mexer nesta tela.
   -------------------------------------------------------------------------- */
TELAS.detalhes = {
  html: function(){
    const cat = CATALOGO.find(function(c){ return c.id === E.pedido.categoria; });
    if(!cat) return '<div class="corpo"><p class="apoio">Escolha um serviço primeiro.</p></div>';

    const casa = casaDoPedido(E.pedido);
    const mostrarTamanho = E.pedido.ajustadoDestaVez || !casa;

    let campos = "";
    cat.perguntas.forEach(function(p){
      /* O tamanho vem do cadastro da casa e fica escondido, a não ser que o
         cliente peça para ajustar só desta vez (decisão R10). */
      if(p.vemDaCasa && !mostrarTamanho) return;

      /* o contador já mostra o nome dentro dele, não precisa de título em cima */
      if(p.tipo !== "contador") campos += '<div class="rotulo">' + esc(p.rotulo) + '</div>';

      if(p.tipo === "opcao"){
        p.opcoes.forEach(function(o){
          const marcado = E.pedido.respostas[p.id] === o.id;
          campos += '<button class="opcao ' + (marcado ? "marcada" : "") + '" '
            + 'onclick="responder(\'' + idSeguro(p.id) + '\',\'' + idSeguro(o.id) + '\')">'
            + '<div class="icone">' + (o.icone ? icone(o.icone, 22) : "") + '</div>'
            + '<div class="txt"><b>' + esc(o.nome) + '</b><span>' + esc(o.detalhe || "") + '</span></div>'
            + (marcado ? '<div class="seta">✓</div>' : "") + '</button>';
        });
      }

      if(p.tipo === "contador"){
        const v = E.pedido.respostas[p.id];
        campos += '<div class="contador">'
          + '<span class="nome">' + esc(p.rotulo) + '</span>'
          + '<span class="controles">'
          +   '<button ' + (v <= p.min ? "disabled" : "") + ' onclick="contar(\'' + idSeguro(p.id) + '\',-1)">−</button>'
          +   '<span class="valor">' + v + '</span>'
          +   '<button ' + (v >= p.max ? "disabled" : "") + ' onclick="contar(\'' + idSeguro(p.id) + '\',1)">+</button>'
          + '</span></div>';
      }

      if(p.tipo === "texto"){
        /* 500: o mesmo limite que o servidor guarda */
        campos += '<div class="campo"><textarea id="txt-' + p.id + '" maxlength="500" placeholder="' + esc(p.exemplo || "") + '" '
          + 'oninput="anotar(\'' + idSeguro(p.id) + '\', this.value)">' + esc(E.pedido.respostas[p.id] || "") + '</textarea></div>';
      }

      if(p.ajuda) campos += '<p class="ajuda">' + esc(p.ajuda) + '</p>';
    });

    /* O cartão da casa, com a saída para ajustar só desta vez. */
    let blocoCasa = "";
    if(casa){
      const temTamanho = cat.perguntas.some(function(p){ return p.vemDaCasa; });
      blocoCasa = '<div class="cartao" style="display:flex;gap:12px;align-items:center">'
        + '<div style="color:var(--roxo)">' + icone(casa.tipoImovel === "casa" ? "casa" : "predio", 22) + '</div>'
        + '<div style="flex:1;min-width:0">'
        +   '<b style="font-size:14.5px">' + esc(casa.apelido) + '</b>'
        +   '<div style="font-size:12.5px;color:var(--suave);margin-top:2px">'
        +     esc(casa.bairro || casa.rua)
        +     (temTamanho ? ' · ' + casa.comodos + ' cômodos · ' + casa.banheiros + ' banheiro'
              + (casa.banheiros === 1 ? "" : "s") : "")
        +   '</div>'
        + '</div>'
        + (temTamanho
           ? '<button class="btn btn-texto" style="width:auto;padding:0 8px;font-size:12.5px;'
             + 'min-height:44px;flex:none" '
             + 'onclick="ajustarDestaVez()">' + (E.pedido.ajustadoDestaVez ? "pronto" : "ajustar") + '</button>'
           : "")
        + '</div>';

      if(E.pedido.ajustadoDestaVez){
        blocoCasa += '<div class="aviso roxo">✏️<div><b>Ajuste só deste pedido</b>'
          + 'O cadastro da sua casa continua como estava. Isto vale só para hoje.</div></div>';
      }
    }

    /* opção de duas profissionais, quando a categoria permite */
    let duas = "";
    if(cat.aceitaDuasProfissionais){
      duas = '<div class="rotulo">Quantidade de profissionais</div>'
        + '<div class="chave ' + (E.pedido.duasProfissionais ? "ligada" : "") + '" onclick="alternarDuas()">'
        + '<div class="txt"><b>Preciso de duas ' + esc(cat.comoChamamosPlural) + '</b>'
        + '<span>Para casas grandes ou quando você quer terminar mais rápido. O valor dobra.</span></div>'
        + '<div class="botao"></div></div>';
    }

    /* prévia do tempo e do preço, atualizada a cada toque */
    const conta = calcularPedido(E.pedido);
    let previa = "";
    if(conta){
      const janela = janelaDoServico(E.pedido.periodo, conta.horas);
      previa = '<div class="cartao destaque" style="margin-top:18px">'
        /* Nesta altura o horário ainda não foi escolhido — ele vem depois
           (decisão R10). Então aqui o texto fala do TAMANHO da janela; a
           janela com hora de relógio aparece a partir da tela de data. */
        + '<div class="linha"><span class="rot">'
        +   (janela
             ? ((conta.quantidade > 1 ? "As duas ficam" : "Ela fica") + " na sua casa")
             : ("Tempo necessário" + (conta.quantidade > 1 ? " para cada uma" : "")))
        + '</span>'
        + '<span class="val">' + (janela ? esc(janela.texto) : conta.horas + " horas") + '</span></div>'
        + '<div class="linha"><span class="rot">Valor estimado</span>'
        + '<span class="val" style="color:var(--roxo)">' + moeda(conta.total)
        + (conta.quantidade > 1 ? ' <span style="font-weight:600;color:var(--suave);font-size:12px">(duas diaristas)</span>' : "")
        + '</span></div></div>';

      /* Acima de 6h de janela existe pausa, e o cliente precisa saber antes
         de ver a diarista sentada e achar que está sendo enrolado. */
      if(conta.horas > 6){
        previa += '<div class="aviso roxo">☕<div><b>Ela vai fazer uma pausa</b>'
          + 'Numa janela de ' + conta.horas + ' horas, a lei garante intervalo de descanso. '
          + 'Quem decide a hora é ela — e o serviço combinado sai do mesmo jeito.</div></div>';
      }

      /* Serviço grande não cabe começando tarde. */
      if(janela && !janela.cabeNoDia){
        const possiveis = periodosQueComportam(conta.horas).map(function(p){ return p.nome; });
        previa += '<div class="aviso">🕗<div><b>Este serviço precisa começar mais cedo</b>'
          + 'Uma janela de ' + conta.horas + ' horas começando à ' + esc(nomePeriodo(E.pedido.periodo).split(" ")[0].toLowerCase())
          + ' terminaria depois das ' + FIM_DO_DIA + 'h. '
          + (possiveis.length
             ? 'Volte e escolha ' + esc(possiveis.join(" ou ")) + '.'
             : 'Reduza o serviço ou peça duas diaristas.')
          + '</div></div>';
      }

      /* O TETO LEGAL (decisão R8): passou de 8 horas para uma pessoa, o
         pedido para de andar. Não é sugestão — é limite de lei. */
      if(conta.bloqueadoPorLimiteLegal){
        const horas = String(conta.horasPorPessoa).replace(".", ",");
        previa += '<div class="aviso" style="background:var(--vermelho-claro);color:var(--vermelho)">⚖️'
          + '<div><b>' + (conta.quantidade > 1 ? "Nem duas dão conta em um dia" : "Uma " + esc(cat.comoChamamos) + " não termina esta casa em um dia") + '</b>'
          + 'Pelo tamanho que você descreveu, o trabalho leva cerca de ' + horas
          + ' horas' + (conta.quantidade > 1 ? " para cada uma" : "") + '. '
          + 'A jornada de uma diarista é de no máximo 8 horas por dia — é lei, '
          + 'não é escolha nossa.'
          + (conta.sugereDuas
             ? '<br><br>Marque <b>duas ' + esc(cat.comoChamamosPlural) + '</b> aqui em cima, '
               + 'ou reduza o serviço e agende o resto para outro dia.'
             : '<br><br>Reduza o serviço e agende o resto para outro dia.')
          + '</div></div>';
      }
    }

    const janelaEscolhida = conta ? janelaDoServico(E.pedido.periodo, conta.horas) : null;
    const podeContinuar = !conta
      || (!conta.bloqueadoPorLimiteLegal && (!janelaEscolhida || janelaEscolhida.cabeNoDia));

    return ''
    + cabecalho("")
    + '<div class="corpo">'
    +   '<h2 class="titulo">Detalhes do serviço</h2>'
    +   '<p class="apoio">' + esc(cat.nome) + ' · quanto mais preciso, melhor ela se prepara.</p>'
    +   blocoCasa + campos + duas + previa
    + '</div>'
    + '<div class="rodape"><button class="btn btn-principal" ' + (podeContinuar ? "" : "disabled")
    +   ' onclick="depoisDosDetalhes()">Continuar</button></div>';
  }
};

function responder(id, valor){ E.pedido.respostas[id] = valor; salvar(); desenhar(); }
function contar(id, delta){
  const cat = CATALOGO.find(function(c){ return c.id === E.pedido.categoria; });
  const p = cat.perguntas.find(function(x){ return x.id === id; });
  const novo = (E.pedido.respostas[id] || 0) + delta;
  if(novo < p.min || novo > p.max) return;
  E.pedido.respostas[id] = novo;
  salvar(); desenhar();
}
function anotar(id, valor){ E.pedido.respostas[id] = valor; salvar(); }  /* sem redesenhar: não perde o cursor */
function alternarDuas(){ E.pedido.duasProfissionais = !E.pedido.duasProfissionais; salvar(); desenhar(); }

/* Abre e fecha os campos de tamanho, sem tocar no cadastro da casa. */
function ajustarDestaVez(){
  E.pedido.ajustadoDestaVez = !E.pedido.ajustadoDestaVez;
  if(!E.pedido.ajustadoDestaVez){
    /* fechou sem querer guardar: volta ao tamanho da casa */
    const casa = casaDoPedido(E.pedido);
    if(casa){
      if(E.pedido.respostas.comodos   !== undefined) E.pedido.respostas.comodos   = casa.comodos;
      if(E.pedido.respostas.banheiros !== undefined) E.pedido.respostas.banheiros = casa.banheiros;
    }
  }
  salvar();
  desenhar();
}

function depoisDosDetalhes(){
  /* Trava dupla: o botão já fica desabilitado, mas a regra do teto legal
     não pode depender só do estado de um botão. */
  const conta = calcularPedido(E.pedido);
  if(conta && conta.bloqueadoPorLimiteLegal) return;

  const cat = CATALOGO.find(function(c){ return c.id === E.pedido.categoria; });
  ir(cat.aceitaAdicionais ? "adicionais" : "dataHorario");
}


/* --------------------------------------------------------------------------
   05. ADICIONAIS
   -------------------------------------------------------------------------- */
TELAS.adicionais = {
  html: function(){
    const conta = calcularPedido(E.pedido);

    /* Quantos adicionais ainda não marcados fariam o serviço mudar de faixa?
       Se forem vários, avisar um por um vira uma parede de amarelo que
       assusta sem informar. Nesse caso o aviso sobe para o topo, uma vez só. */
    const candidatos = ADICIONAIS.filter(function(a){
      if(E.pedido.adicionais.indexOf(a.id) >= 0) return false;
      const i = impactoDoAdicional(E.pedido, a.id);
      return i && i.diferenca > 0;
    });
    const noLimite = candidatos.length > 1;

    let avisoNoLimite = "";
    if(noLimite){
      const exemplo = impactoDoAdicional(E.pedido, candidatos[0].id);
      avisoNoLimite = '<div class="aviso">⏱️<div><b>Seu serviço está no limite de '
        + conta.horas + ' horas</b>'
        + 'Qualquer adicional que você marcar aumenta o serviço para '
        + exemplo.horasSe + ' horas, e isso custa ' + moeda(exemplo.diferenca)
        + ' além do preço do próprio adicional.</div></div>';
    }

    let lista = "";
    ADICIONAIS.forEach(function(a){
      const marcado = E.pedido.adicionais.indexOf(a.id) >= 0;
      const impacto = impactoDoAdicional(E.pedido, a.id);

      /* O aviso no próprio item (opção C): antes de marcar, avisa que ele
         vai puxar a faixa; depois de marcado, aponta que foi ele.
         O aviso de "antes" some quando já subiu para o topo. */
      let recado = "";
      if(impacto && impacto.diferenca > 0 && (impacto.marcado || !noLimite)){
        recado = '<div style="background:var(--ambar-claro);color:var(--ambar);border-radius:8px;'
          + 'padding:7px 9px;margin-top:8px;font-size:11.5px;line-height:1.45;font-weight:600">'
          + (impacto.marcado
             ? '⚠️ é este que aumentou o serviço para ' + impacto.horasAgora + 'h · ' + moeda(impacto.diferenca)
             : '⏱️ este muda o serviço para ' + impacto.horasSe + 'h · + ' + moeda(impacto.diferenca))
          + '</div>';
      }

      lista += '<button class="opcao ' + (marcado ? "marcada" : "") + '" '
        + 'style="flex-direction:column;align-items:stretch" onclick="alternarAdicional(\'' + idSeguro(a.id) + '\')">'
        + '<div style="display:flex;align-items:center;gap:12px;width:100%">'
        +   '<div class="icone">' + icone(a.icone, 21) + '</div>'
        +   '<div class="txt"><b>' + esc(a.nome) + '</b>'
        +     '<span>' + esc(a.detalhe) + ' · +' + Math.round(a.minutos) + ' min</span></div>'
        +   '<div style="text-align:right;flex:none">'
        +     '<div style="font-weight:700;font-size:14px;color:var(--roxo)">+ ' + moeda(a.preco) + '</div>'
        +     '<div style="font-size:16px;margin-top:2px">' + (marcado ? "✓" : "+") + '</div>'
        +   '</div>'
        + '</div>'
        + recado
        + '</button>';
    });

    /* O mesmo teto legal da tela anterior (R8): os adicionais também podem
       empurrar o serviço para além das 8 horas, e aí o pedido para. */
    let avisoTeto = "";
    if(conta && conta.bloqueadoPorLimiteLegal){
      avisoTeto = '<div class="aviso" style="background:var(--vermelho-claro);color:var(--vermelho)">⚖️'
        + '<div><b>Passou do que cabe em um dia de trabalho</b>'
        + 'Com estes adicionais o serviço chega a cerca de '
        + String(conta.horasPorPessoa).replace(".", ",") + ' horas'
        + (conta.quantidade > 1 ? " para cada uma" : "") + '. '
        + 'A jornada de uma diarista é de no máximo 8 horas por dia — é lei. '
        + 'Desmarque algum adicional, ou deixe para a próxima vez.</div></div>';
    }

    return ''
    + cabecalho("Adicionais")
    + '<div class="corpo">'
    +   '<h2 class="titulo">Quer incluir algo a mais?</h2>'
    +   '<p class="apoio">Opcional. Cada adicional aumenta o tempo e o valor do serviço.</p>'
    +   avisoNoLimite + lista + avisoTeto
    + '</div>'
    + '<div class="rodape">'
    +   contaViva(conta)
    +   '<button class="btn btn-principal" '
    +     ((conta && conta.bloqueadoPorLimiteLegal) ? "disabled" : "")
    +     ' onclick="ir(\'dataHorario\')">'
    +     (E.pedido.adicionais.length
      ? "Continuar com " + E.pedido.adicionais.length + " "
        + (E.pedido.adicionais.length > 1 ? "adicionais" : "adicional")
      : "Continuar sem adicionais")
    +   '</button></div>';
  }
};

/* A CONTA VIVA (opção B)
   Fica fixa no rodapé, fora da parte que rola, para nunca sair de vista
   enquanto o cliente escolhe. É a mesma quebra de valores que aparece
   depois no resumo e no comprovante — o cliente vê sempre a mesma conta. */
function contaViva(conta){
  if(!conta) return "";
  return ''
  + '<div style="background:var(--branco);border-radius:12px;padding:10px 12px;margin-bottom:10px;'
  +   'box-shadow:var(--sombra)">'
  +   linhaDaConta(conta.categoria.nome + " · " + conta.horasSemAdicionais + "h"
      + (conta.quantidade > 1 ? " × 2" : ""), conta.precoServico)
  +   (conta.precoAdicionais
      ? linhaDaConta(conta.adicionais.length + " "
        + (conta.adicionais.length > 1 ? "adicionais" : "adicional"), conta.precoAdicionais)
      : "")
  +   (conta.mudouDeFaixa
      ? '<div style="display:flex;justify-content:space-between;gap:8px;font-size:12px;padding:5px 6px;'
      +   'margin:3px -6px;background:var(--ambar-claro);color:var(--ambar);border-radius:6px;font-weight:600">'
      +   '<span>Tempo extra · ' + conta.horasSemAdicionais + 'h para ' + conta.horas + 'h</span>'
      +   '<span>' + moeda(conta.tempoExtra) + '</span></div>'
      : "")
  +   '<div style="display:flex;justify-content:space-between;gap:8px;font-size:14px;font-weight:800;'
  +     'padding-top:8px;margin-top:5px;border-top:1px solid var(--borda)">'
  +     '<span>Total' + (conta.quantidade > 1 ? ' <span style="font-weight:600;font-size:11px">(duas)</span>' : "")
  +     '</span><span style="color:var(--roxo)">' + moeda(conta.total) + '</span></div>'
  + '</div>';
}

/* A linha do salto de faixa, do jeito que aparece no resumo e no comprovante.
   Some quando não houve salto — não é para poluir quem não caiu no caso. */
function linhaTempoExtra(conta){
  if(!conta || !conta.mudouDeFaixa) return "";
  return '<div class="linha">'
    + '<span class="rot" style="color:var(--ambar);font-weight:600">'
    +   '⏱️ Tempo extra · ' + conta.horasSemAdicionais + 'h para ' + conta.horas + 'h</span>'
    + '<span class="val" style="color:var(--ambar)">' + moeda(conta.tempoExtra) + '</span></div>';
}

function linhaDaConta(rotulo, valor){
  return '<div style="display:flex;justify-content:space-between;gap:8px;font-size:12px;'
    + 'padding:3px 0;color:var(--suave)">'
    + '<span>' + esc(rotulo) + '</span><span>' + moeda(valor) + '</span></div>';
}

function alternarAdicional(id){
  const i = E.pedido.adicionais.indexOf(id);
  if(i >= 0) E.pedido.adicionais.splice(i, 1);
  else E.pedido.adicionais.push(id);
  salvar(); desenhar();
}


/* --------------------------------------------------------------------------
   06. RESUMO
   -------------------------------------------------------------------------- */
TELAS.resumo = {
  html: function(){
    if(!calcularPedido(E.pedido)) return htmlDaTela("novoServico");
    /* A conta que vale é a do servidor (no app): a da maquete é a mesma
       conta, feita aqui. Enquanto ela não chega, "Calculando". */
    const s = FONTE.ler.simulacao(E.pedido);
    if(!s) return contaAindaNao("Confira seu pedido");
    const conta = s.conta;
    const cat = conta.categoria;
    const casa = casaDoPedido(E.pedido);
    const en = casa || FONTE.ler.cliente().endereco || {};

    /* descrição do que foi respondido, em português */
    let detalhes = "";
    cat.perguntas.forEach(function(p){
      const v = E.pedido.respostas[p.id];
      if(p.tipo === "opcao"){
        const o = p.opcoes.find(function(x){ return x.id === v; });
        if(o) detalhes += '<div class="linha"><span class="rot">' + esc(p.rotulo) + '</span>'
          + '<span class="val">' + esc(o.nome) + '</span></div>';
      }
      if(p.tipo === "contador" && v > 0){
        detalhes += '<div class="linha"><span class="rot">' + esc(p.rotulo) + '</span>'
          + '<span class="val">' + Number(v) + '</span></div>';
      }
    });

    let linhasAdicionais = "";
    conta.adicionais.forEach(function(a){
      linhasAdicionais += '<div class="linha"><span class="rot" style="display:flex;gap:7px;align-items:center">'
        + icone(a.icone, 15) + esc(a.nome) + '</span>'
        + '<span class="val">' + moeda(a.preco) + '</span></div>';
    });

    const obs = E.pedido.respostas.observacoes;
    const podeSeguir = !s.trava && !quandoQueNaoServe(s) && !casaDoPedidoSumiu();
    /* "Vila Madalena, São Paulo - SP" */
    const lugar = [en.bairro, [en.cidade, en.estado].filter(Boolean).join(" - ")]
      .filter(Boolean).join(", ");

    return ''
    + cabecalho("Confira seu pedido")
    + '<div class="corpo">'

    +   '<div class="cartao">'
    +     '<div style="display:flex;gap:12px;align-items:center;margin-bottom:6px">'
    +       '<div style="color:var(--roxo)">' + icone(cat.icone, 26) + '</div>'
    +       '<div><b style="font-size:16px">' + esc(cat.nome) + '</b>'
    +       '<div style="font-size:12.5px;color:var(--suave)">' + esc(cat.descricao) + '</div></div></div>'
    +     detalhes
    +     '<div class="linha"><span class="rot">Data</span><span class="val">' + esc(dataPorExtenso(E.pedido.data)) + '</span></div>'
    +     '<div class="linha"><span class="rot">Período</span><span class="val">'
    +       esc(nomePeriodoComAJanela(E.pedido.periodo, textoDaJanela(s, conta))) + '</span></div>'
    +     '<div class="linha"><span class="rot">'
    +       (conta.quantidade > 1 ? "As duas ficam" : "Ela fica") + ' na sua casa</span>'
    +       '<span class="val">' + esc(textoDaJanela(s, conta)) + '</span></div>'
    +     (conta.quantidade > 1
        ? '<div class="linha"><span class="rot">Profissionais</span><span class="val">2 pessoas</span></div>' : "")
    +   '</div>'
    +   avisoDoQuando(s)

    +   '<div class="rotulo">Endereço</div>'
    +   (casaDoPedidoSumiu() ? avisoDaCasaQueSumiu()
       : (!FONTE.ehMaquete && !casa) ? casasAindaNao()
       : '<div class="cartao" style="display:flex;gap:12px;align-items:flex-start">'
    +     '<div style="font-size:20px">📍</div>'
    +     '<div><b style="font-size:14px">' + esc(en.apelido) + '</b>'
    +     '<div style="font-size:13px;color:var(--suave);margin-top:3px;line-height:1.5">'
    +       esc(en.rua) + (en.complemento ? " · " + esc(en.complemento) : "") + '<br>'
    +       esc(lugar) + '</div></div></div>')

    +   (obs ? '<div class="rotulo">Suas observações</div><div class="cartao">'
    +     '<div style="font-size:13.5px;line-height:1.55;color:var(--suave)">' + esc(obs) + '</div></div>' : "")

    +   '<div class="rotulo">Valores</div>'
    +   '<div class="cartao">'
    +     '<div class="linha"><span class="rot">' + esc(cat.nome) + ' · ' + Number(conta.horasSemAdicionais) + 'h'
    +       (conta.quantidade > 1 ? " × 2 profissionais" : "") + '</span>'
    +       '<span class="val">' + moeda(conta.precoServico) + '</span></div>'
    +     linhasAdicionais
    +     linhaTempoExtra(conta)
    +     '<div class="linha total"><span class="rot">Total'
    +       (conta.quantidade > 1 ? ' <span style="font-weight:600;font-size:12px">(duas diaristas)</span>' : "")
    +       '</span><span class="val">' + moeda(conta.total) + '</span></div>'
    +   '</div>'
    +   avisoDaTrava(s)

    +   '<div class="aviso verde">🛡️<div><b>Pagamento protegido</b>'
    +     'O valor só é liberado para a profissional depois que o serviço é concluído.</div></div>'
    + '</div>'
    + '<div class="rodape"><button class="btn btn-principal" ' + (podeSeguir ? "" : "disabled")
    +   ' onclick="ir(\'pagamento\')">Ir para o pagamento</button></div>';
  },
  /* no app, depois de recarregar, as casas também (o endereço do pedido) */
  aoEntrar: function(){ simularSeFaltar(); pedirCasasSeFaltar(); }
};

/* A CASA DO PEDIDO QUE SUMIU (só no app): apagada, ou trocada em outro
   lugar (no servidor, trocar dá outro número à casa). O pedido não segue
   para outro endereço sem a pessoa ver: ela escolhe de novo. Enquanto as
   casas não chegam (recarregou), não se sabe — e não sumiu. */
function casaDoPedidoSumiu(){
  if(FONTE.ehMaquete) return false;
  return FONTE.ler.casas() !== null && !casaDoPedido(E.pedido);
}

function avisoDaCasaQueSumiu(){
  return '<div class="aviso ambar">📍<div><b>Escolha o endereço de novo</b>'
    + 'O endereço deste pedido mudou ou foi apagado.</div></div>'
    + '<button class="btn btn-contorno" onclick="ir(\'escolherCasa\')">Escolher o endereço</button>';
}

/* A janela que vale: a do servidor (com o relógio dele), ou, na maquete,
   a do período escolhido. */
function textoDaJanela(s, conta){
  if(s.quando && s.quando.janelaTexto) return s.quando.janelaTexto;
  return (janelaDoServico(E.pedido.periodo, conta.horas) || {}).texto || (conta.horas + " horas");
}

/* O dia ou o período que já não servem, pelo relógio do servidor (no app:
   o do celular pode estar errado): o que veio com a conta, ou o que o
   servidor disse ao confirmar o pedido (o tempo passou desde o resumo). A
   frase é dele, e a saída é mudar. */
function quandoQueNaoServe(s){
  const aoConfirmar = avisoDoCampo(E.tela, "quando");
  if(aoConfirmar) return aoConfirmar;
  return (s.quando && !s.quando.serve) ? (s.quando.erro || " ") : "";
}

function avisoDoQuando(s){
  const frase = quandoQueNaoServe(s);
  if(!frase) return "";
  return '<div class="aviso ambar">🕗<div><b>Este horário não dá mais</b>'
    + esc(frase) + '</div></div>'
    + '<button class="btn btn-contorno" onclick="ir(\'dataHorario\')">Mudar data e horário</button>';
}

/* A TRAVA DAS 8 HORAS (R8), com a frase de quem decide (no app, o
   servidor). Quando uma não dá conta e duas dão, a saída é oferecida com o
   preço das duas — quem decide é o cliente: o valor dobra. */
function avisoDaTrava(s){
  if(!s.trava) return "";
  return '<div class="aviso" style="background:var(--vermelho-claro);color:var(--vermelho)">⚖️'
    + '<div><b>Passou do que cabe em um dia de trabalho</b>' + esc(s.trava) + '</div></div>'
    + (s.comDuas
       ? '<button class="btn btn-contorno" onclick="pedirComDuas()">Pedir com duas '
         + esc(s.comDuas.categoria.comoChamamosPlural) + ' · ' + moeda(s.comDuas.total) + '</button>'
       : "");
}

function pedirComDuas(){
  E.pedido.duasProfissionais = true;
  salvar();
  desenhar();
}

/* A CONTA QUE AINDA NÃO CHEGOU (só no app). Pedida ao servidor quando a
   tela abre; sem resposta, a frase e o "Tentar de novo", só nesta visita. */
let ERRO_DA_SIMULACAO = null;    // { frase, navegacao }

function erroDaSimulacaoAgora(){
  return (ERRO_DA_SIMULACAO && ERRO_DA_SIMULACAO.navegacao === NAVEGACAO) ? ERRO_DA_SIMULACAO.frase : "";
}

function contaAindaNao(titulo){
  const erro = erroDaSimulacaoAgora();
  return cabecalho(titulo)
    + '<div class="corpo">'
    + (erro
       ? '<div class="aviso ambar">⚠️<div>' + esc(erro) + '</div></div>'
         + '<button class="btn btn-contorno" onclick="tentarAContaDeNovo()">Tentar de novo</button>'
       : '<p class="apoio">Calculando o valor do seu pedido…</p>')
    + '</div>';
}

/* Telas sem campo para digitar: redesenhar quando a conta chega não apaga
   nada. */
function simularSeFaltar(){
  if(!calcularPedido(E.pedido) || FONTE.ler.simulacao(E.pedido) || erroDaSimulacaoAgora()) return;
  FONTE.simularPedido(E.pedido, function(r){
    ERRO_DA_SIMULACAO = r.ok ? null : { frase: r.erro || "", navegacao: NAVEGACAO };
    desenhar();
  });
}

function tentarAContaDeNovo(){
  ERRO_DA_SIMULACAO = null;
  desenhar();
}


/* --------------------------------------------------------------------------
   07. PAGAMENTO
   Na maquete, simulado (Pix ou cartão, e nada é cobrado). No app, o
   pagamento chega numa próxima etapa: confirmar guarda o pedido
   "aguardando o pagamento" (R20: primeiro o pagamento, depois a busca).
   -------------------------------------------------------------------------- */
TELAS.pagamento = {
  html: function(){
    if(!calcularPedido(E.pedido)) return htmlDaTela("novoServico");
    const s = FONTE.ler.simulacao(E.pedido);
    if(!s) return contaAindaNao("Pagamento");
    const conta = s.conta;

    return ''
    + cabecalho("Pagamento")
    + '<div class="corpo">'
    +   (FONTE.ehMaquete
         ? '<h2 class="titulo">Como você quer pagar?</h2>'
           + '<p class="apoio">Só cobramos depois que uma profissional aceitar o serviço.</p>'
           + formasDePagamentoDaMaquete()
         : '<h2 class="titulo">Falta pouco!</h2>'
           + '<p class="apoio">Primeiro vem o pagamento, depois a busca: assim que ele entrar, '
           + 'começamos a procurar a sua diarista.</p>'
           + '<div class="aviso roxo">🚧<div><b>O pagamento pelo app chega em breve</b>'
           + 'Ao confirmar, seu pedido fica guardado como “Aguardando o pagamento”. '
           + 'Ninguém é chamado e nada é cobrado. Se mudar de ideia, cancele sem custo.</div></div>')
    +   '<div class="cartao" style="margin-top:16px">'
    +     '<div class="linha total"><span class="rot">Total a pagar'
    +       (conta.quantidade > 1 ? ' <span style="font-weight:600;font-size:12px">(duas diaristas)</span>' : "")
    +       '</span>'
    +     '<span class="val">' + moeda(conta.total) + '</span></div></div>'
    +   avisoDoQuando(s)
    +   avisoDaTrava(s)
    /* a frase do servidor sobre a casa, ou (sem ela) a casa que sumiu */
    +   (avisoDoPedido("casa") || (casaDoPedidoSumiu() ? avisoDaCasaQueSumiu() : ""))
    +   avisoDoSubstituido()
    +   soNaMaquete(function(){
          return '<div class="aviso roxo">🧪<div><b>Protótipo</b>'
            + 'Nenhuma cobrança de verdade acontece aqui.</div></div>'
            + '<div class="cartao maquete"><b>⚙ NA MAQUETE</b>'
            + '<div>No app de verdade, o pedido nasce “Aguardando o pagamento” e só vai '
            + 'para a busca quando o pagamento entra.</div>'
            + '<button class="btn btn-contorno" onclick="verPedidoEsperandoPagamento()">'
            + 'Ver um pedido esperando pagamento</button></div>';
        })
    + '</div>'
    + '<div class="rodape">'
    +   '<button class="btn btn-principal" '
    +     ((s.trava || quandoQueNaoServe(s) || casaDoPedidoSumiu()) ? "disabled " : "")
    +     'onclick="enviarPedido(this)">Confirmar pedido</button>'
    +   '<div class="erro-do-campo" id="pedido-erro"></div>'
    + '</div>';
  },
  /* no app, depois de recarregar, as casas também (o endereço do pedido) */
  aoEntrar: function(){ simularSeFaltar(); pedirCasasSeFaltar(); }
};

/* Pix e cartão: só na maquete (o cartão é de exemplo). */
function formasDePagamentoDaMaquete(){
  const formas = [
    { id:"pix",     icone:"⚡", nome:"Pix",              detalhe:"Aprovação na hora" },
    { id:"cartao",  icone:"💳", nome:"Cartão de crédito", detalhe:"Visa •••• 4242" },
  ];
  let lista = "";
  formas.forEach(function(f){
    const marcado = E.pedido.pagamento === f.id;
    lista += '<button class="opcao ' + (marcado ? "marcada" : "") + '" onclick="escolherPagamento(\'' + idSeguro(f.id) + '\')">'
      + '<div class="icone">' + f.icone + '</div>'
      + '<div class="txt"><b>' + esc(f.nome) + '</b><span>' + esc(f.detalhe) + '</span></div>'
      + (marcado ? '<div class="seta">✓</div>' : "") + '</button>';
  });
  return lista;
}

/* A frase que o servidor deixou para um lugar desta tela (a casa que saiu
   da área, ao confirmar). */
function avisoDoPedido(campo){
  const frase = avisoDoCampo(E.tela, campo);
  if(!frase) return "";
  return '<div class="aviso ambar">📍<div>' + esc(frase) + '</div></div>'
    + '<button class="btn btn-contorno" onclick="ir(\'minhasCasas\')">Ver meus endereços</button>';
}

function escolherPagamento(id){ E.pedido.pagamento = id; salvar(); desenhar(); }

/* "MUDAR DATA OU PERÍODO" (A25): o pedido que este substitui, enquanto ele
   ainda vale (o que já caiu, aos 30 minutos, não conta). */
function pedidoQueEsteSubstitui(){
  const id = E.pedido && E.pedido.substitui;
  if(!id) return null;
  const antes = (FONTE.ler.pedidos() || []).find(function(p){ return String(p.id) === String(id); });
  return (antes && antes.situacao !== "cancelado" && antes.situacao !== "concluido") ? antes : null;
}

/* O mesmo dia, período e casa do pedido que este substitui: "mudar" para
   ele não muda nada (segunda revisão da 2b). O de antes seria cancelado
   para nascer um igual — no app, pago de novo —, e a busca recomeçaria do
   zero, passando dos 30 minutos da R1 sem a tela dizer. O servidor recusa
   o mesmo (409 mesmo_horario_do_anterior); a tela nem deixa escolher. */
function ehOHorarioDoPedidoDeAgora(data, periodo){
  const antes = pedidoQueEsteSubstitui();
  return !!(antes && antes.data === data && antes.periodo === periodo
            && String(antes.casaId) === String(E.pedido.casaId));
}

/* "MUDAR DATA OU PERÍODO" (A25): este pedido fica no lugar de outro, que
   ainda vale e só cai quando este for confirmado. A pessoa lê isso antes do
   botão. O de antes que já caiu (30 minutos) não tem o que avisar. */
function avisoDoSubstituido(){
  const id = E.pedido && E.pedido.substitui;
  if(!id) return "";
  const antes = (FONTE.ler.pedidos() || []).find(function(p){ return String(p.id) === String(id); });
  if(antes && antes.situacao === "cancelado") return "";
  const periodo = antes && PERIODOS.find(function(x){ return x.id === antes.periodo; });
  const qual = antes
    ? "o seu pedido de " + dataPorExtenso(antes.data)
      + (periodo ? " (" + periodo.nome + ", " + periodo.faixa + ")" : "")
    : "o seu pedido anterior";
  return '<div class="aviso ambar">🔁<div><b>Este pedido fica no lugar do anterior</b>'
    + 'Ao confirmar, ' + esc(qual) + ' é cancelado sem custo. Até lá, ele continua valendo.'
    /* no app o pagamento vem antes da busca (R20): o novo é pago de novo */
    + (FONTE.ehMaquete ? "" : " Este novo precisa ser pago para a busca começar.")
    + '</div></div>';
}

/* CONFIRMAR O PEDIDO. Na maquete, o pedido nasce "buscando" e a busca
   começa; no app, ele nasce "aguardando o pagamento" e a pessoa vê o
   detalhe dele. O botão fica desligado enquanto o pedido vai: um toque
   duplo não vira dois pedidos (e o servidor devolve o mesmo pedido, se
   chegar duas vezes). */
function enviarPedido(botao){
  /* trava dupla (R8): o botão já não deixa, mas a regra não pode depender
     só do estado de um botão */
  const conta = calcularPedido(E.pedido);
  if(!conta || conta.bloqueadoPorLimiteLegal) return;
  /* a casa que sumiu: o servidor recusaria; a tela já diz o que fazer */
  if(casaDoPedidoSumiu()) return desenhar();
  mostrarErro("pedido-erro", "");
  FONTE.enviarPedido(E.pedido, function(r){
    if(!r.ok) return mostrarErroDoPedido(r);
    ir(r.destino, { limparHistorico:true });
  }, { botao: botao || null });
}

/* O dia ou o período que não servem mais, ou a casa: a frase vai para o
   lugar dela na tela, com a saída ("Mudar data e horário", "Ver meus
   endereços"). O resto, embaixo do botão. */
function mostrarErroDoPedido(r){
  if(r.destino) return seguirPeloErro(r);
  if(r.campo === "quando" || r.campo === "casa"){
    avisarNaTela({ tela:E.tela, campo:r.campo, erro:r.erro });
    return desenhar();
  }
  mostrarErro("pedido-erro", r.erro);
}

/* NA MAQUETE: o pedido parado em "Aguardando o pagamento", o estado em que
   todo pedido nasce no app de verdade. */
function verPedidoEsperandoPagamento(){
  if(!FONTE.ehMaquete || !calcularPedido(E.pedido)) return;
  const pedido = pedidoDaMaquete(E.pedido, "aguardando_pagamento");
  E.pedidos.unshift(pedido);
  E.pedidoAtual = pedido.id;
  salvar();
  ir("detalhePedido", { limparHistorico:true });
}


/* --------------------------------------------------------------------------
   08. BUSCANDO PROFISSIONAIS
   -------------------------------------------------------------------------- */
/* A RÉGUA DA BUSCA — regra decidida pelo dono do projeto.

     0 a 5 min   oferece às elegíveis mais próximas e mais confiáveis
     5 a 15 min  amplia o raio de busca
     aos 15 min  avisa o cliente e deixa ele escolher o que fazer
     aos 30 min  cancela sozinho, sem custo, e abre chamado no suporte

   O preço NUNCA sobe sozinho para atrair profissional.

   QUEM CONTA O TEMPO. Na maquete, o relógio daqui, acelerado: cada meio
   segundo vale 1 minuto, senão ninguém esperaria meia hora para ver a tela
   do fim. No app, o SERVIDOR: a tela pergunta a ele de tempos em tempos e
   só mostra o passo que ele diz (FONTE.ler.busca). O relógio do celular,
   que pode estar errado, não decide nada. Os números abaixo são os mesmos
   do servidor (um teste do app compara os dois lados).                    */
const REGUA_DA_BUSCA = {
  ampliaRaioAos: 5,
  avisaClienteAos: 15,
  cancelaAos: 30,
  msPorMinutoSimulado: 500,
};

/* No app, de quanto em quanto tempo a tela pergunta ao servidor como está
   a busca. Nunca a cada 1 ou 2 segundos: seria dez vezes mais trabalho para
   o servidor, para nada. */
const SEGUNDOS_ENTRE_PERGUNTAS_DA_BUSCA = 15;

/* As situações de um pedido que ainda procura profissional. A segunda é o
   pedido de duas com uma já aceita (A16): a busca continua, com a mesma
   régua. */
const SITUACOES_DA_BUSCA = ["buscando", "aguardando_segunda"];

function pedidoNaBusca(p){
  return !!p && SITUACOES_DA_BUSCA.indexOf(p.situacao) >= 0;
}

/* A frase de cada passo da régua, embaixo do relógio. */
const FASE_DO_PASSO = {
  oferecer_as_mais_proximas: "Procurando profissionais perto de você",
  ampliar_o_raio:            "Ampliando a área de busca",
  perguntar_ao_cliente:      "Continuamos procurando numa área maior",
  cancelar_sem_custo:        "Continuamos procurando numa área maior",
};

function faseDoPasso(passo){
  return FASE_DO_PASSO[passo] || FASE_DO_PASSO.oferecer_as_mais_proximas;
}

/* Em que passo da régua estão estes minutos. Só a maquete usa: ela conta o
   tempo sozinha. No app, quem diz o passo é o servidor. */
function passoDaReguaNaMaquete(minutos){
  if(minutos >= REGUA_DA_BUSCA.cancelaAos)      return "cancelar_sem_custo";
  if(minutos >= REGUA_DA_BUSCA.avisaClienteAos) return "perguntar_ao_cliente";
  if(minutos >= REGUA_DA_BUSCA.ampliaRaioAos)   return "ampliar_o_raio";
  return "oferecer_as_mais_proximas";
}

function faseDaBusca(minutos){
  return faseDoPasso(passoDaReguaNaMaquete(minutos));
}

TELAS.buscando = {
  html: function(){
    if(semPedidoEmAndamento()) return htmlDaTela("meusServicos");
    const p = pedidoAtual();
    const cat = CATALOGO.find(function(c){ return c.id === p.categoria; })
             || { comoChamamosPlural:"profissionais" };
    const b = FONTE.ler.busca(p);
    const simulando = !!(E.busca && E.busca.modo !== "normal");

    return ''
    + '<div class="centro">'
    +   '<div class="pulsando" style="font-size:70px">🔎</div>'
    +   '<h2 class="titulo">Estamos buscando ' + esc(cat.comoChamamosPlural) + ' para você!</h2>'
    +   '<p class="apoio">Enviamos sua solicitação para profissionais bem avaliadas na sua região. '
    +     'Você recebe a resposta em instantes.</p>'
    /* o pedido de duas com uma já aceita (A16): ainda não está confirmado */
    +   (p.situacao === "aguardando_segunda"
         ? '<div class="aviso verde" style="text-align:left;margin:4px 0 14px">✓<div>'
           + '<b>Uma diarista já aceitou!</b>Falta a segunda. O pedido se confirma quando as '
           + 'duas aceitarem.</div></div>'
         : "")
    +   '<div class="girando roxo"></div>'
    +   '<p id="busca-fase" style="font-size:13px;font-weight:600;color:var(--roxo);margin:10px 0 0">'
    +     esc(faseDoPasso(b.passo)) + '</p>'
    /* o "tempo médio" é número de exemplo: só na maquete */
    +   '<p class="ajuda" style="margin-top:2px">Esperando há <span id="busca-minutos">'
    +     Number(b.minutos) + '</span> min' + soNaMaquete(' · tempo médio: 2 a 5 minutos') + '</p>'
    /* no app: a pergunta ao servidor que não teve resposta (a próxima tenta de novo) */
    +   '<p class="ajuda" id="busca-aviso" style="margin-top:6px"></p>'
    + '</div>'
    + '<div class="rodape">'
    +   '<button class="btn btn-contorno" onclick="trocarAba(\'servicos\')">Acompanhar depois</button>'
    +   soNaMaquete(simulando
      ? '<p class="ajuda" style="text-align:center;margin-top:10px">'
      +   'Simulação em curso · cada meio segundo vale 1 minuto</p>'
      : '<p class="ajuda" style="text-align:center;margin-top:10px">'
      +   '⚙ <a href="#" onclick="simularNinguemAceita();return false;" style="color:var(--suave)">'
      +   'simular: ninguém aceita</a></p>')
    + '</div>';
  },

  aoEntrar: function(){
    if(FONTE.ehMaquete) simularABuscaNaMaquete();
    else acompanharABusca();
  }
};

/* NA MAQUETE, a busca de mentira. Caminho normal: alguém aceita em 3,5
   segundos. No "simular: ninguém aceita", o relógio da régua anda acelerado
   até os 15 minutos (a pergunta) e os 30 (cancela). */
function simularABuscaNaMaquete(){
  const b = E.busca || (E.busca = { minutos:0, modo:"normal", jaAvisou:false });

  if(b.modo === "normal"){
    agendar(function(){
      if(E.tela === "buscando" && E.busca.modo === "normal"){
        /* Ela aceitou. Pela decisão R3 o aceite já vale pelos dois lados,
           então o serviço nasce confirmado — não há mais o que o cliente
           confirmar depois. */
        const p = pedidoAtual();
        const escolhida = escolherProfissional(p);
        if(escolhida) confirmarProfissional(escolhida.id);
      }
    }, 3500);
  }

  /* O relógio da régua, andando acelerado. */
  repetir(function(){
    if(E.tela !== "buscando") return;
    E.busca.minutos++;
    const m = E.busca.minutos;

    escreverNaTela("busca-minutos", String(m));
    escreverNaTela("busca-fase", faseDaBusca(m));

    if(m >= REGUA_DA_BUSCA.cancelaAos){ salvar(); cancelarPorFaltaDeProfissional(); return; }
    if(m >= REGUA_DA_BUSCA.avisaClienteAos && !E.busca.jaAvisou){
      E.busca.jaAvisou = true;
      salvar();
      ir("buscaDemorando", { limparHistorico:true });
    }
  }, REGUA_DA_BUSCA.msPorMinutoSimulado);
}

function simularNinguemAceita(){
  E.busca.modo = "lento";
  salvar();
  desenhar();
}

/* Escreve um texto no lugar dele, se o lugar estiver na tela (o relógio da
   busca muda sem redesenhar a tela inteira). */
function escreverNaTela(id, texto){
  const lugar = document.getElementById(id);
  if(lugar) lugar.textContent = texto;
}

/* NO APP: a tela pergunta ao servidor como está a busca — uma vez ao abrir e
   depois a cada SEGUNDOS_ENTRE_PERGUNTAS_DA_BUSCA, enquanto a tela estiver
   aberta e à vista. O relógio morre junto com a tela (repetir). */
let BUSCA_PERGUNTADA_NA_NAVEGACAO = -1;

function acompanharABusca(){
  const id = E.pedidoAtual;
  if(!id) return;
  if(BUSCA_PERGUNTADA_NA_NAVEGACAO !== NAVEGACAO){
    BUSCA_PERGUNTADA_NA_NAVEGACAO = NAVEGACAO;
    perguntarComoEstaABusca(id);
  }
  repetir(function(){
    /* com o app escondido (outra aba, tela apagada), não pergunta */
    if(document.hidden) return;
    perguntarComoEstaABusca(id);
  }, SEGUNDOS_ENTRE_PERGUNTAS_DA_BUSCA * 1000);
}

function perguntarComoEstaABusca(id){
  FONTE.carregarPedido(id, seguirARegua);
}

/* O que o servidor disse: o pedido caiu (30 minutos, ou cancelado em outro
   lugar), foi confirmado, chegou aos 15 minutos — ou só o tempo andou. */
function seguirARegua(r){
  if(r.destino) return seguirPeloErro(r);
  /* sem resposta: a tela continua como está, e a próxima pergunta tenta de novo */
  if(!r.ok) return escreverNaTela("busca-aviso", r.erro || "");
  escreverNaTela("busca-aviso", "");
  const p = pedidoAtual();
  if(!p) return desenhar();
  if(p.situacao === "cancelado") return ir("buscaCancelada", { limparHistorico:true });
  /* uma diarista aceitou (as duas, no pedido de duas): "Diarista confirmada!" */
  if(p.situacao === "confirmado") return ir("confirmado", { limparHistorico:true });
  if(!pedidoNaBusca(p)) return ir("detalhePedido", { limparHistorico:true });
  const b = FONTE.ler.busca(p);
  if(E.tela === "buscando" && b.passo === "perguntar_ao_cliente" && !jaPerguntouAos15(p.id)){
    marcarQuePerguntouAos15(p.id);
    return ir("buscaDemorando", { limparHistorico:true });
  }
  /* o mesmo passo: só o tempo e a frase mudam, sem redesenhar a tela */
  escreverNaTela("busca-minutos", String(Number(b.minutos)));
  escreverNaTela("busca-fase", faseDoPasso(b.passo));
}

/* A pergunta dos 15 minutos aparece uma vez por pedido (no app; na maquete,
   E.busca.jaAvisou). Fica no aparelho: é só o que a tela já mostrou. */
function jaPerguntouAos15(id){
  return (Array.isArray(E.buscasPerguntadas) ? E.buscasPerguntadas : []).indexOf(String(id)) >= 0;
}

function marcarQuePerguntouAos15(id){
  const lista = Array.isArray(E.buscasPerguntadas) ? E.buscasPerguntadas : [];
  if(lista.indexOf(String(id)) < 0) lista.push(String(id));
  E.buscasPerguntadas = lista.slice(-20);
  salvar();
}

/* Aos 15 minutos: o cliente decide. */
TELAS.buscaDemorando = {
  html: function(){
    if(semPedidoEmAndamento()) return htmlDaTela("meusServicos");
    const p = pedidoAtual();
    const b = FONTE.ler.busca(p);
    const minutos = Math.max(Number(b.minutos) || 0, REGUA_DA_BUSCA.avisaClienteAos);
    const daSegunda = p.situacao === "aguardando_segunda";
    return ''
    + '<div class="corpo">'
    +   '<div class="centro" style="flex:none;padding:24px 6px 6px">'
    +     '<div class="emojao">⏳</div>'
    +     '<h2 class="titulo">Está demorando mais que o normal</h2>'
    +     '<p class="apoio">Já são <span id="busca-minutos">' + minutos + '</span> minutos procurando'
    +       (daSegunda ? ', e a segunda diarista ainda não aceitou. ' : ' e ninguém aceitou ainda. ')
    +       'Ampliamos a área de busca, mas quem decide é você.</p>'
    +   '</div>'
    +   '<div class="cartao">'
    +     '<div class="linha"><span class="rot">Serviço</span><span class="val">' + esc(p.resumoTexto) + '</span></div>'
    +     '<div class="linha"><span class="rot">Data</span><span class="val">' + esc(dataPorExtenso(p.data)) + '</span></div>'
    +     '<div class="linha"><span class="rot">Período</span><span class="val">'
    +       esc(nomePeriodoComAJanela(p.periodo, janelaDoPedidoEmTexto(p))) + '</span></div>'
    +   '</div>'
    /* No app o pagamento vem antes da busca (R20): "nenhuma cobrança
       acontece" não vale lá. O que vale nos dois: cancelar é sem custo, e o
       preço não sobe (R1). */
    +   (FONTE.ehMaquete
         ? '<div class="aviso verde">💚<div><b>Você não paga nada por isso</b>'
           + 'Nenhuma cobrança acontece enquanto não houver uma profissional confirmada. '
           + 'E o preço combinado não sobe.</div></div>'
         : '<div class="aviso verde">💚<div><b>Cancelar é sem custo</b>'
           + 'Se preferir cancelar agora, não tem custo nenhum. E o preço combinado não sobe.'
           + '</div></div>')
    +   '<p class="ajuda" id="busca-aviso" style="margin-top:6px"></p>'
    + '</div>'
    + '<div class="rodape">'
    +   '<button class="btn btn-principal" onclick="continuarAguardando()">Continuar aguardando</button>'
    +   '<button class="btn btn-claro" onclick="mudarDataDaBusca()">Mudar data ou período</button>'
    +   '<button class="btn btn-perigo" onclick="cancelarPorEscolhaDoCliente(this)">Cancelar sem custo</button>'
    +   '<div class="erro-do-campo" id="busca-erro"></div>'
    + '</div>';
  },
  /* no app, a régua continua: aos 30 minutos o pedido cai, e a tela vai junto */
  aoEntrar: function(){ if(!FONTE.ehMaquete) acompanharABusca(); }
};

function continuarAguardando(){
  /* na maquete: a simulação segue, sem ninguém aceitar */
  if(E.busca) E.busca.modo = "lento";
  salvar();
  ir("buscando", { limparHistorico:true });
}

/* "Cancelar sem custo" (R1). O botão fica desligado enquanto o pedido vai. */
function cancelarPorEscolhaDoCliente(botao){
  const p = pedidoAtual();
  if(!p) return;
  mostrarErro("busca-erro", "");
  FONTE.cancelarPedido(p.id, function(r){
    if(r.destino) return seguirPeloErro(r);
    if(!r.ok) return mostrarErro("busca-erro", r.erro);
    ir("buscaCancelada", { limparHistorico:true });
  }, { botao: botao || null });
}

/* "Mudar data ou período" (PROVISÓRIA, DECISOES A25): um pedido novo começa
   já preenchido — o mesmo serviço, a mesma casa, os mesmos adicionais.
   Falta só o dia e o período. ESTE PEDIDO SÓ É CANCELADO QUANDO O NOVO FOR
   CONFIRMADO (no app, pelo servidor, na mesma gravação): quem volta, desiste
   ou tem o dia novo recusado continua com ele, buscando. (Antes, o toque
   no botão já cancelava, e a pessoa podia ficar sem pedido nenhum.) */
function mudarDataDaBusca(){
  const p = pedidoAtual();
  if(!p) return;
  refazerOPedido(p, { noLugarDele:true });
  ir("dataHorario", { limparHistorico:true });
}

/* O pedido em montagem, a partir de outro: as mesmas escolhas, sem o dia e
   o período. O tamanho é o do pedido (o que foi cotado); se ele não é mais
   o da casa, fica como "ajustado só desta vez". noLugarDele: o novo
   substitui este (que ainda vale), e o "Confirmar pedido" o cancela. */
function refazerOPedido(p, opcoes){
  const novo = pedidoNovo();
  if(opcoes && opcoes.noLugarDele) novo.substitui = p.id;
  novo.categoria = p.categoria;
  novo.casaId = p.casaId;
  novo.respostas = Object.assign({}, p.respostas || {});
  novo.adicionais = (p.adicionais || []).slice();
  novo.duasProfissionais = !!(p.duasProfissionais || Number(p.quantidade) > 1);
  const casa = casaDoPedido(novo);
  novo.ajustadoDestaVez = !casa || ["comodos", "banheiros"].some(function(k){
    return novo.respostas[k] !== undefined && Number(novo.respostas[k]) !== Number(casa[k]);
  });
  E.pedido = novo;
  salvar();
}

/* Aos 30 minutos: o sistema desiste sozinho (na maquete; no app, quem
   decide é o servidor, e a tela só vai junto). */
function cancelarPorFaltaDeProfissional(){
  const p = pedidoAtual();
  p.situacao = "cancelado";
  p.motivoDoCancelamento = "busca_sem_profissional";
  p.chamadoAberto = true;
  salvar();
  ir("buscaCancelada", { limparHistorico:true });
}

/* "Tentar outro horário": o mesmo pedido, de novo, a partir do dia. */
function tentarOutroHorario(){
  const p = pedidoAtual();
  if(!p) return comecarPedido();
  refazerOPedido(p);
  ir("dataHorario", { limparHistorico:true });
}

TELAS.buscaCancelada = {
  html: function(){
    if(semPedidoEmAndamento()) return htmlDaTela("meusServicos");
    const p = pedidoAtual();
    /* a régua cancelou (30 minutos): no app, o servidor diz o motivo */
    const automatico = p.motivoDoCancelamento === "busca_sem_profissional" || !!p.chamadoAberto;
    return ''
    + '<div class="corpo">'
    +   '<div class="centro" style="flex:none;padding:24px 6px 6px">'
    +     '<div class="emojao">' + (automatico ? "😔" : "👍") + '</div>'
    +     '<h2 class="titulo">' + (automatico ? "Não conseguimos desta vez" : "Pedido cancelado") + '</h2>'
    +     '<p class="apoio">' + (automatico
        ? "Procuramos por " + REGUA_DA_BUSCA.cancelaAos + " minutos e nenhuma profissional pôde atender nesse dia e período. "
        + "Cancelamos seu pedido automaticamente."
        : "Tudo certo, cancelamos seu pedido.") + '</p>'
    +   '</div>'
    /* no app o pagamento vem antes da busca (R20): o que vale é "sem custo" */
    +   (FONTE.ehMaquete
         ? '<div class="aviso verde">💚<div><b>Você não pagou nada</b>'
           + 'Nenhum valor foi cobrado e nenhuma taxa foi gerada.</div></div>'
         : '<div class="aviso verde">💚<div><b>Sem custo nenhum</b>'
           + 'Este cancelamento não gera taxa nenhuma.</div></div>')
    /* o chamado no suporte (R1) chega com o suporte dentro do app */
    +   (automatico
      ? soNaMaquete('<div class="aviso roxo">🛟<div><b>Já avisamos nosso time</b>'
      +   'Abrimos um chamado no suporte. Uma pessoa vai procurar uma profissional na mão '
      +   'e entrar em contato com você.</div></div>')
      : "")
    + '</div>'
    + '<div class="rodape">'
    +   '<button class="btn btn-principal" onclick="tentarOutroHorario()">Tentar outro horário</button>'
    +   (automatico ? soNaMaquete('<button class="btn btn-claro" onclick="ir(\'chatSuporte\')">Falar com o suporte</button>') : "")
    +   '<button class="btn btn-texto" onclick="trocarAba(\'inicio\')">Voltar ao início</button>'
    + '</div>';
  }
};

function pedidoAtual(){
  return FONTE.ler.pedido(E.pedidoAtual);
}

/* Rede de segurança das telas que dependem de um pedido em andamento.
   Sem pedido nenhum, elas não fazem sentido — melhor cair na lista de
   serviços do que quebrar na cara do usuario. */
function semPedidoEmAndamento(){
  return !pedidoAtual();
}


/* --------------------------------------------------------------------------
   09. PROFISSIONAL ENCONTRADA
   -------------------------------------------------------------------------- */
/* Escolhe quem "aceitou". Favoritas primeiro, depois as mais próximas —
   é a regra descrita na seção 14 do documento. */
function escolherProfissional(pedido){
  const recusadas = pedido.recusadas || [];
  const candidatas = PROFISSIONAIS.filter(function(x){ return recusadas.indexOf(x.id) < 0; });
  if(!candidatas.length) return null;
  const favoritas = candidatas.filter(function(x){ return E.favoritos.indexOf(x.id) >= 0; });
  const pool = favoritas.length ? favoritas : candidatas;
  return pool.slice().sort(function(a,b){ return a.distancia - b.distancia; })[0];
}

/* Não é mais um botão que o cliente aperta: é o que acontece no instante
   em que a profissional aceita. Ver decisão R3 e exceção nº 4. */
function confirmarProfissional(id){
  const p = pedidoAtual();
  p.profissionalId = id;
  p.situacao = "confirmado";
  /* a hora do aceite: a conversa abre na véspera às 18h (A18), mas quem
     aceita depois disso conversa na hora — e a primeira mensagem de
     exemplo não pode ser de antes do aceite */
  p.confirmadoEm = relogioDaAgenda().getTime();
  salvar();
  ir("confirmado", { limparHistorico:true });
}

/* A função recusarProfissional() foi removida junto com o botão (decisão R3).
   Com ela saiu o único caminho que levava à tela "ninguemAceitou": quando a
   busca não dá em nada, quem responde agora é a régua da busca, que cancela
   sozinha aos 30 minutos e abre chamado no suporte (decisão R1). */

TELAS.confirmado = {
  html: function(){
    const p = pedidoAtual();
    const prof = p ? FONTE.ler.profissionalDoPedido(p) : null;
    /* rede de segurança: sem pedido ou sem profissional, esta tela não faz
       sentido — volta para a lista em vez de quebrar na cara do usuário */
    if(!prof) return htmlDaTela("meusServicos");
    /* no app, só aparece da profissional o que o servidor mandou: o nome
       curto. A nota, a experiência e os selos da imagem ficam para quando
       o app tiver avaliações e a conferência de documentos: até lá, "Nova
       na Limpah" (ver A32) */
    if(!FONTE.ehMaquete) return confirmadoNoApp(p);

    const primeiro = prof.nome.split(" ")[0];

    /* Os selos, do mesmo jeito que aparecem no perfil: é o que o cliente
       ganha além da faxina, e é o argumento contra combinar por fora. */
    let selos = "";
    [["documento","Documento conferido"],
     ["rosto","Identidade confirmada por selfie"],
     ["escudo","Antecedentes verificados"]].forEach(function(sv){
      selos += '<span class="selo verde" style="margin:0 6px 6px 0;gap:6px">'
        + icone(sv[0], 14) + esc(sv[1]) + '</span>';
    });

    /* As ações como linhas, e não como botões empilhados no rodapé: é o
       formato da imagem, e é o que cabe em celular baixo. */
    const acoes = [
      { icone:"💬", texto:"Conversar com " + primeiro,     acao:"abrirConversaDoPedido('" + idSeguro(p.id) + "')" },
      { icone:"👤", texto:"Ver perfil completo",           acao:"abrirPerfil(" + Number(prof.id) + ")" },
      { icone:"📋", texto:"Ver detalhes do pedido",        acao:"abrirPedido('" + idSeguro(p.id) + "')" },
      { icone:"🗂️", texto:"Ir para meus serviços",         acao:"trocarAba('servicos')" },
    ];
    let linhas = "";
    acoes.forEach(function(a){
      linhas += '<button class="item" onclick="' + a.acao + '">'
        + '<div style="font-size:19px;width:26px;text-align:center">' + a.icone + '</div>'
        + '<div class="txt"><b>' + esc(a.texto) + '</b></div>'
        + '<div class="seta">›</div></button>';
    });

    return ''
    + '<div class="corpo">'

    +   '<div style="text-align:center;padding:14px 0 6px">'
    +     '<div style="display:flex;justify-content:center;margin-bottom:10px">'
    +       '<div class="circulo-ok" style="width:60px;height:60px;font-size:30px">✓</div></div>'
    +     '<h2 class="titulo">Diarista confirmada! 🎉</h2>'
    +     '<p class="apoio" style="margin-bottom:8px">'
    +       esc(nomeCurto(prof.nome)) + ' aceitou seu pedido e chega '
    +       esc(dataPorExtenso(p.data).toLowerCase()) + ', no período da '
    +       esc(nomePeriodo(p.periodo).split(" ")[0].toLowerCase()) + '.</p>'
    +   '</div>'

    /* o perfil dela, resumido. A foto: para conferir na porta quem chegou
       (R35; na maquete, o rosto desenhado) */
    +   '<div class="cartao destaque">'
    +     '<div class="pessoa" style="margin-bottom:12px">'
    +       avatarDaDiarista(prof.nome, prof.cor, "", FONTE.ler.fotosDeQuemVai(p)[0])
    +       '<div class="info"><b>' + esc(nomeCurto(prof.nome)) + '</b>'
    +       '<span>' + estrelas(prof.nota) + ' (' + prof.avaliacoes + ' avaliações)</span>'
    +       '<span>📍 ' + String(prof.distancia).replace(".", ",") + ' km de você</span></div></div>'

    +     '<div class="grade-2" style="margin-bottom:12px">'
    +       '<div class="mini"><span>Experiência</span><b>' + prof.anos + ' anos</b></div>'
    +       '<div class="mini"><span>Serviços</span><b>' + prof.servicos + '+</b></div>'
    +     '</div>'

    +     '<div style="background:var(--roxo-claro);border-radius:12px;padding:12px;font-size:13px;'
    +       'line-height:1.5;font-style:italic;color:var(--roxo-escuro)">“' + esc(prof.frase) + '”</div>'

    +     '<div style="margin-top:12px">' + selos + '</div>'
    +   '</div>'

    +   '<div class="aviso verde">🔔<div><b>Você será avisado</b>'
    +     'Enviamos um lembrete na véspera e outro quando ela estiver a caminho.</div></div>'

    +   linhas
    + '</div>'
    + abas("inicio");
  }
};


/* "Diarista confirmada!" no app (6a): o mesmo desenho, só com o que é
   verdade agora. Quem vai ("Maria S.", ou as duas) vem pronto do servidor:
   nunca o sobrenome, o telefone ou o endereço dela. Desde a R35, também a
   foto de perfil que a nossa equipe aprovou (o servidor diz quem vê e até
   quando); sem ela, as iniciais. */
function confirmadoNoApp(p){
  const nomes = FONTE.ler.quemVai(p);
  const fotos = FONTE.ler.fotosDeQuemVai(p);
  const duas = nomes.length > 1;
  const quem = nomes.join(" e ");
  const primeiro = String(nomes[0] || "").split(" ")[0];
  let pessoas = "";
  nomes.forEach(function(nome, i){
    pessoas += '<div class="pessoa"' + (i ? ' style="margin-top:12px"' : "") + '>'
      + avatarDaDiarista(nome, "", "", fotos[i]) + '<div class="info"><b>' + esc(nome) + '</b>'
      + '<span>Nova na Limpah</span></div></div>';
  });
  /* uma conversa com cada uma (8): no pedido de duas, uma linha para cada */
  const acoes = nomes.map(function(nome, i){
    return { icone:"💬", texto:"Conversar com " + (String(nome).split(" ")[0] || primeiro),
             acao:"abrirConversaDoPedido('" + idSeguro(p.id) + "'," + Number(i + 1) + ")" };
  }).concat([
    { icone:"📋", texto:"Ver detalhes do pedido", acao:"abrirPedido('" + idSeguro(p.id) + "')" },
    { icone:"🗂️", texto:"Ir para meus serviços", acao:"trocarAba('servicos')" },
  ]);
  let linhas = "";
  acoes.forEach(function(a){
    linhas += '<button class="item" onclick="' + a.acao + '">'
      + '<div style="font-size:19px;width:26px;text-align:center">' + a.icone + '</div>'
      + '<div class="txt"><b>' + esc(a.texto) + '</b></div>'
      + '<div class="seta">›</div></button>';
  });
  return ''
  + '<div class="corpo">'
  +   '<div style="text-align:center;padding:14px 0 6px">'
  +     '<div style="display:flex;justify-content:center;margin-bottom:10px">'
  +       '<div class="circulo-ok" style="width:60px;height:60px;font-size:30px">✓</div></div>'
  +     '<h2 class="titulo">' + (duas ? "Diaristas confirmadas! 🎉" : "Diarista confirmada! 🎉") + '</h2>'
  +     '<p class="apoio" style="margin-bottom:8px">'
  +       esc(quem) + (duas ? ' aceitaram seu pedido e chegam ' : ' aceitou seu pedido e chega ')
  +       esc(dataPorExtenso(p.data).toLowerCase()) + ', no período da '
  +       esc(nomePeriodo(p.periodo).split(" ")[0].toLowerCase()) + '.</p>'
  +   '</div>'
  +   '<div class="cartao destaque">' + pessoas + '</div>'
  +   linhas
  + '</div>'
  + abas("inicio");
}


/* ==========================================================================
   78. PERFIL DA PROFISSIONAL

   Aparece DEPOIS que ela aceitou. Como o cliente não pode mais recusar
   (decisão R3), esta tela não serve para escolher — serve para ele ficar
   tranquilo com quem já está confirmada.

   Por isso o miolo dela são os SELOS DE VERIFICAÇÃO: é onde o cliente vê o
   que está comprando além da faxina, e é o argumento mais forte contra
   combinar por fora.

   UMA TELA SÓ, parametrizada: quem chama diz de quem é o perfil, com
   abrirPerfil(id). Serve ao aceite, aos favoritos e ao histórico.

   PRIVACIDADE: nome curto ("Maria S."), nunca sobrenome inteiro, telefone,
   rede social nem endereço. Nada que permita achar a pessoa fora do app.
   ========================================================================== */
function abrirPerfil(id){
  E.profissionalAberta = id;
  salvar();
  ir("perfilProfissional");
}

TELAS.perfilProfissional = {
  html: function(){
    const prof = PROFISSIONAIS.find(function(x){ return x.id === E.profissionalAberta; })
              || PROFISSIONAIS[0];
    const ehFavorita = E.favoritos.indexOf(prof.id) >= 0;

    /* --- os selos, em destaque: é o coração da tela --- */
    const selos = [
      { chave:"documento", titulo:"Documento conferido",
        detalhe:"Documento oficial com foto, checado pela nossa equipe" },
      { chave:"rosto",     titulo:"Identidade confirmada por selfie",
        detalhe:"A foto dela foi comparada com o documento" },
      { chave:"escudo",    titulo:"Antecedentes verificados",
        detalhe:"Consulta feita antes da liberação para trabalhar" },
    ];
    let blocoSelos = '<div class="cartao" style="border:1.5px solid #BFE7CE;background:var(--verde-claro)">'
      + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">'
      +   '<span style="color:var(--verde)">' + icone("escudo", 20) + '</span>'
      +   '<b style="font-size:15px;color:#0F7A38">Verificada pela Limpah</b>'
      + '</div>';
    selos.forEach(function(s, i){
      blocoSelos += '<div style="display:flex;gap:11px;align-items:flex-start;'
        + 'padding:10px 0' + (i ? ';border-top:1px solid #CDECD9' : '') + '">'
        + '<span style="color:var(--verde);margin-top:1px">' + icone(s.chave, 19) + '</span>'
        + '<div><b style="font-size:13.5px;color:#0F7A38;display:block">' + esc(s.titulo) + '</b>'
        + '<span style="font-size:12px;color:#3C7A57;line-height:1.45;display:block;margin-top:2px">'
        + esc(s.detalhe) + '</span></div></div>';
    });
    blocoSelos += '</div>';

    /* --- números --- */
    const numeros = [
      { valor: estrelas(prof.nota),          rotulo: prof.avaliacoes + " avaliações" },
      { valor: prof.servicos + "+",          rotulo: "serviços feitos" },
      { valor: prof.naPlataforma,            rotulo: "na plataforma" },
      { valor: prof.comparecimento + "%",    rotulo: "de comparecimento" },
    ];
    let blocoNumeros = '<div class="grade-2">';
    numeros.forEach(function(n){
      blocoNumeros += '<div class="mini"><b>' + esc(n.valor) + '</b><span>' + esc(n.rotulo) + '</span></div>';
    });
    blocoNumeros += '</div>';

    /* --- especialidades --- */
    let blocoEspecialidades = '<div class="rotulo">Especialidades</div><div>';
    (prof.especialidades || []).forEach(function(e){
      blocoEspecialidades += '<span class="selo" style="margin:0 6px 6px 0">' + esc(e) + '</span>';
    });
    blocoEspecialidades += '</div>';

    /* --- comentários de quem já contratou --- */
    let blocoComentarios = "";
    if((prof.comentarios || []).length){
      blocoComentarios = '<div class="rotulo">O que dizem os clientes</div>';
      prof.comentarios.forEach(function(c){
        blocoComentarios += '<div class="cartao" style="margin-bottom:10px">'
          + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">'
          +   '<b style="font-size:13.5px">' + esc(c.de) + '</b>'
          +   '<span style="font-size:12px;color:var(--suave)">' + esc(c.quando) + '</span></div>'
          + '<div style="font-size:12.5px;margin-bottom:6px">' + "⭐".repeat(c.nota) + '</div>'
          + '<div style="font-size:13.5px;line-height:1.55;color:var(--suave)">' + esc(c.texto) + '</div>'
          + '</div>';
      });
    }

    return ''
    + cabecalho("Perfil")
    + '<div class="corpo">'

    +   '<div style="text-align:center;padding:4px 0 16px">'
    +     '<div style="display:flex;justify-content:center;margin-bottom:10px">'
    +       avatar(prof.nome, prof.cor, "grande") + '</div>'
    +     '<b style="font-size:19px">' + esc(nomeCurto(prof.nome)) + (ehFavorita ? " ❤️" : "") + '</b>'
    +     '<div style="font-size:13px;color:var(--suave);margin-top:4px">'
    +       esc(prof.anos) + ' anos de experiência</div>'
    +   '</div>'

    +   blocoSelos
    +   blocoNumeros
    +   blocoEspecialidades

    +   '<div class="rotulo">Sobre</div>'
    +   '<div class="cartao"><div style="font-size:13.5px;line-height:1.6;color:var(--suave)">'
    +     '“' + esc(prof.frase) + '”</div></div>'

    +   blocoComentarios

    +   '<div class="rodape-seguro">Para a segurança de todos, não mostramos<br>'
    +     'dados que permitam encontrar a profissional fora do aplicativo.</div>'
    + '</div>'

    + '<div class="rodape">'
    +   '<button class="btn btn-contorno" onclick="alternarFavorita(' + Number(prof.id) + ')">'
    +     (ehFavorita ? "❤️ Nas suas favoritas" : "🤍 Adicionar aos favoritos") + '</button>'
    +   '<button class="btn btn-principal" onclick="voltar()">Voltar</button>'
    + '</div>';
  }
};


/* --------------------------------------------------------------------------
   ABA: MEUS SERVIÇOS
   -------------------------------------------------------------------------- */
TELAS.meusServicos = {
  html: function(){
    const pedidos = FONTE.ler.pedidos();
    let lista = "";
    if(pedidos === null){
      lista = pedidosAindaNao();
    } else if(!pedidos.length){
      lista = '<div class="vazio">Você ainda não pediu nenhum serviço.<br>Que tal começar agora?</div>';
    } else {
      pedidos.forEach(function(p){
        const prof = FONTE.ler.profissionalDoPedido(p);
        lista += '<button class="item" onclick="abrirPedido(\'' + idSeguro(p.id) + '\')">'
          + (prof ? avatar(prof.nome, prof.cor, "pequeno")
                  : '<div class="avatar pequeno" style="background:#CFC6E6">?</div>')
          + '<div class="txt"><b>' + esc(p.resumoTexto) + '</b>'
          + '<span>' + esc(dataPorExtenso(p.data)) + ' · ' + moeda(p.total) + '</span></div>'
          + (SELO_DA_SITUACAO[p.situacao] || "") + '</button>';
      });
    }
    return ''
    + '<div class="cabecalho"><h1>Meus serviços</h1></div>'
    + '<div class="corpo">' + lista + '</div>'
    + abas("servicos");
  },
  /* no app: os pedidos de agora, a cada visita */
  aoEntrar: function(){ pedirPedidosNestaVisita(); }
};

/* O selo de cada situação. O pedido que espera o pagamento tem o seu: um
   pedido não pago nunca aparece como "Buscando". Curto, porque a 320 px o
   selo comprido apertava o nome do serviço numa coluna de 36 px. */
const SELO_DA_SITUACAO = {
  aguardando_pagamento: '<span class="selo ambar">A pagar</span>',
  buscando:   '<span class="selo ambar">Buscando</span>',
  aguardando_segunda: '<span class="selo ambar">Buscando</span>',
  confirmado: '<span class="selo verde">Confirmado</span>',
  concluido:  '<span class="selo cinza">Concluído</span>',
  cancelado:  '<span class="selo cinza">Cancelado</span>',
};

/* "das 12h às 18h": a janela do pedido (a do servidor, no app; a da conta,
   na maquete). Um lugar só, para o início e o detalhe dizerem o mesmo. */
function janelaDoPedidoEmTexto(p){
  return p.janelaTexto || (janelaDoServico(p.periodo, p.horas) || {}).texto
      || (p.horas + " horas");
}

function abrirPedido(id){
  E.pedidoAtual = id;
  salvar();
  ir("detalhePedido");
}

TELAS.detalhePedido = {
  html: function(){
    const p = pedidoAtual();
    if(!p){
      return cabecalho("Detalhes do pedido") + '<div class="corpo">'
        + (FONTE.ler.pedidos() === null ? pedidosAindaNao() : '<div class="vazio">Pedido não encontrado.</div>')
        + '</div>';
    }
    const prof = FONTE.ler.profissionalDoPedido(p);
    const cat = CATALOGO.find(function(c){ return c.id === p.categoria; })
             || { nome:"Serviço", icone:"" };
    const janelaDoPedido = janelaDoPedidoEmTexto(p);

    let blocoProfissional = "";
    if(prof && !FONTE.ehMaquete){
      /* no app (6a): quem vai, pelo nome curto do servidor. Sem nota, perfil
         e favoritas, que ainda não existem de verdade */
      const fotos = FONTE.ler.fotosDeQuemVai(p);
      blocoProfissional = '<div class="rotulo">' + (FONTE.ler.quemVai(p).length > 1 ? "Profissionais" : "Profissional")
        + '</div><div class="cartao">'
        + FONTE.ler.quemVai(p).map(function(nome, i){
            return '<div class="pessoa"' + (i ? ' style="margin-top:12px"' : "") + '>'
              + avatarDaDiarista(nome, "", "", fotos[i])
              + '<div class="info"><b>' + esc(nome) + '</b><span>Nova na Limpah</span></div></div>';
          }).join("")
        + '</div>';
    } else if(prof){
      const ehFavorita = E.favoritos.indexOf(prof.id) >= 0;
      blocoProfissional = '<div class="rotulo">Profissional</div><div class="cartao">'
        + '<div class="pessoa">' + avatarDaDiarista(prof.nome, prof.cor, "", FONTE.ler.fotosDeQuemVai(p)[0])
        + '<div class="info"><b>' + esc(nomeCurto(prof.nome)) + '</b>'
        + '<span>' + estrelas(prof.nota) + ' · ' + prof.servicos + ' serviços</span></div></div>'
        + '<button class="btn btn-claro" style="margin-top:14px" onclick="abrirPerfil(' + Number(prof.id) + ')">'
        + 'Ver perfil completo</button>'
        + '<button class="btn btn-contorno" onclick="alternarFavorita(' + Number(prof.id) + ')">'
        + (ehFavorita ? "❤️ Nas suas favoritas" : "🤍 Adicionar aos favoritos") + '</button></div>';
    }

    /* esperando o pagamento: ninguém foi chamado ainda, e a pessoa sabe */
    let avisoDaSituacao = "";
    if(p.situacao === "aguardando_pagamento"){
      /* no computador, com o pagamento de teste logo abaixo, "o pagamento
         chega em breve" se contradiria na mesma tela */
      avisoDaSituacao = '<div class="aviso ambar">⏳<div><b>Aguardando o pagamento</b>'
        + (FONTE.ehMaquete || FONTE.ler.podePagar(p)
           ? 'A busca pela diarista começa assim que o pagamento entrar.'
           : 'O pagamento pelo app chega em breve. Enquanto isso, ninguém é chamado e nada é '
             + 'cobrado. Se mudar de ideia, cancele sem custo.')
        + '</div></div>';
    } else if(p.situacao === "cancelado" && p.situacaoTexto && p.situacaoTexto !== "Cancelado"){
      /* no app, o porquê do cancelamento, quando o servidor diz (o pedido
         que não foi pago a tempo) */
      avisoDaSituacao = '<div class="aviso">📌<div><b>' + esc(p.situacaoTexto) + '</b></div></div>';
    }

    let acoes = "";
    if(p.situacao === "confirmado"){
      acoes = botoesDaConversaDoPedido(p)
        + '<button class="btn btn-claro" onclick="ir(\'chatSuporte\')">Falar com o suporte</button>'
        + '<button class="btn btn-perigo" onclick="ir(\'cancelarPedido\')">Cancelar serviço</button>';
    } else if(pedidoNaBusca(p)){
      /* a busca continua andando: a tela dela mostra o passo da régua */
      acoes = '<button class="btn btn-principal" onclick="ir(\'buscando\')">Acompanhar a busca</button>'
        /* o suporte dentro do app é a entrega 9: no app, sem o botão (A25) */
        + soNaMaquete('<button class="btn btn-claro" onclick="ir(\'chatSuporte\')">Falar com o suporte</button>')
        + (FONTE.ler.podeCancelar(p)
           ? '<button class="btn btn-perigo" onclick="ir(\'cancelarPedido\')">Cancelar pedido</button>' : "");
    } else if(p.situacao === "aguardando_pagamento"){
      acoes = FONTE.ler.podeCancelar(p)
        ? '<button class="btn btn-perigo" onclick="ir(\'cancelarPedido\')">Cancelar pedido</button>'
        : '<button class="btn btn-contorno" onclick="trocarAba(\'servicos\')">Ver meus serviços</button>';
    } else {
      acoes = '<button class="btn btn-principal" onclick="comecarPedido()">Pedir novamente</button>';
    }

    return ''
    + cabecalho("Detalhes do pedido")
    + '<div class="corpo">'
    +   avisoDaSituacao
    +   pagamentoDeTeste(p)
    +   '<div class="cartao">'
    +     '<div style="display:flex;gap:12px;align-items:center;margin-bottom:8px">'
    +       '<div style="color:var(--roxo)">' + icone(cat.icone, 26) + '</div>'
    +       '<div style="flex:1"><b style="font-size:16px">' + esc(cat.nome) + '</b></div>'
    +     '</div>'
    +     '<div class="linha"><span class="rot">Data</span><span class="val">' + esc(dataPorExtenso(p.data)) + '</span></div>'
    +     '<div class="linha"><span class="rot">Período</span><span class="val">'
    +       esc(nomePeriodoComAJanela(p.periodo, janelaDoPedido)) + '</span></div>'
    +     '<div class="linha"><span class="rot">'
    +       ((p.quantidade > 1) ? "As duas ficam" : "Ela fica") + ' na sua casa</span>'
    +       '<span class="val">' + esc(janelaDoPedido) + '</span></div>'
    +   '</div>'

    /* o comprovante: a mesma quebra de valores que ele viu ao pedir */
    +   '<div class="rotulo">Valores</div>'
    +   '<div class="cartao">'
    +     '<div class="linha"><span class="rot">' + esc(cat.nome) + ' · '
    +       Number(p.horasSemAdicionais || p.horas) + 'h'
    +       (p.quantidade > 1 ? " × 2 profissionais" : "") + '</span>'
    +       '<span class="val">' + moeda(p.precoServico != null ? p.precoServico : p.total) + '</span></div>'
    +     (p.precoAdicionais
        ? '<div class="linha"><span class="rot">' + (p.adicionais || []).length + ' '
        + ((p.adicionais || []).length > 1 ? "adicionais" : "adicional") + '</span>'
        + '<span class="val">' + moeda(p.precoAdicionais) + '</span></div>'
        : "")
    +     linhaTempoExtra({
        mudouDeFaixa: p.mudouDeFaixa,
        horasSemAdicionais: p.horasSemAdicionais,
        horas: p.horas,
        tempoExtra: p.tempoExtra,
      })
    +     '<div class="linha total"><span class="rot">Total'
    +       (p.quantidade > 1 ? ' <span style="font-weight:600;font-size:12px">(duas diaristas)</span>' : "")
    +       '</span><span class="val">' + moeda(p.total) + '</span></div>'
    +   '</div>'
    +   blocoProfissional
    + '</div>'
    + '<div class="rodape">' + acoes + '</div>';
  },
  /* no app: a lista dos pedidos, se ainda não veio (recarregou aqui) */
  aoEntrar: function(){ pedirPedidosSeFaltar(); }
};

/* "Conversar com a profissional". No pedido de duas (só no app), um botão
   para cada uma: cada uma tem a sua conversa (8). */
function botoesDaConversaDoPedido(p){
  const nomes = FONTE.ehMaquete ? [] : FONTE.ler.quemVai(p);
  if(nomes.length < 2)
    return '<button class="btn btn-principal" onclick="abrirConversaDoPedido(\'' + idSeguro(p.id) + '\')">'
      + 'Conversar com a profissional</button>';
  return nomes.map(function(nome, i){
    return '<button class="btn ' + (i ? 'btn-contorno' : 'btn-principal') + '" '
      + 'onclick="abrirConversaDoPedido(\'' + idSeguro(p.id) + '\',' + Number(i + 1) + ')">'
      + 'Conversar com ' + esc(String(nome).split(" ")[0]) + '</button>';
  }).join("");
}

/* O PAGAMENTO DE TESTE, só no computador de quem está construindo o app
   (e no celular dele pelo Wi-Fi de casa): o servidor diz quando ele existe
   (pode_pagar). Nada é cobrado; o pedido vai para a busca, como vai
   acontecer quando o pagamento de verdade entrar. O título diz "teste", e
   não "computador": no Wi-Fi de casa ele aparece no celular.
   Na maquete nunca aparece (lá, o pagamento é a tela de Pix e cartão). */
function pagamentoDeTeste(p){
  if(!FONTE.ler.podePagar(p)) return "";
  return '<div class="cartao maquete"><b>🧪 SÓ PARA TESTE</b>'
    + '<div>Pagamento de teste: nada é cobrado. O pedido vai para a busca, como vai acontecer '
    + 'quando o pagamento de verdade entrar.</div>'
    + '<button class="btn btn-contorno" onclick="pagarPedido(this)">Pagar (teste)</button>'
    + '<div class="erro-do-campo" id="pagar-erro"></div></div>';
}

/* Pagar: o pedido vai para a busca. O botão fica desligado enquanto vai. */
function pagarPedido(botao){
  const p = pedidoAtual();
  if(!p) return;
  mostrarErro("pagar-erro", "");
  FONTE.pagarPedido(p.id, function(r){
    if(r.destino) return seguirPeloErro(r);
    if(!r.ok) return mostrarErro("pagar-erro", r.erro);
    ir("buscando", { limparHistorico:true });
  }, { botao: botao || null });
}

function alternarFavorita(id){
  const i = E.favoritos.indexOf(id);
  if(i >= 0) E.favoritos.splice(i, 1); else E.favoritos.push(id);
  salvar(); desenhar();
}

TELAS.cancelarPedido = {
  html: function(){
    const p = pedidoAtual();
    /* durante a busca (R1): ninguém confirmou ainda, e cancelar é sem custo */
    if(pedidoNaBusca(p)){
      return ''
      + cabecalho("Cancelar pedido")
      + '<div class="corpo">'
      +   '<div class="centro" style="flex:none;padding:20px 0">'
      +     '<div class="emojao">🤔</div>'
      +     '<h2 class="titulo">Tem certeza que quer cancelar?</h2>'
      +     '<p class="apoio">' + (p.situacao === "aguardando_segunda"
             ? "Uma diarista já aceitou, e a segunda ainda não. Cancelando agora, ela fica livre "
               + "para outros serviços."
             : "Ainda estamos procurando uma profissional para você.") + '</p>'
      +   '</div>'
      +   '<div class="aviso verde">✓<div><b>Sem custo</b>'
      +     'Cancelar enquanto a busca acontece não tem custo nenhum.</div></div>'
      + '</div>'
      /* "Manter" por último, como abaixo: o toque duplo não cancela */
      + '<div class="rodape">'
      +   (FONTE.ler.podeCancelar(p)
           ? '<button class="btn btn-perigo" onclick="confirmarCancelamento(this)">Sim, cancelar</button>' : "")
      +   '<div class="erro-do-campo" id="cancelar-erro"></div>'
      +   '<button class="btn btn-contorno" onclick="voltar()">Manter o pedido</button>'
      + '</div>';
    }
    /* esperando o pagamento: ninguém reservou nada, e nada foi cobrado */
    if(p && p.situacao === "aguardando_pagamento"){
      return ''
      + cabecalho("Cancelar pedido")
      + '<div class="corpo">'
      +   '<div class="centro" style="flex:none;padding:20px 0">'
      +     '<div class="emojao">🤔</div>'
      +     '<h2 class="titulo">Tem certeza que quer cancelar?</h2>'
      +     '<p class="apoio">Ninguém foi chamado ainda, e nada foi cobrado.</p>'
      +   '</div>'
      +   '<div class="aviso verde">✓<div><b>Sem custo</b>'
      +     'Um pedido que ainda espera o pagamento é cancelado de graça.</div></div>'
      + '</div>'
      /* "Manter o pedido" fica POR ÚLTIMO, no lugar em que estava o
         "Cancelar pedido" da tela anterior: um toque duplo cai nele, e não
         no "Sim, cancelar" (revisão da 2a; vale para a busca, na 2b) */
      + '<div class="rodape">'
      +   (FONTE.ler.podeCancelar(p)
           ? '<button class="btn btn-perigo" onclick="confirmarCancelamento(this)">Sim, cancelar</button>' : "")
      +   '<div class="erro-do-campo" id="cancelar-erro"></div>'
      +   '<button class="btn btn-contorno" onclick="voltar()">Manter o pedido</button>'
      + '</div>';
    }
    return ''
    + cabecalho("Cancelar serviço")
    + '<div class="corpo">'
    +   '<div class="centro" style="flex:none;padding:20px 0">'
    +     '<div class="emojao">🤔</div>'
    +     '<h2 class="titulo">Tem certeza que quer cancelar?</h2>'
    +     '<p class="apoio">A profissional já reservou esse horário na agenda dela.</p>'
    +   '</div>'
    /* a política de cancelamento (R20) ainda é do dono: no app, o
       cancelamento depois de pago chega com ela */
    +   soNaMaquete('<div class="aviso">📌<div><b>Política de cancelamento</b>'
    +     'As regras de prazo e cobrança ainda serão definidas pelo dono do projeto. '
    +     'Neste protótipo, o cancelamento é sempre gratuito.</div></div>')
    +   (FONTE.ler.podeCancelar(p) ? "" : '<div class="aviso">📌<div><b>Cancelar este pedido</b>'
    +     'Para cancelar um pedido em andamento, fale com a gente pelo suporte.</div></div>')
    + '</div>'
    /* "Manter" por último, como acima: o toque duplo não cancela */
    + '<div class="rodape">'
    +   (FONTE.ler.podeCancelar(p)
         ? '<button class="btn btn-perigo" onclick="confirmarCancelamento(this)">Sim, cancelar</button>' : "")
    +   '<div class="erro-do-campo" id="cancelar-erro"></div>'
    +   '<button class="btn btn-contorno" onclick="voltar()">Manter o serviço</button>'
    + '</div>';
  }
};

/* Cancelar: na maquete, sempre sem custo; no app, só o pedido que ainda
   espera o pagamento ou que ainda procura profissional (quem confere é o
   servidor). Da busca, a tela de "pedido cancelado" (a mesma dos 15
   minutos). O botão fica desligado enquanto o pedido vai. */
function confirmarCancelamento(botao){
  const p = pedidoAtual();
  if(!p) return;
  const naBusca = pedidoNaBusca(p);
  mostrarErro("cancelar-erro", "");
  FONTE.cancelarPedido(p.id, function(r){
    if(r.destino) return seguirPeloErro(r);
    if(!r.ok) return mostrarErro("cancelar-erro", r.erro);
    if(naBusca) return ir("buscaCancelada", { limparHistorico:true });
    trocarAba("servicos");
  }, { botao: botao || null });
}


/* --------------------------------------------------------------------------
   ABA: MENSAGENS
   -------------------------------------------------------------------------- */
TELAS.mensagens = {
  html: function(){
    if(!FONTE.ehMaquete) return mensagensNoApp();
    const agora = relogioDaAgenda();
    let lista = "";
    /* uma linha por serviço confirmado: cada um tem a sua conversa (A18) */
    conversasDoCliente().forEach(function(ctx){
      const situacao = situacaoDaConversa(ctx, agora);
      const escritas = mensagensDaConversa(ctx, agora).filter(function(m){ return m.de !== "app"; });
      const ultima = escritas[escritas.length - 1];
      const novas = situacao === "aberta" ? naoLidasDaConversa(ctx, "cliente", agora).length : 0;
      let resumo;
      if(situacao === "antes")
        resumo = "A conversa abre " + quandoARuaAparece(ctx) + " a partir das " + HORA_DO_ENDERECO_NA_VESPERA + "h";
      else if(ultima) resumo = ultima.texto;
      else resumo = situacao === "fechada" ? "Conversa encerrada" : "A conversa está aberta 😊";
      lista += '<button class="item" onclick="abrirConversaDoPedido(\'' + idSeguro(ctx.pedidoId) + '\')">'
        + avatar(ctx.nomes.diarista, ctx.cores.diarista, "pequeno")
        + '<div class="txt"><b>' + esc(ctx.nomes.diarista) + '</b>'
        + '<span class="previa">' + esc(resumo) + '</span></div>'
        + (novas ? '<span class="selo verde">' + novas + '</span>' : "") + '</button>';
    });
    lista += '<button class="item" onclick="ir(\'chatSuporte\')">'
      + '<div class="avatar pequeno" style="background:var(--roxo)">L</div>'
      + '<div class="txt"><b>Suporte Limpah</b>'
      + '<span>Estamos aqui se precisar de qualquer coisa.</span></div></button>';

    return ''
    + '<div class="cabecalho"><h1>Mensagens</h1></div>'
    + '<div class="corpo">' + lista + '</div>'
    + abas("mensagens");
  },
  /* no app: as conversas de agora, a cada visita */
  aoEntrar: function(){ pedirAsConversasNestaVisita(); }
};

/* A ABA MENSAGENS NO APP: as conversas que o servidor mandou (uma por
   profissional de cada serviço confirmado), com as novas e a última
   mensagem. A mesma cara da maquete. */
function mensagensNoApp(){
  /* a aba é do cliente: as conversas de outra conta (a dela) nunca aparecem aqui */
  const conversas = (E.perfil === "cliente") ? FONTE.ler.conversas() : [];
  let lista = "";
  if(conversas === null){
    lista = conversasAindaNao();
  } else if(!conversas.length){
    lista = '<div class="vazio">Nenhuma conversa por enquanto.<br>Cada serviço confirmado tem a sua, '
      + 'que abre na véspera, a partir das ' + HORA_DO_ENDERECO_NA_VESPERA + 'h.</div>';
  } else {
    conversas.forEach(function(x){
      let resumo;
      if(x.situacao === "antes")
        resumo = "A conversa abre " + quandoARuaAparece({ data:x.data }) + " a partir das "
          + HORA_DO_ENDERECO_NA_VESPERA + "h";
      else if(x.ultima) resumo = x.ultima.texto;
      else resumo = x.situacao === "fechada" ? "Conversa encerrada" : "A conversa está aberta 😊";
      const novas = x.situacao === "aberta" ? x.naoLidas : 0;
      lista += '<button class="item" onclick="abrirConversaPeloAviso(\'cliente\',\'' + idSeguro(x.chave) + '\')">'
        + avatar(x.com, "var(--roxo)", "pequeno")
        + '<div class="txt"><b>' + esc(x.com) + '</b>'
        + '<span class="previa">' + esc(resumo) + '</span></div>'
        + (novas ? '<span class="selo verde">' + Number(novas) + '</span>' : "") + '</button>';
    });
  }
  lista += '<button class="item" onclick="ir(\'chatSuporte\')">'
    + '<div class="avatar pequeno" style="background:var(--roxo)">L</div>'
    + '<div class="txt"><b>Suporte Limpah</b>'
    + '<span>Estamos aqui se precisar de qualquer coisa.</span></div></button>';
  return ''
  + '<div class="cabecalho"><h1>Mensagens</h1></div>'
  + '<div class="corpo">' + lista + '</div>'
  + abas("mensagens");
}

/* NO APP, as conversas da pessoa vêm do servidor: uma vez a cada visita à
   aba Mensagens e às telas de entrada (o início dela e dele, a agenda
   dela). Sem resposta, a frase e "Tentar de novo" — só na aba. Na
   maquete, a tomada responde na hora, e nada é redesenhado. */
let CONVERSAS_PEDIDAS_NA_NAVEGACAO = -1;
let ERRO_DAS_CONVERSAS = null;    // { frase, navegacao }

function erroDasConversasAgora(){
  return (ERRO_DAS_CONVERSAS && ERRO_DAS_CONVERSAS.navegacao === NAVEGACAO) ? ERRO_DAS_CONVERSAS.frase : "";
}

function pedirAsConversasNestaVisita(){
  if(CONVERSAS_PEDIDAS_NA_NAVEGACAO === NAVEGACAO || erroDasConversasAgora()) return;
  CONVERSAS_PEDIDAS_NA_NAVEGACAO = NAVEGACAO;
  FONTE.carregarConversas(depoisDasConversas);
}

function depoisDasConversas(r){
  if(r.destino) return seguirPeloErro(r);
  ERRO_DAS_CONVERSAS = r.ok ? null : { frase: r.erro || "", navegacao: NAVEGACAO };
  if(!FONTE.ehMaquete) desenhar();
}

function conversasAindaNao(){
  const erro = erroDasConversasAgora();
  if(!erro) return '<p class="apoio">Carregando suas conversas…</p>';
  return '<div class="aviso ambar">⚠️<div>' + esc(erro) + '</div></div>'
    + '<button class="btn btn-contorno" onclick="tentarAsConversasDeNovo()">Tentar de novo</button>';
}

function tentarAsConversasDeNovo(){
  ERRO_DAS_CONVERSAS = null;
  CONVERSAS_PEDIDAS_NA_NAVEGACAO = -1;
  desenhar();
}

/* O balão de uma mensagem — o desenho de sempre, num lugar só, para a
   conversa do suporte e a conversa com a profissional serem iguais. */
function balaoDaConversa(texto, hora, minha){
  return '<div style="display:flex;justify-content:' + (minha ? "flex-end" : "flex-start") + ';margin-bottom:10px">'
    + '<div style="max-width:76%;background:' + (minha ? "var(--roxo)" : "var(--branco)") + ';'
    + 'color:' + (minha ? "var(--branco)" : "var(--texto)") + ';padding:11px 14px;border-radius:16px;'
    + 'border-bottom-' + (minha ? "right" : "left") + '-radius:5px;font-size:14px;line-height:1.5;'
    + 'overflow-wrap:anywhere;box-shadow:var(--sombra)">' + esc(texto)
    + '<div style="font-size:10.5px;opacity:.6;margin-top:5px;text-align:right">' + esc(hora) + '</div>'
    + '</div></div>';
}

/* O cabeçalho da conversa: voltar, a bolinha com as iniciais, o nome e uma
   linha embaixo. */
function cabecalhoDaConversa(titulo, subtitulo, cor){
  return '<div class="cabecalho">'
  +   '<button class="voltar" onclick="voltar()" aria-label="Voltar">‹</button>'
  +   '<div class="pessoa" style="min-width:0"><div class="avatar pequeno" style="background:' + esc(cor) + '">'
  +     esc(iniciais(titulo)) + '</div>'
  +   '<div class="info" style="min-width:0"><b style="font-size:15px">' + esc(titulo) + '</b>'
  +   '<span style="font-size:11.5px">' + esc(subtitulo) + '</span></div></div>'
  + '</div>';
}

/* A conversa do SUPORTE: as mensagens ainda são fixas — é um protótipo. */
function conversa(titulo, subtitulo, cor, mensagens, respostas){
  let baloes = "";
  mensagens.forEach(function(m){ baloes += balaoDaConversa(m.texto, m.hora, m.de === "eu"); });

  return ''
  + cabecalhoDaConversa(titulo, subtitulo, cor)
  + '<div class="corpo" style="background:var(--fundo)">' + baloes + '</div>'
  + '<div class="rodape">'
  +   '<div style="display:flex;gap:8px">'
  +     '<input type="text" placeholder="Escreva uma mensagem..." style="flex:1;min-width:0;border:1.5px solid var(--borda);'
  /* 16px de propósito: com menos, o iPhone dá zoom na página ao tocar no campo */
  +       'background:var(--branco);border-radius:24px;padding:13px 16px;font-size:16px;font-family:inherit">'
  +     '<button class="btn btn-principal" style="width:50px;flex:none;padding:0;border-radius:50%" aria-label="Enviar">➤</button>'
  +   '</div>'
  +   (respostas || "")
  + '</div>';
}


/* ==========================================================================
   A CONVERSA CLIENTE ↔ DIARISTA — o motor dos dois lados (A18, 12/10/2026)

   Pedido do dono: o que um lado escreve aparece para o outro, com a hora; a
   conversa abre na véspera às 18h, junto com a rua, e fecha às 23h59 do dia
   do serviço; ela tem respostas de um toque; e quem não está na conversa
   ganha um aviso.

   Nenhuma regra mora aqui. Abrir e fechar é situacaoDaConversa(), esconder
   contato é esconderContatos(), e o texto do aviso é
   textoDoAvisoDeMensagem() — os três no dados.js.

   NA MAQUETE o cliente e a diarista são mundos separados: a profissional
   que aceita o pedido do cliente ("Maria S.") e o cliente dos serviços dela
   ("Carla M.") são de mentira. Por isso cada conversa tem uma CHAVE e duas
   telas — a do cliente (chatProfissional) e a dela (diaristaConversa) — e
   um quadro "NA MAQUETE" abre a mesma conversa do lado da outra pessoa
   (A18-12). No app de verdade cada lado está num celular, e quem guarda as
   mensagens e decide o horário é o servidor.
   ========================================================================== */
const TELA_DA_CONVERSA = { cliente:"chatProfissional", diarista:"diaristaConversa" };

/* As respostas de um toque, só do lado dela: ela pode estar com a mão
   ocupada (pedido do dono). Um toque ENVIA — não só preenche o campo. */
const RESPOSTAS_PRONTAS_DELA = ["Estou a caminho", "Cheguei! Estou em frente", "Estou no interfone/portão"];

const TAMANHO_MAXIMO_DA_MENSAGEM = 500;

function outroPapel(papel){ return papel === "cliente" ? "diarista" : "cliente"; }

function chaveDaConversaDoPedido(p){ return "pedido:" + p.id; }
function chaveDaConversaDoServico(s){ return "servico:" + s.oportunidadeId + ":" + s.data; }

/* O que fica guardado de cada conversa: as mensagens escritas e até quando
   cada lado já leu. Nomes, dia e rua NÃO ficam aqui: vêm sempre do pedido
   ou da agenda (contextoDaConversa), para nunca envelhecerem. */
function registroDaConversa(chave, criar){
  if(!E.conversas || typeof E.conversas !== "object") E.conversas = {};
  if(!E.conversas[chave] && criar)
    E.conversas[chave] = { mensagens:[], lidoAte:{ cliente:0, diarista:0 }, explicouContato:false };
  return E.conversas[chave] || null;
}

/* Quem é quem, o dia e a rua desta conversa. Sem pedido confirmado, ou sem
   o serviço na agenda dela, não há conversa (null). */
function contextoDaConversa(chave){
  chave = String(chave || "");
  if(chave.indexOf("pedido:") === 0){
    const id = chave.slice("pedido:".length);
    const p = (E.pedidos || []).filter(function(x){ return x.id === id; })[0];
    const prof = p && PROFISSIONAIS.filter(function(x){ return x.id === p.profissionalId; })[0];
    if(!p || !prof || p.situacao === "buscando" || p.situacao === "cancelado") return null;
    const c = E.cliente || CLIENTE_EXEMPLO;
    const casa = casaDoPedido(p);
    const janela = janelaDoServico(p.periodo, p.horas) || {};
    return {
      chave: chave, pedidoId: p.id, data: p.data, inicio: janela.inicio, fim: janela.fim,
      janela: janela.texto || "",
      /* "Nome I." dos dois lados: o cliente nunca vê o sobrenome dela */
      nomes: { cliente: nomeCurto(c.nome) || "Cliente", diarista: nomeCurto(prof.nome) },
      cores: { cliente: c.cor || "var(--roxo)", diarista: prof.cor },
      /* a rua, só para TIRAR do aviso de mensagem (A18-10) */
      rua: (casa && casa.rua) || (c.endereco && c.endereco.rua) || "",
      apartamento: !casa || casa.tipoImovel === "apartamento",
      /* na maquete a profissional é de mentira: é ela quem escreve os exemplos */
      deMentira: "diarista",
      desde: Number(p.confirmadoEm) || 0,
    };
  }
  if(chave.indexOf("servico:") === 0){
    /* o estado dela vem da tabela (R24): antes da aprovação não há serviço */
    if(!situacaoDaDiarista().podeAceitar) return null;
    const d = euSouDiarista();
    const s = (d.agenda || []).filter(function(x){ return chaveDaConversaDoServico(x) === chave; })[0];
    if(!s) return null;
    const det = detalhesDoServico(s);
    const origem = OPORTUNIDADES[s.oportunidadeId];
    return {
      chave: chave, data: s.data, inicio: s.inicio, fim: s.fim, janela: det.janela,
      nomes: { cliente: det.cliente || "Cliente", diarista: nomeCurto(d.nome) || "Diarista" },
      cores: { cliente: "var(--roxo)", diarista: "var(--roxo-escuro)" },
      /* a rua guardada, mesmo antes das 18h: é só para tirá-la do aviso */
      rua: s.endereco || ((origem && origem.bairro === s.bairro) ? origem.rua : "") || "",
      apartamento: true,
      deMentira: "cliente",
      desde: Number(s.aceitoEm) || 0,
    };
  }
  return null;
}

/* As escritas e os exemplos que já chegaram, em ordem de hora. */
function mensagensDaConversa(ctx, agora){
  const reg = registroDaConversa(ctx.chave, false);
  const t = agora.getTime();
  const todas = (reg ? reg.mensagens.slice() : []).concat(
    exemplosDaConversa(ctx).filter(function(m){ return m.em <= t; }));
  return todas.map(function(m, i){ return { m:m, i:i }; })
    .sort(function(a, b){ return (a.m.em - b.m.em) || (a.i - b.i); })
    .map(function(x){ return x.m; });
}

/* O que o outro lado escreveu e este lado ainda não viu. */
function naoLidasDaConversa(ctx, papel, agora){
  const reg = registroDaConversa(ctx.chave, false);
  const lido = reg ? (Number(reg.lidoAte && reg.lidoAte[papel]) || 0) : 0;
  return mensagensDaConversa(ctx, agora).filter(function(m){
    return m.de === outroPapel(papel) && m.em > lido;
  });
}

/* Na maquete, "estar com o app aberto na conversa" é estar nesta tela. */
function estaNaConversa(papel, chave){
  return E.tela === TELA_DA_CONVERSA[papel] && E.conversaNaTela === chave;
}

/* O AVISO: só com a conversa aberta e mensagem nova. O texto é o do
   WhatsApp do app de verdade — nome curto, texto filtrado, e o texto só
   vai quando não pode apontar a casa (corpo vazio: vai sem ele, A18-10). */
function avisoDeMensagem(ctx, papel, agora){
  if(situacaoDaConversa(ctx, agora) !== "aberta") return null;
  const novas = naoLidasDaConversa(ctx, papel, agora);
  if(!novas.length) return null;
  const ultima = novas[novas.length - 1];
  const de = ctx.nomes[outroPapel(papel)];
  return { chave:ctx.chave, papel:papel, quantas:novas.length, de:de, em:ultima.em,
           texto:textoDoAvisoDeMensagem(de, ultima.texto, ctx.rua),
           corpo:corpoDoAvisoDeMensagem(ultima.texto, ctx.rua) };
}

/* ENVIAR. Fora do horário não envia (no app de verdade, o servidor recusa).
   O texto é filtrado ANTES de guardar: o contato original não fica em lugar
   nenhum. Quem está com a conversa na tela já leu; quem não está, ganha o
   aviso. */
function enviarMensagem(chave, papel, texto){
  const ctx = contextoDaConversa(chave);
  if(!ctx || !TELA_DA_CONVERSA[papel]) return null;
  const agora = relogioDaAgenda();
  if(situacaoDaConversa(ctx, agora) !== "aberta") return null;
  const bruto = String(texto == null ? "" : texto).replace(/\s+/g, " ").trim()
    .slice(0, TAMANHO_MAXIMO_DA_MENSAGEM);
  if(!bruto) return null;
  const filtrado = esconderContatos(bruto);
  const reg = registroDaConversa(chave, true);
  const ultima = reg.mensagens[reg.mensagens.length - 1];
  const em = Math.max(agora.getTime(), ultima ? ultima.em + 1 : 0);
  const m = { de:papel, texto:filtrado.texto, em:em };
  reg.mensagens.push(m);
  /* a explicação, uma vez por conversa (A18-8) */
  if(filtrado.escondeu && !reg.explicouContato){
    reg.mensagens.push({ de:"app", texto:EXPLICACAO_DO_CONTATO_ESCONDIDO, em:em });
    reg.explicouContato = true;
  }
  reg.lidoAte[papel] = em;
  if(estaNaConversa(outroPapel(papel), chave)) reg.lidoAte[outroPapel(papel)] = em;
  salvar();
  return m;
}

/* Abrir a conversa na tela é ler. Se havia mensagem nova AO ENTRAR, a tela
   mostra uma vez o aviso que teria chegado no WhatsApp (a faixa âmbar).

   Só ao entrar: mensagem que chega com a pessoa DENTRO da conversa só fica
   lida. Antes o relógio da conversa redesenhava a tela, achava a mensagem
   de exemplo não lida e mostrava "Chegou enquanto você estava fora" com a
   pessoa ali — o contrário da regra (o aviso é só para quem está fora). */
function lerConversa(ctx, papel, agora, entrando){
  const novas = naoLidasDaConversa(ctx, papel, agora);
  if(entrando){
    const aviso = novas.length ? avisoDeMensagem(ctx, papel, agora) : null;
    E.faixaDaConversa = aviso
      ? { chave:ctx.chave, papel:papel, texto:aviso.texto, quantas:aviso.quantas } : null;
  }
  if(!novas.length) return;
  const reg = registroDaConversa(ctx.chave, true);
  reg.lidoAte[papel] = Math.max(Number(reg.lidoAte[papel]) || 0, novas[novas.length - 1].em);
  salvar();
}

/* Quem ENTRA na conversa: por um botão que a abre (prepararConversa,
   verOOutroLado), ou vindo de outra tela (voltar, recarregar a página).
   O redesenho da própria conversa — o relógio, o envio — não é entrada. */
let ENTRADA_NA_CONVERSA = "";
function entrandoNaConversa(papel, chave){
  const peloBotao = ENTRADA_NA_CONVERSA === chave;
  ENTRADA_NA_CONVERSA = "";
  return peloBotao || ultimaTelaDesenhada !== TELA_DA_CONVERSA[papel];
}

/* As conversas do cliente: uma por serviço confirmado. */
function conversasDoCliente(){
  return (E.pedidos || []).filter(function(p){ return p.situacao === "confirmado" && p.profissionalId; })
    .map(function(p){ return contextoDaConversa(chaveDaConversaDoPedido(p)); })
    .filter(Boolean);
}

/* As conversas dela: uma por serviço da agenda. */
function conversasDela(){
  return (euSouDiarista().agenda || [])
    .map(function(s){ return contextoDaConversa(chaveDaConversaDoServico(s)); })
    .filter(Boolean);
}

function naoLidasDoCliente(){
  /* no app, o servidor conta (só as conversas abertas) */
  if(!FONTE.ehMaquete)
    return novasDasConversasNoApp("cliente").reduce(function(n, x){ return n + x.naoLidas; }, 0);
  const agora = relogioDaAgenda();
  let n = 0;
  conversasDoCliente().forEach(function(ctx){
    if(situacaoDaConversa(ctx, agora) === "aberta") n += naoLidasDaConversa(ctx, "cliente", agora).length;
  });
  return n;
}

/* O CARTÃO DE MENSAGEM NOVA, nas telas de entrada (o cliente: Início; ela:
   Início e Agenda). Mostra a mais recente e, em âmbar, o que o app de
   verdade faz: manda o aviso no WhatsApp (A18-13).

   Com mais de uma conversa esperando, diz quantas são e de quem (A18-16):
   antes a segunda só aparecia depois de ler a primeira. Ela acha as outras
   pela marca em cada cartão da agenda; o cliente, na aba Mensagens. */
function cartaoDeMensagemNova(papel){
  if(!FONTE.ehMaquete) return cartaoDeMensagemNovaNoApp(papel);
  const agora = relogioDaAgenda();
  const avisos = [];
  (papel === "cliente" ? conversasDoCliente() : conversasDela()).forEach(function(ctx){
    const a = avisoDeMensagem(ctx, papel, agora);
    if(a) avisos.push(a);
  });
  if(!avisos.length) return "";
  avisos.sort(function(a, b){ return b.em - a.em; });
  const melhor = avisos[0], outros = avisos.slice(1);
  const nomesDosOutros = outros.map(function(a){ return a.de; })
    .filter(function(n, i, lista){ return lista.indexOf(n) === i; });
  /* o nome entre parênteses: "Juliana P." já termina em ponto */
  const varias = outros.length > 1;
  const maisConversas = outros.length
    ? '<div class="mais-conversas">E mais ' + outros.length
      + (varias ? ' conversas' : ' conversa') + ' com mensagem nova ('
      + esc(nomesDosOutros.join(", ")) + '). '
      + (papel === "cliente" ? (varias ? 'Estão' : 'Está') + ' na aba Mensagens.'
                             : (varias ? 'Estão marcadas' : 'Está marcada') + ' na sua agenda.') + '</div>'
    : "";
  return '<div class="cartao destaque mensagem-nova">'
    +   '<div class="pessoa">' + avatar(melhor.de, "var(--roxo)", "pequeno")
    +     '<div class="info"><b>💬 ' + esc(melhor.de) + ' mandou mensagem</b>'
    /* sem o texto quando ele pode apontar a casa (A18-10): o mesmo do aviso */
    +     (melhor.corpo ? '<span>“' + esc(melhor.corpo) + '”</span>' : '<span>Abra a conversa para ler.</span>')
    +     '</div>'
    +     (melhor.quantas > 1 ? '<span class="selo verde">' + melhor.quantas + '</span>' : "")
    +   '</div>'
    +   maisConversas
    +   '<button class="btn btn-principal" style="margin-top:12px" '
    +     'onclick="abrirConversaPeloAviso(\'' + idSeguro(papel) + '\',\'' + idSeguro(melhor.chave) + '\')">'
    +     'Ver a conversa</button>'
    +   notaDoAvisoNoWhatsApp(melhor.texto)
    + '</div>';
}

/* NO APP: as conversas abertas com mensagem nova, como o servidor contou
   (FONTE.ler.conversas, pedida uma vez por visita) — só as de quem está
   usando este lado (a tela do cliente nunca mostra as conversas dela). */
function novasDasConversasNoApp(papel){
  if(E.perfil !== papel) return [];
  return (FONTE.ler.conversas() || []).filter(function(x){
    return x.situacao === "aberta" && x.naoLidas > 0;
  });
}

/* O cartão de mensagem nova no app: o mesmo desenho, SEM o texto da
   mensagem (como o aviso que chega no celular: "Abra a conversa para
   ler"). Com mais de uma conversa esperando, diz quantas e de quem. */
function cartaoDeMensagemNovaNoApp(papel){
  const novas = novasDasConversasNoApp(papel);
  if(!novas.length) return "";
  const melhor = novas[0], outros = novas.slice(1);
  const nomesDosOutros = outros.map(function(x){ return x.com; })
    .filter(function(n, i, lista){ return lista.indexOf(n) === i; });
  const varias = outros.length > 1;
  const maisConversas = outros.length
    ? '<div class="mais-conversas">E mais ' + outros.length
      + (varias ? ' conversas' : ' conversa') + ' com mensagem nova ('
      + esc(nomesDosOutros.join(", ")) + '). '
      + (papel === "cliente" ? (varias ? 'Estão' : 'Está') + ' na aba Mensagens.'
                             : 'Abra cada uma pelo serviço, na sua agenda.') + '</div>'
    : "";
  return '<div class="cartao destaque mensagem-nova">'
    +   '<div class="pessoa">' + avatar(melhor.com, "var(--roxo)", "pequeno")
    +     '<div class="info"><b>💬 ' + esc(melhor.com) + ' mandou mensagem</b>'
    +     '<span>Abra a conversa para ler.</span></div>'
    +     (melhor.naoLidas > 1 ? '<span class="selo verde">' + Number(melhor.naoLidas) + '</span>' : "")
    +   '</div>'
    +   maisConversas
    +   '<button class="btn btn-principal" style="margin-top:12px" '
    +     'onclick="abrirConversaPeloAviso(\'' + idSeguro(papel) + '\',\'' + idSeguro(melhor.chave) + '\')">'
    +     'Ver a conversa</button>'
    + '</div>';
}

/* A nota âmbar da maquete. É a ÚNICA coisa que o teste 3 deixa dizer o
   nome do aplicativo de mensagem (A18-13) — e só porque ela não é contato
   de ninguém: o texto vem de textoDoAvisoDeMensagem(), já sem telefone e
   sem endereço. Nada de marcação dentro dela além do <b>. */
function notaDoAvisoNoWhatsApp(texto, titulo){
  return '<div class="nota-maquete">' + (titulo ? '<b>' + esc(titulo) + '</b>' : "")
    + '📲 No app de verdade, este aviso chega no WhatsApp: “' + esc(texto) + '”</div>';
}

/* Abrir a conversa: a chave fica guardada para a tela saber qual é, e a
   faixa de uma visita anterior some. */
function prepararConversa(chave){
  E.conversaNaTela = String(chave || "");
  E.faixaDaConversa = null;
  MENSAGEM_NAO_ENVIADA = null;
  ENTRADA_NA_CONVERSA = E.conversaNaTela;
  salvar();
}

/* `vaga`: no pedido de duas (só no app), com qual das duas — cada uma tem a
   sua conversa com o cliente. Sem ela, a primeira (a única, na maquete). */
function abrirConversaDoPedido(id, vaga){
  E.pedidoAtual = id;
  prepararConversa("pedido:" + id + (Number(vaga) === 2 ? ":2" : ""));
  ir("chatProfissional");
}

function abrirConversaPeloAviso(papel, chave){
  prepararConversa(chave);
  if(papel === "diarista") ir("diaristaConversa");
  else ir("chatProfissional");
}

/* NA MAQUETE: a mesma conversa, do lado da outra pessoa (A18-12). */
function verOOutroLado(papel){
  E.faixaDaConversa = null;
  ENTRADA_NA_CONVERSA = E.conversaNaTela;
  salvar();
  if(papel === "cliente") ir("diaristaConversa");
  else ir("chatProfissional");
}

/* O que está sendo digitado sobrevive a um redesenho (o relógio da conversa
   redesenha a tela quando chega mensagem de exemplo, abre ou fecha). Só na
   memória: rascunho não precisa sobreviver a recarregar a página. */
const RASCUNHOS_DA_CONVERSA = {};
function guardarRascunho(papel, valor){ RASCUNHOS_DA_CONVERSA[E.conversaNaTela + "|" + papel] = valor; }

function focarCampoDaConversa(){
  const campo = document.getElementById("campo-conversa");
  if(campo){ try { campo.focus(); } catch(e){} }
}

/* A MENSAGEM QUE NÃO FOI. Se a conversa fecha (meia-noite) com a pessoa no
   meio da frase, o envio é recusado — e antes nada dizia isso: o campo
   sumia e o texto ia junto, sem aviso. Agora a tela diz que não foi, e
   mostra o que era, para a pessoa poder levar ao suporte. Só na memória,
   como o rascunho: é um aviso do momento. */
let MENSAGEM_NAO_ENVIADA = null;
function anotarSeNaoFoi(papel, texto, enviada){
  if(enviada) return;
  const ctx = contextoDaConversa(E.conversaNaTela);
  if(!ctx || situacaoDaConversa(ctx, relogioDaAgenda()) === "aberta") return;
  MENSAGEM_NAO_ENVIADA = { chave:ctx.chave, papel:papel, texto:String(texto || "").trim() };
}

function enviarDoCampo(papel){
  const texto = valorDoCampo("campo-conversa");
  if(!texto.trim()){ focarCampoDaConversa(); return; }
  const enviada = enviarMensagem(E.conversaNaTela, papel, texto);
  if(enviada) guardarRascunho(papel, "");
  anotarSeNaoFoi(papel, texto, enviada);
  E.faixaDaConversa = null;
  desenhar();
  focarCampoDaConversa();
}

function enviarRespostaPronta(i){
  const texto = RESPOSTAS_PRONTAS_DELA[i];
  if(!texto) return;
  anotarSeNaoFoi("diarista", texto, enviarMensagem(E.conversaNaTela, "diarista", texto));
  E.faixaDaConversa = null;
  desenhar();
}

/* "Hoje", "Ontem" ou "Sex, 16/10", entre mensagens de dias diferentes. */
function diaDaMensagem(em, agora){
  const d = new Date(em), iso = isoDoDia(d);
  if(iso === isoDoDia(agora)) return "Hoje";
  const ontem = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() - 1);
  if(iso === isoDoDia(ontem)) return "Ontem";
  return DIAS_SEMANA[d.getDay()] + ", " + diaCurto(iso);
}

function horaDaMensagem(em){
  const d = new Date(em);
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
}

/* O subtítulo do cabeçalho: "Serviço de amanhã, ter 13/10" ou "Serviço de
   qui, 15/10". Era "Serviço em " + dataPorExtenso, que dava "Serviço em
   Amanhã, 13/10" (maiúscula no meio da frase). */
function subtituloDaConversa(iso, agora){
  const p = String(iso || "").split("-").map(Number);
  const d = new Date(p[0], p[1] - 1, p[2]);
  if(p.length !== 3 || isNaN(d.getTime())) return "Serviço agendado";
  const dia = DIAS_SEMANA[d.getDay()].toLowerCase();
  const perto = { "0":"hoje", "1":"amanhã", "-1":"ontem" };
  const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const diferenca = String(Math.round((d.getTime() - hoje.getTime()) / 86400000));
  return "Serviço de " + (perto[diferenca] ? perto[diferenca] + ", " + dia + " " : dia + ", ") + diaCurto(iso);
}

/* O MIOLO DA CONVERSA: a faixa, as mensagens e o quadro da maquete. Fica à
   parte para o relógio poder trocar SÓ a lista quando chega mensagem — sem
   recriar o campo, que fecharia o teclado no meio da frase. */
function mioloDaConversa(ctx, papel, agora, entrando){
  const outro = outroPapel(papel);
  const primeiro = String(ctx.nomes[outro]).split(" ")[0];
  const situacao = situacaoDaConversa(ctx, agora);
  lerConversa(ctx, papel, agora, entrando);

  /* a faixa âmbar: o que chegou enquanto este lado estava fora */
  const f = E.faixaDaConversa;
  const faixa = (f && f.chave === ctx.chave && f.papel === papel)
    ? notaDoAvisoNoWhatsApp(f.texto, f.quantas > 1 ? "Chegaram " + f.quantas + " mensagens enquanto você estava fora"
                                                     : "Chegou enquanto você estava fora")
    : "";

  let miolo = "";
  if(situacao === "antes"){
    miolo = '<div class="centro" style="flex:none;padding:26px 6px 10px;gap:10px">'
      + '<div class="emojao" style="font-size:52px">💬</div>'
      + '<b style="font-size:17px">A conversa com ' + esc(primeiro) + ' abre ' + esc(quandoARuaAparece(ctx))
      + ' a partir das ' + HORA_DO_ENDERECO_NA_VESPERA + 'h</b>'
      + '<p class="apoio" style="margin:0">'
      + (papel === "cliente"
        ? 'É a mesma hora em que ela recebe a rua e o número da sua casa: é para proteger você.'
        : 'Junto com a rua e o número. É para proteger a casa do cliente.')
      + ' Precisa de algo antes? Fale com o suporte.</p></div>';
  } else {
    const msgs = mensagensDaConversa(ctx, agora);
    let dia = "";
    msgs.forEach(function(m){
      const d = diaDaMensagem(m.em, agora);
      if(d !== dia){ miolo += '<div class="dia-conversa">' + esc(d) + '</div>'; dia = d; }
      if(m.de === "app") miolo += '<div class="msg-app">' + esc(m.texto) + '</div>';
      else miolo += balaoDaConversa(m.texto, horaDaMensagem(m.em), m.de === papel);
    });
    if(!msgs.length)
      miolo += '<div class="conversa-vazia">'
        + (situacao === "aberta"
          ? 'A conversa abriu. Combine por aqui portão, interfone ou a chegada. 😊'
          : 'Ninguém escreveu nesta conversa.') + '</div>';
    if(situacao === "fechada")
      miolo += '<div class="aviso roxo" style="margin-top:6px">🔒<div><b>Esta conversa foi encerrada</b>'
        + 'Ela fica aberta até as ' + ULTIMO_MINUTO_DA_CONVERSA.hora + 'h'
        + String(ULTIMO_MINUTO_DA_CONVERSA.minuto).padStart(2, "0") + ' do dia do serviço. '
        + 'Dá para ler o que foi escrito. Precisa de algo? Fale com o suporte.</div></div>';
    const naoFoi = MENSAGEM_NAO_ENVIADA;
    if(situacao !== "aberta" && naoFoi && naoFoi.chave === ctx.chave && naoFoi.papel === papel)
      miolo += '<div class="aviso" style="margin-top:6px">⚠️<div><b>Sua mensagem não foi enviada</b>'
        + 'A conversa fechou antes de ela sair, e ' + esc(primeiro) + ' não recebeu: “'
        + esc(naoFoi.texto) + '”. Precisa de algo? Fale com o suporte.</div></div>';
    if(situacao === "aberta")
      miolo += '<div class="cartao maquete">'
        + '<b>⚙ NA MAQUETE</b>'
        /* "Joana T." já termina em ponto: sem ponto a mais */
        + '<div>Você está do lado de ' + esc(ctx.nomes[papel]) + (/\.$/.test(ctx.nomes[papel]) ? "" : ".")
        + ' No app de verdade cada um está '
        + 'no seu celular; aqui dá para ver os dois lados da mesma conversa.</div>'
        + '<button class="btn btn-contorno" onclick="verOOutroLado(\'' + idSeguro(papel) + '\')">'
        + 'Ver o lado de ' + esc(primeiro) + '</button></div>';
  }
  return faixa + miolo;
}

/* A TELA DA CONVERSA, dos dois lados. A cara é a da conversa que o cliente
   sempre teve (a imagem manda no desenho); o que muda é QUANDO ela abre, e
   que as mensagens agora são de verdade. No app, as mensagens e o horário
   vêm do servidor (telaDaConversaNoApp, mais abaixo). */
function telaDaConversa(papel){
  if(!FONTE.ehMaquete) return telaDaConversaNoApp(papel);
  const agora = relogioDaAgenda();
  let ctx = contextoDaConversa(E.conversaNaTela);
  /* quem chegou por um caminho sem chave (dado antigo): a do pedido aberto */
  if(!ctx && papel === "cliente"){
    const p = pedidoAtual();
    ctx = p ? contextoDaConversa(chaveDaConversaDoPedido(p)) : null;
    if(ctx) E.conversaNaTela = ctx.chave;
  }
  if(!ctx) return semConversa(papel);

  const outro = outroPapel(papel);
  const situacao = situacaoDaConversa(ctx, agora);
  const corpo = mioloDaConversa(ctx, papel, agora, entrandoNaConversa(papel, ctx.chave));
  const irAoSuporte = (papel === "cliente") ? "ir('chatSuporte')" : "ir('diaristaEmBreve')";

  let rodape;
  if(situacao === "aberta"){
    const rascunho = RASCUNHOS_DA_CONVERSA[ctx.chave + "|" + papel] || "";
    rodape = (papel === "diarista"
        ? '<div class="respostas-prontas">' + RESPOSTAS_PRONTAS_DELA.map(function(t, i){
            return '<button onclick="enviarRespostaPronta(' + Number(i) + ')">' + esc(t) + '</button>';
          }).join("") + '</div>'
        : "")
      + '<div class="compositor">'
      +   '<input id="campo-conversa" type="text" maxlength="' + TAMANHO_MAXIMO_DA_MENSAGEM + '" '
      +     'enterkeyhint="send" autocomplete="off" placeholder="Escreva uma mensagem..." '
      +     'value="' + esc(rascunho) + '" oninput="guardarRascunho(\'' + idSeguro(papel) + '\', this.value)" '
      +     'onkeydown="if(event.key===\'Enter\'){event.preventDefault();enviarDoCampo(\'' + idSeguro(papel) + '\');}">'
      +   '<button class="btn btn-principal" aria-label="Enviar" onclick="enviarDoCampo(\'' + idSeguro(papel) + '\')">➤</button>'
      + '</div>';
  } else {
    rodape = '<button class="btn btn-claro" onclick="' + irAoSuporte + '">Falar com o suporte</button>';
  }

  /* data-conversa: o relógio confere que a lista na tela é desta conversa
     antes de trocá-la sozinho */
  return cabecalhoDaConversa(ctx.nomes[outro], subtituloDaConversa(ctx.data, agora), ctx.cores[outro])
    + '<div class="corpo" style="background:var(--fundo)" data-conversa="' + esc(idSeguro(ctx.chave)) + '">'
    +   corpo + '</div>'
    + '<div class="rodape">' + rodape + '</div>';
}

/* Sem conversa (pedido cancelado, serviço que saiu da agenda): diz isso e
   leva de volta, em vez de quebrar. */
function semConversa(papel){
  return cabecalho("Conversa")
    + '<div class="corpo">'
    +   '<div class="centro" style="flex:none;padding:18px 6px 6px;gap:10px">'
    +     '<div class="emojao" style="font-size:52px">💬</div>'
    +     '<b style="font-size:17px">Nenhuma conversa aberta por aqui</b>'
    +     '<p class="apoio" style="margin:0">Cada serviço confirmado tem a sua conversa, '
    +     'que abre na véspera, a partir das ' + HORA_DO_ENDERECO_NA_VESPERA + 'h.</p></div>'
    +   (papel === "cliente"
      ? '<button class="btn btn-principal" style="margin-top:14px" onclick="trocarAba(\'mensagens\')">Ver minhas mensagens</button>'
      : '<button class="btn btn-principal" style="margin-top:14px" onclick="ir(\'diaristaAgenda\',{limparHistorico:true})">Ver minha agenda</button>')
    + '</div>';
}

/* O relógio da conversa: rola até a última mensagem, e acorda na hora em
   que ela abre, fecha ou chega mensagem de exemplo. Pelo agendar(), como
   todo relógio do app: trocar de tela desliga. */
function aoEntrarNaConversa(){
  if(!FONTE.ehMaquete) return aoEntrarNaConversaNoApp();
  agendar(function(){
    const corpo = document.querySelector(".corpo");
    if(corpo) corpo.scrollTop = corpo.scrollHeight;
  }, 0);
  const ctx = contextoDaConversa(E.conversaNaTela);
  if(!ctx) return;
  const agora = relogioDaAgenda().getTime();
  const momentos = [momentoQueAConversaAbre(ctx).getTime(), momentoQueAConversaFecha(ctx).getTime()]
    .concat(exemplosDaConversa(ctx).map(function(m){ return m.em; }))
    .filter(function(t){ return !isNaN(t) && t > agora; });
  if(!momentos.length) return;
  const espera = Math.min(ESPERA_MAXIMA_DO_RELOGIO_DA_RUA_MS, Math.min.apply(null, momentos) - agora + 1000);
  agendar(atualizarConversaNaTela, espera);
}

/* Quando o relógio acorda. Se a conversa abriu ou fechou, o rodapé muda
   (campo, respostas, suporte) e a tela é redesenhada inteira. Se só chegou
   mensagem, troca SÓ a lista: o campo continua o mesmo, com o que estava
   sendo escrito e o teclado aberto — no iPhone, devolver o foco fora de
   um toque não reabre o teclado. A mensagem que chega assim só fica lida:
   quem está na conversa não ganha aviso (A18-10). */
function atualizarConversaNaTela(){
  const papel = E.tela === TELA_DA_CONVERSA.diarista ? "diarista" : "cliente";
  const ctx = contextoDaConversa(E.conversaNaTela);
  const agora = relogioDaAgenda();
  const corpo = document.querySelector(".corpo[data-conversa]");
  const soALista = !!(ctx && corpo && document.getElementById("campo-conversa")
    && E.tela === TELA_DA_CONVERSA[papel] && ultimaTelaDesenhada === E.tela
    && corpo.getAttribute("data-conversa") === idSeguro(ctx.chave)
    && situacaoDaConversa(ctx, agora) === "aberta");
  if(!soALista || !corpo){
    const digitando = document.activeElement && document.activeElement.id === "campo-conversa";
    desenhar();
    if(digitando) focarCampoDaConversa();
    return;
  }
  corpo.innerHTML = mioloDaConversa(ctx, papel, agora, false);
  aoEntrarNaConversa();
}

/* ==========================================================================
   A CONVERSA NO APP DE VERDADE (dos dois lados)

   A mesma cara da conversa da maquete: o cabeçalho, os balões, o campo, as
   respostas de um toque dela. O que muda é de onde as coisas vêm: QUEM
   decide se a conversa está aberta, guarda as mensagens e esconde o
   contato é o servidor (FONTE.carregarConversa, FONTE.enviarNaConversa). A
   tela só mostra o que veio.

   - Com a conversa aberta na tela e a página à vista, a tela pergunta de
     novo a cada SEGUNDOS_ENTRE_PERGUNTAS_DA_CONVERSA e diz "li até aqui"
     (é assim que o servidor sabe que a pessoa está na conversa, e não manda
     aviso). Antes de abrir, pergunta uma vez na hora em que ela abre;
     fechada, não pergunta mais.
   - A mensagem que chega troca SÓ a lista: o campo continua o mesmo, com o
     que estava sendo escrito e o teclado aberto (a lição da maquete).
   - Um envio de cada vez, e cada envio com a sua chave: o toque duplo, ou
     tentar de novo depois de uma resposta que se perdeu, grava uma vez só.
   - O que veio do servidor fica só na memória da página, e sai quando a
     pessoa sai da conversa (nunca vai para o aparelho).
   ========================================================================== */
const SEGUNDOS_ENTRE_PERGUNTAS_DA_CONVERSA = 15;
/* teto de uma espera pela hora em que a conversa abre (o mesmo da rua) */
const ESPERA_MAXIMA_PELA_CONVERSA_MS = 6 * 3600 * 1000;
let CONVERSA_PEDIDA_NA_NAVEGACAO = -1;
let CONVERSA_PERGUNTADA_EM = 0;
let ERRO_DA_CONVERSA = null;          // { frase, navegacao }
let ENVIO_NA_CONVERSA = -1;           // a navegação de um envio que ainda não voltou
let ULTIMO_ENVIO_DA_CONVERSA = null;  // { chave, texto, envio }: o mesmo texto, a mesma chave
let MENSAGENS_NA_LISTA = -1;          // quantas a lista mostra (para descer até a nova)

function conversaComErro(){
  return (ERRO_DA_CONVERSA && ERRO_DA_CONVERSA.navegacao === NAVEGACAO) ? ERRO_DA_CONVERSA.frase : "";
}

function telaDaConversaNoApp(papel){
  const chave = String(E.conversaNaTela || "");
  const c = FONTE.ler.conversa(chave);
  if(!chave || (c && c.naoExiste)) return semConversa(papel);
  if(!c) return cabecalho("Conversa") + '<div class="corpo">' + conversaAindaNao() + '</div>';
  const irAoSuporte = (papel === "cliente") ? "ir('chatSuporte')" : "ir('diaristaEmBreve')";
  let rodape;
  if(c.situacao === "aberta"){
    const rascunho = RASCUNHOS_DA_CONVERSA[chave + "|" + papel] || "";
    rodape = (papel === "diarista"
        ? '<div class="respostas-prontas">' + RESPOSTAS_PRONTAS_DELA.map(function(t, i){
            return '<button onclick="enviarRespostaProntaNoApp(' + Number(i) + ')">' + esc(t) + '</button>';
          }).join("") + '</div>'
        : "")
      + '<div class="compositor">'
      +   '<input id="campo-conversa" type="text" maxlength="' + Number(c.tamanhoMaximo) + '" '
      +     'enterkeyhint="send" autocomplete="off" placeholder="Escreva uma mensagem..." '
      +     'value="' + esc(rascunho) + '" oninput="guardarRascunho(\'' + idSeguro(papel) + '\', this.value)" '
      +     'onkeydown="if(event.key===\'Enter\'){event.preventDefault();enviarDoCampoNoApp(\'' + idSeguro(papel) + '\');}">'
      +   '<button class="btn btn-principal" id="enviar-conversa" aria-label="Enviar" '
      +     'onclick="enviarDoCampoNoApp(\'' + idSeguro(papel) + '\')">➤</button>'
      + '</div>'
      + '<div class="erro-do-campo" id="conversa-erro"></div>';
  } else {
    rodape = '<button class="btn btn-claro" onclick="' + irAoSuporte + '">Falar com o suporte</button>';
  }
  /* data-conversa: a lista na tela é desta conversa (atualizarAListaDaConversa) */
  return cabecalhoDaConversa(c.com || "Conversa", subtituloDaConversa(c.data, new Date()), "var(--roxo)")
    + '<div class="corpo" id="corpo-conversa" style="background:var(--fundo)" data-conversa="'
    +   esc(idSeguro(chave)) + '">' + mioloDaConversaNoApp(c, papel) + '</div>'
    + '<div class="rodape">' + rodape + '</div>';
}

function conversaAindaNao(){
  const erro = conversaComErro();
  if(!erro) return '<p class="apoio">Carregando a conversa…</p>';
  return '<div class="aviso ambar">⚠️<div>' + esc(erro) + '</div></div>'
    + '<button class="btn btn-contorno" onclick="tentarAConversaDeNovo()">Tentar de novo</button>';
}

function tentarAConversaDeNovo(){
  ERRO_DA_CONVERSA = null;
  CONVERSA_PEDIDA_NA_NAVEGACAO = -1;
  desenhar();
}

/* "Hoje", "Ontem" ou "Sex, 16/10": o dia vem do servidor (em Brasília); o
   relógio do aparelho só escolhe a palavra. */
function diaDaMensagemNoApp(iso){
  const agora = new Date();
  if(iso === isoDoDia(agora)) return "Hoje";
  if(iso === isoDoDia(new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() - 1))) return "Ontem";
  const p = String(iso || "").split("-").map(Number);
  const d = new Date(p[0], p[1] - 1, p[2]);
  return isNaN(d.getTime()) ? String(iso || "") : DIAS_SEMANA[d.getDay()] + ", " + diaCurto(iso);
}

/* O miolo: as mensagens, ou a frase de quando a conversa abre; a conversa
   encerrada; a mensagem que não foi. A explicação do contato escondido
   aparece uma vez, logo depois da primeira mensagem em que o servidor
   escondeu alguma coisa (A18-8). */
function mioloDaConversaNoApp(c, papel){
  const primeiro = String(c.com || "").split(" ")[0] || (papel === "cliente" ? "a profissional" : "o cliente");
  if(c.situacao === "antes"){
    return '<div class="centro" style="flex:none;padding:26px 6px 10px;gap:10px">'
      + '<div class="emojao" style="font-size:52px">💬</div>'
      + '<b style="font-size:17px">A conversa com ' + esc(primeiro) + ' abre '
      + (c.esperaConfirmar ? 'quando o serviço for confirmado'
                           : esc(quandoARuaAparece({ data:c.data })) + ' a partir das ' + HORA_DO_ENDERECO_NA_VESPERA + 'h')
      + '</b>'
      + '<p class="apoio" style="margin:0">'
      + (papel === "cliente"
        ? 'É a mesma hora em que ela recebe a rua e o número da sua casa: é para proteger você.'
        : 'Junto com a rua e o número. É para proteger a casa do cliente.')
      + ' Precisa de algo antes? Fale com o suporte.</p></div>';
  }
  let miolo = "", dia = "", explicou = false;
  c.mensagens.forEach(function(m){
    const d = diaDaMensagemNoApp(m.dia);
    if(d !== dia){ miolo += '<div class="dia-conversa">' + esc(d) + '</div>'; dia = d; }
    miolo += balaoDaConversa(m.texto, m.hora, m.de === papel);
    if(m.escondeu && !explicou){
      miolo += '<div class="msg-app">' + esc(EXPLICACAO_DO_CONTATO_ESCONDIDO) + '</div>';
      explicou = true;
    }
  });
  if(!c.mensagens.length)
    miolo += '<div class="conversa-vazia">'
      + (c.situacao === "aberta"
        ? 'A conversa abriu. Combine por aqui portão, interfone ou a chegada. 😊'
        : 'Ninguém escreveu nesta conversa.') + '</div>';
  if(c.situacao === "fechada")
    miolo += '<div class="aviso roxo" style="margin-top:6px">🔒<div><b>Esta conversa foi encerrada</b>'
      + 'Ela fica aberta até as ' + ULTIMO_MINUTO_DA_CONVERSA.hora + 'h'
      + String(ULTIMO_MINUTO_DA_CONVERSA.minuto).padStart(2, "0") + ' do dia do serviço. '
      + 'Dá para ler o que foi escrito. Precisa de algo? Fale com o suporte.</div></div>';
  const naoFoi = MENSAGEM_NAO_ENVIADA;
  if(c.situacao !== "aberta" && naoFoi && naoFoi.chave === c.chave && naoFoi.papel === papel)
    miolo += '<div class="aviso" style="margin-top:6px">⚠️<div><b>Sua mensagem não foi enviada</b>'
      + 'A conversa fechou antes de ela sair, e ' + esc(primeiro) + ' não recebeu: “'
      + esc(naoFoi.texto) + '”. Precisa de algo? Fale com o suporte.</div></div>';
  return miolo;
}

/* Ao entrar (e a cada redesenho): pergunta uma vez por visita, e depois
   conforme a situação. Quem conta é a hora da última pergunta, e não o
   relógio: um redesenho no meio não recomeça a espera de 15 s. */
function aoEntrarNaConversaNoApp(){
  descerAteAUltima(true);
  const chave = String(E.conversaNaTela || "");
  if(!chave) return;
  if(CONVERSA_PEDIDA_NA_NAVEGACAO !== NAVEGACAO && !conversaComErro()){
    CONVERSA_PEDIDA_NA_NAVEGACAO = NAVEGACAO;
    MENSAGENS_NA_LISTA = -1;
    perguntarAConversa(chave);
    return;
  }
  const c = FONTE.ler.conversa(chave);
  if(!c || c.naoExiste || c.situacao === "fechada") return;
  if(c.situacao === "antes" && !c.esperaConfirmar){
    /* antes de abrir: uma pergunta na hora em que ela abre (o servidor diz
       se abriu). Hora que já passou (o relógio do celular adiantado) não
       arma nada: senão a pergunta seria feita sem parar */
    const quando = momentoQueAConversaAbre({ data:c.data }).getTime(), agora = Date.now();
    if(isNaN(quando) || quando <= agora) return;
    agendar(function(){ perguntarAConversa(chave); }, Math.min(ESPERA_MAXIMA_PELA_CONVERSA_MS, quando - agora + 1000));
    return;
  }
  repetir(function(){
    /* com o app escondido (outra aba, tela apagada), não pergunta */
    if(document.hidden) return;
    if(Date.now() - CONVERSA_PERGUNTADA_EM < SEGUNDOS_ENTRE_PERGUNTAS_DA_CONVERSA * 1000) return;
    perguntarAConversa(chave);
  }, 1000);
}

function perguntarAConversa(chave){
  CONVERSA_PERGUNTADA_EM = Date.now();
  FONTE.carregarConversa(chave, depoisDaConversa);
}

/* O que o servidor disse. Sem resposta na primeira vez: a frase e "Tentar
   de novo"; com a conversa já na tela, ela continua, e a próxima pergunta
   tenta de novo. */
function depoisDaConversa(r){
  if(r.destino) return seguirPeloErro(r);
  const c = FONTE.ler.conversa(E.conversaNaTela);
  if(!r.ok){
    if(c) return mostrarErro("conversa-erro", r.erro || "");
    ERRO_DA_CONVERSA = { frase: r.erro || "", navegacao: NAVEGACAO };
    return desenhar();
  }
  ERRO_DA_CONVERSA = null;
  atualizarAListaDaConversa();
  marcarAConversaComoLida();
}

/* Troca SÓ a lista quando a situação continua a mesma (o campo, com o que
   estava sendo escrito, fica); se a conversa abriu ou fechou, o rodapé
   muda e a tela é redesenhada inteira, com o rascunho de volta. */
function atualizarAListaDaConversa(){
  const papel = (E.tela === TELA_DA_CONVERSA.diarista) ? "diarista" : "cliente";
  const c = FONTE.ler.conversa(E.conversaNaTela);
  const corpo = document.getElementById("corpo-conversa");
  const campo = document.getElementById("campo-conversa");
  const mesmaSituacao = !!c && !c.naoExiste && !!corpo && ((c.situacao === "aberta") === !!campo)
    && E.tela === TELA_DA_CONVERSA[papel] && ultimaTelaDesenhada === E.tela;
  if(!mesmaSituacao){
    const digitando = document.activeElement && document.activeElement.id === "campo-conversa";
    desenhar();
    if(digitando) focarCampoDaConversa();
    return;
  }
  if(corpo) corpo.innerHTML = mioloDaConversaNoApp(c, papel);
  descerAteAUltima(false);
}

/* Desce até a última mensagem ao entrar, e quando chega mensagem nova. */
function descerAteAUltima(sempre){
  const c = FONTE.ler.conversa(E.conversaNaTela);
  const quantas = (c && c.mensagens) ? c.mensagens.length : 0;
  if(!sempre && quantas === MENSAGENS_NA_LISTA) return;
  MENSAGENS_NA_LISTA = quantas;
  agendar(function(){
    const corpo = document.getElementById("corpo-conversa");
    if(corpo) corpo.scrollTop = corpo.scrollHeight;
  }, 0);
}

/* "Li até aqui" e "estou aqui": só com a página à vista e a conversa já
   aberta (é por isto que quem está lendo não recebe aviso). */
function marcarAConversaComoLida(){
  const c = FONTE.ler.conversa(E.conversaNaTela);
  if(!c || c.naoExiste || c.situacao === "antes" || document.hidden) return;
  const ultima = c.mensagens.length ? c.mensagens[c.mensagens.length - 1].n : 0;
  FONTE.marcarConversaLida({ chave:c.chave, ate:ultima }, function(r){
    if(r.destino) seguirPeloErro(r);
  });
}

function enviarDoCampoNoApp(papel){
  const texto = valorDoCampo("campo-conversa");
  if(!texto.trim()) return focarCampoDaConversa();
  enviarNaConversaNoApp(papel, texto, true);
}

/* Um toque ENVIA (não só preenche o campo): ela pode estar com a mão ocupada. */
function enviarRespostaProntaNoApp(i){
  const texto = RESPOSTAS_PRONTAS_DELA[i];
  if(!texto) return;
  enviarNaConversaNoApp("diarista", texto, false);
}

/* Uma chave por envio. Não é segredo: só diz ao servidor "este é o mesmo
   envio de antes". */
function chaveNovaDoEnvio(){
  return "m" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

function ligarOBotaoDeEnviar(ligado){
  const botao = document.getElementById("enviar-conversa");
  if(botao) botao.disabled = !ligado;
}

/* Um envio de cada vez (o toque duplo e o Enter repetido não mandam duas).
   O mesmo texto, de novo depois de um envio que não voltou, vai com a mesma
   chave: se o primeiro chegou ao servidor, ele não grava outro. */
function enviarNaConversaNoApp(papel, texto, doCampo){
  const chave = String(E.conversaNaTela || "");
  texto = String(texto || "").replace(/\s+/g, " ").trim();
  if(!chave || !texto || ENVIO_NA_CONVERSA === NAVEGACAO) return;
  const antes = ULTIMO_ENVIO_DA_CONVERSA;
  const envio = (antes && antes.chave === chave && antes.texto === texto) ? antes.envio : chaveNovaDoEnvio();
  ULTIMO_ENVIO_DA_CONVERSA = { chave:chave, texto:texto, envio:envio };
  ENVIO_NA_CONVERSA = NAVEGACAO;
  ligarOBotaoDeEnviar(false);
  mostrarErro("conversa-erro", "");
  FONTE.enviarNaConversa({ chave:chave, texto:texto, envio:envio }, function(r){
    ENVIO_NA_CONVERSA = -1;
    ligarOBotaoDeEnviar(true);
    depoisDoEnvioNoApp(r, papel, texto, doCampo);
  });
}

function depoisDoEnvioNoApp(r, papel, texto, doCampo){
  if(r.destino) return seguirPeloErro(r);
  if(r.ok){
    ULTIMO_ENVIO_DA_CONVERSA = null;
    if(doCampo){
      guardarRascunho(papel, "");
      const campo = document.getElementById("campo-conversa");
      if(campo) campo.value = "";
    }
    return atualizarAListaDaConversa();
  }
  /* a conversa fechou com a pessoa escrevendo: a tela diz que não foi, com
     o texto (A18-17) */
  if(r.motivo === "conversa_fechada" && r.situacao === "fechada")
    MENSAGEM_NAO_ENVIADA = { chave:String(E.conversaNaTela || ""), papel:papel, texto:texto };
  if(r.motivo === "conversa_fechada" || r.motivo === "sem_conversa") return atualizarAListaDaConversa();
  /* sem internet, o limite, o resto: a frase embaixo do campo, e o texto fica */
  mostrarErro("conversa-erro", r.erro || "");
}

/* A CONVERSA DO LADO DO CLIENTE (tela 29). Era fixa e abria desde o aceite;
   desde 12/10/2026 segue a regra da conversa (A18): véspera às 18h, até as
   23h59 do dia do serviço. O desenho é o mesmo. */
TELAS.chatProfissional = {
  html: function(){ return telaDaConversa("cliente"); },
  aoEntrar: function(){ aoEntrarNaConversa(); }
};

TELAS.chatSuporte = {
  html: function(){
    return conversa("Suporte Limpah", "Costuma responder em poucos minutos", "#6C3AD8", [
      { de:"ela", texto:"Olá! Aqui é a Camila, do suporte Limpah. Como posso ajudar?", hora:"agora" },
    ],
    '<div style="margin-top:12px">'
    + '<div style="font-size:11.5px;color:var(--suave);font-weight:600;margin-bottom:8px">Assuntos mais comuns</div>'
    + '<div class="fileira">'
    +   ['A profissional não chegou','Preciso remarcar','Problema no pagamento','Qualidade do serviço','Cancelar serviço']
        .map(function(t){
          return '<span class="selo" style="flex:none;cursor:pointer">' + t + '</span>';
        }).join("")
    + '</div></div>');
  }
};


/* --------------------------------------------------------------------------
   ABA: PERFIL
   -------------------------------------------------------------------------- */
TELAS.perfilCliente = {
  html: function(){
    /* quem está logado: na maquete, a cliente de exemplo; no app, o que o
       servidor disse (nome, e-mail e telefone da própria pessoa) */
    const c = FONTE.ler.cliente();
    /* as favoritas: no app, ainda não existem (null = o item nem aparece) */
    const favoritas = FONTE.ler.favoritas();

    const itens = [
      { ic:"📍", nome:"Meus endereços", tela:"minhasCasas", id:"perfil-casas",
        /* null = ainda não se sabe (no app, até as casas chegarem) */
        detalhe: quantasCasas(FONTE.ler.casas()) },
      /* no app, o detalhe não promete Pix e cartão: a tela do pagamento
         diz que ele chega em breve, e as duas dizem o mesmo */
      { ic:"💳", nome:"Formas de pagamento", detalhe: FONTE.ehMaquete ? "Pix e cartão" : "Chega em breve" },
      favoritas ? { ic:"❤️", nome:"Profissionais favoritas", detalhe:favoritas.length + " salvas" } : null,
      { ic:"🔔", nome:"Notificações",        detalhe:"Lembretes e avisos" },
      { ic:"🛟", nome:"Ajuda e suporte",     detalhe:"Fale com a gente" },
      { ic:"📄", nome:"Termos e privacidade", detalhe:"" },
    ];
    let lista = "";
    itens.forEach(function(i){
      if(!i) return;
      lista += '<button class="item" onclick="ir(\'' + idSeguro(i.tela || "chatSuporte") + '\')">'
        + '<div style="font-size:20px;width:28px;text-align:center">' + i.ic + '</div>'
        + '<div class="txt"><b>' + esc(i.nome) + '</b>'
        + ((i.detalhe || i.id) ? '<span' + (i.id ? ' id="' + esc(i.id) + '"' : '') + '>'
           + esc(i.detalhe) + '</span>' : "") + '</div>'
        + '<div class="seta" style="color:var(--suave)">›</div></button>';
    });

    return ''
    + '<div class="cabecalho"><h1>Perfil</h1></div>'
    + '<div class="corpo">'
    +   '<div class="cartao" style="text-align:center">'
    +     '<div style="display:flex;justify-content:center;margin-bottom:10px">' + avatar(c.nome, c.cor, "grande") + '</div>'
    +     '<b style="font-size:17px">' + esc(c.nome) + '</b>'
    +     '<div style="font-size:13px;color:var(--suave);margin-top:4px">' + esc(c.email) + '</div>'
    +     '<div style="font-size:13px;color:var(--suave)">' + esc(c.telefone) + '</div>'
    +   '</div>'
    +   lista
    +   '<button class="btn btn-perigo" style="margin-top:10px" onclick="sairDaConta(this)">Sair da conta</button>'
    +   erroDoCampo("sair-erro", "perfilCliente", "")
    +   soNaMaquete('<div class="rodape-seguro">Limpah · protótipo fictício<br>'
    +     'Nenhum dado real é usado, cobrado ou consultado.</div>')
    + '</div>'
    + abas("perfil");
  },
  /* no app, as casas chegam depois: só a contagem muda, sem redesenhar a
     tela (redesenhar apagaria a frase do "Sair" sem internet) */
  aoEntrar: function(){
    if(FONTE.ler.casas() !== null) return;
    FONTE.carregarCasas(function(r){
      const lugar = document.getElementById("perfil-casas");
      if(r.ok && lugar) lugar.textContent = quantasCasas(FONTE.ler.casas());
    });
  }
};

function quantasCasas(casas){
  if(!casas) return "";
  return casas.length + " cadastrado" + (casas.length === 1 ? "" : "s");
}

/* Sair da conta (o cliente, a diarista, e quem ainda não confirmou o
   celular). Na maquete, esquece quem estava logado. No app, o servidor
   fecha a sessão e o aparelho esquece tudo; sem internet, a pessoa
   continua logada e a frase diz isso — no lugar "sair-erro", que toda
   tela com "Sair da conta" tem. O botão tocado (`botao`, opcional) diz
   "Enviando…" enquanto vai. */
function sairDaConta(botao){
  mostrarErro("sair-erro", "");
  FONTE.sair({}, function(r){
    if(!r.ok) return mostrarErro("sair-erro", r.erro);
    ir("perfil", { limparHistorico:true });
  }, { botao: botao || null });
}
