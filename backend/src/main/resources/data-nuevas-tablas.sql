-- Solo ejecutar después de que las nuevas tablas se hayan creado
-- Pedidos de ejemplo
INSERT INTO pedido (usuarioid, fechapedido, total, estado, direccionentrega) VALUES
                                                                                 (1, NOW(), 1549.98, 'CONFIRMADO', 'Calle Principal 123, Ciudad'),
                                                                                 (2, NOW(), 299.99, 'PENDIENTE', 'Avenida Central 456, Ciudad');

-- Items de pedidos de ejemplo
INSERT INTO pedidoitem (pedidoid, productoid, cantidad, preciounitario) VALUES
                                                                            (1, 1, 2, 699.99),
                                                                            (1, 4, 1, 450.00),
                                                                            (2, 7, 10, 29.99);

-- Reseñas de ejemplo
INSERT INTO resena (usuarioid, productoid, calificacion, comentario, fecharesena) VALUES
                                                                                      (1, 1, 5, 'Excelente producto, muy recomendado', NOW()),
                                                                                      (2, 4, 4, 'Muy cómodo y de buena calidad', NOW()),
                                                                                      (1, 7, 5, 'Perfecto para uso diario', NOW());
