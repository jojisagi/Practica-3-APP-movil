/*
	Pantalla de presentación: nombre, propósito, instrucciones y acceso al juego y créditos.
*/
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Boton, Pantalla, Tarjeta } from '@/components/ui';
import { GEMAS, MARCOS, MOVIMIENTOS_POR_PARTIDA, NIVELES } from '@/game/recursos';
import { leerMejorPuntaje } from '@/store/records';
import { colores, espacio, radio, tipografia } from '@/theme/tema';

const INSTRUCCIONES = [
	'Desliza una gema hacia su vecina (o toca dos gemas contiguas) para intercambiarlas.',
	'Alinea 3 o más gemas iguales en fila o columna para eliminarlas y ganar puntos.',
	'Las gemas que caen pueden formar nuevas líneas: cada cascada multiplica tus puntos.',
	`Tienes ${MOVIMIENTOS_POR_PARTIDA} movimientos. Los intercambios que no forman línea no cuentan.`,
];

export default function Inicio() {
	const [mejor, setMejor] = useState(0);

	//se vuelve a leer el récord cada vez que la pantalla recupera el foco
	useFocusEffect(
		useCallback(() => {
			leerMejorPuntaje().then(setMejor);
		}, []),
	);

	return (
		<Pantalla>
			<Animated.View entering={FadeInDown.duration(500)} style={styles.encabezado}>
				<View style={styles.filaGemas}>
					{GEMAS.map((g) => (
						<Image key={g.nombre} source={g.imagen} style={styles.gemaLogo} />
					))}
				</View>
				<Text style={tipografia.titulo}>
					Gema<Text style={{ color: colores.primario }}>Corp</Text>
				</Text>
				<Text style={[tipografia.cuerpo, styles.centro]}>
					Un Match-3 para tus pausas activas: despeja la mente unos minutos, combina los valores de tu equipo y
					vuelve al trabajo con energía.
				</Text>
				{mejor > 0 && (
					<View style={styles.record}>
						<Text style={styles.recordTexto}>🏆 Mejor puntaje: {mejor.toLocaleString('es-MX')}</Text>
					</View>
				)}
			</Animated.View>

			<Animated.View entering={FadeInDown.delay(120).duration(500)} style={{ gap: espacio.m }}>
				<Boton titulo="Jugar" icono="play" onPress={() => router.push('/juego')} />
				<Boton titulo="Créditos" icono="people" variante="secundario" onPress={() => router.push('/creditos')} />
			</Animated.View>

			<Animated.View entering={FadeInDown.delay(240).duration(500)}>
				<Tarjeta>
					<Text style={tipografia.subtitulo}>Cómo jugar</Text>
					{INSTRUCCIONES.map((t, i) => (
						<View key={i} style={styles.paso}>
							<View style={styles.numero}>
								<Text style={styles.numeroTexto}>{i + 1}</Text>
							</View>
							<Text style={[tipografia.cuerpo, { flex: 1 }]}>{t}</Text>
						</View>
					))}
				</Tarjeta>
			</Animated.View>

			<Animated.View entering={FadeInDown.delay(360).duration(500)}>
				<Tarjeta>
					<Text style={tipografia.subtitulo}>Niveles de poder</Text>
					{NIVELES.map((n, i) => (
						<View key={n.nombre} style={styles.paso}>
							<View style={styles.miniGema}>
								<Image
									source={GEMAS[i === 0 ? 3 : i === 1 ? 0 : 1].imagen}
									style={{ position: 'absolute', inset: i === 0 ? 3 : 8 }}
								/>
								{i > 0 && <Image source={MARCOS[i as 1 | 2]} style={StyleSheet.absoluteFill} />}
							</View>
							<View style={{ flex: 1 }}>
								<Text style={styles.nivelNombre}>{n.nombre}</Text>
								<Text style={tipografia.cuerpo}>{n.descripcion}</Text>
							</View>
						</View>
					))}
				</Tarjeta>
			</Animated.View>

			<Animated.View entering={FadeInDown.delay(480).duration(500)}>
				<Tarjeta>
					<Text style={tipografia.subtitulo}>Los valores del equipo</Text>
					<View style={styles.valores}>
						{GEMAS.map((g) => (
							<View key={g.nombre} style={styles.valor}>
								<Image source={g.imagen} style={{ width: 28, height: 28 }} />
								<Text style={styles.valorTexto}>{g.valor}</Text>
							</View>
						))}
					</View>
				</Tarjeta>
			</Animated.View>
		</Pantalla>
	);
}

const styles = StyleSheet.create({
	encabezado: { alignItems: 'center', gap: espacio.s, paddingTop: espacio.xl },
	filaGemas: { flexDirection: 'row', gap: 4, marginBottom: espacio.s },
	gemaLogo: { width: 40, height: 40 },
	centro: { textAlign: 'center' },
	record: {
		marginTop: espacio.s,
		backgroundColor: colores.tarjeta,
		borderRadius: radio.total,
		paddingHorizontal: espacio.l,
		paddingVertical: espacio.s,
		borderWidth: 1,
		borderColor: colores.acento,
	},
	recordTexto: { color: colores.acento, fontWeight: '800' },
	paso: { flexDirection: 'row', alignItems: 'center', gap: espacio.m },
	numero: {
		width: 30,
		height: 30,
		borderRadius: radio.total,
		backgroundColor: colores.primario,
		alignItems: 'center',
		justifyContent: 'center',
	},
	numeroTexto: { color: colores.primarioTexto, fontWeight: '900' },
	miniGema: { width: 52, height: 52 },
	nivelNombre: { color: colores.texto, fontWeight: '800', fontSize: 16 },
	valores: { flexDirection: 'row', flexWrap: 'wrap', gap: espacio.s },
	valor: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		backgroundColor: colores.tarjetaClara,
		borderRadius: radio.total,
		paddingVertical: 4,
		paddingLeft: 4,
		paddingRight: espacio.m,
	},
	valorTexto: { color: colores.texto, fontWeight: '700', fontSize: 13 },
});
