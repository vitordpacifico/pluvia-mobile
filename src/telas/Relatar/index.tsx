import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';

import { Aviso } from '@/componentes/Aviso';
import { Botao } from '@/componentes/Botao';
import { CaixaSelecao } from '@/componentes/CaixaSelecao';
import { CampoTexto } from '@/componentes/CampoTexto';
import { GrupoOpcoes } from '@/componentes/GrupoOpcoes';
import { SeletorLocal, type LocalEscolhido } from '@/componentes/SeletorLocal';
import { useAutenticacao } from '@/contexto/AutenticacaoContext';
import { INFO_STATUS_RELATO, OPCOES_TIPO_EVENTO, ROTULO_TIPO_EVENTO, type Relato, type TipoEvento } from '@/dominio/relato';
import { estilosComuns } from '@/estilos/comuns';
import { fonteDeDados } from '@/servicos/dados/fonte';
import { ErroFoto, escolherFoto, type OrigemFoto } from '@/servicos/dispositivo/fotos';
import { formatarDataHora, formatarHoraCurta } from '@/utilitarios/formato';
import { mascararHora } from '@/utilitarios/mascaras';
import {
  horaParaData,
  semErros,
  TAMANHO_MAXIMO_DESCRICAO,
  validarDescricao,
  validarHoraDoRelato,
  validarReferencia,
  type Validacao,
} from '@/utilitarios/validacoes';

import { estilos } from './estilos';

type Campo = 'local' | 'referencia' | 'hora' | 'descricao' | 'confirmacaoFoto' | 'seguranca';

const SEM_ERROS: Record<Campo, Validacao> = {
  local: null,
  referencia: null,
  hora: null,
  descricao: null,
  confirmacaoFoto: null,
  seguranca: null,
};

export default function TelaRelatar() {
  const { usuario } = useAutenticacao();
  const [tipo, setTipo] = useState<TipoEvento>('RUA_ALAGADA');
  const [local, setLocal] = useState<LocalEscolhido | null>(null);
  const [referencia, setReferencia] = useState('');
  const [hora, setHora] = useState(() => formatarHoraCurta(new Date().toISOString()));
  const [descricao, setDescricao] = useState('');
  const [foto, setFoto] = useState<string | null>(null);
  const [confirmacaoFoto, setConfirmacaoFoto] = useState(false);
  const [seguranca, setSeguranca] = useState(false);
  const [erros, setErros] = useState(SEM_ERROS);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [meus, setMeus] = useState<Relato[]>([]);
  const usuarioId = usuario?.id;

  useFocusEffect(
    useCallback(() => {
      if (!usuarioId) return;
      fonteDeDados
        .listarRelatos({ autorId: usuarioId })
        .then(setMeus)
        .catch(() => setErroGeral('Não foi possível carregar os seus relatos.'));
    }, [usuarioId]),
  );

  async function adicionarFoto(origem: OrigemFoto) {
    setErroGeral(null);
    try {
      const uri = await escolherFoto(origem);
      if (uri) {
        setFoto(uri);
        setConfirmacaoFoto(false);
      }
    } catch (e) {
      setErroGeral(e instanceof ErroFoto ? e.message : 'Não foi possível abrir a foto.');
    }
  }

  function limpar() {
    setTipo('RUA_ALAGADA');
    setLocal(null);
    setReferencia('');
    setHora(formatarHoraCurta(new Date().toISOString()));
    setDescricao('');
    setFoto(null);
    setConfirmacaoFoto(false);
    setSeguranca(false);
    setErros(SEM_ERROS);
  }

  async function enviar() {
    if (!usuarioId) return;
    const agora = new Date();
    const novosErros: Record<Campo, Validacao> = {
      local: local ? null : 'Escolha onde foi: use a localização ou um bairro.',
      referencia: validarReferencia(referencia),
      hora: validarHoraDoRelato(hora, agora),
      descricao: validarDescricao(descricao, tipo === 'OUTRO'),
      confirmacaoFoto: foto && !confirmacaoFoto ? 'Confirme que a foto é atual e do local indicado.' : null,
      seguranca: seguranca ? null : 'Só envie o relato se você estiver em um lugar seguro.',
    };
    setErros(novosErros);
    const ocorridoEm = horaParaData(hora, agora);
    if (!semErros(novosErros) || !local || !ocorridoEm) {
      setErroGeral('Confira os campos destacados.');
      return;
    }

    setErroGeral(null);
    setEnviando(true);
    try {
      const relato = await fonteDeDados.enviarRelato(usuarioId, {
        tipo,
        descricao: descricao.trim(),
        bairro: local.bairro,
        referencia: referencia.trim(),
        local: local.local,
        ocorridoEm: ocorridoEm.toISOString(),
        fotoUri: foto,
      });
      limpar();
      router.push({ pathname: '/relato/[id]', params: { id: relato.id } });
    } catch (e) {
      setErroGeral(e instanceof Error ? e.message : 'Não foi possível enviar o relato.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <ScrollView style={estilosComuns.tela} contentContainerStyle={estilosComuns.conteudo} keyboardShouldPersistTaps="handled">
      <Text style={estilosComuns.titulo} accessibilityRole="header">
        Relatar alagamento
      </Text>
      <Aviso
        tipo="aviso"
        texto="Fotografe só se estiver em segurança. Nunca entre na água para tirar a foto."
      />

      <GrupoOpcoes rotulo="O que você viu?" opcoes={OPCOES_TIPO_EVENTO} valor={tipo} onMudar={setTipo} />
      <SeletorLocal rotulo="Onde foi?" valor={local} onMudar={setLocal} erro={erros.local} />
      <CampoTexto
        rotulo="Rua ou ponto de referência"
        valor={referencia}
        onMudar={setReferencia}
        erro={erros.referencia}
        placeholder="Ex.: Rua dos Patriotas, perto da praça"
        maxLength={80}
      />
      <CampoTexto
        rotulo="Hora em que viu"
        dica="Formato 24 horas, por exemplo 14:30"
        valor={hora}
        onMudar={setHora}
        mascara={mascararHora}
        erro={erros.hora}
        keyboardType="number-pad"
        maxLength={5}
      />
      <CampoTexto
        rotulo={tipo === 'OUTRO' ? 'Descrição' : 'Descrição (opcional)'}
        valor={descricao}
        onMudar={setDescricao}
        erro={erros.descricao}
        dica={`Até ${TAMANHO_MAXIMO_DESCRICAO} caracteres. Não escreva placas nem nomes de pessoas.`}
        multiline
        maxLength={TAMANHO_MAXIMO_DESCRICAO}
      />

      <View style={estilosComuns.cartao}>
        <Text style={estilosComuns.tituloSecao}>Foto (opcional)</Text>
        <Text style={estilos.detalhe}>
          A IA faz uma triagem da foto. Antes do envio, o app apaga a localização e os outros dados escondidos da
          imagem.
        </Text>
        {foto ? (
          <>
            <Image source={{ uri: foto }} style={estilos.foto} accessibilityLabel="Foto escolhida para o relato" />
            <Botao rotulo="Remover foto" icone="close" variante="link" onPress={() => setFoto(null)} />
            <CaixaSelecao
              texto="Confirmo que a foto é de agora e do local indicado"
              marcada={confirmacaoFoto}
              onMudar={setConfirmacaoFoto}
              erro={erros.confirmacaoFoto}
            />
          </>
        ) : (
          <View style={estilos.botoes}>
            <Botao rotulo="Tirar foto" icone="camera" variante="secundario" onPress={() => adicionarFoto('camera')} />
            <Botao rotulo="Da galeria" icone="image" variante="secundario" onPress={() => adicionarFoto('galeria')} />
          </View>
        )}
      </View>

      <CaixaSelecao
        texto="Estou em um lugar seguro"
        marcada={seguranca}
        onMudar={setSeguranca}
        erro={erros.seguranca}
      />
      {erroGeral && <Aviso tipo="erro" texto={erroGeral} />}
      <Botao
        rotulo={enviando ? 'Enviando e analisando…' : 'Enviar relato'}
        icone="send"
        ocupado={enviando}
        onPress={enviar}
      />
      <Text style={estilos.detalhe}>
        O relato fica em análise até a equipe conferir. Se for publicado, aparece no mapa como relato comunitário,
        nunca como registro oficial.
      </Text>

      <Text style={estilosComuns.tituloSecao} accessibilityRole="header">
        Meus relatos ({meus.length})
      </Text>
      {meus.length === 0 && <Text style={estilos.detalhe}>Você ainda não enviou relatos.</Text>}
      {meus.map((relato) => (
        <Pressable
          key={relato.id}
          onPress={() => router.push({ pathname: '/relato/[id]', params: { id: relato.id } })}
          accessibilityRole="button"
          accessibilityLabel={`${ROTULO_TIPO_EVENTO[relato.tipo]} em ${relato.bairro}, ${INFO_STATUS_RELATO[relato.status].rotulo}`}
          style={({ pressed }) => [estilosComuns.cartao, pressed && estilos.pressionado]}
        >
          <Text style={estilos.relatoTitulo}>
            {ROTULO_TIPO_EVENTO[relato.tipo]} · {relato.bairro}
          </Text>
          <Text style={estilos.status}>{INFO_STATUS_RELATO[relato.status].rotulo}</Text>
          <Text style={estilos.detalhe}>Enviado em {formatarDataHora(relato.enviadoEm)}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
