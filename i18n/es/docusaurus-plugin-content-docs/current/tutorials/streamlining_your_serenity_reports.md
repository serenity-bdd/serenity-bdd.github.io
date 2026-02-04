---
sidebar_position: 6
---

# Tres estrategias para optimizar tus reportes de Serenity BDD

Serenity BDD destaca por su capacidad de producir reportes detallados e informativos. Estos reportes ofrecen información no solo sobre las pruebas ejecutadas, sino también sobre el cumplimiento de los requisitos de negocio. Pero como todas las herramientas, obtener el máximo provecho de Serenity BDD implica algunos ajustes y optimizaciones.

Aquí hay tres estrategias para hacer tus reportes de Serenity BDD más eficientes:

1. **Mantente actualizado**

   Asegúrate de trabajar con la última versión de Serenity BDD, idealmente 4.0.12 o más reciente. Con cada actualización, encontrarás varias optimizaciones para mejorar el rendimiento de los reportes y minimizar los archivos generados. Por ejemplo, la generación de reportes estándar en la versión 4.0.11 es hasta 10 veces más rápida que en la 3.9.8.

2. **Desactiva el reporte de duración**

   Por defecto, Serenity BDD genera reportes detallados sobre el tiempo de ejecución de cada prueba. Aunque estos reportes son más ricos en información, consumen más espacio en disco. Para proyectos grandes donde el espacio en disco se convierte en un problema, considera desactivar el reporte de duración. Esto se puede hacer estableciendo el flag `serenity.report.test.durations` en false. Como prueba de su eficacia, un proyecto con más de 11,000 pruebas vio cómo el tamaño de su reporte se redujo de 397M a 250M, y el tiempo de generación se redujo a la mitad.

3. **Limita las capturas de pantalla a pruebas fallidas**

   Al realizar pruebas web, un enfoque útil para conservar espacio es capturar capturas de pantalla exclusivamente para pruebas fallidas. Logra esto ajustando la propiedad `serenity.take.screenshots` a FOR_FAILURES. Este ajuste no solo acelera las pruebas sino que también reduce el tamaño del reporte. Ten en cuenta, sin embargo, que esto podría reducir ligeramente el detalle en tus reportes.

Aprovecha el poder de Serenity BDD de manera más efectiva aplicando estas estrategias y disfruta de una experiencia de reportes de pruebas optimizada.
