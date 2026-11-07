import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';

import { Aviso } from '@/componentes/Aviso';
import { Botao } from '@/componentes/Botao';
import { CartaoOcorrencia } from '@/componentes/CartaoOcorrencia';
import { Chips } from '@/componentes/Chips';
import { Mapa } from '@/componentes/Mapa';
import { SeloEstado, SeloFaixa } from '@/componentes/SeloEstado';
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

  return (
    <FlatList
      data={lista}
      keyExtractor={(item) => item.ocorrencia.id}
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
            {primeiroNome ? `Olá, ${primeiroNome}` : 'Alagamentos perto de você'}
          </Text>
          {simulada && (
            <Aviso texto="Dados de demonstração: as ocorrências, sensores e riscos são simulados em bairros reais de São Paulo." />
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

          <View style={estilos.linhaCentro}>
            <Text style={estilos.centro} accessibilityRole="text">
              Perto de: <Text style={estilos.centroNome}>{nomeCentro}</Text>
            </Text>
            <Botao
              rotulo={trocandoLocal ? 'Fechar' : 'Trocar local'}
              variante="link"
              onPress={() => setTrocandoLocal((v) => !v)}
            />
          </View>
          {trocandoLocal && (
            <SeletorLocal
              rotulo="Ver ocorrências perto de"
              valor={escolhido}
              onMudar={(valor) => {
                setEscolhido(valor);
                setTrocandoLocal(false);
              }}
            />
          )}

          <View style={estilos.resumo} accessible>
            <Text style={estilos.resumoNumero}>{ativosPerto}</Text>
            <Text style={estilos.resumoTexto}>
              {ativosPerto === 1 ? 'alagamento ativo' : 'alagamentos ativos'} com os filtros atuais
            </Text>
          </View>
          <Aviso
            tipo="aviso"
            texto="Nenhum ponto no mapa não significa que a rua está segura. Quando faltam dados, o app avisa: sem atualização suficiente."
          />

          <View style={estilos.botoes}>
            <Botao
              rotulo={mostrarMapa ? 'Ver só a lista' : 'Mostrar o mapa'}
              icone={mostrarMapa ? 'format-list-bulleted' : 'map'}
              variante="secundario"
              onPress={() => setMostrarMapa((v) => !v)}
            />
            <Botao
              rotulo={quantidadeFiltros > 0 ? `Filtros (${quantidadeFiltros})` : 'Filtros'}
              icone="filter-variant"
              variante="secundario"
              onPress={() => setMostrarFiltros((v) => !v)}
            />
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

          {mostrarMapa && (
            <Mapa
              centro={centro}
              ocorrencias={lista.map((item) => item.ocorrencia)}
              riscos={riscos}
              locais={locais}
              onSelecionar={(o) => router.push({ pathname: '/ocorrencia/[id]', params: { id: o.id } })}
            />
          )}
          {mostrarMapa && (
            <Text style={estilos.nota}>
              Pinos: vermelho, ativo; laranja, relato comunitário; verde, encerrado; roxo, sem dados recentes. O
              círculo azul é o raio do seu carro. Toque no pino e depois no balão para abrir.
            </Text>
          )}

          <View style={estilos.legenda} accessibilityLabel="Legenda das situações">
            {ESTADOS_LEGENDA.map((estado) => (
              <View
                key={estado}
                accessible
                accessibilityLabel={`${INFO_ESTADO[estado].rotulo}: ${INFO_ESTADO[estado].explicacao}`}
              >
                <SeloEstado estado={estado} />
              </View>
            ))}
          </View>

          {riscosPerto.length > 0 && (
            <View style={estilosComuns.cartao}>
              <Text style={estilosComuns.tituloSecao} accessibilityRole="header">
                Ruas com risco estimado
              </Text>
              {riscosPerto.map((risco) => (
                <View key={risco.id} style={estilos.risco} accessible>
                  <SeloFaixa faixa={risco.faixa} />
                  <Text style={estilos.riscoTexto}>
                    {risco.bairro}: {risco.motivo}
                  </Text>
                </View>
              ))}
              <Text style={estilos.nota}>{AVISO_INCERTEZA}</Text>
            </View>
          )}

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
        <CartaoOcorrencia
          ocorrencia={item.ocorrencia}
          distanciaM={item.distanciaM}
          onPress={() => router.push({ pathname: '/ocorrencia/[id]', params: { id: item.ocorrencia.id } })}
        />
      )}
      ItemSeparatorComponent={() => <View style={estilosComuns.separador} />}
    />
  );
}
