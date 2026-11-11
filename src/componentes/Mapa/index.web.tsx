import { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';

import { estadoExibido, INFO_ESTADO, type Ocorrencia } from '@/dominio/ocorrencia';
import { INFO_FAIXA } from '@/dominio/riscoEstimado';
import { cores } from '@/estilos/tema';

import { COR_AREA_RISCO, COR_PINO, estilos } from './estilos';
import type { PropsMapa } from './index';

const LEAFLET = 'https://unpkg.com/leaflet@1.9.4/dist';

const PAGINA = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="stylesheet" href="${LEAFLET}/leaflet.css" />
<style>
  html, body, #mapa { margin: 0; height: 100%; font-family: system-ui, sans-serif; }
  .popup b { display: block; font-size: 15px; margin-bottom: 2px; }
  .popup span { display: block; color: #454B52; margin-bottom: 6px; }
  .popup button { background: ${cores.primaria}; color: #fff; border: 0; border-radius: 8px; padding: 8px 12px;
    font-weight: 700; cursor: pointer; }
  .local { background: ${cores.primaria}; color: #fff; border: 2px solid #fff; border-radius: 999px;
    width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px;
    box-shadow: 0 1px 4px rgba(0,0,0,.4); }
</style>
</head>
<body>
<div id="mapa"></div>
<script src="${LEAFLET}/leaflet.js"></script>
<script>
  const mapa = L.map('mapa', { zoomControl: true }).setView([-23.57, -46.61], 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap',
  }).addTo(mapa);
  const camada = L.layerGroup().addTo(mapa);
  let centroAtual = '';
  let ultimosDados = '';
  function escapar(texto) {
    return String(texto).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  }
  window.addEventListener('message', (evento) => {
    const dados = evento.data;
    if (!dados || dados.tipo !== 'pluvia-dados') return;
    const centro = dados.centro.lat + ',' + dados.centro.lng;
    if (centro !== centroAtual) {
      centroAtual = centro;
      mapa.setView([dados.centro.lat, dados.centro.lng], 14);
    }
    const chave = JSON.stringify([dados.riscos, dados.locais, dados.ocorrencias]);
    if (chave === ultimosDados) return;
    ultimosDados = chave;
    camada.clearLayers();
    for (const r of dados.riscos) {
      L.circle([r.lat, r.lng], { radius: r.raio, color: r.borda, weight: 1, fillColor: r.cor, fillOpacity: 1 }).addTo(camada);
    }
    for (const l of dados.locais) {
      L.circle([l.lat, l.lng], { radius: l.raio, color: '${cores.primaria}', weight: 2, fillOpacity: 0.06 }).addTo(camada);
      L.marker([l.lat, l.lng], {
        icon: L.divIcon({ className: '', html: '<div class="local">' + (l.carro ? '🚗' : '★') + '</div>', iconSize: [30, 30], iconAnchor: [15, 15] }),
        title: l.nome,
      }).bindTooltip(escapar(l.nome)).addTo(camada);
    }
    for (const o of dados.ocorrencias) {
      const pino = L.circleMarker([o.lat, o.lng], { radius: 10, color: '#fff', weight: 2, fillColor: o.cor, fillOpacity: 1 });
      pino.bindPopup('<div class="popup"><b>' + escapar(o.titulo) + '</b><span>' + escapar(o.estado) + '</span><span>' +
        escapar(o.local) + '</span><button data-id="' + escapar(o.id) + '">Ver detalhes</button></div>');
      pino.addTo(camada);
    }
  });
  document.addEventListener('click', (evento) => {
    const botao = evento.target.closest('button[data-id]');
    if (botao) parent.postMessage({ tipo: 'pluvia-abrir', id: botao.dataset.id }, '*');
  });
  parent.postMessage({ tipo: 'pluvia-pronto' }, '*');
</script>
</body>
</html>`;

export function Mapa({ centro, ocorrencias, riscos, locais, onSelecionar }: PropsMapa) {
  const quadro = useRef<HTMLIFrameElement>(null);
  const [pronto, setPronto] = useState(false);
  const porId = useRef<Map<string, Ocorrencia>>(new Map());
  const selecionar = useRef(onSelecionar);

  useEffect(() => {
    selecionar.current = onSelecionar;
    porId.current = new Map(ocorrencias.map((o) => [o.id, o]));
  }, [onSelecionar, ocorrencias]);

  const dados = useMemo(
    () => ({
      tipo: 'pluvia-dados',
      centro: { lat: centro.latitude, lng: centro.longitude },
      ocorrencias: ocorrencias.map((o) => {
        const estado = estadoExibido(o);
        return {
          id: o.id,
          lat: o.local.latitude,
          lng: o.local.longitude,
          titulo: o.titulo,
          estado: INFO_ESTADO[estado].rotulo,
          local: `${o.referencia}, ${o.bairro}`,
          cor: COR_PINO[estado],
        };
      }),
      riscos: riscos.map((r) => ({
        lat: r.centro.latitude,
        lng: r.centro.longitude,
        raio: r.raioM,
        cor: COR_AREA_RISCO[r.faixa],
        borda: INFO_FAIXA[r.faixa].corTexto,
      })),
      locais: locais.map((l) => ({
        lat: l.local.latitude,
        lng: l.local.longitude,
        raio: l.raioM,
        nome: l.nome,
        carro: l.tipo === 'CARRO',
      })),
    }),
    [centro, ocorrencias, riscos, locais],
  );

  useEffect(() => {
    function receber(evento: MessageEvent) {
      if (evento.source !== quadro.current?.contentWindow) return;
      const mensagem = evento.data as { tipo?: string; id?: string };
      if (mensagem?.tipo === 'pluvia-pronto') setPronto(true);
      if (mensagem?.tipo === 'pluvia-abrir' && mensagem.id) {
        const ocorrencia = porId.current.get(mensagem.id);
        if (ocorrencia) selecionar.current(ocorrencia);
      }
    }
    window.addEventListener('message', receber);
    return () => window.removeEventListener('message', receber);
  }, []);

  useEffect(() => {
    if (pronto) quadro.current?.contentWindow?.postMessage(dados, '*');
  }, [pronto, dados]);

  return (
    <View style={estilos.moldura} accessibilityLabel="Mapa com as ocorrências. A mesma informação está na lista abaixo.">
      <iframe ref={quadro} srcDoc={PAGINA} title="Mapa de alagamentos" style={{ border: 0, width: '100%', height: '100%' }} />
    </View>
  );
}
