/*
	Pantalla de créditos: equipo, materia, tecnologías y recursos utilizados.
*/
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Boton, Pantalla, Tarjeta } from '@/components/ui';
import { GEMAS } from '@/game/recursos';
import { colores, espacio, tipografia } from '@/theme/tema';

//Editar con los nombres reales del equipo
const EQUIPO = ['Jorge Sánchez Girón'];

const TECNOLOGIAS = [
	'React Native + Expo SDK 57',
	'Expo Router (navegación por archivos)',
	'React Native Reanimated (animaciones)',
	'React Native Gesture Handler (deslizar y tocar)',
	'Expo Haptics (vibración) y AsyncStorage (récord)',
];

export default function Creditos() {
	return (
		<Pantalla>
			<View style={styles.encabezado}>
				<Text style={tipografia.titulo}>Créditos</Text>
				<View style={styles.gemas}>
					{GEMAS.map((g) => (
						<Image key={g.nombre} source={g.imagen} style={{ width: 30, height: 30 }} />
					))}
				</View>
			</View>

			<Tarjeta>
				<Text style={tipografia.etiqueta}>DESARROLLO</Text>
				{EQUIPO.map((n) => (
					<Text key={n} style={styles.nombre}>
						{n}
					</Text>
				))}
				<Text style={tipografia.cuerpo}>Aplicaciones Móviles · Noveno semestre · Práctica 3</Text>
			</Tarjeta>

			<Tarjeta>
				<Text style={tipografia.etiqueta}>TECNOLOGÍAS</Text>
				{TECNOLOGIAS.map((t) => (
					<Text key={t} style={tipografia.cuerpo}>
						• {t}
					</Text>
				))}
			</Tarjeta>

			<Tarjeta>
				<Text style={tipografia.etiqueta}>RECURSOS GRÁFICOS</Text>
				<Text style={tipografia.cuerpo}>
					Gemas, marcos de poder e icono diseñados por el equipo como SVG vectoriales generados por código
					(scripts/generate-assets.py) y exportados a PNG. Iconos de interfaz: Ionicons.
				</Text>
				<Text style={tipografia.etiqueta}>REFERENCIAS</Text>
				<Text style={tipografia.cuerpo}>
					Basado en la app de las Lecciones 15 y 16 (profilepic-expo). Mecánica inspirada en los juegos de tipo
					Match-3 como Bejeweled y Candy Crush.
				</Text>
			</Tarjeta>

			<Boton titulo="Volver" icono="arrow-back" variante="secundario" onPress={() => router.back()} />
		</Pantalla>
	);
}

const styles = StyleSheet.create({
	encabezado: { alignItems: 'center', gap: espacio.s, paddingTop: espacio.xl },
	gemas: { flexDirection: 'row', gap: 6 },
	nombre: { color: colores.texto, fontSize: 18, fontWeight: '800' },
});
