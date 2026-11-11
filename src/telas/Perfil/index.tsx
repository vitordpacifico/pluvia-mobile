import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

import { Aviso } from '@/componentes/Aviso';
import { Botao } from '@/componentes/Botao';
import { CampoTexto } from '@/componentes/CampoTexto';
import { GrupoOpcoes } from '@/componentes/GrupoOpcoes';
import { ErroLogin, useAutenticacao } from '@/contexto/AutenticacaoContext';
import { useLocais } from '@/contexto/LocaisContext';
import {
  ehCidadao,
  OPCOES_TIPO_CIDADAO,
  ROTULO_PERFIL,
  type TipoCidadao,
  type Usuario,
} from '@/dominio/usuario';
import { estilosComuns } from '@/estilos/comuns';
import { notificacoesPermitidas, pedirPermissaoDeNotificacao } from '@/servicos/alertas/notificacoes';
import { pedirConfirmacao } from '@/utilitarios/confirmacao';
import { mascararCep, mascararTelefone } from '@/utilitarios/mascaras';
import {
  semErros,
  validarCep,
  validarNome,
  validarTelefone,
  type Validacao,
} from '@/utilitarios/validacoes';

import { estilos } from './estilos';

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  const primeira = partes[0]?.[0] ?? '';
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primeira + ultima).toUpperCase();
}

function Dado({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <View style={estilos.dado} accessible accessibilityLabel={`${rotulo}: ${valor}`}>
      <Text style={estilos.rotuloDado}>{rotulo}</Text>
      <Text style={estilos.valorDado}>{valor}</Text>
    </View>
  );
}

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

function ExcluirConta() {
  const { excluirConta } = useAutenticacao();
  const [aberto, setAberto] = useState(false);
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  async function confirmar() {
    if (!senha) {
      setErro('Digite sua senha para confirmar.');
      return;
    }
    setExcluindo(true);
    setErro(null);
    try {
      await excluirConta(senha);
    } catch (e) {
      setErro(e instanceof ErroLogin ? e.message : 'Não foi possível excluir a conta.');
      setExcluindo(false);
    }
  }

  function cancelar() {
    setAberto(false);
    setSenha('');
    setErro(null);
  }

  return (
    <View style={[estilosComuns.cartao, estilos.formulario]}>
      <Text style={estilosComuns.tituloSecao} accessibilityRole="header">
        Excluir conta
      </Text>
      <Text style={estilosComuns.legenda}>
        Apaga sua conta, o local do carro, os locais favoritos, os avisos e os seus relatos. Não dá para
        desfazer.
      </Text>
      {aberto ? (
        <>
          <CampoTexto
            rotulo="Sua senha"
            valor={senha}
            onMudar={setSenha}
            erro={erro}
            senha
            autoComplete="current-password"
          />
          <Botao
            rotulo="Confirmar exclusão"
            icone="delete-forever"
            variante="perigo"
            ocupado={excluindo}
            onPress={confirmar}
          />
          <Botao rotulo="Cancelar" variante="secundario" onPress={cancelar} />
        </>
      ) : (
        <Botao
          rotulo="Excluir minha conta"
          icone="delete"
          variante="perigo"
          dica="Abre a confirmação com a sua senha"
          onPress={() => setAberto(true)}
        />
      )}
    </View>
  );
}

export default function TelaPerfil() {
  const { usuario, sair } = useAutenticacao();
  const { locais } = useLocais();
  const [permitidas, setPermitidas] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const cidadao = ehCidadao(usuario);

  const carregar = useCallback(async () => {
    try {
      setPermitidas(await notificacoesPermitidas().catch(() => false));
    } catch {
      setErro('Não foi possível carregar suas preferências.');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  const confirmarSaida = useCallback(() => {
    pedirConfirmacao('Sair da conta', 'Você deixará de receber avisos neste aparelho até entrar de novo.', 'Sair', () => {
      sair();
    });
  }, [sair]);

  if (!usuario) return null;

  return (
    <KeyboardAvoidingView
      style={estilosComuns.tela}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={estilosComuns.conteudo} keyboardShouldPersistTaps="handled">
        {erro && <Aviso tipo="erro" texto={erro} />}

        <View style={[estilosComuns.cartao, estilos.cabecalho]}>
          <View style={estilos.avatar} accessibilityElementsHidden importantForAccessibility="no">
            <Text style={estilos.iniciais}>{iniciais(usuario.nome)}</Text>
          </View>
          <View style={estilos.identidade}>
            <Text style={estilos.nome} accessibilityRole="header">
              {usuario.nome}
            </Text>
            <View style={estilos.chipPerfil}>
              <Text style={estilos.textoPerfil}>{ROTULO_PERFIL[usuario.perfil]}</Text>
            </View>
            {usuario.orgao && <Dado rotulo="Órgão" valor={usuario.orgao} />}
            {!cidadao && <Dado rotulo="E-mail" valor={usuario.email} />}
          </View>
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
                  texto="Notificações desativadas. Você só verá os avisos na aba Avisos, com o app aberto."
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
              Áreas monitoradas
            </Text>
            <Text style={estilosComuns.legenda}>
              {locais.length === 0
                ? 'Nenhum local salvo.'
                : `${locais.length} local(is): ${locais.map((l) => l.nome).join(', ')}.`}
            </Text>
            <Botao
              rotulo="Gerenciar áreas e avisos"
              icone="tune"
              variante="secundario"
              onPress={() => router.push('/areas')}
            />
          </View>
        )}

        <Botao rotulo="Sair da conta" icone="logout" variante="secundario" onPress={confirmarSaida} />

        {cidadao && <ExcluirConta />}

        <Text style={estilosComuns.rodape}>
          O Pluvia não substitui os comunicados oficiais. Em emergência, ligue 199 (Defesa Civil) ou 193 (Bombeiros).
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
