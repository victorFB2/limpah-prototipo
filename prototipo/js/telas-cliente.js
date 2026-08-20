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
          + '<div class="icone">' + cat.icone + '</div>'
          + '<div class="txt"><b>' + esc(cat.nome) + '</b><span>' + esc(cat.descricao) + '</span></div>'
          + '<div class="seta">›</div></button>';
      } else {
        lista += '<button class="opcao" disabled>'
          + '<div class="icone">' + cat.icone + '</div>'
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
  ir("dataHorario");
}


/* --------------------------------------------------------------------------
   03. DATA E HORÁRIO
   -------------------------------------------------------------------------- */
TELAS.dataHorario = {
  html: function(){
    const dias = proximosDias(14);
    if(!E.pedido.data) E.pedido.data = dias[1].iso;   // amanhã, como no desenho

    let chips = '<div class="fileira">';
    dias.forEach(function(d){
      /* formato da imagem: o nome do dia em cima, a data embaixo - "Hoje 16/05" */
      chips += '<button class="chip-data ' + (E.pedido.data === d.iso ? "marcada" : "") + '" '
        + 'onclick="escolherData(\'' + d.iso + '\')">'
        + '<span>' + esc(d.rotulo) + '</span>'
        + '<b>' + esc(d.curto) + '</b></button>';
    });
    chips += '</div>';

    let periodos = "";
    PERIODOS.forEach(function(p){
      const marcado = E.pedido.periodo === p.id;
      /* a imagem mostra o periodo numa linha so, sem icone: "Manha (8h - 12h)" */
      periodos += '<button class="opcao ' + (marcado ? "marcada" : "") + '" onclick="escolherPeriodo(\'' + p.id + '\')">'
        + '<div class="txt"><b>' + esc(p.nome) + ' (' + esc(p.faixa) + ')</b></div>'
        + (marcado ? '<div class="seta">✓</div>' : "") + '</button>';
    });

    const pronto = !!(E.pedido.data && E.pedido.periodo);

    return ''
    + cabecalho("Data e horário")
    + '<div class="corpo">'
    +   '<h2 class="titulo">Para quando você precisa?</h2>'
    +   chips
    +   '<div class="rotulo">Período</div>'
    +   periodos
    +   '<p class="ajuda">A profissional chega dentro do período escolhido. '
    +     'Você recebe um aviso quando ela estiver a caminho.</p>'
    + '</div>'
    + '<div class="rodape"><button class="btn btn-principal" ' + (pronto ? "" : "disabled")
    +   ' onclick="ir(\'detalhes\')">Continuar</button></div>';
  }
};

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

    let campos = "";
    cat.perguntas.forEach(function(p){
      /* o contador já mostra o nome dentro dele, não precisa de título em cima */
      if(p.tipo !== "contador") campos += '<div class="rotulo">' + esc(p.rotulo) + '</div>';

      if(p.tipo === "opcao"){
        p.opcoes.forEach(function(o){
          const marcado = E.pedido.respostas[p.id] === o.id;
          campos += '<button class="opcao ' + (marcado ? "marcada" : "") + '" '
            + 'onclick="responder(\'' + p.id + '\',\'' + o.id + '\')">'
            + '<div class="icone">' + (o.icone || "•") + '</div>'
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
      previa = '<div class="cartao destaque" style="margin-top:18px">'
        + '<div class="linha"><span class="rot">Duração estimada</span>'
        + '<span class="val">' + conta.horas + ' horas' + (conta.quantidade > 1 ? " (cada uma)" : "") + '</span></div>'
        + '<div class="linha"><span class="rot">Valor estimado</span>'
        + '<span class="val" style="color:var(--roxo)">' + moeda(conta.total) + '</span></div></div>';

      if(conta.sugereDuas){
        previa += '<div class="aviso">⏱️<div><b>Serviço grande para uma pessoa só</b>'
          + 'Pelo que você descreveu, o trabalho passa de 8 horas. '
          + 'Considere pedir duas ' + esc(cat.comoChamamosPlural) + '.</div></div>';
      }
    }

    return ''
    + cabecalho("")
    + '<div class="corpo">'
    +   '<h2 class="titulo">Detalhes do serviço</h2>'
    +   '<p class="apoio">' + esc(cat.nome) + ' · quanto mais preciso, melhor ela se prepara.</p>'
    +   campos + duas + previa
    + '</div>'
    + '<div class="rodape"><button class="btn btn-principal" onclick="depoisDosDetalhes()">Continuar</button></div>';
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

function depoisDosDetalhes(){
  const cat = CATALOGO.find(function(c){ return c.id === E.pedido.categoria; });
  ir(cat.aceitaAdicionais ? "adicionais" : "resumo");
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
        +   '<div class="icone">' + a.icone + '</div>'
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

    let avisoTeto = "";
    if(conta && conta.acimaDoMaximo){
      avisoTeto = '<div class="aviso">⏱️<div><b>Atenção ao tempo</b>'
        + 'Com esses adicionais o serviço passa de 8 horas. '
        + 'Talvez seja melhor deixar alguns para a próxima vez.</div></div>';
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
    +   '<button class="btn btn-principal" onclick="ir(\'resumo\')">'
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
  +     '<span>Total</span><span style="color:var(--roxo)">' + moeda(conta.total) + '</span></div>'
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
      linhasAdicionais += '<div class="linha"><span class="rot">' + a.icone + " " + esc(a.nome) + '</span>'
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
    +     '<div class="linha"><span class="rot">Duração estimada</span><span class="val">' + conta.horas + ' horas</span></div>'
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
    +     '<div class="linha total"><span class="rot">Total</span><span class="val">' + moeda(conta.total) + '</span></div>'
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
    +     '<div class="linha total"><span class="rot">Total a pagar</span>'
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

/* Quando a busca se esgota. A regra de negócio para este caso (quanto tempo
   esperar, ampliar a região, avisar o suporte) ainda precisa ser decidida —
   está anotada no DECISOES.md. */
TELAS.ninguemAceitou = {
  html: function(){
    return ''
    + '<div class="centro">'
    +   '<div class="emojao">😕</div>'
    +   '<h2 class="titulo">Ainda não encontramos ninguém</h2>'
    +   '<p class="apoio">Não conseguimos uma profissional disponível para esse dia e período. '
    +     'Você pode tentar outro horário ou falar com o nosso time.</p>'
    + '</div>'
    + '<div class="rodape">'
    +   '<button class="btn btn-principal" onclick="ir(\'dataHorario\')">Escolher outro horário</button>'
    +   '<button class="btn btn-contorno" onclick="ir(\'chatSuporte\')">Falar com o suporte</button>'
    + '</div>';
  }
};


/* --------------------------------------------------------------------------
   10. SERVIÇO CONFIRMADO
   -------------------------------------------------------------------------- */
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
    +     '<div class="linha"><span class="rot">Duração</span><span class="val">' + p.horas + ' horas</span></div>'
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
    +     '<div class="linha total"><span class="rot">Total</span><span class="val">' + moeda(p.total) + '</span></div>'
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
      { ic:"📍", nome:"Meus endereços",     detalhe:c.endereco.apelido + " · " + c.endereco.bairro },
      { ic:"💳", nome:"Formas de pagamento", detalhe:"Pix e cartão" },
      { ic:"❤️", nome:"Profissionais favoritas", detalhe:favoritas.length + " salvas" },
      { ic:"🔔", nome:"Notificações",        detalhe:"Lembretes e avisos" },
      { ic:"🛟", nome:"Ajuda e suporte",     detalhe:"Fale com a gente" },
      { ic:"📄", nome:"Termos e privacidade", detalhe:"" },
    ];
    let lista = "";
    itens.forEach(function(i){
      lista += '<button class="item" onclick="ir(\'chatSuporte\')">'
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
  E.tela = "perfil";
  E.historico = [];
  salvar();
  ir("perfil", { limparHistorico:true });
}
