# Uso de IA

As regras gerais da Global Solution permitem a IA como copiloto, desde que os prompts fiquem registrados (página 21 do PDF da GS).

**Ferramenta:** Claude Code (modelo Claude Opus 5.5).

## Como usamos a IA

O problema, o público, as telas e as regras do app saíram do grupo, no documento de definição da solução (proposta "Alaga", marca Pluvia). Usamos a IA como copiloto em três situações: tirar dúvidas de React Native e Expo, revisar o que já tínhamos escrito e destravar partes específicas, como a camada de armazenamento e o mapa na web. Toda sugestão foi testada no app rodando antes de entrar no projeto.

Abaixo estão os prompts mais importantes, em ordem. O texto foi revisado para ficar claro, sem mudar o que foi pedido.

## Prompts

### 1. Conferir a estrutura com a tarefa do Teams (05/11/2026)

> A tarefa de Mobile pede Context API para o login, AsyncStorage em camada de serviço, validações com máscara, simulação IoT e estilos separados das telas. Montamos as pastas assim: `app`, `telas`, `componentes`, `contexto`, `servicos` e `estilos`. Essa organização atende ao que a tarefa chama de "arquitetura refatorada"? O que você mudaria antes de começarmos as telas?

**Resultado:** Confirmamos a estrutura e acrescentamos a pasta `dominio`, para as regras que não dependem de tela (status das ocorrências, distância, avisos), o que facilitou os testes.

### 2. Camada de serviço do AsyncStorage (05/11/2026)

> Queremos que nenhuma tela chame o AsyncStorage direto. Como escrever uma camada de serviço em TypeScript para ler e gravar listas (contas, avisos, cópia offline do mapa) com tipagem, tratando o caso de o dado salvo estar corrompido?

**Resultado:** Escrevemos `armazenamento.ts` como único ponto de acesso ao AsyncStorage, e os serviços de contas, avisos e cache passaram a usar ele.

### 3. Validação e máscaras no cadastro (05/11/2026)

> Fizemos as máscaras de celular e CEP, mas o celular aceita DDD inválido e o CEP aceita "00000-000". Como validar DDD, celular com 9 na frente e CEP só com zeros, mostrando o erro abaixo do campo e anunciando para o leitor de tela?

**Resultado:** Validações em `utilitarios/validacoes.ts`, com testes, e erros anunciados pelo leitor de tela.

### 4. Proteger os dados apontados pela auditoria de Cyber (06/11/2026)

> Nossa auditoria de Cybersecurity mostrou que telefone e CEP estão no AsyncStorage, que grava em texto aberto. Pensamos em mover esses dados para o `expo-secure-store`. Como migrar as contas que já estão salvas sem perder dados, e o que fazer na versão web, que não tem o cofre?

**Resultado:** Movemos telefone, CEP, local do carro e favoritos para o cofre do sistema, com migração das contas antigas e armazenamento do navegador na versão web.

### 5. Simulação dos sensores sem alarme falso (07/11/2026)

> Nosso sensor simulado registra alagamento quando a água passa de 20 cm, mas uma leitura isolada alta já gera aviso. Queremos exigir 2 leituras seguidas acima de 20 cm para abrir e 2 abaixo de 8 cm para encerrar. Revise a nossa função `detectarEpisodios` e aponte os casos que ela erra.

**Resultado:** Corrigimos a detecção de episódios do sensor e cobrimos os casos de borda com testes.

### 6. Foto do relato sem localização escondida (07/11/2026)

> A foto do relato pode levar no EXIF a localização da casa da pessoa. Com o `expo-image-manipulator` da SDK 58, como gerar uma cópia da foto sem metadados antes de enviar? A função que usávamos aparece como obsoleta.

**Resultado:** Passamos a usar a API nova do `ImageManipulator`, e a foto enviada sai sem EXIF.

### 7. Revisão antes do teste no celular (10/11/2026)

> Antes de testarmos no celular, revise o nosso código sem executar o app. Procure chamadas do Expo que mudaram na SDK 58, campos que o teclado esconde no iPhone e casos em que o GPS pode travar.

**Resultado:** Ajustamos a permissão de notificação, os campos com teclado aberto e o GPS, com limite de tempo e última posição conhecida.

### 8. Mapa e notificações no navegador (11/11/2026)

> O nosso celular não roda bem o app, então vamos gravar o vídeo no navegador. O `react-native-maps` não funciona na web. Qual a forma mais simples de mostrar os mesmos pinos e raios com OpenStreetMap só na versão web, sem mexer na versão do celular?

**Resultado:** Criamos `Mapa/index.web.tsx` com Leaflet e OpenStreetMap e `notificacoes.web.ts` com as notificações do navegador.

### 9. Revisão do visual (11/11/2026)

> Achamos o visual fraco e o logotipo da tela de entrar parece colado na tela. Queremos manter o azul da marca Pluvia e o contraste mínimo de 7:1. Que mudanças no tema e nos componentes deixam o app mais coerente com a marca sem perder acessibilidade?

**Resultado:** Refizemos o tema (sombras, cantos arredondados e tons da marca), integramos o logotipo ao cabeçalho e conferimos de novo o contraste.

## Decisões do projeto

- Segundo perfil: **equipe de monitoramento**, que confere os relatos e atualiza as ocorrências, porque o documento fala em "validação adicional" dos relatos.
- A equipe não se cadastra pelo app. Duas contas de demonstração são criadas no primeiro uso, e a cidadã já vem com um carro salvo.
- Região do protótipo: Cambuci, Ipiranga, Mooca, Vila Prudente e vizinhos, com ocorrências e sensores fictícios em bairros reais.
- Triagem da foto simulada a partir do tipo do relato, com aviso na tela, até o modelo da disciplina de IA ficar pronto.
- "Sem dados recentes" quando uma ocorrência ativa passa de 1 hora sem atualização. Falta de dados nunca é tratada como "seguro".
- Carro, favoritos, telefone e CEP no cofre do sistema; nome e e-mail no armazenamento comum, porque o e-mail é usado para achar a conta no login.
- Login local, com hash SHA-256 e sal, porque a API ainda não existe.
- Notificações locais, com consulta a cada 10 segundos, em vez de notificações enviadas pelo servidor.

## Verificações feitas

- Checagem de tipos (`tsc --noEmit`), lint (`expo lint`) e `expo-doctor` sem erros.
- 156 testes automatizados passando.
- Roteiro inteiro testado na versão web, com as duas contas: mapa, foto, notificação, troca de conta, moderação e painel.
- Compilação do aplicativo para Android e iOS.
