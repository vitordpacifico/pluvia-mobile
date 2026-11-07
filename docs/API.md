# Contrato da API (proposta)

> **Proposta do app, ainda não combinada com quem desenvolve a API em C#.** Os caminhos seguem os exemplos do documento de definição do grupo. Se a API usar outros nomes, ajuste `src/servicos/dados/api.ts`.

Hoje o app usa dados simulados (`src/servicos/dados/simulacao.ts`). Para ele passar a usar a API, crie um arquivo `.env` na raiz:

```bash
EXPO_PUBLIC_API_URL=http://SEU_IP:5000
```

O celular não acessa `localhost` do computador. Use o IP do computador na rede local, ou um endereço público.

Todas as datas são ISO 8601 em UTC. O app valida cada resposta e mostra um erro claro quando um campo vem errado.

## GET /ocorrencias

Lista as ocorrências. A API pode aceitar `?lat=&lon=&raio=`; o app filtra a distância do lado dele.

```json
[
  {
    "id": "oc-1",
    "titulo": "Alagamento na via",
    "bairro": "Ipiranga",
    "referencia": "Rua Silva Bueno, altura do 1000",
    "local": { "latitude": -23.5893, "longitude": -46.6047 },
    "fonte": { "tipo": "OFICIAL", "nome": "CGE-SP" },
    "status": "ATIVO",
    "registradaEm": "2026-11-07T14:20:00Z",
    "atualizadaEm": "2026-11-07T14:55:00Z",
    "encerradaEm": null,
    "historico": [
      { "status": "ATIVO", "em": "2026-11-07T14:20:00Z", "descricao": "Ocorrência registrada pela fonte." }
    ],
    "nivelCm": 32.5,
    "relatoId": null
  }
]
```

| Campo | Valores |
|---|---|
| `fonte.tipo` | `OFICIAL`, `SENSOR` ou `COMUNIDADE` |
| `status` | `ATIVO` ou `ENCERRADO`. O app calcula "sem dados recentes" quando `atualizadaEm` passa de 1 hora. |
| `nivelCm` | Opcional. Só para ocorrências de sensor. |
| `relatoId` | Opcional. Só para ocorrências que vieram de um relato publicado. |

## POST /ocorrencias/{id}/encerramento

Marca a ocorrência como encerrada (usado pela equipe). Responde `204`.

## GET /riscos

Risco estimado por região, calculado pelo modelo de ML.

```json
[
  {
    "id": "risco-cambuci",
    "bairro": "Cambuci",
    "centro": { "latitude": -23.5662, "longitude": -46.6196 },
    "raioM": 900,
    "faixa": "ELEVADO",
    "calculadoEm": "2026-11-07T15:00:00Z",
    "validoAte": "2026-11-07T16:00:00Z",
    "motivo": "Chuva forte medida agora e histórico de alagamentos na região."
  }
]
```

`faixa`: `BAIXO`, `MODERADO` ou `ELEVADO`.

## GET /sensores

Sensores de nível (ESP32) com as últimas leituras.

```json
[
  {
    "id": "sensor-1",
    "nome": "Sensor 1",
    "bairro": "Cambuci",
    "referencia": "Av. do Estado",
    "local": { "latitude": -23.5662, "longitude": -46.6196 },
    "nivelCm": 32.5,
    "atualizadoEm": "2026-11-07T15:00:00Z",
    "leituras": [{ "nivelCm": 30.1, "medidoEm": "2026-11-07T14:59:50Z" }]
  }
]
```

## POST /sensores/leituras

O ESP32 envia as leituras por aqui. O app usa o mesmo endpoint, no painel da equipe, para pedir uma chuva simulada:

```json
{ "sensorId": "sensor-1", "simulacao": "chuva-forte" }
```

## POST /fotos/analise

Recebe a foto (`multipart/form-data`, campo `foto`, JPEG já sem metadados) e devolve o identificador. A triagem da IA fica guardada com a foto.

```json
{ "fotoId": "foto-1" }
```

## POST /relatos

```json
{
  "autorId": "u1",
  "tipo": "RUA_ALAGADA",
  "descricao": "Água na altura da calçada",
  "bairro": "Cambuci",
  "referencia": "Rua Lavapés",
  "local": { "latitude": -23.5679, "longitude": -46.6178 },
  "ocorridoEm": "2026-11-07T14:55:00Z",
  "fotoId": "foto-1"
}
```

Responde o relato criado:

```json
{
  "id": "rel-1",
  "autorId": "u1",
  "tipo": "RUA_ALAGADA",
  "descricao": "Água na altura da calçada",
  "bairro": "Cambuci",
  "referencia": "Rua Lavapés",
  "local": { "latitude": -23.5679, "longitude": -46.6178 },
  "ocorridoEm": "2026-11-07T14:55:00Z",
  "enviadoEm": "2026-11-07T14:56:00Z",
  "fotoUrl": "https://api.exemplo.com/fotos/foto-1.jpg",
  "triagem": { "categoria": "INDICIO", "confianca": 0.84, "analisadaEm": "2026-11-07T14:56:01Z" },
  "status": "EM_ANALISE",
  "revisadoEm": null,
  "motivoRecusa": null,
  "ocorrenciaId": null
}
```

| Campo | Valores |
|---|---|
| `tipo` | `RUA_ALAGADA`, `AGUA_SUBINDO`, `CHUVA_FORTE` ou `OUTRO` |
| `triagem.categoria` | `INDICIO`, `SEM_INDICIO` ou `INCONCLUSIVA`. `triagem` é `null` quando não há foto. |
| `status` | `EM_ANALISE`, `PUBLICADO` ou `RECUSADO` |

## GET /relatos

Filtros opcionais: `?autorId=` (relatos de uma pessoa) e `?status=EM_ANALISE` (fila da moderação).

## POST /relatos/{id}/revisao

Decisão da equipe:

```json
{ "publicar": true }
```

```json
{ "publicar": false, "motivo": "Evidência insuficiente." }
```

Responde o relato atualizado. Ao publicar, a API cria a ocorrência com `fonte.tipo = "COMUNIDADE"` e preenche `ocorrenciaId`.

## DELETE /relatos/{id}?autorId= e DELETE /relatos?autorId=

Excluem um relato do autor, ou todos os relatos dele (exclusão de conta, LGPD). Respondem `204`.

## Locais monitorados

O documento cita `POST /locais-monitorados`. No protótipo, o carro e os favoritos ficam só no celular, no cofre do sistema, e os avisos são calculados no app. Com notificações enviadas pelo servidor, os locais teriam de ir para a API, com acesso restrito ao próprio usuário.
