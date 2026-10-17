/* ==========================================================================
   LIMPAH — TELAS DE PRIMEIRO ACESSO
   Splash, escolha de perfil, login, recuperação de senha e cadastro.
   Corresponde ao bloco 1 do desenho aprovado (Fluxo-Página-Diaristas.png).
   ========================================================================== */


/* --------------------------------------------------------------------------
   01. SPLASH
   -------------------------------------------------------------------------- */
/* A frase de quando a splash não conseguiu perguntar ao servidor quem está
   logado (sem internet, ou o servidor demorou demais). Vazia = carregando.
   Só acontece no app: a maquete não depende de internet. */
let SPLASH_SEM_CONEXAO = "";

TELAS.splash = {
  html: function(){
    return ''
    + '<div class="noite">'
    +   '<div class="pulsando">'
    +     '<div class="marca">Limpah <span class="brilho">✦</span></div>'
    +     '<div class="slogan">Sua casa bem cuidada,<br>sua vida mais leve.</div>'
    +   '</div>'
    +   (SPLASH_SEM_CONEXAO ? splashSemConexao() :
         '<div style="margin-top:46px;display:flex;flex-direction:column;align-items:center;gap:12px">'
    +     '<div class="girando"></div>'
    +     '<div style="font-size:12.5px;opacity:.7">Carregando...</div>'
    +   '</div>')
    + '</div>';
  },
  aoEntrar: function(){
    if(SPLASH_SEM_CONEXAO) return;     // espera o "Tentar de novo"
    /* Quem diz para onde ir é a tomada (FONTE.arranque). Na maquete, depois
       de 1,8 segundo, pelo que ficou guardado neste aparelho. No app, o
       servidor responde se já existe alguém logado. A splash nunca fica
       presa: sem resposta, diz que está sem conexão e oferece tentar de novo. */
    FONTE.arranque(function(r){
      if(E.tela !== "splash") return;
      if(!r.ok){
        SPLASH_SEM_CONEXAO = r.erro || "Sem conexão. Confira a internet e toque em Tentar de novo.";
        desenhar();
        return;
      }
      /* no app, quem recarregou no meio do cadastro volta ao passo 1, com
         o que tinha digitado e o pedido da senha de novo (r.aviso) */
      avisarNaTela(r.aviso);
      ir(r.destino || "perfil", { limparHistorico:true });
    });
  }
};

function splashSemConexao(){
  return ''
  + '<div style="margin-top:46px;display:flex;flex-direction:column;align-items:center;gap:14px;width:100%;max-width:320px">'
  +   '<div style="font-size:14px;line-height:1.5">' + esc(SPLASH_SEM_CONEXAO) + '</div>'
  +   '<button class="btn btn-claro" onclick="tentarArranqueDeNovo()">Tentar de novo</button>'
  + '</div>';
}

function tentarArranqueDeNovo(){
  SPLASH_SEM_CONEXAO = "";
  desenhar();
}


/* --------------------------------------------------------------------------
   02. ESCOLHA DO PERFIL
   -------------------------------------------------------------------------- */
TELAS.perfil = {
  aoEntrar: function(){ esquecerARecuperacao(); },
  html: function(){
    return ''
    + '<div class="corpo" style="display:flex;flex-direction:column;justify-content:center">'
    +   '<div style="text-align:center;margin-bottom:26px">'
    +     '<div class="marca" style="color:var(--roxo);font-size:30px">Limpah <span style="color:#A97BFF">✦</span></div>'
    +   '</div>'
    +   '<h2 class="titulo" style="text-align:center">Como você deseja usar o Limpah?</h2>'
    +   '<p class="apoio" style="text-align:center">Escolha uma opção para continuar</p>'

    +   '<button class="opcao" onclick="escolherPerfil(\'cliente\')">'
    +     '<div class="icone">' + icone("casaCoracao", 22) + '</div>'
    +     '<div class="txt"><b>Contratar um serviço</b>'
    +       '<span>Encontre a diarista ideal para a sua casa de forma rápida e segura.</span></div>'
    +     '<div class="seta">›</div>'
    +   '</button>'

    +   '<button class="opcao" onclick="escolherPerfil(\'diarista\')">'
    +     '<div class="icone">' + icone("maleta", 22) + '</div>'
    +     '<div class="txt"><b>Trabalhar como diarista</b>'
    +       '<span>Receba oportunidades de trabalho e aumente sua renda.</span></div>'
    +     '<div class="seta">›</div>'
    +   '</button>'

    +   '<p class="apoio" style="text-align:center;margin-top:20px">'
    +     'Já possui uma conta? <a href="#" onclick="ir(\'login\');return false;" '
    +     'style="color:var(--roxo);font-weight:700;text-decoration:none">Entrar</a></p>'
    + '</div>';
  }
};

function escolherPerfil(qual){
  E.perfil = qual;
  salvar();
  ir(qual === "cliente" ? "cadastroCliente" : "cadastroDiarista");
}


/* --------------------------------------------------------------------------
   03. LOGIN
   -------------------------------------------------------------------------- */
TELAS.login = {
  html: function(){
    return ''
    + cabecalho("")
    + '<div class="corpo">'
    +   '<h2 class="titulo">Bem-vindo(a) de volta! 👋</h2>'
    +   '<p class="apoio">Faça login para continuar</p>'

    /* o e-mail e a senha já preenchidos são só da maquete (para entrar
       com um toque); no app, os campos começam vazios */
    +   '<div class="campo"><label>E-mail ou telefone</label>'
    +     '<input id="log-email" type="text" placeholder="Digite seu e-mail ou telefone" '
    +       'autocomplete="username" autocapitalize="none" spellcheck="false"'
    +       soNaMaquete(' value="ana@exemplo.com"') + '>'
    +     erroDoCampo("log-email-erro", "login", "email_ou_telefone") + '</div>'
    +   '<div class="campo"><label>Senha</label>'
    +     '<div style="position:relative">'
    +       '<input id="log-senha" type="password" placeholder="Digite sua senha" '
    +         'autocomplete="current-password"' + soNaMaquete(' value="123456"')
    +         ' style="padding-right:46px">'
    +       '<button onclick="verSenha(\'log-senha\')" aria-label="Mostrar senha" '
    +         'class="olho">\ud83d\udc41</button>'
    +     '</div>'
    +     erroDoCampo("log-erro", "login", "") + '</div>'

    +   '<p style="text-align:right;margin:-4px 0 18px">'
    +     '<a href="#" onclick="ir(\'recuperar\');return false;" '
    +     'style="color:var(--roxo);font-size:13px;font-weight:600;text-decoration:none">Esqueceu sua senha?</a></p>'

    +   '<button class="btn btn-principal" onclick="fazerLogin(this)">Entrar</button>'

    +   '<div style="display:flex;align-items:center;gap:10px;margin:20px 0;color:var(--suave);font-size:12px">'
    +     '<div style="flex:1;height:1px;background:var(--borda)"></div>ou'
    +     '<div style="flex:1;height:1px;background:var(--borda)"></div></div>'

    +   '<button class="btn btn-claro" onclick="entrarComOutraConta(\'google\')">Entrar com Google</button>'
    +   '<button class="btn btn-claro" onclick="entrarComOutraConta(\'apple\')">Entrar com Apple</button>'
    +   erroDoCampo("log-outra-erro", "login", "outra_conta")

    +   '<p class="apoio" style="text-align:center;margin-top:22px">'
    +     'Ainda não tem conta? <a href="#" onclick="ir(\'perfil\');return false;" '
    +     'style="color:var(--roxo);font-weight:700;text-decoration:none">Cadastre-se</a></p>'

    + '</div>';
  },
  /* quem voltou do "esqueci a senha" para cá largou a recuperação: o
     contato que ela digitou não fica na memória para a próxima pessoa do
     mesmo celular */
  aoEntrar: function(){ esquecerARecuperacao(); }
};

/* Entrar. Na maquete, qualquer coisa entra (e o testes.js chama isto sem a
   tela desenhada). No app, o servidor confere o e-mail ou telefone e a
   senha (R28), e diz para onde ir: o código do celular, os termos novos ou
   o início. */
function fazerLogin(botao){
  mostrarErro("log-email-erro", "");
  mostrarErro("log-erro", "");
  mostrarErro("log-outra-erro", "");
  FONTE.entrar({
    emailOuTelefone: valorDoCampo("log-email").trim(),
    senha: valorDoCampo("log-senha"),
  }, function(r){
    if(!r.ok) return mostrarErroDoLogin(r);
    ir(r.destino, { limparHistorico:true });
  }, { botao: botao });
}

/* "Entrar com Google" e "Entrar com Apple". Na maquete, entram como o
   "Entrar". No app ainda não existem (R28): a frase diz que chegam em
   breve, e como entrar enquanto isso. */
function entrarComOutraConta(qual){
  mostrarErro("log-outra-erro", "");
  FONTE.entrarCom(qual, function(r){
    if(!r.ok) return mostrarErro("log-outra-erro", r.erro);
    ir(r.destino, { limparHistorico:true });
  });
}

function mostrarErroDoLogin(r){
  if(r.destino) return seguirPeloErro(r);
  mostrarErro(r.campo === "email_ou_telefone" ? "log-email-erro" : "log-erro", r.erro);
}

/* Quando a resposta manda a pessoa para outra tela (o cadastro não existe
   mais, a sessão venceu, falta confirmar o celular...), com a frase que
   ela vai ler lá. */
function seguirPeloErro(r){
  avisarNaTela(r.aviso);
  ir(r.destino, { limparHistorico:true });
}


/* --------------------------------------------------------------------------
   05. RECUPERAR SENHA — por código no WhatsApp (decisão R28)

   A tela 05 da imagem, com a única troca de texto da R28: "receber o
   código", e não "o link". O código de 6 números vai SEMPRE ao WhatsApp do
   celular confirmado da conta, mesmo quando a pessoa digita o e-mail. A
   resposta é sempre a mesma, exista a conta ou não: a tela nunca diz se o
   contato tem conta (quem tenta descobrir de quem é um e-mail não aprende
   nada aqui).

   Depois vêm duas telas que a imagem não desenhou (R4): digitar o código
   com a senha nova, e "senha nova salva". Quem troca a senha já entra, e
   sai da conta nos outros aparelhos.

   O e-mail ou telefone digitado fica só na memória (CONTATO_DA_RECUPERACAO),
   para preencher a tela seguinte: nunca no aparelho.
   -------------------------------------------------------------------------- */
let CONTATO_DA_RECUPERACAO = "";
/* Para onde vai quem acabou de trocar a senha (a tomada diz: o início dele). */
let DESTINO_DEPOIS_DA_SENHA_NOVA = "";

/* A recuperação foi largada (a pessoa voltou ao login ou à escolha de
   perfil): o contato some da memória. */
function esquecerARecuperacao(){
  CONTATO_DA_RECUPERACAO = "";
}

const FRASE_DIGITE_O_CONTATO = "Digite o seu e-mail ou o celular com DDD.";

TELAS.recuperar = {
  html: function(){
    return ''
    + cabecalho("")
    + '<div class="corpo">'
    +   '<h2 class="titulo">Recuperar senha 🔒</h2>'
    +   '<p class="apoio">Digite seu e-mail ou telefone para receber o código de redefinição.</p>'
    +   '<div class="campo"><label>E-mail ou telefone</label>'
    +     '<input id="rec-quem" type="text" placeholder="Digite seu e-mail ou telefone" '
    +       'autocomplete="username" autocapitalize="none" spellcheck="false"'
    +       valorJaDigitado(CONTATO_DA_RECUPERACAO) + '>'
    +     erroDoCampo("rec-quem-erro", "recuperar", "email_ou_telefone") + '</div>'
    +   erroDoCampo("rec-erro", "recuperar", "")
    +   '<button class="btn btn-principal" onclick="pedirCodigoDaSenha(this)">Enviar código</button>'
    /* só no app (A28, revisão da 4): quem já recebeu um código — inclusive
       um que ela não pediu agora — vai direto digitá-lo, sem pedir outro */
    +   (FONTE.ehMaquete ? ""
      : '<button class="btn btn-texto" onclick="jaTenhoUmCodigo()">Já tenho um código</button>')
    +   '<button class="btn btn-texto" onclick="ir(\'login\')">Voltar para o login</button>'
    + '</div>';
  }
};

/* "Enviar código": a tomada pede o código (no app, ao servidor). Na volta,
   a tela de "código enviado" — a mesma, com conta ou sem. O "espere" (este
   contato já pediu daqui há menos de 1 minuto) também leva a ela: o código
   daquele pedido é o que vale, e a tela seguinte conta o minuto do "Mandar
   de novo" (antes, a pessoa ficava parada aqui, sem como digitar o código). */
function pedirCodigoDaSenha(botao){
  mostrarErro("rec-quem-erro", "");
  mostrarErro("rec-erro", "");
  const quem = valorDoCampo("rec-quem").trim();
  CONTATO_DA_RECUPERACAO = quem;
  FONTE.pedirCodigoDaSenha({ emailOuTelefone: quem }, function(r){
    if(!r.ok && r.motivo === "espere") return ir("recuperarEnviado");
    if(!r.ok) return mostrarErro(r.campo === "email_ou_telefone" ? "rec-quem-erro" : "rec-erro",
                                 comADicaDoCodigo(r, "recuperar"));
    ir("recuperarEnviado");
  }, { botao: botao });
}

/* "Já pedimos muitos códigos" (só no app: o servidor diz o que houve). O
   código que já chegou continua valendo, e cada tela diz onde digitá-lo —
   a "Crie uma nova senha" não tem o botão "Já tenho um código" (revisão
   da 4). */
const DICA_DO_CODIGO_QUE_JA_CHEGOU = {
  recuperar: 'Se um código já chegou, toque em "Já tenho um código".',
  recuperarNovaSenha: "Se um código já chegou, digite-o no campo Código, logo abaixo.",
};

function comADicaDoCodigo(r, tela){
  return r.motivo === "muitos_pedidos" && DICA_DO_CODIGO_QUE_JA_CHEGOU[tela]
    ? r.erro + " " + DICA_DO_CODIGO_QUE_JA_CHEGOU[tela] : r.erro;
}

/* "Já tenho um código": a tela do código, com o contato que já estava no
   campo (só na memória, como sempre). */
function jaTenhoUmCodigo(){
  CONTATO_DA_RECUPERACAO = valorDoCampo("rec-quem").trim();
  ir("recuperarNovaSenha");
}

TELAS.recuperarEnviado = {
  html: function(){
    return ''
    + cabecalho("")
    + '<div class="centro">'
    +   '<div class="emojao">📬</div>'
    +   '<h2 class="titulo">Código enviado!</h2>'
    +   '<p class="apoio">Se existir uma conta com esse contato, o código chega pelo WhatsApp '
    +     'do celular cadastrado em alguns instantes.</p>'
    + '</div>'
    + '<div class="rodape">'
    +   '<button class="btn btn-principal" onclick="ir(\'recuperarNovaSenha\')">Digitar o código</button>'
    +   '<button class="btn btn-texto" onclick="ir(\'login\')">Voltar para o login</button>'
    + '</div>';
  }
};

/* O código + a senha nova (tela nova, R4: a imagem não desenhou). O
   contato vem preenchido com o da tela anterior, e dá para corrigir.
   "Mandar de novo" só depois de 1 minuto: o relógio mexe só no botão, sem
   redesenhar (redesenhar apagaria o código e a senha digitados). */
TELAS.recuperarNovaSenha = {
  html: function(){
    const falta = FONTE.ler.recuperacao().segundosParaMandarDeNovo;
    return ''
    + cabecalho("")
    + '<div class="corpo">'
    +   '<h2 class="titulo">Crie uma nova senha 🔑</h2>'
    +   '<p class="apoio">Digite o código de 6 números que mandamos pelo WhatsApp e escolha a '
    +     'sua senha nova.</p>'
    +   '<div class="campo"><label>E-mail ou telefone</label>'
    +     '<input id="rns-quem" type="text" placeholder="Digite seu e-mail ou telefone" '
    +       'autocomplete="username" autocapitalize="none" spellcheck="false"'
    +       valorJaDigitado(CONTATO_DA_RECUPERACAO) + '>'
    +     erroDoCampo("rns-quem-erro", "recuperarNovaSenha", "email_ou_telefone") + '</div>'
    +   '<div class="campo"><label>Código</label>'
    +     '<input id="rns-codigo" class="codigo" type="text" inputmode="numeric" '
    +       'autocomplete="one-time-code" maxlength="7" placeholder="000000">'
    +     erroDoCampo("rns-codigo-erro", "recuperarNovaSenha", "codigo") + '</div>'
    +   '<div class="campo"><label>Nova senha</label>'
    +     '<div style="position:relative">'
    +       '<input id="rns-senha" type="password" placeholder="Crie uma senha" '
    +         'autocomplete="new-password" style="padding-right:46px">'
    +       '<button onclick="verSenha(\'rns-senha\')" aria-label="Mostrar senha" class="olho">'
    +         '👁</button>'
    +     '</div>'
    +     erroDoCampo("rns-senha-erro", "recuperarNovaSenha", "senha") + '</div>'
    +   erroDoCampo("rns-erro", "recuperarNovaSenha", "")
    +   '<p class="ajuda" id="rns-aviso"></p>'
    +   '<p class="ajuda">Não chegou? Confira o e-mail ou telefone e toque em Mandar de novo. '
    +     'Se você não chegou a confirmar o celular no cadastro, faça o cadastro de novo.</p>'
    +   soNaMaquete('<div class="cartao maquete"><b>⚙ NA MAQUETE</b>'
    +     '<div>Qualquer código de 6 números serve.</div></div>')
    + '</div>'
    + '<div class="rodape">'
    +   '<button class="btn btn-principal" id="rns-salvar" onclick="salvarSenhaNova(this)">Salvar nova senha</button>'
    +   '<button class="btn btn-contorno" id="rns-reenviar" onclick="mandarCodigoDaSenhaDeNovo(this)"'
    +     (falta > 0 ? ' disabled' : '') + '>' + esc(textoDoMandarDeNovo(falta)) + '</button>'
    +   '<button class="btn btn-texto" onclick="ir(\'login\')">Voltar para o login</button>'
    + '</div>';
  },
  aoEntrar: function(){
    FALTAVA_PARA_MANDAR_O_DA_SENHA = FONTE.ler.recuperacao().segundosParaMandarDeNovo;
    repetir(atualizarMandarOCodigoDaSenha, 1000);
  }
};

/* Quanto faltava no último toque do relógio (como o da tela do código do
   celular: o botão só é ligado na passagem de "falta" para "pode"). */
let FALTAVA_PARA_MANDAR_O_DA_SENHA = 0;

function atualizarMandarOCodigoDaSenha(){
  const botao = document.getElementById("rns-reenviar");
  if(!botao) return;
  const falta = FONTE.ler.recuperacao().segundosParaMandarDeNovo;
  if(falta > 0){
    botao.disabled = true;
    botao.textContent = textoDoMandarDeNovo(falta);
  } else if(FALTAVA_PARA_MANDAR_O_DA_SENHA > 0){
    botao.disabled = false;
    botao.textContent = textoDoMandarDeNovo(0);
  }
  FALTAVA_PARA_MANDAR_O_DA_SENHA = falta;
}

/* Os lugares de erro da tela, embaixo de cada campo. */
const ERRO_DO_CAMPO_DA_SENHA_NOVA = {
  email_ou_telefone: "rns-quem-erro", codigo: "rns-codigo-erro", senha: "rns-senha-erro",
};

function limparErrosDaSenhaNova(){
  ["rns-quem-erro", "rns-codigo-erro", "rns-senha-erro", "rns-erro", "rns-aviso"].forEach(function(id){
    mostrarErro(id, "");
  });
}

function mostrarErroDaSenhaNova(r){
  if(r.destino) return seguirPeloErro(r);
  mostrarErro(ERRO_DO_CAMPO_DA_SENHA_NOVA[r.campo] || "rns-erro", r.erro);
}

/* "Salvar nova senha". O código mal digitado nem sai daqui (como na tela do
   código do celular). A senha fica só no campo: nunca no E nem no aparelho. */
function salvarSenhaNova(botao){
  limparErrosDaSenhaNova();
  const quem = valorDoCampo("rns-quem").trim();
  const codigo = valorDoCampo("rns-codigo").replace(/[\s.\-]/g, "");
  const senha = valorDoCampo("rns-senha");
  if(!quem) return mostrarErro("rns-quem-erro", FRASE_DIGITE_O_CONTATO);
  if(!/^[0-9]{6}$/.test(codigo)) return mostrarErro("rns-codigo-erro", FRASE_DO_CODIGO_MAL_DIGITADO);
  if(!senha) return mostrarErro("rns-senha-erro", "Crie uma senha.");
  CONTATO_DA_RECUPERACAO = quem;
  FONTE.trocarSenha({ emailOuTelefone: quem, codigo: codigo, senha: senha }, function(r){
    if(!r.ok) return mostrarErroDaSenhaNova(r);
    CONTATO_DA_RECUPERACAO = "";
    DESTINO_DEPOIS_DA_SENHA_NOVA = r.destino || "";
    ir("senhaTrocada", { limparHistorico:true });
  }, { botao: botao });
}

/* "Mandar de novo", para o contato que está no campo. A frase é a mesma,
   com conta ou sem. */
function mandarCodigoDaSenhaDeNovo(botao){
  limparErrosDaSenhaNova();
  const quem = valorDoCampo("rns-quem").trim();
  CONTATO_DA_RECUPERACAO = quem;
  FONTE.pedirCodigoDaSenha({ emailOuTelefone: quem }, function(r){
    if(!r.ok && r.motivo === "muitos_pedidos" && !r.destino)
      return mostrarErroDaSenhaNova({ ok:false, campo:r.campo, erro:comADicaDoCodigo(r, "recuperarNovaSenha") });
    if(!r.ok) return mostrarErroDaSenhaNova(r);
    mostrarErro("rns-aviso", "Pronto! Se existir uma conta com esse contato, mandamos um código novo.");
  }, { botao: botao });
}

/* Senha nova salva (tela nova, R4). A pessoa já está na conta; o
   "Continuar" leva ao início dela. */
TELAS.senhaTrocada = {
  html: function(){
    return ''
    + '<div class="centro">'
    +   '<div class="emojao">✅</div>'
    +   '<h2 class="titulo">Senha nova salva!</h2>'
    +   '<p class="apoio">Pronto, você já está na sua conta. Por segurança, saímos dela nos '
    +     'outros aparelhos.</p>'
    + '</div>'
    + '<div class="rodape">'
    +   '<button class="btn btn-principal" onclick="continuarDepoisDaSenhaNova()">Continuar</button>'
    + '</div>';
  }
};

/* Sem o destino na memória (a página foi recarregada nesta tela): o início
   de quem está usando, ou o login. */
function continuarDepoisDaSenhaNova(){
  const destino = DESTINO_DEPOIS_DA_SENHA_NOVA;
  DESTINO_DEPOIS_DA_SENHA_NOVA = "";
  if(destino) return ir(destino, { limparHistorico:true });
  ir(E.logado ? telaInicialDeQuemEstaUsando() : "login", { limparHistorico:true });
}


/* --------------------------------------------------------------------------
   04A. CADASTRO DO CLIENTE — 3 etapas

   A conta só é criada no fim (passo 3, com os termos aceitos). Até lá, o
   que a pessoa digitou fica com a tomada (FONTE): na maquete, como sempre;
   no app, o nome, o e-mail, o telefone e o endereço ficam guardados no
   aparelho, e a SENHA fica só na memória — nunca no aparelho. Por isso,
   quem recarrega a página no meio do cadastro volta ao passo 1 e digita a
   senha de novo.

   Se o servidor recusar um campo do passo 1 (senha fácil, telefone que já
   tem conta...) quando a pessoa já está no passo 3, ela volta ao passo 1,
   com o que tinha digitado e a frase embaixo do campo.
   -------------------------------------------------------------------------- */
const FRASE_SENHA_DE_NOVO = "Por segurança, digite a senha de novo.";

/* qual lugar de erro, embaixo de qual campo do passo 1 */
const ERRO_DO_CAMPO_DO_CADASTRO = {
  nome: "cc-nome-erro", email: "cc-email-erro", telefone: "cc-tel-erro", senha: "cc-senha-erro",
};

/* Os dois cadastros (o do cliente e o da diarista) seguem o mesmo caminho:
   o passo 1 guarda o que foi digitado, o fim cria a conta, e um campo do
   passo 1 recusado no fim volta ao passo 1, com a frase embaixo dele.
   Aqui, as telas e os lugares de erro de cada um. */
const CADASTRO_DO_PAPEL = {
  cliente:  { passo1:"cadastroCliente", erros:ERRO_DO_CAMPO_DO_CADASTRO, geral:"cc-erro", fim:"ct-erro",
              telas:["cadastroCliente", "cadastroClienteEndereco", "cadastroClienteTermos"] },
  diarista: { passo1:"cadastroDiarista",
              erros:{ nome:"dia-nome-erro", email:"dia-email-erro", telefone:"dia-tel-erro",
                      senha:"dia-senha-erro" },
              geral:"dia-erro", fim:"dt-erro",
              telas:["cadastroDiarista", "cadastroDiaristaTermos"] },
};

/* O cadastro da tela aberta agora (o do cliente, fora das telas dela). */
function cadastroDaTela(){
  return (CADASTRO_DO_PAPEL.diarista.telas.indexOf(E.tela) >= 0)
    ? CADASTRO_DO_PAPEL.diarista : CADASTRO_DO_PAPEL.cliente;
}

function valorJaDigitado(valor){
  return valor ? ' value="' + esc(valor) + '"' : "";
}

/* Quem veio do "Corrigir o número" corrige só o número: o nome e o e-mail
   aparecem como estão, sem deixar mexer (a mudança seria jogada fora). */
function soParaLer(sim){
  return sim ? " readonly" : "";
}

TELAS.cadastroCliente = {
  html: function(){
    /* no app, o que a pessoa já tinha digitado (vazio na maquete) */
    const r = FONTE.ler.rascunhoDoCadastro("cliente") || {};
    const aviso = AVISO_PARA_A_TELA;
    const pedeASenha = !!(aviso && aviso.tela === "cadastroCliente" && aviso.senhaDeNovo);
    const fraseDaSenha = avisoDoCampo("cadastroCliente", "senha") || (pedeASenha ? FRASE_SENHA_DE_NOVO : "");
    return ''
    + cabecalho("", { passos:[1,3] })
    + '<div class="corpo">'
    +   '<h2 class="titulo">Vamos começar! 🏠</h2>'
    +   '<p class="apoio">Crie sua conta para contratar serviços incríveis.</p>'

    +   '<div class="campo"><label>Nome completo</label>'
    +     '<input id="cc-nome" type="text" placeholder="Digite seu nome completo" autocomplete="name"'
    +       valorJaDigitado(r.nome) + soParaLer(r.soONumero) + '>'
    +     erroDoCampo("cc-nome-erro", "cadastroCliente", "nome") + '</div>'
    +   '<div class="campo"><label>E-mail</label>'
    +     '<input id="cc-email" type="email" placeholder="Digite seu e-mail" autocomplete="email" '
    +       'autocapitalize="none" spellcheck="false"' + valorJaDigitado(r.email)
    +       soParaLer(r.soONumero) + '>'
    +     erroDoCampo("cc-email-erro", "cadastroCliente", "email") + '</div>'
    +   '<div class="campo"><label>Telefone</label>'
    +     '<input id="cc-tel" type="tel" placeholder="(11) 99999-9999" autocomplete="tel"'
    +       valorJaDigitado(r.telefone) + '>'
    +     erroDoCampo("cc-tel-erro", "cadastroCliente", "telefone") + '</div>'
    /* o olhinho da senha, como na imagem (04A) */
    +   '<div class="campo"><label>Senha</label>'
    +     '<div style="position:relative">'
    +       '<input id="cc-senha" type="password" placeholder="Crie uma senha" '
    +         'autocomplete="new-password" style="padding-right:46px">'
    +       '<button onclick="verSenha(\'cc-senha\')" aria-label="Mostrar senha" class="olho">'
    +         '👁</button>'
    +     '</div>'
    +     '<div class="erro-do-campo" id="cc-senha-erro">' + esc(fraseDaSenha) + '</div></div>'
    +   erroDoCampo("cc-erro", "cadastroCliente", "")
    + '</div>'
    + '<div class="rodape">'
    +   '<button class="btn btn-principal" onclick="cadastroClientePasso1(this)">Continuar</button>'
    +   '<p class="apoio" style="text-align:center;margin:12px 0 0">Já tem uma conta? '
    +     '<a href="#" onclick="ir(\'login\');return false;" style="color:var(--roxo);font-weight:700;text-decoration:none">Entrar</a></p>'
    + '</div>';
  }
};

function limparErrosDoCadastro(){
  avisarNaTela(null);
  ["cc-nome-erro", "cc-email-erro", "cc-tel-erro", "cc-senha-erro", "cc-erro"].forEach(function(id){
    mostrarErro(id, "");
  });
}

function cadastroClientePasso1(botao){
  const nome  = valorDoCampo("cc-nome").trim();
  const email = valorDoCampo("cc-email").trim();
  limparErrosDoCadastro();
  if(nome.length < 3 || email.indexOf("@") < 0){
    mostrarErro("cc-erro", "Preencha ao menos o nome completo e um e-mail válido.");
    return;
  }
  FONTE.comecarCadastro({
    nome: nome,
    email: email,
    telefone: valorDoCampo("cc-tel").trim(),
    senha: valorDoCampo("cc-senha"),
  }, function(r){
    if(!r.ok) return mostrarErroDoCadastro(r);
    ir("cadastroClienteEndereco");
  }, { botao: botao || null });
}

/* O que o cliente fica sabendo sobre quem vê o endereço dele (A13,
   decisão do dono de 12/10/2026). Mora num lugar só porque aparece em duas
   telas — no cadastro e em "Sua casa" — e as duas diziam "depois que ela
   aceita", o que deixou de ser verdade: a rua e o número só aparecem a
   partir das 18h da véspera. A hora vem do dados.js. */
function avisoDePrivacidadeDoEndereco(){
  return '<div class="aviso roxo">🔒<div><b>Sua privacidade</b>'
    + 'A profissional vê só o bairro e a distância. A rua e o número aparecem '
    + 'só para quem aceitou o serviço, a partir das '
    + HORA_DO_ENDERECO_NA_VESPERA + 'h da véspera.</div></div>';
}

TELAS.cadastroClienteEndereco = {
  html: function(){
    /* na maquete, o endereço de exemplo; no app, o que a pessoa já digitou */
    const en = FONTE.ler.enderecoDoCadastro();
    const rua = ruaENumero(en);
    const cidadeEstado = [en.cidade, en.estado].filter(function(x){ return !!x; }).join(" - ");
    return ''
    + cabecalho("", { passos:[2,3] })
    + '<div class="corpo">'
    +   '<h2 class="titulo">Onde fica sua casa? 📍</h2>'
    +   '<p class="apoio">Usamos o endereço para encontrar profissionais perto de você.</p>'
    +   '<div class="campo"><label>CEP</label><input id="ce-cep" type="text" inputmode="numeric" '
    +     'autocomplete="postal-code" value="' + esc(en.cep) + '"></div>'
    +   camposDaRua("ce-rua", "ce-numero", rua, "cadastroClienteEndereco")
    +   '<div class="campo"><label>Complemento</label><input id="ce-comp" type="text" value="' + esc(en.complemento) + '"></div>'
    +   campoDeBairro("ce-bairro", en.bairro, "cadastroClienteEndereco")
    +   '<div class="campo"><label>Cidade e estado</label><input id="ce-cidade" type="text" value="' + esc(cidadeEstado) + '"></div>'
    +   avisoDePrivacidadeDoEndereco()
    + '</div>'
    + '<div class="rodape"><button class="btn btn-principal" onclick="cadastroClientePasso2()">Continuar</button></div>';
  },
  aoEntrar: function(){ pedirBairrosSeFaltar(); }
};

/* O endereço do passo 2, como está na tela agora. */
function enderecoDoPasso2(){
  const cidadeEstado = separarCidadeEEstado(valorDoCampo("ce-cidade"));
  return {
    apelido: "Casa",
    cep:         valorDoCampo("ce-cep").trim(),
    logradouro:  valorDoCampo("ce-rua").trim(),
    numero:      valorDoCampo("ce-numero").trim(),
    complemento: valorDoCampo("ce-comp").trim(),
    bairro:      valorDoCampo("ce-bairro").trim(),
    cidade:      cidadeEstado.cidade,
    estado:      cidadeEstado.estado,
  };
}

function cadastroClientePasso2(){
  FONTE.guardarEnderecoDoCadastro(enderecoDoPasso2(), function(){
    ir("cadastroClienteTermos");
  });
}

/* "Cidade e estado" é um campo só: "São Paulo - SP". O estado é o que vem
   depois do último traço (uma cidade com traço no nome continua inteira);
   vazio, vale São Paulo - SP, como sempre valeu. */
function separarCidadeEEstado(texto){
  const t = String(texto || "").trim() || "São Paulo - SP";
  const i = t.lastIndexOf("-");
  if(i < 0) return { cidade:t, estado:"SP" };
  return { cidade:t.slice(0, i).trim(), estado:t.slice(i + 1).trim() || "SP" };
}


/* --------------------------------------------------------------------------
   PEDAÇOS DO ENDEREÇO (no passo 2 do cadastro e em "Sua casa")

   A rua e o NÚMERO lado a lado, e o BAIRRO escolhido numa lista: a lista
   dos bairros atendidos (na maquete, os de exemplo; no app, os do
   servidor). Quem não acha o bairro vê "Onde atendemos".

   Desde a R32 (14/10/2026) a lista são os 96 distritos de São Paulo. 96
   itens soltos é ruim no celular: em cima da lista vem uma BUSCA, que
   deixa na lista só os que batem com o que foi digitado (sem diferenciar
   acento e maiúscula). Achou um só, ele já fica escolhido. A lista
   continua sendo um <select> de verdade: quem preferir rolar, rola.
   -------------------------------------------------------------------------- */
function camposDaRua(idRua, idNumero, rua, tela){
  return '<div class="campos-lado">'
    +   '<div class="campo"><label>Endereço</label>'
    +     '<input id="' + esc(idRua) + '" type="text" autocomplete="address-line1" '
    +       'placeholder="Rua, avenida..." value="' + esc(rua.logradouro) + '">'
    +     erroDoCampo(idRua + "-erro", tela, "rua") + '</div>'
    +   '<div class="campo numero"><label>Número</label>'
    +     '<input id="' + esc(idNumero) + '" type="text" inputmode="numeric" value="' + esc(rua.numero) + '">'
    +     erroDoCampo(idNumero + "-erro", tela, "numero") + '</div>'
    + '</div>';
}

function campoDeBairro(id, atual, tela){
  return '<div class="campo"><label>Bairro</label>'
    +   '<input id="' + esc(id) + '-busca" class="busca-de-bairro" type="search" '
    +     'autocomplete="off" placeholder="🔍 Digite para achar o bairro" '
    +     'oninput="filtrarBairrosDaLista(\'' + idSeguro(id) + '\')">'
    +   '<div class="seletor"><select id="' + esc(id) + '">' + opcoesDeBairro(atual) + '</select></div>'
    +   erroDoCampo(id + "-erro", tela, "bairro")
    +   '<p class="ajuda">A lista tem os distritos da cidade. Não achou o nome do seu bairro? '
    +     'Escolha o distrito onde ele fica. '
    +     '<a href="#" onclick="verOndeAtendemos();return false;" class="link-roxo">Veja onde atendemos</a></p>'
    + '</div>';
}

/* O texto da busca bate com o bairro? Sem acento e sem maiúscula: "jacana"
   acha "Jaçanã". Vazio, todos batem. */
function bairroBateComABusca(bairro, busca){
  const b = semAcento(busca).trim();
  return !b || semAcento(bairro).indexOf(b) >= 0;
}

/* As opções da lista. O bairro que já estava escrito (uma casa de antes,
   de fora da lista) aparece também, marcado: a pessoa vê o que está
   guardado, e o servidor diz se atende. Com uma busca, só os bairros que
   batem com ela (o escolhido sai da lista se não bater: quem busca está
   trocando de bairro); se sobrar um só, ele já vem escolhido. */
function opcoesDeBairro(atual, busca){
  const area = FONTE.ler.areaAtendida();
  let lista = area ? area.bairros.slice() : [];
  atual = String(atual || "");
  if(atual && lista.indexOf(atual) < 0) lista.push(atual);
  const buscando = !!semAcento(busca).trim();
  if(buscando){
    lista = lista.filter(function(b){ return bairroBateComABusca(b, busca); });
    if(lista.indexOf(atual) < 0) atual = lista.length === 1 ? lista[0] : "";
  }
  const primeira = !area ? 'Carregando os bairros…'
    : !buscando ? 'Escolha o bairro'
    : !lista.length ? 'Nenhum bairro com esse nome'
    : lista.length === 1 ? 'Achamos 1 bairro com esse nome'
    : lista.length + ' bairros com esse nome: escolha um';
  let html = '<option value="" disabled' + (atual ? '' : ' selected') + '>' + esc(primeira) + '</option>';
  lista.forEach(function(b){
    html += '<option value="' + esc(b) + '"' + (b === atual ? ' selected' : '') + '>' + esc(b) + '</option>';
  });
  return html;
}

/* A busca em cima da lista: refaz só as opções, sem redesenhar a tela (o
   que a pessoa já digitou nos outros campos fica). */
function filtrarBairrosDaLista(id){
  const lista = document.getElementById(id);
  const busca = document.getElementById(id + "-busca");
  if(!lista || !busca) return;
  lista.innerHTML = opcoesDeBairro(lista.value, busca.value);
}

/* A lista de bairros de cada tela de endereço. */
const LISTA_DE_BAIRROS_DA_TELA = { cadastroClienteEndereco:"ce-bairro", cadastrarCasa:"casa-bairro",
                                   /* o "Não sei meu CEP" dela (R34) */
                                   diaristaSemCep:"sem-cep-bairro" };

/* No app, a lista dos bairros chega do servidor antes da tela (no
   "Continuar" do passo 1 e no "+ Cadastrar endereço"). Se ainda faltar
   (a página foi recarregada), ela é pedida aqui e entra NA LISTA, sem
   redesenhar a tela: redesenhar apagaria o que a pessoa já digitou. */
function pedirBairrosSeFaltar(){
  if(FONTE.ler.areaAtendida()) return;
  FONTE.carregarArea(function(r){
    const id = LISTA_DE_BAIRROS_DA_TELA[E.tela];
    const lista = id ? document.getElementById(id) : null;
    if(!r.ok) return mostrarErro(id + "-erro", r.erro);
    const busca = id ? document.getElementById(id + "-busca") : null;
    if(lista) lista.innerHTML = opcoesDeBairro(lista.value, busca ? busca.value : "");
  });
}

/* "Veja onde atendemos": o que a pessoa já digitou fica guardado (no passo
   2, no rascunho do cadastro; em "Sua casa", na memória), e o "Voltar" de
   lá traz tudo de volta. */
function verOndeAtendemos(){
  if(E.tela !== "cadastroClienteEndereco"){
    guardarOQueFoiDigitadoNaCasa();
    ir("ondeAtendemos");
    return;
  }
  FONTE.guardarEnderecoDoCadastro(enderecoDoPasso2(), function(){
    ir("ondeAtendemos");
  });
}


/* --------------------------------------------------------------------------
   1B. ONDE ATENDEMOS (tela nova, do app de verdade)

   A área de cobertura, antes do cadastro: abre do "Veja onde atendemos"
   do endereço. Os bairros vêm da tomada: na maquete, os de exemplo; no
   app, os do servidor. Desde a R32 são os 96 distritos de São Paulo: a
   lista ganhou uma busca (esconde as linhas que não batem, sem redesenhar
   a tela) e o texto diz que é a cidade inteira.
   -------------------------------------------------------------------------- */
let ERRO_DOS_BAIRROS = null;    // { frase, navegacao }: vale só nesta visita à tela

TELAS.ondeAtendemos = {
  html: function(){
    const area = FONTE.ler.areaAtendida();
    const erro = (ERRO_DOS_BAIRROS && ERRO_DOS_BAIRROS.navegacao === NAVEGACAO) ? ERRO_DOS_BAIRROS.frase : "";
    let lista;
    if(area){
      lista = '<div class="campo"><input id="onde-busca" class="busca-de-bairro" type="search" '
        +   'autocomplete="off" placeholder="🔍 Procure o seu bairro" oninput="filtrarOndeAtendemos()"></div>'
        + '<div class="cartao lista-de-bairros" id="onde-lista">'
        + area.bairros.map(function(b){
            return '<div data-bairro="' + esc(b) + '"><span class="ok">✓</span>' + esc(b) + '</div>';
          }).join("")
        + '</div>'
        + '<p class="apoio" id="onde-nenhum" hidden>Nenhum bairro com esse nome. '
        +   'A lista usa os nomes dos distritos: procure o distrito onde fica a casa.</p>';
    } else if(erro){
      lista = '<div class="aviso ambar">⚠️<div>' + esc(erro) + '</div></div>'
        + '<button class="btn btn-contorno" onclick="tentarOsBairrosDeNovo()">Tentar de novo</button>';
    } else {
      lista = '<p class="apoio">Carregando os bairros…</p>';
    }
    return ''
    + cabecalho("")
    + '<div class="corpo">'
    +   '<h2 class="titulo">Onde atendemos 📍</h2>'
    +   '<p class="apoio">A Limpah atende '
    +     (area && area.cidade ? 'a cidade de ' + esc(area.cidade) + ' inteira' : 'estes bairros')
    +     (area ? ': ' + area.bairros.length + ' bairros' : '') + ' 🎉</p>'
    +   lista
    +   '<div class="aviso roxo" style="margin-top:18px">🏡<div><b>Não achou o seu?</b>'
    +     'A lista usa os nomes dos distritos da Prefeitura: escolha o distrito onde a casa fica. '
    +     'Fora da cidade, ainda não chegamos 😔 Estamos começando por aqui, para cuidar bem de cada casa.</div></div>'
    + '</div>'
    + '<div class="rodape"><button class="btn btn-principal" onclick="voltar()">Voltar</button></div>';
  },
  aoEntrar: function(){
    if(FONTE.ler.areaAtendida() || (ERRO_DOS_BAIRROS && ERRO_DOS_BAIRROS.navegacao === NAVEGACAO)) return;
    FONTE.carregarArea(function(r){
      ERRO_DOS_BAIRROS = r.ok ? null : { frase: r.erro || "", navegacao: NAVEGACAO };
      desenhar();
    });
  }
};

function tentarOsBairrosDeNovo(){
  ERRO_DOS_BAIRROS = null;
  desenhar();
}

/* A busca do "Onde atendemos": esconde as linhas que não batem. */
function filtrarOndeAtendemos(){
  const busca = document.getElementById("onde-busca");
  const lista = document.getElementById("onde-lista");
  const nenhum = document.getElementById("onde-nenhum");
  if(!busca || !lista) return;
  let visiveis = 0;
  Array.prototype.forEach.call(lista.children, function(linha){
    const bate = bairroBateComABusca(linha.getAttribute("data-bairro") || "", busca.value);
    linha.hidden = !bate;
    if(bate) visiveis++;
  });
  lista.hidden = visiveis === 0;
  if(nenhum) nenhum.hidden = visiveis > 0;
}

TELAS.cadastroClienteTermos = {
  html: function(){
    return ''
    + cabecalho("", { passos:[3,3] })
    + '<div class="corpo">'
    +   '<h2 class="titulo">Quase lá! ✅</h2>'
    +   '<p class="apoio">Confirme os termos para criar sua conta.</p>'

    +   chaveDosTermos()

    /* "Quero receber ofertas" é outro consentimento (LGPD) e ainda não é
       guardado: no app ele não aparece, para não prometer o que não existe */
    +   soNaMaquete('<div class="chave" onclick="alternarChaveVisual(this)">'
    +     '<div class="txt"><b>Quero receber ofertas</b><span>Opcional. Você pode desativar quando quiser.</span></div>'
    +     '<div class="botao"></div></div>')

    /* Só na maquete: no app, esta frase espera a verificação estar ligada
       (um teste do app confere). */
    +   soNaMaquete('<div class="aviso verde">🛡️<div><b>Segurança é prioridade</b>'
    +     'Todas as diaristas passam por verificação de documentos e antecedentes.</div></div>')
    +   erroDoCampo("ct-erro", "cadastroClienteTermos", "")
    + '</div>'
    + '<div class="rodape"><button class="btn btn-principal" onclick="criarContaCliente(this)">Criar minha conta</button></div>';
  }
};

/* As duas chaves dos documentos: no fim do cadastro e na tela "os termos
   mudaram". Para a diarista, a chave não cita a política de cancelamento:
   ela é do cliente (R20, ainda a decidir), e o documento dela — um só com
   cláusulas das duas partes, ou um termo próprio da profissional — é
   decisão pendente (DECISOES, A26). */
function chaveDosTermos(papel){
  const doQue = (papel === "diarista") ? "Regras de uso da plataforma."
                                       : "Regras de uso da plataforma e política de cancelamento.";
  return ''
  + '<div class="chave" id="chave-termos" onclick="alternarChaveVisual(this)">'
  +   '<div class="txt"><b>Aceito os termos de uso</b><span>' + doQue + '</span></div>'
  +   '<div class="botao"></div></div>'

  + '<div class="chave" id="chave-privacidade" onclick="alternarChaveVisual(this)">'
  +   '<div class="txt"><b>Aceito a política de privacidade</b><span>Como seus dados são usados e protegidos.</span></div>'
  +   '<div class="botao"></div></div>';
}

/* Liga/desliga visual de uma chave, sem mexer no estado geral. */
function alternarChaveVisual(elemento){
  elemento.classList.toggle("ligada");
}

/* Cria a conta. Na maquete, na hora. No app, o servidor confere tudo de
   novo e manda o código pelo WhatsApp; a próxima tela é a do código. */
function criarContaCliente(botao){
  const t = chaveLigada("chave-termos");
  const p = chaveLigada("chave-privacidade");
  mostrarErro("ct-erro", "");
  if(!t || !p){
    mostrarErro("ct-erro", "Para continuar, aceite os termos de uso e a política de privacidade.");
    return;
  }
  FONTE.criarConta({ papel:"cliente", aceitoOsTermos:t, aceitoAPrivacidade:p }, function(r){
    if(!r.ok) return mostrarErroDoCadastro(r);
    ir(r.destino, { limparHistorico:true });
  }, { botao: botao });
}

/* A frase de erro do cadastro, no lugar certo. Campo do passo 1 recusado
   quando a pessoa já está em outro passo: volta ao passo 1, com o que ela
   tinha digitado e a frase embaixo do campo. A senha, ela digita de novo. */
function mostrarErroDoCadastro(r){
  if(r.destino) return seguirPeloErro(r);
  const c = cadastroDaTela();
  const lugar = c.erros[r.campo];
  if(!lugar) return mostrarErro(E.tela === c.passo1 ? c.geral : c.fim, r.erro);
  if(E.tela === c.passo1) return mostrarErro(lugar, r.erro);
  voltarAoPasso1DoCadastro(r, c.passo1);
}

function voltarAoPasso1DoCadastro(r, passo1){
  passo1 = passo1 || "cadastroCliente";
  /* o "‹" do passo 1 volta para onde estava antes do cadastro, e não para
     o fim dele */
  const i = E.historico.lastIndexOf(passo1);
  if(i >= 0) E.historico = E.historico.slice(0, i);
  avisarNaTela({ tela:passo1, campo:r.campo, erro:r.erro, senhaDeNovo:r.campo !== "senha" });
  ir(passo1, { semHistorico:true });
}

/* Depois do "Conta criada!", a tomada diz para onde: na maquete, o início,
   como sempre; no app, quem digitou o endereço no cadastro confere a casa
   ("Cadastrar minha casa", já preenchida), ou deixa para depois. */
TELAS.boasVindas = {
  html: function(){
    const nome = FONTE.ler.cliente().primeiroNome || "por aqui";
    const depois = FONTE.ler.depoisDasBoasVindas();
    /* o destino escrito no botão (passando por idSeguro), e não decidido
       dentro de uma função: o teste das armadilhas (testes.js) lê os
       destinos no onclick */
    const principal = (depois.tela === "cadastrarCasa")
      ? '<button class="btn btn-principal" onclick="abrirAFichaDaCasa(null,{limparHistorico:true})">'
      : '<button class="btn btn-principal" onclick="ir(\'' + idSeguro(depois.tela) + '\',{limparHistorico:true})">';
    return ''
    + '<div class="centro">'
    +   '<div class="circulo-ok">✓</div>'
    +   '<h2 class="titulo">Conta criada, ' + esc(nome) + '! 🎉</h2>'
    +   '<p class="apoio">' + esc(depois.apoio || "Agora é só pedir seu primeiro serviço. Leva menos de um minuto.") + '</p>'
    + '</div>'
    + '<div class="rodape">'
    +   principal + esc(depois.texto) + '</button>'
    +   (depois.agoraNao
         ? '<button class="btn btn-texto" onclick="ir(\'' + idSeguro(telaInicialDeQuemEstaUsando())
           + '\',{limparHistorico:true})">Agora não</button>'
         : '')
    +   erroDoCampo("casas-erro", "boasVindas", "")
    + '</div>';
  }
};


/* --------------------------------------------------------------------------
   O CÓDIGO DO CELULAR (tela nova, do app de verdade)

   Depois de criar a conta, a pessoa digita o código de 6 números que chega
   pelo WhatsApp. Só depois disso a conta pode mudar alguma coisa (pedir,
   cadastrar casa). O mesmo vale para quem entra numa conta que ainda não
   confirmou o celular.

   "Mandar de novo" só depois de 1 minuto (quem diz quanto falta é a tomada:
   no app, o servidor). O relógio da tela só mexe no botão, sem redesenhar:
   redesenhar apagaria o código que a pessoa está digitando.

   Na maquete, qualquer código de 6 números serve.
   -------------------------------------------------------------------------- */
const FRASE_DO_CODIGO_MAL_DIGITADO = "O código tem 6 números. Confira e digite de novo.";

TELAS.codigoCelular = {
  html: function(){
    const c = FONTE.ler.confirmacao();
    const falta = c.segundosParaMandarDeNovo;
    return ''
    + cabecalho("", { semVoltar:true })
    + '<div class="corpo">'
    +   '<h2 class="titulo">Confirme seu celular 📱</h2>'
    +   '<p class="apoio">Mandamos um código de 6 números pelo WhatsApp para '
    +     (c.telefone ? '<b>' + esc(c.telefone) + '</b>' : 'o seu celular') + '.'
    /* quem digitou o número errado volta ao passo 1 para corrigir (sem
       isto, ficava presa: o código novo ia de novo ao número errado) */
    +     (c.podeCorrigirONumero ? ' Número errado? <a href="#" onclick="corrigirONumero();return false;" '
    +       'style="color:var(--roxo);font-weight:700;text-decoration:none">Corrigir o número</a>' : '')
    +   '</p>'
    +   '<div class="campo"><label>Código</label>'
    +     '<input id="cod-codigo" class="codigo" type="text" inputmode="numeric" '
    +       'autocomplete="one-time-code" maxlength="7" placeholder="000000" enterkeyhint="done" '
    +       'onkeydown="if(event.key===\'Enter\'){event.preventDefault();confirmarCodigoPeloTeclado();}">'
    +     erroDoCampo("cod-erro", "codigoCelular", "codigo") + '</div>'
    +   '<p class="ajuda" id="cod-aviso">' + esc(c.aviso) + '</p>'
    +   soNaMaquete('<div class="cartao maquete"><b>⚙ NA MAQUETE</b>'
    +     '<div>Qualquer código de 6 números serve. Também dá para ver a tela de quem '
    +     'precisa aceitar os termos de novo, quando eles mudam.</div>'
    +     '<button class="btn btn-contorno" onclick="ir(\'termosNovos\')">Ver a tela dos termos novos</button></div>')
    + '</div>'
    + '<div class="rodape">'
    +   '<button class="btn btn-principal" id="cod-confirmar" onclick="confirmarCodigo(this)">Confirmar</button>'
    +   '<button class="btn btn-contorno" id="cod-reenviar" onclick="mandarCodigoDeNovo(this)"'
    +     (falta > 0 ? ' disabled' : '') + '>' + esc(textoDoMandarDeNovo(falta)) + '</button>'
    +   botaoDeSair("codigoCelular")
    + '</div>';
  },
  aoEntrar: function(){
    FALTAVA_PARA_MANDAR = FONTE.ler.confirmacao().segundosParaMandarDeNovo;
    repetir(atualizarMandarDeNovo, 1000);
  }
};

function textoDoMandarDeNovo(falta){
  return falta > 0 ? "Mandar de novo em " + falta + " s" : "Mandar de novo";
}

/* Quanto faltava no último toque do relógio. O botão só é ligado na
   passagem de "falta" para "pode": enquanto o pedido está indo ("Enviando…"),
   o relógio não mexe nele. */
let FALTAVA_PARA_MANDAR = 0;

function atualizarMandarDeNovo(){
  const botao = document.getElementById("cod-reenviar");
  if(!botao) return;
  const falta = FONTE.ler.confirmacao().segundosParaMandarDeNovo;
  if(falta > 0){
    botao.disabled = true;
    botao.textContent = textoDoMandarDeNovo(falta);
  } else if(FALTAVA_PARA_MANDAR > 0){
    botao.disabled = false;
    botao.textContent = textoDoMandarDeNovo(0);
  }
  FALTAVA_PARA_MANDAR = falta;
}

function confirmarCodigo(botao){
  const codigo = valorDoCampo("cod-codigo").replace(/[\s.\-]/g, "");
  mostrarErro("cod-erro", "");
  if(!/^[0-9]{6}$/.test(codigo)){
    mostrarErro("cod-erro", FRASE_DO_CODIGO_MAL_DIGITADO);
    return;
  }
  FONTE.confirmarCelular({ codigo: codigo }, function(r){
    if(!r.ok) return mostrarErroDoCodigo(r);
    ir(r.destino, { limparHistorico:true });
  }, { botao: botao });
}

/* O Enter (o "ok" do teclado do celular) no campo do código confirma, como
   o botão — e passa pelo botão: desligado ("Enviando…"), não manda de novo. */
function confirmarCodigoPeloTeclado(){
  const botao = document.getElementById("cod-confirmar");
  if(botao && !botao.disabled) confirmarCodigo(botao);
}

/* Na resposta, o relógio do botão volta a contar sozinho (no próximo
   segundo), sem redesenhar a tela. */
function mandarCodigoDeNovo(botao){
  mostrarErro("cod-erro", "");
  mostrarErro("cod-aviso", "");
  FONTE.reenviarCodigo({}, function(r){
    if(!r.ok) return mostrarErroDoCodigo(r);
    if(r.destino) return ir(r.destino, { limparHistorico:true });
    mostrarErro("cod-aviso", r.aviso || "Pronto! Mandamos um código novo.");
  }, { botao: botao });
}

function mostrarErroDoCodigo(r){
  if(r.destino) return seguirPeloErro(r);
  mostrarErro("cod-erro", r.erro);
}

/* "Número errado? Corrigir o número": de volta ao passo 1, com o nome, o
   e-mail e o número de antes, e a senha para digitar de novo. O "‹" de lá
   volta para esta tela. Se ela deixar o mesmo número, o fim do cadastro
   volta para cá, sem criar outra conta. */
function corrigirONumero(){
  mostrarErro("cod-erro", "");
  FONTE.corrigirNumero({}, function(r){
    if(!r.ok) return mostrarErro("cod-erro", r.erro);
    avisarNaTela(r.aviso);
    ir(r.destino);
  });
}


/* --------------------------------------------------------------------------
   OS TERMOS MUDARAM (tela nova, do app de verdade)

   Quando o texto dos Termos de Uso ou da Política de Privacidade muda, a
   pessoa aceita a versão nova antes de continuar. Sem aceitar, ela pode
   sair da conta.
   -------------------------------------------------------------------------- */
TELAS.termosNovos = {
  html: function(){
    return ''
    + cabecalho("", { semVoltar:true })
    + '<div class="corpo">'
    +   '<h2 class="titulo">Atualizamos nossos termos 📄</h2>'
    +   '<p class="apoio">Para continuar usando o Limpah, confirme que você aceita a versão nova.</p>'
    +   chaveDosTermos(E.perfil)
    +   erroDoCampo("tn-erro", "termosNovos", "")
    + '</div>'
    + '<div class="rodape">'
    +   '<button class="btn btn-principal" onclick="aceitarTermosNovos(this)">Aceitar e continuar</button>'
    +   botaoDeSair("termosNovos")
    + '</div>';
  }
};

/* O "Sair da conta" das telas sem as abas (o código, os termos novos): um
   botão só de texto, que diz "Enviando…" enquanto vai, e o lugar da frase
   de quando não deu para sair (sem internet). */
function botaoDeSair(tela){
  return '<button class="btn btn-texto" onclick="sairDaConta(this)">Sair da conta</button>'
       + erroDoCampo("sair-erro", tela, "sair");
}

function aceitarTermosNovos(botao){
  const t = chaveLigada("chave-termos");
  const p = chaveLigada("chave-privacidade");
  mostrarErro("tn-erro", "");
  if(!t || !p){
    mostrarErro("tn-erro", "Para continuar, aceite os termos de uso e a política de privacidade.");
    return;
  }
  FONTE.aceitarTermos({ aceitoOsTermos:t, aceitoAPrivacidade:p }, function(r){
    if(!r.ok && r.destino) return seguirPeloErro(r);
    if(!r.ok) return mostrarErro("tn-erro", r.erro);
    ir(r.destino, { limparHistorico:true });
  }, { botao: botao });
}


/* --------------------------------------------------------------------------
   04B. CADASTRO DA DIARISTA — o Portão 1 (decisão R18)

   Como o do cliente: o passo 1 guarda o que foi digitado (a senha, no app,
   só na memória), a tela dos termos cria a conta, e o código do celular
   vem depois. Em seguida ela escolhe os bairros (telas-diarista.js). O
   e-mail está na tela, como na imagem (04B), e é OPCIONAL: sem ele, ela
   entra pelo telefone (R28; DECISOES, A23).
   -------------------------------------------------------------------------- */
TELAS.cadastroDiarista = {
  html: function(){
    /* no app, o que ela já tinha digitado; na maquete, só quem voltou da
       tela do código para corrigir o número */
    const r = FONTE.ler.rascunhoDoCadastro("diarista") || {};
    const aviso = AVISO_PARA_A_TELA;
    const pedeASenha = !!(aviso && aviso.tela === "cadastroDiarista" && aviso.senhaDeNovo);
    const fraseDaSenha = avisoDoCampo("cadastroDiarista", "senha") || (pedeASenha ? FRASE_SENHA_DE_NOVO : "");
    return ''
    + cabecalho("", { passos:[1,5] })
    + '<div class="corpo">'
    +   '<h2 class="titulo">Vamos começar! 🧹</h2>'
    +   '<p class="apoio">Crie sua conta para receber oportunidades de trabalho.</p>'
    +   '<div class="campo"><label>Nome completo</label>'
    +     '<input id="dia-nome" type="text" placeholder="Digite seu nome completo" autocomplete="name"'
    +       valorJaDigitado(r.nome) + soParaLer(r.soONumero) + '>'
    +     erroDoCampo("dia-nome-erro", "cadastroDiarista", "nome") + '</div>'
    /* o e-mail da imagem (04B), opcional: a regra do e-mail obrigatório é
       só do cliente (R28) */
    +   '<div class="campo"><label>E-mail</label>'
    +     '<input id="dia-email" type="email" placeholder="Digite seu e-mail" autocomplete="email" '
    +       'autocapitalize="none" spellcheck="false"' + valorJaDigitado(r.email)
    +       soParaLer(r.soONumero) + '>'
    +     erroDoCampo("dia-email-erro", "cadastroDiarista", "email") + '</div>'
    +   '<div class="campo"><label>Telefone</label>'
    +     '<input id="dia-tel" type="tel" placeholder="(11) 99999-9999" autocomplete="tel"'
    +       valorJaDigitado(r.telefone) + '>'
    +     erroDoCampo("dia-tel-erro", "cadastroDiarista", "telefone") + '</div>'
    /* o olhinho da senha, como na imagem (04B) */
    +   '<div class="campo"><label>Senha</label>'
    +     '<div style="position:relative">'
    +       '<input id="dia-senha" type="password" placeholder="Crie uma senha" '
    +         'autocomplete="new-password" style="padding-right:46px">'
    +       '<button onclick="verSenha(\'dia-senha\')" aria-label="Mostrar senha" class="olho">'
    +         '👁</button>'
    +     '</div>'
    +     '<div class="erro-do-campo" id="dia-senha-erro">' + esc(fraseDaSenha) + '</div></div>'
    +   erroDoCampo("dia-erro", "cadastroDiarista", "")

    /* PORTÃO 1 (decisão R18): aqui não se pede documento nenhum.
       São dois minutos até ela ver oportunidades reais com valores reais.
       O documento vem depois, quando ela já sabe o que tem a ganhar. */
    /* desde a 3b é verdade também no app: depois dos bairros, ela vê os
       pedidos reais da região (a revisão da 3a tinha trocado a frase
       enquanto a lista não existia) */
    +   '<div class="aviso roxo">⏱️<div><b>Dois minutos e você já vê as oportunidades</b>'
    +     'Documento só depois, quando você decidir que vale a pena.</div></div>'
    + '</div>'
    + '<div class="rodape">'
    +   '<button class="btn btn-principal" onclick="salvarDadosDaDiarista(this)">Continuar</button>'
    +   '<p class="apoio" style="text-align:center;margin:12px 0 0">Já tem uma conta? '
    +     '<a href="#" onclick="ir(\'login\');return false;" style="color:var(--roxo);font-weight:700;text-decoration:none">Entrar</a></p>'
    + '</div>';
  }
};

function limparErrosDoCadastroDaDiarista(){
  avisarNaTela(null);
  ["dia-nome-erro", "dia-email-erro", "dia-tel-erro", "dia-senha-erro", "dia-erro"].forEach(function(id){
    mostrarErro(id, "");
  });
}

/* OS TERMOS DELA (tela nova, do app de verdade): as duas chaves do cliente
   (os Termos de Uso e a Política de Privacidade), numa tela própria — a
   tela da imagem (04B) fica como está. É aqui que a conta nasce. As regras
   de conduta dela ("Termos e regras", Portão 2) são outro documento, mais
   adiante no cadastro. */
TELAS.cadastroDiaristaTermos = {
  html: function(){
    return ''
    + cabecalho("", { passos:[1,5] })
    + '<div class="corpo">'
    +   '<h2 class="titulo">Quase lá! ✅</h2>'
    +   '<p class="apoio">Confirme os termos para criar sua conta.</p>'
    +   chaveDosTermos("diarista")
    +   erroDoCampo("dt-erro", "cadastroDiaristaTermos", "")
    + '</div>'
    + '<div class="rodape"><button class="btn btn-principal" onclick="criarContaDaDiarista(this)">Criar minha conta</button></div>';
  }
};

/* Cria a conta dela. Na maquete, na hora. No app, o servidor confere tudo
   de novo e manda o código pelo WhatsApp; a próxima tela é a do código. */
function criarContaDaDiarista(botao){
  const t = chaveLigada("chave-termos");
  const p = chaveLigada("chave-privacidade");
  mostrarErro("dt-erro", "");
  if(!t || !p){
    mostrarErro("dt-erro", "Para continuar, aceite os termos de uso e a política de privacidade.");
    return;
  }
  FONTE.criarConta({ papel:"diarista", aceitoOsTermos:t, aceitoAPrivacidade:p }, function(r){
    if(!r.ok) return mostrarErroDoCadastro(r);
    ir(r.destino, { limparHistorico:true });
  }, { botao: botao });
}

/* Botão do lado dela sem tela própria não pode dar em nada: esta tela diz
   que está sendo construído e devolve a pessoa para a home (regra: sem becos).

   Até 12/10/2026 ela respondia pelas abas Agenda e Ganhos; essas telas
   existem agora (R26). Hoje quem cai aqui é o "Falar com o suporte" do
   perfil dela — então o texto não pode mais prometer agenda e ganhos. */
TELAS.diaristaEmBreve = {
  html: function(){
    return ''
    + cabecalho("Em construção")
    + '<div class="corpo">'
    +   '<div class="aviso roxo">🚧<div><b>Esta parte ainda está sendo construída</b>'
    +     'Ela entra num dos próximos passos do protótipo.</div></div>'
    + '</div>'
    + '<div class="rodape">'
    +   '<button class="btn btn-contorno" onclick="ir(\'diaristaHome\',{limparHistorico:true})">'
    +     'Voltar ao início</button>'
    + '</div>';
  }
};


/* Mostra ou esconde a senha digitada, no olhinho do campo. */
function verSenha(id){
  const campo = document.getElementById(id);
  if(campo) campo.type = (campo.type === "password") ? "text" : "password";
}
