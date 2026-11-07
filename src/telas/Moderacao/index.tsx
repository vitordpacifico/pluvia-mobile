import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Image, Pressable, Text, View } from 'react-native';

import { Aviso } from '@/componentes/Aviso';
import { INFO_TRIAGEM, ROTULO_TIPO_EVENTO, type Relato } from '@/dominio/relato';
import { estilosComuns } from '@/estilos/comuns';
import { fonteDeDados } from '@/servicos/dados/fonte';
import { formatarConfianca } from '@/servicos/ia/triagem';
import { formatarDataHora } from '@/utilitarios/formato';

import { estilos } from './estilos';

export default function TelaModeracao() {
  const [relatos, setRelatos] = useState<Relato[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      fonteDeDados
        .listarRelatos({ status: 'EM_ANALISE' })
        .then((lista) => {
          setRelatos(lista);
          setErro(null);
        })
        .catch(() => setErro('Não foi possível carregar os relatos.'));
    }, []),
  );

  return (
    <FlatList
      data={relatos}
      keyExtractor={(relato) => relato.id}
      contentContainerStyle={estilos.lista}
      ListHeaderComponent={
        <View style={estilos.cabecalho}>
          <Text style={estilosComuns.titulo} accessibilityRole="header">
            Relatos em análise
          </Text>
          <Text style={estilos.detalhe}>
            Confira a triagem da IA e o contexto antes de publicar. Relato publicado aparece como relato comunitário,
            nunca como registro oficial.
          </Text>
          {erro && <Aviso tipo="erro" texto={erro} />}
        </View>
      }
      ListEmptyComponent={<Text style={estilos.detalhe}>Nenhum relato esperando análise.</Text>}
      ItemSeparatorComponent={() => <View style={estilosComuns.separador} />}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => router.push({ pathname: '/relato/[id]', params: { id: item.id } })}
          accessibilityRole="button"
          accessibilityLabel={`${ROTULO_TIPO_EVENTO[item.tipo]} em ${item.bairro}. ${
            item.triagem ? `IA sugere: ${INFO_TRIAGEM[item.triagem.categoria].rotulo}` : 'Sem foto'
          }`}
          style={({ pressed }) => [estilosComuns.cartao, estilos.item, pressed && estilos.pressionado]}
        >
          {item.fotoUri && <Image source={{ uri: item.fotoUri }} style={estilos.miniatura} />}
          <View style={estilos.texto}>
            <Text style={estilos.titulo}>
              {ROTULO_TIPO_EVENTO[item.tipo]} · {item.bairro}
            </Text>
            <Text style={estilos.detalhe}>{item.referencia}</Text>
            <Text style={estilos.ia}>
              {item.triagem
                ? `IA: ${INFO_TRIAGEM[item.triagem.categoria].rotulo} (${formatarConfianca(item.triagem.confianca)})`
                : 'Sem foto'}
            </Text>
            <Text style={estilos.detalhe}>Enviado em {formatarDataHora(item.enviadoEm)}</Text>
          </View>
        </Pressable>
      )}
    />
  );
}
