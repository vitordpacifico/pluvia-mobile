# Roteiro do vídeo (até 3 minutos)

A tarefa pede um vídeo de até 3 minutos com o app rodando. O roteiro segue a demonstração sugerida no documento de definição. Grave a tela do celular com a fonte no tamanho padrão.

## Antes de gravar

1. Limpe os dados do Expo Go, ou desinstale e reinstale o app, para começar sem conta logada.
2. Deixe o celular com internet, localização e som ligados.
3. Tenha à mão uma foto de rua molhada ou alagada, ou fotografe uma poça no caminho.
4. Ensaie uma vez: a chuva simulada no sensor 1 começa sempre que o app abre e se repete a cada 6 minutos. O alagamento aparece cerca de 1 minuto e meio depois do início.

## Roteiro

| Tempo | Mostrar | Falar |
|---|---|---|
| 0:00 | Tela de entrar | O problema: na chuva forte, a pessoa entra em rua alagada ou deixa o carro em lugar que alaga porque a informação está espalhada. O Pluvia junta tudo num mapa. |
| 0:15 | Entrar como cidadão. **Mapa**, legenda e filtros | Cada ocorrência tem fonte, horário e status. "Sem ponto no mapa" não quer dizer "seguro". |
| 0:35 | Abrir uma ocorrência **sem dados recentes** e uma **encerrada** | O app diferencia os estados e nunca diz que a rua está liberada. |
| 0:50 | **Meu carro**: atualizar o local com o GPS e escolher o raio | O local fica criptografado no cofre do celular. Mostrar **Onde estacionar?** num bairro. |
| 1:10 | Esperar o aviso do sensor 1 | O ESP32 simulado mede a água a cada 10 s e só registra depois de 2 leituras seguidas. Mostrar a notificação e a aba **Avisos** com o tempo até chegar. |
| 1:35 | **Relatar**: tipo, bairro, hora com máscara, foto e confirmações. Mostrar um erro de validação. | A foto é limpa dos metadados antes do envio. |
| 1:55 | Tela do relato: **triagem da IA** e "Em análise" | A IA só sugere. A foto não comprova profundidade. |
| 2:10 | Sair e entrar como **equipe**. **Moderação**: checagem do contexto e **Publicar** | O relato aparece no mapa como relato comunitário, separado do oficial. |
| 2:30 | **Painel**: sensores e **Simular chuva**. Abrir uma ocorrência oficial e **Marcar como encerrada**. | Quem acompanha a região recebe o aviso de encerramento. |
| 2:50 | Encerramento | Próximos passos: ligar o app à API em C#, ao ESP32 no Wokwi e aos modelos de IA. |

Se a gravação passar de 3 minutos, corte a espera do aviso do sensor.
