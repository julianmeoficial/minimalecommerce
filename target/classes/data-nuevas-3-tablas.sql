-- Solo ejecutar después de que las nuevas tablas se hayan creado

-- Insertar eventos solo si la tabla está vacía
INSERT INTO evento (titulo, descripcion, fechainicio, fechafin, imagen, ubicacion, activo, fechacreacion, usuarioid)
SELECT * FROM (
                  SELECT 'Lanzamiento Productos Tecnología' as titulo, 'Evento de lanzamiento de nuevos productos tecnológicos' as descripcion, '2025-07-15 10:00:00' as fechainicio, '2025-07-15 18:00:00' as fechafin, 'evento-tech.jpg' as imagen, 'Centro de Convenciones' as ubicacion, true as activo, NOW() as fechacreacion, 2 as usuarioid
                  UNION SELECT 'Feria del Hogar', 'Exposición de productos para el hogar y decoración', '2025-08-01 09:00:00', '2025-08-03 20:00:00', 'feria-hogar.jpg', 'Plaza Central', true, NOW(), 2
                  UNION SELECT 'Fashion Week', 'Semana de la moda con las últimas tendencias', '2025-09-10 16:00:00', '2025-09-12 22:00:00', 'fashion-week.jpg', 'Centro Comercial', true, NOW(), 2
              ) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM evento LIMIT 1);

-- Insertar artículos de blog solo si la tabla está vacía
INSERT INTO blog (titulo, contenido, imagen, fechapublicacion, publicado, resumen, autorid, categoriaid)
SELECT * FROM (
                  SELECT 'Guía de Compra: Mejores Smartphones 2025' as titulo, 'En este artículo te ayudamos a elegir el mejor smartphone según tus necesidades y presupuesto...' as contenido, 'blog-smartphones.jpg' as imagen, NOW() as fechapublicacion, true as publicado, 'Guía completa para elegir el smartphone perfecto' as resumen, 2 as autorid, 1 as categoriaid
                  UNION SELECT 'Tendencias en Decoración del Hogar', 'Descubre las últimas tendencias en decoración que transformarán tu hogar este año...', 'blog-decoracion.jpg', NOW(), true, 'Las tendencias de decoración más populares', 2, 2
                  UNION SELECT 'Cuidado de Mascotas en Verano', 'Consejos esenciales para mantener a tus mascotas seguras y cómodas durante el verano...', 'blog-mascotas.jpg', NOW(), true, 'Tips para cuidar a tus mascotas en clima cálido', 2, 4
              ) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM blog LIMIT 1);