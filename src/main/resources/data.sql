-- Insertar categorías solo si no existen
INSERT IGNORE INTO categoria (nombre, descripcion) VALUES
('Tecnologia', 'Productos tecnológicos y electrónicos modernos'),
('Hogar', 'Artículos para el hogar y decoración'),
('Moda', 'Ropa, calzado y accesorios de moda'),
('Mascotas', 'Productos para el cuidado y bienestar de mascotas'),
('Manualidades', 'Materiales y herramientas para manualidades y arte');

-- Insertar productos solo si no existen
INSERT IGNORE INTO producto (nombre, descripcion, precio, stock, imagen, categoriaid, fechacreacion, activo) VALUES
-- Tecnología
('Smartphone Samsung Galaxy', 'Teléfono inteligente con pantalla AMOLED y cámara de 108MP', 699.99, 25, 'smartphone-samsung.jpg', 1, NOW(), true),
('Laptop Dell Inspiron', 'Computadora portátil para trabajo y estudio con procesador Intel i5', 899.99, 15, 'laptop-dell.jpg', 1, NOW(), true),
('Auriculares Bluetooth', 'Auriculares inalámbricos con cancelación de ruido', 149.99, 40, 'auriculares-bt.jpg', 1, NOW(), true),

-- Hogar
('Sofá 3 Plazas Moderno', 'Sofá cómodo tapizado en tela gris para sala de estar', 450.00, 8, 'sofa-moderno.jpg', 2, NOW(), true),
('Mesa de Centro Minimalista', 'Mesa de centro de madera con diseño minimalista', 180.00, 12, 'mesa-centro.jpg', 2, NOW(), true),
('Lámpara LED de Mesa', 'Lámpara de escritorio con luz LED regulable', 45.99, 30, 'lampara-led.jpg', 2, NOW(), true),

-- Moda
('Camiseta Polo Clásica', 'Camiseta polo de algodón 100% en varios colores', 29.99, 50, 'polo-clasica.jpg', 3, NOW(), true),
('Jeans Slim Fit', 'Pantalón jeans de corte moderno y cómodo', 59.99, 35, 'jeans-slim.jpg', 3, NOW(), true),
('Zapatillas Deportivas', 'Calzado deportivo para uso diario y ejercicio', 89.99, 28, 'zapatillas-sport.jpg', 3, NOW(), true),

-- Mascotas
('Collar Ajustable para Perro', 'Collar cómodo y resistente para perros medianos y grandes', 15.99, 30, 'collar-perro.jpg', 4, NOW(), true),
('Juguete Interactivo Gato', 'Juguete con plumas para estimular el juego de los gatos', 12.50, 45, 'juguete-gato.jpg', 4, NOW(), true),
('Cama Ortopédica Mascota', 'Cama cómoda con soporte ortopédico para mascotas', 65.00, 18, 'cama-mascota.jpg', 4, NOW(), true),

-- Manualidades
('Kit de Pintura Acrílica', 'Set completo con pinceles y pinturas acrílicas de colores', 75.50, 20, 'kit-pintura.jpg', 5, NOW(), true),
('Papel para Scrapbook', 'Hojas decorativas para proyectos de scrapbooking', 25.99, 60, 'papel-scrap.jpg', 5, NOW(), true),
('Tijeras de Precisión', 'Tijeras profesionales para trabajos de manualidades', 18.75, 35, 'tijeras-precision.jpg', 5, NOW(), true);

-- Insertar usuarios demo solo si no existen
INSERT IGNORE INTO usuario (nombre, email, password, telefono, direccion, fecharegistro, activo, tipousuario) VALUES
('Comprador Demo', 'comprador@minimalecommerce.com', 'password123', '555-0123', 'Calle Principal 123, Ciudad', NOW(), true, 'COMPRADOR'),
('Vendedor Demo', 'vendedor@minimalecommerce.com', 'password123', '555-0456', 'Avenida Comercial 456, Ciudad', NOW(), true, 'VENDEDOR'),
('María González', 'maria@test.com', 'password123', '555-0789', 'Calle Secundaria 789, Ciudad', NOW(), true, 'COMPRADOR');
