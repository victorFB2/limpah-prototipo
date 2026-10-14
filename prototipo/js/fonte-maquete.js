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

/* Quem acabou de criar a conta vê "Conta criada!" depois do código. */
let CONTA_DA_MAQUETE_ACABOU_DE_NASCER = false;

/* Quem tocou em "corrigir o número" volta ao passo 1 com o que tinha
   digitado. Só na memória, e só até o próximo "Continuar". */
let RASCUNHO_DA_CORRECAO_NA_MAQUETE = null;

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

  /* CADASTRO DO CLIENTE, passo 1: a cliente de exemplo, com o que foi
     digitado por cima. A senha não é usada. */
  comecarCadastro: function(d, pronto){
    RASCUNHO_DA_CORRECAO_NA_MAQUETE = null;
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

  /* passo 3: a conta "nasce" e o "código" sai na hora */
  criarConta: function(d, pronto){
    E.logado = true;
    E.perfil = "cliente";
    salvar();
    CONTA_DA_MAQUETE_ACABOU_DE_NASCER = true;
    CODIGO_DA_MAQUETE_PODE_MANDAR_EM = Date.now() + ESPERA_PARA_MANDAR_DE_NOVO_NA_MAQUETE_MS;
    pronto({ ok:true, destino:"codigoCelular" });
  },

  /* O código do celular: qualquer código de 6 números serve. */
  confirmarCelular: function(d, pronto){
    const destino = CONTA_DA_MAQUETE_ACABOU_DE_NASCER ? "boasVindas"
                  : (E.perfil === "diarista" ? "diaristaHome" : "home");
    CONTA_DA_MAQUETE_ACABOU_DE_NASCER = false;
    pronto({ ok:true, destino:destino });
  },

  reenviarCodigo: function(d, pronto){
    CODIGO_DA_MAQUETE_PODE_MANDAR_EM = Date.now() + ESPERA_PARA_MANDAR_DE_NOVO_NA_MAQUETE_MS;
    pronto({ ok:true });
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
    const c = E.cliente || {};
    RASCUNHO_DA_CORRECAO_NA_MAQUETE = { nome:c.nome || "", email:c.email || "",
                                        telefone:c.telefone || "", soONumero:true };
    pronto({ ok:true, destino:"cadastroCliente",
             aviso:{ tela:"cadastroCliente", campo:"telefone",
                     erro:"Confira o número e corrija. O código vai para o celular que estiver aqui.",
                     senhaDeNovo:true } });
  },

  /* A pessoa mudou de tela. Na maquete, o cadastro de mentira fica
     guardado como sempre ficou; só a correção do número é esquecida quando
     ela sai do passo 1. */
  mudouDeTela: function(de){
    if(de === "cadastroCliente") RASCUNHO_DA_CORRECAO_NA_MAQUETE = null;
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
    if(p) p.situacao = "cancelado";
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

    /* Na maquete, cancelar sempre pode (e é sempre sem custo). */
    podeCancelar: function(p){
      return !!p && p.situacao !== "cancelado" && p.situacao !== "concluido";
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
    rascunhoDoCadastro: function(){
      return RASCUNHO_DA_CORRECAO_NA_MAQUETE;
    },

    /* O endereço do passo 2: o que foi digitado, ou o de exemplo. */
    enderecoDoCadastro: function(){
      return (E.cliente && E.cliente.endereco) || CLIENTE_EXEMPLO.endereco;
    },

    /* A tela do código: para qual celular foi, e quanto falta para poder
       pedir outro. */
    confirmacao: function(){
      const falta = Math.ceil((CODIGO_DA_MAQUETE_PODE_MANDAR_EM - Date.now()) / 1000);
      return {
        telefone: (E.cliente && E.cliente.telefone) || "",
        aviso: "",
        segundosParaMandarDeNovo: Math.max(0, falta),
        podeCorrigirONumero: E.perfil !== "diarista",
      };
    },
  },
};


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
