# Roteiro do vídeo (até 3 minutos)

A tarefa pede um vídeo de até 3 minutos com o app rodando. O roteiro segue a demonstração sugerida no documento de definição. Dá para gravar a tela do celular ou o app no navegador do computador.

## Gravando no computador

1. Na pasta do projeto, rode `npx expo start --web`. O app abre no navegador.
2. Para começar sem conta logada, abra numa janela anônima ou limpe os dados do site (F12 > Application > Clear site data).
3. Quando o navegador perguntar, **permita as notificações**. No Windows, desligue o "Não perturbe" para elas aparecerem.
4. Grave com a Barra de Jogos do Windows (Win + Alt + R) ou com o OBS.
5. **Não use "Usar minha localização" no vídeo:** no computador, ela mostra no mapa onde você está de verdade. Escolha o bairro na lista.
6. Na tela Relatar, "Tirar foto" abre a escolha de arquivo: deixe uma foto de rua molhada ou alagada salva no computador.

## Antes de gravar

1. No celular, limpe os dados do Expo Go, ou desinstale e reinstale o app, para começar sem conta logada.
2. Deixe o celular com internet, localização e som ligados.
3. Tenha à mão uma foto de rua molhada ou alagada, ou fotografe uma poça no caminho.
4. Ensaie uma vez: a chuva simulada no sensor 1 começa sempre que o app abre e se repete a cada 6 minutos. O alagamento aparece cerca de 1 minuto e meio depois do início.

## Roteiro

| Tempo | Mostrar | Falar |
|---|---|---|
| 0:00 | Tela de entrar | O problema: na chuva forte, a pessoa entra em rua alagada ou deixa o carro em lugar que alaga porque a informação está espalhada. O Pluvia junta tudo num mapa. |
| 0:15 | Entrar como cidadão. **Mapa**, legenda e filtros | Cada ocorrência tem fonte, horário e status. "Sem ponto no mapa" não quer dizer "seguro". |
| 0:35 | Abrir uma ocorrência **sem dados recentes** e uma **encerrada** | O app diferencia os estados e nunca diz que a rua está liberada. |
| 0:50 | **Meu carro**: atualizar o local (no computador, escolha o bairro) e escolher o raio | No celular, o local fica criptografado no cofre do sistema. Mostrar **Onde estacionar?** num bairro. |
| 1:10 | Esperar o aviso do sensor 1 | O ESP32 simulado mede a água a cada 10 s e só registra depois de 2 leituras seguidas. Mostrar a notificação e a aba **Avisos** com o tempo até chegar. |
| 1:35 | **Relatar**: tipo, bairro, hora com máscara, foto e confirmações. Mostrar um erro de validação. | A foto é limpa dos metadados antes do envio. |
| 1:55 | Tela do relato: **triagem da IA** e "Em análise" | A IA só sugere. A foto não comprova profundidade. |
| 2:10 | Sair e entrar como **equipe**. **Moderação**: checagem do contexto e **Publicar** | O relato aparece no mapa como relato comunitário, separado do oficial. |
| 2:30 | **Painel**: sensores e **Simular chuva**. Abrir uma ocorrência oficial e **Marcar como encerrada**. | Quem acompanha a região recebe o aviso de encerramento. |
| 2:50 | Encerramento | Próximos passos: ligar o app à API em C#, ao ESP32 no Wokwi e aos modelos de IA. |

Se a gravação passar de 3 minutos, corte a espera do aviso do sensor.
