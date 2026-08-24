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

5. **¿Cuáles son las estaciones ubicadas a una distancia máxima de dos kilómetros del Zócalo de la Ciudad de México y cuál fue su afluencia acumulada durante 2025?**


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

# Validación del modelo contra los patrones de consulta

Antes de adoptar definitivamente la estructura documental propuesta, se evaluó si la **Alternativa B: documento diario por combinación estación-línea** permite responder de manera natural las preguntas y patrones de consulta definidos para el proyecto.

La unidad de almacenamiento propuesta es:

> Una observación diaria de afluencia correspondiente a una combinación específica estación-línea, incluyendo su composición por tipo de acceso.

De manera conceptual:

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

Esta estructura conserva la granularidad original de las mediciones por combinación estación-línea, pero permite agregar posteriormente varias líneas cuando la pregunta requiera analizar una **estación física**.

---

## Distinción entre estación-línea y estación física

El conjunto de datos contiene:

```text
195 combinaciones línea-estación
163 estaciones físicas
```

Las estaciones de correspondencia aparecen asociadas a más de una línea y la afluencia se registra de manera independiente para cada combinación estación-línea.

Por ejemplo:

```text
Balderas
├── Línea 1
└── Línea 3
```

Por lo tanto, se adoptan dos niveles de análisis:

### Estación-línea

Representa la unidad básica en la que se registra la afluencia.

Ejemplo:

```text
Balderas - Línea 1
Balderas - Línea 3
```

### Estación física

Representa una estación independientemente de las líneas a las que pertenece.

Cuando una consulta se refiera a la afluencia total de una estación física, se sumarán las observaciones correspondientes a todas sus líneas.

Por lo tanto:

```text
afluencia estación física
=
suma de la afluencia de todas sus combinaciones estación-línea
```

Esta decisión permite conservar la granularidad original sin perder la posibilidad de analizar posteriormente la estación como una entidad única.

---

## Consulta A: evolución de una línea

La consulta busca responder:

> ¿Cuál fue la evolución de la afluencia de una línea determinada durante un periodo específico?

El patrón conceptual es:

```text
línea = igualdad
fecha = rango
        ↓
agrupar por fecha
        ↓
sumar afluencia total
        ↓
ordenar cronológicamente
```

### Unidad inicial

```text
estación-línea-fecha
```

### Unidad final

```text
línea-fecha
```

Para cada fecha se sumará `afluencia.total` de todas las estaciones pertenecientes a la línea seleccionada.

### Evaluación

**Compatible con el modelo propuesto.**

Esta consulta presenta además un patrón claro de:

```text
igualdad + rango temporal + ordenamiento
```

por lo que será una de las consultas utilizadas posteriormente para evaluar la estrategia de indexación.

---

## Consulta B: historial de una estación

La consulta busca responder:

> ¿Cómo se comportó la afluencia de una estación física determinada durante un periodo específico?

En este caso, una estación puede pertenecer a una o varias líneas.

Por ejemplo:

```text
Balderas
├── Línea 1
└── Línea 3
```

Para obtener la afluencia total de la estación física se recuperarán todas las observaciones que compartan el mismo `estacion_id` y posteriormente se sumarán las observaciones correspondientes a sus diferentes líneas para cada fecha.

El patrón conceptual será:

```text
estacion_id = igualdad
fecha = rango
        ↓
agrupar por fecha
        ↓
sumar afluencia de todas las líneas
        ↓
ordenar cronológicamente
```

### Unidad inicial

```text
estación-línea-fecha
```

### Unidad final

```text
estación física-fecha
```

De manera conceptual:

```text
Balderas - Línea 1
        +
Balderas - Línea 3
        ↓
Afluencia total de Balderas
```

Si posteriormente se requiere analizar únicamente una combinación específica, por ejemplo:

```text
Balderas - Línea 1
```

podrá incorporarse adicionalmente el filtro por `linea`.

### Evaluación

**Compatible con el modelo propuesto.**

La estructura permite analizar tanto estaciones físicas como combinaciones específicas estación-línea sin perder información.

---

## Consulta C: estaciones con mayor afluencia

La consulta busca responder:

> ¿Qué estaciones físicas presentan la mayor afluencia acumulada durante un periodo determinado?

El flujo conceptual será:

```text
rango temporal
     ↓
agrupar por estacion_id
     ↓
sumar afluencia total
     ↓
ordenar de mayor a menor
     ↓
seleccionar resultados principales
```

### Unidad inicial

```text
estación-línea-fecha
```

### Unidad final

```text
estación física
```

Para las estaciones de correspondencia, los registros de las diferentes líneas se sumarán utilizando el mismo `estacion_id`.

Por ejemplo:

```text
Balderas - Línea 1
        +
Balderas - Línea 3
        ↓
Balderas
```

De esta forma, cada estación física aparecerá una sola vez en el resultado final.

### Evaluación

**Compatible con el modelo propuesto.**

Este patrón permitirá evaluar posteriormente hasta qué punto un índice sobre el rango temporal reduce el conjunto inicial de documentos y qué parte del trabajo continúa realizándose durante las etapas de `$group` y `$sort`.

---

## Consulta de porcentaje de gratuidad

La pregunta del proyecto es:

> ¿Qué porcentaje de la afluencia total corresponde a accesos por gratuidad en cada estación del Metro y cómo varía este porcentaje a lo largo del periodo analizado?

Para una estación física se deberán agregar primero los registros correspondientes a todas sus líneas.

El cálculo será:

```text
porcentaje_gratuidad =
SUM(afluencia.gratuidad)
──────────────────────── × 100
  SUM(afluencia.total)
```

Por ejemplo, para una estación de correspondencia:

```text
gratuidad Línea 1
        +
gratuidad Línea 3
        ↓
gratuidad total de la estación
```

y:

```text
afluencia total Línea 1
        +
afluencia total Línea 3
        ↓
afluencia total de la estación
```

Posteriormente:

```text
gratuidad total de la estación
────────────────────────────── × 100
 afluencia total de la estación
```

No se utilizará el promedio simple de porcentajes diarios o de porcentajes por línea, debido a que esto daría el mismo peso a observaciones con diferentes niveles de afluencia.

También deberá controlarse explícitamente cualquier caso en el que la suma de `afluencia.total` sea igual a cero antes de realizar la división.

### Evaluación

**Altamente compatible con el modelo propuesto.**

La estructura embebida:

```javascript
afluencia: {
  boleto: ...,
  prepago: ...,
  gratuidad: ...,
  total: ...
}
```

mantiene dentro del mismo documento los componentes necesarios para calcular el indicador.

---

## Consulta geoespacial

La pregunta del proyecto es:

> ¿Cómo se distribuyen geográficamente las estaciones con mayores niveles de afluencia y qué consultas espaciales pueden realizarse utilizando su ubicación?

La ubicación geográfica no pertenece a la medición diaria de afluencia, sino a la **estación física**.

Por esta razón se propone mantener un catálogo independiente de estaciones:

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

El flujo conceptual será:

```text
afluencia_diaria
       ↓
agrupar por estación física
       ↓
obtener indicadores de afluencia
       ↓
relacionar con catálogo de estaciones
       ↓
incorporar ubicación GeoJSON
       ↓
análisis geoespacial
```

La estación física será, por lo tanto, la unidad geográfica del proyecto.

### Evaluación

**Compatible con el modelo propuesto mediante una colección independiente de estaciones.**

---

# Niveles de análisis adoptados

La solución distingue entre la granularidad de almacenamiento y las unidades utilizadas para responder cada pregunta.

| Elemento                     | Unidad utilizada                  |
| ---------------------------- | --------------------------------- |
| Dato fuente                  | estación-línea-tipo de pago-fecha |
| Documento `afluencia_diaria` | estación-línea-fecha              |
| Entidad `estaciones`         | estación física                   |
| Evolución por línea          | línea                             |
| Historial de estación        | estación física                   |
| Ranking de estaciones        | estación física                   |
| Porcentaje de gratuidad      | estación física                   |
| Coordenadas geográficas      | estación física                   |
| GeoJSON                      | estación física                   |

Esta separación permite conservar el detalle del conjunto de datos original y al mismo tiempo construir análisis en niveles superiores mediante agregaciones.

---

# Resultado de la validación del modelo

| Requerimiento                                             | Alternativa B        |
| --------------------------------------------------------- | -------------------- |
| Conservación del detalle estación-línea                   | Compatible           |
| Evolución temporal por línea                              | Compatible           |
| Historial por estación física                             | Compatible           |
| Consulta específica estación-línea                        | Compatible           |
| Ranking de estaciones físicas                             | Compatible           |
| Porcentaje de gratuidad                                   | Altamente compatible |
| Análisis temporal                                         | Compatible           |
| Incorporación geoespacial                                 | Compatible           |
| Reducción de redundancia respecto al CSV                  | Compatible           |
| Conservación de información para agregaciones posteriores | Compatible           |

La evaluación indica que la **Alternativa B soporta de manera natural los principales patrones de consulta del proyecto**.

Además, conserva la granularidad estación-línea necesaria para los análisis por línea, mientras que el uso de un identificador común de estación permite reconstruir la estación física mediante agregaciones cuando la pregunta lo requiere.

---

## Decisión adoptada

Se adopta como unidad de almacenamiento:

> **La afluencia diaria de una combinación estación-línea, incluyendo su composición por tipo de acceso.**

La colección principal utilizará provisionalmente el nombre:

```text
afluencia_diaria
```

La estación física se representará mediante una colección independiente:

```text
estaciones
```

De esta forma:

```text
estación-línea
      ↓
unidad de almacenamiento

estación física
      ↓
entidad de referencia
      ↓
unidad de análisis agregado
      ↓
unidad geoespacial
```

Con esta decisión se considera validada la estructura general del modelo contra las preguntas y patrones de consulta actualmente definidos.

# Modelo documental propuesto

Una vez analizadas las preguntas del proyecto y validados los principales patrones de consulta, se define una primera versión formal del modelo documental.

La solución utilizará dos colecciones principales:

```text
afluencia_diaria
estaciones
```

La colección `afluencia_diaria` contendrá las mediciones temporales, mientras que `estaciones` contendrá los metadatos relativamente estables de cada estación física.

---

## Arquitectura general

```text
                   estaciones
          ┌────────────────────────┐
          │ _id                    │
          │ nombre                 │
          │ lineas[]               │
          │ ubicacion              │
          │   ├── type             │
          │   └── coordinates[]    │
          └───────────┬────────────┘
                      │
                      │ estacion_id
                      │
                      ▼
               afluencia_diaria
          ┌────────────────────────┐
          │ _id                    │
          │ fecha                  │
          │ estacion_id            │
          │ linea                  │
          │ afluencia              │
          │   ├── boleto           │
          │   ├── prepago          │
          │   ├── gratuidad        │
          │   └── total            │
          └────────────────────────┘
```

La relación entre ambas colecciones se realizará mediante:

```text
afluencia_diaria.estacion_id
              ↓
       estaciones._id
```

MongoDB no impondrá una llave foránea como ocurriría en un modelo relacional. La consistencia de esta referencia deberá conservarse durante la transformación y carga de los datos.

---

# Colección `afluencia_diaria`

## Propósito

Almacenar las mediciones históricas de afluencia del Metro.

Cada documento representará:

> **La afluencia diaria registrada en una combinación específica estación-línea, incluyendo su composición por tipo de acceso.**

Por lo tanto, el grano de almacenamiento será:

```text
fecha + estacion_id + linea
```

El conjunto original contiene 1,138,410 filas porque cada combinación estación-línea-fecha aparece una vez por cada uno de los tres tipos de pago.

Al integrar dichas categorías dentro de un mismo documento se espera obtener:

```text
1,946 fechas
× 195 combinaciones estación-línea
=
379,470 documentos
```

---

## Campos de `afluencia_diaria`

| Campo                 | Tipo BSON propuesto | Presencia              | Propósito                                       |
| --------------------- | ------------------- | ---------------------- | ----------------------------------------------- |
| `_id`                 | `objectId`          | Obligatorio automático | Identificador único del documento               |
| `fecha`               | `date`              | Obligatorio            | Fecha de la observación                         |
| `estacion_id`         | `string`            | Obligatorio            | Referencia a la estación física                 |
| `linea`               | `string`            | Obligatorio            | Línea a la que corresponde la medición          |
| `afluencia`           | `object`            | Obligatorio            | Subdocumento con la composición de la afluencia |
| `afluencia.boleto`    | `int`               | Obligatorio            | Número de accesos mediante boleto               |
| `afluencia.prepago`   | `int`               | Obligatorio            | Número de accesos mediante prepago              |
| `afluencia.gratuidad` | `int`               | Obligatorio            | Número de accesos mediante gratuidad            |
| `afluencia.total`     | `int`               | Obligatorio            | Suma de los tres tipos de acceso                |

Los cuatro valores de afluencia deberán ser iguales o mayores que cero.

---

## Documento representativo

```javascript
{
  _id: ObjectId("..."),

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

Los valores anteriores son únicamente ilustrativos para representar la estructura del documento y no deberán utilizarse como resultados reales del conjunto de datos.

---

# Decisión sobre `fecha`, `mes` y `anio`

El archivo original contiene:

```text
fecha
mes
anio
```

En MongoDB se propone conservar únicamente:

```javascript
fecha: ISODate("2025-01-15T00:00:00Z")
```

utilizando BSON `Date`.

Los campos `mes` y `anio` podrán obtenerse posteriormente a partir de `fecha` mediante operadores temporales de MongoDB.

Conceptualmente:

```text
fecha BSON Date
       ↓
operadores temporales
       ↓
año / mes / día
```

Esta decisión evita almacenar información temporal redundante y elimina la posibilidad de inconsistencias como:

```text
fecha = 2025-01-15
mes   = Agosto
anio  = 2024
```

Por lo tanto:

```text
fecha
```

será la fuente temporal principal del documento.

---

# Decisión sobre los tipos de pago

En el conjunto original los tipos de pago aparecen como filas independientes:

```text
Boleto
Prepago
Gratuidad
```

En el modelo documental se integrarán dentro del subdocumento:

```javascript
afluencia: {
  boleto: ...,
  prepago: ...,
  gratuidad: ...,
  total: ...
}
```

Esta decisión se justifica porque los tres valores:

* pertenecen a la misma fecha;
* pertenecen a la misma combinación estación-línea;
* representan componentes de una misma medida de afluencia;
* son utilizados conjuntamente para responder las preguntas principales del proyecto.

Además, la pregunta sobre gratuidad requiere calcular:

```text
SUM(afluencia.gratuidad)
──────────────────────── × 100
  SUM(afluencia.total)
```

por lo que mantener ambos componentes dentro de una misma observación simplifica el análisis.

---

# Decisión sobre `afluencia.total`

El campo:

```text
afluencia.total
```

puede obtenerse matemáticamente mediante:

```text
boleto + prepago + gratuidad
```

Por lo tanto, podría calcularse dinámicamente en cada consulta.

Sin embargo, se propone **materializarlo dentro de cada documento**.

La decisión se justifica porque la afluencia total aparece de forma recurrente en las principales preguntas del proyecto:

* evolución temporal por línea;
* evolución temporal por estación;
* ranking de estaciones;
* máximos y mínimos;
* porcentaje de gratuidad.

La estructura será:

```javascript
afluencia: {
  boleto: 0,
  prepago: 15243,
  gratuidad: 814,
  total: 16057
}
```

Esto evita recalcular la suma en cada consulta.

### Costo de la decisión

Al ser un campo derivado existe una posible inconsistencia si:

```text
total ≠ boleto + prepago + gratuidad
```

Por este motivo se implementará una prueba de integridad que compruebe:

```text
afluencia.total
=
afluencia.boleto
+
afluencia.prepago
+
afluencia.gratuidad
```

El `$jsonSchema` podrá controlar los tipos y que los valores no sean negativos, mientras que la consistencia aritmética se verificará mediante una consulta o pipeline específico.

Dado que el conjunto contiene principalmente información histórica y no se espera una actualización continua de estos registros, el costo de mantener el campo derivado es reducido frente a la utilidad que ofrece para las consultas recurrentes.

---

# Colección `estaciones`

## Propósito

Almacenar información estable de las **163 estaciones físicas** de la Red del Metro.

Esta información se separa de `afluencia_diaria` porque datos como nombre, líneas y coordenadas no cambian diariamente y no es necesario repetirlos en cientos de miles de observaciones.

Cada documento representará:

> **Una estación física de la Red del Metro de la Ciudad de México.**

---

## Campos de `estaciones`

| Campo                   | Tipo BSON propuesto | Presencia                             | Propósito                             |
| ----------------------- | ------------------- | ------------------------------------- | ------------------------------------- |
| `_id`                   | `string`            | Obligatorio                           | Identificador estable de la estación  |
| `nombre`                | `string`            | Obligatorio                           | Nombre de la estación                 |
| `lineas`                | `array<string>`     | Obligatorio                           | Líneas asociadas a la estación física |
| `ubicacion`             | `object`            | Pendiente inicialmente                | Ubicación GeoJSON                     |
| `ubicacion.type`        | `string`            | Obligatorio cuando exista `ubicacion` | Tipo de geometría GeoJSON             |
| `ubicacion.coordinates` | `array<double>`     | Obligatorio cuando exista `ubicacion` | Longitud y latitud                    |

La ubicación se mantendrá inicialmente como un campo pendiente hasta obtener las coordenadas de las estaciones de una fuente confiable.

---

# Identificador de estación

La colección `estaciones` utilizará provisionalmente un identificador textual estable.

Ejemplo:

```text
balderas
```

De esta manera:

```javascript
{
  _id: "balderas",
  nombre: "Balderas"
}
```

y las mediciones utilizarán:

```javascript
{
  estacion_id: "balderas"
}
```

Este identificador permitirá relacionar las colecciones de forma legible y reproducible.

Durante la transformación de los datos deberá establecerse una regla determinística para generar estos identificadores a partir de los nombres originales y garantizar que una misma estación física siempre obtenga el mismo valor.

---

# Arreglo `lineas`

Una estación física puede pertenecer a una o varias líneas.

Por ejemplo, conceptualmente:

```javascript
{
  _id: "balderas",
  nombre: "Balderas",
  lineas: ["1", "3"]
}
```

El uso de un arreglo se justifica porque:

* las líneas constituyen un conjunto pequeño;
* pertenecen naturalmente a la estación;
* son metadatos estables;
* no necesitan una colección independiente para responder las preguntas actuales.

Una estación perteneciente únicamente a una línea tendría:

```javascript
lineas: ["1"]
```

mientras que una estación de correspondencia podría tener:

```javascript
lineas: ["1", "3"]
```

Si posteriormente se crea un índice sobre este campo, deberá considerarse que MongoDB lo tratará como un índice **multikey**.

No se propone dicho índice todavía; su necesidad deberá derivarse de los patrones de consulta.

---

# Ubicación geográfica

Las coordenadas pertenecen a la **estación física**, no a cada observación de afluencia.

Por esta razón se almacenarán únicamente en la colección `estaciones`.

La representación será GeoJSON:

```javascript
ubicacion: {
  type: "Point",
  coordinates: [longitud, latitud]
}
```

Es importante conservar el orden:

```text
[longitud, latitud]
```

y no:

```text
[latitud, longitud]
```

Posteriormente se evaluará la creación de un índice:

```text
2dsphere
```

cuando se hayan incorporado y validado las coordenadas.

---

# Documento representativo de una estación

Una estación de correspondencia podrá representarse conceptualmente como:

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

Las coordenadas anteriores se mantienen como marcadores conceptuales y no se incorporarán valores numéricos hasta obtenerlos de una fuente confiable.

---

# Relación entre las colecciones

La relación será:

```text
estaciones._id
      ▲
      │
      │
afluencia_diaria.estacion_id
```

Por ejemplo:

```text
estaciones
_id = "balderas"
        ▲
        │
        ├──────── Balderas - Línea 1 - 2025-01-15
        │
        ├──────── Balderas - Línea 3 - 2025-01-15
        │
        ├──────── Balderas - Línea 1 - 2025-01-16
        │
        └──────── Balderas - Línea 3 - 2025-01-16
```

La colección de afluencia conserva el detalle estación-línea, mientras que `estaciones` representa la entidad física común.

---

# Uso de referencia frente a embebido

## Información embebida

La composición de la afluencia se embebe:

```text
afluencia
├── boleto
├── prepago
├── gratuidad
└── total
```

porque todos sus componentes:

* pertenecen a la misma observación;
* se consultan frecuentemente juntos;
* tienen una relación uno a uno con la medición diaria;
* presentan un tamaño pequeño y conocido.

---

## Información referenciada

La estación física se mantiene mediante referencia:

```text
estacion_id
```

porque sus metadatos:

* se comparten entre miles de observaciones;
* cambian con mucha menor frecuencia que la afluencia;
* no deben repetirse en cada documento;
* incluyen posteriormente información geográfica.

De esta forma se evita repetir:

```text
nombre
líneas asociadas
coordenadas
```

en aproximadamente 379,470 documentos.

---

# Uso previsto de `$lookup`

No será necesario utilizar `$lookup` para las consultas temporales habituales que únicamente requieran:

```text
fecha
linea
estacion_id
afluencia
```

La información necesaria ya se encuentra en `afluencia_diaria`.

`$lookup` se reservará para consultas en las que realmente sea necesario enriquecer los resultados con información de la estación física.

Por ejemplo:

```text
afluencia_diaria
       ↓
agrupar estaciones con mayor afluencia
       ↓
$lookup
       ↓
estaciones
       ↓
obtener ubicación GeoJSON
```

De esta forma, la referencia no obliga a reconstruir cada observación mediante múltiples uniones.

---

# Modelo resultante

```text
                    ┌───────────────────────┐
                    │      estaciones       │
                    │                       │
                    │ _id : string          │
                    │ nombre : string       │
                    │ lineas : array        │
                    │ ubicacion : GeoJSON   │
                    └───────────┬───────────┘
                                │
                                │ estacion_id
                                │
                                ▼
              ┌─────────────────────────────────┐
              │        afluencia_diaria         │
              │                                 │
              │ _id : ObjectId                  │
              │ fecha : Date                    │
              │ estacion_id : string            │
              │ linea : string                  │
              │                                 │
              │ afluencia : object              │
              │ ├── boleto : int                │
              │ ├── prepago : int               │
              │ ├── gratuidad : int             │
              │ └── total : int                 │
              └─────────────────────────────────┘
```

---

# Decisiones adoptadas

| Decisión                  | Solución                                             |
| ------------------------- | ---------------------------------------------------- |
| Unidad de almacenamiento  | estación-línea-fecha                                 |
| Estación física           | colección `estaciones`                               |
| Medición temporal         | colección `afluencia_diaria`                         |
| Fecha                     | BSON `Date`                                          |
| Mes y año                 | derivados de `fecha`                                 |
| Tipos de pago             | subdocumento embebido                                |
| Afluencia total           | campo derivado materializado                         |
| Identificador de estación | `string` estable                                     |
| Líneas de estación física | arreglo                                              |
| Coordenadas               | GeoJSON `Point`                                      |
| Relación                  | `estacion_id` → `estaciones._id`                     |
| `$lookup`                 | únicamente cuando se requieran metadatos de estación |

---

# Transformación de los datos al modelo documental

Una vez definido el modelo documental, se implementó un proceso de transformación para convertir el conjunto de datos tabular original en documentos adecuados para MongoDB.

El conjunto de datos original contenía:

```text
1,138,410 registros
```

con la siguiente granularidad:

> **fecha + línea + estación + tipo de pago**

Cada combinación estación-línea-fecha se encontraba representada mediante tres filas independientes, correspondientes a:

```text
Boleto
Prepago
Gratuidad
```

El modelo documental diseñado requiere una granularidad diferente:

> **fecha + estación-línea**

Por esta razón fue necesario realizar una transformación previa a la carga en MongoDB.

---

## Herramienta utilizada

La transformación se implementó mediante un script en **Python utilizando pandas**.

Python se utilizó únicamente como herramienta de preparación y transformación de los datos.

MongoDB continúa siendo el sistema encargado de:

* almacenamiento documental;
* consultas;
* aggregation pipelines;
* indexación;
* validación;
* análisis temporal;
* análisis geoespacial.

La transformación se mantuvo separada de MongoDB con el objetivo de que el procedimiento fuera reproducible y pudiera validarse antes de cargar la información.

---

# Flujo general de transformación

El proceso implementado fue:

```text
CSV original
1,138,410 filas
       │
       ▼
Validación inicial
       │
       ▼
Normalización de estaciones
       │
       ▼
Generación de estacion_id
       │
       ▼
Transformación de tipo_pago
filas → subdocumento
       │
       ├─────────────────────┐
       ▼                     ▼
afluencia_diaria         estaciones
379,470 documentos       163 documentos
       │                     │
       └──────────┬──────────┘
                  ▼
           Archivos NDJSON
```

---

# Validaciones previas a la transformación

Antes de transformar los datos se verificó:

* ausencia de valores nulos en los campos utilizados;
* fechas válidas;
* valores de afluencia numéricos;
* ausencia de valores negativos;
* existencia únicamente de los tipos de pago esperados:

  * `Boleto`;
  * `Prepago`;
  * `Gratuidad`;
* ausencia de duplicados para la llave lógica original:

```text
fecha + linea + estacion + tipo_pago
```

También se verificó que cada combinación:

```text
fecha + linea + estacion
```

contara exactamente con los tres tipos de pago.

Esta validación fue importante para evitar completar silenciosamente observaciones faltantes durante la transformación.

---

# Transformación de los tipos de pago

En el archivo original una observación se encontraba representada de la siguiente manera:

```text
fecha       estacion   linea   tipo_pago    afluencia
2025-01-15  Balderas   1       Boleto       ...
2025-01-15  Balderas   1       Prepago      ...
2025-01-15  Balderas   1       Gratuidad    ...
```

Mediante una operación de transformación se integraron las tres filas dentro de un mismo documento:

```javascript
{
  fecha: ISODate("2025-01-15T00:00:00Z"),
  estacion_id: "balderas",
  linea: "1",

  afluencia: {
    boleto: ...,
    prepago: ...,
    gratuidad: ...,
    total: ...
  }
}
```

De esta forma:

```text
3 filas originales
        ↓
1 documento
```

La transformación redujo:

```text
1,138,410 filas originales
```

a:

```text
379,470 documentos de afluencia_diaria
```

lo cual coincide exactamente con:

```text
1,946 fechas
× 195 combinaciones estación-línea
=
379,470 documentos
```

---

# Cálculo de `afluencia.total`

Durante la transformación se calculó:

```text
afluencia.total
=
afluencia.boleto
+
afluencia.prepago
+
afluencia.gratuidad
```

El valor se almacenó dentro del documento debido a que es utilizado recurrentemente en las principales consultas del proyecto.

Por ejemplo:

```javascript
afluencia: {
  boleto: 0,
  prepago: 15243,
  gratuidad: 814,
  total: 16057
}
```

Aunque `total` es un campo derivado, materializarlo permite evitar su recálculo repetido durante las consultas de:

* evolución temporal;
* afluencia por línea;
* afluencia por estación;
* máximos y mínimos;
* ranking de estaciones;
* porcentaje de gratuidad.

---

# Generación de `estacion_id`

Para relacionar las mediciones de afluencia con las estaciones físicas se generó un identificador textual estable.

Por ejemplo:

```text
Balderas
   ↓
balderas
```

La normalización considera:

* conversión a minúsculas;
* eliminación de acentos;
* normalización de espacios y caracteres;
* generación de un identificador reproducible.

Antes de utilizar los identificadores se comprobó que la normalización no generara colisiones entre estaciones.

Como resultado se conservaron:

```text
163 estaciones físicas
=
163 estacion_id distintos
```

---

# Generación de la colección `estaciones`

A partir de las combinaciones únicas estación-línea se generó automáticamente el catálogo de estaciones físicas.

Una estación perteneciente a una sola línea se representa conceptualmente como:

```javascript
{
  "_id": "balbuena",
  "nombre": "Balbuena",
  "lineas": ["1"]
}
```

Una estación de correspondencia puede contener varias líneas:

```javascript
{
  "_id": "balderas",
  "nombre": "Balderas",
  "lineas": ["1", "3"]
}
```

El resultado de esta transformación fue:

```text
163 documentos
```

en la colección lógica:

```text
estaciones
```

Estos documentos representan estaciones físicas, mientras que `afluencia_diaria` conserva el detalle estación-línea.

---

# Archivos generados

El proceso produjo dos archivos en formato **NDJSON**:

```text
procesados/
├── afluencia_diaria.ndjson
└── estaciones.ndjson
```

NDJSON almacena un documento JSON independiente por línea, lo cual resulta conveniente para manejar grandes cantidades de documentos y para su posterior importación a MongoDB.

---

## `afluencia_diaria.ndjson`

Contiene:

```text
379,470 documentos
```

Cada documento representa:

> La afluencia de una combinación estación-línea durante una fecha determinada.

Su estructura general es:

```javascript
{
  "fecha": {
    "$date": "2025-01-15T00:00:00Z"
  },

  "estacion_id": "balderas",

  "linea": "1",

  "afluencia": {
    "boleto": 0,
    "prepago": 15243,
    "gratuidad": 814,
    "total": 16057
  }
}
```

La fecha se exportó utilizando **Extended JSON** para conservar posteriormente su interpretación como BSON `Date` al importar la información en MongoDB.

---

## `estaciones.ndjson`

Inicialmente se generaron:

```text
163 documentos
```

con la estructura:

```javascript
{
  "_id": "balderas",
  "nombre": "Balderas",
  "lineas": ["1", "3"]
}
```

Posteriormente esta colección fue enriquecida con información geográfica.

---

# Reconciliación de la transformación

Antes de aceptar los archivos transformados se realizó una reconciliación entre el conjunto de datos original y los documentos resultantes.

Los resultados obtenidos fueron:

| Métrica                       |     Resultado |
| ----------------------------- | ------------: |
| Filas originales              |     1,138,410 |
| Documentos `afluencia_diaria` |       379,470 |
| Estaciones físicas            |           163 |
| Fecha mínima                  |    2021-01-01 |
| Fecha máxima                  |    2026-04-30 |
| Afluencia total               | 5,774,160,966 |
| Boleto                        |   770,301,660 |
| Prepago                       | 4,244,900,573 |
| Gratuidad                     |   758,958,733 |

Se verificó que:

```text
770,301,660
+ 4,244,900,573
+   758,958,733
─────────────────
= 5,774,160,966
```

Por lo tanto, la afluencia total fue conservada durante la transformación.

También se comprobó individualmente que las sumas de:

```text
Boleto
Prepago
Gratuidad
```

coincidieran antes y después del proceso.

---

# Validación de los documentos resultantes

Después de generar los archivos se comprobó físicamente que:

```text
afluencia_diaria.ndjson
= 379,470 documentos
```

y:

```text
estaciones.ndjson
= 163 documentos
```

Además, sobre `afluencia_diaria` se verificó:

* 1,946 fechas distintas;
* periodo de 2021-01-01 a 2026-04-30;
* 195 documentos por fecha;
* 195 combinaciones estación-línea;
* 163 estaciones referenciadas;
* ausencia de duplicados para:

```text
fecha + estacion_id + linea
```

* ausencia de afluencias negativas;
* cumplimiento de:

```text
afluencia.total
=
afluencia.boleto
+
afluencia.prepago
+
afluencia.gratuidad
```

para los documentos generados.

---

# Enriquecimiento geográfico de las estaciones

Posteriormente se utilizó el archivo `stops.txt` del conjunto GTFS para incorporar coordenadas a las estaciones.

El archivo GTFS contiene registros a nivel estación-línea.

Para el Metro se identificaron:

```text
195 registros estación-línea
```

correspondientes a:

```text
163 estaciones físicas
```

Esta estructura coincide con las dimensiones identificadas previamente en el conjunto de afluencia.

---

## Correspondencia de nombres

La mayoría de los nombres de las estaciones coincidieron directamente después de normalizar:

* mayúsculas y minúsculas;
* acentos;
* espacios;
* signos de puntuación.

Se identificaron algunas diferencias de nomenclatura entre ambas fuentes que fueron resueltas mediante equivalencias explícitas.

Entre ellas:

| Base de afluencia                 | GTFS                                |
| --------------------------------- | ----------------------------------- |
| Etiopía/Plaza de la Transparencia | Etiopía y Plaza de la Transparencia |
| Ferrería/Arena Ciudad de México   | Ferrería y Arena Ciudad de México   |
| Garibaldi/Lagunilla               | Garibaldi y Lagunilla               |
| La Villa/Basílica                 | La Villa y Basílica                 |
| Niños Héroes                      | Niños Héroes y Poder Judicial CDMX  |
| Viveros/Derechos Humanos          | Viveros y Derechos Humanos          |
| Zócalo/Tenochtitlan               | Zócalo                              |

Después de aplicar estas equivalencias se obtuvo correspondencia para todas las estaciones utilizadas en el proyecto.

---

# Coordenada representativa de una estación física

Las estaciones de correspondencia pueden presentar más de una coordenada en GTFS debido a que existen registros independientes para distintas líneas.

Por ejemplo, una estación física puede tener:

```text
Estación - Línea 1 → punto A
Estación - Línea 2 → punto B
Estación - Línea 3 → punto C
```

Sin embargo, la colección `estaciones` representa una **estación física**, no una plataforma o combinación estación-línea.

Por esta razón se calculó una coordenada representativa utilizando el promedio de los puntos GTFS asociados a una misma estación física:

```text
longitud representativa
=
promedio(longitudes GTFS)
```

```text
latitud representativa
=
promedio(latitudes GTFS)
```

Para estaciones pertenecientes únicamente a una línea, la coordenada representativa coincide directamente con el punto GTFS original.

---

## Interpretación de la coordenada

La ubicación almacenada debe interpretarse como:

> **Un punto geográfico representativo de la estación física.**

No debe interpretarse necesariamente como:

* una entrada específica;
* un torniquete;
* un andén;
* una plataforma exacta.

Esta distinción es especialmente importante en complejos de correspondencia donde diferentes líneas pueden encontrarse físicamente separadas.

---

# Representación GeoJSON

Las coordenadas fueron incorporadas a `estaciones.ndjson` mediante GeoJSON:

```javascript
{
  "_id": "balderas",

  "nombre": "Balderas",

  "lineas": ["1", "3"],

  "ubicacion": {
    "type": "Point",
    "coordinates": [
      longitud,
      latitud
    ]
  }
}
```

Se conservó el orden requerido por GeoJSON:

```text
[longitud, latitud]
```

y no:

```text
[latitud, longitud]
```

---

# Validación geográfica

Se verificó que las 163 estaciones contaran con el campo:

```text
ubicacion
```

y que todas utilizaran:

```text
type = "Point"
```

También se comprobaron los rangos estructurales de las coordenadas:

```text
-180 ≤ longitud ≤ 180
-90  ≤ latitud  ≤ 90
```

El rango observado para las estaciones fue:

```text
Longitud:
-99.21584 a -98.96094

Latitud:
19.28602 a 19.53451
```

lo cual resulta consistente con la ubicación geográfica de la Red del Metro de la Ciudad de México y su zona metropolitana.

Como validación adicional se planteó representar las 163 estaciones sobre un mapa para comprobar visualmente su distribución espacial.

---

# Modelo documental obtenido

Después de la transformación y el enriquecimiento geográfico, la solución queda compuesta por:

```text
                    estaciones
            ┌────────────────────────┐
            │ 163 documentos         │
            │                        │
            │ _id                    │
            │ nombre                 │
            │ lineas[]               │
            │ ubicacion              │
            │   GeoJSON Point        │
            └───────────┬────────────┘
                        │
                        │ estacion_id
                        │
                        ▼
                afluencia_diaria
            ┌────────────────────────┐
            │ 379,470 documentos     │
            │                        │
            │ fecha                  │
            │ estacion_id            │
            │ linea                  │
            │ afluencia              │
            │ ├── boleto             │
            │ ├── prepago            │
            │ ├── gratuidad          │
            │ └── total              │
            └────────────────────────┘
```

---

# Resultado de la etapa

La transformación permitió pasar de:

```text
Modelo tabular
1,138,410 filas
```

a:

```text
Modelo documental

379,470 documentos de afluencia
+
163 documentos de estaciones
```

conservando la información original de afluencia y separando:

```text
mediciones temporales
        ↓
afluencia_diaria
```

de:

```text
metadatos estables y geográficos
        ↓
estaciones
```
# Implementación en MongoDB y avance de la Semana 2

El modelo fue implementado en la base:

```text
metro_afluencia
```

con las colecciones:

```text
afluencia_diaria
estaciones
```

La carga final contiene:

| Colección          | Documentos |
| ------------------ | ---------: |
| `afluencia_diaria` |    379,470 |
| `estaciones`       |        163 |

Se verificó que:

* `fecha` se almacenara como BSON `date`;
* el periodo comprendiera del 1 de enero de 2021 al 30 de abril de 2026;
* existieran 195 documentos por fecha;
* no hubiera valores negativos;
* `afluencia.total` fuera igual a la suma de boleto, prepago y gratuidad;
* no existieran duplicados para `fecha + estacion_id + linea`; y
* todos los `estacion_id` existieran en la colección `estaciones`.

---

## Reproducción de la carga

El archivo:

```text
scripts/cargar_proyecto.js
```

permite reproducir la creación y carga desde una sesión autenticada de `mongosh`.

Cada integrante debe:

1. clonar el repositorio;
2. descomprimir `procesados.zip`;
3. entrar a MongoDB con sus propias credenciales; y
4. ejecutar desde la raíz del proyecto:

```javascript
load("scripts/cargar_proyecto.js")
```

El cargador crea las colecciones y sus validadores, carga los archivos NDJSON por lotes y verifica los conteos finales.

El script no almacena conexiones, usuarios ni contraseñas. También se detiene si detecta colecciones existentes, evitando duplicar o sobrescribir datos.

---

# Estrategia de indexación

Se evaluaron tres patrones de consulta:

1. evolución diaria agregada de la Línea 1 durante 2025;
2. historial diario agregado de Pantitlán durante 2025; y
3. diez estaciones con mayor afluencia acumulada durante 2025.

Las consultas A y B se implementaron como pipelines de agregación.

La Consulta A:

* filtra la Línea 1 y el periodo 2025;
* agrupa por `fecha`;
* suma `afluencia.total` de todas las estaciones de la línea; y
* ordena los resultados por fecha.

La Consulta B:

* filtra `estacion_id = "pantitlan"` y el periodo 2025;
* agrupa por `fecha`;
* suma `afluencia.total` de las cuatro líneas de la estación física; y
* ordena los resultados por fecha.

Antes de crear índices secundarios, las consultas utilizaban `COLLSCAN` y examinaban los 379,470 documentos.

Se crearon:

```javascript
{ linea: 1, fecha: 1 }
{ estacion_id: 1, fecha: 1 }
{ fecha: 1 }
```

Los resultados fueron:

| Consulta                                  | Plan antes | Plan después     | Resultados finales | Documentos antes/después | Tiempo antes/después |
| ----------------------------------------- | ---------- | ---------------- | -----------------: | -----------------------: | -------------------: |
| Línea 1 agrupada por fecha durante 2025   | `COLLSCAN` | `IXSCAN + FETCH` |                365 |          379,470 / 7,300 |        1,415 / 47 ms |
| Pantitlán agrupado por fecha durante 2025 | `COLLSCAN` | `IXSCAN + FETCH` |                365 |          379,470 / 1,460 |          206 / 32 ms |
| Top 10 estaciones durante 2025            | `COLLSCAN` | `IXSCAN + FETCH` |                 10 |         379,470 / 71,175 |         452 / 175 ms |

En la Consulta A, los 7,300 documentos estación-línea de la Línea 1 se agrupan para producir 365 resultados, uno por cada fecha de 2025.

En la Consulta B, los 1,460 documentos de Pantitlán —cuatro líneas por 365 días— se agrupan para producir 365 resultados diarios correspondientes a la estación física.

En ambas consultas permanecen las etapas `$group` y `$sort`, porque MongoDB debe sumar los valores por fecha y ordenar los resultados agregados. Los índices reducen el conjunto de documentos que llega a estas etapas, pero no eliminan el trabajo de agrupación.

En la Consulta C, el índice temporal reduce el conjunto inicial a los documentos de 2025, pero MongoDB todavía debe agrupar por estación y ordenar los resultados calculados.

Los tiempos son orientativos y pueden variar. La evidencia principal es:

* el cambio de `COLLSCAN` a `IXSCAN`;
* la reducción de `totalDocsExamined`; y
* la conservación de los resultados esperados.

Los índices también tienen costos de almacenamiento, memoria y mantenimiento durante las escrituras. Por este motivo se crearon únicamente a partir de patrones relevantes.

---

# Pruebas del validador

El `$jsonSchema` de `afluencia_diaria` se probó con:

* 2 documentos válidos, ambos aceptados;
* 1 documento sin `fecha`, rechazado;
* 1 documento con `fecha` como cadena, rechazado;
* 1 documento con afluencia negativa, rechazado; y
* 1 documento sin `afluencia.total`, rechazado.

Los documentos válidos utilizados para la prueba fueron eliminados al finalizar. La colección conservó sus 379,470 documentos reales.

También se comprobó mediante una consulta de integridad que:

```text
afluencia.total
=
afluencia.boleto
+
afluencia.prepago
+
afluencia.gratuidad
```

No se encontraron documentos que incumplieran esta igualdad.

---

---

# Implementación geoespacial y avance de la Semana 3

Se implementó el componente geoespacial del proyecto sobre la colección `estaciones`, utilizando el campo `ubicacion` para representar las coordenadas de cada estación.

La consulta desarrollada responde la siguiente pregunta:

> ¿Cuáles son las estaciones ubicadas a una distancia máxima de 2 km del Zócalo de la Ciudad de México y cuál fue su afluencia acumulada durante 2025?

---

## Validación geoespacial

El campo `ubicacion` de la colección `estaciones` utiliza una geometría GeoJSON de tipo `Point`:

```javascript
ubicacion: {
    type: "Point",
    coordinates: [longitud, latitud]
}
```

El `$jsonSchema` de la colección valida:

* que `ubicacion` sea un objeto;
* que `type` sea `Point`;
* que `coordinates` contenga exactamente dos valores;
* que la longitud se encuentre entre -180 y 180; y
* que la latitud se encuentre entre -90 y 90.

Para comprobar el funcionamiento del validador se realizaron cuatro casos de prueba:

* una geometría `Point` válida, aceptada correctamente;
* una geometría de tipo `Polygon`, rechazada;
* una longitud fuera del intervalo permitido, rechazada; y
* una latitud fuera del intervalo permitido, rechazada.

Los documentos utilizados durante las pruebas fueron eliminados al finalizar, por lo que no permanecen registros de prueba en la colección.

Las pruebas se encuentran en:

```text
scripts/probar_validador_estaciones_geo.js
```

---

## Índice geoespacial `2dsphere`

Para soportar consultas espaciales sobre las estaciones se creó un índice `2dsphere` sobre el campo `ubicacion`:

```javascript
db.estaciones.createIndex(
    { ubicacion: "2dsphere" },
    { name: "idx_estaciones_ubicacion_2dsphere" }
);
```

El índice fue incorporado al archivo:

```text
scripts/crear_indices.js
```

Su creación se verificó mediante `getIndexes()`, obteniendo el índice:

```text
idx_estaciones_ubicacion_2dsphere
```

sobre:

```javascript
{ ubicacion: "2dsphere" }
```

Este índice permite realizar consultas de proximidad utilizando las coordenadas GeoJSON almacenadas en la colección `estaciones`.

---

## Consulta geoespacial

La consulta utiliza `$geoNear` para localizar estaciones a una distancia máxima de 2,000 metros del Zócalo de la Ciudad de México.

El punto de referencia utilizado es:

```javascript
{
    type: "Point",
    coordinates: [-99.133331, 19.432781]
}
```

Las coordenadas mantienen el orden requerido por GeoJSON:

```text
[longitud, latitud]
```

La selección espacial se realiza mediante:

```javascript
$geoNear: {
    near: zocalo,
    key: "ubicacion",
    distanceField: "distancia_m",
    maxDistance: 2000,
    spherical: true
}
```

Posteriormente, mediante `$lookup`, las estaciones seleccionadas se relacionan con la colección `afluencia_diaria`.

Para cada estación se calcula la suma de `afluencia.total` correspondiente al periodo:

```text
2025-01-01 <= fecha < 2026-01-01
```

De esta forma, el pipeline combina la selección geoespacial con la afluencia acumulada durante 2025.

La consulta se encuentra en:

```text
scripts/consulta_geoespacial.js
```

---

## Casos de control de la consulta geoespacial

Para comprobar el comportamiento de la selección espacial se utilizaron dos estaciones conocidas:

* `zocalo_tenochtitlan` como estación cercana que debía quedar incluida;
* `acatitla` como estación lejana que debía quedar excluida.

Las pruebas confirmaron que:

* `zocalo_tenochtitlan` fue incluida correctamente;
* `acatitla` fue excluida correctamente;
* se seleccionaron 20 estaciones;
* ninguna estación seleccionada supera los 2,000 metros; y
* la mayor distancia obtenida fue de 1,872.67 metros.

Las pruebas se encuentran en:

```text
scripts/probar_consulta_geoespacial.js
```

---

## Resultados geoespaciales

La consulta identificó **20 estaciones** dentro de una distancia máxima de 2 km del Zócalo.

Entre las estaciones seleccionadas, **Pino Suárez** presentó la mayor afluencia acumulada durante 2025, con:

```text
19,941,218
```

Los resultados completos, incluyendo las estaciones seleccionadas, sus distancias y la afluencia acumulada durante 2025, se encuentran en:

```text
resultados/resultados_geoespaciales.md
```

---

## Limitaciones del análisis geoespacial

La distancia obtenida representa proximidad geográfica entre coordenadas y no equivale directamente a la distancia recorrida dentro de la red del Metro, al tiempo de traslado ni a la accesibilidad.

Asimismo, la afluencia acumulada permite comparar las estaciones seleccionadas, pero no demuestra que la cercanía al Zócalo sea la causa de una mayor o menor afluencia.

---

# Análisis temporal y avance de la Semana 4

Se implementó un análisis temporal sobre la colección `afluencia_diaria` para estudiar la evolución de la afluencia del Metro durante 2025.

La consulta desarrollada responde la siguiente pregunta:

> ¿Cómo evolucionó la afluencia total del Metro de la Ciudad de México durante 2025?

---

## Estructura temporal

El análisis utiliza el campo `fecha` de la colección `afluencia_diaria`.

Se verificó que los **379,470 documentos** de la colección almacenan este campo utilizando BSON `Date`.

El periodo disponible comprende:

```text
Fecha mínima: 2021-01-01
Fecha máxima: 2026-04-30
```

Las características temporales utilizadas son:

* campo temporal: `fecha`;
* tipo BSON: `Date`;
* granularidad: diaria; y
* zona horaria utilizada: UTC.

---

## Consulta por intervalo

Para analizar exclusivamente 2025 se utiliza el intervalo semiabierto:

```text
[2025-01-01, 2026-01-01)
```

La condición utilizada es:

```javascript
fecha: {
    $gte: ISODate("2025-01-01T00:00:00Z"),
    $lt: ISODate("2026-01-01T00:00:00Z")
}
```

Este intervalo incluye el 1 de enero de 2025 y excluye el 1 de enero de 2026.

La selección contiene **71,175 documentos** correspondientes a 2025.

---

## Índice para la consulta temporal

La colección `afluencia_diaria` ya dispone del índice:

```javascript
{
    fecha: 1
}
```

con nombre:

```text
idx_fecha
```

Este índice corresponde al campo utilizado para restringir el intervalo temporal, por lo que no fue necesario incorporar un índice adicional para este análisis.

---

## Pipeline temporal

El pipeline agrupa las observaciones por mes mediante `$dateToString` y calcula como indicador la suma de `afluencia.total`.

Los periodos se generan con el formato:

```text
2025-01
2025-02
...
2025-12
```

La consulta produjo los **12 periodos mensuales esperados**.

El pipeline se encuentra en:

```text
scripts/consulta_temporal.js
```

---

## Pruebas de la consulta temporal

Para comprobar el comportamiento del intervalo se utilizaron fechas conocidas.

Las pruebas confirmaron que:

* `2025-01-01` fue incluida correctamente como límite inferior;
* `2025-12-31` fue incluida correctamente dentro del intervalo;
* `2026-01-01` existe en la base, pero fue excluida correctamente por el límite superior `$lt`; y
* el agrupamiento produjo exactamente 12 periodos mensuales.

Las pruebas se encuentran en:

```text
scripts/probar_consulta_temporal.js
```

---

## Resultados temporales

La afluencia mensual obtenida para 2025 fue:

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

El menor valor mensual se registró en **febrero**, con **94,273,723**, mientras que **noviembre** presentó la mayor afluencia, con **120,635,447**.

Los resultados completos se encuentran en:

```text
resultados/resultados_temporales.md
```

---

## Limitaciones del análisis temporal

El análisis permite observar la evolución mensual de la afluencia durante 2025, pero no permite determinar por sí solo las causas de las variaciones entre periodos.

Para explicar estas diferencias sería necesario incorporar información adicional, como días festivos, eventos, interrupciones del servicio u otras condiciones externas.

---


# Archivos del avance

```text
scripts/
├── cargar_proyecto.js
├── consultas_antes_indices.js
├── consultas_despues_indices.js
├── crear_indices.js
├── probar_validador_afluencia.js
├── probar_validador_estaciones_geo.js
├── consulta_geoespacial.js
├──  probar_consulta_geoespacial.js
├── consulta_temporal.js
└── probar_consulta_temporal.js

resultados/
├── comparacion_indices.md
├── medicion_antes_indices.txt
├── medicion_despues_indices.txt
├── pruebas_validador_afluencia.txt
├── resultados_geoespaciales.md
└── resultados_temporales.md
```

Los archivos de `resultados/` conservan el detalle de las mediciones, pruebas, resultados e interpretaciones realizadas.

---
# Semana 5 — Búsqueda, seguridad, privacidad e integración

## 1. Decisión sobre búsqueda textual y búsqueda por patrones

Como parte del diseño del proyecto se evaluó la pertinencia de incorporar mecanismos de búsqueda mediante índices de texto (`$text`) o expresiones regulares (`regex`).

Se decidió no implementar búsqueda textual ni búsqueda mediante expresiones regulares porque el conjunto de datos no contiene campos de texto libre relevantes para las preguntas analíticas del proyecto.

Los principales atributos utilizados son estructurados:

* `fecha`;
* `estacion_id`;
* `linea`;
* `afluencia`;
* `ubicacion`; y
* `nombre` de la estación.

Los campos textuales, como el nombre de una estación o la línea, funcionan como identificadores o categorías conocidas y pueden consultarse mediante coincidencias exactas.

Por ejemplo:

```javascript
{
    estacion_id: "pantitlan"
}
```

Las preguntas principales del proyecto se resuelven mediante:

* filtros por igualdad;
* rangos temporales;
* aggregation pipelines;
* agrupaciones;
* índices simples y compuestos; y
* consultas geoespaciales.

Incorporar un índice `text` o utilizar expresiones regulares no resolvería una necesidad real del proyecto y añadiría complejidad sin aportar una mejora relevante a los patrones de consulta definidos.

---

## 2. Clasificación de la información

Los datos analizados en el proyecto provienen de fuentes públicas y abiertas.

La clasificación utilizada es la siguiente:

| Información               | Clasificación        | Justificación                                                 |
| ------------------------- | -------------------- | ------------------------------------------------------------- |
| Afluencia diaria          | Pública              | Proviene de información pública de afluencia del Metro        |
| Nombre de estación        | Pública              | Forma parte de la información pública de la red               |
| Línea                     | Pública              | Información pública de la red                                 |
| Coordenadas de estaciones | Pública              | Se obtienen de información geográfica pública                 |
| Indicadores calculados    | Pública derivada     | Se obtienen mediante agregaciones de información pública      |
| Scripts y modelo MongoDB  | Interna del proyecto | Son productos desarrollados por el equipo                     |
| Usuarios y contraseñas    | Confidencial         | Son elementos de autenticación y no forman parte de los datos |

El conjunto de datos no contiene información personal identificable de las personas usuarias del Metro.

En particular, no se almacenan:

* nombres de pasajeros;
* identificadores personales;
* números de tarjeta;
* información financiera individual;
* trayectorias individuales;
* ubicaciones individuales; ni
* historiales de viaje asociados con personas.

La unidad de análisis corresponde a afluencia agregada por estación, línea y fecha, no a pasajeros individuales.

---

## 3. Privacidad y minimización de datos

Debido a que el proyecto utiliza información pública y agregada, no es necesario aplicar técnicas de anonimización, seudonimización o enmascaramiento sobre los datos de afluencia.

Sin embargo, se aplica el principio de minimización de datos: el sistema almacena únicamente la información necesaria para responder las preguntas analíticas definidas.

La colección `afluencia_diaria` contiene:

```text
fecha
estacion_id
linea
afluencia
```

La colección `estaciones` contiene los metadatos estables:

```text
_id
nombre
lineas
ubicacion
```

Esta separación evita duplicar información geográfica y descriptiva dentro de los 379,470 documentos de afluencia diaria.

También permite que las consultas devuelvan solamente los campos necesarios para cada análisis.

---

## 4. Seguridad de la base de datos

Aunque los datos almacenados son públicos, esto no significa que cualquier usuario deba tener permisos para modificar la base de datos.

Los controles de acceso protegen:

* la integridad de los documentos;
* la estructura de las colecciones;
* los índices;
* los validadores;
* la configuración de MongoDB; y
* las credenciales de acceso.

Se aplica el principio de mínimo privilegio, mediante el cual cada usuario recibe solamente los permisos necesarios para realizar sus actividades.

---

## 5. Roles definidos

Se definieron tres perfiles de acceso.

### Administrador

Es responsable de la configuración y mantenimiento general de la base de datos.

Puede realizar operaciones de:

* lectura;
* escritura;
* eliminación;
* administración de colecciones;
* administración de índices;
* modificación de validadores; y
* administración de usuarios y roles.

### Carga y mantenimiento

Es responsable de incorporar o actualizar información.

Puede:

* consultar documentos;
* insertar documentos; y
* actualizar documentos.

No puede:

* eliminar documentos;
* crear o eliminar colecciones;
* crear o eliminar índices;
* modificar validadores; ni
* administrar usuarios o roles.

Para este perfil se creó el rol personalizado `cargaMantenimiento`.

### Consulta o analista

Es responsable de ejecutar las consultas y análisis del proyecto.

Dispone únicamente de permisos de lectura y puede ejecutar:

* consultas de afluencia;
* aggregation pipelines de lectura;
* análisis temporal;
* consultas geoespaciales;
* consultas por estación;
* consultas por línea; e
* indicadores agregados.

No puede insertar, actualizar ni eliminar documentos.

---

## 6. Asignación de roles

| Integrante | Perfil                |
| ---------- | --------------------- |
| Ricardo    | Administrador         |
| Sebastian  | Carga y mantenimiento |
| Marcos     | Consulta o analista   |
| Manuel     | Consulta o analista   |

Esta asignación se utiliza con fines de diseño y demostración del modelo de seguridad.

---

## 7. Matriz de privilegios

| Operación                     | Administrador | Carga y mantenimiento | Consulta o analista |
| ----------------------------- | :-----------: | :-------------------: | :-----------------: |
| Consultar documentos          |       Sí      |           Sí          |          Sí         |
| Ejecutar pipelines de lectura |       Sí      |           Sí          |          Sí         |
| Insertar documentos           |       Sí      |           Sí          |          No         |
| Actualizar documentos         |       Sí      |           Sí          |          No         |
| Eliminar documentos           |       Sí      |           No          |          No         |
| Crear colecciones             |       Sí      |           No          |          No         |
| Modificar validadores         |       Sí      |           No          |          No         |
| Crear o eliminar índices      |       Sí      |           No          |          No         |
| Administrar usuarios          |       Sí      |           No          |          No         |
| Administrar roles             |       Sí      |           No          |          No         |

La matriz sigue el principio de mínimo privilegio: ningún usuario recibe permisos adicionales si no son necesarios para cumplir su función.

---

## 8. Implementación de roles y usuarios

La configuración se encuentra en:

```text
scripts/seguridad_crear_usuarios.js
```

El script utiliza las bases administrativas correspondientes sin almacenar credenciales:

```javascript
const adminDB = db.getSiblingDB("admin");
const metroDB = db.getSiblingDB("metro_afluencia");
```

### Rol personalizado de carga y mantenimiento

El rol `cargaMantenimiento` se crea en la base `metro_afluencia` con las acciones:

```javascript
[
    "find",
    "insert",
    "update"
]
```

El rol no incluye la acción `remove`, por lo que no permite eliminar documentos.

Conceptualmente, su definición es:

```javascript
metroDB.createRole({
    role: "cargaMantenimiento",

    privileges: [
        {
            resource: {
                db: "metro_afluencia",
                collection: ""
            },

            actions: [
                "find",
                "insert",
                "update"
            ]
        }
    ],

    roles: []
});
```

### Usuarios

Los perfiles utilizan los siguientes roles:

| Usuario           | Rol                  | Base del rol      |
| ----------------- | -------------------- | ----------------- |
| `ricardo_admin`   | `dbOwner`            | `metro_afluencia` |
| `sebastian_carga` | `cargaMantenimiento` | `metro_afluencia` |
| `marcos_consulta` | `read`               | `metro_afluencia` |
| `manuel_consulta` | `read`               | `metro_afluencia` |

El script comprueba si el rol y los usuarios ya existen antes de intentar crearlos, evitando duplicarlos.

---

## 9. Manejo seguro de credenciales

Las credenciales no se almacenan directamente dentro del código fuente.

Para solicitar cada contraseña durante la ejecución se utiliza:

```javascript
passwordPrompt()
```

Las contraseñas reales, cadenas de conexión y otros secretos de autenticación no deben almacenarse en:

* scripts `.js`;
* archivos `.md`;
* archivos de resultados;
* capturas de pantalla;
* commits; ni
* repositorios Git.

Cada integrante debe conectarse utilizando sus propias credenciales y proporcionar la contraseña de manera interactiva.

---

## 10. Cifrado en el entorno objetivo

En un entorno productivo, las conexiones con MongoDB deben protegerse mediante TLS para cifrar la información transmitida entre los clientes y el servidor.

Las cadenas de conexión del entorno objetivo deberán habilitar TLS y validar el certificado del servidor.

La información almacenada también deberá protegerse mediante cifrado del volumen o del sistema de archivos donde se encuentren los archivos de MongoDB y sus respaldos.

El entorno local utilizado para este proyecto tiene fines académicos y demostrativos. Por ello, la implementación se concentra en autenticación, roles, privilegio mínimo y manejo seguro de credenciales. La configuración completa de certificados TLS y cifrado del almacenamiento dependerá de la infraestructura del entorno objetivo.

---

## 11. Salida minimizada para usuarios de consulta

El archivo:

```text
scripts/salida_minimizada.js
```

implementa una consulta que devuelve únicamente:

* nombre de la estación; y
* líneas asociadas.

No devuelve el identificador interno ni el documento completo.

La consulta utiliza una proyección explícita:

```javascript
{
    _id: 0,
    nombre: 1,
    lineas: 1
}
```

También limita la salida a diez documentos y los ordena por nombre.

La minimización de la salida no sustituye el control de acceso, sino que lo complementa.

---

## 12. Prueba de privilegio mínimo

La prueba se encuentra en:

```text
scripts/seguridad_probar_consulta.js
```

Debe ejecutarse utilizando un usuario con rol de consulta.

La prueba comprueba:

1. el usuario autenticado y sus roles;
2. una lectura permitida sobre `afluencia_diaria`; y
3. una inserción que debe ser rechazada por falta de privilegios.

El comportamiento esperado es:

```text
CORRECTO: la lectura fue permitida.
CORRECTO: la escritura fue rechazada por falta de privilegios.
```

El script distingue una denegación por autorización de otros errores posibles.

Si una inserción fuera permitida inesperadamente, lo reportará como error y tratará de eliminar únicamente el documento de prueba. Si el usuario no dispone de permiso para eliminarlo, mostrará su `_id` para que un administrador pueda realizar la limpieza.

La denegación solamente debe documentarse como comprobada después de ejecutar el script con autenticación habilitada y un usuario de consulta.

---

## 13. Orden de ejecución del proyecto

Desde una base disponible para una carga nueva, el orden recomendado es:

### 1. Crear las colecciones, aplicar validadores y cargar los datos

```javascript
load("scripts/cargar_proyecto.js")
```

### 2. Ejecutar las mediciones sin índices secundarios

```javascript
load("scripts/consultas_antes_indices.js")
```

### 3. Crear y verificar los índices

```javascript
load("scripts/crear_indices.js")
```

### 4. Repetir las mediciones con índices

```javascript
load("scripts/consultas_despues_indices.js")
```

### 5. Probar el validador de afluencia

```javascript
load("scripts/probar_validador_afluencia.js")
```

### 6. Probar el validador geoespacial

```javascript
load("scripts/probar_validador_estaciones_geo.js")
```

### 7. Ejecutar y probar el análisis temporal

```javascript
load("scripts/consulta_temporal.js")
load("scripts/probar_consulta_temporal.js")
```

### 8. Ejecutar y probar el análisis geoespacial

```javascript
load("scripts/consulta_geoespacial.js")
load("scripts/probar_consulta_geoespacial.js")
```

### 9. Crear los roles y usuarios

Este paso debe ejecutarse con un usuario que tenga permisos para administrar roles y usuarios:

```javascript
load("scripts/seguridad_crear_usuarios.js")
```

### 10. Probar el privilegio mínimo

Después se debe abrir una sesión nueva con uno de los usuarios de consulta y ejecutar:

```javascript
load("scripts/seguridad_probar_consulta.js")
```

### 11. Ejecutar la salida minimizada

Con el mismo usuario de consulta:

```javascript
load("scripts/salida_minimizada.js")
```

Los archivos de datos contenidos en `procesados.zip` deben descomprimirse antes de ejecutar `cargar_proyecto.js`.

---

## 14. Evidencias del proyecto

Las evidencias disponibles se encuentran en:

```text
resultados/
├── comparacion_indices.md
├── medicion_antes_indices.txt
├── medicion_despues_indices.txt
├── pruebas_validador_afluencia.txt
├── resultados_geoespaciales.md
└── resultados_temporales.md
```

Después de ejecutar las pruebas de seguridad se deberá incorporar la salida correspondiente, sin incluir contraseñas ni cadenas de conexión.

Cada evidencia debe indicar:

* qué se ejecutó;
* qué resultado produjo; y
* qué demuestra.

---

## 15. Estado de la Semana 5

| Elemento                                         | Estado                    |
| ------------------------------------------------ | ------------------------- |
| Evaluación de `$text` y regex                    | Completado                |
| Justificación de no implementar búsqueda textual | Completado                |
| Clasificación de datos                           | Completado                |
| Identificación de datos personales               | Completado                |
| Estrategia de minimización                       | Completado                |
| Matriz de roles                                  | Completado                |
| Principio de mínimo privilegio                   | Completado                |
| Estrategia para credenciales                     | Completado                |
| Diseño de usuarios MongoDB                       | Completado                |
| Rol personalizado de carga                       | Completado                |
| Consideraciones de cifrado                       | Completado                |
| Salida minimizada para consulta                  | Completado                |
| Orden completo de ejecución                      | Completado                |
| Prueba real de permisos                          | Pendiente de ejecución    |
| Evidencia de la prueba de seguridad              | Pendiente de ejecución    |
| Integración reproducible final                   | Pendiente de comprobación |
