# Resultados del análisis geoespacial

## Pregunta

¿Qué estaciones del Metro se encuentran a una distancia máxima de 2 km del Zócalo de la Ciudad de México y cuál fue su afluencia acumulada durante 2025?

## Relación espacial

- Entidad analizada: estaciones del Metro.
- Geometría: GeoJSON `Point`.
- Punto de referencia: Zócalo de la Ciudad de México.
- Coordenadas: `[-99.133331, 19.432781]`.
- Orden de coordenadas: `[longitud, latitud]`.
- Distancia máxima: 2,000 metros.
- Operador utilizado: `$geoNear`.
- Índice utilizado: `idx_estaciones_ubicacion_2dsphere`.

## Resultados

La consulta seleccionó 20 estaciones ubicadas a una distancia máxima de 2 km del Zócalo.

| Estación | Distancia (m) | Afluencia 2025 |
|---|---:|---:|
| Zócalo/Tenochtitlan | 117.71 | 13,446,478 |
| Allende | 483.45 | 9,887,251 |
| San Juan de Letrán | 842.00 | 8,092,273 |
| Pino Suárez | 851.37 | 19,941,218 |
| Isabel la Católica | 853.94 | 4,888,517 |
| Bellas Artes | 916.79 | 15,788,567 |
| Salto del Agua | 1,149.13 | 8,703,713 |
| Merced | 1,190.86 | 12,668,453 |
| Lagunilla | 1,206.79 | 6,643,320 |
| Garibaldi/Lagunilla | 1,353.34 | 8,386,938 |
| Candelaria | 1,439.53 | 9,046,617 |
| Tepito | 1,478.69 | 6,862,870 |
| Juárez | 1,507.22 | 4,788,106 |
| Hidalgo | 1,526.71 | 15,125,126 |
| Doctores | 1,623.05 | 3,580,686 |
| Morelos | 1,689.09 | 3,925,789 |
| Balderas | 1,803.34 | 9,980,648 |
| Fray Servando | 1,832.46 | 2,867,782 |
| San Antonio Abad | 1,870.13 | 5,967,015 |
| Guerrero | 1,872.67 | 4,920,807 |

## Casos de control

Se utilizó **Zócalo/Tenochtitlan** como caso cercano que debía ser incluido en la consulta y **Acatitla** como caso lejano que debía ser excluido.

Las pruebas confirmaron que:

- Zócalo/Tenochtitlan fue incluida correctamente.
- Acatitla fue excluida correctamente.
- Se seleccionaron 20 estaciones.
- La mayor distancia seleccionada fue de 1,872.67 metros.
- Ninguna estación seleccionada supera el límite de 2,000 metros.

## Interpretación

El análisis identificó 20 estaciones del Metro dentro de un radio máximo de 2 km alrededor del Zócalo de la Ciudad de México.

Entre las estaciones seleccionadas, **Pino Suárez** presentó la mayor afluencia acumulada durante 2025, con **19,941,218** registros de afluencia.

La consulta permite combinar la ubicación geográfica de las estaciones con los registros de afluencia para analizar el comportamiento de las estaciones localizadas dentro de la zona definida.

## Limitaciones

La proximidad geográfica al Zócalo no implica necesariamente un menor tiempo de traslado ni una mayor accesibilidad.

La afluencia acumulada permite comparar el volumen registrado entre las estaciones seleccionadas, pero no demuestra que la cercanía al Zócalo sea la causa de una mayor o menor afluencia.

Las distancias corresponden a distancia geoespacial entre coordenadas y no representan la distancia recorrida por la red del Metro.
