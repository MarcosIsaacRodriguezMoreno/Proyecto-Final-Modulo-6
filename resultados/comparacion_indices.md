# Comparación de rendimiento antes y después de los índices

## Entorno de prueba

- Base de datos: `metro_afluencia`
- Colección: `afluencia_diaria`
- Documentos: 379,470
- Motor: MongoDB 7.0.37
- Método: `explain("executionStats")`

Las consultas se ejecutaron sin modificar sus filtros, intervalos,
agrupaciones, ordenamientos ni límites entre la medición anterior y
posterior.

## Resultados

| Consulta | Índice | Plan antes | Plan después | Resultados finales | Claves antes/después | Documentos antes/después | Tiempo antes/después |
|---|---|---|---|---:|---:|---:|---:|
| Línea 1 agrupada por fecha durante 2025 | `{ linea: 1, fecha: 1 }` | `COLLSCAN` | `IXSCAN + FETCH` | 365 | 0 / 7,300 | 379,470 / 7,300 | 1,415 / 47 ms |
| Pantitlán agrupado por fecha durante 2025 | `{ estacion_id: 1, fecha: 1 }` | `COLLSCAN` | `IXSCAN + FETCH` | 365 | 0 / 1,460 | 379,470 / 1,460 | 206 / 32 ms |
| Top 10 estaciones durante 2025 | `{ fecha: 1 }` | `COLLSCAN` | `IXSCAN + FETCH` | 10 | 0 / 71,175 | 379,470 / 71,175 | 452 / 175 ms |

## Consulta A: Línea 1 por fecha

La consulta filtra los documentos de la Línea 1 durante 2025,
agrupa por `fecha` y suma `afluencia.total`.

El resultado contiene 365 documentos, uno por cada fecha del año.
Cada documento representa la afluencia total diaria de todas las
estaciones de la Línea 1.

Antes del índice se examinaron 379,470 documentos. Después de crear
`idx_linea_fecha` se examinaron únicamente los 7,300 documentos de
la Línea 1 correspondientes al periodo.

La reducción aproximada de documentos examinados fue de 98.1 %.

Las etapas `$group` y `$sort` permanecen porque MongoDB debe sumar
los valores de todas las estaciones por fecha y ordenar los resultados
agregados.

## Consulta B: Pantitlán por fecha

La consulta filtra los documentos de `pantitlan` durante 2025,
agrupa por `fecha` y suma `afluencia.total`.

El resultado contiene 365 documentos, uno por cada fecha. Cada
resultado integra las cuatro líneas asociadas con la estación física:

```text
1,460 documentos estación-línea
        ↓ agrupación por fecha
365 resultados diarios
