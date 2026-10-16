/* ==========================================================================
   LIMPAH — A TOMADA DA MAQUETE

   As telas não sabem de onde vêm os dados. Elas pedem à FONTE: "quais são
   os bairros?", "com que estado o app começa?". Na maquete, quem responde
   é este arquivo, com os exemplos do exemplos.js e o que ficou guardado
   neste aparelho. Nada aqui fala com a internet.

   Como funciona, para quem for mexer:

   - LEITURAS ficam em FONTE.ler: a tela pede, a leitura monta o dado.
     A tela só mostra o que veio — não lê exemplo, não calcula dinheiro e
     não decide horário.
   - AÇÕES (criar conta, salvar casa, enviar pedido...) entram aqui uma a
     uma, quando cada tela for ligada: FONTE.x(dados, pronto). Na maquete o
     `pronto` é chamado na hora, antes de a ação terminar — é isso que
     mantém os testes da maquete funcionando. Por isso a chamada à FONTE é
     sempre a ÚLTIMA instrução da ação.
   - Na maquete, nada é recusado: toda ação dá certo. As frases de erro
     são do app (a tomada dele).
   ========================================================================== */

/* "Mandar de novo" o código: na maquete, também depois de 1 minuto, só
   para a tela se comportar como a do app. Fica na memória: recarregar a
   página libera o botão. */
const ESPERA_PARA_MANDAR_DE_NOVO_NA_MAQUETE_MS = 60000;
let CODIGO_DA_MAQUETE_PODE_MANDAR_EM = 0;

/* O mesmo minuto para o "Mandar de novo" do código da senha nova. */
let CODIGO_DA_SENHA_NA_MAQUETE_PODE_MANDAR_EM = 0;

/* Quem acabou de criar a conta vê "Conta criada!" depois do código. */
let CONTA_DA_MAQUETE_ACABOU_DE_NASCER = false;

/* Quem tocou em "corrigir o número" volta ao passo 1 com o que tinha
   digitado. Só na memória, e só até o próximo "Continuar". */
let RASCUNHO_DA_CORRECAO_NA_MAQUETE = null;

/* "Mudar data ou período" para o mesmo dia e período do pedido de agora:
   a mesma frase do servidor (rotas/pedidos.py; um teste compara). */
const FRASE_MESMO_HORARIO_DO_ANTERIOR_NA_MAQUETE =
  "Este é o dia e o período do seu pedido de agora. Escolha outro dia ou outro período.";

const FONTE = {
  ehMaquete: true,

  /* Para onde a splash leva, e quando. Na maquete: depois de 1,8 segundo,
     pelo que ficou guardado neste aparelho (já usou = início; senão, a
     escolha de perfil). Nunca falha: aqui não há internet para cair. */
  arranque: function(pronto){
    agendar(function(){
      pronto({ ok:true, destino: E.logado ? "home" : "perfil" });
    }, 1800);
  },

  /* ENTRAR: na maquete, qualquer coisa entra — com a conta de exemplo, se
     ninguém se cadastrou neste aparelho. */
  entrar: function(d, pronto){
    E.logado = true;
    E.perfil = E.perfil || "cliente";
    E.cliente = E.cliente || Object.assign({}, CLIENTE_EXEMPLO, {
      casas: [Object.assign({}, CASA_EXEMPLO)],
    });
    salvar();
    pronto({ ok:true, destino: E.perfil === "diarista" ? "diaristaHome" : "home" });
  },

  /* "Entrar com Google/Apple": na maquete, entra como o "Entrar". */
  entrarCom: function(qual, pronto){
    FONTE.entrar({}, pronto);
  },

  /* CADASTRO, passo 1. Do cliente: a cliente de exemplo, com o que foi
     digitado por cima. Da diarista: uma diarista NOVA, com o que ela
     digitou — como o cliente, cada cadastro começa do zero. Antes, a conta
     nova herdava a diarista que já tinha usado este aparelho (aprovada, com
     os bairros e a chave "Disponível") e pulava "Onde você quer
     trabalhar?" (segunda revisão da 3a). A senha não é usada. */
  comecarCadastro: function(d, pronto){
    RASCUNHO_DA_CORRECAO_NA_MAQUETE = null;
    if(d.papel === "diarista"){
      E.diarista = Object.assign(diaristaNova(), {
        nome: d.nome,
        email: d.email || "",
        telefone: d.telefone,
      });
      salvar();
      pronto({ ok:true });
      return;
    }
    E.cliente = Object.assign({}, CLIENTE_EXEMPLO, {
      nome: d.nome,
      primeiroNome: String(d.nome || "").split(/\s+/)[0],
      email: d.email,
      telefone: d.telefone || CLIENTE_EXEMPLO.telefone,
    });
    salvar();
    pronto({ ok:true });
  },

  /* passo 2: o endereço fica na cliente, com a rua e o número juntos na
     rua, como as outras telas da maquete sempre leram */
  guardarEnderecoDoCadastro: function(endereco, pronto){
    if(E.cliente){
      E.cliente.endereco = {
        apelido: endereco.apelido, cep: endereco.cep,
        rua: juntarRuaENumero(endereco.logradouro, endereco.numero),
        complemento: endereco.complemento, bairro: endereco.bairro,
        cidade: endereco.cidade, estado: endereco.estado,
      };
    }
    salvar();
    pronto({ ok:true });
  },

  /* o fim do cadastro: a conta "nasce" e o "código" sai na hora. A da
     diarista fecha a primeira metade do Portão 1 (os dados). */
  criarConta: function(d, pronto){
    E.logado = true;
    E.perfil = (d.papel === "diarista") ? "diarista" : "cliente";
    if(E.perfil === "diarista") euSouDiarista().feito.dados = true;
    salvar();
    CONTA_DA_MAQUETE_ACABOU_DE_NASCER = true;
    CODIGO_DA_MAQUETE_PODE_MANDAR_EM = Date.now() + ESPERA_PARA_MANDAR_DE_NOVO_NA_MAQUETE_MS;
    pronto({ ok:true, destino:"codigoCelular" });
  },

  /* O código do celular: qualquer código de 6 números serve. A diarista
     que ainda não escolheu os bairros segue para eles (o fim do Portão 1);
     o cliente que acabou de nascer vê "Conta criada!". */
  confirmarCelular: function(d, pronto){
    let destino;
    if(E.perfil === "diarista") destino = euSouDiarista().feito.regiao ? "diaristaHome" : "diaristaRegiao";
    else destino = CONTA_DA_MAQUETE_ACABOU_DE_NASCER ? "boasVindas" : "home";
    CONTA_DA_MAQUETE_ACABOU_DE_NASCER = false;
    pronto({ ok:true, destino:destino });
  },

  reenviarCodigo: function(d, pronto){
    CODIGO_DA_MAQUETE_PODE_MANDAR_EM = Date.now() + ESPERA_PARA_MANDAR_DE_NOVO_NA_MAQUETE_MS;
    pronto({ ok:true });
  },

  /* ESQUECI A SENHA (R28): na maquete, nenhum código sai — a tela segue,
     como seguiria no app, com e sem conta. "Mandar de novo" também só
     depois de 1 minuto, só para a tela se comportar como a do app. */
  pedirCodigoDaSenha: function(d, pronto){
    /* o campo vazio ouve o mesmo que no app (revisão da 4) */
    if(!String(d.emailOuTelefone || "").trim())
      return pronto({ ok:false, campo:"email_ou_telefone", erro:FRASE_DIGITE_O_CONTATO });
    CODIGO_DA_SENHA_NA_MAQUETE_PODE_MANDAR_EM = Date.now() + ESPERA_PARA_MANDAR_DE_NOVO_NA_MAQUETE_MS;
    pronto({ ok:true });
  },

  /* A senha nova: na maquete, qualquer código de 6 números serve, e a
     pessoa entra como no "Entrar" (com a conta de exemplo, se ninguém se
     cadastrou neste aparelho). Nenhuma senha é guardada. */
  trocarSenha: function(d, pronto){
    FONTE.entrar({}, pronto);
  },

  /* Os termos mudaram: aceitar e seguir para o início. */
  aceitarTermos: function(d, pronto){
    pronto({ ok:true, destino: E.perfil === "diarista" ? "diaristaHome" : "home" });
  },

  /* Sair: o aparelho esquece quem estava logado. */
  sair: function(d, pronto){
    E.logado = false;
    E.perfil = null;          // senão o próximo login herda o lado anterior
    E.tela = "perfil";
    E.historico = [];
    salvar();
    pronto({ ok:true });
  },

  /* "Número errado? Corrigir o número", na tela do código: de volta ao
     passo 1, com o que foi digitado, para corrigir o número (só ele: o
     nome e o e-mail aparecem sem deixar mexer, como no app). */
  corrigirNumero: function(d, pronto){
    const papel = (E.perfil === "diarista") ? "diarista" : "cliente";
    const c = (papel === "diarista" ? E.diarista : E.cliente) || {};
    const passo1 = (papel === "diarista") ? "cadastroDiarista" : "cadastroCliente";
    RASCUNHO_DA_CORRECAO_NA_MAQUETE = { papel:papel, nome:c.nome || "", email:c.email || "",
                                        telefone:c.telefone || "", soONumero:true };
    pronto({ ok:true, destino:passo1,
             aviso:{ tela:passo1, campo:"telefone",
                     erro:"Confira o número e corrija. O código vai para o celular que estiver aqui.",
                     senhaDeNovo:true } });
  },

  /* A pessoa mudou de tela. Na maquete, o cadastro de mentira fica
     guardado como sempre ficou; só a correção do número é esquecida quando
     ela sai do passo 1. */
  mudouDeTela: function(de){
    if(de === "cadastroCliente" || de === "cadastroDiarista") RASCUNHO_DA_CORRECAO_NA_MAQUETE = null;
  },

  /* OS BAIRROS DELA (o fim do Portão 1): na maquete, nela mesma, na hora. */
  salvarBairros: function(d, pronto){
    const dela = euSouDiarista();
    dela.bairros = d.bairros.slice();
    dela.regiao = dela.bairros.join(", ");
    dela.feito.regiao = true;
    salvar();
    pronto({ ok:true });
  },

  /* AS CASAS. Na maquete elas moram na cliente, neste aparelho, e já estão
     sempre "carregadas": as duas leituras abaixo respondem na hora. */
  carregarCasas: function(pronto){
    pronto({ ok:true });
  },

  /* Os bairros atendidos: os de exemplo, sempre à mão. */
  carregarArea: function(pronto){
    pronto({ ok:true });
  },

  /* A situação dela na análise (entrega 5a): na maquete, a trilha de
     mentira deste aparelho já está sempre à mão (ler.decisaoDaEquipe e
     ler.conversaComAEquipe). */
  carregarSituacao: function(pronto){
    pronto({ ok:true });
  },

  /* A resposta dela à última decisão da equipe: entra na trilha deste
     aparelho, com a mesma conta do servidor (até RESPOSTAS_POR_DECISAO por
     decisão, só às que tiram ou negam o acesso: situacaoPelaTrilha). */
  responderAEquipe: function(d, pronto){
    const dela = FONTE.ler.diarista();
    const texto = String((d && d.texto) || "").trim().slice(0, RESPOSTA_MAXIMA);
    const s = situacaoPelaTrilha(dela.trilha);
    if(!texto) return pronto({ ok:false, erro:"Escreva a sua resposta antes de enviar." });
    if(!s.decisao || !s.decisao.podeResponder)
      return pronto({ ok:false, erro:"Não há decisão da equipe para responder agora." });
    acrescentarNaTrilhaDaMaquete(dela, { tipo:"respondeu", texto:texto, emRespostaA:s.decisao.id });
    salvar();
    pronto({ ok:true });
  },

  /* As oportunidades dela (a lista e uma só): na maquete, as de exemplo já
     estão sempre à mão (ler.oportunidades). */
  carregarOportunidades: function(pronto){
    pronto({ ok:true });
  },
  carregarOportunidade: function(id, pronto){
    pronto({ ok:true });
  },

  /* A chave "Disponível": na maquete, fica neste aparelho. */
  ficarDisponivel: function(d, pronto){
    FONTE.ler.diarista().disponivel = !!(d && d.disponivel);
    pronto({ ok:true });
  },

  /* "Meus dias de trabalho": a grade inteira, a cada toque, fica neste
     aparelho (no app, no servidor: entrega 6c). */
  salvarDiasDeTrabalho: function(d, pronto){
    FONTE.ler.diarista().diasDeTrabalho = JSON.parse(JSON.stringify((d && d.dias) || {}));
    salvar();
    pronto({ ok:true });
  },

  /* O aceite, na maquete: confere outra vez a agenda deste aparelho (entre
     ver e tocar, ela pode ter aceitado outro pedido pelo alerta) e anota o
     serviço nela. É isto que faz o próximo pedido do mesmo horário parar de
     aparecer. */
  aceitarOportunidade: function(o, pronto){
    const d = FONTE.ler.diarista();
    const veredito = cabeNaAgenda(o, d.agenda);
    if(!veredito.cabe) return pronto({ ok:false, erro:veredito.motivo, motivo:"agenda" });
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
    pronto({ ok:true, aceito:{ oportunidadeId:o.id, data:o.data } });
  },

  /* A agenda dela: na maquete, já está neste aparelho (ler.agenda). */
  carregarAgenda: function(pronto){
    pronto({ ok:true });
  },

  /* Os ganhos dela (no app, 7, vêm do servidor): na maquete já estão neste
     aparelho e nos exemplos (ler.ganhos). */
  carregarGanhos: function(pronto){
    pronto({ ok:true });
  },

  /* O detalhe de um serviço (no app, 6b, vem do servidor): na maquete a tela
     o monta da agenda, que já está neste aparelho. */
  carregarServico: function(a, pronto){
    pronto({ ok:true });
  },

  /* Salvar a casa (nova ou trocada). Na maquete, a rua e o número ficam
     juntos na rua, como sempre ficaram ("Rua das Flores, 123"): as outras
     telas da maquete leem a rua assim. Nada é recusado. */
  salvarCasa: function(d, pronto){
    E.cliente = E.cliente || Object.assign({}, CLIENTE_EXEMPLO);
    const casas = (E.cliente.casas = E.cliente.casas || []);
    const editando = d.id ? casas.find(function(c){ return c.id === d.id; }) : null;
    const dados = {
      apelido: d.apelido, tipoImovel: d.tipoImovel, comodos: d.comodos, banheiros: d.banheiros,
      rua: juntarRuaENumero(d.logradouro, d.numero), complemento: d.complemento,
      bairro: d.bairro, cidade: d.cidade, estado: d.estado, cep: d.cep,
    };
    let id;
    if(editando){
      Object.assign(editando, dados, { veioDoHistorico:false });
      id = editando.id;
    } else {
      id = "casa-" + Date.now();
      casas.push(Object.assign({ id:id }, dados));
    }
    salvar();
    pronto({ ok:true, id:id });
  },

  /* Apagar a casa: sai da lista da cliente. */
  apagarCasa: function(id, pronto){
    const casas = (E.cliente && E.cliente.casas) || [];
    const i = casas.findIndex(function(c){ return c.id === id; });
    if(i >= 0) casas.splice(i, 1);
    salvar();
    pronto({ ok:true });
  },

  /* OS PEDIDOS. Na maquete eles moram neste aparelho (E.pedidos) e já
     estão sempre à mão; a conta é a do motor da maquete (calcularPedido,
     no dados.js), feita na hora. */
  carregarPedidos: function(pronto){
    pronto({ ok:true });
  },

  /* A conta do resumo: na maquete, já está pronta (ler.simulacao). */
  simularPedido: function(pedido, pronto){
    pronto({ ok:true });
  },

  /* Confirmar o pedido. Na maquete o pagamento é de mentira e passa na
     hora: o pedido nasce "buscando", e a busca começa. A conta fica
     congelada dentro do pedido. */
  enviarPedido: function(d, pronto){
    /* "Mudar data ou período" (A25): o pedido de antes cai agora, junto
       com o nascimento deste — como o servidor faz no app. Se uma
       profissional já o confirmou, ele fica, e este não nasce. */
    if(d.substitui){
      const antes = (E.pedidos || []).find(function(x){ return x.id === d.substitui; });
      if(antes && antes.situacao === "confirmado")
        return pronto({ ok:false, erro:"Uma profissional aceitou o seu pedido anterior enquanto "
                                       + "você escolhia: ele continua de pé. Veja em Meus serviços." });
      /* o mesmo dia, período e casa do de antes não muda nada (a tela já
         não deixa escolher; o servidor recusa igual) */
      if(antes && antes.situacao !== "cancelado" && antes.situacao !== "concluido"
         && antes.data === d.data && antes.periodo === d.periodo
         && String(antes.casaId) === String(d.casaId))
        return pronto({ ok:false, campo:"quando", erro:FRASE_MESMO_HORARIO_DO_ANTERIOR_NA_MAQUETE });
      if(antes && antes.situacao !== "cancelado" && antes.situacao !== "concluido"){
        antes.situacao = "cancelado";
        antes.motivoDoCancelamento = "cliente";
      }
    }
    const pedido = pedidoDaMaquete(d, "buscando");
    E.pedidos.unshift(pedido);
    E.pedidoAtual = pedido.id;
    E.busca = { minutos:0, modo:"normal", jaAvisou:false };   // relógio da régua zerado
    salvar();
    pronto({ ok:true, id:pedido.id, destino:"buscando" });
  },

  /* Cancelar: na maquete, sempre sem custo. */
  cancelarPedido: function(id, pronto){
    const p = (E.pedidos || []).find(function(x){ return x.id === id; });
    if(p){
      p.situacao = "cancelado";
      p.motivoDoCancelamento = "cliente";
    }
    salvar();
    pronto({ ok:true });
  },

  /* Um pedido, de novo: na maquete ele mora no aparelho, sempre em dia. */
  carregarPedido: function(id, pronto){
    pronto({ ok:true });
  },

  /* Pagar um pedido que espera o pagamento. Na maquete o pagamento é a tela
     de Pix e cartão, e o botão deste caminho nem aparece (ler.podePagar);
     se for chamado, o pedido vai para a busca, como no app. */
  pagarPedido: function(id, pronto){
    const p = (E.pedidos || []).find(function(x){ return x.id === id; });
    if(p && p.situacao === "aguardando_pagamento"){
      p.situacao = "buscando";
      E.busca = { minutos:0, modo:"normal", jaAvisou:false };   // relógio da régua zerado
    }
    E.pedidoAtual = id;
    salvar();
    pronto({ ok:true });
  },

  ler: {
    /* Com que estado o app começa: duas favoritas e uma mensagem não lida,
       para a home da maquete não abrir vazia. Cópia nova a cada vez: a
       lista de favoritas é alterada no lugar. */
    estadoInicial: function(){
      return {
        favoritos: ESTADO_INICIAL_DE_EXEMPLO.favoritos.slice(),
        naoLidas: ESTADO_INICIAL_DE_EXEMPLO.naoLidas,
      };
    },

    /* Os bairros que a diarista pode escolher. */
    bairros: function(){
      return BAIRROS_DE_EXEMPLO.slice();
    },

    /* A diarista que está usando: a deste aparelho (criada na primeira vez). */
    diarista: function(){
      if(!E.diarista) E.diarista = diaristaNova();
      return E.diarista;
    },

    /* O estado dela (R24): a regra pura do dados.js, a mesma do servidor.
       Na maquete o celular está confirmado e os termos em dia — a não ser
       que um teste diga o contrário (celularConfirmado / termosEmDia). */
    estadoDaDiarista: function(){
      const d = FONTE.ler.diarista();
      const celular = d.celularConfirmado !== false;
      const termos = d.termosEmDia !== false;
      return Object.assign(estadoDaDiarista(d, celular, termos),
                           { celularConfirmado:celular, termosEmDia:termos });
    },

    /* A última decisão da equipe sobre ela, com o que a equipe escreveu:
       na maquete, da trilha de mentira deste aparelho, que só os
       simuladores do quadro "NA MAQUETE" preenchem (sem eles, nada). */
    decisaoDaEquipe: function(){
      return situacaoPelaTrilha(FONTE.ler.diarista().trilha).decisao;
    },

    /* A conversa inteira com a equipe (decisões e respostas), da mais
       velha para a mais nova. Na maquete, nunca "ainda não chegou". */
    conversaComAEquipe: function(){
      return situacaoPelaTrilha(FONTE.ler.diarista().trilha).historico;
    },

    /* As oportunidades da região dela: as de exemplo, com o valor dela e o
       veredito da agenda (todasAsOportunidades, telas-diarista.js). */
    oportunidades: function(){
      return todasAsOportunidades();
    },

    /* O que ela aceitou: a agenda deste aparelho (nunca "ainda não chegou"). */
    agenda: function(){
      return FONTE.ler.diarista().agenda || [];
    },

    /* Os ganhos dela: o que aceitou e ainda não fez (a agenda deste
       aparelho) e o que já fez (os de exemplo, de dias atrás, e os da
       agenda cuja janela terminou), no formato cru da agenda. Na maquete o
       Pix existe (pagamentoLigado), e as somas e os recortes são contados
       pelas telas. Nunca "ainda não chegou". */
    ganhos: function(){
      const agenda = FONTE.ler.agenda();
      const exemplos = SERVICOS_FEITOS_DE_EXEMPLO.map(function(c){
        const conta = calcularPedido(c.pedido);
        const janela = janelaDoServico(c.periodo, conta.horas);
        return { data: isoDeHaDias(c.haDias), inicio: janela.inicio, fim: janela.fim,
                 bairro: c.bairro, km: c.km, endereco: c.rua, pedido: c.pedido, exemplo: true };
      });
      return {
        pagamentoLigado: true,
        aReceber: agenda.filter(function(s){ return !servicoJaTerminou(s); }),
        feitos: exemplos.concat(agenda.filter(servicoJaTerminou)),
      };
    },

    /* O detalhe pronto do servidor (no app, 6b). Na maquete não há: a tela
       o monta da agenda (servicoAberto, no telas-diarista.js). */
    servicoAberto: function(){
      return null;
    },

    /* Onde o app atende (a tela "Onde atendemos" e a lista de bairros do
       endereço): na maquete, os bairros de exemplo, da cidade de exemplo. */
    areaAtendida: function(){
      const partes = CIDADE_DAS_OPORTUNIDADES.split(" - ");
      return { cidade: partes[0], uf: partes[1] || "", bairros: BAIRROS_DE_EXEMPLO.slice() };
    },

    /* As casas da cliente (nunca "ainda não se sabe": moram no aparelho). */
    casas: function(){
      return (E.cliente && E.cliente.casas) || [];
    },

    /* Na maquete o endereço do cadastro não vira casa sozinho: a cliente
       cadastra a casa no primeiro pedido, como sempre. */
    casaDoCadastro: function(){
      return null;
    },

    /* Depois do "Conta criada!": o início, como sempre. */
    depoisDasBoasVindas: function(){
      return { tela:"home", texto:"Ir para o início", agoraNao:false };
    },

    /* Se esta tela pode ser desenhada. Na maquete, todas: é o lugar de ver
       tudo funcionando de mentira. */
    telaLiberada: function(){
      return true;
    },

    /* Quem está usando o lado do cliente: a do cadastro, ou a de exemplo. */
    cliente: function(){
      return E.cliente || CLIENTE_EXEMPLO;
    },

    /* As profissionais favoritas, para o perfil. */
    favoritas: function(){
      return PROFISSIONAIS.filter(function(p){ return E.favoritos.indexOf(p.id) >= 0; });
    },

    /* Os serviços que a maquete vende: todos os do catálogo que estão
       disponíveis (null = sem lista à parte). */
    categoriasVendidas: function(){
      return null;
    },

    /* Os pedidos da cliente (nunca "ainda não se sabe": moram no aparelho). */
    pedidos: function(){
      return E.pedidos || [];
    },

    /* Um pedido pelo número; sem ele, o mais recente (como sempre foi). */
    pedido: function(id){
      const lista = E.pedidos || [];
      return lista.find(function(p){ return p.id === id; }) || lista[0];
    },

    /* Quem vai: a profissional de exemplo que "aceitou". */
    profissionalDoPedido: function(p){
      return (p && PROFISSIONAIS.find(function(x){ return x.id === p.profissionalId; })) || null;
    },

    /* Os nomes de quem vai, curtos ("Maria S."). Na maquete, uma só. */
    quemVai: function(p){
      const prof = FONTE.ler.profissionalDoPedido(p);
      return prof ? [nomeCurto(prof.nome)] : [];
    },

    /* Na maquete, cancelar sempre pode (e é sempre sem custo). */
    podeCancelar: function(p){
      return !!p && p.situacao !== "cancelado" && p.situacao !== "concluido";
    },

    /* O botão de pagar um pedido parado esperando o pagamento: na maquete,
       não (o pagamento de mentira é a tela de Pix e cartão). */
    podePagar: function(){
      return false;
    },

    /* Em que ponto da busca o pedido está: na maquete, o relógio acelerado
       da tela de busca (E.busca) e o passo da régua por ele. */
    busca: function(){
      const minutos = (E.busca && Number(E.busca.minutos)) || 0;
      return { minutos: minutos, passo: passoDaReguaNaMaquete(minutos) };
    },

    /* A conta que o resumo e o pagamento mostram. Na maquete, a do motor
       da maquete, na hora; a janela, pelo período escolhido. null = não há
       pedido montado. */
    simulacao: function(pedido){
      const conta = calcularPedido(pedido);
      if(!conta) return null;
      return {
        conta: conta,
        trava: conta.bloqueadoPorLimiteLegal
          ? "A jornada de uma diarista é de no máximo 8 horas por dia — é lei, não é escolha nossa."
          : "",
        comDuas: null,         // na maquete, a chave "duas" fica nos detalhes
        quando: null,          // na maquete, o horário é conferido na tela de data
      };
    },

    /* O que foi digitado no passo 1 do cadastro, para preencher a tela de
       novo. Na maquete, nada (a tela sempre abriu vazia) — menos para quem
       voltou da tela do código para corrigir o número. */
    rascunhoDoCadastro: function(papel){
      const r = RASCUNHO_DA_CORRECAO_NA_MAQUETE;
      return (r && (r.papel || "cliente") === (papel || "cliente")) ? r : null;
    },

    /* O endereço do passo 2: o que foi digitado, ou o de exemplo. */
    enderecoDoCadastro: function(){
      return (E.cliente && E.cliente.endereco) || CLIENTE_EXEMPLO.endereco;
    },

    /* A tela do código: para qual celular foi, e quanto falta para poder
       pedir outro. */
    confirmacao: function(){
      const falta = Math.ceil((CODIGO_DA_MAQUETE_PODE_MANDAR_EM - Date.now()) / 1000);
      const quem = (E.perfil === "diarista") ? E.diarista : E.cliente;
      return {
        telefone: (quem && quem.telefone) || "",
        aviso: "",
        segundosParaMandarDeNovo: Math.max(0, falta),
        podeCorrigirONumero: true,
      };
    },

    /* A tela da senha nova: quanto falta para poder pedir outro código. */
    recuperacao: function(){
      const falta = Math.ceil((CODIGO_DA_SENHA_NA_MAQUETE_PODE_MANDAR_EM - Date.now()) / 1000);
      return { segundosParaMandarDeNovo: Math.max(0, falta) };
    },
  },
};


/* Uma linha nova na trilha de mentira dela (uma decisão "da equipe", pelos
   simuladores, ou uma resposta dela), com o número seguinte e a hora deste
   aparelho. No app, a trilha mora no servidor e só recebe linhas novas. */
function acrescentarNaTrilhaDaMaquete(dela, linha){
  const trilha = Array.isArray(dela.trilha) ? dela.trilha : [];
  const id = trilha.reduce(function(m, l){ return Math.max(m, Number(l.id) || 0); }, 0) + 1;
  const agora = new Date();
  dela.trilha = trilha.concat([Object.assign({
    id: id, situacaoAntes: "", situacaoDepois: "", texto: "", emRespostaA: null,
    em: agora.toISOString(), emTexto: dataEHoraEmTexto(agora),
  }, linha)]);
}


/* O pedido da maquete, com a conta CONGELADA dentro dele: o comprovante
   mostra o que foi cobrado no dia, mesmo que a tabela de preços mude
   depois. Também é usado pelo atalho "pedido esperando o pagamento" do
   quadro NA MAQUETE (telas-cliente.js). */
function pedidoDaMaquete(d, situacao){
  const conta = calcularPedido(d);
  return {
    id: "P" + Date.now(),
    criadoEm: new Date().toISOString(),
    categoria: d.categoria,
    casaId: d.casaId,
    respostas: Object.assign({}, d.respostas),
    adicionais: d.adicionais.slice(),
    duasProfissionais: d.duasProfissionais,
    data: d.data,
    periodo: d.periodo,
    pagamento: d.pagamento,
    total: conta.total,
    horas: conta.horas,
    horasSemAdicionais: conta.horasSemAdicionais,
    precoServico: conta.precoServico,
    precoAdicionais: conta.precoAdicionais,
    tempoExtra: conta.tempoExtra,
    mudouDeFaixa: conta.mudouDeFaixa,
    quantidade: conta.quantidade,
    resumoTexto: conta.categoria.nome + " · " + conta.horas + "h",
    situacao: situacao,
    profissionalId: null,
    recusadas: [],
  };
}
