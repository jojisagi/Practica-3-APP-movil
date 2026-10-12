/*
	Componentes reutilizables de interfaz: pantalla base, tarjeta, botón y estadística.
*/
import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colores, espacio, radio, sombra, tipografia } from '@/theme/tema';

type PantallaProps = { children: ReactNode; desplazable?: boolean };

//Contenedor con fondo de marca y márgenes seguros (notch, barra de gestos)
export function Pantalla({ children, desplazable = true }: PantallaProps) {
	return (
		<SafeAreaView style={styles.pantalla} edges={['top', 'bottom']}>
			{desplazable ? (
				<ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
					{children}
				</ScrollView>
			) : (
				<View style={[styles.contenido, { flex: 1 }]}>{children}</View>
			)}
		</SafeAreaView>
	);
}

export function Tarjeta({ children, style }: { children: ReactNode; style?: ViewStyle }) {
	return <View style={[styles.tarjeta, style]}>{children}</View>;
}

type BotonProps = {
	titulo: string;
	icono: keyof typeof Ionicons.glyphMap;
	onPress: () => void;
	variante?: 'primario' | 'acento' | 'secundario';
};

export function Boton({ titulo, icono, onPress, variante = 'primario' }: BotonProps) {
	const fondo = { primario: colores.primario, acento: colores.acento, secundario: colores.tarjetaClara }[variante];
	const color = { primario: colores.primarioTexto, acento: colores.acentoTexto, secundario: colores.texto }[variante];
	return (
		<Pressable
			onPress={onPress}
			accessibilityRole="button"
			style={({ pressed }) => [
				styles.boton,
				{ backgroundColor: fondo, opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
			]}
		>
			<Ionicons name={icono} size={22} color={color} />
			<Text style={[styles.botonTexto, { color }]}>{titulo}</Text>
		</Pressable>
	);
}

export function Estadistica({ etiqueta, valor }: { etiqueta: string; valor: string | number }) {
	return (
		<View style={styles.estadistica}>
			<Text style={tipografia.etiqueta}>{etiqueta}</Text>
			<Text style={tipografia.numero}>{valor}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	pantalla: { flex: 1, backgroundColor: colores.fondo },
	contenido: {
		flexGrow: 1,
		width: '100%',
		maxWidth: 480,
		alignSelf: 'center',
		padding: espacio.l,
		gap: espacio.l,
	},
	tarjeta: {
		backgroundColor: colores.tarjeta,
		borderColor: colores.borde,
		borderWidth: 1,
		borderRadius: radio.l,
		padding: espacio.l,
		gap: espacio.m,
		...sombra,
	},
	boton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: espacio.s,
		paddingVertical: 16,
		paddingHorizontal: espacio.l,
		borderRadius: radio.m,
	},
	botonTexto: { fontSize: 17, fontWeight: '800' },
	estadistica: { flex: 1, alignItems: 'center', gap: 2 },
});
