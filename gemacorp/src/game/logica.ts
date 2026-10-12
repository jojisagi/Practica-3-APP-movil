/*
	Lógica pura del Match-3 (sin React): tablero, detección de líneas, poderes, gravedad y barajado.
	Al no depender de la UI se puede razonar y probar por separado.

	Reglas:
	- Intercambiar dos gemas vecinas sólo es válido si forma una línea de 3+ iguales.
	- Línea de 4 (o forma L/T)  -> se crea una gema Potenciada (marco de plata): al eliminarse destruye 3x3.
	- Línea de 5 o más           -> se crea una gema Estelar (marco de oro): al eliminarse destruye su color.
	- Intercambiar una Estelar con cualquier gema elimina todas las gemas del color de la otra.
	- Cada cascada sucesiva multiplica los puntos (combo).
*/

export const FILAS = 8;
export const COLUMNAS = 8;
export const NUM_TIPOS = 6;

export const PUNTOS_GEMA = 10;
export const BONO_POTENCIADA = 50;
export const BONO_ESTELAR = 150;

export type Poder = 0 | 1 | 2;
export type Gema = { id: number; tipo: number; poder: Poder; nace?: number };
export type Tablero = (Gema | null)[][];
export type Pos = { f: number; c: number };

let siguienteId = 1;
export function nuevaGema(tipo: number, poder: Poder = 0, nace?: number): Gema {
	return { id: siguienteId++, tipo, poder, nace };
}

const aleatorio = () => Math.floor(Math.random() * NUM_TIPOS);
const clave = (f: number, c: number) => f * COLUMNAS + c;
const desdeClave = (k: number): Pos => ({ f: Math.floor(k / COLUMNAS), c: k % COLUMNAS });
const dentro = (f: number, c: number) => f >= 0 && f < FILAS && c >= 0 && c < COLUMNAS;

export function sonVecinas(a: Pos, b: Pos) {
	return Math.abs(a.f - b.f) + Math.abs(a.c - b.c) === 1;
}

export function copiar(t: Tablero): Tablero {
	return t.map((fila) => fila.slice());
}

export function intercambiar(t: Tablero, a: Pos, b: Pos): Tablero {
	const n = copiar(t);
	[n[a.f][a.c], n[b.f][b.c]] = [n[b.f][b.c], n[a.f][a.c]];
	return n;
}

//Tablero inicial sin líneas formadas y con al menos un movimiento posible
export function crearTablero(): Tablero {
	for (;;) {
		const t: Tablero = [];
		for (let f = 0; f < FILAS; f++) {
			t.push([]);
			for (let c = 0; c < COLUMNAS; c++) {
				let tipo: number;
				do {
					tipo = aleatorio();
				} while (
					(c >= 2 && t[f][c - 1]?.tipo === tipo && t[f][c - 2]?.tipo === tipo) ||
					(f >= 2 && t[f - 1][c]?.tipo === tipo && t[f - 2][c]?.tipo === tipo)
				);
				t[f].push(nuevaGema(tipo, 0, f - FILAS));
			}
		}
		if (hayMovimientos(t)) return t;
	}
}

type Linea = { celdas: Pos[]; tipo: number; horizontal: boolean };

//Busca todas las secuencias horizontales y verticales de 3 o más gemas del mismo tipo
export function buscarLineas(t: Tablero): Linea[] {
	const lineas: Linea[] = [];
	for (const horizontal of [true, false]) {
		const externo = horizontal ? FILAS : COLUMNAS;
		const interno = horizontal ? COLUMNAS : FILAS;
		for (let i = 0; i < externo; i++) {
			let inicio = 0;
			for (let j = 1; j <= interno; j++) {
				const gemaEn = (k: number) => (horizontal ? t[i][k] : t[k][i]);
				const actual = j < interno ? gemaEn(j) : null;
				const previa = gemaEn(inicio);
				if (actual && previa && actual.tipo === previa.tipo) continue;
				if (previa && j - inicio >= 3) {
					const celdas: Pos[] = [];
					for (let k = inicio; k < j; k++) celdas.push(horizontal ? { f: i, c: k } : { f: k, c: i });
					lineas.push({ celdas, tipo: previa.tipo, horizontal });
				}
				inicio = j;
			}
		}
	}
	return lineas;
}

export type ResultadoPaso = {
	tablero: Tablero;
	eliminadas: number;
	puntos: number;
	creadas: Poder[];
	activadas: number;
};

/*
	Resuelve una "ola" de eliminación: quita las líneas, crea gemas de poder y propaga
	las explosiones de las gemas de poder que fueron alcanzadas. Devuelve null si no hay nada que resolver.
	- origen: celdas que el jugador movió (allí se colocan las gemas de poder creadas).
	- forzadas: celdas que se eliminan por un efecto especial (intercambio con Estelar).
*/
export function resolverPaso(t: Tablero, combo: number, origen: Pos[] = [], forzadas: Pos[] = []): ResultadoPaso | null {
	const lineas = buscarLineas(t);
	if (lineas.length === 0 && forzadas.length === 0) return null;

	const eliminar = new Set<number>();
	const crear = new Map<number, { tipo: number; poder: Poder }>();
	const yaActivadas = new Set<number>();
	const enLinea = new Map<number, number>(); //cuántas líneas pasan por cada celda (para detectar L/T)

	for (const linea of lineas) {
		for (const p of linea.celdas) {
			const k = clave(p.f, p.c);
			eliminar.add(k);
			enLinea.set(k, (enLinea.get(k) ?? 0) + 1);
		}
		if (linea.celdas.length >= 4) {
			const enOrigen = linea.celdas.find((p) => origen.some((o) => o.f === p.f && o.c === p.c));
			const pos = enOrigen ?? linea.celdas[Math.floor(linea.celdas.length / 2)];
			const poder: Poder = linea.celdas.length >= 5 ? 2 : 1;
			const k = clave(pos.f, pos.c);
			if ((crear.get(k)?.poder ?? 0) < poder) crear.set(k, { tipo: linea.tipo, poder });
		}
	}
	//Cruce de una línea horizontal y una vertical (forma L o T) -> Potenciada
	for (const [k, n] of enLinea) {
		if (n >= 2 && !crear.has(k)) crear.set(k, { tipo: t[desdeClave(k).f][desdeClave(k).c]!.tipo, poder: 1 });
	}
	for (const p of forzadas) {
		const k = clave(p.f, p.c);
		eliminar.add(k);
		if (t[p.f][p.c]?.poder === 2) yaActivadas.add(k); //la Estelar intercambiada ya hizo su efecto
	}

	//Propagación de explosiones en cadena (búsqueda en anchura)
	const cola = [...eliminar];
	let activadas = 0;
	while (cola.length > 0) {
		const k = cola.shift()!;
		const { f, c } = desdeClave(k);
		const gema = t[f][c];
		if (!gema || gema.poder === 0 || yaActivadas.has(k)) continue;
		yaActivadas.add(k);
		activadas++;
		const alcanzadas: Pos[] = [];
		if (gema.poder === 1) {
			for (let df = -1; df <= 1; df++)
				for (let dc = -1; dc <= 1; dc++) if (dentro(f + df, c + dc)) alcanzadas.push({ f: f + df, c: c + dc });
		} else {
			for (let ff = 0; ff < FILAS; ff++)
				for (let cc = 0; cc < COLUMNAS; cc++) if (t[ff][cc]?.tipo === gema.tipo) alcanzadas.push({ f: ff, c: cc });
		}
		for (const p of alcanzadas) {
			const kk = clave(p.f, p.c);
			if (!eliminar.has(kk)) {
				eliminar.add(kk);
				cola.push(kk);
			}
		}
	}

	const nuevo = copiar(t);
	let eliminadas = 0;
	for (const k of eliminar) {
		const { f, c } = desdeClave(k);
		if (nuevo[f][c]) eliminadas++;
		nuevo[f][c] = null;
	}
	const creadas: Poder[] = [];
	for (const [k, g] of crear) {
		const { f, c } = desdeClave(k);
		nuevo[f][c] = nuevaGema(g.tipo, g.poder);
		creadas.push(g.poder);
		eliminadas--; //la celda donde nace la gema de poder no cuenta como eliminada
	}

	const bono = creadas.reduce<number>((s, p) => s + (p === 2 ? BONO_ESTELAR : BONO_POTENCIADA), 0);
	const puntos = (eliminadas * PUNTOS_GEMA + bono + activadas * 25) * combo;
	return { tablero: nuevo, eliminadas, puntos, creadas, activadas };
}

//Hace caer las gemas hacia los huecos y rellena desde arriba con gemas nuevas
export function aplicarGravedad(t: Tablero): Tablero {
	const n = copiar(t);
	for (let c = 0; c < COLUMNAS; c++) {
		let destino = FILAS - 1;
		for (let f = FILAS - 1; f >= 0; f--) {
			const g = n[f][c];
			if (g) {
				n[f][c] = null;
				n[destino][c] = g;
				destino--;
			}
		}
		const huecos = destino + 1;
		for (let f = destino; f >= 0; f--) n[f][c] = nuevaGema(aleatorio(), 0, f - huecos);
	}
	return n;
}

//Indica si el intercambio a<->b produce algún efecto
export function esIntercambioValido(t: Tablero, a: Pos, b: Pos) {
	if (t[a.f][a.c]?.poder === 2 || t[b.f][b.c]?.poder === 2) return true;
	return buscarLineas(intercambiar(t, a, b)).length > 0;
}

export function buscarMovimiento(t: Tablero): [Pos, Pos] | null {
	for (let f = 0; f < FILAS; f++)
		for (let c = 0; c < COLUMNAS; c++) {
			const a = { f, c };
			for (const b of [{ f, c: c + 1 }, { f: f + 1, c }]) {
				if (dentro(b.f, b.c) && esIntercambioValido(t, a, b)) return [a, b];
			}
		}
	return null;
}

export function hayMovimientos(t: Tablero) {
	return buscarMovimiento(t) !== null;
}

//Celdas que elimina un intercambio con gema Estelar
export function efectoEstelar(t: Tablero, a: Pos, b: Pos): Pos[] {
	const ga = t[a.f][a.c]!;
	const gb = t[b.f][b.c]!;
	const res: Pos[] = [a, b];
	const todo = ga.poder === 2 && gb.poder === 2;
	//tras el intercambio, la estelar está en b si venía de a
	const objetivo = ga.poder === 2 ? gb.tipo : ga.tipo;
	for (let f = 0; f < FILAS; f++)
		for (let c = 0; c < COLUMNAS; c++) if (todo || t[f][c]?.tipo === objetivo) res.push({ f, c });
	return res;
}

//Reacomoda las gemas existentes hasta que haya movimientos y ninguna línea formada
export function barajar(t: Tablero): Tablero {
	const gemas = t.flat().filter((g): g is Gema => g !== null);
	for (let intento = 0; intento < 200; intento++) {
		for (let i = gemas.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[gemas[i], gemas[j]] = [gemas[j], gemas[i]];
		}
		const n: Tablero = [];
		for (let f = 0; f < FILAS; f++) n.push(gemas.slice(f * COLUMNAS, (f + 1) * COLUMNAS));
		if (buscarLineas(n).length === 0 && hayMovimientos(n)) return n;
	}
	return crearTablero();
}
