# GemaCorp

Juego Match-3 para pausas activas en la oficina, hecho con React Native, Expo (SDK 57) y Expo Router.
Práctica 3 · Aplicaciones Móviles.

## Ejecutar en un dispositivo (Expo Go)

```bash
npm install
npx expo start
```

Escanea el código QR con Expo Go (Android) o con la cámara (iOS).

## Mecánica

- Desliza una gema hacia su vecina, o toca dos gemas contiguas, para intercambiarlas.
- Si alineas 3 o más iguales, se eliminan: +10 puntos por gema. Cada cascada multiplica los puntos (combo).
- Con una línea de 4 o una forma L/T se crea una gema **Potenciada** (marco de plata ⚡) que explota en 3x3.
- Con una línea de 5 se crea una gema **Estelar** (marco de oro ⭐) que elimina todo su color.
- Cada partida tiene 25 movimientos. Un intercambio que no forma línea se revierte y no gasta movimiento.

## Estructura

```
src/app/            pantallas (Expo Router): index, juego, game-over, creditos, _layout
src/components/     UI reutilizable (ui.tsx), TableroView (gestos), GemaView (animaciones)
src/game/           logica.ts (reglas puras), useJuego.ts (ciclo de juego), recursos.ts
src/store/          records.ts (mejor puntaje con AsyncStorage)
src/theme/          tema.ts (colores, espaciado, tipografía)
scripts/            generate-assets.py (genera gemas, marcos e icono como SVG -> PNG)
assets/gems, assets/svg   recursos gráficos generados
```
