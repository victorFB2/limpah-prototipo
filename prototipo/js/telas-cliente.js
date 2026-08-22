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
    const c = E.cliente || CLIENTE_EXEMPLO;
    const proximo = E.pedidos.find(function(p){ return p.situacao === "confirmado"; });

    /* --- próximo serviço --- */
    let blocoProximo;
    if(proximo){
      const prof = PROFISSIONAIS.find(function(x){ return x.id === proximo.profissionalId; });
      blocoProximo = '<button class="item" onclick="abrirPedido(\'' + proximo.id + '\')">'
        + avatar(prof.nome, prof.cor, "pequeno")
        + '<div class="txt"><b>' + esc(nomeCurto(prof.nome)) + '</b>'
        + '<span>' + esc(dataPorExtenso(proximo.data)) + ' · ' + esc(nomePeriodo(proximo.periodo)) + '</span></div>'
        + '<span class="selo verde">Confirmado</span></button>';
    } else {
      blocoProximo = '<div class="cartao" style="display:flex;gap:12px;align-items:center">'
        + '<div style="font-size:26px">📅</div>'
        + '<div><b style="font-size:14px">Nenhum serviço agendado</b>'
        + '<div style="font-size:12.5px;color:var(--suave);margin-top:3px">Que tal agendar para amanhã?</div></div></div>';
    }

    /* --- serviços recentes --- */
    const concluidos = E.pedidos.filter(function(p){ return p.situacao === "concluido"; });
    let blocoRecentes = "";
    if(concluidos.length){
      blocoRecentes = '<div class="rotulo" style="display:flex;justify-content:space-between">'
        + '<span>Serviços recentes</span>'
        + '<a href="#" onclick="trocarAba(\'servicos\');return false;" style="color:var(--roxo);font-weight:600;text-decoration:none;font-size:12.5px">Ver todos</a></div>';
      concluidos.slice(0, 2).forEach(function(p){
        const prof = PROFISSIONAIS.find(function(x){ return x.id === p.profissionalId; });
        blocoRecentes += '<button class="item" onclick="abrirPedido(\'' + p.id + '\')">'
          + avatar(prof.nome, prof.cor, "pequeno")
          + '<div class="txt"><b>' + esc(p.resumoTexto) + '</b>'
          + '<span>' + esc(dataPorExtenso(p.data)) + ' · Concluído · ' + moeda(p.total) + '</span></div></button>';
      });
    }

    /* --- favoritas --- */
    const favoritas = PROFISSIONAIS.filter(function(p){ return E.favoritos.indexOf(p.id) >= 0; });
    let blocoFavoritas = "";
    if(favoritas.length){
      blocoFavoritas = '<div class="rotulo">Suas favoritas ❤️</div><div class="fileira">';
      favoritas.forEach(function(p){
        blocoFavoritas += '<button onclick="abrirPerfil(' + p.id + ')" '
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
    +     '<div style="font-size:12.5px;color:var(--suave)">📍 ' + esc(c.endereco.cidade + ", " + c.endereco.estado) + '</div>'
    +     '<div style="position:relative">' + avatar(c.nome, c.cor, "pequeno")
    +       (E.naoLidas ? '<span style="position:absolute;top:-2px;right:-2px;width:12px;height:12px;'
    +         'background:var(--vermelho);border:2px solid var(--fundo);border-radius:50%"></span>' : "")
    +     '</div>'
    +   '</div>'

    +   '<h2 class="titulo">Olá, ' + esc(c.primeiroNome) + '! 👋<br>O que você precisa hoje?</h2>'

    +   '<button class="btn btn-principal" style="margin:18px 0 22px" onclick="comecarPedido()">Novo serviço</button>'

    +   '<div class="rotulo">Próximo serviço</div>'
    +   blocoProximo
    +   blocoRecentes
    +   blocoFavoritas
    + '</div>'
    + abas("inicio");
  }
};

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
      if(cat.disponivel){
        lista += '<button class="opcao" onclick="escolherCategoria(\'' + cat.id + '\')">'
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
    + '</div>';
  }
};

function escolherCategoria(id){
  const cat = CATALOGO.find(function(c){ return c.id === id; });
  if(!cat || !cat.disponivel) return;

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
     Sem saber o tamanho, o app não tem como oferecer horários que caibam. */
  const casas = (E.cliente && E.cliente.casas) || [];
  if(casas.length === 0)      ir("cadastrarCasa");
  else if(casas.length === 1) usarCasa(casas[0].id);
  else                        ir("escolherCasa");
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
   ========================================================================== */

function cartaoDeCasa(casa, aoTocar, extra){
  return '<button class="item" onclick="' + aoTocar + '">'
    + '<div style="color:var(--roxo);width:26px">'
    +   icone(casa.tipoImovel === "casa" ? "casa" : (casa.tipoImovel === "escritorio" ? "maleta" : "predio"), 21)
    + '</div>'
    + '<div class="txt"><b>' + esc(casa.apelido) + '</b>'
    +   '<span>' + esc(casa.rua) + (casa.bairro ? " · " + esc(casa.bairro) : "")
    +     '<br>' + casa.comodos + ' cômodos · ' + casa.banheiros + ' banheiro'
    +     (casa.banheiros === 1 ? "" : "s") + '</span></div>'
    + (extra || '<div class="seta">›</div>')
    + '</button>';
}


/* ---- 79. QUAL CASA ---- */
TELAS.escolherCasa = {
  html: function(){
    const casas = (E.cliente && E.cliente.casas) || [];
    let lista = "";
    casas.forEach(function(c){
      lista += cartaoDeCasa(c, "usarCasa('" + c.id + "')");
    });

    return ''
    + cabecalho("Qual casa?")
    + '<div class="corpo">'
    +   '<h2 class="titulo">Onde vai ser o serviço?</h2>'
    +   '<p class="apoio">Escolha um dos endereços que você já cadastrou.</p>'
    +   lista
    +   '<button class="btn btn-contorno" style="margin-top:6px" onclick="novaCasa()">'
    +     '+ Cadastrar outro endereço</button>'
    + '</div>';
  }
};


/* ---- 80. CADASTRAR OU EDITAR A CASA ---- */
function novaCasa(){
  E.casaEditando = null;
  salvar();
  ir("cadastrarCasa");
}

function editarCasa(id){
  E.casaEditando = id;
  salvar();
  ir("cadastrarCasa");
}

TELAS.cadastrarCasa = {
  html: function(){
    const casas = (E.cliente && E.cliente.casas) || [];
    const editando = E.casaEditando
      ? casas.find(function(c){ return c.id === E.casaEditando; })
      : null;
    const c = editando || {
      apelido:"", tipoImovel:"apartamento", comodos:3, banheiros:1,
      rua:"", complemento:"", bairro:"", cidade:"São Paulo", estado:"SP", cep:"",
    };
    const primeira = casas.length === 0;

    /* tipo de imóvel */
    let tipos = "";
    TIPOS_DE_IMOVEL.forEach(function(t){
      const marcado = (E.casaRascunhoTipo || c.tipoImovel) === t.id;
      tipos += '<button class="opcao ' + (marcado ? "marcada" : "") + '" '
        + 'onclick="escolherTipoDeImovel(\'' + t.id + '\')" style="margin-bottom:8px">'
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

    +   '<div class="rotulo">Tipo de imóvel</div>'
    +   tipos

    +   '<div class="rotulo">Tamanho</div>'
    +   '<div class="contador">'
    +     '<span class="nome">Número de cômodos</span>'
    +     '<span class="controles">'
    +       '<button onclick="contarNaCasa(\'comodos\',-1)">−</button>'
    +       '<span class="valor" id="casa-comodos">' + (E.casaRascunhoComodos != null ? E.casaRascunhoComodos : c.comodos) + '</span>'
    +       '<button onclick="contarNaCasa(\'comodos\',1)">+</button>'
    +     '</span></div>'
    +   '<p class="ajuda">Conte quartos, sala, cozinha e área de serviço.</p>'
    +   '<div class="contador" style="margin-top:10px">'
    +     '<span class="nome">Banheiros</span>'
    +     '<span class="controles">'
    +       '<button onclick="contarNaCasa(\'banheiros\',-1)">−</button>'
    +       '<span class="valor" id="casa-banheiros">' + (E.casaRascunhoBanheiros != null ? E.casaRascunhoBanheiros : c.banheiros) + '</span>'
    +       '<button onclick="contarNaCasa(\'banheiros\',1)">+</button>'
    +     '</span></div>'

    +   '<div class="rotulo">Endereço</div>'
    +   '<div class="campo"><label>Como você chama este lugar</label>'
    +     '<input id="casa-apelido" type="text" placeholder="Casa, Apartamento, Escritório..." value="' + esc(c.apelido) + '"></div>'
    +   '<div class="campo"><label>CEP</label><input id="casa-cep" type="text" value="' + esc(c.cep) + '"></div>'
    +   '<div class="campo"><label>Endereço</label><input id="casa-rua" type="text" value="' + esc(c.rua) + '"></div>'
    +   '<div class="campo"><label>Complemento</label><input id="casa-comp" type="text" value="' + esc(c.complemento) + '"></div>'
    +   '<div class="campo"><label>Bairro</label><input id="casa-bairro" type="text" value="' + esc(c.bairro) + '"></div>'
    +   '<div class="campo"><label>Cidade e estado</label>'
    +     '<input id="casa-cidade" type="text" value="' + esc(c.cidade + " - " + c.estado) + '"></div>'

    +   '<div class="aviso roxo">🔒<div><b>Sua privacidade</b>'
    +     'O endereço completo só é mostrado à profissional depois que ela aceita o serviço.</div></div>'
    +   '<div id="casa-erro" style="color:var(--vermelho);font-size:13px;font-weight:600"></div>'
    + '</div>'
    + '<div class="rodape">'
    +   '<button class="btn btn-principal" onclick="salvarCasa()">'
    +     (editando ? "Salvar alterações" : "Salvar e continuar") + '</button>'
    +   (editando && casas.length > 1
       ? '<button class="btn btn-perigo" onclick="apagarCasa(\'' + editando.id + '\')">Apagar este endereço</button>'
       : "")
    + '</div>';
  }
};

function escolherTipoDeImovel(id){ E.casaRascunhoTipo = id; salvar(); desenhar(); }

function contarNaCasa(qual, delta){
  const casas = (E.cliente && E.cliente.casas) || [];
  const editando = E.casaEditando ? casas.find(function(c){ return c.id === E.casaEditando; }) : null;
  const limites = { comodos:[1,12], banheiros:[0,6] };
  const chave = qual === "comodos" ? "casaRascunhoComodos" : "casaRascunhoBanheiros";
  const atual = (E[chave] != null) ? E[chave] : (editando ? editando[qual] : (qual === "comodos" ? 3 : 1));
  const novo = atual + delta;
  if(novo < limites[qual][0] || novo > limites[qual][1]) return;
  E[chave] = novo;
  salvar();
  desenhar();
}

function salvarCasa(){
  const valor = function(id){ const e = document.getElementById(id); return e ? e.value.trim() : ""; };
  const apelido = valor("casa-apelido");
  const rua = valor("casa-rua");
  if(apelido.length < 2 || rua.length < 3){
    document.getElementById("casa-erro").textContent =
      "Preencha ao menos como você chama o lugar e o endereço.";
    return;
  }
  const cidadeEstado = (valor("casa-cidade") || "São Paulo - SP").split("-");
  const casas = (E.cliente.casas = E.cliente.casas || []);
  const editando = E.casaEditando ? casas.find(function(c){ return c.id === E.casaEditando; }) : null;

  const dados = {
    apelido: apelido,
    tipoImovel: E.casaRascunhoTipo || (editando ? editando.tipoImovel : "apartamento"),
    comodos:   (E.casaRascunhoComodos   != null) ? E.casaRascunhoComodos   : (editando ? editando.comodos : 3),
    banheiros: (E.casaRascunhoBanheiros != null) ? E.casaRascunhoBanheiros : (editando ? editando.banheiros : 1),
    rua: rua,
    complemento: valor("casa-comp"),
    bairro: valor("casa-bairro"),
    cidade: (cidadeEstado[0] || "").trim(),
    estado: (cidadeEstado[1] || "SP").trim(),
    cep: valor("casa-cep"),
  };

  let id;
  if(editando){
    Object.assign(editando, dados, { veioDoHistorico:false });
    id = editando.id;
  } else {
    id = "casa-" + Date.now();
    casas.push(Object.assign({ id:id }, dados));
  }

  E.casaEditando = null;
  E.casaRascunhoTipo = null;
  E.casaRascunhoComodos = null;
  E.casaRascunhoBanheiros = null;
  salvar();

  /* Se veio de dentro de um pedido, segue o pedido. Senão, volta para a lista. */
  if(E.pedido && E.pedido.categoria && !E.pedido.casaId) usarCasa(id);
  else voltar();
}

function apagarCasa(id){
  const casas = (E.cliente && E.cliente.casas) || [];
  if(casas.length <= 1) return;   // ninguém fica sem nenhuma casa
  const i = casas.findIndex(function(c){ return c.id === id; });
  if(i >= 0) casas.splice(i, 1);
  E.casaEditando = null;
  salvar();
  voltar();
}


/* ---- 81. MINHAS CASAS (dentro do Perfil) ---- */
TELAS.minhasCasas = {
  html: function(){
    const casas = (E.cliente && E.cliente.casas) || [];
    let lista = "";
    casas.forEach(function(c){
      lista += cartaoDeCasa(c, "editarCasa('" + c.id + "')");
    });
    if(!casas.length) lista = '<div class="vazio">Você ainda não cadastrou nenhum endereço.</div>';

    return ''
    + cabecalho("Meus endereços")
    + '<div class="corpo">'
    +   lista
    +   '<p class="ajuda">O tamanho fica guardado aqui. O tipo de limpeza você escolhe '
    +     'a cada pedido — hoje pode ser padrão, no mês que vem completa.</p>'
    + '</div>'
    + '<div class="rodape">'
    +   '<button class="btn btn-principal" onclick="novaCasa()">+ Cadastrar endereço</button>'
    + '</div>';
  }
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
        + 'onclick="escolherData(\'' + hoje.iso + '\')">'
        + '<span>Hoje</span><b>' + esc(hoje.curto) + '</b></button>';
    }

    chips += '<button class="chip-data ' + (escolhida === amanha.iso ? "marcada" : "") + '" '
      + 'onclick="escolherData(\'' + amanha.iso + '\')">'
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
      const serve = periodoAindaServe(escolhida, p.id) && cabeNoDia;

      /* EXCEÇÃO AUTORIZADA Nº 3: os ícones do período. */
      periodos += '<button class="opcao ' + (marcado && serve ? "marcada" : "") + '" '
        + (serve ? 'onclick="escolherPeriodo(\'' + p.id + '\')"' : "disabled")
        + '>'
        + '<div class="icone">' + icone(p.id, 22) + '</div>'
        + '<div class="txt"><b>' + esc(p.nome) + ' · das ' + p.inicio + 'h às '
        +   (p.inicio + janelaHoras) + 'h</b>'
        + (serve ? "" : '<span>'
            + (!cabeNoDia
               ? "uma janela de " + janelaHoras + "h começando aqui passaria das " + FIM_DO_DIA + "h"
               : "a diarista precisa de pelo menos " + ANTECEDENCIA_MINIMA_HORAS
                 + "h para se organizar e chegar até você")
            + '</span>')
        + '</div>'
        + (marcado && serve ? '<div class="seta">✓</div>' : "") + '</button>';
    });

    /* Se o período escolhido deixou de servir, desmarca. */
    if(E.pedido.periodo && !periodoAindaServe(escolhida, E.pedido.periodo)) E.pedido.periodo = null;

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
        + (livre ? 'onclick="escolherDataDoCalendario(\'' + iso + '\')"' : "disabled")
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
            + 'onclick="responder(\'' + p.id + '\',\'' + o.id + '\')">'
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
          +   '<button ' + (v <= p.min ? "disabled" : "") + ' onclick="contar(\'' + p.id + '\',-1)">−</button>'
          +   '<span class="valor">' + v + '</span>'
          +   '<button ' + (v >= p.max ? "disabled" : "") + ' onclick="contar(\'' + p.id + '\',1)">+</button>'
          + '</span></div>';
      }

      if(p.tipo === "texto"){
        campos += '<div class="campo"><textarea id="txt-' + p.id + '" placeholder="' + esc(p.exemplo || "") + '" '
          + 'oninput="anotar(\'' + p.id + '\', this.value)">' + esc(E.pedido.respostas[p.id] || "") + '</textarea></div>';
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
        + 'style="flex-direction:column;align-items:stretch" onclick="alternarAdicional(\'' + a.id + '\')">'
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
    const conta = calcularPedido(E.pedido);
    if(!conta) return TELAS.novoServico.html();
    const c = E.cliente || CLIENTE_EXEMPLO;
    const cat = conta.categoria;

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
          + '<span class="val">' + v + '</span></div>';
      }
    });

    let linhasAdicionais = "";
    conta.adicionais.forEach(function(a){
      linhasAdicionais += '<div class="linha"><span class="rot" style="display:flex;gap:7px;align-items:center">'
        + icone(a.icone, 15) + esc(a.nome) + '</span>'
        + '<span class="val">' + moeda(a.preco) + '</span></div>';
    });

    const obs = E.pedido.respostas.observacoes;

    return ''
    + cabecalho("Confira seu pedido")
    + '<div class="corpo">'

    +   '<div class="cartao">'
    +     '<div style="display:flex;gap:12px;align-items:center;margin-bottom:6px">'
    +       '<div style="font-size:26px">' + cat.icone + '</div>'
    +       '<div><b style="font-size:16px">' + esc(cat.nome) + '</b>'
    +       '<div style="font-size:12.5px;color:var(--suave)">' + esc(cat.descricao) + '</div></div></div>'
    +     detalhes
    +     '<div class="linha"><span class="rot">Data</span><span class="val">' + esc(dataPorExtenso(E.pedido.data)) + '</span></div>'
    +     '<div class="linha"><span class="rot">Período</span><span class="val">' + esc(nomePeriodo(E.pedido.periodo)) + '</span></div>'
    +     '<div class="linha"><span class="rot">'
    +       (conta.quantidade > 1 ? "As duas ficam" : "Ela fica") + ' na sua casa</span>'
    +       '<span class="val">'
    +       esc((janelaDoServico(E.pedido.periodo, conta.horas) || {}).texto || (conta.horas + " horas"))
    +       '</span></div>'
    +     (conta.quantidade > 1
        ? '<div class="linha"><span class="rot">Profissionais</span><span class="val">2 pessoas</span></div>' : "")
    +   '</div>'

    +   '<div class="rotulo">Endereço</div>'
    +   '<div class="cartao" style="display:flex;gap:12px;align-items:flex-start">'
    +     '<div style="font-size:20px">📍</div>'
    +     '<div><b style="font-size:14px">' + esc(c.endereco.apelido) + '</b>'
    +     '<div style="font-size:13px;color:var(--suave);margin-top:3px;line-height:1.5">'
    +       esc(c.endereco.rua) + (c.endereco.complemento ? " · " + esc(c.endereco.complemento) : "") + '<br>'
    +       esc(c.endereco.bairro + ", " + c.endereco.cidade + " - " + c.endereco.estado) + '</div></div></div>'

    +   (obs ? '<div class="rotulo">Suas observações</div><div class="cartao">'
    +     '<div style="font-size:13.5px;line-height:1.55;color:var(--suave)">' + esc(obs) + '</div></div>' : "")

    +   '<div class="rotulo">Valores</div>'
    +   '<div class="cartao">'
    +     '<div class="linha"><span class="rot">' + esc(cat.nome) + ' · ' + conta.horasSemAdicionais + 'h'
    +       (conta.quantidade > 1 ? " × 2 profissionais" : "") + '</span>'
    +       '<span class="val">' + moeda(conta.precoServico) + '</span></div>'
    +     linhasAdicionais
    +     linhaTempoExtra(conta)
    +     '<div class="linha total"><span class="rot">Total'
    +       (conta.quantidade > 1 ? ' <span style="font-weight:600;font-size:12px">(duas diaristas)</span>' : "")
    +       '</span><span class="val">' + moeda(conta.total) + '</span></div>'
    +   '</div>'

    +   '<div class="aviso verde">🛡️<div><b>Pagamento protegido</b>'
    +     'O valor só é liberado para a profissional depois que o serviço é concluído.</div></div>'
    + '</div>'
    + '<div class="rodape"><button class="btn btn-principal" onclick="ir(\'pagamento\')">Ir para o pagamento</button></div>';
  }
};


/* --------------------------------------------------------------------------
   07. PAGAMENTO (simulado)
   -------------------------------------------------------------------------- */
TELAS.pagamento = {
  html: function(){
    const conta = calcularPedido(E.pedido);
    if(!conta) return TELAS.novoServico.html();
    const formas = [
      { id:"pix",     icone:"⚡", nome:"Pix",              detalhe:"Aprovação na hora" },
      { id:"cartao",  icone:"💳", nome:"Cartão de crédito", detalhe:"Visa •••• 4242" },
    ];
    let lista = "";
    formas.forEach(function(f){
      const marcado = E.pedido.pagamento === f.id;
      lista += '<button class="opcao ' + (marcado ? "marcada" : "") + '" onclick="escolherPagamento(\'' + f.id + '\')">'
        + '<div class="icone">' + f.icone + '</div>'
        + '<div class="txt"><b>' + esc(f.nome) + '</b><span>' + esc(f.detalhe) + '</span></div>'
        + (marcado ? '<div class="seta">✓</div>' : "") + '</button>';
    });

    return ''
    + cabecalho("Pagamento")
    + '<div class="corpo">'
    +   '<h2 class="titulo">Como você quer pagar?</h2>'
    +   '<p class="apoio">Só cobramos depois que uma profissional aceitar o serviço.</p>'
    +   lista
    +   '<div class="cartao" style="margin-top:16px">'
    +     '<div class="linha total"><span class="rot">Total a pagar'
    +       (conta.quantidade > 1 ? ' <span style="font-weight:600;font-size:12px">(duas diaristas)</span>' : "")
    +       '</span>'
    +     '<span class="val">' + moeda(conta.total) + '</span></div></div>'
    +   '<div class="aviso roxo">🧪<div><b>Protótipo</b>'
    +     'Nenhuma cobrança de verdade acontece aqui.</div></div>'
    + '</div>'
    + '<div class="rodape"><button class="btn btn-principal" onclick="enviarPedido()">Confirmar pedido</button></div>';
  }
};

function escolherPagamento(id){ E.pedido.pagamento = id; salvar(); desenhar(); }

function enviarPedido(){
  const conta = calcularPedido(E.pedido);
  const pedido = {
    id: "P" + Date.now(),
    criadoEm: new Date().toISOString(),
    categoria: E.pedido.categoria,
    respostas: Object.assign({}, E.pedido.respostas),
    adicionais: E.pedido.adicionais.slice(),
    duasProfissionais: E.pedido.duasProfissionais,
    data: E.pedido.data,
    periodo: E.pedido.periodo,
    pagamento: E.pedido.pagamento,
    /* a conta fica congelada dentro do pedido: o comprovante mostra o que
       foi cobrado no dia, mesmo que a tabela de preços mude depois */
    total: conta.total,
    horas: conta.horas,
    horasSemAdicionais: conta.horasSemAdicionais,
    precoServico: conta.precoServico,
    precoAdicionais: conta.precoAdicionais,
    tempoExtra: conta.tempoExtra,
    mudouDeFaixa: conta.mudouDeFaixa,
    quantidade: conta.quantidade,
    resumoTexto: conta.categoria.nome + " · " + conta.horas + "h",
    situacao: "buscando",
    profissionalId: null,
    recusadas: [],
  };
  E.pedidos.unshift(pedido);
  E.pedidoAtual = pedido.id;
  E.busca = { minutos:0, modo:"normal", jaAvisou:false };   // relógio da régua zerado
  salvar();
  ir("buscando", { limparHistorico:true });
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

   No protótipo o relógio anda acelerado: cada meio segundo vale 1 minuto,
   senão ninguém esperaria meia hora para ver a tela do fim.               */
const REGUA_DA_BUSCA = {
  ampliaRaioAos: 5,
  avisaClienteAos: 15,
  cancelaAos: 30,
  msPorMinutoSimulado: 500,
};

function faseDaBusca(minutos){
  if(minutos < REGUA_DA_BUSCA.ampliaRaioAos)  return "Procurando profissionais perto de você";
  if(minutos < REGUA_DA_BUSCA.avisaClienteAos) return "Ampliando a área de busca";
  return "Continuamos procurando numa área maior";
}

TELAS.buscando = {
  html: function(){
    if(semPedidoEmAndamento()) return TELAS.meusServicos.html();
    const p = pedidoAtual();
    const cat = CATALOGO.find(function(c){ return c.id === p.categoria; });
    const b = E.busca || (E.busca = { minutos:0, modo:"normal" });

    return ''
    + '<div class="centro">'
    +   '<div class="pulsando" style="font-size:70px">🔎</div>'
    +   '<h2 class="titulo">Estamos buscando ' + esc(cat.comoChamamosPlural) + ' para você!</h2>'
    +   '<p class="apoio">Enviamos sua solicitação para profissionais bem avaliadas na sua região. '
    +     'Você recebe a resposta em instantes.</p>'
    +   '<div class="girando roxo"></div>'
    +   '<p id="busca-fase" style="font-size:13px;font-weight:600;color:var(--roxo);margin:10px 0 0">'
    +     esc(faseDaBusca(b.minutos)) + '</p>'
    +   '<p class="ajuda" style="margin-top:2px">Esperando há <span id="busca-minutos">'
    +     b.minutos + '</span> min · tempo médio: 2 a 5 minutos</p>'
    + '</div>'
    + '<div class="rodape">'
    +   '<button class="btn btn-contorno" onclick="trocarAba(\'servicos\')">Acompanhar depois</button>'
    +   (b.modo === "normal"
      ? '<p class="ajuda" style="text-align:center;margin-top:10px">'
      +   '⚙ <a href="#" onclick="simularNinguemAceita();return false;" style="color:var(--suave)">'
      +   'simular: ninguém aceita</a></p>'
      : '<p class="ajuda" style="text-align:center;margin-top:10px">'
      +   'Simulação em curso · cada meio segundo vale 1 minuto</p>')
    + '</div>';
  },

  aoEntrar: function(){
    const b = E.busca;

    /* Caminho normal do protótipo: alguém aceita em 3,5 segundos.
       No app real é aqui que a oportunidade é distribuída às elegíveis. */
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

      const alvoMin  = document.getElementById("busca-minutos");
      const alvoFase = document.getElementById("busca-fase");
      if(alvoMin)  alvoMin.textContent = m;
      if(alvoFase) alvoFase.textContent = faseDaBusca(m);

      if(m >= REGUA_DA_BUSCA.cancelaAos){ salvar(); cancelarPorFaltaDeProfissional(); return; }
      if(m >= REGUA_DA_BUSCA.avisaClienteAos && !E.busca.jaAvisou){
        E.busca.jaAvisou = true;
        salvar();
        ir("buscaDemorando", { limparHistorico:true });
      }
    }, REGUA_DA_BUSCA.msPorMinutoSimulado);
  }
};

function simularNinguemAceita(){
  E.busca.modo = "lento";
  salvar();
  desenhar();
}

/* Aos 15 minutos: o cliente decide. */
TELAS.buscaDemorando = {
  html: function(){
    if(semPedidoEmAndamento()) return TELAS.meusServicos.html();
    const p = pedidoAtual();
    return ''
    + '<div class="corpo">'
    +   '<div class="centro" style="flex:none;padding:24px 6px 6px">'
    +     '<div class="emojao">⏳</div>'
    +     '<h2 class="titulo">Está demorando mais que o normal</h2>'
    +     '<p class="apoio">Já são ' + REGUA_DA_BUSCA.avisaClienteAos + ' minutos procurando e ninguém aceitou ainda. '
    +       'Ampliamos a área de busca, mas quem decide é você.</p>'
    +   '</div>'
    +   '<div class="cartao">'
    +     '<div class="linha"><span class="rot">Serviço</span><span class="val">' + esc(p.resumoTexto) + '</span></div>'
    +     '<div class="linha"><span class="rot">Data</span><span class="val">' + esc(dataPorExtenso(p.data)) + '</span></div>'
    +     '<div class="linha"><span class="rot">Período</span><span class="val">' + esc(nomePeriodo(p.periodo)) + '</span></div>'
    +   '</div>'
    +   '<div class="aviso verde">💚<div><b>Você não paga nada por isso</b>'
    +     'Nenhuma cobrança acontece enquanto não houver uma profissional confirmada. '
    +     'E o preço combinado não sobe.</div></div>'
    + '</div>'
    + '<div class="rodape">'
    +   '<button class="btn btn-principal" onclick="continuarAguardando()">Continuar aguardando</button>'
    +   '<button class="btn btn-claro" onclick="ir(\'dataHorario\')">Mudar data ou período</button>'
    +   '<button class="btn btn-perigo" onclick="cancelarPorEscolhaDoCliente()">Cancelar sem custo</button>'
    + '</div>';
  }
};

function continuarAguardando(){
  E.busca.modo = "lento";
  salvar();
  ir("buscando", { limparHistorico:true });
}

function cancelarPorEscolhaDoCliente(){
  const p = pedidoAtual();
  p.situacao = "cancelado";
  p.motivoCancelamento = "O cliente desistiu durante a busca";
  salvar();
  ir("buscaCancelada", { limparHistorico:true });
}

/* Aos 30 minutos: o sistema desiste sozinho. */
function cancelarPorFaltaDeProfissional(){
  const p = pedidoAtual();
  p.situacao = "cancelado";
  p.motivoCancelamento = "Ninguém aceitou em " + REGUA_DA_BUSCA.cancelaAos + " minutos";
  p.chamadoAberto = true;
  salvar();
  ir("buscaCancelada", { limparHistorico:true });
}

TELAS.buscaCancelada = {
  html: function(){
    if(semPedidoEmAndamento()) return TELAS.meusServicos.html();
    const p = pedidoAtual();
    const automatico = !!p.chamadoAberto;
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
    +   '<div class="aviso verde">💚<div><b>Você não pagou nada</b>'
    +     'Nenhum valor foi cobrado e nenhuma taxa foi gerada.</div></div>'
    +   (automatico
      ? '<div class="aviso roxo">🛟<div><b>Já avisamos nosso time</b>'
      +   'Abrimos um chamado no suporte. Uma pessoa vai procurar uma profissional na mão '
      +   'e entrar em contato com você.</div></div>'
      : "")
    + '</div>'
    + '<div class="rodape">'
    +   '<button class="btn btn-principal" onclick="comecarPedido()">Tentar outro horário</button>'
    +   (automatico ? '<button class="btn btn-claro" onclick="ir(\'chatSuporte\')">Falar com o suporte</button>' : "")
    +   '<button class="btn btn-texto" onclick="trocarAba(\'inicio\')">Voltar ao início</button>'
    + '</div>';
  }
};

function pedidoAtual(){
  return E.pedidos.find(function(p){ return p.id === E.pedidoAtual; }) || E.pedidos[0];
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
  E.naoLidas = 1;
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
    const prof = p && PROFISSIONAIS.find(function(x){ return x.id === p.profissionalId; });
    /* rede de segurança: sem pedido ou sem profissional, esta tela não faz
       sentido — volta para a lista em vez de quebrar na cara do usuário */
    if(!prof) return TELAS.meusServicos.html();

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
      { icone:"💬", texto:"Conversar com " + primeiro,     acao:"ir('chatProfissional')" },
      { icone:"👤", texto:"Ver perfil completo",           acao:"abrirPerfil(" + prof.id + ")" },
      { icone:"📋", texto:"Ver detalhes do pedido",        acao:"abrirPedido('" + p.id + "')" },
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

    /* o perfil dela, resumido */
    +   '<div class="cartao destaque">'
    +     '<div class="pessoa" style="margin-bottom:12px">'
    +       avatar(prof.nome, prof.cor)
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
    +   '<button class="btn btn-contorno" onclick="alternarFavorita(' + prof.id + ')">'
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
    let lista = "";
    if(!E.pedidos.length){
      lista = '<div class="vazio">Você ainda não pediu nenhum serviço.<br>Que tal começar agora?</div>';
    } else {
      E.pedidos.forEach(function(p){
        const prof = PROFISSIONAIS.find(function(x){ return x.id === p.profissionalId; });
        const selo = {
          buscando:  '<span class="selo ambar">Buscando</span>',
          confirmado:'<span class="selo verde">Confirmado</span>',
          concluido: '<span class="selo cinza">Concluído</span>',
          cancelado: '<span class="selo cinza">Cancelado</span>',
        }[p.situacao] || "";
        lista += '<button class="item" onclick="abrirPedido(\'' + p.id + '\')">'
          + (prof ? avatar(prof.nome, prof.cor, "pequeno")
                  : '<div class="avatar pequeno" style="background:#CFC6E6">?</div>')
          + '<div class="txt"><b>' + esc(p.resumoTexto) + '</b>'
          + '<span>' + esc(dataPorExtenso(p.data)) + ' · ' + moeda(p.total) + '</span></div>'
          + selo + '</button>';
      });
    }
    return ''
    + '<div class="cabecalho"><h1>Meus serviços</h1></div>'
    + '<div class="corpo">' + lista + '</div>'
    + abas("servicos");
  }
};

function abrirPedido(id){
  E.pedidoAtual = id;
  salvar();
  ir("detalhePedido");
}

TELAS.detalhePedido = {
  html: function(){
    const p = pedidoAtual();
    if(!p) return '<div class="corpo"><div class="vazio">Pedido não encontrado.</div></div>';
    const prof = PROFISSIONAIS.find(function(x){ return x.id === p.profissionalId; });
    const cat = CATALOGO.find(function(c){ return c.id === p.categoria; });

    let blocoProfissional = "";
    if(prof){
      const ehFavorita = E.favoritos.indexOf(prof.id) >= 0;
      blocoProfissional = '<div class="rotulo">Profissional</div><div class="cartao">'
        + '<div class="pessoa">' + avatar(prof.nome, prof.cor)
        + '<div class="info"><b>' + esc(nomeCurto(prof.nome)) + '</b>'
        + '<span>' + estrelas(prof.nota) + ' · ' + prof.servicos + ' serviços</span></div></div>'
        + '<button class="btn btn-claro" style="margin-top:14px" onclick="abrirPerfil(' + prof.id + ')">'
        + 'Ver perfil completo</button>'
        + '<button class="btn btn-contorno" onclick="alternarFavorita(' + prof.id + ')">'
        + (ehFavorita ? "❤️ Nas suas favoritas" : "🤍 Adicionar aos favoritos") + '</button></div>';
    }

    let acoes = "";
    if(p.situacao === "confirmado"){
      acoes = '<button class="btn btn-principal" onclick="ir(\'chatProfissional\')">Conversar com a profissional</button>'
        + '<button class="btn btn-claro" onclick="ir(\'chatSuporte\')">Falar com o suporte</button>'
        + '<button class="btn btn-perigo" onclick="ir(\'cancelarPedido\')">Cancelar serviço</button>';
    } else if(p.situacao === "buscando"){
      acoes = '<button class="btn btn-claro" onclick="ir(\'chatSuporte\')">Falar com o suporte</button>'
        + '<button class="btn btn-perigo" onclick="ir(\'cancelarPedido\')">Cancelar pedido</button>';
    } else {
      acoes = '<button class="btn btn-principal" onclick="comecarPedido()">Pedir novamente</button>';
    }

    return ''
    + cabecalho("Detalhes do pedido")
    + '<div class="corpo">'
    +   '<div class="cartao">'
    +     '<div style="display:flex;gap:12px;align-items:center;margin-bottom:8px">'
    +       '<div style="font-size:26px">' + cat.icone + '</div>'
    +       '<div style="flex:1"><b style="font-size:16px">' + esc(cat.nome) + '</b></div>'
    +     '</div>'
    +     '<div class="linha"><span class="rot">Data</span><span class="val">' + esc(dataPorExtenso(p.data)) + '</span></div>'
    +     '<div class="linha"><span class="rot">Período</span><span class="val">' + esc(nomePeriodo(p.periodo)) + '</span></div>'
    +     '<div class="linha"><span class="rot">'
    +       ((p.quantidade > 1) ? "As duas ficam" : "Ela fica") + ' na sua casa</span>'
    +       '<span class="val">'
    +       esc((janelaDoServico(p.periodo, p.horas) || {}).texto || (p.horas + " horas"))
    +       '</span></div>'
    +   '</div>'

    /* o comprovante: a mesma quebra de valores que ele viu ao pedir */
    +   '<div class="rotulo">Valores</div>'
    +   '<div class="cartao">'
    +     '<div class="linha"><span class="rot">' + esc(cat.nome) + ' · '
    +       (p.horasSemAdicionais || p.horas) + 'h'
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
  }
};

function alternarFavorita(id){
  const i = E.favoritos.indexOf(id);
  if(i >= 0) E.favoritos.splice(i, 1); else E.favoritos.push(id);
  salvar(); desenhar();
}

TELAS.cancelarPedido = {
  html: function(){
    return ''
    + cabecalho("Cancelar serviço")
    + '<div class="corpo">'
    +   '<div class="centro" style="flex:none;padding:20px 0">'
    +     '<div class="emojao">🤔</div>'
    +     '<h2 class="titulo">Tem certeza que quer cancelar?</h2>'
    +     '<p class="apoio">A profissional já reservou esse horário na agenda dela.</p>'
    +   '</div>'
    +   '<div class="aviso">📌<div><b>Política de cancelamento</b>'
    +     'As regras de prazo e cobrança ainda serão definidas pelo dono do projeto. '
    +     'Neste protótipo, o cancelamento é sempre gratuito.</div></div>'
    + '</div>'
    + '<div class="rodape">'
    +   '<button class="btn btn-contorno" onclick="voltar()">Manter o serviço</button>'
    +   '<button class="btn btn-perigo" onclick="confirmarCancelamento()">Sim, cancelar</button>'
    + '</div>';
  }
};

function confirmarCancelamento(){
  const p = pedidoAtual();
  p.situacao = "cancelado";
  salvar();
  trocarAba("servicos");
}


/* --------------------------------------------------------------------------
   ABA: MENSAGENS
   -------------------------------------------------------------------------- */
TELAS.mensagens = {
  html: function(){
    const p = E.pedidos.find(function(x){ return x.situacao === "confirmado"; });
    const prof = p ? PROFISSIONAIS.find(function(x){ return x.id === p.profissionalId; }) : null;

    let lista = "";
    if(prof){
      lista += '<button class="item" onclick="ir(\'chatProfissional\')">'
        + avatar(prof.nome, prof.cor, "pequeno")
        + '<div class="txt"><b>' + esc(nomeCurto(prof.nome)) + '</b>'
        + '<span>Combinado! Chego dentro do período. 😊</span></div>'
        + (E.naoLidas ? '<span class="selo verde">' + E.naoLidas + '</span>' : "") + '</button>';
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
};

/* Monta uma conversa. As mensagens são fixas — é um protótipo. */
function conversa(titulo, subtitulo, cor, mensagens, respostas){
  let baloes = "";
  mensagens.forEach(function(m){
    const minha = m.de === "eu";
    baloes += '<div style="display:flex;justify-content:' + (minha ? "flex-end" : "flex-start") + ';margin-bottom:10px">'
      + '<div style="max-width:76%;background:' + (minha ? "var(--roxo)" : "var(--branco)") + ';'
      + 'color:' + (minha ? "#fff" : "var(--texto)") + ';padding:11px 14px;border-radius:16px;'
      + 'border-bottom-' + (minha ? "right" : "left") + '-radius:5px;font-size:14px;line-height:1.5;'
      + 'box-shadow:var(--sombra)">' + esc(m.texto)
      + '<div style="font-size:10.5px;opacity:.6;margin-top:5px;text-align:right">' + esc(m.hora) + '</div>'
      + '</div></div>';
  });

  return ''
  + '<div class="cabecalho">'
  +   '<button class="voltar" onclick="voltar()">‹</button>'
  +   '<div class="pessoa"><div class="avatar pequeno" style="background:' + cor + '">' + esc(iniciais(titulo)) + '</div>'
  +   '<div class="info"><b style="font-size:15px">' + esc(titulo) + '</b>'
  +   '<span style="font-size:11.5px">' + esc(subtitulo) + '</span></div></div>'
  + '</div>'
  + '<div class="corpo" style="background:var(--fundo)">' + baloes + '</div>'
  + '<div class="rodape">'
  +   '<div style="display:flex;gap:8px">'
  +     '<input type="text" placeholder="Escreva uma mensagem..." style="flex:1;border:1.5px solid var(--borda);'
  /* 16px de propósito: com menos, o iPhone dá zoom na página ao tocar no campo */
  +       'background:var(--branco);border-radius:24px;padding:13px 16px;font-size:16px;font-family:inherit">'
  +     '<button class="btn btn-principal" style="width:50px;padding:0;border-radius:50%">➤</button>'
  +   '</div>'
  +   (respostas || "")
  + '</div>';
}

TELAS.chatProfissional = {
  html: function(){
    const p = E.pedidos.find(function(x){ return x.situacao === "confirmado"; }) || E.pedidos[0];
    const prof = (p && p.profissionalId)
      ? PROFISSIONAIS.find(function(x){ return x.id === p.profissionalId; })
      : PROFISSIONAIS[0];
    E.naoLidas = 0; salvar();

    const quando = p ? ("Serviço em " + dataPorExtenso(p.data)) : "Conversa";

    return conversa(nomeCurto(prof.nome), quando, prof.cor, [
      { de:"ela", texto:"Oi! Aceitei seu pedido, pode contar comigo. 😊", hora:"14:32" },
      { de:"ela", texto:"Você prefere que eu comece pela cozinha ou pelos quartos?", hora:"14:32" },
      { de:"eu",  texto:"Oi! Pode começar pela cozinha, por favor.", hora:"14:35" },
      { de:"ela", texto:"Combinado! Chego dentro do período. Até amanhã!", hora:"14:36" },
    ]);
  }
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
    const c = E.cliente || CLIENTE_EXEMPLO;
    const favoritas = PROFISSIONAIS.filter(function(p){ return E.favoritos.indexOf(p.id) >= 0; });

    const itens = [
      { ic:"📍", nome:"Meus endereços", tela:"minhasCasas",
        detalhe: ((c.casas || []).length || 0) + " cadastrado" + (((c.casas || []).length === 1) ? "" : "s") },
      { ic:"💳", nome:"Formas de pagamento", detalhe:"Pix e cartão" },
      { ic:"❤️", nome:"Profissionais favoritas", detalhe:favoritas.length + " salvas" },
      { ic:"🔔", nome:"Notificações",        detalhe:"Lembretes e avisos" },
      { ic:"🛟", nome:"Ajuda e suporte",     detalhe:"Fale com a gente" },
      { ic:"📄", nome:"Termos e privacidade", detalhe:"" },
    ];
    let lista = "";
    itens.forEach(function(i){
      lista += '<button class="item" onclick="ir(\'' + (i.tela || "chatSuporte") + '\')">'
        + '<div style="font-size:20px;width:28px;text-align:center">' + i.ic + '</div>'
        + '<div class="txt"><b>' + esc(i.nome) + '</b>'
        + (i.detalhe ? '<span>' + esc(i.detalhe) + '</span>' : "") + '</div>'
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
    +   '<button class="btn btn-perigo" style="margin-top:10px" onclick="sairDaConta()">Sair da conta</button>'
    +   '<div class="rodape-seguro">Limpah · protótipo fictício<br>'
    +     'Nenhum dado real é usado, cobrado ou consultado.</div>'
    + '</div>'
    + abas("perfil");
  }
};

function sairDaConta(){
  E.logado = false;
  E.perfil = null;          // senão o próximo login herda o lado anterior
  E.tela = "perfil";
  E.historico = [];
  salvar();
  ir("perfil", { limparHistorico:true });
}
