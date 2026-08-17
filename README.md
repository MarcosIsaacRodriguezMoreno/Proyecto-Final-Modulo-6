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

## Componentes del proyecto

Durante el desarrollo se implementarán progresivamente:

* modelo documental;
* carga reproducible de datos;
* consultas simples y aggregation pipelines;
* análisis temporal;
* estrategia de indexación;
* comparación mediante `explain("executionStats")`;
* validación mediante `$jsonSchema`;
* pruebas con documentos válidos e inválidos;
* incorporación de información geográfica;
* consultas geoespaciales;
* interpretación de resultados;
* análisis de limitaciones y posibles mejoras.

---

