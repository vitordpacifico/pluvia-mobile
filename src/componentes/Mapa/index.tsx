import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';

import type { Coordenada } from '@/dominio/geo';
import type { LocalMonitorado } from '@/dominio/local';
import { estadoExibido, INFO_ESTADO, type Ocorrencia } from '@/dominio/ocorrencia';
import { INFO_FAIXA, type RiscoEstimado } from '@/dominio/riscoEstimado';
import { cores } from '@/estilos/tema';

import { COR_AREA_RISCO, COR_PINO, estilos } from './estilos';

export interface PropsMapa {
  centro: Coordenada;
  ocorrencias: Ocorrencia[];
  riscos: RiscoEstimado[];
  locais: LocalMonitorado[];
  onSelecionar: (ocorrencia: Ocorrencia) => void;
}

const DELTA = { latitudeDelta: 0.05, longitudeDelta: 0.05 };

export function Mapa({ centro, ocorrencias, riscos, locais, onSelecionar }: PropsMapa) {
  const mapa = useRef<MapView>(null);

  useEffect(() => {
    mapa.current?.animateToRegion({ ...centro, ...DELTA }, 400);
  }, [centro]);

  return (
    <View style={estilos.moldura}>
      <MapView
        ref={mapa}
        style={estilos.mapa}
        initialRegion={{ ...centro, ...DELTA }}
        accessibilityLabel="Mapa com as ocorrências. A mesma informação está na lista abaixo."
        toolbarEnabled={false}
      >
        {riscos.map((risco) => (
          <Circle
            key={risco.id}
            center={risco.centro}
            radius={risco.raioM}
            fillColor={COR_AREA_RISCO[risco.faixa]}
            strokeColor={INFO_FAIXA[risco.faixa].corTexto}
            strokeWidth={1}
          />
        ))}
        {locais.map((local) => (
          <Circle
            key={`raio-${local.id}`}
            center={local.local}
            radius={local.raioM}
            fillColor="rgba(0, 46, 204, 0.08)"
            strokeColor={cores.primaria}
            strokeWidth={2}
          />
        ))}
        {locais.map((local) => (
          <Marker
            key={local.id}
            coordinate={local.local}
            title={local.nome}
            description={`Você acompanha um raio de ${local.raioM} m`}
            tracksViewChanges={false}
          >
            <View style={estilos.marcadorLocal}>
              <MaterialCommunityIcons
                name={local.tipo === 'CARRO' ? 'car' : 'star'}
                size={20}
                color={cores.textoSobrePrimaria}
              />
            </View>
          </Marker>
        ))}
        {ocorrencias.map((ocorrencia) => {
          const estado = estadoExibido(ocorrencia);
          const info = INFO_ESTADO[estado];
          return (
            <Marker
              key={ocorrencia.id}
              coordinate={ocorrencia.local}
              title={`${ocorrencia.titulo}: ${info.rotulo}`}
              description={`${ocorrencia.referencia}, ${ocorrencia.bairro}`}
              pinColor={COR_PINO[estado]}
              onCalloutPress={() => onSelecionar(ocorrencia)}
            />
          );
        })}
      </MapView>
    </View>
  );
}
