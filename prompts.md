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

## Decisões sugeridas pela IA, para o grupo revisar

- Segundo perfil: **agente da Defesa Civil**. A tarefa cita como exemplo "cidadão e agente ou profissional".
- O agente não se cadastra pelo app. Duas contas de demonstração são criadas no primeiro uso.
- Login local, com hash SHA-256 e sal, porque a API ainda não existe.
- Cadastro do cidadão com nome, e-mail, celular, CEP, tipo (morador ou comerciante) e senha. Não pede CPF.
- Notificações locais, com consulta a cada 10 segundos, em vez de notificações enviadas pelo servidor.
- A regra das duas leituras seguidas também vale quando o risco diminui.
- Limites de exemplo: 10, 25 e 40 cm.
- Contrato da API em `docs/API.md`.
- Ícone próprio: gota de água em fundo azul.

## Verificações feitas

- Checagem de tipos (`tsc --noEmit`), lint (`expo lint`) e `expo-doctor` sem erros.
- 129 testes automatizados passando, também no GitHub Actions.
- Teste das telas e dos fluxos principais na versão web do aplicativo.

Ainda falta rodar o aplicativo no celular com o Expo Go. As notificações e a vibração não podem ser testadas no navegador.

## Revisão humana

- [ ] Aplicativo testado no celular
- [ ] Cada arquivo lido e explicado pelo grupo
