# Proyecto-Final-Modulo-6

# Análisis temporal y geoespacial de la afluencia del Metro de la Ciudad de México con MongoDB

## Descripción

Este proyecto se desarrolla como parte del módulo **Conceptos avanzados de bases de datos NoSQL**.

El objetivo es diseñar e implementar una solución documental en **MongoDB** para almacenar, consultar y analizar información histórica de afluencia de la Red del Metro de la Ciudad de México.

El conjunto de datos contiene registros diarios de afluencia desde **2021 hasta abril de 2026**, correspondientes a las **195 estaciones del Metro**, sus respectivas líneas y las categorías de tipo de pago registradas durante el periodo.

El proyecto busca aprovechar las características de MongoDB para realizar consultas y agregaciones, analizar patrones temporales, diseñar una estrategia de indexación basada en patrones reales de consulta, implementar reglas de validación y posteriormente incorporar información geográfica de las estaciones.

---

## Problema

La Red del Metro de la Ciudad de México presenta distintos niveles de afluencia entre líneas y estaciones, los cuales además cambian a través del tiempo.

Debido al volumen de observaciones y a las diferentes dimensiones disponibles —fecha, línea, estación, tipo de pago y afluencia— resulta útil contar con una solución que permita consultar y analizar eficientemente el comportamiento histórico de la demanda.

El proyecto propone utilizar un modelo documental en MongoDB para identificar patrones temporales, estaciones y líneas con mayores niveles de afluencia y cambios relevantes a lo largo del periodo disponible.

Posteriormente, las estaciones serán enriquecidas con coordenadas geográficas para incorporar un componente de análisis espacial mediante GeoJSON.

---

## Usuario potencial

La solución podría ser utilizada por personal dedicado al **análisis y planeación de sistemas de transporte público**.

La información permitiría apoyar tareas como:

* análisis histórico de la afluencia;
* comparación entre líneas y estaciones;
* identificación de estaciones con niveles elevados de demanda;
* detección de cambios relevantes a través del tiempo;
* exploración de la distribución geográfica de la afluencia.

El proyecto no pretende determinar directamente frecuencias de trenes, capacidad operativa u otras decisiones operativas que requieran información adicional no incluida en el conjunto de datos.

---

## Preguntas del proyecto

Inicialmente se plantean las siguientes preguntas:

1. ¿Cómo ha evolucionado la afluencia del Metro de la Ciudad de México entre 2021 y abril de 2026, tanto a nivel general como por línea?

2. ¿Qué líneas y estaciones presentan los mayores niveles de afluencia total y promedio en distintos periodos?

3. ¿En qué meses o fechas se observan los valores máximos y mínimos de afluencia y qué cambios relevantes pueden identificarse a través del tiempo?

4. ¿Cómo ha cambiado la composición de la afluencia según el tipo de pago a lo largo del periodo disponible?

5. ¿Cómo se distribuyen geográficamente las estaciones con mayores niveles de afluencia y qué consultas espaciales pueden realizarse utilizando su ubicación?

---

## Datos

El conjunto de datos contiene actualmente las siguientes variables:

| Campo       | Descripción inicial                  |
| ----------- | ------------------------------------ |
| `fecha`     | Fecha de la observación              |
| `mes`       | Mes correspondiente a la observación |
| `anio`      | Año correspondiente a la observación |
| `linea`     | Línea del Metro                      |
| `estacion`  | Estación del Metro                   |
| `tipo_pago` | Tipo de acceso registrado            |
| `afluencia` | Número de usuarios registrados       |

Las categorías disponibles actualmente para `tipo_pago` son:

* Boleto
* Prepago
* Gratuidad

Durante el periodo analizado la categoría **Boleto deja de aparecer en los registros** debido a cambios ocurridos en el sistema de acceso. Por lo tanto, la ausencia de esta categoría en fechas posteriores no debe interpretarse automáticamente como una afluencia igual a cero.

---

## Componente temporal

El conjunto de datos contiene observaciones diarias desde 2021 hasta abril de 2026.

Durante el modelado en MongoDB se evaluará almacenar `fecha` utilizando el tipo BSON `Date`, permitiendo realizar consultas mediante intervalos temporales y construir indicadores diarios, mensuales y anuales.

---

## Componente geoespacial

Como extensión del conjunto de datos original, se incorporará un catálogo de las estaciones del Metro con sus respectivas coordenadas geográficas.

Las ubicaciones serán representadas mediante GeoJSON utilizando documentos del tipo:

```javascript
{
    type: "Point",
    coordinates: [longitud, latitud]
}
```

Esta información permitirá evaluar el uso de índices `2dsphere` y realizar consultas geoespaciales pertinentes para el problema.

---

# Perfil inicial del conjunto de datos

## Descripción general

El conjunto de datos contiene información diaria de afluencia de la Red del Metro de la Ciudad de México.

El periodo disponible comprende desde el **1 de enero de 2021 hasta el 30 de abril de 2026**.

La base contiene información por fecha, línea, estación y tipo de pago.

---

## Dimensiones del conjunto de datos

| Característica               |  Resultado |
| ---------------------------- | ---------: |
| Registros totales            |  1,138,410 |
| Columnas                     |          7 |
| Fecha inicial                | 2021-01-01 |
| Fecha final                  | 2026-04-30 |
| Fechas distintas             |      1,946 |
| Líneas                       |         12 |
| Combinaciones línea-estación |        195 |
| Nombres únicos de estación   |        163 |
| Tipos de pago                |          3 |

Las categorías registradas en `tipo_pago` son:

* `Boleto`
* `Prepago`
* `Gratuidad`

---

## Columnas originales

| Campo       | Tipo observado en el archivo | Descripción                    |
| ----------- | ---------------------------- | ------------------------------ |
| `fecha`     | fecha representada en CSV    | Fecha de la observación        |
| `mes`       | texto                        | Nombre del mes                 |
| `anio`      | entero                       | Año de la observación          |
| `linea`     | texto                        | Línea del Metro                |
| `estacion`  | texto                        | Nombre de la estación          |
| `tipo_pago` | texto                        | Modalidad de acceso registrada |
| `afluencia` | entero                       | Afluencia registrada           |

Durante la carga en MongoDB se evaluará transformar `fecha` al tipo BSON `Date`.

---

## Integridad inicial

El perfilado inicial permitió observar:

* no existen valores nulos en las columnas;
* no existen registros completamente duplicados;
* no existen duplicados para la combinación lógica `fecha + linea + estacion + tipo_pago`;
* no existen valores negativos de afluencia;
* los valores de `anio` son consistentes con el año contenido en `fecha`;
* los valores de `mes` son consistentes con el mes contenido en `fecha`;
* existen registros para cada día del periodo analizado.

Cada fecha contiene **585 registros**, correspondientes a:

```text
195 combinaciones línea-estación × 3 tipos de pago = 585 registros diarios
```

Por lo tanto:

```text
1,946 días × 195 combinaciones línea-estación × 3 tipos de pago
= 1,138,410 registros
```

Esta cantidad coincide con el número total de filas del conjunto de datos.

---

## Estaciones y líneas

La base contiene **195 combinaciones línea-estación**, pero únicamente **163 nombres de estación distintos**.

Esta diferencia se debe considerar durante el diseño del modelo documental, ya que una estación de correspondencia puede pertenecer a más de una línea.

Será necesario decidir si el catálogo de estaciones representa:

1. una estación física con un arreglo de líneas asociadas; o
2. una combinación específica estación-línea.

Esta decisión también será relevante cuando se incorporen las coordenadas geográficas.

---

## Comportamiento de la categoría Boleto

La categoría `Boleto` se encuentra presente estructuralmente durante todo el periodo analizado.

Sin embargo, el último día con una afluencia positiva registrada para esta categoría es el **17 de febrero de 2024**.

A partir del **18 de febrero de 2024**, los registros correspondientes a `Boleto` permanecen en el conjunto de datos, pero presentan:

```text
afluencia = 0
```

Por lo tanto, estos registros no deben interpretarse como datos faltantes.

Esta característica deberá considerarse al realizar comparaciones históricas por tipo de pago.

---

## Unidad de análisis original

De manera preliminar, una fila del archivo representa:

> La afluencia correspondiente a un tipo de pago, en una combinación específica de estación y línea, durante una fecha determinada.

La llave lógica observada es:

```text
fecha + linea + estacion + tipo_pago
```

No se detectaron duplicados para esta combinación.

---

## Consideraciones para MongoDB

A partir del perfilado se deberán evaluar las siguientes decisiones:

* convertir `fecha` a BSON `Date`;
* determinar si `mes` y `anio` deben almacenarse o derivarse de `fecha`;
* decidir si los tipos de pago deben mantenerse como documentos independientes o integrarse dentro de un arreglo o subdocumento;
* definir la representación de estaciones de correspondencia;
* construir un catálogo de estaciones;
* incorporar coordenadas geográficas;
* representar las ubicaciones mediante GeoJSON `Point`;
* definir las consultas principales antes de diseñar los índices.

---

## Estado

El conjunto de datos presenta una estructura regular y suficiente para continuar con el diseño del modelo documental.

La siguiente etapa consiste en definir formalmente la **unidad de análisis en MongoDB** y comparar alternativas de modelado documental.


