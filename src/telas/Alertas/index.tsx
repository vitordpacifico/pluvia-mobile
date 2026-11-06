import { useIsFocused } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';

import { Aviso } from '@/componentes/Aviso';
import { Botao } from '@/componentes/Botao';
import { SeloRisco } from '@/componentes/SeloRisco';
import { useAlertas } from '@/contexto/AlertasContext';
import { useAutenticacao } from '@/contexto/AutenticacaoContext';
import { INFO_RISCO, tempoAteReceber } from '@/dominio/risco';
import type { AlertaRegistrado } from '@/dominio/tipos';
import { estilosComuns } from '@/estilos/comuns';
import { confirmarSeguranca, listarAlertas } from '@/servicos/armazenamento/alertasServico';
import { fonteDeDados } from '@/servicos/dados/fonte';
import { formatarCm, formatarDataHora, formatarDuracao } from '@/utilitarios/formato';

import { estilos } from './estilos';

export default function TelaAlertas() {
  const { usuario } = useAutenticacao();
  const { versao, avisarMudanca } = useAlertas();
  const [alertas, setAlertas] = useState<AlertaRegistrado[]>([]);
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const usuarioId = usuario?.id;

  const carregar = useCallback(() => {
    if (!usuarioId) return;
    listarAlertas(usuarioId)
      .then(setAlertas)
      .catch(() => setErro('Não foi possível carregar os alertas.'));
  }, [usuarioId]);

  // Recarrega ao abrir a aba e sempre que um alerta e criado ou confirmado.
  const focada = useIsFocused();
  useEffect(() => {
    if (focada) carregar();
  }, [focada, versao, carregar]);

  const confirmar = useCallback(
    async (alerta: AlertaRegistrado) => {
      if (!usuarioId) return;
      setConfirmando(alerta.id);
      const agora = new Date().toISOString();
      try {
        await confirmarSeguranca(usuarioId, alerta.id, agora);
      } catch {
        setErro('Não foi possível salvar a confirmação. Tente novamente.');
        setConfirmando(null);
        return;
      }
      try {
        await fonteDeDados.registrarConfirmacao(alerta.pontoId, agora);
        setErro(null);
      } catch {
        setErro('A confirmação foi salva no celular, mas não chegou ao servidor.');
      } finally {
        setConfirmando(null);
        avisarMudanca();
      }
    },
    [usuarioId, avisarMudanca],
  );

  const media =
    alertas.length > 0
      ? alertas.reduce((soma, alerta) => soma + tempoAteReceber(alerta), 0) / alertas.length
      : null;

  return (
    <FlatList
      data={alertas}
      keyExtractor={(alerta) => alerta.id}
      contentContainerStyle={estilos.lista}
      ListHeaderComponent={
        <View style={estilos.cabecalho}>
          <Text style={estilosComuns.titulo} accessibilityRole="header">
            Alertas recebidos
          </Text>
          {media !== null && (
            <Aviso
              texto={`Tempo médio entre a detecção pelo sensor e o alerta chegar a você: ${formatarDuracao(media)}.`}
            />
          )}
          {erro && <Aviso tipo="erro" texto={erro} />}
        </View>
      }
      ListEmptyComponent={
        <Text style={estilos.vazio}>
          Nenhum alerta ainda. Ative os alertas de um ponto na aba Pontos para ser avisado quando o
          risco aumentar.
        </Text>
      }
      ItemSeparatorComponent={() => <View style={estilosComuns.separador} />}
      renderItem={({ item }) => (
        <View style={estilosComuns.cartao}>
          <View accessible style={estilos.cartaoTexto}>
            <SeloRisco risco={item.risco} />
            <Text style={estilos.ponto}>{item.pontoNome}</Text>
            <Text style={estilos.detalhe}>
              Água em {formatarCm(item.nivelCm)}. Recebido em {formatarDataHora(item.recebidoEm)}.
            </Text>
            <Text style={estilos.detalhe}>
              Chegou {formatarDuracao(tempoAteReceber(item))} depois da detecção pelo sensor.
            </Text>
            <Text style={estilos.orientacao}>{INFO_RISCO[item.risco].orientacao}</Text>
          </View>
          {item.confirmadoEm ? (
            <Text style={estilos.confirmado}>
              Você confirmou que está em segurança em {formatarDataHora(item.confirmadoEm)}.
            </Text>
          ) : (
            <Botao
              rotulo="Estou em segurança"
              icone="shield-check"
              dica="Registra que você está em um local seguro"
              ocupado={confirmando === item.id}
              onPress={() => confirmar(item)}
            />
          )}
        </View>
      )}
    />
  );
}
