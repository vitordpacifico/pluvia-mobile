import { distanciaMetros, formatarDistancia } from './geo';
import type { Ocorrencia } from './ocorrencia';
import type { Relato } from './relato';
import { LIMIAR_ALAGAMENTO_CM } from './sensor';
import type { SensorNivel } from './tipos';

const RAIO_CONTEXTO_M = 1000;
const JANELA_RELATOS_MS = 60 * 60_000;

export interface PistaContexto {
  texto: string;
  reforca: boolean;
}

export function checarContexto(
  relato: Relato,
  ocorrencias: readonly Ocorrencia[],
  sensores: readonly SensorNivel[],
  relatos: readonly Relato[],
): PistaContexto[] {
  const pistas: PistaContexto[] = [];

  const ativas = ocorrencias.filter(
    (o) =>
      o.status === 'ATIVO' &&
      o.relatoId !== relato.id &&
      distanciaMetros(relato.local, o.local) <= RAIO_CONTEXTO_M,
  );
  pistas.push(
    ativas.length > 0
      ? { texto: `${ativas.length} ocorrência(s) ativa(s) a menos de 1 km`, reforca: true }
      : { texto: 'Nenhuma ocorrência ativa a menos de 1 km', reforca: false },
  );

  const sensor = sensores
    .map((s) => ({ sensor: s, distanciaM: distanciaMetros(relato.local, s.local) }))
    .filter(({ distanciaM }) => distanciaM <= RAIO_CONTEXTO_M)
    .sort((a, b) => a.distanciaM - b.distanciaM)[0];
  if (sensor) {
    const alto = sensor.sensor.nivelCm >= LIMIAR_ALAGAMENTO_CM;
    pistas.push({
      texto: `${sensor.sensor.nome} a ${formatarDistancia(sensor.distanciaM)} mede ${Math.round(sensor.sensor.nivelCm)} cm de água`,
      reforca: alto,
    });
  } else {
    pistas.push({ texto: 'Nenhum sensor a menos de 1 km', reforca: false });
  }

  const momento = Date.parse(relato.ocorridoEm);
  const parecidos = relatos.filter(
    (r) =>
      r.id !== relato.id &&
      Math.abs(Date.parse(r.ocorridoEm) - momento) <= JANELA_RELATOS_MS &&
      distanciaMetros(relato.local, r.local) <= RAIO_CONTEXTO_M,
  );
  pistas.push(
    parecidos.length > 0
      ? { texto: `${parecidos.length} outro(s) relato(s) perto, na mesma hora`, reforca: true }
      : { texto: 'Nenhum outro relato perto, na mesma hora', reforca: false },
  );

  return pistas;
}
