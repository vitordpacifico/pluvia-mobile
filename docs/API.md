# Contrato da API (proposta)

> **Proposta do app, ainda não combinada com quem desenvolve a API em C#.** Se a API usar outros nomes, ajuste `src/dados/api.ts`.

Hoje o app usa dados simulados (`src/dados/simulacao.ts`). Para ele passar a usar a API, crie um arquivo `.env` na raiz:

```bash
EXPO_PUBLIC_API_URL=http://SEU_IP:5000
```

O celular não acessa `localhost` do computador. Use o IP do computador na rede local, ou um endereço público.

## GET /api/pontos

Lista os pontos monitorados com o risco atual.

```json
[
  {
    "id": "ponto-1",
    "nome": "Nome do ponto",
    "endereco": "Rua e número",
    "regiao": "Bairro, São Paulo, SP",
    "nivelAtualCm": 14.5,
    "risco": "ATENCAO",
    "riscoDetectadoEm": "2026-11-05T14:00:50Z",
    "atualizadoEm": "2026-11-05T14:01:00Z",
    "limites": { "atencaoCm": 10, "alertaCm": 25, "evacuacaoCm": 40 }
  }
]
```

| Campo | Regra |
|---|---|
| `risco` | `NORMAL`, `ATENCAO`, `ALERTA` ou `EVACUACAO`, sem acento. A API aplica a regra das duas leituras seguidas. |
| `riscoDetectadoEm` | Horário da primeira leitura que levou ao risco atual. É usado no indicador de impacto. Pode ser `null`. |
| `atualizadoEm` | Horário da última leitura do sensor. Depois de 5 minutos sem leitura, o app avisa que os dados podem estar desatualizados. |
| Datas | ISO 8601 em UTC. |

## GET /api/pontos/{id}/leituras?limite=18

Últimas leituras do ponto, para o gráfico.

```json
[
  { "pontoId": "ponto-1", "nivelCm": 14.5, "medidoEm": "2026-11-05T14:01:00Z" }
]
```

## POST /api/confirmacoes

Registra que o morador confirmou estar em segurança.

```json
{ "pontoId": "ponto-1", "confirmadoEm": "2026-11-05T14:03:12Z" }
```

Resposta esperada: `201` ou `204`.

## PUT /api/pontos/{id}/limites

Usado pelo agente da Defesa Civil para mudar os limites de um ponto.

```json
{ "atencaoCm": 12, "alertaCm": 30, "evacuacaoCm": 45 }
```

Resposta esperada: `204`. A API deve validar que cada limite está entre 1 e 300 cm e é maior que o anterior, e deve aceitar a chamada só de agentes autenticados.

## Indicador de impacto

O app calcula o tempo entre `riscoDetectadoEm`, vindo da API, e o momento em que o alerta chegou ao celular. Os relógios da API e do celular precisam estar corretos para a medida valer.
