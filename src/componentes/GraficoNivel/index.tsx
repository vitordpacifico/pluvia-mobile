import { Text, View } from 'react-native';

import { classificarNivel, INFO_RISCO } from '@/dominio/risco';
import type { Leitura, LimitesRisco } from '@/dominio/tipos';
import { formatarCm, formatarHora } from '@/utilitarios/formato';

import { ALTURA_GRAFICO, estilos } from './estilos';

interface Props {
  leituras: Leitura[];
  limites: LimitesRisco;
}

const COR_NORMAL = '#2E7D32';

/**
 * Barras com o nivel de cada leitura e linhas nos limites de risco.
 * Para o leitor de tela, o grafico vira um resumo em texto.
 */
export function GraficoNivel({ leituras, limites }: Props) {
  if (leituras.length === 0) {
    return <Text style={estilos.vazio}>Ainda não há leituras deste ponto.</Text>;
  }

  const maximo = Math.max(limites.evacuacaoCm * 1.2, ...leituras.map((l) => l.nivelCm));
  const altura = (cm: number) => (cm / maximo) * ALTURA_GRAFICO;
  const primeira = leituras[0];
  const ultima = leituras[leituras.length - 1];
  const resumo =
    `Gráfico das últimas ${leituras.length} leituras, de ${formatarHora(primeira.medidoEm)} ` +
    `a ${formatarHora(ultima.medidoEm)}. O nível foi de ${formatarCm(primeira.nivelCm)} ` +
    `para ${formatarCm(ultima.nivelCm)}.`;

  const linhas = [
    { cm: limites.atencaoCm, risco: 'ATENCAO' as const },
    { cm: limites.alertaCm, risco: 'ALERTA' as const },
    { cm: limites.evacuacaoCm, risco: 'EVACUACAO' as const },
  ];

  return (
    <View accessible accessibilityRole="image" accessibilityLabel={resumo}>
      <View style={estilos.area} importantForAccessibility="no-hide-descendants">
        <View style={estilos.barras}>
          {leituras.map((leitura) => {
            const risco = classificarNivel(leitura.nivelCm, limites);
            const info = INFO_RISCO[risco];
            const cor =
              risco === 'NORMAL' ? COR_NORMAL : risco === 'EVACUACAO' ? info.corFundo : info.corTexto;
            return (
              <View
                key={leitura.medidoEm}
                style={[
                  estilos.barra,
                  { height: Math.max(2, altura(leitura.nivelCm)), backgroundColor: cor },
                ]}
              />
            );
          })}
        </View>
        {/* As linhas vem depois das barras para ficarem por cima e o rotulo continuar legivel. */}
        {linhas.map((linha) => (
          <View key={linha.risco} style={[estilos.linha, { bottom: altura(linha.cm) }]}>
            <Text style={estilos.rotuloLinha}>
              {INFO_RISCO[linha.risco].rotulo} {linha.cm} cm
            </Text>
          </View>
        ))}
      </View>
      <View style={estilos.eixo} importantForAccessibility="no-hide-descendants">
        <Text style={estilos.textoEixo}>{formatarHora(primeira.medidoEm)}</Text>
        <Text style={estilos.textoEixo}>{formatarHora(ultima.medidoEm)}</Text>
      </View>
    </View>
  );
}
