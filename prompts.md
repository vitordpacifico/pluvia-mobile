# Uso de IA

O PDF da GS pede o registro dos prompts usados. Ferramenta: Claude Code (Claude Opus 5.5).

## Prompts

### 05/11/2026: validar a ideia

O grupo enviou o documento de contexto do SENTINELA (problema, arquitetura, níveis de risco, indicador e ODS) e perguntou:

> pensamos nisso pra essa Global Solution, faz sentido?

Resultado: análise de como o tema atende cada disciplina e dos riscos, como os dados reais para ML e as notificações no Expo Go.

### 05/11/2026: criar o app

> Sim, comece

(resposta a "Começo o app do SENTINELA no GS-Mobile, usando dados simulados?")

Resultado: a IA criou o projeto Expo, as telas, a simulação, a persistência local, as notificações locais, o contrato proposto da API e o README.

### 05/11/2026: melhorar o app

> quero que melhore o de mobile, pq preciso tirar 100 ele precisa estar perfeito.

Resultado: cópia offline dos pontos, contador de alertas pendentes, vibração no alerta, tratamento de erros, ícone próprio, testes automatizados e roteiro do vídeo.

### 06/11/2026: adequar à tarefa do Teams

O grupo enviou um print das instruções da tarefa no Teams, que pedem login com perfis, Context API, máscaras, simulação IoT, AsyncStorage em camada de serviço e estilos separados.

Resultado: a IA reorganizou o app para atender a tarefa:

- Trocou o SQLite pelo AsyncStorage, em uma camada de serviço.
- Criou o login com dois perfis (cidadão e agente da Defesa Civil), pela Context API, com senha guardada como hash.
- Criou o cadastro com máscaras de celular e CEP e validação em cada campo.
- Criou o painel do agente, o ajuste de limites e o controle da simulação IoT.
- Separou o código em camadas (telas, componentes, contexto, serviços, estilos) e cada tela e componente com o próprio `estilos.ts`.
- Ampliou os testes para 106.

### 06/11/2026: completar a entrega e publicar

> antes de eu sequer testar e rodar, vc consegue arrumar oq der nos incompletos, e melhorar ainda mais o sprint de mobile p entrega ficar show? ja criar o repo no github e etc

Resultado: a IA completou o README (link do repositório, tabela do grupo, galeria de prints), gerou os prints pela versão web do app com um script automatizado, corrigiu dois problemas visuais vistos nos prints (rótulos do gráfico cobertos pelas barras e texto das abas), adicionou a verificação automática no GitHub Actions e publicou o repositório.

## Decisões tomadas pela IA, para o grupo revisar

- Segundo perfil: **agente da Defesa Civil**. A tarefa dá como exemplo "cidadão e agente ou profissional".
- O agente não se cadastra pelo app: duas contas de demonstração são criadas no primeiro uso.
- Login local, com hash SHA-256 e sal, porque a API ainda não existe.
- Cadastro do cidadão com nome, e-mail, celular, CEP, tipo (morador ou comerciante) e senha. Não pede CPF.
- Notificações locais com consulta a cada 10 segundos, em vez de push.
- Mesma regra das duas leituras também na descida do risco.
- Limites de exemplo: 10, 25 e 40 cm.
- Contrato da API em `docs/API.md`.
- Ícone próprio: gota de água em fundo azul.

## Validação feita pela IA

- `tsc --noEmit`, `expo lint` e `expo-doctor` sem erros.
- 106 testes automatizados passando.
- Teste no navegador, em uma cópia web do projeto.

Ainda falta rodar no celular com o Expo Go. As notificações e a vibração não podem ser testadas no navegador.

## Revisão humana

- [ ] Rodado no celular
- [ ] Cada arquivo lido e explicado pelo grupo
