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

  /* passo 2: o endereço fica na cliente */
  guardarEnderecoDoCadastro: function(endereco, pronto){
    if(E.cliente) E.cliente.endereco = endereco;
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
