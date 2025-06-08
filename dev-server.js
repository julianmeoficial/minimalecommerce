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

app.get('/productos', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/html/productos.html'));
});

app.get('/carrito', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/html/carrito.html'));
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
    console.log(`   - http://localhost:${PORT}/productos`);
});
