const bcrypt = require('bcryptjs');
const { User, Subject, Class, Enrollment, sequelize } = require('./models');

const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando seed de la base de datos...\n');

    // Limpiar datos existentes (opcional)
    console.log('🗑️  Limpiando datos existentes...');
    await Enrollment.destroy({ where: {} });
    await Class.destroy({ where: {} });
    await Subject.destroy({ where: {} });
    await User.destroy({ where: {} });

    // 1. Crear usuarios
    console.log('👥 Creando usuarios...');
    
    const admin = await User.create({
      nombre: 'Admin Principal',
      correo: 'admin@sga.com',
      contraseña: 'admin123',
      rol: 'admin',
      is_active: true
    });

    const profesores = await User.bulkCreate([
      {
        nombre: 'Dr. Carlos Rodríguez',
        correo: 'carlos.rodriguez@sga.com',
        contraseña: 'profesor123',
        rol: 'profesor',
        is_active: true
      },
      {
        nombre: 'Dra. María García',
        correo: 'maria.garcia@sga.com',
        contraseña: 'profesor123',
        rol: 'profesor',
        is_active: true
      },
      {
        nombre: 'Ing. Juan Pérez',
        correo: 'juan.perez@sga.com',
        contraseña: 'profesor123',
        rol: 'profesor',
        is_active: true
      },
      {
        nombre: 'Lic. Ana Martínez',
        correo: 'ana.martinez@sga.com',
        contraseña: 'profesor123',
        rol: 'profesor',
        is_active: true
      }
    ]);

    const estudiantes = await User.bulkCreate([
      {
        nombre: 'Pedro González',
        correo: 'pedro.gonzalez@estudiante.com',
        contraseña: 'estudiante123',
        rol: 'estudiante',
        is_active: true
      },
      {
        nombre: 'Laura Sánchez',
        correo: 'laura.sanchez@estudiante.com',
        contraseña: 'estudiante123',
        rol: 'estudiante',
        is_active: true
      },
      {
        nombre: 'Miguel Torres',
        correo: 'miguel.torres@estudiante.com',
        contraseña: 'estudiante123',
        rol: 'estudiante',
        is_active: true
      },
      {
        nombre: 'Sofia Ramírez',
        correo: 'sofia.ramirez@estudiante.com',
        contraseña: 'estudiante123',
        rol: 'estudiante',
        is_active: true
      },
      {
        nombre: 'Diego Fernández',
        correo: 'diego.fernandez@estudiante.com',
        contraseña: 'estudiante123',
        rol: 'estudiante',
        is_active: true
      }
    ]);

    console.log(`✅ ${profesores.length} profesores creados`);
    console.log(`✅ ${estudiantes.length} estudiantes creados`);
    console.log(`✅ 1 administrador creado\n`);

    // 2. Crear asignaturas
    console.log('📚 Creando asignaturas...');
    
    const asignaturas = await Subject.bulkCreate([
      {
        nombre: 'Programación I',
        descripcion: 'Fundamentos de programación y algoritmos'
      },
      {
        nombre: 'Base de Datos',
        descripcion: 'Diseño y administración de bases de datos relacionales'
      },
      {
        nombre: 'Desarrollo Web',
        descripcion: 'Desarrollo de aplicaciones web modernas'
      },
      {
        nombre: 'Matemáticas Discretas',
        descripcion: 'Lógica, conjuntos, grafos y combinatoria'
      },
      {
        nombre: 'Estructura de Datos',
        descripcion: 'Pilas, colas, árboles, grafos y algoritmos'
      },
      {
        nombre: 'Ingeniería de Software',
        descripcion: 'Metodologías ágiles y gestión de proyectos'
      }
    ]);

    console.log(`✅ ${asignaturas.length} asignaturas creadas\n`);

    // 3. Crear clases
    console.log('🏫 Creando clases...');
    
    const clases = await Class.bulkCreate([
      {
        id_asignatura: asignaturas[0].id,
        id_profesor: profesores[0].id,
        horario: 'Lunes y Miércoles 8:00-10:00',
        salon: 'Aula 101'
      },
      {
        id_asignatura: asignaturas[0].id,
        id_profesor: profesores[0].id,
        horario: 'Martes y Jueves 14:00-16:00',
        salon: 'Aula 102'
      },
      {
        id_asignatura: asignaturas[1].id,
        id_profesor: profesores[1].id,
        horario: 'Lunes y Miércoles 10:00-12:00',
        salon: 'Lab 201'
      },
      {
        id_asignatura: asignaturas[2].id,
        id_profesor: profesores[1].id,
        horario: 'Martes y Jueves 16:00-18:00',
        salon: 'Lab 202'
      },
      {
        id_asignatura: asignaturas[3].id,
        id_profesor: profesores[2].id,
        horario: 'Lunes y Miércoles 14:00-16:00',
        salon: 'Aula 103'
      },
      {
        id_asignatura: asignaturas[4].id,
        id_profesor: profesores[2].id,
        horario: 'Martes y Jueves 8:00-10:00',
        salon: 'Lab 203'
      },
      {
        id_asignatura: asignaturas[5].id,
        id_profesor: profesores[3].id,
        horario: 'Viernes 8:00-12:00',
        salon: 'Aula 104'
      }
    ]);

    console.log(`✅ ${clases.length} clases creadas\n`);

    // 4. Crear inscripciones
    console.log('📝 Creando inscripciones...');
    
    const inscripciones = await Enrollment.bulkCreate([
      // Pedro González
      { id_usuario: estudiantes[0].id, id_clase: clases[0].id, fecha_inscripcion: '2024-09-01' },
      { id_usuario: estudiantes[0].id, id_clase: clases[2].id, fecha_inscripcion: '2024-09-01' },
      { id_usuario: estudiantes[0].id, id_clase: clases[4].id, fecha_inscripcion: '2024-09-02' },
      
      // Laura Sánchez
      { id_usuario: estudiantes[1].id, id_clase: clases[0].id, fecha_inscripcion: '2024-09-01' },
      { id_usuario: estudiantes[1].id, id_clase: clases[3].id, fecha_inscripcion: '2024-09-01' },
      { id_usuario: estudiantes[1].id, id_clase: clases[6].id, fecha_inscripcion: '2024-09-03' },
      
      // Miguel Torres
      { id_usuario: estudiantes[2].id, id_clase: clases[1].id, fecha_inscripcion: '2024-09-01' },
      { id_usuario: estudiantes[2].id, id_clase: clases[2].id, fecha_inscripcion: '2024-09-01' },
      { id_usuario: estudiantes[2].id, id_clase: clases[5].id, fecha_inscripcion: '2024-09-02' },
      
      // Sofia Ramírez
      { id_usuario: estudiantes[3].id, id_clase: clases[1].id, fecha_inscripcion: '2024-09-01' },
      { id_usuario: estudiantes[3].id, id_clase: clases[3].id, fecha_inscripcion: '2024-09-01' },
      { id_usuario: estudiantes[3].id, id_clase: clases[4].id, fecha_inscripcion: '2024-09-02' },
      
      // Diego Fernández
      { id_usuario: estudiantes[4].id, id_clase: clases[0].id, fecha_inscripcion: '2024-09-01' },
      { id_usuario: estudiantes[4].id, id_clase: clases[5].id, fecha_inscripcion: '2024-09-01' },
      { id_usuario: estudiantes[4].id, id_clase: clases[6].id, fecha_inscripcion: '2024-09-02' }
    ]);

    console.log(`✅ ${inscripciones.length} inscripciones creadas\n`);

    // Resumen
    console.log('📊 Resumen del seed:');
    console.log('='.repeat(50));
    console.log(`👤 Administradores: 1`);
    console.log(`👨‍🏫 Profesores: ${profesores.length}`);
    console.log(`👨‍🎓 Estudiantes: ${estudiantes.length}`);
    console.log(`📚 Asignaturas: ${asignaturas.length}`);
    console.log(`🏫 Clases: ${clases.length}`);
    console.log(`📝 Inscripciones: ${inscripciones.length}`);
    console.log('='.repeat(50));
    
    console.log('\n✅ Seed completado exitosamente!\n');
    console.log('🔐 Credenciales de prueba:');
    console.log('   Admin: admin@sga.com / admin123');
    console.log('   Profesor: carlos.rodriguez@sga.com / profesor123');
    console.log('   Estudiante: pedro.gonzalez@estudiante.com / estudiante123\n');

  } catch (error) {
    console.error('❌ Error en el seed:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

// Ejecutar seed
seedDatabase();