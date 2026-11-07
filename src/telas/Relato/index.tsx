import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, View } from 'react-native';

import { Aviso } from '@/componentes/Aviso';
import { Botao } from '@/componentes/Botao';
import { CampoTexto } from '@/componentes/CampoTexto';
import { useAutenticacao } from '@/contexto/AutenticacaoContext';
import { useDados } from '@/contexto/DadosContext';
import { checarContexto } from '@/dominio/moderacao';
import { INFO_STATUS_RELATO, INFO_TRIAGEM, LIMITE_DA_IA, ROTULO_TIPO_EVENTO, type Relato } from '@/dominio/relato';
import { ehAgente } from '@/dominio/usuario';
import { estilosComuns } from '@/estilos/comuns';
import { cores } from '@/estilos/tema';
import { fonteDeDados } from '@/servicos/dados/fonte';
import { formatarConfianca } from '@/servicos/ia/triagem';
import { formatarDataHora } from '@/utilitarios/formato';

import { estilos } from './estilos';

export default function TelaRelato() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { usuario } = useAutenticacao();
  const { ocorrencias, sensores, recarregar } = useDados();
  const [relatos, setRelatos] = useState<Relato[] | null>(null);
  const [motivo, setMotivo] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const agente = ehAgente(usuario);

  const carregar = useCallback(() => {
    if (!usuario) return;
    fonteDeDados
      .listarRelatos(agente ? {} : { autorId: usuario.id })
      .then(setRelatos)
      .catch(() => setMensagem('Não foi possível carregar o relato.'));
  }, [usuario, agente]);

  useFocusEffect(carregar);

  const relato = relatos?.find((r) => r.id === id);
  const pistas = useMemo(
    () => (relato && agente ? checarContexto(relato, ocorrencias, sensores, relatos ?? []) : []),
    [relato, agente, ocorrencias, sensores, relatos],
  );

  if (relatos === null) {
    return (
      <View style={estilosComuns.centro}>
        <ActivityIndicator size="large" color={cores.primaria} />
      </View>
    );
  }
  if (!relato) {
    return (
      <View style={estilosComuns.centro}>
        <Text style={estilosComuns.texto}>Relato não encontrado.</Text>
      </View>
    );
  }

  const status = INFO_STATUS_RELATO[relato.status];
  const triagem = relato.triagem;

  async function revisar(publicar: boolean) {
    if (!relato) return;
    setOcupado(true);
    try {
      await fonteDeDados.revisarRelato(relato.id, { publicar, motivo: motivo.trim() || undefined });
      await recarregar();
      carregar();
      setMensagem(publicar ? 'Relato publicado no mapa como relato comunitário.' : 'Relato recusado.');
    } catch (e) {
      setMensagem(e instanceof Error ? e.message : 'Não foi possível salvar a decisão.');
    } finally {
      setOcupado(false);
    }
  }

  async function excluir() {
    if (!relato || !usuario) return;
    setOcupado(true);
    try {
      await fonteDeDados.excluirRelato(usuario.id, relato.id);
      await recarregar();
      router.back();
    } catch {
      setMensagem('Não foi possível excluir o relato.');
      setOcupado(false);
    }
  }

  return (
    <ScrollView style={estilosComuns.tela} contentContainerStyle={estilosComuns.conteudo}>
      {mensagem && <Aviso tipo="info" texto={mensagem} />}

      <View style={estilosComuns.cartao}>
        <Text style={estilosComuns.titulo} accessibilityRole="header">
          {ROTULO_TIPO_EVENTO[relato.tipo]}
        </Text>
        <Text style={estilos.detalhe}>
          {relato.referencia} · {relato.bairro}
        </Text>
        <Text style={estilos.detalhe}>
          Visto às {formatarDataHora(relato.ocorridoEm)} · enviado em {formatarDataHora(relato.enviadoEm)}
        </Text>
        {relato.descricao ? <Text style={estilosComuns.texto}>{relato.descricao}</Text> : null}
        {relato.fotoUri && (
          <Image source={{ uri: relato.fotoUri }} style={estilos.foto} accessibilityLabel="Foto enviada no relato" />
        )}
      </View>

      <View style={estilosComuns.cartao}>
        <Text style={estilosComuns.tituloSecao} accessibilityRole="header">
          Triagem da IA
        </Text>
        {triagem ? (
          <>
            <Text style={estilos.categoria}>{INFO_TRIAGEM[triagem.categoria].rotulo}</Text>
            <Text style={estilosComuns.texto}>{INFO_TRIAGEM[triagem.categoria].explicacao}</Text>
            <Text style={estilos.detalhe}>Confiança da sugestão: {formatarConfianca(triagem.confianca)}</Text>
            {triagem.simulada && (
              <Aviso
                tipo="info"
                texto="Triagem simulada no protótipo. O modelo de visão computacional vem da disciplina de IA e entra pela mesma chamada da API."
              />
            )}
          </>
        ) : (
          <Text style={estilosComuns.texto}>Relato sem foto: a equipe analisa pela descrição e pelo contexto.</Text>
        )}
        <Text style={estilos.nota}>{LIMITE_DA_IA}</Text>
      </View>

      <View style={estilosComuns.cartao}>
        <Text style={estilosComuns.tituloSecao} accessibilityRole="header">
          Situação: {status.rotulo}
        </Text>
        <Text style={estilosComuns.texto}>{status.explicacao}</Text>
        {relato.motivoRecusa && <Text style={estilos.detalhe}>Motivo: {relato.motivoRecusa}</Text>}
        {relato.ocorrenciaId && (
          <Botao
            rotulo="Ver no mapa"
            icone="map-marker"
            variante="secundario"
            onPress={() => router.push({ pathname: '/ocorrencia/[id]', params: { id: relato.ocorrenciaId ?? '' } })}
          />
        )}
      </View>

      {agente && relato.status === 'EM_ANALISE' && (
        <View style={estilosComuns.cartao}>
          <Text style={estilosComuns.tituloSecao} accessibilityRole="header">
            Checagem do contexto
          </Text>
          {pistas.map((pista) => (
            <Text key={pista.texto} style={[estilos.pista, pista.reforca && estilos.pistaReforca]}>
              {pista.reforca ? '✓ ' : '• '}
              {pista.texto}
            </Text>
          ))}
          <CampoTexto
            rotulo="Motivo, se recusar (opcional)"
            valor={motivo}
            onMudar={setMotivo}
            maxLength={120}
          />
          <Botao
            rotulo="Publicar como relato comunitário"
            icone="check"
            ocupado={ocupado}
            onPress={() => revisar(true)}
          />
          <Botao rotulo="Recusar" icone="close" variante="perigo" ocupado={ocupado} onPress={() => revisar(false)} />
        </View>
      )}

      {!agente && (
        <Botao
          rotulo="Excluir este relato"
          icone="delete"
          variante="perigo"
          ocupado={ocupado}
          onPress={excluir}
          dica="Apaga o relato e a foto. Se estiver publicado, sai do mapa."
        />
      )}
    </ScrollView>
  );
}
