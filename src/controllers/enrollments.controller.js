const { Enrollment, Class, Subject, User } = require('../models');
const { Op } = require('sequelize');

// POST /enrollments - Inscribir a un estudiante en una clase
const createEnrollment = async (req, res) => {
  try {
    const { id_clase } = req.body;
    const id_usuario = req.user.id;

    // Validaciones
    if (!id_clase) {
      return res.status(400).json({ 
        error: 'El ID de la clase es requerido' 
      });
    }

    // Verificar que la clase existe
    const classItem = await Class.findByPk(id_clase, {
      include: [
        {
          model: Subject,
          as: 'asignatura',
          attributes: ['nombre']
        }
      ]
    });

    if (!classItem) {
      return res.status(404).json({ error: 'Clase no encontrada' });
    }

    // Verificar que el usuario es estudiante
    if (req.user.rol !== 'estudiante') {
      return res.status(403).json({ 
        error: 'Solo los estudiantes pueden inscribirse en clases' 
      });
    }

    // Verificar si ya está inscrito
    const existingEnrollment = await Enrollment.findOne({
      where: {
        id_usuario,
        id_clase
      }
    });

    if (existingEnrollment) {
      return res.status(400).json({ 
        error: 'Ya estás inscrito en esta clase' 
      });
    }

    // Crear inscripción
    const enrollment = await Enrollment.create({
      id_usuario,
      id_clase,
      fecha_inscripcion: new Date()
    });

    // Obtener inscripción con detalles
    const enrollmentWithDetails = await Enrollment.findByPk(enrollment.id, {
      include: [
        {
          model: Class,
          as: 'clase',
          include: [
            {
              model: Subject,
              as: 'asignatura',
              attributes: ['id', 'nombre', 'descripcion']
            },
            {
              model: User,
              as: 'profesor',
              attributes: ['id', 'nombre', 'correo']
            }
          ]
        }
      ]
    });

    res.status(201).json({
      message: 'Inscripción realizada exitosamente',
      enrollment: enrollmentWithDetails
    });
  } catch (error) {
    console.error('Error en createEnrollment:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        error: 'Ya estás inscrito en esta clase' 
      });
    }
    res.status(500).json({ error: 'Error al crear inscripción' });
  }
};

// GET /enrollments/my-enrollments - Obtener inscripciones del usuario autenticado
const getMyEnrollments = async (req, res) => {
  try {
    const id_usuario = req.user.id;

    const enrollments = await Enrollment.findAll({
      where: { id_usuario },
      include: [
        {
          model: Class,
          as: 'clase',
          include: [
            {
              model: Subject,
              as: 'asignatura',
              attributes: ['id', 'nombre', 'descripcion']
            },
            {
              model: User,
              as: 'profesor',
              attributes: ['id', 'nombre', 'correo']
            }
          ]
        }
      ],
      order: [['fecha_inscripcion', 'DESC']]
    });

    res.json({ enrollments });
  } catch (error) {
    console.error('Error en getMyEnrollments:', error);
    res.status(500).json({ error: 'Error al obtener inscripciones' });
  }
};

// GET /enrollments/user/:id_usuario - Obtener inscripciones de un estudiante (admin)
const getEnrollmentsByUser = async (req, res) => {
  try {
    const { id_usuario } = req.params;

    // Verificar que el usuario existe
    const user = await User.findByPk(id_usuario);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const enrollments = await Enrollment.findAll({
      where: { id_usuario },
      include: [
        {
          model: Class,
          as: 'clase',
          include: [
            {
              model: Subject,
              as: 'asignatura',
              attributes: ['id', 'nombre', 'descripcion']
            },
            {
              model: User,
              as: 'profesor',
              attributes: ['id', 'nombre', 'correo']
            }
          ]
        }
      ],
      order: [['fecha_inscripcion', 'DESC']]
    });

    res.json({ 
      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo
      },
      enrollments 
    });
  } catch (error) {
    console.error('Error en getEnrollmentsByUser:', error);
    res.status(500).json({ error: 'Error al obtener inscripciones' });
  }
};

// GET /enrollments - Obtener todas las inscripciones (admin)
const getAllEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll({
      include: [
        {
          model: User,
          as: 'estudiante',
          attributes: ['id', 'nombre', 'correo']
        },
        {
          model: Class,
          as: 'clase',
          include: [
            {
              model: Subject,
              as: 'asignatura',
              attributes: ['id', 'nombre']
            },
            {
              model: User,
              as: 'profesor',
              attributes: ['id', 'nombre']
            }
          ]
        }
      ],
      order: [['fecha_inscripcion', 'DESC']]
    });

    res.json({ enrollments });
  } catch (error) {
    console.error('Error en getAllEnrollments:', error);
    res.status(500).json({ error: 'Error al obtener inscripciones' });
  }
};

// DELETE /enrollments/:id - Cancelar una inscripción
const deleteEnrollment = async (req, res) => {
  try {
    const { id } = req.params;

    const enrollment = await Enrollment.findByPk(id, {
      include: [
        {
          model: Class,
          as: 'clase',
          include: [
            {
              model: Subject,
              as: 'asignatura',
              attributes: ['nombre']
            }
          ]
        }
      ]
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'Inscripción no encontrada' });
    }

    // Verificar permisos: solo el estudiante dueño o admin pueden cancelar
    if (req.user.rol === 'estudiante' && enrollment.id_usuario !== req.user.id) {
      return res.status(403).json({ 
        error: 'No tienes permiso para cancelar esta inscripción' 
      });
    }

    await enrollment.destroy();

    res.json({ 
      message: 'Inscripción cancelada exitosamente',
      enrollment: {
        id: enrollment.id,
        clase: enrollment.clase.asignatura.nombre
      }
    });
  } catch (error) {
    console.error('Error en deleteEnrollment:', error);
    res.status(500).json({ error: 'Error al cancelar inscripción' });
  }
};

// GET /enrollments/available-classes - Obtener clases disponibles para inscribirse
const getAvailableClasses = async (req, res) => {
  try {
    const id_usuario = req.user.id;

    // Obtener IDs de clases ya inscritas
    const enrolledClasses = await Enrollment.findAll({
      where: { id_usuario },
      attributes: ['id_clase']
    });

    const enrolledClassIds = enrolledClasses.map(e => e.id_clase);

    // Obtener clases disponibles (no inscritas)
    const availableClasses = await Class.findAll({
      where: {
        id: {
          [Op.notIn]: enrolledClassIds.length > 0 ? enrolledClassIds : [0]
        }
      },
      include: [
        {
          model: Subject,
          as: 'asignatura',
          attributes: ['id', 'nombre', 'descripcion']
        },
        {
          model: User,
          as: 'profesor',
          attributes: ['id', 'nombre', 'correo']
        }
      ],
      order: [['horario', 'ASC']]
    });

    res.json({ 
      availableClasses,
      totalAvailable: availableClasses.length
    });
  } catch (error) {
    console.error('Error en getAvailableClasses:', error);
    res.status(500).json({ error: 'Error al obtener clases disponibles' });
  }
};

// GET /enrollments/my-schedule - Obtener horario del estudiante
const getMySchedule = async (req, res) => {
  try {
    const id_usuario = req.user.id;

    const enrollments = await Enrollment.findAll({
      where: { id_usuario },
      include: [
        {
          model: Class,
          as: 'clase',
          attributes: ['id', 'horario', 'salon'],
          include: [
            {
              model: Subject,
              as: 'asignatura',
              attributes: ['id', 'nombre']
            },
            {
              model: User,
              as: 'profesor',
              attributes: ['id', 'nombre']
            }
          ]
        }
      ],
      order: [[{ model: Class, as: 'clase' }, 'horario', 'ASC']]
    });

    // Formatear para horario
    const schedule = enrollments.map(e => ({
      enrollment_id: e.id,
      asignatura: e.clase.asignatura.nombre,
      profesor: e.clase.profesor.nombre,
      horario: e.clase.horario,
      salon: e.clase.salon,
      fecha_inscripcion: e.fecha_inscripcion
    }));

    res.json({ 
      schedule,
      totalClasses: schedule.length
    });
  } catch (error) {
    console.error('Error en getMySchedule:', error);
    res.status(500).json({ error: 'Error al obtener horario' });
  }
};

module.exports = {
  createEnrollment,
  getMyEnrollments,
  getEnrollmentsByUser,
  getAllEnrollments,
  deleteEnrollment,
  getAvailableClasses,
  getMySchedule
};