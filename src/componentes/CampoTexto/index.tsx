import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useId, useState } from 'react';
import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';

import { cores } from '@/estilos/tema';

import { estilos, semContornoWeb } from './estilos';

interface Props extends Omit<TextInputProps, 'value' | 'onChangeText' | 'style'> {
  rotulo: string;
  valor: string;
  onMudar: (texto: string) => void;
  mascara?: (texto: string) => string;
  erro?: string | null;
  dica?: string;
  senha?: boolean;
}

export function CampoTexto({
  rotulo,
  valor,
  onMudar,
  mascara,
  erro,
  dica,
  senha = false,
  ...entrada
}: Props) {
  const idRotulo = useId();
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [focado, setFocado] = useState(false);
  const descricao = [dica, erro].filter(Boolean).join('. ');

  return (
    <View style={estilos.campo}>
      <Text style={estilos.rotulo} nativeID={idRotulo}>
        {rotulo}
      </Text>
      {dica && <Text style={estilos.dica}>{dica}</Text>}
      <View style={[estilos.linhaEntrada, focado && estilos.linhaFocada, erro && estilos.linhaComErro]}>
        <TextInput
          {...entrada}
          onFocus={(evento) => {
            setFocado(true);
            entrada.onFocus?.(evento);
          }}
          onBlur={(evento) => {
            setFocado(false);
            entrada.onBlur?.(evento);
          }}
          value={valor}
          onChangeText={(texto) => onMudar(mascara ? mascara(texto) : texto)}
          secureTextEntry={senha && !mostrarSenha}
          placeholderTextColor={cores.textoSecundario}
          accessibilityLabel={rotulo}
          accessibilityLabelledBy={idRotulo}
          accessibilityHint={descricao || undefined}
          accessibilityState={{ disabled: entrada.editable === false }}
          style={[estilos.entrada, semContornoWeb]}
        />
        {senha && (
          <Pressable
            onPress={() => setMostrarSenha((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={mostrarSenha ? 'Esconder senha' : 'Mostrar senha'}
            style={estilos.botaoMostrar}
          >
            <MaterialCommunityIcons
              name={mostrarSenha ? 'eye-off' : 'eye'}
              size={24}
              color={cores.textoSecundario}
            />
          </Pressable>
        )}
      </View>
      {erro && (
        <Text style={estilos.erro} accessibilityRole="alert" accessibilityLiveRegion="polite">
          {erro}
        </Text>
      )}
    </View>
  );
}
