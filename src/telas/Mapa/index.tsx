import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import { Aviso } from '@/componentes/Aviso';
import { Botao } from '@/componentes/Botao';
import { CartaoOcorrencia } from '@/componentes/CartaoOcorrencia';
import { Chips } from '@/componentes/Chips';
import { Mapa } from '@/componentes/Mapa';
import { COR_PINO } from '@/componentes/Mapa/estilos';
import { SeloFaixa } from '@/componentes/SeloEstado';
import { SeletorLocal, type LocalEscolhido } from '@/componentes/SeletorLocal';
import { useAutenticacao } from '@/contexto/AutenticacaoContext';
import { useDados } from '@/contexto/DadosContext';
import { useLocais } from '@/contexto/LocaisContext';
import {
  FILTROS_PADRAO,
  filtrarOcorrencias,
  filtrosAtivos,
  type FiltroFonte,
  type FiltroPeriodo,
  type Filtros,
  type FiltroStatus,
} from '@/dominio/filtros';
import { BAIRROS, distanciaMetros, type RaioMonitoramento } from '@/dominio/geo';
import { AVISO_SEGURANCA, INFO_ESTADO, type EstadoExibido } from '@/dominio/ocorrencia';
import { AVISO_INCERTEZA, pesoFaixa } from '@/dominio/riscoEstimado';
import { ehCidadao } from '@/dominio/usuario';
import { estilosComuns } from '@/estilos/comuns';
import { cores } from '@/estilos/tema';
import { formatarHora } from '@/utilitarios/formato';

import { estilos } from './estilos';

const OPCOES_STATUS = [
  { valor: 'TODOS', rotulo: 'Todos' },
  { valor: 'ATIVOS', rotulo: 'Ativos' },
  { valor: 'ENCERRADOS', rotulo: 'Encerrados' },
] as const satisfies readonly { valor: FiltroStatus; rotulo: string }[];

const OPCOES_FONTE = [
  { valor: 'TODAS', rotulo: 'Todas' },
  { valor: 'OFICIAL', rotulo: 'Oficial' },
  { valor: 'SENSOR', rotulo: 'Sensor' },
  { valor: 'COMUNIDADE', rotulo: 'Comunidade' },
] as const satisfies readonly { valor: FiltroFonte; rotulo: string }[];

const OPCOES_PERIODO = [
  { valor: '1', rotulo: '1 hora' },
  { valor: '6', rotulo: '6 horas' },
  { valor: '24', rotulo: '24 horas' },
  { valor: '72', rotulo: '3 dias' },
] as const satisfies readonly { valor: FiltroPeriodo; rotulo: string }[];

const OPCOES_RAIO = [
  { valor: 'todos', rotulo: 'Qualquer distância' },
  { valor: '500', rotulo: '500 m' },
  { valor: '1000', rotulo: '1 km' },
  { valor: '2000', rotulo: '2 km' },
] as const;

type ValorRaio = (typeof OPCOES_RAIO)[number]['valor'];

const ESTADOS_LEGENDA: EstadoExibido[] = ['ATIVO', 'COMUNITARIO', 'ENCERRADO', 'SEM_DADOS'];

const ROTULO_CURTO: Record<EstadoExibido, string> = {
  ATIVO: 'Ativo',
  COMUNITARIO: 'Relato',
  ENCERRADO: 'Encerrado',
  SEM_DADOS: 'Sem dados',
};

export default function TelaMapa() {
  const { usuario } = useAutenticacao();
  const { ocorrencias, riscos, carregando, erro, origem, obtidosEm, simulada, recarregar } = useDados();
  const { locais, carro } = useLocais();
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_PADRAO);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [mostrarMapa, setMostrarMapa] = useState(true);
  const [escolhido, setEscolhido] = useState<LocalEscolhido | null>(null);
  const [trocandoLocal, setTrocandoLocal] = useState(false);
  const [atualizando, setAtualizando] = useState(false);

  const centro = escolhido?.local ?? carro?.local ?? BAIRROS[0].centro;
  const nomeCentro = escolhido?.bairro ?? (carro ? `${carro.nome} (${carro.bairro})` : BAIRROS[0].nome);

  const lista = useMemo(
    () => filtrarOcorrencias(ocorrencias, filtros, centro),
    [ocorrencias, filtros, centro],
  );
  const riscosPerto = useMemo(
    () =>
      riscos
        .filter((r) => r.faixa !== 'BAIXO' && distanciaMetros(centro, r.centro) <= r.raioM + 2000)
        .sort((a, b) => pesoFaixa(b.faixa) - pesoFaixa(a.faixa)),
    [riscos, centro],
  );

  const atualizarManualmente = useCallback(async () => {
    setAtualizando(true);
    await recarregar();
    setAtualizando(false);
  }, [recarregar]);

  const mudar = <K extends keyof Filtros>(chave: K, valor: Filtros[K]) =>
    setFiltros((atual) => ({ ...atual, [chave]: valor }));

  if (carregando) {
    return (
      <View style={estilosComuns.centro} accessible accessibilityLabel="Carregando ocorrências">
        <ActivityIndicator size="large" color={cores.primaria} />
        <Text style={estilos.subtitulo}>Carregando ocorrências…</Text>
      </View>
    );
  }

  const horario = obtidosEm ? formatarHora(obtidosEm.toISOString()) : null;
  const semConexao = erro !== null;
  const quantidadeFiltros = filtrosAtivos(filtros);
  const ativosPerto = lista.filter((item) => item.ocorrencia.status === 'ATIVO').length;
  const primeiroNome = usuario?.nome.split(' ')[0];

  const rotuloLocal = escolhido ? 'Ver ocorrências perto de' : 'Trocar o local do mapa';

  return (
    <FlatList
      data={lista}
      keyExtractor={(item) => item.ocorrencia.id}
      contentContainerStyle={estilos.lista}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
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
          <View style={estilos.faixa}>
            <Text style={estilos.ola} accessibilityRole="header">
              {primeiroNome ? `Olá, ${primeiroNome}` : 'Alagamentos perto de você'}
            </Text>
            <Pressable
              onPress={() => setTrocandoLocal((v) => !v)}
              accessibilityRole="button"
              accessibilityLabel={trocandoLocal ? 'Fechar' : 'Trocar local'}
              accessibilityHint={`Agora mostrando perto de ${nomeCentro}`}
              style={estilos.local}
            >
              <MaterialCommunityIcons name="map-marker" size={18} color={cores.destaque} />
              <Text style={estilos.localTexto} numberOfLines={1}>
                Perto de <Text style={estilos.localNome}>{nomeCentro}</Text>
              </Text>
              <Text style={estilos.localAcao}>{trocandoLocal ? 'Fechar' : 'Trocar'}</Text>
            </Pressable>
            {simulada && (
              <View
                style={estilos.demo}
                accessible
                accessibilityLabel="Dados de demonstração: as ocorrências, sensores e riscos são simulados em bairros reais de São Paulo."
              >
                <MaterialCommunityIcons name="flask-outline" size={14} color={cores.textoSobrePrimaria} />
                <Text style={estilos.demoTexto}>Dados de demonstração em bairros reais de SP</Text>
              </View>
            )}
          </View>

          <View style={estilos.secoes}>
            {trocandoLocal && (
              <View style={estilosComuns.cartao}>
                <SeletorLocal
                  rotulo={rotuloLocal}
                  valor={escolhido}
                  onMudar={(valor) => {
                    setEscolhido(valor);
                    setTrocandoLocal(false);
                  }}
                />
              </View>
            )}

            {semConexao && (
              <Aviso
                tipo="erro"
                texto={
                  ocorrencias.length > 0 && horario
                    ? `Sem atualização suficiente. Mostrando os dados de ${horario}, que podem estar desatualizados.`
                    : `Sem conexão com o servidor. ${erro} Puxe a lista para baixo para tentar de novo.`
                }
              />
            )}

            <View style={estilos.cartaoMapa}>
              {mostrarMapa && (
                <Mapa
                  centro={centro}
                  ocorrencias={lista.map((item) => item.ocorrencia)}
                  riscos={riscos}
                  locais={locais}
                  onSelecionar={(o) => router.push({ pathname: '/ocorrencia/[id]', params: { id: o.id } })}
                />
              )}
              <View style={estilos.resumo} accessible>
                <View style={[estilos.resumoIcone, ativosPerto > 0 && estilos.resumoIconeAlerta]}>
                  <MaterialCommunityIcons
                    name={ativosPerto > 0 ? 'water-alert' : 'water-check'}
                    size={22}
                    color={ativosPerto > 0 ? cores.perigo : cores.sucesso}
                  />
                </View>
                <View style={estilos.resumoCorpo}>
                  <Text style={estilos.resumoNumero}>
                    {ativosPerto} {ativosPerto === 1 ? 'alagamento ativo' : 'alagamentos ativos'}
                  </Text>
                  <Text style={estilos.resumoTexto}>com os filtros atuais</Text>
                </View>
              </View>
              {mostrarMapa && (
                <View style={estilos.legenda} accessibilityLabel="Legenda das situações">
                  {ESTADOS_LEGENDA.map((estado) => (
                    <View
                      key={estado}
                      style={estilos.legendaItem}
                      accessible
                      accessibilityLabel={`${INFO_ESTADO[estado].rotulo}: ${INFO_ESTADO[estado].explicacao}`}
                    >
                      <View style={[estilos.ponto, { backgroundColor: COR_PINO[estado] }]} />
                      <Text style={estilos.legendaTexto}>{ROTULO_CURTO[estado]}</Text>
                    </View>
                  ))}
                  <View style={estilos.legendaItem}>
                    <View style={[estilos.ponto, estilos.pontoCarro]} />
                    <Text style={estilos.legendaTexto}>Raio do carro</Text>
                  </View>
                </View>
              )}
            </View>

            <View style={estilos.botoes}>
              <Pressable
                onPress={() => setMostrarMapa((v) => !v)}
                accessibilityRole="button"
                accessibilityLabel={mostrarMapa ? 'Ver só a lista' : 'Mostrar o mapa'}
                style={estilos.pilula}
              >
                <MaterialCommunityIcons
                  name={mostrarMapa ? 'format-list-bulleted' : 'map'}
                  size={18}
                  color={cores.primaria}
                />
                <Text style={estilos.pilulaTexto}>{mostrarMapa ? 'Ver só a lista' : 'Mostrar o mapa'}</Text>
              </Pressable>
              <Pressable
                onPress={() => setMostrarFiltros((v) => !v)}
                accessibilityRole="button"
                accessibilityLabel={quantidadeFiltros > 0 ? `Filtros (${quantidadeFiltros})` : 'Filtros'}
                style={[estilos.pilula, quantidadeFiltros > 0 && estilos.pilulaAtiva]}
              >
                <MaterialCommunityIcons
                  name="filter-variant"
                  size={18}
                  color={quantidadeFiltros > 0 ? cores.textoSobrePrimaria : cores.primaria}
                />
                <Text style={[estilos.pilulaTexto, quantidadeFiltros > 0 && estilos.pilulaTextoAtivo]}>
                  {quantidadeFiltros > 0 ? `Filtros (${quantidadeFiltros})` : 'Filtros'}
                </Text>
              </Pressable>
            </View>

            {mostrarFiltros && (
              <View style={estilosComuns.cartao}>
                <Chips rotulo="Situação" opcoes={OPCOES_STATUS} valor={filtros.status} onMudar={(v) => mudar('status', v)} />
                <Chips rotulo="Fonte" opcoes={OPCOES_FONTE} valor={filtros.fonte} onMudar={(v) => mudar('fonte', v)} />
                <Chips
                  rotulo="Encerradas nas últimas"
                  opcoes={OPCOES_PERIODO}
                  valor={filtros.periodoH}
                  onMudar={(v) => mudar('periodoH', v)}
                />
                <Chips<ValorRaio>
                  rotulo="Distância"
                  opcoes={OPCOES_RAIO}
                  valor={filtros.raioM === null ? 'todos' : (String(filtros.raioM) as ValorRaio)}
                  onMudar={(v) => mudar('raioM', v === 'todos' ? null : (Number(v) as RaioMonitoramento))}
                />
                <Botao rotulo="Limpar filtros" variante="link" onPress={() => setFiltros(FILTROS_PADRAO)} />
              </View>
            )}

            <View style={estilos.nota}>
              <MaterialCommunityIcons name="alert-circle-outline" size={16} color={cores.avisoTexto} />
              <Text style={estilos.notaTexto}>
                Nenhum ponto no mapa não significa que a rua está segura. Quando faltam dados, o app avisa: sem
                atualização suficiente.
              </Text>
            </View>

            {riscosPerto.length > 0 && (
              <View style={estilos.blocoRisco}>
                <Text style={estilosComuns.tituloSecao} accessibilityRole="header">
                  Ruas com risco estimado
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.riscos}>
                  {riscosPerto.map((risco) => (
                    <View key={risco.id} style={estilos.risco} accessible>
                      <SeloFaixa faixa={risco.faixa} />
                      <Text style={estilos.riscoBairro}>{risco.bairro}</Text>
                      <Text style={estilos.riscoTexto}>{risco.motivo}</Text>
                    </View>
                  ))}
                </ScrollView>
                <Text style={estilos.legendaTexto}>{AVISO_INCERTEZA}</Text>
              </View>
            )}

            <View style={estilos.tituloLista}>
              <Text style={estilosComuns.tituloSecao} accessibilityRole="header">
                Ocorrências ({lista.length})
              </Text>
              {!semConexao && horario && (
                <Text style={estilos.consulta}>
                  {origem === 'copia-local' ? 'Dados salvos às ' : 'Atualizado às '}
                  {horario}
                </Text>
              )}
            </View>
          </View>
        </View>
      }
      ListEmptyComponent={
        <Text style={estilos.vazio}>
          Nenhuma ocorrência com estes filtros. Isso não garante que a região esteja segura.
        </Text>
      }
      ListFooterComponent={
        <View style={estilos.rodape}>
          {ehCidadao(usuario) && (
            <Botao
              rotulo="Vi um alagamento: enviar relato"
              icone="camera"
              onPress={() => router.navigate('/relatar')}
            />
          )}
          <Text style={estilosComuns.rodape}>{AVISO_SEGURANCA}</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={estilos.item}>
          <CartaoOcorrencia
            ocorrencia={item.ocorrencia}
            distanciaM={item.distanciaM}
            onPress={() => router.push({ pathname: '/ocorrencia/[id]', params: { id: item.ocorrencia.id } })}
          />
        </View>
      )}
      ItemSeparatorComponent={() => <View style={estilosComuns.separador} />}
    />
  );
}
