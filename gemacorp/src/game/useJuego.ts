/*
	Hook con el estado de una partida y el ciclo de juego:
	intercambio -> validación -> eliminación -> gravedad -> cascadas -> (barajar si no hay jugadas).
	Las pausas entre pasos dejan que las animaciones de Reanimated se vean.
*/
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import {
	aplicarGravedad,
	barajar,
	buscarMovimiento,
	crearTablero,
	efectoEstelar,
	esIntercambioValido,
	hayMovimientos,
	intercambiar,
	Pos,
	resolverPaso,
	sonVecinas,
	Tablero,
} from './logica';
import { MOVIMIENTOS_POR_PARTIDA } from './recursos';

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));
const SEGUNDOS_PISTA = 7;

function vibrar(tipo: 'ligero' | 'medio' | 'error' | 'exito') {
	if (Platform.OS === 'web') return;
	if (tipo === 'error') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
	else if (tipo === 'exito') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
	else Haptics.impactAsync(tipo === 'ligero' ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium);
}

export type Estadisticas = {
	mejorCombo: number;
	gemasEliminadas: number;
	potenciadas: number;
	estelares: number;
};

export type Aviso = { id: number; texto: string; puntos?: number };

export function useJuego(alTerminar: (puntaje: number, stats: Estadisticas) => void) {
	const [tablero, setTablero] = useState<Tablero>(crearTablero);
	const [puntaje, setPuntaje] = useState(0);
	const [movimientos, setMovimientos] = useState(MOVIMIENTOS_POR_PARTIDA);
	const [seleccion, setSeleccion] = useState<Pos | null>(null);
	const [pista, setPista] = useState<[Pos, Pos] | null>(null);
	const [aviso, setAviso] = useState<Aviso | null>(null);
	const [ocupado, setOcupado] = useState(false);

	//refs: valores actuales dentro del ciclo asíncrono sin esperar al re-render
	const tableroRef = useRef(tablero);
	const puntajeRef = useRef(0);
	const movsRef = useRef(MOVIMIENTOS_POR_PARTIDA);
	const ocupadoRef = useRef(false);
	const stats = useRef<Estadisticas>({ mejorCombo: 0, gemasEliminadas: 0, potenciadas: 0, estelares: 0 });
	const avisoId = useRef(0);

	const ponerTablero = (t: Tablero) => {
		tableroRef.current = t;
		setTablero(t);
	};
	const avisar = (texto: string, puntos?: number) => setAviso({ id: ++avisoId.current, texto, puntos });

	//Pista: tras unos segundos sin jugar se resalta un movimiento posible
	useEffect(() => {
		if (ocupado) return;
		const t = setTimeout(() => setPista(buscarMovimiento(tableroRef.current)), SEGUNDOS_PISTA * 1000);
		return () => clearTimeout(t);
	}, [ocupado, tablero, seleccion]);

	const jugar = useCallback(
		async (a: Pos, b: Pos) => {
			if (ocupadoRef.current || movsRef.current <= 0) return;
			ocupadoRef.current = true;
			setOcupado(true);
			setSeleccion(null);
			setPista(null);

			const original = tableroRef.current;
			const valido = esIntercambioValido(original, a, b);
			let t = intercambiar(original, a, b);
			ponerTablero(t);
			await esperar(200);

			if (!valido) {
				//movimiento incorrecto: las gemas regresan a su lugar y no cuesta movimiento
				vibrar('error');
				ponerTablero(original);
				await esperar(200);
				ocupadoRef.current = false;
				setOcupado(false);
				return;
			}

			movsRef.current -= 1;
			setMovimientos(movsRef.current);

			const estelar = original[a.f][a.c]?.poder === 2 || original[b.f][b.c]?.poder === 2;
			let combo = 1;
			let paso = resolverPaso(t, combo, [a, b], estelar ? efectoEstelar(original, a, b) : []);
			while (paso) {
				ponerTablero(paso.tablero);
				puntajeRef.current += paso.puntos;
				setPuntaje(puntajeRef.current);

				const s = stats.current;
				s.gemasEliminadas += paso.eliminadas;
				s.mejorCombo = Math.max(s.mejorCombo, combo);
				s.potenciadas += paso.creadas.filter((p) => p === 1).length;
				s.estelares += paso.creadas.filter((p) => p === 2).length;

				if (paso.creadas.includes(2)) avisar('¡Gema Estelar!', paso.puntos);
				else if (paso.creadas.includes(1)) avisar('¡Gema Potenciada!', paso.puntos);
				else if (paso.activadas > 0) avisar('¡Explosión!', paso.puntos);
				else if (combo > 1) avisar(`Combo x${combo}`, paso.puntos);
				else avisar('', paso.puntos);
				vibrar(combo > 1 || paso.activadas > 0 ? 'medio' : 'ligero');

				await esperar(220);
				t = aplicarGravedad(paso.tablero);
				ponerTablero(t);
				await esperar(380);
				combo++;
				paso = resolverPaso(t, combo);
			}

			if (!hayMovimientos(t)) {
				avisar('Sin jugadas: barajando…');
				await esperar(500);
				ponerTablero(barajar(t));
				await esperar(400);
			}

			ocupadoRef.current = false;
			setOcupado(false);
			if (movsRef.current <= 0) {
				vibrar('exito');
				await esperar(500);
				alTerminar(puntajeRef.current, { ...stats.current });
			}
		},
		[alTerminar],
	);

	const tocar = useCallback(
		(p: Pos) => {
			if (ocupadoRef.current) return;
			if (!seleccion) return setSeleccion(p);
			if (seleccion.f === p.f && seleccion.c === p.c) return setSeleccion(null);
			if (sonVecinas(seleccion, p)) return void jugar(seleccion, p);
			setSeleccion(p);
		},
		[seleccion, jugar],
	);

	const terminar = () => alTerminar(puntajeRef.current, { ...stats.current });

	return { tablero, puntaje, movimientos, seleccion, pista, aviso, ocupado, jugar, tocar, terminar };
}
