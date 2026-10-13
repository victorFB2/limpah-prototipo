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
   ========================================================================== */

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
  },
};
