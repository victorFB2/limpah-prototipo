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

/* A VERIFICAÇÃO DELA NA MAQUETE (R35): nada é consultado de verdade, e nada
   do que ela digita ou fotografa fica neste aparelho. Ficam só as marcas do
   caminho (autorizou, informou o CPF, o documento conferiu, quantas
   selfies não conferiram) e os 2 últimos números do CPF, para o "consta":
   como no verificador de mentira do app, o CPF que termina em 00 dá
   "consta" — e a tela dela é a mesma. O nome da mãe fica só na memória,
   até a consulta (como no app). */
let NOME_DA_MAE_NA_MAQUETE = "";
/* "Simular: a selfie não confere": quantas das próximas não conferem */
let ROSTOS_QUE_NAO_CONFEREM_NA_MAQUETE = 0;
const FRASE_ROSTO_NAO_CONFERE_NA_MAQUETE = "Não conseguimos confirmar que é você. Tire outra selfie: "
  + "rosto inteiro, com luz, sem óculos escuros nem boné.";
const FRASE_ROSTO_PARA_A_EQUIPE_NA_MAQUETE = "Não conseguimos confirmar pela selfie. Tudo bem: agora "
  + "uma pessoa da nossa equipe confere, e a gente avisa você por aqui.";

function verificacaoNaMaquete(d){
  if(!d.verificacao || typeof d.verificacao !== "object")
    d.verificacao = { autorizada:false, cpfInformado:false, cpfFinal:"", documentoConferido:false,
                      tentativasDoRosto:0 };
  return d.verificacao;
}

/* Fechou o Portão 2 (as quatro marcas): na maquete, ela passa a "em análise". */
function fecharOPortaoDoisNaMaquete(d){
  const tudo = ETAPAS_DO_PORTAO_2.every(function(x){ return !!d.feito[x]; });
  if(tudo && d.situacao === "novo") d.situacao = "analise";
}

function simularRostoQueNaoConfereNaMaquete(){
  ROSTOS_QUE_NAO_CONFEREM_NA_MAQUETE = 1;
}

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
     ela sai do passo 1 — e o nome da mãe, quando ela sai da verificação. */
  mudouDeTela: function(de, para){
    if(de === "cadastroCliente" || de === "cadastroDiarista") RASCUNHO_DA_CORRECAO_NA_MAQUETE = null;
    if(TELAS_DA_VERIFICACAO.indexOf(de) >= 0 && TELAS_DA_VERIFICACAO.indexOf(para) < 0)
      NOME_DA_MAE_NA_MAQUETE = "";
  },

  /* OS BAIRROS DELA, o jeito de antes da R34: nenhuma tela usa mais (o fim
     do Portão 1 é o CEP, logo abaixo). Fica para o contrato da tomada ser
     igual ao do app, que ainda aceita as contas antigas. */
  salvarBairros: function(d, pronto){
    const dela = euSouDiarista();
    dela.bairros = d.bairros.slice();
    dela.regiao = dela.bairros.join(", ");
    dela.feito.regiao = true;
    salvar();
    pronto({ ok:true });
  },

  /* O CEP DA CASA DELA (R34: o fim do Portão 1, e o "mudei de casa"). Na
     maquete, qualquer CEP de 8 números serve, menos o 00000-000 (para ver a
     frase do CEP que não existe). O bairro do "Perto de …" vem da tabela
     pequena de exemplos; fora dela, o início diz o CEP. */
  salvarCep: function(d, pronto){
    const numeros = String((d && d.cep) || "").replace(/[^0-9]/g, "");
    if(numeros.length !== 8)
      return pronto({ ok:false, campo:"cep", erro:"O CEP tem 8 números, por exemplo 05435-000." });
    if(numeros === "00000000")
      return pronto({ ok:false, campo:"cep",
                      erro:"Não achamos esse CEP. Confira os números, ou toque em “Não sei meu CEP”." });
    const dela = euSouDiarista();
    dela.cep = numeros.slice(0, 5) + "-" + numeros.slice(5);
    const exemplo = EXEMPLOS_DE_CEP.filter(function(x){
      return x.cep.slice(0, 5) === numeros.slice(0, 5);
    })[0];
    dela.moraPertoDe = exemplo ? exemplo.bairro : "";
    dela.regiao = dela.moraPertoDe ? "Perto de " + dela.moraPertoDe : "CEP " + dela.cep;
    dela.feito.regiao = true;
    salvar();
    pronto({ ok:true });
  },

  /* "Não sei meu CEP" (R34): na maquete, a tabela pequena de exemplos,
     pelo bairro. A rua só precisa ter cara de rua (e "Inexistente" não
     existe, como no localizador de mentira do app). Nada é guardado. */
  procurarCep: function(d, pronto){
    const rua = String((d && d.rua) || "").trim();
    const bairro = String((d && d.bairro) || "");
    if(rua.length < 3) return pronto({ ok:false, campo:"rua", erro:"Digite o nome da sua rua." });
    if(!bairro) return pronto({ ok:false, campo:"bairro", erro:"Escolha o bairro na lista." });
    const exemplo = EXEMPLOS_DE_CEP.filter(function(x){ return x.bairro === bairro; })[0];
    if(!exemplo || semAcento(rua).indexOf("inexistente") >= 0)
      return pronto({ ok:false, campo:"rua",
                      erro:"Não achamos o CEP dessa rua. Confira o nome da rua e o bairro." });
    pronto({ ok:true, cep:exemplo.cep });
  },

  /* A VERIFICAÇÃO (R35): a autorização, os dados, o documento, a selfie, os
     antecedentes e as regras. Na maquete, a conferência é de mentira e
     sempre passa (menos o "Simular: a selfie não confere"); a foto não é
     guardada, nem o CPF, nem o nome da mãe. */
  autorizarVerificacao: function(d, pronto){
    if(!(d && d.autorizo === true))
      return pronto({ ok:false, campo:"autorizo", erro:FRASE_SEM_AUTORIZACAO });
    verificacaoNaMaquete(FONTE.ler.diarista()).autorizada = true;
    salvar();
    pronto({ ok:true });
  },

  enviarDadosPessoais: function(d, pronto){
    const dela = FONTE.ler.diarista();
    const v = verificacaoNaMaquete(dela);
    const cpf = String((d && d.cpf) || "").replace(/[^0-9]/g, "");
    if(!v.autorizada) return pronto({ ok:false, erro:"Antes, precisamos da sua autorização." });
    if(!cpfValido(cpf)) return pronto({ ok:false, campo:"cpf", erro:FRASE_DO_CPF });
    if(!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(String((d && d.nascimento) || "")))
      return pronto({ ok:false, campo:"nascimento", erro:FRASE_DA_DATA });
    const mae = String((d && d.nomeDaMae) || "").trim();
    if(mae.length < 3) return pronto({ ok:false, campo:"nome_da_mae", erro:FRASE_DO_NOME_DA_MAE });
    if(v.cpfFinal && v.cpfFinal !== cpf.slice(-2)) v.documentoConferido = false;
    v.cpfInformado = true;
    v.cpfFinal = cpf.slice(-2);
    NOME_DA_MAE_NA_MAQUETE = mae;
    salvar();
    pronto({ ok:true });
  },

  enviarFotoDoDocumento: function(d, pronto){
    const v = verificacaoNaMaquete(FONTE.ler.diarista());
    if(!v.cpfInformado) return pronto({ ok:false, motivo:"sem_dados", erro:"Antes, digite o seu CPF." });
    /* a foto (d.foto) não é olhada nem guardada: aqui ela some */
    v.documentoConferido = true;
    salvar();
    pronto({ ok:true });
  },

  enviarSelfie: function(d, pronto){
    const dela = FONTE.ler.diarista();
    const v = verificacaoNaMaquete(dela);
    if(!v.documentoConferido)
      return pronto({ ok:false, motivo:"sem_documento", erro:"Antes, tire a foto do documento." });
    if(ROSTOS_QUE_NAO_CONFEREM_NA_MAQUETE > 0 || v.cpfFinal === "11"){
      ROSTOS_QUE_NAO_CONFEREM_NA_MAQUETE = Math.max(0, ROSTOS_QUE_NAO_CONFEREM_NA_MAQUETE - 1);
      v.tentativasDoRosto = Math.min(SELFIES_QUE_NAO_CONFEREM_NO_MAXIMO,
                                     Number(v.tentativasDoRosto || 0) + 1);
      salvar();
      const comAEquipe = v.tentativasDoRosto >= SELFIES_QUE_NAO_CONFEREM_NO_MAXIMO;
      return pronto({ ok:false, campo:"foto", motivo:"rosto_nao_confere", comAEquipe:comAEquipe,
                      erro: comAEquipe ? FRASE_ROSTO_PARA_A_EQUIPE_NA_MAQUETE
                                       : FRASE_ROSTO_NAO_CONFERE_NA_MAQUETE });
    }
    dela.feito.documentos = true;
    dela.feito.selfie = true;
    salvar();
    /* a consulta vai em seguida, com o nome que ficou na memória */
    if(!NOME_DA_MAE_NA_MAQUETE) return pronto({ ok:true, faltaONomeDaMae:true });
    FONTE.consultarAntecedentes({ nomeDaMae: NOME_DA_MAE_NA_MAQUETE }, pronto);
  },

  consultarAntecedentes: function(d, pronto){
    const dela = FONTE.ler.diarista();
    if(!dela.feito.selfie) return pronto({ ok:false, erro:"Antes, tire a selfie." });
    if(String((d && d.nomeDaMae) || "").trim().length < 3)
      return pronto({ ok:false, campo:"nome_da_mae", erro:FRASE_DO_NOME_DA_MAE });
    /* "consta" ou "nada consta", a parte dela está feita (R35): quem vê o
       resultado é a nossa equipe, e a tela dela é a mesma */
    dela.feito.antecedentes = true;
    NOME_DA_MAE_NA_MAQUETE = "";
    fecharOPortaoDoisNaMaquete(dela);
    salvar();
    pronto({ ok:true });
  },

  aceitarRegras: function(d, pronto){
    const dela = FONTE.ler.diarista();
    dela.feito.termos = true;
    fecharOPortaoDoisNaMaquete(dela);
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

  /* A CONVERSA (no app, 8, vem do servidor): na maquete, as telas usam o
     motor deste aparelho (telas-cliente.js: contextoDaConversa,
     mensagensDaConversa, enviarMensagem), que já está sempre à mão. */
  carregarConversa: function(chave, pronto){
    pronto({ ok:true });
  },
  carregarConversas: function(pronto){
    pronto({ ok:true });
  },
  marcarConversaLida: function(d, pronto){
    pronto({ ok:true });
  },
  /* Escrever: o mesmo motor deste aparelho (fora do horário, não vai). */
  enviarNaConversa: function(d, pronto){
    const papel = String(E.conversaNaTela || "").indexOf("servico:") === 0 ? "diarista" : "cliente";
    const m = enviarMensagem(d.chave, papel, d.texto);
    pronto(m ? { ok:true } : { ok:false, motivo:"conversa_fechada" });
  },

  /* O SUPORTE (no app, 9, vem do servidor): na maquete, a tela 30 continua
     a de sempre, com as mensagens fixas, e nada é perguntado nem gravado. */
  carregarSuporte: function(pronto){
    pronto({ ok:true });
  },
  enviarNoSuporte: function(d, pronto){
    pronto({ ok:true });
  },
  marcarSuporteLido: function(d, pronto){
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

  /* O DIA DO SERVIÇO (A41). Na maquete, os passos moram neste aparelho: os
     dela no serviço da agenda (s.dia), os da profissional de mentira no
     pedido da cliente (p.diaNaMaquete). A hora de cada passo é a do relógio
     do dia (relogioDoDiaNaMaquete): o de verdade, ou o que os botões ⏩ do
     quadro NA MAQUETE escolheram. A conta de o que pode agora é a mesma do
     servidor (estadoEmMinutos, no dados.js). A selfie da chegada não é
     olhada nem guardada: aqui ela some. */
  carregarDiaDela: function(a, pronto){
    pronto({ ok:true });
  },

  passoDoDia: function(d, pronto){
    const s = servicoDaAgendaNaMaquete(E.servicoAberto);
    if(!s) return pronto({ ok:false, erro:"Não achamos esse serviço." });
    const r = registroDoDiaNaMaquete(s);
    const e = estadoDoDiaNaMaquete(s);
    const agora = relogioDoDiaNaMaquete(chaveDoDiaNaMaquete(s)).getTime();
    const acao = String((d && d.passo) || "");
    const pode = { "confirmar":"confirmar", "a-caminho":"sair", "terminei":"terminar",
                   "imprevisto":"imprevisto", "cliente-ausente":"clienteAusente" }[acao];
    if(!pode) return pronto({ ok:false, erro:"Não entendemos o que foi enviado." });
    if(acao === "imprevisto" && r.imprevisto) return pronto({ ok:true });
    if(acao === "cliente-ausente" && r.clienteAusente) return pronto({ ok:true });
    if(!e.pode[pode]) return pronto({ ok:false, erro:fraseDoPassoQueNaoAbriu(acao, r, e) });
    if(acao === "confirmar") r.confirmou = agora;
    if(acao === "a-caminho"){ r.aCaminho = agora; r.confirmou = r.confirmou || agora; }
    if(acao === "terminei") r.terminou = agora;
    if(acao === "imprevisto") r.imprevisto = agora;
    if(acao === "cliente-ausente") r.clienteAusente = agora;
    salvar();
    pronto({ ok:true });
  },

  chegueiNoServico: function(d, pronto){
    const s = servicoDaAgendaNaMaquete(E.servicoAberto);
    if(!s) return pronto({ ok:false, erro:"Não achamos esse serviço." });
    const r = registroDoDiaNaMaquete(s);
    const e = estadoDoDiaNaMaquete(s);
    if(r.chegou) return pronto({ ok:true });
    if(!e.pode.chegar) return pronto({ ok:false, erro:fraseDoPassoQueNaoAbriu("cheguei", r, e) });
    /* a foto (d.foto) não é olhada nem guardada: aqui ela some */
    if(CHEGADAS_QUE_NAO_CONFEREM_NA_MAQUETE > 0){
      CHEGADAS_QUE_NAO_CONFEREM_NA_MAQUETE--;
      r.tentativas = Math.min(DIA_DO_SERVICO.selfiesDaChegadaNoMaximo, Number(r.tentativas || 0) + 1);
      salvar();
      const comAEquipe = r.tentativas >= DIA_DO_SERVICO.selfiesDaChegadaNoMaximo;
      return pronto({ ok:false, campo:"foto", motivo:"selfie_nao_confere", comAEquipe:comAEquipe,
                      erro: comAEquipe ? FRASE_DA_CHEGADA_PARA_A_EQUIPE : FRASE_DA_CHEGADA_QUE_NAO_CONFERE });
    }
    r.chegou = relogioDoDiaNaMaquete(chaveDoDiaNaMaquete(s)).getTime();
    salvar();
    pronto({ ok:true });
  },

  avaliarODia: function(d, pronto){
    const nota = Number(d && d.nota);
    if(!(nota >= 1 && nota <= 5)) return pronto({ ok:false, campo:"nota", erro:"Escolha de 1 a 5 estrelas." });
    if(nota <= DIA_DO_SERVICO.notaQuePedeOMotivo && String((d && d.comentario) || "").trim().length < 3)
      return pronto({ ok:false, campo:"comentario",
                      erro:"Conte em poucas palavras o que não ficou bom: ajuda a melhorar." });
    const ehDela = d && d.lado === "diarista";
    const s = ehDela ? servicoDaAgendaNaMaquete(E.servicoAberto) : null;
    const p = ehDela ? null : (E.pedidos || []).find(function(x){ return x.id === E.pedidoAtual; });
    const r = ehDela ? (s && registroDoDiaNaMaquete(s)) : (p && registroDoPedidoNaMaquete(p));
    if(!r) return pronto({ ok:false, erro:"Não achamos esse serviço." });
    /* só a nota fica neste aparelho: o comentário não é guardado aqui */
    if(!r.avaliou) r.avaliou = { nota: nota };
    salvar();
    pronto({ ok:true });
  },

  carregarDiaDoPedido: function(id, pronto){
    pronto({ ok:true });
  },

  passoDaCliente: function(d, pronto){
    const p = (E.pedidos || []).find(function(x){ return x.id === (d && d.pedidoId); });
    if(!p) return pronto({ ok:false, erro:"Não achamos esse pedido." });
    const r = registroDoPedidoNaMaquete(p);
    const e = estadoDoPedidoNaMaquete(p);
    const agora = relogioDoDiaNaMaquete("pedido:" + p.id).getTime();
    if(d.passo === "tudo-certo"){
      if(r.concluido) return pronto({ ok:true });
      if(!e.pode.confirmarOFim) return pronto({ ok:false, erro:"A profissional ainda não terminou o serviço." });
      r.concluido = agora;
      r.clienteConfirmou = agora;
      if(r.terminou === null || r.terminou === undefined) r.terminou = momentoDoDiaNaMaquete(dataDoPedidoNaMaquete(p), e.terminou);
      p.situacao = "concluido";
    } else if(d.passo === "contestar"){
      if(r.contestou) return pronto({ ok:true });
      if(String(d.texto || "").trim().length < 3)
        return pronto({ ok:false, campo:"texto", erro:"Conte o que não ficou bom, para a nossa equipe ajudar." });
      if(!e.pode.contestar) return pronto({ ok:false, erro:"A profissional ainda não terminou o serviço." });
      /* o texto vai para a nossa equipe (no app); aqui não é guardado */
      r.contestou = true;
    }
    salvar();
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

    /* Em que passo da verificação ela está (R35), como o servidor diria. */
    verificacao: function(){
      const d = FONTE.ler.diarista();
      const v = (d.verificacao && typeof d.verificacao === "object") ? d.verificacao : {};
      const tentativas = Number(v.tentativasDoRosto || 0);
      let etapa;
      if(d.feito.selfie && d.feito.documentos) etapa = d.feito.antecedentes ? "feita" : "antecedentes";
      else if(!v.autorizada) etapa = "autorizar";
      else if(!v.cpfInformado) etapa = "dados";
      else if(!v.documentoConferido) etapa = "documento";
      else if(tentativas >= SELFIES_QUE_NAO_CONFEREM_NO_MAXIMO) etapa = "equipe";
      else etapa = "selfie";
      return { etapa: etapa, autorizada: !!v.autorizada, cpfInformado: !!v.cpfInformado,
               documentoConferido: !!v.documentoConferido,
               selfiesRestantes: Math.max(0, SELFIES_QUE_NAO_CONFEREM_NO_MAXIMO - tentativas) };
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

    /* A conversa e a lista das conversas prontas do servidor (no app, 8).
       Na maquete não há: as telas as montam deste aparelho (o motor da
       conversa, no telas-cliente.js). */
    conversa: function(){
      return null;
    },
    conversas: function(){
      return null;
    },

    /* O suporte do servidor (no app, 9). Na maquete não há: a tela 30 é a
       de sempre, e nenhuma resposta da equipe chega. */
    suporte: function(){
      return null;
    },
    novasDoSuporte: function(){
      return 0;
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

    /* A foto de quem vai (R35), na mesma ordem: na maquete, o rosto
       desenhado ("exemplo"), com o pedido confirmado — a maquete não tem
       foto de ninguém e não baixa imagem nenhuma. */
    fotosDeQuemVai: function(p){
      const confirmado = !!p && p.situacao === "confirmado";
      return FONTE.ler.quemVai(p).map(function(){ return confirmado ? "exemplo" : ""; });
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

    /* O DIA DO SERVIÇO (A41): o dela, do serviço aberto da agenda; o da
       cliente, do pedido. Na maquete, nunca "ainda não chegou". */
    diaDela: function(a){
      const s = servicoDaAgendaNaMaquete(a);
      return s ? diaDelaNaMaquete(s) : null;
    },
    diaDoPedido: function(id){
      const p = (E.pedidos || []).find(function(x){ return x.id === id; });
      return (p && FONTE.ler.profissionalDoPedido(p)) ? diaDoPedidoNaMaquete(p) : null;
    },
    /* Na maquete, o "Acompanhar o serviço" aparece em todo pedido
       confirmado (para ver as telas sem esperar o dia); no app, o servidor
       diz (do dia do serviço até a semana da avaliação). */
    acompanhar: function(p){
      return !!p && (p.situacao === "confirmado" || p.situacao === "concluido")
          && !!FONTE.ler.profissionalDoPedido(p);
    },
    /* A média de cada uma: na maquete, a do perfil de exemplo (as telas da
       maquete já mostram as estrelas dele). */
    notasDeQuemVai: function(){
      return [];
    },
  },
};


/* --------------------------------------------------------------------------
   O DIA DO SERVIÇO NA MAQUETE (A41)
   -------------------------------------------------------------------------- */
/* "Simular: a selfie da chegada não confere": quantas das próximas não conferem */
let CHEGADAS_QUE_NAO_CONFEREM_NA_MAQUETE = 0;

function simularChegadaQueNaoConfereNaMaquete(){
  CHEGADAS_QUE_NAO_CONFEREM_NA_MAQUETE = DIA_DO_SERVICO.selfiesDaChegadaNoMaximo;
}

/* No app, a pessoa da equipe confere quem é e libera, na fila "Hoje". */
function simularEquipeLiberaAChegadaNaMaquete(a){
  const s = servicoDaAgendaNaMaquete(a);
  if(!s) return;
  const r = registroDoDiaNaMaquete(s);
  if(r.chegou) return;
  r.chegou = relogioDoDiaNaMaquete(chaveDoDiaNaMaquete(s)).getTime();
  r.chegadaPelaEquipe = true;
  salvar();
}
/* as mesmas frases do servidor (app/limpah/rotas/dia.py; um teste compara) */
const FRASE_DA_CHEGADA_QUE_NAO_CONFERE = "Não conseguimos confirmar que é você. Tire outra selfie: "
  + "rosto inteiro, com luz, sem óculos escuros nem boné.";
const FRASE_DA_CHEGADA_PARA_A_EQUIPE = "Não conseguimos confirmar pela selfie. Tudo bem: agora uma "
  + "pessoa da nossa equipe confere, e a cliente já foi avisada.";

function servicoDaAgendaNaMaquete(a){
  if(!a) return null;
  return (FONTE.ler.agenda() || []).find(function(x){
    return x.oportunidadeId === a.oportunidadeId && x.data === a.data;
  }) || null;
}

function chaveDoDiaNaMaquete(s){ return "servico:" + s.oportunidadeId + ":" + s.data; }

function meiaNoiteNaMaquete(iso){
  const p = String(iso || "").split("-");
  return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]), 0, 0, 0, 0);
}

/* O relógio do dia, na maquete: o que um botão ⏩ do quadro NA MAQUETE
   escolheu para ESTE serviço (e que anda dali em diante), ou o de verdade. */
function relogioDoDiaNaMaquete(chave){
  const r = E.relogioDoDia;
  if(r && r.chave === chave && r.data){
    return new Date(meiaNoiteNaMaquete(r.data).getTime() + Number(r.minutos || 0) * 60000
                    + Math.max(0, Date.now() - Number(r.marcadoEm || Date.now())));
  }
  return relogioDaAgenda();
}

function minutosDoDiaNaMaquete(iso, ms){
  if(ms === null || ms === undefined || ms === "") return null;
  return (Number(ms) - meiaNoiteNaMaquete(iso).getTime()) / 60000;
}

function momentoDoDiaNaMaquete(iso, minutos){
  return meiaNoiteNaMaquete(iso).getTime() + Number(minutos) * 60000;
}

function registroDoDiaNaMaquete(s){
  if(!s.dia || typeof s.dia !== "object") s.dia = {};
  return s.dia;
}

function registroDoPedidoNaMaquete(p){
  if(!p.diaNaMaquete || typeof p.diaNaMaquete !== "object") p.diaNaMaquete = {};
  return p.diaNaMaquete;
}

function emMinutosNaMaquete(iso, r, aceito){
  const m = function(x){ return minutosDoDiaNaMaquete(iso, x); };
  return { aceito: m(aceito), confirmou: m(r.confirmou), aCaminho: m(r.aCaminho), chegou: m(r.chegou),
           tentativas: Number(r.tentativas || 0), terminou: m(r.terminou), concluido: m(r.concluido),
           contestou: !!r.contestou };
}

function estadoDoDiaNaMaquete(s){
  const agora = relogioDoDiaNaMaquete(chaveDoDiaNaMaquete(s)).getTime();
  return estadoEmMinutos(emMinutosNaMaquete(s.data, registroDoDiaNaMaquete(s), s.aceitoEm),
                         s.inicio, s.fim, minutosDoDiaNaMaquete(s.data, agora));
}

/* O dia do pedido; o pedido de exemplo sem dia (o dos testes) conta como hoje. */
function dataDoPedidoNaMaquete(p){
  return /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(String(p.data || "")) ? p.data : isoDoDia(new Date());
}

function janelaDoPedidoNaMaquete(p){
  return janelaDoServico(p.periodo, p.horas) || { inicio: 8, fim: 12, texto: "" };
}

function estadoDoPedidoNaMaquete(p){
  const j = janelaDoPedidoNaMaquete(p);
  const agora = relogioDoDiaNaMaquete("pedido:" + p.id).getTime();
  const data = dataDoPedidoNaMaquete(p);
  return estadoEmMinutos(emMinutosNaMaquete(data, registroDoPedidoNaMaquete(p), null),
                         j.inicio, j.fim, minutosDoDiaNaMaquete(data, agora));
}

/* "hoje às 11h50", "amanhã às 9h" ou "dia 19/10 às 9h" (a mesma do servidor). */
function quandoNaMaquete(iso, minutos, agora){
  const quando = new Date(momentoDoDiaNaMaquete(iso, minutos));
  const hora = horaEscrita(quando.getHours() * 60 + quando.getMinutes());
  const hoje = isoDoDia(agora);
  const amanha = isoDoDia(new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + 1));
  if(isoDoDia(quando) === hoje) return "hoje às " + hora;
  if(isoDoDia(quando) === amanha) return "amanhã às " + hora;
  return "dia " + diaCurto(isoDoDia(quando)) + " às " + hora;
}

function horasDoDiaNaMaquete(iso, r, e){
  const h = function(ms){ return (ms === null || ms === undefined) ? "" : horaEscrita(minutosDoDiaNaMaquete(iso, ms)); };
  return { confirmou: h(r.confirmou || r.aCaminho), aCaminho: h(r.aCaminho), chegou: h(r.chegou),
           terminou: e.terminou !== null ? horaEscrita(e.terminou) : "" };
}

/* O dia dela, no formato que as telas leem (o mesmo do app). */
function diaDelaNaMaquete(s){
  const r = registroDoDiaNaMaquete(s), e = estadoDoDiaNaMaquete(s);
  const d = detalhesDoServico(s);
  const agora = relogioDoDiaNaMaquete(chaveDoDiaNaMaquete(s));
  return {
    servico: s.oportunidadeId, data: s.data, hoje: s.data === isoDoDia(agora),
    janela: d.janela, bairro: d.bairro, cliente: d.cliente,
    passo: e.passo, problema: e.problema,
    janelaAberta: minutosDoDiaNaMaquete(s.data, agora.getTime()) < s.fim * 60,
    pode: { confirmar: e.pode.confirmar, sair: e.pode.sair, chegar: e.pode.chegar, terminar: e.pode.terminar,
            imprevisto: e.pode.imprevisto && !r.imprevisto,
            clienteAusente: e.pode.clienteAusente && !r.clienteAusente,
            avaliar: e.pode.avaliar && !r.avaliou },
    abre: { confirmar: horaEscrita(e.abre.confirmar), sair: horaEscrita(e.abre.sair),
            chegar: horaEscrita(e.abre.chegar) },
    prazoDaConfirmacao: horaEscrita(e.prazoDaConfirmacao),
    selfiesRestantes: e.selfiesRestantes,
    horas: horasDoDiaNaMaquete(s.data, r, e),
    chegadaPelaEquipe: !!r.chegadaPelaEquipe,
    avisou: { imprevisto: !!r.imprevisto, clienteAusente: !!r.clienteAusente },
    avaliou: !!r.avaliou,
  };
}

/* O dia do pedido da cliente, no formato que as telas leem (o mesmo do app). */
function diaDoPedidoNaMaquete(p){
  const r = registroDoPedidoNaMaquete(p), e = estadoDoPedidoNaMaquete(p);
  const agora = relogioDoDiaNaMaquete("pedido:" + p.id);
  return {
    pedidoId: p.id, data: dataDoPedidoNaMaquete(p), hoje: dataDoPedidoNaMaquete(p) === isoDoDia(agora),
    janela: janelaDoPedidoNaMaquete(p).texto,
    abreAConfirmacao: horaEscrita(DIA_DO_SERVICO.horaDaConfirmacao * 60),
    prazoDaConfirmacao: horaEscrita(DIA_DO_SERVICO.horaLimiteDaConfirmacao * 60),
    profissionais: [{
      vaga: 1, nome: FONTE.ler.quemVai(p)[0] || "", foto: "exemplo",
      passo: e.passo, problema: e.problema,
      avisou: { imprevisto: !!r.imprevisto, clienteAusente: !!r.clienteAusente },
      horas: horasDoDiaNaMaquete(dataDoPedidoNaMaquete(p), r, e),
      chegadaPelaEquipe: !!r.chegadaPelaEquipe,
      pode: { confirmarOFim: e.pode.confirmarOFim, contestar: e.pode.contestar,
              avaliar: e.pode.avaliar && !r.avaliou },
      prazoParaContestar: e.pode.contestar ? quandoNaMaquete(dataDoPedidoNaMaquete(p), e.prazoParaContestar, agora) : "",
      avaliou: !!r.avaliou, contestou: !!r.contestou,
    }],
  };
}

/* A frase do passo que ainda não abriu (ou que já fechou), a mesma do servidor. */
function fraseDoPassoQueNaoAbriu(acao, r, e){
  const fechou = "A janela deste serviço já terminou.";
  /* "imprevisto" só fica fechado com a janela terminada (ou o serviço) */
  const naJanela = e.pode.imprevisto;
  if(acao === "cheguei" && e.passo === "conferindo")
    return "Agora uma pessoa da nossa equipe confere. Ela já foi avisada.";
  if(acao === "terminei" && e.passo === "conferindo")
    return "A nossa equipe ainda está confirmando a sua chegada. Ela já foi avisada.";
  if((acao === "cheguei" || acao === "cliente-ausente") && !r.aCaminho && naJanela)
    return "Antes, toque em Estou a caminho.";
  if(acao === "terminei" && !r.chegou && naJanela) return "Antes, toque em Cheguei.";
  if(!naJanela) return fechou;
  if(acao === "confirmar")
    return "A confirmação abre às " + horaEscrita(e.abre.confirmar) + " do dia do serviço.";
  if(acao === "a-caminho")
    return "Você pode avisar que está a caminho a partir das " + horaEscrita(e.abre.sair) + ".";
  if(acao === "cheguei")
    return "Você pode tirar a selfie da chegada a partir das " + horaEscrita(e.abre.chegar) + ".";
  return fechou;
}


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
