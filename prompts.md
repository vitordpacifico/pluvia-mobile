# Uso de IA

As regras gerais da Global Solution pedem o registro dos prompts usados (página 21 do PDF da GS).

**Ferramenta:** Claude Code (modelo Claude Opus 5.5).

Abaixo estão os prompts principais da construção do app, em ordem. O texto de cada um foi revisado para ficar claro e completo, sem mudar o que foi pedido.

## Prompts

### 1. Criar o app sobre a tarefa do Teams (05/11/2026)

> Crie um aplicativo em React Native com Expo e TypeScript para a nossa CitizenTech. Siga a tarefa de Mobile do Teams: Expo Router com rotas protegidas, login com dois perfis pela Context API, formulários com validação e máscaras, dados simulados com uma simulação IoT de sensores que gere alertas, e persistência com AsyncStorage em uma camada de serviço. Separe o código em telas, componentes, contexto, serviços e estilos, com um `estilos.ts` para cada tela e componente. Use dados simulados enquanto a API não existe e escreva testes automatizados para a lógica e para as telas principais.

**Resultado:** Projeto Expo em camadas, login com dois perfis e senha guardada como hash, cadastro com máscaras de celular e CEP, simulação de sensores, persistência no AsyncStorage em camada de serviço e testes automatizados.

### 2. Proteger os dados pessoais apontados pela auditoria de Cybersecurity (06/11/2026)

> A auditoria de Cybersecurity mostrou que o telefone e o CEP do cidadão são salvos no AsyncStorage, que grava em texto aberto. Mova esses dados, o local do carro e os locais favoritos para o cofre do sistema (`expo-secure-store`), migre as contas já salvas, apague o cofre quando a conta for excluída e escreva testes para isso. Antes de enviar a foto do relato, gere uma cópia sem os metadados (EXIF), para não expor onde a foto foi tirada.

**Resultado:** Dados pessoais no cofre do sistema (Keychain no iOS, Keystore no Android), migração das contas antigas, exclusão de conta que apaga tudo (LGPD), foto enviada sem EXIF e testes novos.

### 3. Adaptar o app ao documento de definição do grupo (07/11/2026)

> O documento de definição do grupo (proposta "Alaga") passa a ser a base do projeto, com o nome e o logotipo Pluvia. Refaça o app sobre o MVP recomendado no documento: mapa e lista de ocorrências com os cinco estados (confirmado, relato comunitário, encerrado, relato em análise e sem dados recentes), tela da ocorrência com fonte, horários e histórico, "Meu carro" com aviso no raio escolhido, relato com foto e triagem de IA, moderação pela equipe e aviso de encerramento. Nunca trate "sem dados" como "seguro". Simule três sensores ESP32 e uma fonte oficial em bairros reais de São Paulo, deixe o contrato da API pronto e mantenha todos os testes passando.

**Resultado:** App refeito sobre o MVP: mapa com os cinco estados, filtros e risco estimado; carro e favoritos com raio; relato com foto, limpeza dos metadados e moderação; avisos de alagamento novo, encerramento e risco elevado; simulação de 3 sensores ESP32 e da fonte oficial; contrato da API em `docs/API.md` e 156 testes.

### 4. Revisar o código antes do teste no celular (10/11/2026)

> Antes de rodar no celular, revise o código inteiro sem executar o app. Procure erros de lógica, chamadas de API do Expo que mudaram na SDK 58, campos que o teclado esconde no iPhone, permissões pedidas na hora errada e casos em que o GPS pode travar. Corrija o que encontrar e confirme com testes, checagem de tipos e lint.

**Resultado:** Permissão de notificação pedida ao entrar, campos visíveis com o teclado aberto, limite de tempo e última posição conhecida no GPS, troca de uma função obsoleta do `expo-image-manipulator` e testes mais estáveis.

### 5. Rodar e gravar no navegador do computador (11/11/2026)

> Meu celular não roda bem o app, então o vídeo vai ser gravado no navegador do computador. Faça o app funcionar por inteiro com `npx expo start --web`: mapa de verdade com OpenStreetMap, notificações do navegador, confirmações que funcionem na web e o app centralizado em tamanho de celular. Escreva um roteiro de vídeo de até 3 minutos que mostre os 6 critérios da avaliação, com as falas e o que mostrar em cada momento.

**Resultado:** Versão web completa (Leaflet com OpenStreetMap, notificações do navegador e app em tamanho de celular) e roteiro do vídeo em `docs/ROTEIRO_VIDEO.md`.

### 6. Redesenhar o visual (11/11/2026)

> O visual está fraco e o logotipo da tela de entrar parece uma imagem colada. Redesenhe o app com uma identidade coerente com a marca Pluvia: tema com sombras e cantos arredondados, botões, campos e filtros novos, logotipo sem fundo integrado ao topo azul, mapa em destaque e cartões para ocorrências, carro e painel. Mantenha o contraste mínimo de 7:1, a área de toque de 48 pontos e os testes passando.

**Resultado:** Tema novo, componentes redesenhados, logotipo integrado ao cabeçalho, mapa em primeiro lugar e cartões novos, com o contraste de 7:1 conferido.

### 7. Refinar as telas uma a uma (15/11/2026)

> Revise cada tela em tamanho de celular e refine o que ainda estiver cru: relato em etapas numeradas, ocorrência com linha do tempo, avisos com cor por tipo e marca de não lido, perfil com avatar, telas vazias com ícone e texto curto, selo de situação do relato, painel com o nível de cada sensor e endereço real no carro de demonstração. Refaça os prints do README no final.

**Resultado:** Todas as telas refinadas, campo de texto sem o contorno preto do navegador e 11 prints novos no README.

## Decisões sugeridas pela IA, para o grupo revisar

- Segundo perfil: **equipe de monitoramento**, que confere os relatos e atualiza as ocorrências. O documento fala em "validação adicional" dos relatos.
- A equipe não se cadastra pelo app. Duas contas de demonstração são criadas no primeiro uso, e a cidadã já vem com um carro salvo.
- Região do protótipo: Cambuci, Ipiranga, Mooca, Vila Prudente e vizinhos, com ocorrências e sensores fictícios em bairros reais.
- Triagem da foto simulada a partir do tipo do relato, com aviso na tela, até o modelo da disciplina de IA ficar pronto.
- Risco estimado simulado: sobe para elevado quando o sensor da região mede água.
- Relato em análise visível só para o autor e para a equipe.
- "Sem dados recentes" quando uma ocorrência ativa passa de 1 hora sem atualização.
- Sensor: alagamento a partir de 20 cm em 2 leituras seguidas, e fim abaixo de 8 cm em 2 leituras seguidas.
- Carro, favoritos, telefone e CEP no cofre do sistema; nome e e-mail no armazenamento comum, porque o e-mail é usado para achar a conta no login.
- Login local, com hash SHA-256 e sal, porque a API ainda não existe.
- Notificações locais, com consulta a cada 10 segundos, em vez de notificações enviadas pelo servidor.
- Contrato da API em `docs/API.md`, com os caminhos do documento de definição.

## Verificações feitas

- Checagem de tipos (`tsc --noEmit`), lint (`expo lint`) e `expo-doctor` sem erros.
- 156 testes automatizados passando.
- Teste do roteiro inteiro na versão web do aplicativo, com as duas contas: mapa, foto, notificação, troca de conta, moderação e painel.
- Compilação do aplicativo para Android e iOS.

Ainda falta rodar o aplicativo no celular com o Expo Go. O mapa, a câmera, o GPS, as notificações e a vibração não podem ser testados no navegador.

## Revisão humana

- [ ] Cada arquivo lido e explicado pelo grupo
