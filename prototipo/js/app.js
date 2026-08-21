/* ==========================================================================
   LIMPAH — MOTOR DO PROTÓTIPO
   Cuida de: qual tela está aberta, o botão voltar, e guardar o que o
   usuário fez (para não perder tudo ao atualizar a página).

   As telas em si estão nos arquivos telas-acesso.js e telas-cliente.js.
   ========================================================================== */


/* --------------------------------------------------------------------------
   O ESTADO — tudo que o app "lembra" no momento
   -------------------------------------------------------------------------- */
let E = {};

function estadoNovo(){
  return {
    tela: "splash",
    historico: [],
    perfil: null,          // "cliente" ou "diarista"
    logado: false,
    cliente: null,
    aba: "inicio",
    pedido: pedidoNovo(),
    pedidos: [],           // serviços já solicitados
    favoritos: [1, 2],     // ids de PROFISSIONAIS
    naoLidas: 1,
    busca: { minutos:0, modo:"normal", jaAvisou:false },   // relógio da régua da busca
  };
}

function pedidoNovo(){
  return {
    categoria: null,
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

function salvar(){
  try{ localStorage.setItem(CHAVE, JSON.stringify(E)); }catch(e){}
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

function reiniciarPrototipo(){
  try{ localStorage.removeItem(CHAVE); }catch(e){}
  E = estadoNovo();
  desenhar();
}


/* --------------------------------------------------------------------------
   NAVEGAÇÃO
   -------------------------------------------------------------------------- */
function ir(nome, opcoes){
  opcoes = opcoes || {};
  if(!TELAS[nome]){
    console.warn("Tela não encontrada:", nome);
    return;
  }
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

function voltar(){
  const anterior = E.historico.pop();
  E.tela = anterior || "home";
  salvar();
  desenhar();
}

function trocarAba(aba){
  E.aba = aba;
  const destino = { inicio:"home", servicos:"meusServicos", mensagens:"mensagens", perfil:"perfilCliente" }[aba];
  ir(destino, { limparHistorico:true });
}

function desenhar(){
  const tela = TELAS[E.tela];
  if(!tela) return;
  pararRelogios();                 // nenhum contador de uma tela antiga sobrevive
  const palco = document.getElementById("palco");
  palco.innerHTML = '<div class="tela">' + tela.html() + '</div>';
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

function esc(txt){
  return String(txt == null ? "" : txt)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
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
    return '<button class="' + (i.id === ativa ? "ativa" : "") + '" onclick="trocarAba(\'' + i.id + '\')">'
         + '<span class="ic">' + icone(i.ic, 21) + '</span>' + i.nome + '</button>';
  }).join("") + '</div>';
}

function estrelas(nota){
  return "⭐ " + Number(nota).toFixed(1).replace(".", ",");
}

/* --------------------------------------------------------------------------
   NOME CURTO — regra de privacidade do produto

   O cliente nunca vê o sobrenome inteiro da profissional. "Maria Silva"
   aparece como "Maria S." em qualquer tela do cliente. É o que impede
   alguém de procurar a pessoa fora do aplicativo.
   -------------------------------------------------------------------------- */
function nomeCurto(nome){
  const partes = String(nome || "").trim().split(/\s+/);
  if(partes.length < 2) return partes[0] || "";
  return partes[0] + " " + partes[partes.length - 1][0].toUpperCase() + ".";
}


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

  lista: '<path d="M6 2h9l5 5v15H6V2Z"/><path d="M14 2v5h5" fill="rgba(255,255,255,.4)"/>'
       + '<path d="M9 12h7M9 15.5h5" stroke="#fff" stroke-width="1.7" stroke-linecap="round" fill="none"/>',

  balao: '<path d="M12 3c5 0 9 3.2 9 7.2s-4 7.2-9 7.2c-1 0-2-.1-2.9-.4L4 19.5l1.2-3.4C3.2 14.8 3 12.6 3 10.2 3 6.2 7 3 12 3Z"/>',

  pessoa: '<circle cx="12" cy="8" r="4"/>'
        + '<path d="M4 21c0-4.4 3.6-7.4 8-7.4s8 3 8 7.4H4Z"/>',

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

function nomePeriodo(id){
  const p = PERIODOS.find(function(x){ return x.id === id; });
  return p ? (p.nome + " (" + p.faixa + ")") : "";
}


/* --------------------------------------------------------------------------
   LIGAR O APP
   -------------------------------------------------------------------------- */
carregar();

/* Se a pessoa já usou o protótipo antes, não faz sentido mostrar o splash
   e a escolha de perfil de novo — o documento pede exatamente isso na
   seção 4: "o app deve lembrar o perfil e abrir direto na home". */
if(E.logado && E.tela === "splash") E.tela = "home";

desenhar();
