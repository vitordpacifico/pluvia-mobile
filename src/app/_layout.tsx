import * as Notifications from 'expo-notifications';
import { SplashScreen, Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AlertasProvider } from '@/contexto/AlertasContext';
import { AutenticacaoProvider, useAutenticacao } from '@/contexto/AutenticacaoContext';
import { DadosProvider } from '@/contexto/DadosContext';
import { ehAgente } from '@/dominio/usuario';
import { cores } from '@/estilos/tema';
import { configurarCanalDeAlertas } from '@/servicos/alertas/notificacoes';

// Mantem a tela de abertura ate a sessao ser lida, para nao piscar a tela errada.
SplashScreen.preventAutoHideAsync().catch(() => undefined);

/** Ao tocar na notificacao, abre o ponto que gerou o alerta. */
function useAbrirPontoPelaNotificacao() {
  useEffect(() => {
    const assinatura = Notifications.addNotificationResponseReceivedListener((resposta) => {
      const pontoId = resposta.notification.request.content.data?.pontoId;
      if (typeof pontoId === 'string') {
        router.push({ pathname: '/ponto/[id]', params: { id: pontoId } });
      }
    });
    return () => assinatura.remove();
  }, []);
}

/**
 * Rotas protegidas por login e por perfil:
 * - sem login: so Entrar e Cadastro;
 * - logado: abas e detalhe do ponto;
 * - agente: tambem o formulario de limites.
 */
function Navegacao() {
  const { usuario, carregando } = useAutenticacao();
  useAbrirPontoPelaNotificacao();

  useEffect(() => {
    if (!carregando) SplashScreen.hideAsync().catch(() => undefined);
  }, [carregando]);

  if (carregando) return null;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: cores.primaria },
        headerTintColor: cores.textoSobrePrimaria,
        headerTitleStyle: { fontWeight: '700' },
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: cores.fundo },
      }}
    >
      <Stack.Protected guard={usuario === null}>
        <Stack.Screen name="entrar" options={{ headerShown: false }} />
        <Stack.Screen name="cadastro" options={{ title: 'Criar conta' }} />
      </Stack.Protected>
      <Stack.Protected guard={usuario !== null}>
        <Stack.Screen name="(abas)" options={{ headerShown: false }} />
        <Stack.Screen name="ponto/[id]" options={{ title: 'Ponto monitorado' }} />
      </Stack.Protected>
      <Stack.Protected guard={ehAgente(usuario)}>
        <Stack.Screen name="limites/[id]" options={{ title: 'Ajustar limites' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function LayoutRaiz() {
  useEffect(() => {
    configurarCanalDeAlertas().catch((erro) =>
      console.warn('Falha ao criar o canal de notificações', erro),
    );
  }, []);

  return (
    <AutenticacaoProvider>
      <DadosProvider>
        <AlertasProvider>
          <StatusBar style="light" />
          <Navegacao />
        </AlertasProvider>
      </DadosProvider>
    </AutenticacaoProvider>
  );
}
