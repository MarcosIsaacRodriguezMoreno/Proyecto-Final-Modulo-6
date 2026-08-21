# Resultados del análisis temporal

## Pregunta

¿Cómo evolucionó la afluencia total del Metro de la Ciudad de México durante 2025?

## Estructura temporal

- Campo temporal: `fecha`.
- Tipo BSON: `Date`.
- Granularidad: diaria.
- Zona horaria utilizada: UTC.
- Periodo analizado: 2025.
- Intervalo utilizado: `[2025-01-01, 2026-01-01)`.
- Índice disponible: `idx_fecha`.

La colección `afluencia_diaria` contiene 379,470 documentos y todas las observaciones almacenan `fecha` utilizando BSON `Date`.

El periodo completo disponible comprende del 1 de enero de 2021 al 30 de abril de 2026.

## Resultados

El pipeline agrupó la afluencia total por mes durante 2025.

| Periodo | Afluencia total |
|---|---:|
| 2025-01 | 96,554,069 |
| 2025-02 | 94,273,723 |
| 2025-03 | 104,863,384 |
| 2025-04 | 97,589,918 |
| 2025-05 | 104,309,186 |
| 2025-06 | 100,152,730 |
| 2025-07 | 103,165,584 |
| 2025-08 | 105,741,529 |
| 2025-09 | 105,273,705 |
| 2025-10 | 115,572,139 |
| 2025-11 | 120,635,447 |
| 2025-12 | 107,239,178 |

Se obtuvieron los 12 periodos mensuales esperados.

## Casos de control

Se realizaron las siguientes comprobaciones:

- `2025-01-01` fue incluida correctamente como límite inferior.
- `2025-12-31` fue incluida correctamente dentro del intervalo.
- `2026-01-01` existe en la base, pero fue excluida correctamente por utilizar `$lt` como límite superior.
- El agrupamiento produjo exactamente 12 meses.

El intervalo utilizado corresponde a:

```text
[inicio, fin)
