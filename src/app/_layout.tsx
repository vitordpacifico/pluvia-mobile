import * as Notifications from 'expo-notifications';
import { SplashScreen, Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AutenticacaoProvider, useAutenticacao } from '@/contexto/AutenticacaoContext';
import { AvisosProvider } from '@/contexto/AvisosContext';
import { DadosProvider } from '@/contexto/DadosContext';
import { LocaisProvider } from '@/contexto/LocaisContext';
import { ehCidadao } from '@/dominio/usuario';
import { cores } from '@/estilos/tema';
import { configurarCanalDeAlertas } from '@/servicos/alertas/notificacoes';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function useAbrirOcorrenciaPelaNotificacao() {
  useEffect(() => {
    const assinatura = Notifications.addNotificationResponseReceivedListener((resposta) => {
      const ocorrenciaId = resposta.notification.request.content.data?.ocorrenciaId;
      if (typeof ocorrenciaId === 'string') {
        router.push({ pathname: '/ocorrencia/[id]', params: { id: ocorrenciaId } });
      }
    });
    return () => assinatura.remove();
  }, []);
}

function Navegacao() {
  const { usuario, carregando } = useAutenticacao();
  useAbrirOcorrenciaPelaNotificacao();

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
        <Stack.Screen name="ocorrencia/[id]" options={{ title: 'Ocorrência' }} />
        <Stack.Screen name="relato/[id]" options={{ title: 'Relato' }} />
      </Stack.Protected>
      <Stack.Protected guard={ehCidadao(usuario)}>
        <Stack.Screen name="areas" options={{ title: 'Áreas monitoradas' }} />
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
        <LocaisProvider>
          <AvisosProvider>
            <StatusBar style="light" />
            <Navegacao />
          </AvisosProvider>
        </LocaisProvider>
      </DadosProvider>
    </AutenticacaoProvider>
  );
}
