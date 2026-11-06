import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router/js-tabs';

import { useAlertas } from '@/contexto/AlertasContext';
import { useAutenticacao } from '@/contexto/AutenticacaoContext';
import { ehAgente, ehCidadao } from '@/dominio/usuario';
import { cores } from '@/estilos/tema';

/**
 * Abas por perfil:
 * - cidadao: Pontos, Alertas e Perfil;
 * - agente: Pontos, Painel e Perfil.
 */
export default function LayoutAbas() {
  const { usuario } = useAutenticacao();
  const { pendentes } = useAlertas();
  const descricaoAlertas =
    pendentes > 0 ? `Alertas recebidos, ${pendentes} sem confirmação` : 'Alertas recebidos';
  const corIcone = (focado: boolean) => (focado ? cores.primaria : cores.textoSecundario);

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: cores.primaria },
        headerTintColor: cores.textoSobrePrimaria,
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: cores.primaria,
        tabBarInactiveTintColor: cores.textoSecundario,
        tabBarLabelStyle: { fontWeight: '600' },
        sceneStyle: { backgroundColor: cores.fundo },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Pontos',
          headerTitle: 'SENTINELA',
          tabBarAccessibilityLabel: 'Pontos monitorados',
          tabBarIcon: ({ focused, size }) => (
            <MaterialCommunityIcons name="water" color={corIcone(focused)} size={size} />
          ),
        }}
      />
      <Tabs.Protected guard={ehCidadao(usuario)}>
        <Tabs.Screen
          name="alertas"
          options={{
            title: 'Alertas',
            tabBarAccessibilityLabel: descricaoAlertas,
            tabBarBadge: pendentes > 0 ? pendentes : undefined,
            tabBarBadgeStyle: { backgroundColor: cores.perigo, color: cores.textoSobrePrimaria },
            tabBarIcon: ({ focused, size }) => (
              <MaterialCommunityIcons name="bell" color={corIcone(focused)} size={size} />
            ),
          }}
        />
      </Tabs.Protected>
      <Tabs.Protected guard={ehAgente(usuario)}>
        <Tabs.Screen
          name="painel"
          options={{
            title: 'Painel',
            tabBarAccessibilityLabel: 'Painel da Defesa Civil',
            tabBarIcon: ({ focused, size }) => (
              <MaterialCommunityIcons name="view-dashboard" color={corIcone(focused)} size={size} />
            ),
          }}
        />
      </Tabs.Protected>
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarAccessibilityLabel: 'Perfil e configurações',
          tabBarIcon: ({ focused, size }) => (
            <MaterialCommunityIcons name="account-circle" color={corIcone(focused)} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
