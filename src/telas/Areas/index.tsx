import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Aviso } from '@/componentes/Aviso';
import { Botao } from '@/componentes/Botao';
import { CaixaSelecao } from '@/componentes/CaixaSelecao';
import { CampoTexto } from '@/componentes/CampoTexto';
import { Chips } from '@/componentes/Chips';
import { SeletorLocal, type LocalEscolhido } from '@/componentes/SeletorLocal';
import { useAutenticacao } from '@/contexto/AutenticacaoContext';
import { useLocais } from '@/contexto/LocaisContext';
import { formatarDistancia, type RaioMonitoramento } from '@/dominio/geo';
import { MAXIMO_LOCAIS, PREFERENCIAS_PADRAO, type PreferenciasAviso } from '@/dominio/local';
import { estilosComuns } from '@/estilos/comuns';
import { notificacoesPermitidas, pedirPermissaoDeNotificacao } from '@/servicos/alertas/notificacoes';
import { lerPreferencias, salvarPreferencias } from '@/servicos/armazenamento/avisosServico';
import { semErros, validarNomeDoLocal, validarReferencia, type Validacao } from '@/utilitarios/validacoes';

import { estilos } from './estilos';

const OPCOES_RAIO = [
  { valor: '300', rotulo: '300 m' },
  { valor: '500', rotulo: '500 m' },
  { valor: '1000', rotulo: '1 km' },
  { valor: '2000', rotulo: '2 km' },
] as const;

type ValorRaio = (typeof OPCOES_RAIO)[number]['valor'];

export default function TelaAreas() {
  const { usuario } = useAutenticacao();
  const { locais, favoritos, adicionarFavorito, removerLocal } = useLocais();
  const [preferencias, setPreferencias] = useState<PreferenciasAviso>(PREFERENCIAS_PADRAO);
  const [permitidas, setPermitidas] = useState<boolean | null>(null);
  const [nome, setNome] = useState('');
  const [local, setLocal] = useState<LocalEscolhido | null>(null);
  const [referencia, setReferencia] = useState('');
  const [raio, setRaio] = useState<ValorRaio>('500');
  const [erros, setErros] = useState<Record<'nome' | 'local' | 'referencia', Validacao>>({
    nome: null,
    local: null,
    referencia: null,
  });
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  const [salvando, setSalvando] = useState(false);
  const usuarioId = usuario?.id;

  useEffect(() => {
    if (!usuarioId) return;
    lerPreferencias(usuarioId).then(setPreferencias).catch(() => undefined);
    notificacoesPermitidas().then(setPermitidas).catch(() => setPermitidas(false));
  }, [usuarioId]);

  async function mudarPreferencia(chave: keyof PreferenciasAviso, valor: boolean) {
    if (!usuarioId) return;
    const novas = { ...preferencias, [chave]: valor };
    setPreferencias(novas);
    await salvarPreferencias(usuarioId, novas);
  }

  async function ativarNotificacoes() {
    setPermitidas(await pedirPermissaoDeNotificacao().catch(() => false));
  }

  async function adicionar() {
    const novosErros = {
      nome: validarNomeDoLocal(nome),
      local: local ? null : 'Escolha o local: use a localização ou um bairro.',
      referencia: validarReferencia(referencia),
    };
    setErros(novosErros);
    if (!semErros(novosErros) || !local) return;
    setSalvando(true);
    try {
      await adicionarFavorito({
        nome: nome.trim(),
        bairro: local.bairro,
        referencia: referencia.trim(),
        local: local.local,
        raioM: Number(raio) as RaioMonitoramento,
      });
      setNome('');
      setLocal(null);
      setReferencia('');
      setMensagem({ tipo: 'sucesso', texto: 'Local favorito salvo.' });
    } catch (e) {
      setMensagem({ tipo: 'erro', texto: e instanceof Error ? e.message : 'Não foi possível salvar.' });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ScrollView
      style={estilosComuns.tela}
      contentContainerStyle={estilosComuns.conteudo}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      <View style={estilosComuns.cartao}>
        <Text style={estilosComuns.tituloSecao} accessibilityRole="header">
          Quais avisos receber
        </Text>
        <CaixaSelecao
          texto="Novo alagamento perto dos meus locais"
          marcada={preferencias.novos}
          onMudar={(v) => mudarPreferencia('novos', v)}
        />
        <CaixaSelecao
          texto="Ocorrência encerrada perto dos meus locais"
          marcada={preferencias.encerramentos}
          onMudar={(v) => mudarPreferencia('encerramentos', v)}
        />
        <CaixaSelecao
          texto="Risco estimado elevado perto dos meus locais"
          marcada={preferencias.riscoElevado}
          onMudar={(v) => mudarPreferencia('riscoElevado', v)}
        />
        <CaixaSelecao
          texto="Silenciar notificações (os avisos continuam na aba Avisos)"
          marcada={preferencias.silenciado}
          onMudar={(v) => mudarPreferencia('silenciado', v)}
        />
        {permitidas === false && (
          <>
            <Aviso tipo="aviso" texto="As notificações estão desligadas neste celular." />
            <Botao rotulo="Ativar notificações" icone="bell-ring" variante="secundario" onPress={ativarNotificacoes} />
          </>
        )}
      </View>

      <Text style={estilosComuns.tituloSecao} accessibilityRole="header">
        Áreas monitoradas ({locais.length})
      </Text>
      {locais.length === 0 && (
        <Text style={estilos.detalhe}>Nenhum local salvo. Salve o carro na aba Meu carro ou adicione um favorito.</Text>
      )}
      {locais.map((item) => (
        <View key={item.id} style={estilosComuns.cartao}>
          <Text style={estilos.nome}>
            {item.tipo === 'CARRO' ? 'Carro: ' : 'Favorito: '}
            {item.nome}
          </Text>
          <Text style={estilos.detalhe}>
            {item.referencia} · {item.bairro} · raio de {formatarDistancia(item.raioM)}
          </Text>
          <Botao rotulo={`Remover ${item.nome}`} icone="delete" variante="link" onPress={() => removerLocal(item.id)} />
        </View>
      ))}

      {mensagem && <Aviso tipo={mensagem.tipo} texto={mensagem.texto} />}

      {favoritos.length < MAXIMO_LOCAIS && (
        <View style={estilosComuns.cartao}>
          <Text style={estilosComuns.tituloSecao} accessibilityRole="header">
            Adicionar local favorito
          </Text>
          <CampoTexto
            rotulo="Nome do local"
            valor={nome}
            onMudar={setNome}
            erro={erros.nome}
            placeholder="Ex.: Trabalho, Escola"
            maxLength={30}
          />
          <SeletorLocal rotulo="Onde fica" valor={local} onMudar={setLocal} erro={erros.local} />
          <CampoTexto
            rotulo="Rua ou ponto de referência"
            valor={referencia}
            onMudar={setReferencia}
            erro={erros.referencia}
            maxLength={80}
          />
          <Chips<ValorRaio> rotulo="Avisar num raio de" opcoes={OPCOES_RAIO} valor={raio} onMudar={setRaio} />
          <Botao rotulo="Adicionar local" icone="star-plus" ocupado={salvando} onPress={adicionar} />
        </View>
      )}
      <Text style={estilos.detalhe}>
        Os locais ficam só neste celular, criptografados no cofre do sistema.
      </Text>
    </ScrollView>
  );
}
