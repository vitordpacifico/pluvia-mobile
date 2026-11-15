import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Aviso } from '@/componentes/Aviso';
import { Botao } from '@/componentes/Botao';
import { CartaoOcorrencia } from '@/componentes/CartaoOcorrencia';
import { GraficoNivel } from '@/componentes/GraficoNivel';
import { useDados } from '@/contexto/DadosContext';
import { estadoExibido, INFO_ESTADO, type EstadoExibido } from '@/dominio/ocorrencia';
import { EXPLICACAO_CONFIRMACAO_SENSOR, LIMIAR_ALAGAMENTO_CM } from '@/dominio/sensor';
import { estilosComuns } from '@/estilos/comuns';
import { cores } from '@/estilos/tema';
import { fonteDeDados } from '@/servicos/dados/fonte';
import { reiniciarSimulacao } from '@/servicos/dados/simulacao';
import { pedirConfirmacao } from '@/utilitarios/confirmacao';
import { formatarCm, formatarHaQuanto } from '@/utilitarios/formato';

import { estilos } from './estilos';

const MINUTOS_SENSOR_SEM_SINAL = 5;
const CONTADORES: EstadoExibido[] = ['ATIVO', 'COMUNITARIO', 'SEM_DADOS', 'ENCERRADO'];

export default function TelaPainel() {
  const { ocorrencias, sensores, simulada, recarregar, erro, obtidosEm } = useDados();
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [emAnalise, setEmAnalise] = useState(0);

  useFocusEffect(
    useCallback(() => {
      fonteDeDados
        .listarRelatos({ status: 'EM_ANALISE' })
        .then((lista) => setEmAnalise(lista.length))
        .catch(() => undefined);
    }, []),
  );

  const agora = obtidosEm?.getTime() ?? 0;
  const contagem = CONTADORES.map((estado) => ({
    estado,
    quantidade: ocorrencias.filter((o) => estadoExibido(o, agora) === estado).length,
  }));
  const ativas = ocorrencias
    .filter((o) => o.status === 'ATIVO')
    .sort((a, b) => Date.parse(b.registradaEm) - Date.parse(a.registradaEm));
  const sensorSemSinal = (atualizadoEm: string) =>
    agora - Date.parse(atualizadoEm) > MINUTOS_SENSOR_SEM_SINAL * 60_000;

  async function chuva(sensorId: string, nome: string) {
    try {
      await fonteDeDados.simularChuva(sensorId);
      setMensagem(`Chuva forte simulada no ${nome}. A água passa de ${LIMIAR_ALAGAMENTO_CM} cm em cerca de 1 minuto.`);
      await recarregar();
    } catch (e) {
      setMensagem(e instanceof Error ? e.message : 'Não foi possível simular a chuva.');
    }
  }

  function reiniciar() {
    pedirConfirmacao(
      'Reiniciar a demonstração?',
      'As chuvas e os encerramentos simulados voltam ao início.',
      'Reiniciar',
      () => {
        reiniciarSimulacao();
        setMensagem('Demonstração reiniciada.');
        recarregar();
      },
    );
  }

  return (
    <ScrollView style={estilosComuns.tela} contentContainerStyle={estilosComuns.conteudo}>
      <Text style={estilosComuns.titulo} accessibilityRole="header">
        Painel da equipe
      </Text>
      {erro && <Aviso tipo="erro" texto={`Sem atualização suficiente: ${erro}`} />}
      {mensagem && <Aviso tipo="sucesso" texto={mensagem} />}

      <View style={estilos.grade}>
        {contagem.map(({ estado, quantidade }) => {
          const info = INFO_ESTADO[estado];
          return (
            <View
              key={estado}
              style={estilos.contador}
              accessible
              accessibilityLabel={`${quantidade} ocorrência(s): ${info.rotulo}`}
            >
              <View style={[estilos.iconeContador, { backgroundColor: info.corFundo }]}>
                <MaterialCommunityIcons name={info.icone} size={20} color={info.corTexto} />
              </View>
              <Text style={estilos.numero}>{quantidade}</Text>
              <Text style={estilos.rotuloContador}>{info.rotulo}</Text>
            </View>
          );
        })}
      </View>

      <View style={estilosComuns.cartao}>
        <Text style={estilosComuns.tituloSecao}>Relatos em análise: {emAnalise}</Text>
        <Botao rotulo="Abrir a moderação" icone="account-check" variante="secundario" onPress={() => router.navigate('/moderacao')} />
      </View>

      <Text style={estilosComuns.tituloSecao} accessibilityRole="header">
        Sensores de nível (ESP32)
      </Text>
      <Text style={estilos.detalhe}>{EXPLICACAO_CONFIRMACAO_SENSOR}</Text>
      {sensores.map((sensor) => {
        const semSinal = sensorSemSinal(sensor.atualizadoEm);
        return (
          <View key={sensor.id} style={estilosComuns.cartao}>
            <View style={estilos.cabecalhoSensor}>
              <View style={[estilos.iconeSensor, semSinal && estilos.iconeSensorSemSinal]}>
                <MaterialCommunityIcons
                  name={semSinal ? 'access-point-off' : 'access-point'}
                  size={22}
                  color={semSinal ? cores.textoSecundario : cores.primaria}
                />
              </View>
              <View style={estilos.identidadeSensor}>
                <Text style={estilos.nome}>{sensor.nome}</Text>
                <Text style={estilos.detalhe}>
                  {sensor.referencia} · {sensor.bairro}
                </Text>
              </View>
            </View>
            {semSinal ? (
              <Aviso
                tipo="aviso"
                texto={`Sem leituras ${formatarHaQuanto(sensor.atualizadoEm)}. Falta de dados não é sinal de segurança.`}
              />
            ) : (
              <>
                <View style={estilos.linhaNivel}>
                  <Text style={estilos.nivel}>Água: {formatarCm(sensor.nivelCm)}</Text>
                  {sensor.nivelCm >= LIMIAR_ALAGAMENTO_CM ? (
                    <View style={[estilos.seloSensor, { backgroundColor: cores.perigo }]}>
                      <MaterialCommunityIcons name="water-alert" size={16} color={cores.textoSobrePrimaria} />
                      <Text style={[estilos.textoSeloSensor, { color: cores.textoSobrePrimaria }]}>
                        Acima de {LIMIAR_ALAGAMENTO_CM} cm
                      </Text>
                    </View>
                  ) : (
                    <View style={[estilos.seloSensor, { backgroundColor: cores.sucessoSuave }]}>
                      <MaterialCommunityIcons name="check-circle-outline" size={16} color={cores.sucesso} />
                      <Text style={[estilos.textoSeloSensor, { color: cores.sucesso }]}>Nível normal</Text>
                    </View>
                  )}
                </View>
                <GraficoNivel leituras={sensor.leituras} />
                {simulada && (
                  <Botao
                    rotulo={`Simular chuva no ${sensor.nome}`}
                    icone="weather-pouring"
                    variante="secundario"
                    onPress={() => chuva(sensor.id, sensor.nome)}
                  />
                )}
              </>
            )}
          </View>
        );
      })}

      <Text style={estilosComuns.tituloSecao} accessibilityRole="header">
        Ocorrências ativas ({ativas.length})
      </Text>
      {ativas.map((ocorrencia) => (
        <CartaoOcorrencia
          key={ocorrencia.id}
          ocorrencia={ocorrencia}
          onPress={() => router.push({ pathname: '/ocorrencia/[id]', params: { id: ocorrencia.id } })}
        />
      ))}

      {simulada && (
        <Botao rotulo="Reiniciar a demonstração" icone="restart" variante="link" onPress={reiniciar} />
      )}
    </ScrollView>
  );
}
