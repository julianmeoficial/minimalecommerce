-- Solo ejecutar después de que las nuevas tablas se hayan creado

-- Insertar pedidos solo si la tabla está vacía
INSERT INTO pedido (usuarioid, fechapedido, total, estado, direccionentrega)
SELECT * FROM (
                  SELECT 1 as usuarioid, NOW() as fechapedido, 0.00 as total, 'PENDIENTE' as estado, 'Dirección por definir' as direccionentrega
              ) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM pedido LIMIT 1);