/*
	Catálogo de gemas. Cada tipo combina un color y una forma distintos y representa
	un valor corporativo, para reforzar el tema "sano, divertido y corporativo" del juego.
*/
export const GEMAS = [
	{ nombre: 'Rubí', valor: 'Pasión', color: '#E11D48', imagen: require('@/assets/gems/rubi.png') },
	{ nombre: 'Zafiro', valor: 'Confianza', color: '#2563EB', imagen: require('@/assets/gems/zafiro.png') },
	{ nombre: 'Esmeralda', valor: 'Crecimiento', color: '#16A34A', imagen: require('@/assets/gems/esmeralda.png') },
	{ nombre: 'Topacio', valor: 'Creatividad', color: '#F59E0B', imagen: require('@/assets/gems/topacio.png') },
	{ nombre: 'Amatista', valor: 'Colaboración', color: '#9333EA', imagen: require('@/assets/gems/amatista.png') },
	{ nombre: 'Diamante', valor: 'Excelencia', color: '#38BDF8', imagen: require('@/assets/gems/diamante.png') },
] as const;

export const MARCOS = {
	1: require('@/assets/gems/marco-plata.png'),
	2: require('@/assets/gems/marco-oro.png'),
} as const;

export const NIVELES = [
	{ nombre: 'Normal', descripcion: 'Línea de 3: +10 por gema.' },
	{ nombre: 'Potenciada', descripcion: 'Línea de 4 o forma L/T. Marco de plata: explota en 3x3.' },
	{ nombre: 'Estelar', descripcion: 'Línea de 5. Marco de oro: elimina todo su color.' },
] as const;

export const MOVIMIENTOS_POR_PARTIDA = 25;

//Rango "corporativo" según el puntaje final
export function rangoPorPuntaje(p: number) {
	if (p >= 6000) return 'Director(a) General de Brillo';
	if (p >= 4000) return 'Gerente de Gemas';
	if (p >= 2500) return 'Líder de Proyecto';
	if (p >= 1200) return 'Analista Senior';
	if (p >= 500) return 'Analista Junior';
	return 'Becario(a) Entusiasta';
}
