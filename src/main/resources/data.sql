-- Versión mejorada del data.sql
-- Insertar categorías solo si no existen
INSERT INTO categoria (nombre, descripcion)
SELECT * FROM (
                  SELECT 'Tecnologia' as nombre, 'Productos tecnológicos y electrónicos modernos' as descripcion
                  UNION SELECT 'Hogar', 'Artículos para el hogar y decoración'
                  UNION SELECT 'Moda', 'Ropa, calzado y accesorios de moda'
                  UNION SELECT 'Mascotas', 'Productos para el cuidado y bienestar de mascotas'
                  UNION SELECT 'Manualidades', 'Materiales y herramientas para manualidades y arte'
              ) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM categoria LIMIT 1);

-- Insertar usuarios demo solo si la tabla está vacía
INSERT INTO usuario (nombre, email, password, telefono, direccion, fecharegistro, activo, tipousuario)
SELECT * FROM (
                  SELECT 'Comprador Demo' as nombre, 'comprador@minimalecommerce.com' as email, 'password123' as password, '555-0123' as telefono, 'Calle Principal 123, Ciudad' as direccion, NOW() as fecharegistro, true as activo, 'COMPRADOR' as tipousuario
                  UNION SELECT 'Vendedor Demo', 'vendedor@minimalecommerce.com', 'password123', '555-0456', 'Avenida Comercial 456, Ciudad', NOW(), true, 'VENDEDOR'
                  UNION SELECT 'María González', 'maria@test.com', 'password123', '555-0789', 'Calle Secundaria 789, Ciudad', NOW(), true, 'COMPRADOR'
              ) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM usuario LIMIT 1);