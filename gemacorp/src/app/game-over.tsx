/*
	Pantalla de juego terminado: puntaje final, récord, rango corporativo y estadísticas.
*/
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { Boton, Estadistica, Pantalla, Tarjeta } from '@/components/ui';
import { rangoPorPuntaje } from '@/game/recursos';
import { leerMejorPuntaje, registrarPuntaje } from '@/store/records';
import { colores, espacio, radio, tipografia } from '@/theme/tema';

export default function GameOver() {
	const params = useLocalSearchParams<{
		puntaje: string;
		combo: string;
		gemas: string;
		potenciadas: string;
		estelares: string;
	}>();
	const puntaje = Number(params.puntaje) || 0;
	const [nuevoRecord, setNuevoRecord] = useState(false);
	const [mejor, setMejor] = useState(puntaje);

	useEffect(() => {
		registrarPuntaje(puntaje).then(async (esRecord) => {
			setNuevoRecord(esRecord);
			setMejor(await leerMejorPuntaje());
		});
	}, [puntaje]);

	return (
		<Pantalla>
			<View style={styles.centro}>
				<Animated.Text entering={FadeInDown.duration(400)} style={tipografia.titulo}>
					¡Buen trabajo!
				</Animated.Text>
				<Text style={tipografia.cuerpo}>Fin de la pausa activa. Tu rango hoy:</Text>
				<Animated.View entering={ZoomIn.delay(200).springify()} style={styles.rango}>
					<Text style={styles.rangoTexto}>{rangoPorPuntaje(puntaje)}</Text>
				</Animated.View>
			</View>

			<Animated.View entering={FadeInDown.delay(300).duration(400)}>
				<Tarjeta style={{ alignItems: 'center' }}>
					<Text style={tipografia.etiqueta}>PUNTAJE FINAL</Text>
					<Text style={styles.puntaje}>{puntaje.toLocaleString('es-MX')}</Text>
					{nuevoRecord ? (
						<Text style={styles.record}>🏆 ¡Nuevo récord personal!</Text>
					) : (
						<Text style={tipografia.cuerpo}>Mejor puntaje: {mejor.toLocaleString('es-MX')}</Text>
					)}
				</Tarjeta>
			</Animated.View>

			<Animated.View entering={FadeInDown.delay(400).duration(400)}>
				<Tarjeta>
					<View style={styles.fila}>
						<Estadistica etiqueta="GEMAS" valor={params.gemas ?? 0} />
						<Estadistica etiqueta="MEJOR COMBO" valor={`x${params.combo ?? 0}`} />
					</View>
					<View style={styles.fila}>
						<Estadistica etiqueta="⚡ PLATA" valor={params.potenciadas ?? 0} />
						<Estadistica etiqueta="⭐ ORO" valor={params.estelares ?? 0} />
					</View>
				</Tarjeta>
			</Animated.View>

			<Animated.View entering={FadeInDown.delay(500).duration(400)} style={{ gap: espacio.m }}>
				<Boton titulo="Jugar de nuevo" icono="refresh" onPress={() => router.replace('/juego')} />
				<Boton titulo="Inicio" icono="home" variante="secundario" onPress={() => router.dismissTo('/')} />
			</Animated.View>
		</Pantalla>
	);
}

const styles = StyleSheet.create({
	centro: { alignItems: 'center', gap: espacio.s, paddingTop: espacio.xxl },
	rango: {
		backgroundColor: colores.acento,
		borderRadius: radio.total,
		paddingHorizontal: espacio.xl,
		paddingVertical: espacio.s,
	},
	rangoTexto: { color: colores.acentoTexto, fontWeight: '900', fontSize: 17 },
	puntaje: { fontSize: 56, fontWeight: '900', color: colores.acento, fontVariant: ['tabular-nums'] },
	record: { color: colores.primario, fontWeight: '800', fontSize: 16 },
	fila: { flexDirection: 'row', paddingVertical: espacio.s },
});
