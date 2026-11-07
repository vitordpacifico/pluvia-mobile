import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { bairroMaisProximo, buscarBairros, type Coordenada } from '@/dominio/geo';
import { cores } from '@/estilos/tema';
import { ErroLocalizacao, obterLocalizacaoAtual } from '@/servicos/dispositivo/localizacao';

import { Botao } from '../Botao';
import { CampoTexto } from '../CampoTexto';
import { estilos } from './estilos';

export interface LocalEscolhido {
  local: Coordenada;
  bairro: string;
  origem: 'gps' | 'bairro';
}

interface Props {
  rotulo: string;
  valor: LocalEscolhido | null;
  onMudar: (valor: LocalEscolhido) => void;
  erro?: string | null;
}

export function SeletorLocal({ rotulo, valor, onMudar, erro }: Props) {
  const [busca, setBusca] = useState('');
  const [localizando, setLocalizando] = useState(false);
  const [erroGps, setErroGps] = useState<string | null>(null);
  const sugestoes = buscarBairros(busca).slice(0, 6);

  async function usarLocalizacao() {
    setErroGps(null);
    setLocalizando(true);
    try {
      const local = await obterLocalizacaoAtual();
      onMudar({ local, bairro: bairroMaisProximo(local).nome, origem: 'gps' });
    } catch (e) {
      setErroGps(e instanceof ErroLocalizacao ? e.message : 'Não foi possível obter a localização.');
    } finally {
      setLocalizando(false);
    }
  }

  return (
    <View style={estilos.grupo}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      {valor && (
        <View style={estilos.escolhido} accessible accessibilityLabel={`Local escolhido: ${valor.bairro}`}>
          <MaterialCommunityIcons name="map-marker-check" size={22} color={cores.sucesso} />
          <Text style={estilos.textoEscolhido}>
            {valor.bairro} {valor.origem === 'gps' ? '(sua localização)' : '(centro do bairro)'}
          </Text>
        </View>
      )}
      <Botao
        rotulo="Usar minha localização"
        icone="crosshairs-gps"
        variante="secundario"
        ocupado={localizando}
        onPress={usarLocalizacao}
        dica="Pede permissão de localização uma vez. Você também pode escolher o bairro."
      />
      {erroGps && <Text style={estilos.erro}>{erroGps}</Text>}
      <CampoTexto
        rotulo="Ou busque o bairro"
        valor={busca}
        onMudar={setBusca}
        placeholder="Ex.: Ipiranga"
        autoCorrect={false}
      />
      <View style={estilos.sugestoes} accessibilityRole="radiogroup" accessibilityLabel="Bairros">
        {sugestoes.length === 0 && <Text style={estilos.vazio}>Nenhum bairro encontrado na região do protótipo.</Text>}
        {sugestoes.map((bairro) => {
          const marcado = valor?.origem === 'bairro' && valor.bairro === bairro.nome;
          return (
            <Pressable
              key={bairro.nome}
              onPress={() => onMudar({ local: bairro.centro, bairro: bairro.nome, origem: 'bairro' })}
              accessibilityRole="radio"
              accessibilityState={{ checked: marcado }}
              accessibilityLabel={bairro.nome}
              style={[estilos.chip, marcado && estilos.chipMarcado]}
            >
              <Text style={[estilos.textoChip, marcado && estilos.textoChipMarcado]}>{bairro.nome}</Text>
            </Pressable>
          );
        })}
      </View>
      {erro && (
        <Text style={estilos.erro} accessibilityRole="alert" accessibilityLiveRegion="polite">
          {erro}
        </Text>
      )}
    </View>
  );
}
