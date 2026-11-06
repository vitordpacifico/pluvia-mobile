# Roteiro do vídeo (até 3 minutos)

A tarefa pede um vídeo de até 3 minutos com o app rodando. Grave a tela do celular com a fonte no tamanho padrão.

## Antes de gravar

1. Limpe os dados do Expo Go, ou desinstale e reinstale o app, para começar sem conta logada.
2. Deixe o celular com internet e som ligados.
3. Ensaie uma vez: a água do Ponto A leva cerca de 2 minutos e meio para chegar a Evacuação.

## Roteiro

| Tempo | Mostrar | Falar |
|---|---|---|
| 0:00 | Tela de login | O problema: a pessoa só percebe o alagamento quando a água já chegou. O SENTINELA avisa antes. |
| 0:10 | **Criar conta**: digitar celular e CEP, errar a senha | As máscaras e as validações. Os dados ficam no celular, salvos com AsyncStorage. |
| 0:30 | Concluir o cadastro e aceitar as notificações | Login com perfil de cidadão, pela Context API. |
| 0:40 | Lista de pontos e Ponto C | Risco, nível da água e o aviso de sensor sem sinal |
| 0:50 | Abrir o Ponto A e tocar em **Ativar alertas** | O gráfico, as orientações e os limites |
| 1:00 | Esperar a água subir | A simulação IoT imita o ESP32 com sensor ultrassônico. São necessárias duas leituras seguidas para mudar o nível. |
| 1:15 | Notificações de **Atenção**, **Alerta** e **Evacuação** | O celular vibra, e a orientação muda a cada nível. |
| 1:50 | Aba **Alertas** e **Estou em segurança** | O indicador de impacto: o tempo entre a detecção e a chegada do aviso |
| 2:05 | Perfil e **Sair**. Entrar como **agente** | O segundo perfil de usuário |
| 2:15 | **Painel** | Pontos por nível e sensores sem sinal |
| 2:25 | **Simular chuva** no Ponto B e **Ajustar limites** | A ação do agente e a validação dos limites |
| 2:45 | Modo avião e puxar a lista | O app mostra os últimos dados salvos |
| 2:55 | Encerramento | Próximo passo: ligar o app à API em C# e ao ESP32. |

Se a gravação passar de 3 minutos, corte a espera entre as notificações.
