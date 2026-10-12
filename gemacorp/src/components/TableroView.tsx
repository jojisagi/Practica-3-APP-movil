/*
	Tablero de juego: dibuja la cuadrícula y las gemas, e interpreta los gestos.
	- Deslizar sobre una gema la intercambia con su vecina en esa dirección.
	- Tocar una gema la selecciona; tocar después una vecina las intercambia.
*/
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { COLUMNAS, FILAS, Pos, Tablero } from '@/game/logica';
import { colores, radio } from '@/theme/tema';
import { GemaView } from './GemaView';

type Props = {
	tablero: Tablero;
	tam: number; //lado de cada celda en px
	seleccion: Pos | null;
	pista: [Pos, Pos] | null;
	onDeslizar: (a: Pos, b: Pos) => void;
	onTocar: (p: Pos) => void;
};

const UMBRAL_DESLIZAR = 14;
const RELLENO = 6; //padding del marco (+1 de borde): las coordenadas del gesto lo incluyen

export function TableroView({ tablero, tam, seleccion, pista, onDeslizar, onTocar }: Props) {
	const celdaEn = (x: number, y: number): Pos | null => {
		const f = Math.floor((y - RELLENO - 1) / tam);
		const c = Math.floor((x - RELLENO - 1) / tam);
		return f >= 0 && f < FILAS && c >= 0 && c < COLUMNAS ? { f, c } : null;
	};

	//runOnJS: los callbacks se ejecutan en el hilo de JS porque modifican estado de React
	const deslizar = Gesture.Pan()
		.runOnJS(true)
		.minDistance(UMBRAL_DESLIZAR)
		.onEnd((e) => {
			const { translationX: dx, translationY: dy } = e;
			//la celda de origen es donde empezó el dedo: posición final menos el desplazamiento
			const a = celdaEn(e.x - dx, e.y - dy);
			if (!a) return;
			const b = Math.abs(dx) > Math.abs(dy) ? { f: a.f, c: a.c + Math.sign(dx) } : { f: a.f + Math.sign(dy), c: a.c };
			if (b.f >= 0 && b.f < FILAS && b.c >= 0 && b.c < COLUMNAS) onDeslizar(a, b);
		});

	const tocar = Gesture.Tap()
		.runOnJS(true)
		.onEnd((e) => {
			const p = celdaEn(e.x, e.y);
			if (p) onTocar(p);
		});

	const lado = tam * COLUMNAS;
	const esPista = (f: number, c: number) => !!pista?.some((p) => p.f === f && p.c === c);

	return (
		<GestureDetector gesture={Gesture.Race(deslizar, tocar)}>
			<View style={[styles.marco, { width: lado + RELLENO * 2 + 2, height: tam * FILAS + RELLENO * 2 + 2 }]} collapsable={false}>
				<View style={{ width: lado, height: tam * FILAS, overflow: 'hidden', borderRadius: radio.m }}>
					{/* fondo tipo tablero de ajedrez */}
					{Array.from({ length: FILAS * COLUMNAS }, (_, i) => {
						const f = Math.floor(i / COLUMNAS);
						const c = i % COLUMNAS;
						const sel = seleccion?.f === f && seleccion?.c === c;
						return (
							<View
								key={i}
								style={{
									position: 'absolute',
									left: c * tam,
									top: f * tam,
									width: tam,
									height: tam,
									backgroundColor: sel ? colores.tarjetaClara : (f + c) % 2 ? colores.celdaA : colores.celdaB,
									borderWidth: sel ? 2 : 0,
									borderColor: colores.primario,
									borderRadius: sel ? radio.s : 0,
								}}
							/>
						);
					})}
					{tablero.map((fila, f) =>
						fila.map((g, c) =>
							g ? (
								<GemaView
									key={g.id}
									gema={g}
									fila={f}
									columna={c}
									tam={tam}
									seleccionada={seleccion?.f === f && seleccion?.c === c}
									pista={esPista(f, c)}
								/>
							) : null,
						),
					)}
				</View>
			</View>
		</GestureDetector>
	);
}

const styles = StyleSheet.create({
	marco: {
		padding: RELLENO,
		borderRadius: radio.l,
		backgroundColor: colores.fondoProfundo,
		borderWidth: 1,
		borderColor: colores.borde,
		alignSelf: 'center',
	},
});
