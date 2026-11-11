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
              style={[estilos.contador, { backgroundColor: info.corFundo }]}
              accessible
              accessibilityLabel={`${quantidade} ocorrência(s): ${info.rotulo}`}
            >
              <Text style={[estilos.numero, { color: info.corTexto }]}>{quantidade}</Text>
              <Text style={[estilos.rotuloContador, { color: info.corTexto }]}>{info.rotulo}</Text>
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
            <Text style={estilos.nome}>{sensor.nome}</Text>
            <Text style={estilos.detalhe}>
              {sensor.referencia} · {sensor.bairro}
            </Text>
            {semSinal ? (
              <Aviso
                tipo="aviso"
                texto={`Sem leituras ${formatarHaQuanto(sensor.atualizadoEm)}. Falta de dados não é sinal de segurança.`}
              />
            ) : (
              <>
                <Text style={estilos.nivel}>Água: {formatarCm(sensor.nivelCm)}</Text>
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
