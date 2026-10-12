/*
	Persistencia local del mejor puntaje con AsyncStorage (incluido en Expo Go).
*/
import AsyncStorage from '@react-native-async-storage/async-storage';

const CLAVE = 'gemacorp.mejorPuntaje';

export async function leerMejorPuntaje(): Promise<number> {
	try {
		return Number(await AsyncStorage.getItem(CLAVE)) || 0;
	} catch {
		return 0;
	}
}

//Guarda el puntaje si supera el récord; devuelve true si fue nuevo récord
export async function registrarPuntaje(puntaje: number): Promise<boolean> {
	const mejor = await leerMejorPuntaje();
	if (puntaje <= mejor) return false;
	try {
		await AsyncStorage.setItem(CLAVE, String(puntaje));
	} catch {
		//si no se puede guardar, el juego sigue funcionando
	}
	return true;
}
