import { Pressable, Text, View } from 'react-native';

import { estilos } from './estilos';

interface Opcao<T extends string> {
  valor: T;
  rotulo: string;
  descricao?: string;
}

interface Props<T extends string> {
  rotulo: string;
  opcoes: Opcao<T>[];
  valor: T;
  onMudar: (valor: T) => void;
  rotuloVisivel?: boolean;
}

export function GrupoOpcoes<T extends string>({ rotulo, opcoes, valor, onMudar, rotuloVisivel = true }: Props<T>) {
  return (
    <View style={estilos.grupo}>
      {rotuloVisivel && <Text style={estilos.rotulo}>{rotulo}</Text>}
      <View style={estilos.opcoes} accessibilityRole="radiogroup" accessibilityLabel={rotulo}>
        {opcoes.map((opcao) => {
          const marcada = opcao.valor === valor;
          return (
            <Pressable
              key={opcao.valor}
              onPress={() => onMudar(opcao.valor)}
              accessibilityRole="radio"
              accessibilityState={{ checked: marcada }}
              accessibilityLabel={[opcao.rotulo, opcao.descricao].filter(Boolean).join('. ')}
              style={[estilos.opcao, marcada && estilos.opcaoMarcada]}
            >
              <Text style={[estilos.textoOpcao, marcada && estilos.textoMarcado]}>
                {opcao.rotulo}
              </Text>
              {opcao.descricao && (
                <Text style={[estilos.descricao, marcada && estilos.textoMarcado]}>
                  {opcao.descricao}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
