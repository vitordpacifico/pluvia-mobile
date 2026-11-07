import { Text, View } from 'react-native';

import { LIMIAR_ALAGAMENTO_CM, type Leitura } from '@/dominio/sensor';
import { formatarCm, formatarHora } from '@/utilitarios/formato';

import { ALTURA_GRAFICO, estilos } from './estilos';

interface Props {
  leituras: Leitura[];
}

const COR_NORMAL = '#2E7D32';
const COR_ALAGAMENTO = '#B00020';

export function GraficoNivel({ leituras }: Props) {
  if (leituras.length === 0) {
    return <Text style={estilos.vazio}>Ainda não há leituras deste sensor.</Text>;
  }

  const maximo = Math.max(LIMIAR_ALAGAMENTO_CM * 2.5, ...leituras.map((l) => l.nivelCm));
  const altura = (cm: number) => (cm / maximo) * ALTURA_GRAFICO;
  const primeira = leituras[0];
  const ultima = leituras[leituras.length - 1];
  const resumo =
    `Gráfico das últimas ${leituras.length} leituras, de ${formatarHora(primeira.medidoEm)} ` +
    `a ${formatarHora(ultima.medidoEm)}. O nível foi de ${formatarCm(primeira.nivelCm)} ` +
    `para ${formatarCm(ultima.nivelCm)}. O limite de alagamento é ${LIMIAR_ALAGAMENTO_CM} cm.`;

  return (
    <View accessible accessibilityRole="image" accessibilityLabel={resumo}>
      <View style={estilos.area} importantForAccessibility="no-hide-descendants">
        <View style={estilos.barras}>
          {leituras.map((leitura) => (
            <View
              key={leitura.medidoEm}
              style={[
                estilos.barra,
                {
                  height: Math.max(2, altura(leitura.nivelCm)),
                  backgroundColor: leitura.nivelCm >= LIMIAR_ALAGAMENTO_CM ? COR_ALAGAMENTO : COR_NORMAL,
                },
              ]}
            />
          ))}
        </View>
        <View style={[estilos.linha, { bottom: altura(LIMIAR_ALAGAMENTO_CM) }]}>
          <Text style={estilos.rotuloLinha}>Alagamento {LIMIAR_ALAGAMENTO_CM} cm</Text>
        </View>
      </View>
      <View style={estilos.eixo} importantForAccessibility="no-hide-descendants">
        <Text style={estilos.textoEixo}>{formatarHora(primeira.medidoEm)}</Text>
        <Text style={estilos.textoEixo}>{formatarHora(ultima.medidoEm)}</Text>
      </View>
    </View>
  );
}
