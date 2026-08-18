# Comparación de rendimiento antes y después de los índices

## Entorno de prueba

- Base de datos: `metro_afluencia`
- Colección: `afluencia_diaria`
- Documentos: 379,470
- Motor: MongoDB 7.0.37
- Método: `explain("executionStats")`

Las consultas se ejecutaron sin modificar sus filtros, intervalos ni
ordenamientos entre la medición anterior y posterior.

## Resultados

| Consulta | Índice | Plan antes | Plan después | nReturned | Claves antes/después | Documentos antes/después | Tiempo antes/después |
|---|---|---|---|---:|---:|---:|---:|
| Línea 1 durante 2025 | `{ linea: 1, fecha: 1 }` | `COLLSCAN + SORT` | `IXSCAN + FETCH` | 7,300 | 0 / 7,300 | 379,470 / 7,300 | 167 / 35 ms |
| Pantitlán durante 2025 | `{ estacion_id: 1, fecha: 1 }` | `COLLSCAN + SORT` | `IXSCAN + FETCH` | 1,460 | 0 / 1,460 | 379,470 / 1,460 | 129 / 9 ms |
| Top 10 estaciones durante 2025 | `{ fecha: 1 }` | `COLLSCAN` | `IXSCAN + FETCH` | 10 | 0 / 71,175 | 379,470 / 71,175 | 230 / 124 ms |

## Interpretación

### Consulta A

El índice `idx_linea_fecha` permitió localizar directamente los documentos
de la Línea 1 dentro del intervalo de 2025. Los documentos examinados se
redujeron de 379,470 a 7,300.

La etapa independiente `SORT` desapareció porque el orden de los campos del
índice permite recuperar los documentos ordenados por fecha después de
aplicar la igualdad sobre `linea`.

### Consulta B

El índice `idx_estacion_fecha` permitió localizar directamente los documentos
de Pantitlán durante 2025. Los documentos examinados se redujeron de 379,470
a 1,460.

La etapa independiente `SORT` también desapareció porque el índice conserva
el orden temporal dentro de cada `estacion_id`.

### Consulta C

El índice `idx_fecha` redujo el conjunto inicial de 379,470 documentos a los
71,175 correspondientes a 2025.

El índice no elimina las etapas de agrupación y ordenamiento, porque MongoDB
todavía debe sumar la afluencia por estación y ordenar los resultados
agregados para obtener las primeras diez posiciones.

## Alcance de la evidencia

Las tres consultas conservaron la misma cantidad de resultados antes y
después de crear los índices.

Las métricas demuestran una reducción del trabajo en este conjunto de datos
y entorno de prueba. No implican que los mismos índices mejoren cualquier
consulta o carga de trabajo.

Los tiempos de ejecución son orientativos y pueden variar. La evidencia
principal está constituida por el cambio de `COLLSCAN` a `IXSCAN`, la
eliminación del `SORT` independiente en las dos primeras consultas y la
reducción de `totalDocsExamined`.
