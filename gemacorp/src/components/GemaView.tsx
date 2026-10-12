/*
	Una gema animada del tablero. Se posiciona en absoluto y anima su desplazamiento
	(intercambio y caída) con Reanimated; al desmontarse se encoge (exiting).
*/
import { Image } from 'expo-image';
import { memo, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withSequence,
	withSpring,
	withTiming,
	ZoomIn,
	ZoomOut,
} from 'react-native-reanimated';
import { Gema } from '@/game/logica';
import { GEMAS, MARCOS } from '@/game/recursos';

type Props = {
	gema: Gema;
	fila: number;
	columna: number;
	tam: number;
	seleccionada: boolean;
	pista: boolean;
};

function GemaViewBase({ gema, fila, columna, tam, seleccionada, pista }: Props) {
	//las gemas nuevas empiezan arriba del tablero (fila "nace") y caen a su lugar
	const x = useSharedValue(columna * tam);
	const y = useSharedValue((gema.nace ?? fila) * tam);
	const escala = useSharedValue(1);

	useEffect(() => {
		x.value = withTiming(columna * tam, { duration: 170, easing: Easing.out(Easing.quad) });
		y.value = withSpring(fila * tam, { damping: 16, stiffness: 180, mass: 0.7 });
	}, [fila, columna, tam, x, y]);

	useEffect(() => {
		if (seleccionada) {
			escala.value = withRepeat(withSequence(withTiming(1.12, { duration: 260 }), withTiming(0.96, { duration: 260 })), -1, true);
		} else if (pista) {
			escala.value = withRepeat(withSequence(withTiming(1.1, { duration: 400 }), withTiming(1, { duration: 400 })), -1, true);
		} else {
			escala.value = withTiming(1, { duration: 120 });
		}
	}, [seleccionada, pista, escala]);

	const posicion = useAnimatedStyle(() => ({ left: x.value, top: y.value }));
	const pulso = useAnimatedStyle(() => ({ transform: [{ scale: escala.value }] }));

	const margen = gema.poder > 0 ? tam * 0.17 : tam * 0.08;
	//la vista externa mueve y aplica las animaciones de entrada/salida; la interna sólo escala (pulso)
	return (
		<Animated.View
			style={[styles.gema, { width: tam, height: tam }, posicion]}
			entering={gema.nace === undefined ? ZoomIn.springify() : undefined}
			exiting={ZoomOut.duration(180)}
		>
			<Animated.View style={[StyleSheet.absoluteFill, pulso]}>
				<Image source={GEMAS[gema.tipo].imagen} style={{ position: 'absolute', inset: margen }} contentFit="contain" />
				{gema.poder > 0 && (
					<Image source={MARCOS[gema.poder as 1 | 2]} style={StyleSheet.absoluteFill} contentFit="contain" />
				)}
			</Animated.View>
		</Animated.View>
	);
}

export const GemaView = memo(GemaViewBase);

const styles = StyleSheet.create({
	gema: { position: 'absolute', pointerEvents: 'none' },
});
