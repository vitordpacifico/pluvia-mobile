import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Aviso } from '@/componentes/Aviso';
import { Botao } from '@/componentes/Botao';
import { GraficoNivel } from '@/componentes/GraficoNivel';
import { SeloRisco } from '@/componentes/SeloRisco';
import { useAutenticacao } from '@/contexto/AutenticacaoContext';
import { useDados } from '@/contexto/DadosContext';
import { dadosDesatualizados, EXPLICACAO_REGRA_DE_CONFIRMACAO, INFO_RISCO } from '@/dominio/risco';
import type { Leitura, NivelRisco } from '@/dominio/tipos';
import { ehAgente } from '@/dominio/usuario';
import { estilosComuns } from '@/estilos/comuns';
import { pedirPermissaoDeNotificacao } from '@/servicos/alertas/notificacoes';
import {
  deixarDeSeguir,
  listarPontosSeguidos,
  seguirPonto,
} from '@/servicos/armazenamento/pontosSeguidosServico';
import { fonteDeDados } from '@/servicos/dados/fonte';
import { formatarCm, formatarDataHora } from '@/utilitarios/formato';

import { estilos } from './estilos';

const NIVEIS_COM_LIMITE: Exclude<NivelRisco, 'NORMAL'>[] = ['ATENCAO', 'ALERTA', 'EVACUACAO'];

export default function TelaPonto() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { usuario } = useAutenticacao();
  const { pontos } = useDados();
  const ponto = pontos.find((p) => p.id === id);
  const agente = ehAgente(usuario);

  const [leituras, setLeituras] = useState<Leitura[]>([]);
  const [erroLeituras, setErroLeituras] = useState<string | null>(null);
  const [seguido, setSeguido] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [semPermissao, setSemPermissao] = useState(false);
  const [erroSeguir, setErroSeguir] = useState<string | null>(null);

  useEffect(() => {
    if (!usuario || agente) return;
    listarPontosSeguidos(usuario.id)
      .then((lista) => setSeguido(lista.some((p) => p.pontoId === id)))
      .catch((e) => console.warn('Falha ao ler os pontos seguidos', e));
  }, [usuario, agente, id]);

  const atualizadoEm = ponto?.atualizadoEm;
  useEffect(() => {
    if (!id || !atualizadoEm) return;
    fonteDeDados
      .listarLeituras(id)
      .then((lista) => {
        setLeituras(lista);
        setErroLeituras(null);
      })
      .catch(() => setErroLeituras('Não foi possível carregar o histórico.'));
  }, [id, atualizadoEm]);

  const alternarSeguir = useCallback(async () => {
    if (!ponto || !usuario) return;
    setSalvando(true);
    setErroSeguir(null);
    try {
      if (seguido) {
        await deixarDeSeguir(usuario.id, ponto.id);
        setSeguido(false);
      } else {
        await seguirPonto(usuario.id, ponto);
        setSeguido(true);
        setSemPermissao(!(await pedirPermissaoDeNotificacao().catch(() => false)));
      }
    } catch {
      setErroSeguir('Não foi possível salvar. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }, [ponto, usuario, seguido]);

  if (!ponto) {
    return (
      <View style={estilosComuns.conteudo}>
        <Aviso tipo="aviso" texto="Ponto não encontrado. Volte e tente novamente." />
      </View>
    );
  }

  const info = INFO_RISCO[ponto.risco];

  return (
    <ScrollView contentContainerStyle={estilosComuns.conteudo}>
      <Stack.Screen options={{ title: ponto.nome }} />

      <View style={estilosComuns.cartao}>
        <Text style={estilos.endereco}>
          {ponto.endereco} · {ponto.regiao}
        </Text>
        <View accessibilityLiveRegion="assertive">
          <SeloRisco risco={ponto.risco} grande />
        </View>
        <Text
          style={estilos.nivel}
          accessibilityLabel={`Nível da água: ${formatarCm(ponto.nivelAtualCm)}`}
        >
          {formatarCm(ponto.nivelAtualCm)}
        </Text>
        <Text style={estilosComuns.legenda}>
          Última leitura: {formatarDataHora(ponto.atualizadoEm)}
        </Text>
        {dadosDesatualizados(ponto) && (
          <Aviso
            tipo="aviso"
            texto="O sensor não envia leituras há alguns minutos. A situação real pode ser diferente."
          />
        )}
      </View>

      <View style={[estilosComuns.cartao, { backgroundColor: info.corFundo }]} accessible>
        <Text style={[estilosComuns.tituloSecao, { color: info.corTexto }]} accessibilityRole="header">
          O que fazer agora
        </Text>
        <Text style={[estilos.orientacao, { color: info.corTexto }]}>{info.orientacao}</Text>
      </View>

      {!agente && (
        <View style={estilosComuns.cartao}>
          <Text style={estilosComuns.tituloSecao} accessibilityRole="header">
            Alertas deste ponto
          </Text>
          <Text style={estilosComuns.legenda}>
            {seguido
              ? 'Você recebe um aviso quando o risco aumentar.'
              : 'Ative para receber um aviso quando o risco aumentar.'}
          </Text>
          <Botao
            rotulo={seguido ? 'Desativar alertas' : 'Ativar alertas'}
            icone={seguido ? 'bell-off' : 'bell-ring'}
            variante={seguido ? 'secundario' : 'primario'}
            ocupado={salvando}
            onPress={alternarSeguir}
          />
          {erroSeguir && <Aviso tipo="erro" texto={erroSeguir} />}
          {semPermissao && (
            <Aviso
              tipo="aviso"
              texto="As notificações estão bloqueadas. Os alertas aparecem só na aba Alertas. Libere nas configurações do celular."
            />
          )}
        </View>
      )}

      <View style={estilosComuns.cartao}>
        <Text style={estilosComuns.tituloSecao} accessibilityRole="header">
          Histórico recente
        </Text>
        {erroLeituras ? (
          <Aviso tipo="erro" texto={erroLeituras} />
        ) : (
          <GraficoNivel leituras={leituras} limites={ponto.limites} />
        )}
      </View>

      <View style={estilosComuns.cartao}>
        <Text style={estilosComuns.tituloSecao} accessibilityRole="header">
          Limites deste ponto
        </Text>
        <Text style={estilosComuns.legenda}>
          A partir de quantos centímetros de água cada nível começa.
        </Text>
        <Text style={estilosComuns.legenda}>{EXPLICACAO_REGRA_DE_CONFIRMACAO}</Text>
        {NIVEIS_COM_LIMITE.map((risco) => {
          const cm =
            risco === 'ATENCAO'
              ? ponto.limites.atencaoCm
              : risco === 'ALERTA'
                ? ponto.limites.alertaCm
                : ponto.limites.evacuacaoCm;
          return (
            <View key={risco} style={estilos.limite} accessible>
              <SeloRisco risco={risco} />
              <Text style={estilos.textoLimite}>a partir de {formatarCm(cm)}</Text>
            </View>
          );
        })}
        {agente && (
          <Botao
            rotulo="Ajustar limites"
            icone="tune"
            dica="Abre o formulário para mudar os limites deste ponto"
            onPress={() => router.push({ pathname: '/limites/[id]', params: { id: ponto.id } })}
          />
        )}
      </View>

      <Text style={estilosComuns.rodape}>
        O SENTINELA não substitui as orientações oficiais da Defesa Civil.
      </Text>
    </ScrollView>
  );
}
