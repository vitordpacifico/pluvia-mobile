import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router, useIsFocused } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

import { Aviso as Mensagem } from '@/componentes/Aviso';
import { Botao } from '@/componentes/Botao';
import { useAutenticacao } from '@/contexto/AutenticacaoContext';
import { useAvisos } from '@/contexto/AvisosContext';
import { mediaTempoAteReceber, tempoAteReceber } from '@/dominio/avisos';
import type { Aviso, TipoAviso } from '@/dominio/local';
import { estilosComuns } from '@/estilos/comuns';
import { cores } from '@/estilos/tema';
import { listarAvisos, marcarTodosComoLidos } from '@/servicos/armazenamento/avisosServico';
import { formatarDataHora, formatarDuracao } from '@/utilitarios/formato';

import { estilos } from './estilos';

const ICONE: Record<TipoAviso, 'water-alert' | 'check-circle-outline' | 'weather-pouring'> = {
  NOVO: 'water-alert',
  ENCERRADO: 'check-circle-outline',
  RISCO: 'weather-pouring',
};

const ROTULO: Record<TipoAviso, string> = {
  NOVO: 'Novo alagamento',
  ENCERRADO: 'Encerramento',
  RISCO: 'Risco estimado',
};

export default function TelaAvisos() {
  const { usuario } = useAutenticacao();
  const { versao, avisarMudanca } = useAvisos();
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const usuarioId = usuario?.id;

  const carregar = useCallback(() => {
    if (!usuarioId) return;
    listarAvisos(usuarioId)
      .then(setAvisos)
      .catch(() => setErro('Não foi possível carregar os avisos.'));
  }, [usuarioId]);

  const focada = useIsFocused();
  useEffect(() => {
    if (focada) carregar();
  }, [focada, versao, carregar]);

  async function marcarLidos() {
    if (!usuarioId) return;
    await marcarTodosComoLidos(usuarioId, new Date().toISOString());
    avisarMudanca();
  }

  const media = mediaTempoAteReceber(avisos);
  const naoLidos = avisos.filter((a) => a.lidoEm === null).length;

  return (
    <FlatList
      data={avisos}
      keyExtractor={(aviso) => aviso.id}
      contentContainerStyle={estilos.lista}
      ListHeaderComponent={
        <View style={estilos.cabecalho}>
          <Text style={estilosComuns.titulo} accessibilityRole="header">
            Avisos
          </Text>
          {media !== null && (
            <Mensagem
              texto={`Rapidez dos avisos: em média ${formatarDuracao(media)} entre o registro do alagamento e o aviso chegar a você.`}
            />
          )}
          {erro && <Mensagem tipo="erro" texto={erro} />}
          {naoLidos > 0 && <Botao rotulo={`Marcar ${naoLidos} como lido(s)`} variante="secundario" onPress={marcarLidos} />}
          <Botao
            rotulo="Áreas e tipos de aviso"
            icone="tune"
            variante="link"
            onPress={() => router.push('/areas')}
          />
        </View>
      }
      ListEmptyComponent={
        <Text style={estilos.vazio}>
          Nenhum aviso ainda. Salve o local do carro ou um lugar favorito para ser avisado de alagamentos por perto.
        </Text>
      }
      ItemSeparatorComponent={() => <View style={estilosComuns.separador} />}
      renderItem={({ item }) => (
        <Pressable
          disabled={!item.ocorrenciaId}
          onPress={() =>
            item.ocorrenciaId && router.push({ pathname: '/ocorrencia/[id]', params: { id: item.ocorrenciaId } })
          }
          accessibilityRole={item.ocorrenciaId ? 'button' : 'text'}
          accessibilityLabel={`${item.lidoEm ? '' : 'Não lido. '}${ROTULO[item.tipo]}. ${item.titulo}. ${item.texto}`}
          style={[estilosComuns.cartao, !item.lidoEm && estilos.naoLido]}
        >
          <View style={estilos.topo}>
            <MaterialCommunityIcons name={ICONE[item.tipo]} size={22} color={cores.primaria} />
            <Text style={estilos.tipo}>{ROTULO[item.tipo]}</Text>
          </View>
          <Text style={estilos.titulo}>{item.titulo}</Text>
          <Text style={estilos.texto}>{item.texto}</Text>
          <Text style={estilos.detalhe}>
            Recebido em {formatarDataHora(item.recebidoEm)}
            {item.tipo === 'NOVO' ? `, ${formatarDuracao(tempoAteReceber(item))} depois do registro` : ''}
          </Text>
        </Pressable>
      )}
    />
  );
}
