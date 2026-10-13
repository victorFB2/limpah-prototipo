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
  }
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
   05. RECUPERAR SENHA
   -------------------------------------------------------------------------- */
TELAS.recuperar = {
  html: function(){
    return ''
    + cabecalho("")
    + '<div class="corpo">'
    +   '<h2 class="titulo">Recuperar senha 🔒</h2>'
    +   '<p class="apoio">Digite seu e-mail ou telefone para receber o link de redefinição.</p>'
    +   '<div class="campo"><label>E-mail ou telefone</label>'
    +     '<input type="text" placeholder="Digite seu e-mail ou telefone"></div>'
    +   '<button class="btn btn-principal" onclick="ir(\'recuperarEnviado\')">Enviar link</button>'
    +   '<button class="btn btn-texto" onclick="ir(\'login\')">Voltar para o login</button>'
    + '</div>';
  }
};

TELAS.recuperarEnviado = {
  html: function(){
    return ''
    + cabecalho("")
    + '<div class="centro">'
    +   '<div class="emojao">📬</div>'
    +   '<h2 class="titulo">Link enviado!</h2>'
    +   '<p class="apoio">Se existir uma conta com esse contato, o link de redefinição chega em alguns instantes.</p>'
    + '</div>'
    + '<div class="rodape"><button class="btn btn-principal" onclick="ir(\'login\')">Voltar para o login</button></div>';
  }
};


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
    const r = FONTE.ler.rascunhoDoCadastro() || {};
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
    +   '<button class="btn btn-principal" onclick="cadastroClientePasso1()">Continuar</button>'
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

function cadastroClientePasso1(){
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
  });
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
    const cidadeEstado = [en.cidade, en.estado].filter(function(x){ return !!x; }).join(" - ");
    return ''
    + cabecalho("", { passos:[2,3] })
    + '<div class="corpo">'
    +   '<h2 class="titulo">Onde fica sua casa? 📍</h2>'
    +   '<p class="apoio">Usamos o endereço para encontrar profissionais perto de você.</p>'
    +   '<div class="campo"><label>CEP</label><input id="ce-cep" type="text" value="' + esc(en.cep) + '"></div>'
    +   '<div class="campo"><label>Endereço</label><input id="ce-rua" type="text" value="' + esc(en.rua) + '"></div>'
    +   '<div class="campo"><label>Complemento</label><input id="ce-comp" type="text" value="' + esc(en.complemento) + '"></div>'
    +   '<div class="campo"><label>Bairro</label><input id="ce-bairro" type="text" value="' + esc(en.bairro) + '"></div>'
    +   '<div class="campo"><label>Cidade e estado</label><input id="ce-cidade" type="text" value="' + esc(cidadeEstado) + '"></div>'
    +   avisoDePrivacidadeDoEndereco()
    + '</div>'
    + '<div class="rodape"><button class="btn btn-principal" onclick="cadastroClientePasso2()">Continuar</button></div>';
  }
};

function cadastroClientePasso2(){
  const cidadeEstado = (valorDoCampo("ce-cidade") || "São Paulo - SP").split("-");
  FONTE.guardarEnderecoDoCadastro({
    apelido: "Casa",
    cep:         valorDoCampo("ce-cep").trim(),
    rua:         valorDoCampo("ce-rua").trim(),
    complemento: valorDoCampo("ce-comp").trim(),
    bairro:      valorDoCampo("ce-bairro").trim(),
    cidade:      (cidadeEstado[0] || "").trim(),
    estado:      (cidadeEstado[1] || "SP").trim(),
  }, function(){
    ir("cadastroClienteTermos");
  });
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
   mudaram". */
function chaveDosTermos(){
  return ''
  + '<div class="chave" id="chave-termos" onclick="alternarChaveVisual(this)">'
  +   '<div class="txt"><b>Aceito os termos de uso</b><span>Regras de uso da plataforma e política de cancelamento.</span></div>'
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
  const lugar = ERRO_DO_CAMPO_DO_CADASTRO[r.campo];
  if(!lugar) return mostrarErro(E.tela === "cadastroCliente" ? "cc-erro" : "ct-erro", r.erro);
  if(E.tela === "cadastroCliente") return mostrarErro(lugar, r.erro);
  voltarAoPasso1DoCadastro(r);
}

function voltarAoPasso1DoCadastro(r){
  /* o "‹" do passo 1 volta para onde estava antes do cadastro, e não para
     o passo 3 */
  const i = E.historico.lastIndexOf("cadastroCliente");
  if(i >= 0) E.historico = E.historico.slice(0, i);
  avisarNaTela({ tela:"cadastroCliente", campo:r.campo, erro:r.erro, senhaDeNovo:r.campo !== "senha" });
  ir("cadastroCliente", { semHistorico:true });
}

TELAS.boasVindas = {
  html: function(){
    const nome = FONTE.ler.cliente().primeiroNome || "por aqui";
    return ''
    + '<div class="centro">'
    +   '<div class="circulo-ok">✓</div>'
    +   '<h2 class="titulo">Conta criada, ' + esc(nome) + '! 🎉</h2>'
    +   '<p class="apoio">Agora é só pedir seu primeiro serviço. Leva menos de um minuto.</p>'
    + '</div>'
    + '<div class="rodape"><button class="btn btn-principal" onclick="ir(\'home\',{limparHistorico:true})">Ir para o início</button></div>';
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
    +       'autocomplete="one-time-code" maxlength="7" placeholder="000000">'
    +     erroDoCampo("cod-erro", "codigoCelular", "codigo") + '</div>'
    +   '<p class="ajuda" id="cod-aviso">' + esc(c.aviso) + '</p>'
    +   soNaMaquete('<div class="cartao maquete"><b>⚙ NA MAQUETE</b>'
    +     '<div>Qualquer código de 6 números serve. Também dá para ver a tela de quem '
    +     'precisa aceitar os termos de novo, quando eles mudam.</div>'
    +     '<button class="btn btn-contorno" onclick="ir(\'termosNovos\')">Ver a tela dos termos novos</button></div>')
    + '</div>'
    + '<div class="rodape">'
    +   '<button class="btn btn-principal" onclick="confirmarCodigo(this)">Confirmar</button>'
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
    +   chaveDosTermos()
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
   04B. CADASTRO DA DIARISTA — primeira etapa + o mapa do que vem depois

   O fluxo completo da profissional (10 etapas: documentos, selfie,
   antecedentes, aprovação) é o próximo passo do projeto. Esta tela existe
   para o caminho não morrer e para o time de TI já ver o desenho da etapa.
   -------------------------------------------------------------------------- */
TELAS.cadastroDiarista = {
  html: function(){
    return ''
    + cabecalho("", { passos:[1,5] })
    + '<div class="corpo">'
    +   '<h2 class="titulo">Vamos começar! 🧹</h2>'
    +   '<p class="apoio">Crie sua conta para receber oportunidades de trabalho.</p>'
    +   '<div class="campo"><label>Nome completo</label>'
    +     '<input id="dia-nome" type="text" placeholder="Digite seu nome completo"></div>'
    +   '<div class="campo"><label>Telefone</label>'
    +     '<input id="dia-tel" type="tel" placeholder="(11) 99999-9999"></div>'
    +   '<div class="campo"><label>Senha</label>'
    +     '<input type="password" placeholder="Crie uma senha"></div>'
    +   '<div id="dia-erro" style="color:var(--vermelho);font-size:13px;font-weight:600"></div>'

    /* PORTÃO 1 (decisão R18): aqui não se pede documento nenhum.
       São dois minutos até ela ver oportunidades reais com valores reais.
       O documento vem depois, quando ela já sabe o que tem a ganhar. */
    +   '<div class="aviso roxo">⏱️<div><b>Dois minutos e você já vê as oportunidades</b>'
    +     'Documento só depois, quando você decidir que vale a pena.</div></div>'
    + '</div>'
    + '<div class="rodape">'
    +   '<button class="btn btn-principal" onclick="salvarDadosDaDiarista()">Continuar</button>'
    +   '<p class="apoio" style="text-align:center;margin:12px 0 0">Já tem uma conta? '
    +     '<a href="#" onclick="ir(\'login\');return false;" style="color:var(--roxo);font-weight:700;text-decoration:none">Entrar</a></p>'
    + '</div>';
  }
};

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
