import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { colores } from '@/theme/tema';

//Navegación tipo pila: Inicio -> Juego -> Game Over, y Créditos accesible desde Inicio
export default function RootLayout() {
	return (
		<GestureHandlerRootView style={{ flex: 1, backgroundColor: colores.fondo }}>
			<StatusBar style="light" />
			<Stack
				screenOptions={{
					headerShown: false,
					contentStyle: { backgroundColor: colores.fondo },
					animation: 'fade_from_bottom',
				}}
			>
				<Stack.Screen name="index" />
				<Stack.Screen name="juego" options={{ gestureEnabled: false }} />
				<Stack.Screen name="game-over" options={{ gestureEnabled: false, animation: 'fade' }} />
				<Stack.Screen name="creditos" options={{ animation: 'slide_from_right' }} />
			</Stack>
		</GestureHandlerRootView>
	);
}
