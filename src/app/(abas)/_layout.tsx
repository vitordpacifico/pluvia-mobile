import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router/js-tabs';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import { Marca } from '@/componentes/Marca';
import { useAutenticacao } from '@/contexto/AutenticacaoContext';
import { useAvisos } from '@/contexto/AvisosContext';
import { ehAgente, ehCidadao } from '@/dominio/usuario';
import { cores } from '@/estilos/tema';

type NomeIcone = ComponentProps<typeof MaterialCommunityIcons>['name'];

const estilos = StyleSheet.create({
  icone: { width: 52, height: 30, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  iconeAtivo: { backgroundColor: cores.primariaSuave },
});

function icone(nome: NomeIcone) {
  return function Icone({ focused }: { focused: boolean; size: number }) {
    return (
      <View style={[estilos.icone, focused && estilos.iconeAtivo]}>
        <MaterialCommunityIcons name={nome} color={focused ? cores.primaria : cores.textoSecundario} size={22} />
      </View>
    );
  };
}

export default function LayoutAbas() {
  const { usuario } = useAutenticacao();
  const { naoLidos } = useAvisos();
  const descricaoAvisos = naoLidos > 0 ? `Avisos, ${naoLidos} não lidos` : 'Avisos';

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: cores.primaria },
        headerShadowVisible: false,
        headerTintColor: cores.textoSobrePrimaria,
        headerTitleAlign: 'left',
        headerTitle: () => <Marca largura={84} />,
        tabBarActiveTintColor: cores.primaria,
        tabBarInactiveTintColor: cores.textoSecundario,
        tabBarLabelStyle: { fontWeight: '700', fontSize: 11 },
        tabBarStyle: {
          height: 66,
          paddingTop: 6,
          paddingBottom: 8,
          borderTopWidth: 0,
          backgroundColor: cores.superficie,
          boxShadow: '0 -4px 16px rgba(17, 24, 39, 0.06)',
        },
        sceneStyle: { backgroundColor: cores.fundo },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mapa',
          tabBarAccessibilityLabel: 'Mapa de alagamentos',
          tabBarIcon: icone('map-marker-radius'),
        }}
      />
      <Tabs.Protected guard={ehCidadao(usuario)}>
        <Tabs.Screen
          name="carro"
          options={{ title: 'Meu carro', tabBarAccessibilityLabel: 'Meu carro', tabBarIcon: icone('car') }}
        />
        <Tabs.Screen
          name="relatar"
          options={{
            title: 'Relatar',
            tabBarAccessibilityLabel: 'Enviar relato com foto',
            tabBarIcon: icone('camera'),
          }}
        />
        <Tabs.Screen
          name="avisos"
          options={{
            title: 'Avisos',
            tabBarAccessibilityLabel: descricaoAvisos,
            tabBarBadge: naoLidos > 0 ? naoLidos : undefined,
            tabBarBadgeStyle: { backgroundColor: cores.perigo, color: cores.textoSobrePrimaria },
            tabBarIcon: icone('bell'),
          }}
        />
      </Tabs.Protected>
      <Tabs.Protected guard={ehAgente(usuario)}>
        <Tabs.Screen
          name="moderacao"
          options={{
            title: 'Moderação',
            tabBarAccessibilityLabel: 'Moderação de relatos',
            tabBarIcon: icone('account-check'),
          }}
        />
        <Tabs.Screen
          name="painel"
          options={{
            title: 'Painel',
            tabBarAccessibilityLabel: 'Painel da equipe',
            tabBarIcon: icone('view-dashboard'),
          }}
        />
      </Tabs.Protected>
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarAccessibilityLabel: 'Perfil e configurações',
          tabBarIcon: icone('account-circle'),
        }}
      />
    </Tabs>
  );
}
