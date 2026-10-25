# 0005 · Conservar la evolución y añadir regresiones

La auditoría se reproduce sobre af35a8e. Durante la preparación aparecieron
bbe2f59 (restauración), 7f67616 (Atlas v1.0), 2d7983a (imágenes eager) y f09a07b
(portal Atlas y v11 en ligera/). 4d320ee añadió Sylva. La propuesta parte de 4d320ee y conserva esos
cambios en vez de aplicar un árbol histórico sobre ellos.

Se actualizan procedencia e instrucciones y se añaden comprobación HTTP con
prefijo Pages, .nojekyll, huellas de entradas y preservación de 330 archivos
históricos y 531 de la base. Los documentos anteriores que cambian se archivan.

Duplicar assets o restaurar v11 en la raíz ya no corresponde al diseño de la
base elegida. Se conservan el Atlas completo y sus 169 archivos. Los riesgos,
pruebas, pendientes y retorno por commit de reversión figuran en el informe.
NO_GO permanece: un resultado CI no adjudica Moodle ni la exactitud científica.
