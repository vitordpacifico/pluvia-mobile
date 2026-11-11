import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Aviso } from '@/componentes/Aviso';
import { Marca } from '@/componentes/Marca';
import { Botao } from '@/componentes/Botao';
import { CampoTexto } from '@/componentes/CampoTexto';
import { ErroLogin, useAutenticacao } from '@/contexto/AutenticacaoContext';
import { estilosComuns } from '@/estilos/comuns';
import { fonteDeDados } from '@/servicos/dados/fonte';
import { CONTAS_DEMONSTRACAO } from '@/servicos/armazenamento/usuariosServico';
import { validarEmail, validarObrigatorio } from '@/utilitarios/validacoes';

import { estilos } from './estilos';

export default function TelaEntrar() {
  const { entrar } = useAutenticacao();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erros, setErros] = useState<{ email: string | null; senha: string | null }>({
    email: null,
    senha: null,
  });
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    const novosErros = {
      email: validarEmail(email),
      senha: validarObrigatorio(senha, 'Informe sua senha.'),
    };
    setErros(novosErros);
    setErroGeral(null);
    if (novosErros.email || novosErros.senha) return;

    setEnviando(true);
    try {
      await entrar(email, senha);
    } catch (e) {
      setErroGeral(e instanceof ErroLogin ? e.message : 'Não foi possível entrar. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  function preencherDemonstracao(indice: number) {
    const conta = CONTAS_DEMONSTRACAO[indice];
    setEmail(conta.email);
    setSenha(conta.senha);
    setErros({ email: null, senha: null });
    setErroGeral(null);
  }

  return (
    <SafeAreaView style={estilos.tela} edges={['top']}>
      <KeyboardAvoidingView
        style={estilosComuns.tela}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={estilos.rolagem}
          contentContainerStyle={estilos.conteudo}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
        >
          <View style={estilos.topo}>
            <Marca largura={230} />
            <Text style={estilos.slogan}>
              Alagamentos perto de você, do seu carro e dos seus trajetos, com a fonte e a hora de cada
              informação.
            </Text>
          </View>

          <View style={[estilosComuns.cartao, estilos.cartaoLogin]}>
            <Text style={estilosComuns.tituloSecao} accessibilityRole="header">
              Entrar
            </Text>
            <CampoTexto
              rotulo="E-mail"
              valor={email}
              onMudar={setEmail}
              erro={erros.email}
              placeholder="nome@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
            />
            <CampoTexto
              rotulo="Senha"
              valor={senha}
              onMudar={setSenha}
              erro={erros.senha}
              senha
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={enviar}
            />
            {erroGeral && <Aviso tipo="erro" texto={erroGeral} />}
            <Botao rotulo="Entrar" icone="login" ocupado={enviando} onPress={enviar} />
            <Botao
              rotulo="Criar conta de cidadão"
              variante="secundario"
              icone="account-plus"
              onPress={() => router.push('/cadastro')}
            />
          </View>

          {fonteDeDados.simulada && (
            <View style={[estilosComuns.cartao, estilos.cartaoDemo]}>
              <Text style={estilosComuns.tituloSecao} accessibilityRole="header">
                Contas de demonstração
              </Text>
              <Text style={estilosComuns.legenda}>
                Preenchem o login com uma conta de teste. A equipe de monitoramento não se cadastra
                pelo app: o acesso é criado pela coordenação.
              </Text>
              <View style={estilos.botoesDemo}>
                <Botao
                  rotulo="Usar conta de cidadão"
                  variante="secundario"
                  icone="account"
                  onPress={() => preencherDemonstracao(0)}
                />
                <Botao
                  rotulo="Usar conta da equipe"
                  variante="secundario"
                  icone="shield-account"
                  onPress={() => preencherDemonstracao(1)}
                />
              </View>
            </View>
          )}

          <Text style={[estilosComuns.rodape, estilos.rodape]}>
            O Pluvia não substitui os comunicados oficiais. Em emergência, ligue 199 ou 193.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
