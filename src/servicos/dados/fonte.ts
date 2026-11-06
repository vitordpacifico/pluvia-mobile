import type { FonteDeDados } from '@/dominio/tipos';

import { criarFonteHttp } from './api';
import { fonteSimulada } from './simulacao';

/**
 * Sem EXPO_PUBLIC_API_URL o app usa dados simulados.
 * Com a variável definida, por exemplo no arquivo .env, usa a API real.
 */
const urlApi = process.env.EXPO_PUBLIC_API_URL?.trim();

export const fonteDeDados: FonteDeDados = urlApi ? criarFonteHttp(urlApi) : fonteSimulada;
