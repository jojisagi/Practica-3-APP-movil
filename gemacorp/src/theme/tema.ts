/*
	Identidad visual de GemaCorp: un único lugar para colores, espaciados, tipografía y sombras.
	Todas las pantallas y componentes leen de aquí para mantener una apariencia uniforme.
*/
import { StyleSheet } from 'react-native';

export const colores = {
	fondo: '#0F2A4A', //azul marino corporativo
	fondoProfundo: '#0A1F38',
	tarjeta: '#16365C',
	tarjetaClara: '#1E4470',
	borde: '#2B5584',
	texto: '#F8FAFC',
	textoSuave: '#A9BCD6',
	primario: '#14B8A6', //turquesa: acción principal, "bienestar"
	primarioTexto: '#042F2E',
	acento: '#F59E0B', //ámbar: puntaje y logros
	acentoTexto: '#451A03',
	peligro: '#F43F5E',
	plata: '#CBD5E1',
	oro: '#FBBF24',
	celdaA: '#1A3D66',
	celdaB: '#163659',
};

export const espacio = { xs: 4, s: 8, m: 12, l: 16, xl: 24, xxl: 32 };

export const radio = { s: 10, m: 16, l: 24, total: 999 };

export const tipografia = StyleSheet.create({
	titulo: { fontSize: 38, fontWeight: '900', color: colores.texto, letterSpacing: 0.5 },
	subtitulo: { fontSize: 20, fontWeight: '800', color: colores.texto },
	cuerpo: { fontSize: 15, lineHeight: 22, color: colores.textoSuave },
	etiqueta: { fontSize: 12, fontWeight: '800', letterSpacing: 1.2, color: colores.textoSuave },
	numero: { fontSize: 26, fontWeight: '900', color: colores.acento, fontVariant: ['tabular-nums'] },
});

export const sombra = {
	boxShadow: '0 8px 20px rgba(2, 8, 23, 0.35)',
};
