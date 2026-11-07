import type { FonteDeDados } from '@/dominio/tipos';

import { criarFonteHttp } from './api';
import { fonteSimulada } from './simulacao';

const urlApi = process.env.EXPO_PUBLIC_API_URL?.trim();

export const fonteDeDados: FonteDeDados = urlApi ? criarFonteHttp(urlApi) : fonteSimulada;
