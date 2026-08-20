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
    { id:"inicio",    ic:"🏠", nome:"Início" },
    { id:"servicos",  ic:"📋", nome:"Meus serviços" },
    { id:"mensagens", ic:"💬", nome:"Mensagens" },
    { id:"perfil",    ic:"👤", nome:"Perfil" },
  ];
  return '<div class="abas">' + itens.map(function(i){
    return '<button class="' + (i.id === ativa ? "ativa" : "") + '" onclick="trocarAba(\'' + i.id + '\')">'
         + '<span class="ic">' + i.ic + '</span>' + i.nome + '</button>';
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
