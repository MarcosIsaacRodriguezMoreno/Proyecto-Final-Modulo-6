# Proyecto-Final-Modulo-6

# Análisis temporal y geoespacial de la afluencia del Metro de la Ciudad de México con MongoDB

## Descripción

Este proyecto se desarrolla como parte del módulo **Conceptos avanzados de bases de datos NoSQL**.

El objetivo es diseñar e implementar una solución documental en **MongoDB** para almacenar, consultar y analizar información histórica de afluencia de la Red del Metro de la Ciudad de México.

El conjunto de datos contiene registros diarios de afluencia desde el **1 de enero de 2021 hasta el 30 de abril de 2026**, con información para **195 combinaciones línea-estación**, correspondientes a **163 nombres de estación distintos**, las 12 líneas de la red y tres categorías de tipo de pago.

El proyecto busca aprovechar las características de MongoDB para realizar consultas y agregaciones, analizar patrones temporales, diseñar una estrategia de indexación basada en patrones reales de consulta, implementar reglas de validación e incorporar información geográfica de las estaciones.

---

## Problema

La Red del Metro de la Ciudad de México presenta distintos niveles de afluencia entre líneas y estaciones, los cuales además cambian a través del tiempo.

Debido al volumen de observaciones y a las diferentes dimensiones disponibles —fecha, línea, estación, tipo de pago y afluencia— resulta útil contar con una solución que permita consultar y analizar eficientemente el comportamiento histórico de la demanda.

El proyecto propone utilizar un modelo documental en MongoDB para identificar patrones temporales, estaciones y líneas con mayores niveles de afluencia, cambios relevantes a lo largo del periodo disponible y diferencias en la proporción de accesos por gratuidad entre estaciones.

Adicionalmente, las estaciones serán enriquecidas con coordenadas geográficas para incorporar un componente de análisis espacial mediante GeoJSON.

---

## Usuario potencial

La solución podría ser utilizada por personal dedicado al **análisis y planeación de sistemas de transporte público**.

La información permitiría apoyar tareas como:

* análisis histórico de la afluencia;
* comparación entre líneas y estaciones;
* identificación de estaciones con niveles elevados de demanda;
* detección de cambios relevantes a través del tiempo;
* análisis del porcentaje de accesos por gratuidad por estación;
* exploración de la distribución geográfica de la afluencia.

El proyecto no pretende determinar directamente frecuencias de trenes, capacidad operativa u otras decisiones operativas que requieran información adicional no incluida en el conjunto de datos.

---

## Preguntas del proyecto

Inicialmente se plantean las siguientes preguntas:

1. **¿Cómo ha evolucionado la afluencia del Metro de la Ciudad de México entre 2021 y el 30 de abril de 2026, tanto a nivel general como por línea?**

2. **¿Qué líneas y estaciones presentan los mayores niveles de afluencia total y promedio en distintos periodos?**

3. **¿En qué meses o fechas se observan los valores máximos y mínimos de afluencia y qué cambios relevantes pueden identificarse a través del tiempo?**

4. **¿Qué porcentaje de la afluencia total corresponde a accesos por gratuidad en cada estación del Metro y cómo varía este porcentaje a lo largo del periodo analizado?**

5. **¿Cómo se distribuyen geográficamente las estaciones con mayores niveles de afluencia y qué consultas espaciales pueden realizarse utilizando su ubicación?**

---

## Indicador de porcentaje de gratuidad

Para responder la cuarta pregunta se utilizará como indicador la proporción de afluencia correspondiente a accesos por gratuidad.

La definición conceptual será:

```text
porcentaje_gratuidad = (afluencia_gratuidad / afluencia_total) × 100
```

Donde:

```text
afluencia_total = boleto + prepago + gratuidad
```

El indicador se podrá calcular por estación y por distintos periodos de análisis. En la implementación deberá controlarse explícitamente cualquier caso en el que la afluencia total sea igual a cero antes de realizar la división.

Este indicador representa una **proporción de la afluencia observada** y no debe confundirse con un conteo absoluto ni interpretarse por sí mismo como una explicación causal de las diferencias entre estaciones.

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

Las categorías disponibles para `tipo_pago` son:

* `Boleto`
* `Prepago`
* `Gratuidad`

La categoría `Boleto` permanece estructuralmente en el conjunto de datos durante todo el periodo. Sin embargo, el último día con afluencia positiva registrada para esta categoría es el **17 de febrero de 2024**. A partir del **18 de febrero de 2024**, sus registros permanecen en la base con `afluencia = 0`.

Por lo tanto, estos registros no deben interpretarse como datos faltantes.

---

## Componente temporal

El conjunto de datos contiene observaciones diarias desde el **1 de enero de 2021 hasta el 30 de abril de 2026**.

Durante el modelado en MongoDB se propone almacenar `fecha` utilizando el tipo BSON `Date`, permitiendo realizar consultas mediante intervalos temporales y construir indicadores diarios, mensuales y anuales.

Los campos `mes` y `anio` del archivo original se consideran redundantes respecto a `fecha`. Se evaluará no almacenarlos en la colección final y derivarlos de la fecha cuando sean necesarios para los pipelines de agregación.

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

Las coordenadas deberán obtenerse de una fuente confiable y se conservará el orden requerido por GeoJSON: **[longitud, latitud]**.

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

Durante la carga en MongoDB se propone transformar `fecha` al tipo BSON `Date`.

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

La propuesta preliminar es que el catálogo geográfico represente **estaciones físicas**, permitiendo asociar a cada estación un arreglo con una o más líneas. La colección de afluencia conservará la línea específica porque la medición original distingue la combinación estación-línea.

Esta decisión será especialmente relevante cuando se incorporen las coordenadas geográficas.

---

## Comportamiento de la categoría Boleto

La categoría `Boleto` se encuentra presente estructuralmente durante todo el periodo analizado.

El último día con una afluencia positiva registrada para esta categoría es el **17 de febrero de 2024**.

A partir del **18 de febrero de 2024**, los registros correspondientes a `Boleto` permanecen en el conjunto de datos, pero presentan:

```text
afluencia = 0
```

Por lo tanto, estos registros no deben interpretarse como datos faltantes.

La pregunta principal relacionada con el tipo de acceso se concentrará en el **porcentaje de gratuidad**, por lo que `Boleto` y `Prepago` formarán parte del cálculo de la afluencia total, pero no serán el eje principal del análisis.

---

## Unidad de análisis original

Una fila del archivo original representa:

> La afluencia correspondiente a un tipo de pago, en una combinación específica de estación y línea, durante una fecha determinada.

La llave lógica observada es:

```text
fecha + linea + estacion + tipo_pago
```

No se detectaron duplicados para esta combinación.

---

## Consideraciones para MongoDB

A partir del perfilado y de las preguntas del proyecto se evaluaron las siguientes decisiones:

* convertir `fecha` a BSON `Date`;
* derivar `mes` y `anio` a partir de `fecha` en lugar de almacenarlos de forma redundante;
* integrar las tres categorías de tipo de pago dentro de una misma observación diaria;
* conservar la combinación estación-línea en la medición temporal;
* mantener los metadatos estables de cada estación en una colección separada;
* construir un catálogo de estaciones físicas;
* incorporar coordenadas geográficas;
* representar las ubicaciones mediante GeoJSON `Point`;
* definir las consultas principales antes de diseñar los índices.

---

# Patrones de consulta

El modelo documental se está diseñando a partir de las preguntas que debe responder la solución y no como una conversión directa del esquema estrella o del archivo CSV.

Para la etapa de análisis de rendimiento se han identificado tres patrones principales.

## Consulta A: evolución de una línea en un periodo

Pregunta que responde:

> ¿Cuál fue la evolución de la afluencia de una línea determinada durante un periodo específico?

Patrón conceptual:

```text
línea = igualdad
fecha = rango
ordenamiento = fecha ascendente
```

Este patrón será útil para estudiar posteriormente un índice compuesto que considere un campo de igualdad seguido por el componente temporal.

---

## Consulta B: historial de una estación

Pregunta que responde:

> ¿Cómo se comportó la afluencia de una estación determinada durante un periodo específico?

Patrón conceptual:

```text
estación = igualdad
fecha = rango
ordenamiento = fecha ascendente
```

Este patrón permitirá evaluar si requiere un índice propio o si puede reutilizar parcialmente alguna estrategia de indexación definida para otras consultas.

---

## Consulta C: estaciones con mayor afluencia en un periodo

Pregunta que responde:

> ¿Qué estaciones presentan la mayor afluencia acumulada durante un periodo determinado?

Flujo conceptual:

```text
rango temporal
    ↓
agrupar por estación
    ↓
sumar afluencia
    ↓
ordenar de mayor a menor
    ↓
seleccionar resultados principales
```

Esta consulta permitirá analizar no sólo el acceso inicial a los documentos mediante índices, sino también el costo de las etapas posteriores de agrupación y ordenamiento.

---

# Diseño documental

## Criterio de diseño

El modelo documental no se definió como una conversión directa del archivo CSV ni como una reproducción del esquema estrella utilizado previamente para análisis OLAP.

El esquema estrella existente se utiliza como referencia conceptual para identificar las dimensiones del problema, pero la implementación en MongoDB se diseña de acuerdo con las preguntas y patrones de consulta del proyecto.

Los principales requerimientos identificados son:

1. consultar una línea durante un intervalo temporal;
2. consultar históricamente una estación durante un intervalo temporal;
3. agregar estaciones o líneas para identificar aquellas con mayor afluencia en un periodo;
4. calcular el porcentaje de gratuidad por estación y analizar su variación temporal;
5. enriquecer las estaciones con información geográfica para consultas espaciales.

---

## Alternativa A: documento por tipo de pago

La primera alternativa conserva la granularidad original del conjunto de datos.

La unidad de análisis sería:

> Una observación de afluencia correspondiente a una fecha, combinación estación-línea y tipo de pago.

Ejemplo:

```javascript
{
  fecha: ISODate("2025-01-15T00:00:00Z"),
  estacion_id: "balderas",
  linea: "1",
  tipo_pago: "Prepago",
  afluencia: 15243
}
```

Con esta alternativa se generarían:

```text
1,946 días
× 195 combinaciones estación-línea
× 3 tipos de pago
=
1,138,410 documentos
```

### Ventajas

* Conserva exactamente la granularidad del conjunto de datos original.
* Facilita consultas específicas por tipo de pago.
* Requiere una transformación mínima para pasar del CSV a MongoDB.

### Desventajas

* Repite fecha, estación y línea para cada tipo de pago.
* Requiere agregar tres documentos para calcular la afluencia total de una estación en una fecha.
* Para obtener el porcentaje de gratuidad es necesario combinar previamente los registros de los distintos tipos de pago.
* Aprovecha de forma limitada la posibilidad de representar información estrechamente relacionada dentro de un mismo documento.

---

## Alternativa B: documento diario por estación-línea

La segunda alternativa considera que las categorías de pago forman parte de una misma observación diaria.

La unidad de análisis sería:

> La afluencia diaria de una combinación estación-línea, incluyendo su composición por tipo de pago.

Ejemplo:

```javascript
{
  fecha: ISODate("2025-01-15T00:00:00Z"),
  estacion_id: "balderas",
  linea: "1",

  afluencia: {
    boleto: 0,
    prepago: 15243,
    gratuidad: 814,
    total: 16057
  }
}
```

Con esta alternativa se generarían:

```text
1,946 días
× 195 combinaciones estación-línea
=
379,470 documentos
```

### Ventajas

* Reduce la repetición de información.
* Integra en un mismo documento los componentes de una observación diaria.
* Facilita consultas de afluencia total por estación, línea y fecha.
* Reduce aproximadamente a un tercio el número de documentos respecto a la granularidad original.
* Se adapta naturalmente a los patrones de consulta temporal definidos para el proyecto.
* Permite validar conjuntamente los componentes de la afluencia.
* Facilita el cálculo del porcentaje de gratuidad porque `afluencia.gratuidad` y `afluencia.total` se encuentran en el mismo documento.

### Desventajas

* Requiere transformar y agrupar el conjunto de datos antes de cargarlo.
* Las consultas por un tipo de pago específico deben acceder al campo correspondiente dentro del subdocumento.
* Una estructura fija es menos flexible si en el futuro surgiera un número elevado o variable de nuevas categorías de pago.

---

## Catálogo de estaciones

La información estable de las estaciones se propone mantener en una colección independiente de las mediciones temporales de afluencia.

De manera preliminar:

```javascript
{
  _id: "balderas",
  nombre: "Balderas",
  lineas: ["1", "3"],

  ubicacion: {
    type: "Point",
    coordinates: [longitud, latitud]
  }
}
```

Esta colección contendrá información que no cambia diariamente, como:

* nombre de la estación;
* líneas asociadas;
* coordenadas geográficas;
* otros metadatos estables que posteriormente resulten pertinentes.

Separar esta información evita repetir las coordenadas y otros atributos de las estaciones en cada observación temporal.

También permitirá representar las ubicaciones mediante GeoJSON y evaluar posteriormente un índice geoespacial `2dsphere`.

---

## Relación preliminar entre colecciones

```text
              estaciones
        ┌─────────────────────┐
        │ _id                 │
        │ nombre              │
        │ lineas[]            │
        │ ubicacion           │
        │   GeoJSON Point     │
        └─────────┬───────────┘
                  │
                  │ estacion_id
                  │
                  ▼
           afluencia_diaria
        ┌─────────────────────┐
        │ fecha               │
        │ estacion_id         │
        │ linea               │
        │                     │
        │ afluencia           │
        │ ├── boleto          │
        │ ├── prepago         │
        │ ├── gratuidad       │
        │ └── total           │
        └─────────────────────┘
```

---

## Decisión preliminar

La **Alternativa B** es actualmente la opción preferida debido a que representa de manera más natural la unidad utilizada por la mayoría de las preguntas del proyecto:

> afluencia de una combinación estación-línea en una fecha determinada.

Los tipos de pago se interpretarían como componentes de dicha afluencia y no como entidades independientes.

La nueva pregunta sobre **porcentaje de gratuidad** refuerza esta alternativa, ya que permite mantener en un mismo documento el numerador (`afluencia.gratuidad`) y el denominador (`afluencia.total`) necesarios para calcular el indicador.

La colección `estaciones` mantendría de forma separada los metadatos estables y la ubicación geográfica de cada estación física.

Esta decisión continúa siendo preliminar hasta validar formalmente que las consultas principales pueden resolverse de manera natural con esta estructura.

---


