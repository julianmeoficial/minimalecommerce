const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = 3000;
const BACKEND_PORT = 8080;

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'frontend')));

// Proxy para API calls al backend
app.use('/api', createProxyMiddleware({
    target: `http://localhost:${BACKEND_PORT}`,
    changeOrigin: true,
    logLevel: 'debug'
}));

// Servir archivos específicos
app.use('/html', express.static(path.join(__dirname, 'frontend/html')));
app.use('/css', express.static(path.join(__dirname, 'frontend/css')));
app.use('/js', express.static(path.join(__dirname, 'frontend/js')));
app.use('/images', express.static(path.join(__dirname, 'frontend/images')));

// RUTAS PRINCIPALES (SIN .html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/html/index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/html/login.html'));
});

app.get('/registro', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/html/registro.html'));
});

app.get('/terminos', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/html/terminos.html'));
});

app.get('/privacidad', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/html/privacidad.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/html/dashboard.html'));
});

app.get('/soporte', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/html/soporte.html'));
});

app.get('/envios', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/html/envios.html'));
});

app.get('/devoluciones', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/html/devoluciones.html'));
});

app.get('/historia', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/html/historia.html'));
});

app.get('/mision-vision', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/html/mision-vision.html'));
});

app.get('/equipo', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/html/equipo.html'));
});

app.get('/perfil', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/html/perfil.html'));
})

app.get('/productos', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/html/productos.html'));
});

app.get('/carrito', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/html/carrito.html'));
});

app.get('/favoritos', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/html/favoritos.html'));
})

app.get('/notificaciones', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/html/notificaciones.html'));
})

app.get('/categorias', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/html/categorias.html'));
});

// NUEVA RUTA PARA PRODUCTO
app.get('/producto', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/html/producto.html'));
});

app.get('/preorden', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/html/preorden.html'));
});

app.get('/eventos', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/html/eventos.html'));
});

app.get('/cupones', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/html/cupones.html'));
});

app.get('/resena', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/html/resena.html'));
});

app.get('/blog', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/html/blog.html'));
});

// Rutas de categorías
app.get('/tecnologia', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/html/productos.html'));
});

app.get('/hogar', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/html/productos.html'));
});

app.get('/moda', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/html/productos.html'));
});

app.get('/mascotas', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/html/productos.html'));
});

app.get('/manualidades', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/html/productos.html'));
});

// Ruta catch-all para SPA (debe ir al final)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/html/index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Frontend ejecutándose en http://localhost:${PORT}`);
    console.log(`🔗 Proxy API hacia http://localhost:${BACKEND_PORT}`);
    console.log(`📄 Rutas disponibles:`);
    console.log(`   - http://localhost:${PORT}/`);
    console.log(`   - http://localhost:${PORT}/login`);
    console.log(`   - http://localhost:${PORT}/registro`);
    console.log(`   - http://localhost:${PORT}/terminos`);
    console.log(`   - http://localhost:${PORT}/privacidad`);
    console.log(`   - http://localhost:${PORT}/dashboard`);
    console.log(`   - http://localhost:${PORT}/soporte`);
    console.log(`   - http://localhost:${PORT}/envios`);
    console.log(`   - http://localhost:${PORT}/devoluciones`);
    console.log(`   - http://localhost:${PORT}/historia`);
    console.log(`   - http://localhost:${PORT}/mision-vision`);
    console.log(`   - http://localhost:${PORT}/equipo`);
    console.log(`   - http://localhost:${PORT}/perfil`);
    console.log(`   - http://localhost:${PORT}/productos`);
    console.log(`   - http://localhost:${PORT}/carrito`);
    console.log(`   - http://localhost:${PORT}/favoritos`);
    console.log(`   - http://localhost:${PORT}/notificaciones`);
    console.log(`   - http://localhost:${PORT}/categorias`);
    console.log(`   - http://localhost:${PORT}/producto`); // NUEVA LÍNEA
    console.log(`   - http://localhost:${PORT}/preorden`);
    console.log(`   - http://localhost:${PORT}/eventos`);
    console.log(`   - http://localhost:${PORT}/cupones`);
    console.log(`   - http://localhost:${PORT}/resena`);
    console.log(`   - http://localhost:${PORT}/blog`);
});
