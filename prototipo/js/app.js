/* ==========================================================================
   LIMPAH — MOTOR DO PROTÓTIPO
   Cuida de: qual tela está aberta, o botão voltar, e guardar o que o
   usuário fez (para não perder tudo ao atualizar a página).

   As telas em si estão nos arquivos telas-acesso.js, telas-cliente.js e
   telas-diarista.js.

   Este arquivo é o mesmo na maquete e no app de verdade. O que muda entre
   os dois é a "tomada" (FONTE): na maquete, fonte-maquete.js, que guarda
   tudo neste aparelho; no app, a que fala com o servidor.
   ========================================================================== */


/* --------------------------------------------------------------------------
   O ESTADO — tudo que o app "lembra" no momento
   -------------------------------------------------------------------------- */
let E = {};

function estadoNovo(){
  /* favoritas e não lidas: na maquete vêm dos exemplos; no app, nascem vazias */
  const inicio = FONTE.ler.estadoInicial();
  return {
    tela: "splash",
    historico: [],
    perfil: null,          // "cliente" ou "diarista"
    logado: false,
    cliente: null,
    aba: "inicio",
    pedido: pedidoNovo(),
    pedidos: [],           // serviços já solicitados
    favoritos: inicio.favoritos,
    naoLidas: inicio.naoLidas,
    busca: { minutos:0, modo:"normal", jaAvisou:false },   // relógio da régua da busca
  };
}

function pedidoNovo(){
  return {
    categoria: null,
    casaId: null,          // qual casa está sendo atendida
    ajustadoDestaVez: false,   // o cliente mexeu no tamanho só neste pedido
    respostas: {},
    adicionais: [],
    duasProfissionais: false,
    data: null,
    periodo: null,
    pagamento: "pix",
  };
}


/* --------------------------------------------------------------------------
   GUARDAR E RECUPERAR
   Usa a memória do navegador. Se der qualquer problema, o app continua
   funcionando — só não lembra de nada ao recarregar.
   -------------------------------------------------------------------------- */
const CHAVE = "limpah-prototipo-v1";

/* No app, o que veio do servidor fica em E.servidor — e NÃO é guardado no
   aparelho: é dado de outra pessoa (pedidos, agenda) ou pode ter mudado
   desde então. Na maquete E.servidor nunca existe, e nada muda. */
function semOQueVeioDoServidor(chave, valor){
  return (this === E && chave === "servidor") ? undefined : valor;
}

function salvar(){
  try{ localStorage.setItem(CHAVE, JSON.stringify(E, semOQueVeioDoServidor)); }catch(e){}
}

function carregar(){
  try{
    const guardado = localStorage.getItem(CHAVE);
    if(guardado){
      E = Object.assign(estadoNovo(), JSON.parse(guardado));
      return true;
    }
  }catch(e){}
  E = estadoNovo();
  return false;
}

/* --------------------------------------------------------------------------
   QUEM JÁ USAVA O APP ANTES DAS CASAS EXISTIREM (decisão R10)

   O protótipo tinha cliente com endereço, histórico e favoritos. Ao mudar a
   ordem das telas, esse cliente ficaria sem casa nenhuma — e o app pareceria
   uma conta nova, com o histórico órfão.

   Então, na primeira vez que o app abre depois da mudança, a casa é criada a
   partir do que já existia: o endereço que ele cadastrou, e o tamanho do
   último pedido que ele fez. Ninguém precisa recadastrar nada.
   -------------------------------------------------------------------------- */
function criarCasaDeQuemJaUsava(){
  if(!E.cliente) return;
  if(E.cliente.casas && E.cliente.casas.length) return;   // já tem casa

  const en = E.cliente.endereco || {};

  /* o tamanho vem do pedido mais recente que tiver essa informação */
  let comodos = 3, banheiros = 1;
  const comTamanho = (E.pedidos || []).find(function(p){
    return p.respostas && p.respostas.comodos;
  });
  if(comTamanho){
    comodos   = comTamanho.respostas.comodos;
    banheiros = comTamanho.respostas.banheiros || 0;
  }

  const casa = {
    id: "casa-" + Date.now(),
    apelido: en.apelido || "Casa",
    tipoImovel: "apartamento",
    comodos: comodos,
    banheiros: banheiros,
    rua: en.rua || "",
    complemento: en.complemento || "",
    bairro: en.bairro || "",
    cidade: en.cidade || "",
    estado: en.estado || "",
    cep: en.cep || "",
    veioDoHistorico: true,   // para a tela poder avisar "confira se está certo"
  };

  E.cliente.casas = [casa];

  /* os pedidos antigos passam a apontar para ela, e o histórico deixa de
     ficar solto */
  (E.pedidos || []).forEach(function(p){ if(!p.casaId) p.casaId = casa.id; });

  salvar();
}

/* A casa do pedido. No app, a casa que sumiu da lista (trocada, que ganha
   outro número no servidor, ou apagada) NÃO vira a primeira da lista: o
   resumo mostraria um endereço e o "Confirmar" mandaria outro. Sem ela, as
   telas pedem para escolher de novo (casaDoPedidoSumiu, telas-cliente.js).
   Na maquete, o de sempre. */
function casaDoPedido(pedido){
  const casas = FONTE.ler.casas() || [];
  const casa = casas.find(function(c){ return c.id === (pedido || E.pedido).casaId; });
  if(casa) return casa;
  return FONTE.ehMaquete ? (casas[0] || null) : null;
}

/* A RUA E O NÚMERO. O formulário do endereço tem os dois em campos
   separados (o servidor guarda os dois separados). Na maquete, a casa
   sempre guardou os dois juntos na rua ("Rua das Flores, 123"), e as telas
   leem a rua assim: juntarRuaENumero monta, ruaENumero separa para o
   formulário. */
function juntarRuaENumero(rua, numero){
  rua = String(rua || "").trim();
  numero = String(numero || "").trim();
  return numero ? rua + ", " + numero : rua;
}

function ruaENumero(en){
  en = en || {};
  if(en.logradouro != null || en.numero != null)
    return { logradouro:String(en.logradouro || ""), numero:String(en.numero || "") };
  const rua = String(en.rua || "");
  const partes = /^(.*\S)\s*,\s*([0-9][^,]{0,9})$/.exec(rua);
  return partes ? { logradouro:partes[1], numero:partes[2].trim() } : { logradouro:rua, numero:"" };
}

function reiniciarPrototipo(){
  try{ localStorage.removeItem(CHAVE); }catch(e){}
  E = estadoNovo();
  desenhar();
}


/* --------------------------------------------------------------------------
   NAVEGAÇÃO
   -------------------------------------------------------------------------- */

/* Sobe a cada troca de tela (ir, voltar, trocar de aba). No app, a resposta
   do servidor que chega depois de a pessoa já ter mudado de tela é guardada,
   mas não a arrasta de volta: a tomada confere este número antes de seguir.
   Na maquete é só um contador. */
let NAVEGACAO = 0;

/* No app, a tela em que o aparelho estava quando o app foi fechado ou
   recarregado (o arranque sempre recomeça pela splash). A tomada do app
   usa isto para devolver ao cadastro quem recarregou no meio dele. */
let TELA_ANTES_DE_ABRIR = null;

function ir(nome, opcoes){
  opcoes = opcoes || {};
  if(!TELAS[nome]){
    console.warn("Tela não encontrada:", nome);
    return;
  }
  NAVEGACAO++;
  if(!opcoes.semHistorico && E.tela !== nome){
    E.historico.push(E.tela);
    if(E.historico.length > 40) E.historico.shift();
  }
  if(opcoes.limparHistorico) E.historico = [];
  E.tela = nome;
  salvar();
  desenhar();
  const corpo = document.querySelector(".corpo");
  if(corpo) corpo.scrollTop = 0;
}

/* O destino de emergência do botão voltar, quando não há histórico.

   Antes era sempre "home" — que é a tela inicial do CLIENTE. Uma diarista
   apertando voltar sem histórico ia parar dentro do aplicativo do cliente,
   um lugar que não é dela e de onde ela não sabia sair.

   No app, o início de quem está logado pode ainda não estar ligado ao
   servidor ("Chega em breve"). Voltar para ele seria ficar no mesmo lugar,
   sem saída. Enquanto não estiver, o voltar leva à escolha de perfil, que
   está sempre liberada. Na maquete toda tela está liberada: nada muda. */
function telaInicialDeQuemEstaUsando(){
  if(!E.logado) return "perfil";
  /* No app, enquanto o início não está ligado, vale o perfil da pessoa,
     que tem o "Sair da conta"; e, sem ele também, a escolha de perfil. */
  const opcoes = (E.perfil === "diarista") ? ["diaristaHome", "diaristaPerfil"]
                                           : ["home", "perfilCliente"];
  const liberada = opcoes.find(function(t){ return FONTE.ler.telaLiberada(t); });
  return liberada || "perfil";
}

function voltar(){
  const anterior = E.historico.pop();
  E.tela = anterior || telaInicialDeQuemEstaUsando();
  salvar();
  desenhar();
}

function trocarAba(aba){
  E.aba = aba;
  const destino = { inicio:"home", servicos:"meusServicos", mensagens:"mensagens", perfil:"perfilCliente" }[aba];
  ir(destino, { limparHistorico:true });
}

let ultimaTelaDesenhada = null;

/* No app, toda tela que ainda não foi ligada ao servidor aparece assim (a
   lista das ligadas é TELAS_DO_APP, na tomada do app). Na maquete nunca
   aparece: lá todas as telas estão liberadas.

   Quem está logado tem também "Sair da conta". Sem ele, a diarista que
   entrava no app não tinha como sair: o início dela ainda é este, e
   nenhuma tela que ela alcança tinha o "Sair" (revisão da 1b). */
const TELA_EM_BREVE = {
  html: function(){
    return '<div class="centro">'
         +   '<div class="emojao">🚧</div>'
         +   '<h2 class="titulo">Chega em breve</h2>'
         +   '<p class="apoio">Ainda estamos preparando esta parte do aplicativo.</p>'
         + '</div>'
         + '<div class="rodape">'
         +   '<button class="btn btn-principal" onclick="voltar()">Voltar</button>'
         +   (E.logado ? '<button class="btn btn-texto" onclick="sairDaConta(this)">Sair da conta</button>'
                       + '<div class="erro-do-campo" id="sair-erro"></div>' : '')
         + '</div>';
  }
};

/* Algumas telas, sem assunto, mostram o desenho de OUTRA (o pagamento sem
   pedido mostra o "novo serviço"; a busca sem pedido, "meus serviços").
   Elas pedem por aqui, e nunca por TELAS.x.html() direto: no app, se a
   outra tela ainda não foi liberada, aparece o "Chega em breve", e não a
   tela de fora da lista inteira. Na maquete, a tela de sempre. Um teste do
   app reprova TELAS.x.html() fora daqui. */
function htmlDaTela(nome){
  return FONTE.ler.telaLiberada(nome) ? TELAS[nome].html() : TELA_EM_BREVE.html();
}

/* --------------------------------------------------------------------------
   A FRASE QUE UMA TELA DEIXA PARA OUTRA

   Às vezes a frase de erro é de outra tela: a senha recusada no fim do
   cadastro aparece embaixo do campo de senha, que fica no começo. Quem
   decide guarda a frase aqui ({ tela, campo, erro }) e vai para a tela; ela
   mostra a frase embaixo do campo. Some quando a pessoa sai daquela tela.
   Na maquete quase nunca aparece: lá nada é recusado pelo servidor.
   -------------------------------------------------------------------------- */
let AVISO_PARA_A_TELA = null;

function avisarNaTela(aviso){
  AVISO_PARA_A_TELA = (aviso && aviso.tela) ? aviso : null;
}

function avisoDoCampo(tela, campo){
  const a = AVISO_PARA_A_TELA;
  return (a && a.tela === tela && (a.campo || "") === (campo || "")) ? String(a.erro || "") : "";
}

/* O lugar da frase de erro, embaixo do campo (vazio, ele não ocupa
   espaço). `tela` e `campo` dizem qual frase guardada vai nele. */
function erroDoCampo(id, tela, campo){
  return '<div class="erro-do-campo" id="' + esc(id) + '">' + esc(avisoDoCampo(tela, campo)) + '</div>';
}

/* A tomada fica sabendo que a pessoa mudou de tela. Na maquete, nada
   acontece; no app, quem sai do cadastro sem terminar não deixa o que
   digitou guardado no aparelho (fonte-servidor.js, mudouDeTela). */
function avisarATomadaDaTroca(de, para){
  FONTE.mudouDeTela(de, para);
}

function desenhar(){
  let tela = TELAS[E.tela];
  if(!tela) return;
  if(!FONTE.ler.telaLiberada(E.tela)) tela = TELA_EM_BREVE;
  if(AVISO_PARA_A_TELA && AVISO_PARA_A_TELA.tela !== E.tela) AVISO_PARA_A_TELA = null;
  pararRelogios();                 // nenhum contador de uma tela antiga sobrevive

  const palco = document.getElementById("palco");
  if(!palco) return;

  /* O PISCA-PISCA, e por que ele acontecia:

     Toda vez que o cliente mexia em algo que muda o preço — o contador de
     cômodos, um adicional, a chave de duas diaristas — a tela era
     redesenhada inteira. E como a animação de entrada mora no `.tela`, ela
     recomeçava do zero a cada toque: a tela inteira esmaecia e deslizava de
     novo. Parecia defeito, e cansava.

     Agora a animação só roda quando a tela REALMENTE muda. Redesenhar a
     mesma tela é troca de conteúdo, não entrada.

     Junto vai a rolagem: sem guardá-la, mexer num adicional lá embaixo
     jogava a lista de volta para o topo. */
  const mesmaTela = (ultimaTelaDesenhada === E.tela);
  if(!mesmaTela) NAVEGACAO++;      // o voltar() chega aqui sem passar pelo ir()
  /* antes de desenhar: a tela nova já aparece com o que a tomada decidiu
     (no app, quem saiu do cadastro sem terminar não deixa nada guardado) */
  if(!mesmaTela && ultimaTelaDesenhada) avisarATomadaDaTroca(ultimaTelaDesenhada, E.tela);
  /* .corpo é a rolagem das telas comuns; .miolo é a ficha do alerta de tela
     cheia, que rola por dentro (12/10/2026: a ficha voltava ao topo). */
  const ROLAVEIS = [".corpo", ".miolo"];
  const rolagens = ROLAVEIS.map(function(sel){
    const antigo = mesmaTela ? palco.querySelector(sel) : null;
    return antigo ? antigo.scrollTop : 0;
  });

  palco.innerHTML = '<div class="tela' + (mesmaTela ? " sem-animacao" : "") + '">'
                  + tela.html() + '</div>';
  ultimaTelaDesenhada = E.tela;

  ROLAVEIS.forEach(function(sel, i){
    if(!rolagens[i]) return;
    const novo = palco.querySelector(sel);
    if(novo) novo.scrollTop = rolagens[i];
  });

  if(tela.aoEntrar) tela.aoEntrar();
}


/* --------------------------------------------------------------------------
   RELÓGIOS
   Telas que contam tempo (splash, busca) registram seus contadores aqui.
   Ao trocar de tela, todos são desligados — senão um contador esquecido
   continua rodando por baixo e leva o usuário para uma tela sozinho.
   -------------------------------------------------------------------------- */
let RELOGIOS = [];

function agendar(funcao, ms){
  const id = setTimeout(funcao, ms);
  RELOGIOS.push(id);
  return id;
}

function repetir(funcao, ms){
  const id = setInterval(funcao, ms);
  RELOGIOS.push(id);
  return id;
}

function pararRelogios(){
  RELOGIOS.forEach(function(id){ clearTimeout(id); clearInterval(id); });
  RELOGIOS = [];
}


/* ==========================================================================
   PEDACINHOS DE TELA REAPROVEITADOS
   ========================================================================== */

/* Todo texto que veio de fora do código (o que a pessoa digitou, o que o
   servidor mandou) passa por aqui antes de virar HTML. Escapa também a
   aspa simples: sem isso, um texto com apóstrofo dentro de um atributo
   escrito com aspas simples fecharia o atributo no meio.

   ATENÇÃO: dentro de um atributo de evento (onclick="...") isto NÃO
   protege — o navegador desfaz os escapes antes de rodar o código. Ali só
   entra idSeguro(...), Number(...) ou texto fixo (ver idSeguro, abaixo). */
function esc(txt){
  return String(txt == null ? "" : txt)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");
}

/* O que vai para DENTRO de um onclick="...". Só letras sem acento,
   números, dois-pontos e traço passam: um nome de tela, um id, uma data.
   Número passa por Number(...). Um teste automático reprova qualquer outro
   valor concatenado num atributo de evento. */
function idSeguro(x){ return String(x == null ? "" : x).replace(/[^A-Za-z0-9:\-]/g, ""); }

/* O valor de um campo da tela, ou "" se o campo não está desenhado.
   As ações leem por aqui, para nunca quebrarem quando são chamadas sem a
   tela delas aberta (os testes da maquete fazem isso). */
function valorDoCampo(id){
  const campo = document.getElementById(id);
  return (campo && campo.value != null) ? String(campo.value) : "";
}

/* Se a chave da tela (o "aceito os termos") está ligada. Sem a chave
   desenhada, devolve false: a ação não quebra, e também não passa sem o
   aceite. */
function chaveLigada(id){
  const chave = document.getElementById(id);
  return !!(chave && chave.classList && chave.classList.contains("ligada"));
}

/* Escreve a frase de erro no lugar dela, se o lugar estiver na tela. Sem
   ele, não faz nada — em vez de parar a ação no meio. As ações usam isto,
   e valorDoCampo e chaveLigada, e nunca getElementById(...).algo direto:
   um teste automático (app/testes/test_telas_estaticas.py) reprova. */
function mostrarErro(id, texto){
  const lugar = document.getElementById(id);
  if(lugar) lugar.textContent = texto;
}

/* O que só existe na maquete (o quadro "NA MAQUETE", os atalhos, os
   simuladores). No app de verdade não aparece. Aceita o HTML pronto ou uma
   função que o monta — a função nem roda no app. */
function soNaMaquete(html){
  if(!FONTE.ehMaquete) return "";
  return (typeof html === "function") ? html() : html;
}

/* O que só existe no app de verdade (o botão da conversa com a nossa
   equipe, entrega 9): na maquete, nada aparece, e ela continua como era.
   Aceita o HTML pronto ou uma função que o monta — a função nem roda na
   maquete. */
function soNoApp(html){
  if(FONTE.ehMaquete) return "";
  return (typeof html === "function") ? html() : html;
}

/* O contrário: no app, onde a parte ainda não foi ligada ao servidor,
   diz que ela chega em breve. Na maquete não aparece nada. */
function emBreveNoApp(assunto){
  if(FONTE.ehMaquete) return "";
  return '<div class="aviso roxo">🚧<div><b>' + esc(assunto || "Esta parte") + ' chega em breve</b>'
       + 'Ainda estamos preparando esta parte do aplicativo.</div></div>';
}

function moeda(valor){
  return "R$ " + Number(valor || 0).toFixed(2).replace(".", ",");
}

function iniciais(nome){
  const p = String(nome || "").trim().split(/\s+/);
  return ((p[0] || "")[0] || "" ).toUpperCase() + ((p[1] || "")[0] || "").toUpperCase();
}

function avatar(nome, cor, classe){
  return '<div class="avatar ' + (classe || "") + '" style="background:' + (cor || "#6C3AD8") + '">'
       + esc(iniciais(nome)) + '</div>';
}

/* O ROSTO DE QUEM VAI, para a cliente conferir na porta (R35). Três jeitos:
   - no app, o endereço da foto de perfil que a equipe aprovou, que veio
     pronto do servidor (ele decide quem vê e até quando): a foto por cima
     das iniciais. Se a foto não carregar, as iniciais continuam ali
     embaixo (A6: o círculo é a reserva);
   - na maquete, "exemplo": um rosto desenhado (emoji), porque a maquete
     não tem foto de ninguém e não baixa imagem nenhuma (A6);
   - sem foto (ainda não aprovada, ou o dia já passou): as iniciais, como
     sempre. */
function avatarDaDiarista(nome, cor, classe, foto){
  /* o nome que a tela lê em voz alta é o curto ("Maria S."): nunca o
     sobrenome, nem escondido num atributo */
  const quem = esc(nomeCurto(nome));
  if(foto === "exemplo"){
    return '<div class="avatar com-foto-de-exemplo ' + (classe || "") + '" role="img" '
         + 'aria-label="Foto de ' + quem + '">👩🏽</div>';
  }
  if(typeof foto === "string" && foto.charAt(0) === "/" && foto.charAt(1) !== "/"){
    return '<div class="avatar com-foto ' + (classe || "") + '" style="background:' + (cor || "#6C3AD8") + '" '
         + 'role="img" aria-label="Foto de ' + quem + '">' + esc(iniciais(nome))
         + '<img src="' + esc(foto) + '" alt=""></div>';
  }
  return avatar(nome, cor, classe);
}

/* A FOTO DO CELULAR, REDUZIDA ANTES DE IR (R35): no máximo
   LADO_MAXIMO_DA_FOTO pixels do lado maior, em JPEG, num <canvas>. Serve
   ao documento e à selfie. Uma foto de câmera tem 3 a 6 MB; reduzida, umas
   centenas de KB — chega rápido e o servidor não engasga (ele confere tudo
   de novo: app/limpah/fotos.py, com o mesmo número; um teste compara).
   A foto fica só na memória, o tempo de ir: nunca no aparelho
   (localStorage), nunca no E. `pronto` recebe { ok, base64 } ou
   { ok:false, erro }. */
const LADO_MAXIMO_DA_FOTO = 1000;
const QUALIDADE_DA_FOTO = 0.85;
const FRASE_FOTO_NAO_ABRIU = "Não conseguimos abrir essa foto. Tire outra, por favor.";

/* A foto é lida como "data:" (FileReader), e não como "blob:"
   (URL.createObjectURL): a política de segurança das telas do app só deixa
   imagem do próprio site e "data:" (rotas/telas.py, img-src). Achado no
   navegador, na R35: com "blob:", o app recusava toda foto. */
function reduzirFoto(arquivo, pronto){
  const leitor = new FileReader();
  leitor.addEventListener("error", function(){ pronto({ ok:false, erro:FRASE_FOTO_NAO_ABRIU }); });
  leitor.addEventListener("load", function(){ desenharFotoReduzida(String(leitor.result || ""), pronto); });
  try {
    leitor.readAsDataURL(arquivo);
  } catch(e){
    pronto({ ok:false, erro:FRASE_FOTO_NAO_ABRIU });
  }
}

function desenharFotoReduzida(endereco, pronto){
  if(endereco.indexOf("data:image/") !== 0) return pronto({ ok:false, erro:FRASE_FOTO_NAO_ABRIU });
  const imagem = new Image();
  imagem.addEventListener("error", function(){ pronto({ ok:false, erro:FRASE_FOTO_NAO_ABRIU }); });
  imagem.addEventListener("load", function(){
    const largura = imagem.naturalWidth, altura = imagem.naturalHeight;
    const escala = Math.min(1, LADO_MAXIMO_DA_FOTO / Math.max(largura, altura, 1));
    const quadro = document.createElement("canvas");
    quadro.width = Math.max(1, Math.round(largura * escala));
    quadro.height = Math.max(1, Math.round(altura * escala));
    let texto = "";
    try {
      quadro.getContext("2d").drawImage(imagem, 0, 0, quadro.width, quadro.height);
      texto = quadro.toDataURL("image/jpeg", QUALIDADE_DA_FOTO);
    } catch(e){
      texto = "";
    }
    /* o quadro vazio solta a memória (celular com pouca memória) */
    quadro.width = 0;
    quadro.height = 0;
    const base64 = texto.indexOf("base64,") >= 0 ? texto.split("base64,")[1] : "";
    pronto(base64 ? { ok:true, base64:base64 } : { ok:false, erro:FRASE_FOTO_NAO_ABRIU });
  });
  imagem.src = endereco;
}

function cabecalho(titulo, extra){
  extra = extra || {};
  const botaoVoltar = extra.semVoltar ? "" :
    '<button class="voltar" onclick="voltar()" aria-label="Voltar">‹</button>';
  const direita = extra.passo
    ? '<span class="passo">' + esc(extra.passo) + '</span>'
    : (extra.passos ? passos(extra.passos[0], extra.passos[1]) : "");
  return '<div class="cabecalho">' + botaoVoltar
       + '<h1>' + esc(titulo) + '</h1>' + direita + '</div>';
}

function passos(atual, total){
  let s = '<div class="passos">';
  for(let i = 1; i <= total; i++) s += '<i class="' + (i <= atual ? "feito" : "") + '"></i>';
  return s + '</div>';
}

function abas(ativa){
  const itens = [
    { id:"inicio",    ic:"casa",   nome:"Início" },
    { id:"servicos",  ic:"lista",  nome:"Meus serviços" },
    { id:"mensagens", ic:"balao",  nome:"Mensagens" },
    { id:"perfil",    ic:"pessoa", nome:"Perfil" },
  ];
  return '<div class="abas">' + itens.map(function(i){
    return '<button class="' + (i.id === ativa ? "ativa" : "") + '" onclick="trocarAba(\'' + idSeguro(i.id) + '\')">'
         + '<span class="ic">' + icone(i.ic, 21) + '</span>' + i.nome + '</button>';
  }).join("") + '</div>';
}

function estrelas(nota){
  return "⭐ " + Number(nota).toFixed(1).replace(".", ",");
}

/* nomeCurto() — "Maria Silva" vira "Maria S." — mora no dados.js, junto
   das outras regras que o servidor também segue. */


/* --------------------------------------------------------------------------
   ÍCONES EM SVG

   Desenho vetorial escrito aqui dentro, em texto. Não é imagem de fora:
   não baixa nada, funciona sem internet e fica idêntico em qualquer
   aparelho — diferente do emoji, que cada sistema desenha do seu jeito.

   `cor` e `tamanho` são opcionais; por padrão herda a cor do texto ao redor.
   -------------------------------------------------------------------------- */
const DESENHOS = {
  /* escudo com um certo dentro: verificação feita */
  escudo: '<path d="M12 2 4 5v6c0 5 3.4 9.1 8 11 4.6-1.9 8-6 8-11V5l-8-3Z"/>'
        + '<path d="m8.6 11.8 2.2 2.2 4.6-4.6" stroke="#fff" stroke-width="2" '
        + 'fill="none" stroke-linecap="round" stroke-linejoin="round"/>',

  /* documento com linhas: documento conferido */
  documento: '<path d="M6 2h7l5 5v15H6V2Z"/>'
           + '<path d="M13 2v5h5" fill="rgba(255,255,255,.45)"/>'
           + '<path d="M9 13h6M9 16.5h4" stroke="#fff" stroke-width="1.8" '
           + 'stroke-linecap="round" fill="none"/>',


  /* --- categorias de serviço --- */
  vassoura: '<path d="M13.2 2.4 11 4.6l1.4 1.4 2.2-2.2a1 1 0 0 0-1.4-1.4Z"/>'
          + '<path d="M10.3 5.3 6.6 9l8.4 8.4 3.7-3.7-8.4-8.4Z"/>'
          + '<path d="M5.9 9.7 2.4 20.2a1 1 0 0 0 1.3 1.3l10.5-3.5L5.9 9.7Z" opacity=".55"/>',

  spray: '<path d="M9 2h5v3H9V2Z"/><path d="M8 6h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"/>'
       + '<circle cx="19.5" cy="4" r="1.1" opacity=".6"/><circle cx="21" cy="7" r="1.1" opacity=".6"/>'
       + '<circle cx="18.5" cy="9.5" r="1.1" opacity=".6"/>',

  camisa: '<path d="M9 2 4 4.6 5.6 9 8 8.2V22h8V8.2L18.4 9 20 4.6 15 2l-3 2-3-2Z"/>',

  ferramenta: '<path d="M20.6 5.4a5 5 0 0 1-6.4 6.4L5.8 20.2a2 2 0 1 1-2.8-2.8l8.4-8.4a5 5 0 0 1 6.4-6.4l-3 3 2.4 2.4 3-2.4Z"/>',

  /* --- tipo de limpeza --- */
  pano: '<path d="M4 6.5C7 4 10 4 12 5.6 14 7.2 17 7.2 20 5.5v9C17 16.2 14 16.2 12 14.6 10 13 7 13 4 15.5v-9Z"/>'
      + '<path d="M4 17.5C7 15 10 15 12 16.6 14 18.2 17 18.2 20 16.5v3C17 21.2 14 21.2 12 19.6 10 18 7 18 4 20.5v-3Z" opacity=".5"/>',

  brilho: '<path d="m12 2 1.9 5.6L19.5 9l-5.6 1.9L12 16.5l-1.9-5.6L4.5 9l5.6-1.4L12 2Z"/>'
        + '<path d="m18.5 15 .9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6Z" opacity=".65"/>',

  /* --- períodos do dia (exceção autorizada nº 3) --- */
  manha: '<circle cx="12" cy="12" r="4"/>'
       + '<path d="M12 2.5v2.2M12 19.3v2.2M4.2 12H2M22 12h-2.2M6.3 6.3 4.8 4.8M19.2 19.2l-1.5-1.5M17.7 6.3l1.5-1.5M4.8 19.2l1.5-1.5" '
       + 'stroke="currentColor" stroke-width="1.9" stroke-linecap="round" fill="none"/>',

  tarde: '<circle cx="12" cy="10" r="4.2"/>'
       + '<path d="M3 18h18M5.5 21h13" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" fill="none"/>',

  noite: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z"/>'
       + '<circle cx="17" cy="5.5" r="1"/><circle cx="20" cy="9" r=".8"/>',

  /* --- adicionais --- */
  ferro: '<path d="M3 15c0-4.4 3.6-8 8-8h10v3c0 2.8-2.2 5-5 5H3Z"/>'
       + '<path d="M3 17h18v3H3v-3Z" opacity=".55"/>',

  geladeira: '<path d="M6 2h12a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z"/>'
           + '<path d="M5 9h14" stroke="#fff" stroke-width="1.6" fill="none"/>'
           + '<path d="M8 5.5v2M8 11.5v3" stroke="#fff" stroke-width="1.8" stroke-linecap="round" fill="none"/>',

  armario: '<path d="M4 2h16v20H4V2Z"/><path d="M12 2v20" stroke="#fff" stroke-width="1.6" fill="none"/>'
         + '<path d="M10 11v2M14 11v2" stroke="#fff" stroke-width="1.8" stroke-linecap="round" fill="none"/>',

  janela: '<path d="M3 3h18v18H3V3Z"/><path d="M12 3v18M3 12h18" stroke="#fff" stroke-width="1.6" fill="none"/>',

  planta: '<path d="M12 21v-7"/><path d="M12 14c0-4-2.5-7-6.5-7.5C5 10.5 7.5 14 12 14Z"/>'
        + '<path d="M12 14c0-4.5 2.5-8 6.5-8.5C19 10 16.5 14 12 14Z" opacity=".6"/>'
        + '<path d="M8.5 21h7" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" fill="none"/>',

  sofa: '<path d="M4 11V8a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v3a2.5 2.5 0 0 0-2 2.4V15H6v-1.6A2.5 2.5 0 0 0 4 11Z"/>'
      + '<path d="M3 13.5h18a1 1 0 0 1 1 1V19H2v-4.5a1 1 0 0 1 1-1Z" opacity=".65"/>',

  maquina: '<path d="M5 2h14a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z"/>'
         + '<circle cx="12" cy="14" r="4.6" fill="#fff" opacity=".95"/>'
         + '<circle cx="12" cy="14" r="2.4"/>'
         + '<circle cx="7.5" cy="5.5" r="1"/><circle cx="10.5" cy="5.5" r="1"/>',

  /* --- barra de abas --- */
  casa: '<path d="M12 2.6 2.6 11h2.8v9.4h5V15h3.2v5.4h5V11h2.8L12 2.6Z"/>',

  predio: '<path d="M5 2h9a1 1 0 0 1 1 1v19H4V3a1 1 0 0 1 1-1Z"/>'
        + '<path d="M16 9h4a1 1 0 0 1 1 1v12h-5V9Z" opacity=".65"/>'
        + '<path d="M7 6h2v2H7V6Zm3.5 0h2v2h-2V6ZM7 10h2v2H7v-2Zm3.5 0h2v2h-2v-2ZM7 14h2v2H7v-2Zm3.5 0h2v2h-2v-2Z" fill="#fff"/>',

  lista: '<path d="M6 2h9l5 5v15H6V2Z"/><path d="M14 2v5h5" fill="rgba(255,255,255,.4)"/>'
       + '<path d="M9 12h7M9 15.5h5" stroke="#fff" stroke-width="1.7" stroke-linecap="round" fill="none"/>',

  balao: '<path d="M12 3c5 0 9 3.2 9 7.2s-4 7.2-9 7.2c-1 0-2-.1-2.9-.4L4 19.5l1.2-3.4C3.2 14.8 3 12.6 3 10.2 3 6.2 7 3 12 3Z"/>',

  pessoa: '<circle cx="12" cy="8" r="4"/>'
        + '<path d="M4 21c0-4.4 3.6-7.4 8-7.4s8 3 8 7.4H4Z"/>',

  /* --- abas da diarista: agenda e ganhos (R26, 12/10/2026) --- */
  calendario: '<path d="M4 5h16a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"/>'
            + '<path d="M7.5 2.5v4M16.5 2.5v4" stroke="currentColor" stroke-width="2.2" '
            + 'stroke-linecap="round" fill="none"/>'
            + '<path d="M3 10h18" stroke="#fff" stroke-width="1.6" fill="none"/>'
            + '<path d="M6.5 13h2.6v2.4H6.5V13Zm4.2 0h2.6v2.4h-2.6V13Zm4.2 0h2.6v2.4h-2.6V13ZM6.5 17h2.6v2.4H6.5V17Zm4.2 0h2.6v2.4h-2.6V17Z" fill="#fff"/>',

  carteira: '<path d="M5 4h12a1 1 0 0 1 1 1v2H5.5a1 1 0 0 0 0 2H20a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/>'
          + '<path d="M15 12.5h6v4h-6a2 2 0 0 1 0-4Z" fill="#fff" opacity=".9"/>'
          + '<circle cx="15.6" cy="14.5" r="1.1"/>',

  /* --- escolha de perfil --- */
  casaCoracao: '<path d="M12 2.6 2.6 11h2.8v9.4h13.2V11h2.8L12 2.6Z"/>'
             + '<path d="M12 18.2c-2.8-2-4-3.2-4-4.7a2 2 0 0 1 4-.7 2 2 0 0 1 4 .7c0 1.5-1.2 2.7-4 4.7Z" fill="#fff"/>',

  maleta: '<path d="M9 4h6a1 1 0 0 1 1 1v2h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3V5a1 1 0 0 1 1-1Zm1 3h4V6h-4v1Z"/>'
        + '<path d="M3 12h18" stroke="#fff" stroke-width="1.5" fill="none" opacity=".7"/>',

  /* rosto dentro de uma moldura: identidade confirmada por selfie */
  rosto: '<path d="M4 4h5v2H6v3H4V4Zm11 0h5v5h-2V6h-3V4ZM4 15h2v3h3v2H4v-5Zm14 0h2v5h-5v-2h3v-3Z"/>'
       + '<circle cx="12" cy="10.5" r="2.6"/>'
       + '<path d="M7.6 17.4c.7-2.2 2.4-3.4 4.4-3.4s3.7 1.2 4.4 3.4" '
       + 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
};

function icone(nome, tamanho, cor){
  const d = DESENHOS[nome];
  if(!d) return "";
  return '<svg viewBox="0 0 24 24" width="' + (tamanho || 20) + '" height="' + (tamanho || 20) + '" '
       + 'fill="' + (cor || "currentColor") + '" aria-hidden="true" '
       + 'style="display:block;flex:none">' + d + '</svg>';
}


/* --------------------------------------------------------------------------
   DATAS — o protótipo sempre mostra os próximos 14 dias a partir de hoje
   -------------------------------------------------------------------------- */
const DIAS_SEMANA = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
const MESES = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
const MESES_LONGOS = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];

function proximosDias(quantos){
  const lista = [];
  const hoje = new Date();
  hoje.setHours(0,0,0,0);
  for(let i = 0; i < quantos; i++){
    const d = new Date(hoje);
    d.setDate(hoje.getDate() + i);
    lista.push({
      iso: d.toISOString().slice(0,10),
      rotulo: i === 0 ? "Hoje" : (i === 1 ? "Amanhã" : DIAS_SEMANA[d.getDay()]),
      curto: String(d.getDate()).padStart(2,"0") + "/" + String(d.getMonth()+1).padStart(2,"0"),
      dia: d.getDate(),
      mes: MESES[d.getMonth()],
      ehHoje: i === 0,
    });
  }
  return lista;
}

function dataPorExtenso(iso){
  if(!iso) return "";
  const dias = proximosDias(14);
  const achou = dias.find(function(d){ return d.iso === iso; });
  if(achou && (achou.rotulo === "Hoje" || achou.rotulo === "Amanhã")){
    return achou.rotulo + ", " + achou.curto;
  }
  const partes = iso.split("-");
  const d = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
  return DIAS_SEMANA[d.getDay()] + ", " + d.getDate() + " de " + MESES[d.getMonth()];
}

/* "14/10/2026 às 12h03": como o servidor escreve a hora de uma decisão da
   equipe e de uma resposta dela (o em_texto). Só a maquete monta pelo
   relógio do aparelho; no app, o texto vem pronto do servidor, no horário
   de Brasília. */
function dataEHoraEmTexto(d){
  return String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0")
       + "/" + d.getFullYear() + " às " + d.getHours() + "h" + String(d.getMinutes()).padStart(2, "0");
}

/* --------------------------------------------------------------------------
   PRAZOS: o que ainda dá tempo de pedir
   -------------------------------------------------------------------------- */

/* Quantas horas faltam para este período começar, neste dia. */
function horasAteOPeriodo(iso, periodoId){
  const p = PERIODOS.find(function(x){ return x.id === periodoId; });
  if(!p || !iso) return 999;
  const partes = iso.split("-");
  const inicio = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]), p.inicio, 0, 0);
  return (inicio - new Date()) / 3600000;
}

/* Este período, neste dia, ainda pode ser pedido? */
function periodoAindaServe(iso, periodoId){
  return horasAteOPeriodo(iso, periodoId) >= ANTECEDENCIA_MINIMA_HORAS;
}

/* Sobrou algum período hoje? Se não sobrou, o botão "Hoje" nem aparece. */
function hojeAindaServe(){
  const hoje = proximosDias(1)[0].iso;
  return PERIODOS.some(function(p){ return periodoAindaServe(hoje, p.id); });
}

/* --------------------------------------------------------------------------
   A JANELA DE PRESENÇA (decisão R9)

   O cliente não contrata "8 horas": contrata "das 8h às 16h". Estas funções
   transformam período escolhido + tamanho da janela em horas de relógio.
   -------------------------------------------------------------------------- */
const FIM_DO_DIA = 20;   // ninguém começa serviço que varre a noite adentro

function janelaDoServico(periodoId, horasDaJanela){
  const p = PERIODOS.find(function(x){ return x.id === periodoId; });
  if(!p) return null;
  const inicio = p.inicio;
  const fim = inicio + horasDaJanela;
  return {
    inicio: inicio,
    fim: fim,
    cabeNoDia: fim <= FIM_DO_DIA,
    texto: "das " + inicio + "h às " + fim + "h",
  };
}

/* Serviço grande não cabe começando à noite. Quando não cabe, a tela avisa
   e manda escolher um período mais cedo — em vez de prometer o impossível. */
function periodosQueComportam(horasDaJanela){
  return PERIODOS.filter(function(p){
    return p.inicio + horasDaJanela <= FIM_DO_DIA;
  });
}

function nomePeriodo(id){
  const p = PERIODOS.find(function(x){ return x.id === id; });
  return p ? (p.nome + " (" + p.faixa + ")") : "";
}

/* O período na linha logo acima de "Ela fica na sua casa: das 12h às 18h".
   Com a janela padrão, o nome com a faixa ("Tarde (12h às 16h)"); com uma
   janela maior, só o nome ("Tarde") — a faixa padrão contradiria a janela
   de verdade, na linha de baixo. */
function nomePeriodoComAJanela(id, textoDaJanela){
  const p = PERIODOS.find(function(x){ return x.id === id; });
  if(!p) return "";
  return ("das " + p.faixa === textoDaJanela) ? nomePeriodo(id) : p.nome;
}


/* --------------------------------------------------------------------------
   LIGAR O APP
   -------------------------------------------------------------------------- */

/* SEM A TOMADA, NÃO LIGA — mas diz por quê. Logo depois de publicar, o
   celular pode juntar a página antiga (guardada por alguns minutos) com
   os arquivos novos; a página antiga não carrega a tomada, e a tela
   ficaria em branco. No app de verdade, é a mesma coisa: sem a tomada do
   servidor, nada funciona — e esta frase aparece no lugar. */
function avisoDeVersaoNova(){
  const palco = document.getElementById("palco");
  if(!palco) return;
  palco.innerHTML = '<div class="tela"><div class="centro">'
    + '<div class="emojao">🔄</div>'
    + '<h2 class="titulo">Atualizamos o app</h2>'
    + '<p class="apoio">Toque no botão para carregar a versão nova.</p>'
    + '</div><div class="rodape">'
    + '<button class="btn btn-principal" onclick="location.reload()">Carregar a versão nova</button>'
    + '</div></div>';
}

if(typeof FONTE === "undefined"){
  avisoDeVersaoNova();
} else {
  carregar();

  if(FONTE.ehMaquete){
    criarCasaDeQuemJaUsava();

    /* Se a pessoa já usou o protótipo antes, não faz sentido mostrar o splash
       e a escolha de perfil de novo — o documento pede exatamente isso na
       seção 4: "o app deve lembrar o perfil e abrir direto na home". */
    if(E.logado && E.tela === "splash") E.tela = "home";
  } else {
    /* No app, quem diz se há alguém logado é o servidor, não o que ficou
       guardado no aparelho: começa sempre pela splash, que pergunta. Sem
       isso, o app desenharia a tela guardada sem nada do servidor. */
    TELA_ANTES_DE_ABRIR = E.tela;
    E.tela = "splash";
    E.historico = [];
    E.logado = false;      // só o servidor diz que está (FONTE.arranque)
  }

  desenhar();
}
