import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';

import { Aviso } from '@/componentes/Aviso';
import { CartaoPonto } from '@/componentes/CartaoPonto';
import { useAutenticacao } from '@/contexto/AutenticacaoContext';
import { useDados } from '@/contexto/DadosContext';
import { gravidade } from '@/dominio/risco';
import { ehCidadao } from '@/dominio/usuario';
import { estilosComuns } from '@/estilos/comuns';
import { cores } from '@/estilos/tema';
import { listarPontosSeguidos } from '@/servicos/armazenamento/pontosSeguidosServico';
import { formatarHora } from '@/utilitarios/formato';

import { estilos } from './estilos';

export default function TelaPontos() {
  const { usuario } = useAutenticacao();
  const { pontos, carregando, erro, origem, obtidosEm, simulada, recarregar } = useDados();
  const [seguidos, setSeguidos] = useState<Set<string>>(new Set());
  const [atualizando, setAtualizando] = useState(false);
  const cidadao = ehCidadao(usuario);

  useFocusEffect(
    useCallback(() => {
      if (!usuario || !cidadao) return;
      listarPontosSeguidos(usuario.id)
        .then((lista) => setSeguidos(new Set(lista.map((p) => p.pontoId))))
        .catch((e) => console.warn('Falha ao ler os pontos seguidos', e));
    }, [usuario, cidadao]),
  );

  const ordenados = useMemo(
    () => [...pontos].sort((a, b) => gravidade(b.risco) - gravidade(a.risco)),
    [pontos],
  );

  const atualizarManualmente = useCallback(async () => {
    setAtualizando(true);
    await recarregar();
    setAtualizando(false);
  }, [recarregar]);

  if (carregando) {
    return (
      <View style={estilosComuns.centro} accessible accessibilityLabel="Carregando pontos monitorados">
        <ActivityIndicator size="large" color={cores.primaria} />
        <Text style={estilos.subtitulo}>Carregando pontos monitorados…</Text>
      </View>
    );
  }

  const horario = obtidosEm ? formatarHora(obtidosEm.toISOString()) : null;
  const semConexao = erro !== null;
  const primeiroNome = usuario?.nome.split(' ')[0];

  return (
    <FlatList
      data={ordenados}
      keyExtractor={(ponto) => ponto.id}
      contentContainerStyle={estilos.lista}
      refreshControl={
        <RefreshControl
          refreshing={atualizando}
          onRefresh={atualizarManualmente}
          colors={[cores.primaria]}
          tintColor={cores.primaria}
        />
      }
      ListHeaderComponent={
        <View style={estilos.cabecalho}>
          <Text style={estilosComuns.titulo} accessibilityRole="header">
            {primeiroNome ? `Olá, ${primeiroNome}` : 'Pontos monitorados'}
          </Text>
          <Text style={estilos.subtitulo}>
            {cidadao
              ? 'Toque em um ponto para ver o histórico e ativar alertas.'
              : 'Toque em um ponto para ver o histórico e ajustar os limites.'}
          </Text>
          {simulada && (
            <Aviso texto="Dados de demonstração. Os pontos e os níveis da água são simulados." />
          )}
          {semConexao && (
            <Aviso
              tipo="erro"
              texto={
                pontos.length > 0 && horario
                  ? `Sem conexão. Mostrando os dados de ${horario}, que podem estar desatualizados.`
                  : `Sem conexão com o servidor. ${erro} Puxe a lista para baixo para tentar de novo.`
              }
            />
          )}
          {!semConexao && horario && (
            <Text style={estilos.consulta}>
              {origem === 'copia-local' ? 'Dados salvos às ' : 'Atualizado às '}
              {horario}
            </Text>
          )}
        </View>
      }
      ListEmptyComponent={
        semConexao ? undefined : (
          <Text style={estilos.vazio}>Nenhum ponto monitorado encontrado.</Text>
        )
      }
      renderItem={({ item }) => (
        <CartaoPonto
          ponto={item}
          seguido={seguidos.has(item.id)}
          onPress={() => router.push({ pathname: '/ponto/[id]', params: { id: item.id } })}
        />
      )}
      ItemSeparatorComponent={() => <View style={estilosComuns.separador} />}
    />
  );
}
