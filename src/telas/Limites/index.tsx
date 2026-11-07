import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

import { Aviso } from '@/componentes/Aviso';
import { Botao } from '@/componentes/Botao';
import { CampoTexto } from '@/componentes/CampoTexto';
import { useDados } from '@/contexto/DadosContext';
import { estilosComuns } from '@/estilos/comuns';
import { fonteDeDados } from '@/servicos/dados/fonte';
import { centimetrosParaTexto, lerCentimetros, mascararCentimetros } from '@/utilitarios/mascaras';
import { semErros, validarLimites, type Validacao } from '@/utilitarios/validacoes';

import { estilos } from './estilos';

type Campo = 'atencaoCm' | 'alertaCm' | 'evacuacaoCm';

const SEM_ERROS: Record<Campo, Validacao> = { atencaoCm: null, alertaCm: null, evacuacaoCm: null };

export default function TelaLimites() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { pontos, recarregar } = useDados();
  const ponto = pontos.find((p) => p.id === id);

  const [valores, setValores] = useState<Record<Campo, string>>(() => ({
    atencaoCm: ponto ? centimetrosParaTexto(ponto.limites.atencaoCm) : '',
    alertaCm: ponto ? centimetrosParaTexto(ponto.limites.alertaCm) : '',
    evacuacaoCm: ponto ? centimetrosParaTexto(ponto.limites.evacuacaoCm) : '',
  }));
  const [erros, setErros] = useState(SEM_ERROS);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  if (!ponto) {
    return (
      <View style={estilosComuns.conteudo}>
        <Aviso tipo="aviso" texto="Ponto não encontrado. Volte e tente novamente." />
      </View>
    );
  }
  const pontoId = ponto.id;

  function mudar(campo: Campo, texto: string) {
    setValores((atuais) => ({ ...atuais, [campo]: texto }));
  }

  async function salvar() {
    const limites = {
      atencaoCm: lerCentimetros(valores.atencaoCm),
      alertaCm: lerCentimetros(valores.alertaCm),
      evacuacaoCm: lerCentimetros(valores.evacuacaoCm),
    };
    const novosErros = validarLimites(limites);
    setErros(novosErros);
    setErroGeral(null);
    if (!semErros(novosErros)) return;

    setSalvando(true);
    try {
      await fonteDeDados.atualizarLimites(pontoId, {
        atencaoCm: limites.atencaoCm!,
        alertaCm: limites.alertaCm!,
        evacuacaoCm: limites.evacuacaoCm!,
      });
      await recarregar();
      router.back();
    } catch {
      setErroGeral('Não foi possível salvar os limites. Tente novamente.');
      setSalvando(false);
    }
  }

  const camposComuns = { mascara: mascararCentimetros, keyboardType: 'decimal-pad' as const, placeholder: '0,0' };

  return (
    <KeyboardAvoidingView
      style={estilosComuns.tela}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: `Limites: ${ponto.nome}` }} />
      <ScrollView contentContainerStyle={estilosComuns.conteudo} keyboardShouldPersistTaps="handled">
        <View style={[estilosComuns.cartao, estilos.formulario]}>
          <Text style={estilosComuns.tituloSecao} accessibilityRole="header">
            Água a partir da qual cada nível começa
          </Text>
          <Text style={estilosComuns.legenda}>
            Defina com base na altura da calçada e das entradas do local. Cada nível precisa
            começar acima do anterior.
          </Text>
          <CampoTexto
            rotulo="Atenção (cm)"
            valor={valores.atencaoCm}
            onMudar={(t) => mudar('atencaoCm', t)}
            erro={erros.atencaoCm}
            {...camposComuns}
          />
          <CampoTexto
            rotulo="Alerta (cm)"
            valor={valores.alertaCm}
            onMudar={(t) => mudar('alertaCm', t)}
            erro={erros.alertaCm}
            {...camposComuns}
          />
          <CampoTexto
            rotulo="Evacuação (cm)"
            valor={valores.evacuacaoCm}
            onMudar={(t) => mudar('evacuacaoCm', t)}
            erro={erros.evacuacaoCm}
            {...camposComuns}
          />
          {erroGeral && <Aviso tipo="erro" texto={erroGeral} />}
          <View style={estilos.botoes}>
            <Botao rotulo="Salvar limites" icone="content-save" ocupado={salvando} onPress={salvar} />
            <Botao rotulo="Cancelar" variante="secundario" onPress={() => router.back()} />
          </View>
        </View>
        <Text style={estilosComuns.rodape}>
          Os novos limites passam a valer na próxima leitura do sensor.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
