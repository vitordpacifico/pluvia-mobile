import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

import { Aviso } from '@/componentes/Aviso';
import { Botao } from '@/componentes/Botao';
import { CampoTexto } from '@/componentes/CampoTexto';
import { GrupoOpcoes } from '@/componentes/GrupoOpcoes';
import { useAutenticacao } from '@/contexto/AutenticacaoContext';
import type { PontoSeguido } from '@/dominio/tipos';
import {
  ehCidadao,
  OPCOES_TIPO_CIDADAO,
  ROTULO_PERFIL,
  type TipoCidadao,
  type Usuario,
} from '@/dominio/usuario';
import { estilosComuns } from '@/estilos/comuns';
import { notificacoesPermitidas, pedirPermissaoDeNotificacao } from '@/servicos/alertas/notificacoes';
import {
  deixarDeSeguir,
  listarPontosSeguidos,
} from '@/servicos/armazenamento/pontosSeguidosServico';
import { mascararCep, mascararTelefone } from '@/utilitarios/mascaras';
import {
  semErros,
  validarCep,
  validarNome,
  validarTelefone,
  type Validacao,
} from '@/utilitarios/validacoes';

import { estilos } from './estilos';

function Dado({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <View style={estilos.dado} accessible accessibilityLabel={`${rotulo}: ${valor}`}>
      <Text style={estilos.rotuloDado}>{rotulo}</Text>
      <Text style={estilos.valorDado}>{valor}</Text>
    </View>
  );
}

/** Formulario de edicao do cidadao, com as mesmas mascaras e validacoes do cadastro. */
function EditarCidadao({ usuario }: { usuario: Usuario }) {
  const { atualizar } = useAutenticacao();
  const [nome, setNome] = useState(usuario.nome);
  const [telefone, setTelefone] = useState(usuario.telefone ?? '');
  const [cep, setCep] = useState(usuario.cep ?? '');
  const [tipoCidadao, setTipoCidadao] = useState<TipoCidadao>(usuario.tipoCidadao ?? 'morador');
  const [erros, setErros] = useState<Record<'nome' | 'telefone' | 'cep', Validacao>>({
    nome: null,
    telefone: null,
    cep: null,
  });
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    const novosErros = {
      nome: validarNome(nome),
      telefone: validarTelefone(telefone),
      cep: validarCep(cep),
    };
    setErros(novosErros);
    setMensagem(null);
    if (!semErros(novosErros)) return;

    setSalvando(true);
    try {
      await atualizar({ nome, telefone, cep, tipoCidadao });
      setMensagem({ tipo: 'sucesso', texto: 'Dados atualizados.' });
    } catch {
      setMensagem({ tipo: 'erro', texto: 'Não foi possível salvar. Tente novamente.' });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <View style={[estilosComuns.cartao, estilos.formulario]}>
      <Text style={estilosComuns.tituloSecao} accessibilityRole="header">
        Seus dados
      </Text>
      <Dado rotulo="E-mail" valor={usuario.email} />
      <CampoTexto rotulo="Nome" valor={nome} onMudar={setNome} erro={erros.nome} autoCapitalize="words" />
      <CampoTexto
        rotulo="Celular"
        valor={telefone}
        onMudar={setTelefone}
        mascara={mascararTelefone}
        erro={erros.telefone}
        keyboardType="phone-pad"
      />
      <CampoTexto
        rotulo="CEP"
        valor={cep}
        onMudar={setCep}
        mascara={mascararCep}
        erro={erros.cep}
        keyboardType="number-pad"
      />
      <GrupoOpcoes
        rotulo="Você é"
        opcoes={OPCOES_TIPO_CIDADAO}
        valor={tipoCidadao}
        onMudar={setTipoCidadao}
      />
      {mensagem && <Aviso tipo={mensagem.tipo} texto={mensagem.texto} />}
      <Botao rotulo="Salvar alterações" icone="content-save" ocupado={salvando} onPress={salvar} />
    </View>
  );
}

export default function TelaPerfil() {
  const { usuario, sair } = useAutenticacao();
  const [seguidos, setSeguidos] = useState<PontoSeguido[]>([]);
  const [permitidas, setPermitidas] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const cidadao = ehCidadao(usuario);

  const carregar = useCallback(async () => {
    try {
      setPermitidas(await notificacoesPermitidas().catch(() => false));
      if (usuario && cidadao) setSeguidos(await listarPontosSeguidos(usuario.id));
    } catch {
      setErro('Não foi possível carregar suas preferências.');
    }
  }, [usuario, cidadao]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  const remover = useCallback(
    async (ponto: PontoSeguido) => {
      if (!usuario) return;
      await deixarDeSeguir(usuario.id, ponto.pontoId).catch(() => setErro('Não foi possível remover.'));
      await carregar();
    },
    [usuario, carregar],
  );

  const confirmarSaida = useCallback(() => {
    Alert.alert('Sair da conta', 'Você deixará de receber alertas neste celular até entrar de novo.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => sair() },
    ]);
  }, [sair]);

  if (!usuario) return null;

  return (
    <KeyboardAvoidingView
      style={estilosComuns.tela}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={estilosComuns.conteudo} keyboardShouldPersistTaps="handled">
        {erro && <Aviso tipo="erro" texto={erro} />}

        <View style={estilosComuns.cartao}>
          <Text style={estilosComuns.titulo} accessibilityRole="header">
            {usuario.nome}
          </Text>
          <Dado rotulo="Perfil" valor={ROTULO_PERFIL[usuario.perfil]} />
          {usuario.orgao && <Dado rotulo="Órgão" valor={usuario.orgao} />}
          {!cidadao && <Dado rotulo="E-mail" valor={usuario.email} />}
        </View>

        {cidadao && <EditarCidadao usuario={usuario} />}

        {cidadao && (
          <View style={estilosComuns.cartao}>
            <Text style={estilosComuns.tituloSecao} accessibilityRole="header">
              Notificações
            </Text>
            {permitidas ? (
              <Text style={estilosComuns.legenda}>Notificações ativadas.</Text>
            ) : (
              <>
                <Aviso
                  tipo="aviso"
                  texto="Notificações desativadas. Você só verá os alertas na aba Alertas, com o app aberto."
                />
                <Botao
                  rotulo="Ativar notificações"
                  icone="bell-ring"
                  onPress={async () =>
                    setPermitidas(await pedirPermissaoDeNotificacao().catch(() => false))
                  }
                />
              </>
            )}
          </View>
        )}

        {cidadao && (
          <View style={estilosComuns.cartao}>
            <Text style={estilosComuns.tituloSecao} accessibilityRole="header">
              Pontos que você acompanha
            </Text>
            {seguidos.length === 0 ? (
              <Text style={estilosComuns.legenda}>Nenhum. Ative os alertas na tela de um ponto.</Text>
            ) : (
              seguidos.map((ponto) => (
                <View key={ponto.pontoId} style={estilos.seguido}>
                  <Text style={estilos.nomeSeguido}>{ponto.pontoNome}</Text>
                  <Botao
                    rotulo="Remover"
                    icone="bell-off"
                    variante="secundario"
                    dica={`Para de receber alertas de ${ponto.pontoNome}`}
                    onPress={() => remover(ponto)}
                  />
                </View>
              ))
            )}
          </View>
        )}

        <Botao rotulo="Sair da conta" icone="logout" variante="perigo" onPress={confirmarSaida} />

        <Text style={estilosComuns.rodape}>
          O SENTINELA não substitui as orientações oficiais da Defesa Civil.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
