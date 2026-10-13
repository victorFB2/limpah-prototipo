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

    +   '<div class="campo"><label>E-mail ou telefone</label>'
    +     '<input id="log-email" type="text" placeholder="Digite seu e-mail ou telefone" value="ana@exemplo.com"></div>'
    +   '<div class="campo"><label>Senha</label>'
    +     '<div style="position:relative">'
    +       '<input id="log-senha" type="password" placeholder="Digite sua senha" value="123456" style="padding-right:46px">'
    +       '<button onclick="verSenha(\'log-senha\')" aria-label="Mostrar senha" '
    +         'class="olho">\ud83d\udc41</button>'
    +     '</div></div>'

    +   '<p style="text-align:right;margin:-4px 0 18px">'
    +     '<a href="#" onclick="ir(\'recuperar\');return false;" '
    +     'style="color:var(--roxo);font-size:13px;font-weight:600;text-decoration:none">Esqueceu sua senha?</a></p>'

    +   '<button class="btn btn-principal" onclick="fazerLogin()">Entrar</button>'

    +   '<div style="display:flex;align-items:center;gap:10px;margin:20px 0;color:var(--suave);font-size:12px">'
    +     '<div style="flex:1;height:1px;background:var(--borda)"></div>ou'
    +     '<div style="flex:1;height:1px;background:var(--borda)"></div></div>'

    +   '<button class="btn btn-claro" onclick="fazerLogin()">Entrar com Google</button>'
    +   '<button class="btn btn-claro" onclick="fazerLogin()">Entrar com Apple</button>'

    +   '<p class="apoio" style="text-align:center;margin-top:22px">'
    +     'Ainda não tem conta? <a href="#" onclick="ir(\'perfil\');return false;" '
    +     'style="color:var(--roxo);font-weight:700;text-decoration:none">Cadastre-se</a></p>'

    + '</div>';
  }
};

function fazerLogin(){
  E.logado = true;
  E.perfil = E.perfil || "cliente";
  E.cliente = E.cliente || Object.assign({}, CLIENTE_EXEMPLO, {
    casas: [Object.assign({}, CASA_EXEMPLO)],
  });
  salvar();
  ir(E.perfil === "diarista" ? "diaristaHome" : "home", { limparHistorico:true });
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
   -------------------------------------------------------------------------- */
TELAS.cadastroCliente = {
  html: function(){
    return ''
    + cabecalho("", { passos:[1,3] })
    + '<div class="corpo">'
    +   '<h2 class="titulo">Vamos começar! 🏠</h2>'
    +   '<p class="apoio">Crie sua conta para contratar serviços incríveis.</p>'

    +   '<div class="campo"><label>Nome completo</label>'
    +     '<input id="cc-nome" type="text" placeholder="Digite seu nome completo"></div>'
    +   '<div class="campo"><label>E-mail</label>'
    +     '<input id="cc-email" type="email" placeholder="Digite seu e-mail"></div>'
    +   '<div class="campo"><label>Telefone</label>'
    +     '<input id="cc-tel" type="tel" placeholder="(11) 99999-9999"></div>'
    +   '<div class="campo"><label>Senha</label>'
    +     '<input id="cc-senha" type="password" placeholder="Crie uma senha"></div>'
    +   '<div id="cc-erro" style="color:var(--vermelho);font-size:13px;font-weight:600"></div>'
    + '</div>'
    + '<div class="rodape">'
    +   '<button class="btn btn-principal" onclick="cadastroClientePasso1()">Continuar</button>'
    +   '<p class="apoio" style="text-align:center;margin:12px 0 0">Já tem uma conta? '
    +     '<a href="#" onclick="ir(\'login\');return false;" style="color:var(--roxo);font-weight:700;text-decoration:none">Entrar</a></p>'
    + '</div>';
  }
};

function cadastroClientePasso1(){
  const nome  = valorDoCampo("cc-nome").trim();
  const email = valorDoCampo("cc-email").trim();
  if(nome.length < 3 || email.indexOf("@") < 0){
    mostrarErro("cc-erro", "Preencha ao menos o nome completo e um e-mail válido.");
    return;
  }
  E.cliente = Object.assign({}, CLIENTE_EXEMPLO, {
    nome: nome,
    primeiroNome: nome.split(/\s+/)[0],
    email: email,
    telefone: valorDoCampo("cc-tel").trim() || CLIENTE_EXEMPLO.telefone,
  });
  salvar();
  ir("cadastroClienteEndereco");
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
    const en = (E.cliente && E.cliente.endereco) || CLIENTE_EXEMPLO.endereco;
    return ''
    + cabecalho("", { passos:[2,3] })
    + '<div class="corpo">'
    +   '<h2 class="titulo">Onde fica sua casa? 📍</h2>'
    +   '<p class="apoio">Usamos o endereço para encontrar profissionais perto de você.</p>'
    +   '<div class="campo"><label>CEP</label><input id="ce-cep" type="text" value="' + esc(en.cep) + '"></div>'
    +   '<div class="campo"><label>Endereço</label><input id="ce-rua" type="text" value="' + esc(en.rua) + '"></div>'
    +   '<div class="campo"><label>Complemento</label><input id="ce-comp" type="text" value="' + esc(en.complemento) + '"></div>'
    +   '<div class="campo"><label>Bairro</label><input id="ce-bairro" type="text" value="' + esc(en.bairro) + '"></div>'
    +   '<div class="campo"><label>Cidade e estado</label><input id="ce-cidade" type="text" value="' + esc(en.cidade + " - " + en.estado) + '"></div>'
    +   avisoDePrivacidadeDoEndereco()
    + '</div>'
    + '<div class="rodape"><button class="btn btn-principal" onclick="cadastroClientePasso2()">Continuar</button></div>';
  }
};

function cadastroClientePasso2(){
  const cidadeEstado = (valorDoCampo("ce-cidade") || "São Paulo - SP").split("-");
  E.cliente.endereco = {
    apelido: "Casa",
    cep:         valorDoCampo("ce-cep").trim(),
    rua:         valorDoCampo("ce-rua").trim(),
    complemento: valorDoCampo("ce-comp").trim(),
    bairro:      valorDoCampo("ce-bairro").trim(),
    cidade:      (cidadeEstado[0] || "").trim(),
    estado:      (cidadeEstado[1] || "SP").trim(),
  };
  salvar();
  ir("cadastroClienteTermos");
}

TELAS.cadastroClienteTermos = {
  html: function(){
    return ''
    + cabecalho("", { passos:[3,3] })
    + '<div class="corpo">'
    +   '<h2 class="titulo">Quase lá! ✅</h2>'
    +   '<p class="apoio">Confirme os termos para criar sua conta.</p>'

    +   '<div class="chave" id="chave-termos" onclick="alternarChaveVisual(this)">'
    +     '<div class="txt"><b>Aceito os termos de uso</b><span>Regras de uso da plataforma e política de cancelamento.</span></div>'
    +     '<div class="botao"></div></div>'

    +   '<div class="chave" id="chave-privacidade" onclick="alternarChaveVisual(this)">'
    +     '<div class="txt"><b>Aceito a política de privacidade</b><span>Como seus dados são usados e protegidos.</span></div>'
    +     '<div class="botao"></div></div>'

    +   '<div class="chave" onclick="alternarChaveVisual(this)">'
    +     '<div class="txt"><b>Quero receber ofertas</b><span>Opcional. Você pode desativar quando quiser.</span></div>'
    +     '<div class="botao"></div></div>'

    +   '<div class="aviso verde">🛡️<div><b>Segurança é prioridade</b>'
    +     'Todas as diaristas passam por verificação de documentos e antecedentes.</div></div>'
    +   '<div id="ct-erro" style="color:var(--vermelho);font-size:13px;font-weight:600"></div>'
    + '</div>'
    + '<div class="rodape"><button class="btn btn-principal" onclick="criarContaCliente()">Criar minha conta</button></div>';
  }
};

/* Liga/desliga visual de uma chave, sem mexer no estado geral. */
function alternarChaveVisual(elemento){
  elemento.classList.toggle("ligada");
}

function criarContaCliente(){
  const t = chaveLigada("chave-termos");
  const p = chaveLigada("chave-privacidade");
  if(!t || !p){
    mostrarErro("ct-erro", "Para continuar, aceite os termos de uso e a política de privacidade.");
    return;
  }
  E.logado = true;
  E.perfil = "cliente";
  salvar();
  ir("boasVindas", { limparHistorico:true });
}

TELAS.boasVindas = {
  html: function(){
    const nome = (E.cliente && E.cliente.primeiroNome) || "por aqui";
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

/* O que ainda não existe do lado dela não pode dar em nada: esta tela diz
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
