/*
	Pantalla de juego: marcador, tablero interactivo y avisos de puntos/combos.
*/
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeOutUp, ZoomIn } from 'react-native-reanimated';
import { TableroView } from '@/components/TableroView';
import { Estadistica, Pantalla, Tarjeta } from '@/components/ui';
import { COLUMNAS } from '@/game/logica';
import { Estadisticas, useJuego } from '@/game/useJuego';
import { colores, espacio, radio, tipografia } from '@/theme/tema';

export default function Juego() {
	const { width } = useWindowDimensions();
	const tam = Math.floor((Math.min(width, 480) - espacio.l * 2 - 14) / COLUMNAS);

	const alTerminar = useCallback((puntaje: number, s: Estadisticas) => {
		router.replace({
			pathname: '/game-over',
			params: {
				puntaje: String(puntaje),
				combo: String(s.mejorCombo),
				gemas: String(s.gemasEliminadas),
				potenciadas: String(s.potenciadas),
				estelares: String(s.estelares),
			},
		});
	}, []);

	const juego = useJuego(alTerminar);

	const confirmarSalida = () => {
		const msg = 'Tu puntaje actual se registrará como final.';
		if (Platform.OS === 'web') {
			if (window.confirm(`¿Terminar la partida?\n${msg}`)) juego.terminar();
			return;
		}
		Alert.alert('¿Terminar la partida?', msg, [
			{ text: 'Seguir jugando', style: 'cancel' },
			{ text: 'Terminar', style: 'destructive', onPress: juego.terminar },
		]);
	};

	return (
		<Pantalla desplazable={false}>
			<View style={styles.barra}>
				<Text style={tipografia.subtitulo}>
					Gema<Text style={{ color: colores.primario }}>Corp</Text>
				</Text>
				<Pressable onPress={confirmarSalida} style={styles.salir} accessibilityLabel="Terminar partida">
					<Ionicons name="flag" size={18} color={colores.texto} />
					<Text style={styles.salirTexto}>Terminar</Text>
				</Pressable>
			</View>

			<Tarjeta style={styles.marcador}>
				<Estadistica etiqueta="PUNTOS" valor={juego.puntaje.toLocaleString('es-MX')} />
				<View style={styles.divisor} />
				<Estadistica etiqueta="MOVIMIENTOS" valor={juego.movimientos} />
			</Tarjeta>

			<View style={styles.zonaAviso}>
				{juego.aviso && (
					<Animated.View
						key={juego.aviso.id}
						entering={ZoomIn.springify()}
						exiting={FadeOutUp.duration(400)}
						style={styles.aviso}
					>
						{!!juego.aviso.texto && <Text style={styles.avisoTexto}>{juego.aviso.texto}</Text>}
						{juego.aviso.puntos !== undefined && <Text style={styles.avisoPuntos}>+{juego.aviso.puntos}</Text>}
					</Animated.View>
				)}
			</View>

			<TableroView
				tablero={juego.tablero}
				tam={tam}
				seleccion={juego.seleccion}
				pista={juego.pista}
				onDeslizar={juego.jugar}
				onTocar={juego.tocar}
			/>

			<Text style={[tipografia.cuerpo, styles.ayuda]}>
				Desliza o toca dos gemas vecinas. Línea de 4 = plata ⚡, línea de 5 = oro ⭐.
			</Text>
		</Pantalla>
	);
}

const styles = StyleSheet.create({
	barra: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
	salir: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		backgroundColor: colores.tarjetaClara,
		paddingHorizontal: espacio.m,
		paddingVertical: espacio.s,
		borderRadius: radio.total,
	},
	salirTexto: { color: colores.texto, fontWeight: '700' },
	marcador: { flexDirection: 'row', alignItems: 'center', paddingVertical: espacio.m },
	divisor: { width: 1, alignSelf: 'stretch', backgroundColor: colores.borde },
	zonaAviso: { height: 36, alignItems: 'center', justifyContent: 'center' },
	aviso: { flexDirection: 'row', alignItems: 'baseline', gap: espacio.s },
	avisoTexto: { color: colores.texto, fontSize: 20, fontWeight: '900' },
	avisoPuntos: { color: colores.acento, fontSize: 24, fontWeight: '900' },
	ayuda: { textAlign: 'center', fontSize: 13 },
});
