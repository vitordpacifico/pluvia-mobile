import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Aviso } from '@/componentes/Aviso';
import { Botao } from '@/componentes/Botao';
import { CampoTexto } from '@/componentes/CampoTexto';
import { CartaoOcorrencia } from '@/componentes/CartaoOcorrencia';
import { Chips } from '@/componentes/Chips';
import { SeloFaixa } from '@/componentes/SeloEstado';
import { SeletorLocal, type LocalEscolhido } from '@/componentes/SeletorLocal';
import { useDados } from '@/contexto/DadosContext';
import { useLocais } from '@/contexto/LocaisContext';
import { distanciaMetros, formatarDistancia, type Coordenada, type RaioMonitoramento } from '@/dominio/geo';
import { AVISO_SEGURANCA, semDadosRecentes } from '@/dominio/ocorrencia';
import { AVISO_INCERTEZA, riscoNoPonto } from '@/dominio/riscoEstimado';
import { estilosComuns } from '@/estilos/comuns';
import { pedirPermissaoDeNotificacao } from '@/servicos/alertas/notificacoes';
import { semErros, validarReferencia, type Validacao } from '@/utilitarios/validacoes';

import { estilos } from './estilos';

const OPCOES_RAIO = [
  { valor: '300', rotulo: '300 m' },
  { valor: '500', rotulo: '500 m' },
  { valor: '1000', rotulo: '1 km' },
  { valor: '2000', rotulo: '2 km' },
] as const;

type ValorRaio = (typeof OPCOES_RAIO)[number]['valor'];

const RAIO_HISTORICO_M = 500;
const HISTORICO_MS = 72 * 3_600_000;

function useSituacao(ponto: Coordenada | null, raioM: number) {
  const { ocorrencias, riscos, obtidosEm } = useDados();
  return useMemo(() => {
    if (!ponto) return null;
    const agora = obtidosEm?.getTime() ?? 0;
    const perto = ocorrencias
      .map((ocorrencia) => ({ ocorrencia, distanciaM: distanciaMetros(ponto, ocorrencia.local) }))
      .filter(({ distanciaM }) => distanciaM <= raioM);
    const ativas = perto.filter(({ ocorrencia }) => ocorrencia.status === 'ATIVO');
    const historico = ocorrencias.filter(
      (o) =>
        distanciaMetros(ponto, o.local) <= RAIO_HISTORICO_M &&
        agora - Date.parse(o.registradaEm) <= HISTORICO_MS,
    ).length;
    return {
      ativas: ativas.sort((a, b) => a.distanciaM - b.distanciaM),
      semDados: ativas.some(({ ocorrencia }) => semDadosRecentes(ocorrencia, agora)),
      risco: riscoNoPonto(riscos, ponto),
      historico,
    };
  }, [ponto, raioM, ocorrencias, riscos, obtidosEm]);
}

export default function TelaMeuCarro() {
  const { carro, salvarCarro, removerLocal, carregando } = useLocais();
  const [editando, setEditando] = useState(false);
  const [escolhido, setEscolhido] = useState<LocalEscolhido | null>(null);
  const [referencia, setReferencia] = useState('');
  const [raio, setRaio] = useState<ValorRaio>('500');
  const [erros, setErros] = useState<Record<'local' | 'referencia', Validacao>>({ local: null, referencia: null });
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [consulta, setConsulta] = useState<LocalEscolhido | null>(null);

  const situacao = useSituacao(carro?.local ?? null, carro?.raioM ?? 500);
  const situacaoConsulta = useSituacao(consulta?.local ?? null, RAIO_HISTORICO_M);
  const mostrarFormulario = editando || (!carregando && !carro);

  function abrirEdicao() {
    setEscolhido(carro ? { local: carro.local, bairro: carro.bairro, origem: 'bairro' } : null);
    setReferencia(carro?.referencia ?? '');
    setRaio(carro ? (String(carro.raioM) as ValorRaio) : '500');
    setErros({ local: null, referencia: null });
    setEditando(true);
  }

  async function salvar() {
    const novosErros = {
      local: escolhido ? null : 'Escolha onde o carro está: use a localização ou um bairro.',
      referencia: validarReferencia(referencia),
    };
    setErros(novosErros);
    if (!semErros(novosErros) || !escolhido) return;

    setSalvando(true);
    try {
      await salvarCarro({
        nome: 'Meu carro',
        bairro: escolhido.bairro,
        referencia: referencia.trim(),
        local: escolhido.local,
        raioM: Number(raio) as RaioMonitoramento,
      });
      const permitiu = await pedirPermissaoDeNotificacao().catch(() => false);
      setMensagem(
        permitiu
          ? 'Local do carro salvo. Você será avisado de alagamentos e encerramentos no raio escolhido.'
          : 'Local salvo, mas as notificações estão desligadas. Os avisos aparecem na aba Avisos.',
      );
      setEditando(false);
    } catch (e) {
      setMensagem(e instanceof Error ? e.message : 'Não foi possível salvar o local do carro.');
    } finally {
      setSalvando(false);
    }
  }

  async function remover() {
    if (!carro) return;
    await removerLocal(carro.id);
    setMensagem('Local do carro apagado deste celular.');
  }

  return (
    <ScrollView
      style={estilosComuns.tela}
      contentContainerStyle={estilosComuns.conteudo}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      <Text style={estilosComuns.titulo} accessibilityRole="header">
        Meu carro
      </Text>
      {mensagem && <Aviso tipo="sucesso" texto={mensagem} />}

      {carro && !editando && situacao && (
        <View style={estilosComuns.cartao}>
          <Text style={estilosComuns.tituloSecao}>Seu carro está em</Text>
          <Text style={estilos.local}>
            {carro.referencia} · {carro.bairro}
          </Text>
          <Text style={estilos.detalhe}>Você é avisado num raio de {formatarDistancia(carro.raioM)}.</Text>
          {situacao.ativas.length === 0 ? (
            <Aviso
              tipo="info"
              texto={`Nenhum alagamento ativo registrado a até ${formatarDistancia(carro.raioM)}. Isso não garante que a rua esteja segura.`}
            />
          ) : (
            <Aviso
              tipo="erro"
              texto={`${situacao.ativas.length} alagamento(s) ativo(s) a até ${formatarDistancia(carro.raioM)} do carro.`}
            />
          )}
          {situacao.semDados && (
            <Aviso tipo="aviso" texto="Há ocorrência perto sem atualização suficiente. Falta de dados não é sinal de segurança." />
          )}
          {situacao.risco && <SeloFaixa faixa={situacao.risco.faixa} />}
          <View style={estilos.botoes}>
            <Botao rotulo="Atualizar local" icone="map-marker-radius" variante="secundario" onPress={abrirEdicao} />
            <Botao rotulo="Apagar" icone="delete" variante="perigo" onPress={remover} />
          </View>
        </View>
      )}

      {carro && !editando && situacao?.ativas.map(({ ocorrencia, distanciaM }) => (
        <CartaoOcorrencia
          key={ocorrencia.id}
          ocorrencia={ocorrencia}
          distanciaM={distanciaM}
          onPress={() => router.push({ pathname: '/ocorrencia/[id]', params: { id: ocorrencia.id } })}
        />
      ))}

      {mostrarFormulario && (
        <View style={estilosComuns.cartao}>
          <Text style={estilosComuns.tituloSecao} accessibilityRole="header">
            {carro ? 'Atualizar o local do carro' : 'Onde você estacionou?'}
          </Text>
          <SeletorLocal rotulo="Local aproximado" valor={escolhido} onMudar={setEscolhido} erro={erros.local} />
          <CampoTexto
            rotulo="Rua ou ponto de referência"
            valor={referencia}
            onMudar={setReferencia}
            erro={erros.referencia}
            placeholder="Ex.: Rua Lavapés, em frente ao 300"
            maxLength={80}
          />
          <Chips<ValorRaio> rotulo="Avisar num raio de" opcoes={OPCOES_RAIO} valor={raio} onMudar={setRaio} />
          <Text style={estilos.detalhe}>
            O local do carro fica só neste celular, criptografado no cofre do sistema. Ninguém mais vê.
          </Text>
          <Botao rotulo="Salvar local do carro" icone="car" ocupado={salvando} onPress={salvar} />
          {editando && <Botao rotulo="Cancelar" variante="link" onPress={() => setEditando(false)} />}
        </View>
      )}

      <View style={estilosComuns.cartao}>
        <Text style={estilosComuns.tituloSecao} accessibilityRole="header">
          Onde estacionar?
        </Text>
        <Text style={estilos.detalhe}>
          Consulte a exposição de um local a alagamentos antes de estacionar.
        </Text>
        <SeletorLocal rotulo="Local para consultar" valor={consulta} onMudar={setConsulta} />
        {consulta && situacaoConsulta && (
          <View style={estilos.consulta} accessible>
            {situacaoConsulta.risco ? (
              <SeloFaixa faixa={situacaoConsulta.risco.faixa} />
            ) : (
              <Text style={estilos.detalhe}>Sem estimativa de risco para este local.</Text>
            )}
            <Text style={estilosComuns.texto}>
              {situacaoConsulta.ativas.length} alagamento(s) ativo(s) e {situacaoConsulta.historico} registro(s) nos
              últimos 3 dias a até {formatarDistancia(RAIO_HISTORICO_M)}.
            </Text>
            <Text style={estilos.nota}>{AVISO_INCERTEZA}</Text>
            <Text style={estilos.nota}>
              O app não recomenda vagas: confira se é permitido estacionar e se há vaga no local.
            </Text>
          </View>
        )}
      </View>

      <Aviso tipo="aviso" texto={AVISO_SEGURANCA} />
    </ScrollView>
  );
}
