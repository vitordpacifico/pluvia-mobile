import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';

import { Aviso } from '@/componentes/Aviso';
import { Botao } from '@/componentes/Botao';
import { SeloRisco } from '@/componentes/SeloRisco';
import { useDados } from '@/contexto/DadosContext';
import {
  contarPorNivel,
  dadosDesatualizados,
  EXPLICACAO_REGRA_DE_CONFIRMACAO,
  gravidade,
  INFO_RISCO,
  ORDEM_RISCO,
} from '@/dominio/risco';
import { estilosComuns } from '@/estilos/comuns';
import { PONTOS_SIMULADOS, reiniciarSimulacao, simularChuvaForte } from '@/servicos/dados/simulacao';
import { formatarCm, formatarDataHora } from '@/utilitarios/formato';

import { estilos } from './estilos';

/** Visao geral para o agente da Defesa Civil: todos os pontos de uma vez. */
export default function TelaPainel() {
  const { pontos, simulada, recarregar, erro } = useDados();
  const [mensagem, setMensagem] = useState<string | null>(null);

  const contagem = contarPorNivel(pontos);
  const emRisco = pontos
    .filter((p) => p.risco !== 'NORMAL')
    .sort((a, b) => gravidade(b.risco) - gravidade(a.risco));
  const semSinal = pontos.filter((p) => dadosDesatualizados(p));

  function abrir(id: string) {
    router.push({ pathname: '/ponto/[id]', params: { id } });
  }

  async function chuva(pontoId: string, nome: string) {
    simularChuvaForte(pontoId);
    setMensagem(`Chuva forte simulada em ${nome}. A água começa a subir em cerca de 30 segundos.`);
    await recarregar();
  }

  function reiniciar() {
    Alert.alert('Reiniciar simulação', 'Todas as chuvas simuladas param e recomeçam do zero.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Reiniciar',
        style: 'destructive',
        onPress: async () => {
          reiniciarSimulacao();
          setMensagem('Simulação reiniciada.');
          await recarregar();
        },
      },
    ]);
  }

  return (
    <ScrollView contentContainerStyle={estilosComuns.conteudo}>
      <Text style={estilosComuns.titulo} accessibilityRole="header">
        Painel da Defesa Civil
      </Text>
      {erro && <Aviso tipo="erro" texto={`Sem conexão com o servidor. ${erro}`} />}

      <View style={estilosComuns.cartao}>
        <Text style={estilosComuns.tituloSecao} accessibilityRole="header">
          Pontos por nível
        </Text>
        <View style={estilos.grade}>
          {ORDEM_RISCO.map((risco) => {
            const info = INFO_RISCO[risco];
            return (
              <View
                key={risco}
                style={[estilos.contador, { backgroundColor: info.corFundo }]}
                accessible
                accessibilityLabel={`${contagem[risco]} pontos em ${info.rotulo}`}
              >
                <Text style={[estilos.numero, { color: info.corTexto }]}>{contagem[risco]}</Text>
                <SeloRisco risco={risco} />
              </View>
            );
          })}
        </View>
      </View>

      <View style={estilosComuns.cartao}>
        <Text style={estilosComuns.tituloSecao} accessibilityRole="header">
          Pontos que exigem atenção
        </Text>
        <Text style={estilosComuns.legenda}>{EXPLICACAO_REGRA_DE_CONFIRMACAO}</Text>
        {emRisco.length === 0 ? (
          <Text style={estilosComuns.legenda}>Nenhum ponto acima do nível normal.</Text>
        ) : (
          emRisco.map((ponto) => (
            <View key={ponto.id} style={estilos.item}>
              <SeloRisco risco={ponto.risco} />
              <Text style={estilos.textoItem}>
                {ponto.nome}: {formatarCm(ponto.nivelAtualCm)}
              </Text>
              <Botao rotulo="Abrir" variante="link" onPress={() => abrir(ponto.id)} />
            </View>
          ))
        )}
      </View>

      <View style={estilosComuns.cartao}>
        <Text style={estilosComuns.tituloSecao} accessibilityRole="header">
          Sensores sem sinal
        </Text>
        {semSinal.length === 0 ? (
          <Text style={estilosComuns.legenda}>Todos os sensores enviaram leituras recentes.</Text>
        ) : (
          semSinal.map((ponto) => (
            <Aviso
              key={ponto.id}
              tipo="aviso"
              texto={`${ponto.nome}: última leitura em ${formatarDataHora(ponto.atualizadoEm)}. Verifique o dispositivo.`}
            />
          ))
        )}
      </View>

      {simulada && (
        <View style={estilosComuns.cartao}>
          <Text style={estilosComuns.tituloSecao} accessibilityRole="header">
            Simulação IoT
          </Text>
          <Text style={estilosComuns.legenda}>
            Imita o sensor de um ponto registrando uma chuva forte. Use para demonstrar os alertas
            enquanto o ESP32 não está ligado ao app.
          </Text>
          {mensagem && <Aviso tipo="sucesso" texto={mensagem} />}
          <View style={estilos.acaoSimulacao}>
            {PONTOS_SIMULADOS.filter((p) => !p.semSinalHaMs).map((ponto) => (
              <Botao
                key={ponto.id}
                rotulo={`Simular chuva em ${ponto.nome}`}
                icone="weather-pouring"
                variante="secundario"
                onPress={() => chuva(ponto.id, ponto.nome)}
              />
            ))}
            <Botao rotulo="Reiniciar simulação" icone="refresh" variante="perigo" onPress={reiniciar} />
          </View>
        </View>
      )}
    </ScrollView>
  );
}
