# Uso de IA

As regras gerais da Global Solution pedem o registro dos prompts usados (página 21 do PDF da GS).

**Ferramenta:** Claude Code (modelo Claude Opus 5.5).

Os pedidos abaixo foram reescritos em linguagem formal, mantendo o conteúdo de cada um.

## Prompts

### 1. Validar a ideia (05/11/2026)

**Pedido:** O grupo apresentou o documento de contexto do SENTINELA (problema, arquitetura, níveis de risco, indicador de impacto e ODS) e perguntou se a proposta fazia sentido para a Global Solution.

**Resultado:** Análise de como o tema atende cada disciplina, com os riscos encontrados: a disponibilidade de dados públicos reais para a disciplina de IA, o nome igual ao de outro projeto do grupo, as limitações de notificação no Expo Go e a conexão entre o simulador Wokwi e a API.

### 2. Criar o app (05/11/2026)

**Pedido:** Criar o aplicativo do SENTINELA em Expo, usando dados simulados enquanto a API não existe.

**Resultado:** Projeto Expo com as telas, a simulação do sensor, a persistência local, as notificações locais, a proposta de contrato da API e o README.

### 3. Melhorar o app (05/11/2026)

**Pedido:** Melhorar o aplicativo para atender da melhor forma possível os critérios de avaliação.

**Resultado:** Cópia dos pontos salva no celular para uso sem conexão, contador de alertas pendentes, vibração no alerta, tratamento de erros nas telas, ícone próprio, testes automatizados e roteiro do vídeo.

### 4. Adequar à tarefa do Teams (06/11/2026)

**Pedido:** Adequar o aplicativo às instruções da tarefa publicada no Teams. Elas pedem login com perfis de usuário pela Context API, formulários com validação e máscaras, simulação IoT, persistência com AsyncStorage em camada de serviço e estilos separados das telas.

**Resultado:**

- Troca do SQLite pelo AsyncStorage, em uma camada de serviço.
- Login com dois perfis (cidadão e agente da Defesa Civil) pela Context API, com a senha guardada como hash.
- Cadastro com máscaras de celular e CEP e validação em cada campo.
- Painel do agente, ajuste dos limites de risco e controle da simulação IoT.
- Código separado em camadas (telas, componentes, contexto, serviços e estilos), com um `estilos.ts` para cada tela e componente.
- Ampliação dos testes automatizados para 106.

### 5. Completar a entrega e publicar (06/11/2026)

**Pedido:** Completar os itens pendentes da entrega, melhorar o acabamento do aplicativo e publicar o repositório no GitHub.

**Resultado:** README com o link do repositório, a tabela do grupo e a galeria de prints. Prints gerados a partir da versão web do aplicativo. Correção de dois problemas visuais encontrados nos prints: os rótulos do gráfico cobertos pelas barras e o texto das abas. Verificação automática no GitHub Actions e publicação do repositório.

### 6. Revisar este registro (06/11/2026)

**Pedido:** Reescrever este arquivo em linguagem formal, sem mudar o conteúdo dos pedidos.

**Resultado:** Esta versão do arquivo.

### 7. Corrigir os pontos fracos do código (06/11/2026)

**Pedido:** Corrigir as limitações apontadas na revisão do código antes do primeiro teste no celular.

**Resultado:** Exclusão de conta com confirmação por senha (LGPD), explicação da regra das 2 leituras no Painel e na tela do ponto, chuva simulada salva no AsyncStorage, 21 testes de tela com a React Native Testing Library (129 testes no total) e acentuação dos comentários do código e dos nomes dos testes.

### 8. Criptografar os dados de contato (06/11/2026)

**Pedido:** Corrigir o ponto apontado pela auditoria de Cybersecurity: o telefone e o CEP do cidadão eram salvos no AsyncStorage sem criptografia.

**Resultado:** Telefone e CEP movidos para o cofre do sistema (`expo-secure-store`), com migração das contas já salvas, remoção do cofre na exclusão de conta e 5 testes novos (134 no total).

### 9. Remover os comentários do código (07/11/2026)

**Pedido:** Remover os comentários de todos os arquivos de código, seguindo o que o aluno já tinha feito em `src/app/_layout.tsx`.

**Resultado:** Comentários removidos dos 46 arquivos de código, sem alterar nenhuma linha de código. Testes, checagem de tipos e lint sem erros.

### 10. Adaptar o app ao documento de definição (07/11/2026)

**Pedido:** Adaptar completamente o aplicativo ao documento de definição da solução (proposta "Alaga"), que passa a ser a base do projeto, usando o nome e o logotipo Pluvia.

**Resultado:** Aplicativo refeito sobre o MVP recomendado no documento:

- mapa e lista de ocorrências com os cinco estados do documento, filtros e risco estimado por região;
- tela da ocorrência com fonte, horários, histórico e aviso de encerramento;
- meu carro e locais favoritos no cofre do sistema, com raio e consulta "Onde estacionar?";
- relato com foto, limpeza dos metadados da imagem, triagem de IA simulada e moderação pela equipe;
- avisos de alagamento novo, encerramento e risco elevado, com o tempo até a chegada;
- simulação de três sensores ESP32, de uma fonte oficial e do servidor dos relatos;
- novo contrato da API, novo roteiro do vídeo e 156 testes automatizados.

### 11. Logotipo, nome do repositório e revisão final (07/11/2026)

**Pedido:** Aplicar o logotipo Pluvia, renomear o repositório e revisar se tudo está correto.

**Resultado:** Logotipo na tela de entrar, ícones do app gerados a partir dele e cor principal igual ao azul do logotipo. Repositório renomeado para `pluvia-mobile`. Na revisão: troca de uma função obsoleta do `expo-image-manipulator`, cores de pino que o Android consegue mostrar, legenda dos pinos e a chuva do sensor 1 recomeçando sempre que o app abre.

### 12. Revisão do código antes do teste no celular (10/11/2026)

**Pedido:** Revisar todo o código antes de rodar o aplicativo no celular.

**Resultado:** Pedido de permissão de notificação ao entrar como cidadão, campos que não ficam escondidos pelo teclado no iPhone, limite de tempo e última posição conhecida no GPS, e tempo maior para os testes automáticos.

### 13. Deixar a versão web pronta para gravar o vídeo (11/11/2026)

**Pedido:** Preparar o aplicativo para rodar e gravar o vídeo no navegador do computador.

**Resultado:** Mapa de verdade na web (Leaflet com OpenStreetMap), notificações do navegador, confirmação de "Sair da conta" e "Reiniciar a demonstração" que funciona na web e o app centralizado em tamanho de celular. Roteiro do vídeo com as instruções para gravar no computador.

### 14. Melhorar o visual do aplicativo (11/11/2026)

**Pedido:** Melhorar o visual, que estava feio, incluindo o logotipo da tela de entrar, que parecia uma imagem colada.

**Resultado:** Tema novo com sombras no lugar das bordas, cantos arredondados e tons claros da cor da marca. Botões, campos, opções e filtros redesenhados. Logotipo sem fundo no topo azul da tela de entrar e no cabeçalho. Tela do mapa com o mapa em primeiro lugar, resumo e legenda juntos e riscos estimados em cartões laterais. Cartões novos para ocorrências, carro e painel da equipe. Contraste mínimo de 7:1 conferido de novo.

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

- [ ] Aplicativo testado no celular
- [ ] Cada arquivo lido e explicado pelo grupo
