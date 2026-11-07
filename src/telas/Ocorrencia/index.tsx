import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Aviso } from '@/componentes/Aviso';
import { Botao } from '@/componentes/Botao';
import { GraficoNivel } from '@/componentes/GraficoNivel';
import { SeloEstado } from '@/componentes/SeloEstado';
import { useAutenticacao } from '@/contexto/AutenticacaoContext';
import { useDados } from '@/contexto/DadosContext';
import { useLocais } from '@/contexto/LocaisContext';
import { distanciaMetros, formatarDistancia } from '@/dominio/geo';
import { MAXIMO_LOCAIS } from '@/dominio/local';
import {
  AVISO_SEGURANCA,
  estadoExibido,
  INFO_ESTADO,
  ROTULO_FONTE,
  textoEncerramento,
} from '@/dominio/ocorrencia';
import { EXPLICACAO_CONFIRMACAO_SENSOR } from '@/dominio/sensor';
import { ehAgente, ehCidadao } from '@/dominio/usuario';
import { estilosComuns } from '@/estilos/comuns';
import { pedirPermissaoDeNotificacao } from '@/servicos/alertas/notificacoes';
import { fonteDeDados } from '@/servicos/dados/fonte';
import { formatarCm, formatarDataHora, formatarHaQuanto, formatarHoraCurta } from '@/utilitarios/formato';

import { estilos } from './estilos';

export default function TelaOcorrencia() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { usuario } = useAutenticacao();
  const { ocorrencias, sensores, recarregar } = useDados();
  const { carro, favoritos, adicionarFavorito } = useLocais();
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  const ocorrencia = ocorrencias.find((o) => o.id === id);

  if (!ocorrencia) {
    return (
      <View style={estilosComuns.centro}>
        <Text style={estilosComuns.texto}>
          Ocorrência não encontrada. Ela pode ter saído do período mostrado no mapa.
        </Text>
      </View>
    );
  }

  const estado = estadoExibido(ocorrencia);
  const info = INFO_ESTADO[estado];
  const encerramento = textoEncerramento(ocorrencia, formatarHoraCurta);
  const sensor =
    ocorrencia.fonte.tipo === 'SENSOR' ? sensores.find((s) => ocorrencia.id.startsWith(`${s.id}-`)) : undefined;
  const jaAcompanha = favoritos.some((f) => distanciaMetros(f.local, ocorrencia.local) < 50);
  const podeEncerrar = ehAgente(usuario) && ocorrencia.status === 'ATIVO' && ocorrencia.fonte.tipo !== 'SENSOR';

  async function acompanhar() {
    if (!ocorrencia) return;
    setSalvando(true);
    setMensagem(null);
    try {
      await adicionarFavorito({
        nome: ocorrencia.referencia.slice(0, 30),
        bairro: ocorrencia.bairro,
        referencia: ocorrencia.referencia,
        local: ocorrencia.local,
        raioM: 500,
      });
      const permitiu = await pedirPermissaoDeNotificacao().catch(() => false);
      setMensagem({
        tipo: 'sucesso',
        texto: permitiu
          ? 'Pronto. Você será avisado de mudanças num raio de 500 m deste lugar.'
          : 'Local salvo, mas as notificações estão desligadas. Os avisos aparecem na aba Avisos.',
      });
    } catch (e) {
      setMensagem({ tipo: 'erro', texto: e instanceof Error ? e.message : 'Não foi possível salvar.' });
    } finally {
      setSalvando(false);
    }
  }

  async function encerrar() {
    if (!ocorrencia) return;
    setSalvando(true);
    setMensagem(null);
    try {
      await fonteDeDados.encerrarOcorrencia(ocorrencia.id);
      await recarregar();
      setMensagem({ tipo: 'sucesso', texto: 'Ocorrência marcada como encerrada. Quem acompanha a região será avisado.' });
    } catch (e) {
      setMensagem({ tipo: 'erro', texto: e instanceof Error ? e.message : 'Não foi possível encerrar.' });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ScrollView style={estilosComuns.tela} contentContainerStyle={estilosComuns.conteudo}>
      <Stack.Screen options={{ title: ocorrencia.titulo }} />

      <View style={estilosComuns.cartao}>
        <SeloEstado estado={estado} grande />
        <Text style={estilosComuns.titulo} accessibilityRole="header">
          {ocorrencia.titulo}
        </Text>
        <Text style={estilos.endereco}>
          {ocorrencia.referencia} · {ocorrencia.bairro}
        </Text>
        {carro && (
          <Text style={estilos.distancia}>
            A {formatarDistancia(distanciaMetros(carro.local, ocorrencia.local))} do seu carro
          </Text>
        )}
        <Text style={estilos.explicacao}>{info.explicacao}</Text>
        {encerramento && <Aviso tipo="sucesso" texto={encerramento} />}
      </View>

      <View style={estilosComuns.cartao}>
        <Text style={estilosComuns.tituloSecao} accessibilityRole="header">
          De onde vem a informação
        </Text>
        <Text style={estilosComuns.texto}>
          {ROTULO_FONTE[ocorrencia.fonte.tipo]}: {ocorrencia.fonte.nome}
        </Text>
        <Text style={estilos.dado}>Registrada em {formatarDataHora(ocorrencia.registradaEm)}</Text>
        <Text style={estilos.dado}>
          Última atualização {formatarHaQuanto(ocorrencia.atualizadaEm)} ({formatarDataHora(ocorrencia.atualizadaEm)})
        </Text>
        {ocorrencia.nivelCm !== undefined && (
          <Text style={estilos.dado}>
            {ocorrencia.status === 'ATIVO' ? 'Nível medido agora' : 'Nível máximo medido'}: {formatarCm(ocorrencia.nivelCm)}
          </Text>
        )}
      </View>

      {sensor && (
        <View style={estilosComuns.cartao}>
          <Text style={estilosComuns.tituloSecao} accessibilityRole="header">
            Leituras do {sensor.nome}
          </Text>
          <GraficoNivel leituras={sensor.leituras} />
          <Text style={estilos.dado}>{EXPLICACAO_CONFIRMACAO_SENSOR}</Text>
        </View>
      )}

      <View style={estilosComuns.cartao}>
        <Text style={estilosComuns.tituloSecao} accessibilityRole="header">
          Histórico
        </Text>
        {ocorrencia.historico.map((mudanca) => (
          <View key={`${mudanca.status}-${mudanca.em}`} style={estilos.mudanca} accessible>
            <Text style={estilos.mudancaHora}>{formatarDataHora(mudanca.em)}</Text>
            <Text style={estilos.mudancaTexto}>
              {mudanca.status === 'ATIVO' ? 'Ativo' : 'Encerrado'}: {mudanca.descricao}
            </Text>
          </View>
        ))}
      </View>

      {mensagem && <Aviso tipo={mensagem.tipo} texto={mensagem.texto} />}

      {ehCidadao(usuario) && !jaAcompanha && favoritos.length < MAXIMO_LOCAIS && (
        <Botao
          rotulo="Avisar sobre mudanças aqui"
          icone="bell-plus"
          ocupado={salvando}
          onPress={acompanhar}
          dica="Salva este lugar nos seus locais favoritos, com raio de 500 metros"
        />
      )}
      {ehCidadao(usuario) && jaAcompanha && (
        <Aviso tipo="sucesso" texto="Você já acompanha este lugar. Gerencie em Perfil > Áreas monitoradas." />
      )}
      {podeEncerrar && (
        <Botao
          rotulo="Marcar como encerrada (simula a fonte)"
          icone="check-circle-outline"
          variante="secundario"
          ocupado={salvando}
          onPress={encerrar}
        />
      )}

      <Aviso tipo="aviso" texto={AVISO_SEGURANCA} />
    </ScrollView>
  );
}
