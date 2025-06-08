-- Eventos de ejemplo
INSERT IGNORE INTO evento (titulo, descripcion, fechainicio, fechafin, imagen, ubicacion, activo, fechacreacion, usuarioid) VALUES
('Lanzamiento Productos Tecnología', 'Evento de lanzamiento de nuevos productos tecnológicos', '2025-07-15 10:00:00', '2025-07-15 18:00:00', 'evento-tech.jpg', 'Centro de Convenciones', true, NOW(), 2),
('Feria del Hogar', 'Exposición de productos para el hogar y decoración', '2025-08-01 09:00:00', '2025-08-03 20:00:00', 'feria-hogar.jpg', 'Plaza Central', true, NOW(), 2),
('Fashion Week', 'Semana de la moda con las últimas tendencias', '2025-09-10 16:00:00', '2025-09-12 22:00:00', 'fashion-week.jpg', 'Centro Comercial', true, NOW(), 2);

-- Artículos de blog
INSERT IGNORE INTO blog (titulo, contenido, imagen, fechapublicacion, publicado, resumen, autorid, categoriaid) VALUES
('Guía de Compra: Mejores Smartphones 2025', 'En este artículo te ayudamos a elegir el mejor smartphone según tus necesidades y presupuesto...', 'blog-smartphones.jpg', NOW(), true, 'Guía completa para elegir el smartphone perfecto', 2, 1),
('Tendencias en Decoración del Hogar', 'Descubre las últimas tendencias en decoración que transformarán tu hogar este año...', 'blog-decoracion.jpg', NOW(), true, 'Las tendencias de decoración más populares', 2, 2),
('Cuidado de Mascotas en Verano', 'Consejos esenciales para mantener a tus mascotas seguras y cómodas durante el verano...', 'blog-mascotas.jpg', NOW(), true, 'Tips para cuidar a tus mascotas en clima cálido', 2, 4);

-- Preórdenes de ejemplo
INSERT IGNORE INTO preorden (usuarioid, productoid, cantidad, fechapreorden, fechaestimadaentrega, estado, preciopreorden, notas) VALUES
(1, 1, 1, NOW(), '2025-07-01 00:00:00', 'PENDIENTE', 699.99, 'Preorden del nuevo modelo de smartphone'),
(1, 2, 1, NOW(), '2025-07-15 00:00:00', 'CONFIRMADA', 899.99, 'Laptop para trabajo remoto'),
(3, 4, 1, NOW(), '2025-08-01 00:00:00', 'PRODUCCION', 450.00, 'Sofá personalizado color gris');
