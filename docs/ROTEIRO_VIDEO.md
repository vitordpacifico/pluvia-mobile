# Roteiro do vídeo (até 3 minutos)

A tarefa pede um vídeo de **até 3 minutos** com o app rodando. O roteiro mostra os 6 critérios da avaliação: telas e navegação, consumo de dados (simulação IoT), persistência (AsyncStorage), acessibilidade, aderência ao problema e documentação.

## Antes de gravar

1. Na pasta do projeto, rode `npx expo start --web`. O app abre no navegador, em tamanho de celular.
2. Abra o endereço numa **janela anônima**, para começar sem conta logada.
3. Quando o navegador perguntar, **permita as notificações**. No Windows, desligue o "Não perturbe".
4. Deixe uma foto de rua molhada ou alagada salva no computador. Em "Tirar foto", o navegador abre a escolha de arquivo.
5. Grave com a Barra de Jogos do Windows (Win + Alt + R) ou com o OBS.
6. **Não use "Usar minha localização":** no computador, ela mostra no mapa onde você está de verdade. Escolha o bairro na lista.

**O relógio do vídeo:** a chuva simulada no sensor 1 começa quando a página abre. O alagamento perto do carro aparece cerca de **1 minuto e meio depois**, e o aviso chega em seguida. Se perder o tempo, aperte F5: a chuva recomeça. Use a conta de demonstração do cidadão, que já tem o carro salvo perto do sensor. Uma conta nova começa sem carro, e o aviso pode não chegar a tempo.

## Roteiro

| Tempo | Mostrar | Falar |
|---|---|---|
| 0:00 | Tela de entrar | "Este é o Pluvia. Na chuva forte, as pessoas entram em rua alagada ou deixam o carro em lugar que alaga, porque a informação está espalhada. O app junta tudo num mapa e avisa a pessoa." |
| 0:15 | **Criar conta de cidadão**: digite um e-mail errado, um celular e um CEP e toque em Criar conta | "O cadastro tem máscara de celular e de CEP e valida cada campo." Depois volte. |
| 0:30 | **Usar conta de cidadão** e Entrar | "O login usa a Context API, com dois perfis: cidadão e equipe de monitoramento. A sessão fica salva no AsyncStorage." |
| 0:40 | **Mapa**: pinos, legenda e Filtros. Toque num pino vermelho e em "Ver detalhes". | "Cada ocorrência tem fonte, horário e status. O app diferencia ativo, encerrado, relato comunitário e sem dados recentes, e avisa que ponto nenhum no mapa não quer dizer rua segura." |
| 1:05 | **Meu carro** e **Onde estacionar?** (escolha a Mooca) | "O local do carro fica salvo no aparelho; no celular, criptografado. O app mostra os alagamentos no raio do carro e o risco estimado da região." |
| 1:25 | Esperar a **notificação** e abrir **Avisos** | "Um ESP32 simulado mede a água a cada 10 segundos. Com 2 leituras acima do limite, o app registra o alagamento e avisa quem tem o carro perto. Aqui está o nosso indicador: o tempo até o aviso chegar." |
| 1:45 | **Relatar**: Rua alagada, bairro Cambuci, rua, hora (com máscara), foto e as duas confirmações. Enviar. | "A comunidade também relata, com foto. A IA faz a triagem, e o relato fica em análise até a equipe conferir." |
| 2:10 | **Perfil** > Sair. **Usar conta da equipe**. **Moderação**: abrir o relato e Publicar. | "A equipe vê a sugestão da IA e o contexto: sensores e ocorrências perto. Publicado, o relato aparece no mapa em laranja, separado do oficial." |
| 2:35 | **Painel**: os sensores e Simular chuva no sensor 2 | "O painel mostra os sensores, as ocorrências por situação e controla a simulação IoT." |
| 2:50 | Encerramento | "O app tem leitor de tela, texto junto com a cor e contraste alto. O código está separado em camadas, e o README tem a Ficha da CitizenTech. Próximo passo: ligar à API em C# e ao ESP32 no Wokwi." |

Se passar de 3 minutos, encurte o Mapa e o Painel. Ensaie uma vez antes de gravar.

## Gravando no celular

1. Limpe os dados do Expo Go, ou desinstale e reinstale o app, para começar sem conta logada.
2. Deixe o celular com internet, localização e som ligados.
3. Siga o mesmo roteiro. No celular, o mapa usa o Google Maps ou o Apple Maps, e a câmera abre de verdade.
