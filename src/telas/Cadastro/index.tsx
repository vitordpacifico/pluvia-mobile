import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

import { Aviso } from '@/componentes/Aviso';
import { Botao } from '@/componentes/Botao';
import { CaixaSelecao } from '@/componentes/CaixaSelecao';
import { CampoTexto } from '@/componentes/CampoTexto';
import { ExplicacaoNiveis } from '@/componentes/ExplicacaoNiveis';
import { GrupoOpcoes } from '@/componentes/GrupoOpcoes';
import { useAutenticacao } from '@/contexto/AutenticacaoContext';
import { OPCOES_TIPO_CIDADAO, type TipoCidadao } from '@/dominio/usuario';
import { estilosComuns } from '@/estilos/comuns';
import { pedirPermissaoDeNotificacao } from '@/servicos/alertas/notificacoes';
import { ErroCadastro } from '@/servicos/armazenamento/usuariosServico';
import { mascararCep, mascararTelefone } from '@/utilitarios/mascaras';
import {
  semErros,
  validarCep,
  validarConfirmacaoSenha,
  validarEmail,
  validarNome,
  validarSenha,
  validarTelefone,
  type Validacao,
} from '@/utilitarios/validacoes';

import { estilos } from './estilos';

const SEM_ERROS = {
  nome: null,
  email: null,
  telefone: null,
  cep: null,
  senha: null,
  confirmacao: null,
  consentimento: null,
} satisfies Record<string, Validacao>;

export default function TelaCadastro() {
  const { cadastrar } = useAutenticacao();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cep, setCep] = useState('');
  const [tipoCidadao, setTipoCidadao] = useState<TipoCidadao>('morador');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [consentimento, setConsentimento] = useState(false);
  const [erros, setErros] = useState<Record<keyof typeof SEM_ERROS, Validacao>>(SEM_ERROS);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    const novosErros = {
      nome: validarNome(nome),
      email: validarEmail(email),
      telefone: validarTelefone(telefone),
      cep: validarCep(cep),
      senha: validarSenha(senha),
      confirmacao: validarConfirmacaoSenha(senha, confirmacao),
      consentimento: consentimento ? null : 'É preciso concordar para receber os alertas.',
    };
    setErros(novosErros);
    setErroGeral(null);
    if (!semErros(novosErros)) {
      setErroGeral('Corrija os campos destacados.');
      return;
    }

    setEnviando(true);
    try {
      await pedirPermissaoDeNotificacao().catch(() => false);
      await cadastrar({ nome, email, telefone, cep, tipoCidadao, senha });
    } catch (e) {
      setErroGeral(e instanceof ErroCadastro ? e.message : 'Não foi possível criar a conta.');
      setEnviando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={estilosComuns.tela}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={estilosComuns.conteudo} keyboardShouldPersistTaps="handled">
        <View style={estilosComuns.cartao}>
          <Text style={estilosComuns.tituloSecao} accessibilityRole="header">
            Os quatro níveis de risco
          </Text>
          <ExplicacaoNiveis />
        </View>

        <View style={[estilosComuns.cartao, estilos.formulario]}>
          <Text style={estilosComuns.tituloSecao} accessibilityRole="header">
            Seus dados
          </Text>
          <CampoTexto
            rotulo="Nome"
            valor={nome}
            onMudar={setNome}
            erro={erros.nome}
            autoCapitalize="words"
            autoComplete="name"
            maxLength={60}
          />
          <CampoTexto
            rotulo="E-mail"
            valor={email}
            onMudar={setEmail}
            erro={erros.email}
            placeholder="nome@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <CampoTexto
            rotulo="Celular"
            dica="Para avisos por SMS no futuro."
            valor={telefone}
            onMudar={setTelefone}
            mascara={mascararTelefone}
            erro={erros.telefone}
            placeholder="(11) 91234-5678"
            keyboardType="phone-pad"
            autoComplete="tel"
          />
          <CampoTexto
            rotulo="CEP"
            dica="Usado para indicar os pontos perto de você."
            valor={cep}
            onMudar={setCep}
            mascara={mascararCep}
            erro={erros.cep}
            placeholder="01001-000"
            keyboardType="number-pad"
            autoComplete="postal-code"
          />
          <GrupoOpcoes
            rotulo="Você é"
            opcoes={OPCOES_TIPO_CIDADAO}
            valor={tipoCidadao}
            onMudar={setTipoCidadao}
          />
          <CampoTexto
            rotulo="Senha"
            dica="Pelo menos 8 caracteres, com letras e números."
            valor={senha}
            onMudar={setSenha}
            erro={erros.senha}
            senha
            autoComplete="new-password"
          />
          <CampoTexto
            rotulo="Repita a senha"
            valor={confirmacao}
            onMudar={setConfirmacao}
            erro={erros.confirmacao}
            senha
            autoComplete="new-password"
          />
          <CaixaSelecao
            texto="Concordo que meus dados fiquem salvos neste celular para receber alertas de alagamento."
            marcada={consentimento}
            onMudar={setConsentimento}
            erro={erros.consentimento}
          />
          {erroGeral && <Aviso tipo="erro" texto={erroGeral} />}
          <Botao rotulo="Criar conta" icone="check-circle" ocupado={enviando} onPress={enviar} />
          <Text style={estilosComuns.legenda}>
            Ao criar a conta, vamos pedir permissão para enviar notificações de alerta.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
