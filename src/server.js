const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection, sequelize } = require('./config/database');
const { syncDatabase } = require('./models');

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const subjectsRoutes = require('./routes/subjects.routes');
const classesRoutes = require('./routes/classes.routes');
const enrollmentsRoutes = require('./routes/enrollments.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    message: '🎓 API Sistema de Gestión Académica',
    version: '1.0.0',
    endpoints: {
      auth: '/auth',
      users: '/users',
      subjects: '/subjects',
      classes: '/classes',
      enrollments: '/enrollments'
    },
    documentation: 'https://github.com/tu-repo/sga-backend'
  });
});

// Rutas
app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/subjects', subjectsRoutes);
app.use('/classes', classesRoutes);
app.use('/enrollments', enrollmentsRoutes);

// Manejo de rutas no encontradas (debe ir después de todas las rutas)
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor'
  });
});

// Iniciar servidor
const startServer = async () => {
  try {
    // Probar conexión a la base de datos
    await testConnection();
    
    // Sincronizar modelos
    await syncDatabase();
    
    // Levantar servidor
    app.listen(PORT, () => {
      console.log('\n🚀 ====================================');
      console.log(`   Servidor corriendo en puerto ${PORT}`);
      console.log(`   http://localhost:${PORT}`);
      console.log('====================================\n');
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();