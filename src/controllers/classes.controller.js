const { Class, Subject, User, Enrollment } = require('../models');

// GET /classes - Obtener todas las clases
const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.findAll({
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

    res.json({ classes });
  } catch (error) {
    console.error('Error en getAllClasses:', error);
    res.status(500).json({ error: 'Error al obtener clases' });
  }
};

// GET /classes/:id - Obtener una clase por ID
const getClassById = async (req, res) => {
  try {
    const { id } = req.params;

    const classItem = await Class.findByPk(id, {
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
        },
        {
          model: Enrollment,
          as: 'enrollments',
          include: [
            {
              model: User,
              as: 'estudiante',
              attributes: ['id', 'nombre', 'correo']
            }
          ]
        }
      ]
    });

    if (!classItem) {
      return res.status(404).json({ error: 'Clase no encontrada' });
    }

    res.json({ class: classItem });
  } catch (error) {
    console.error('Error en getClassById:', error);
    res.status(500).json({ error: 'Error al obtener clase' });
  }
};

// GET /classes/profesor/:id_profesor - Obtener clases de un profesor
const getClassesByProfesor = async (req, res) => {
  try {
    const { id_profesor } = req.params;

    const classes = await Class.findAll({
      where: { id_profesor },
      include: [
        {
          model: Subject,
          as: 'asignatura',
          attributes: ['id', 'nombre', 'descripcion']
        },
        {
          model: Enrollment,
          as: 'enrollments',
          include: [
            {
              model: User,
              as: 'estudiante',
              attributes: ['id', 'nombre', 'correo']
            }
          ]
        }
      ],
      order: [['horario', 'ASC']]
    });

    res.json({ classes });
  } catch (error) {
    console.error('Error en getClassesByProfesor:', error);
    res.status(500).json({ error: 'Error al obtener clases del profesor' });
  }
};

// POST /classes - Crear una nueva clase (solo admin)
const createClass = async (req, res) => {
  try {
    const { id_asignatura, id_profesor, horario, salon } = req.body;

    // Validaciones
    if (!id_asignatura || !id_profesor || !horario || !salon) {
      return res.status(400).json({ 
        error: 'Todos los campos son requeridos' 
      });
    }

    // Verificar que la asignatura existe
    const subject = await Subject.findByPk(id_asignatura);
    if (!subject) {
      return res.status(404).json({ error: 'Asignatura no encontrada' });
    }

    // Verificar que el profesor existe y tiene rol de profesor
    const profesor = await User.findByPk(id_profesor);
    if (!profesor || profesor.rol !== 'profesor') {
      return res.status(404).json({ error: 'Profesor no encontrado o inválido' });
    }

    // Crear clase
    const newClass = await Class.create({
      id_asignatura,
      id_profesor,
      horario,
      salon
    });

    // Obtener clase con relaciones
    const classWithDetails = await Class.findByPk(newClass.id, {
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
    });

    res.status(201).json({
      message: 'Clase creada exitosamente',
      class: classWithDetails
    });
  } catch (error) {
    console.error('Error en createClass:', error);
    res.status(500).json({ error: 'Error al crear clase' });
  }
};

// PUT /classes/:id - Actualizar una clase (admin o profesor asignado)
const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_asignatura, id_profesor, horario, salon } = req.body;

    const classItem = await Class.findByPk(id);
    if (!classItem) {
      return res.status(404).json({ error: 'Clase no encontrada' });
    }

    // Si es profesor, solo puede editar si es su clase y solo campos limitados
    if (req.user.rol === 'profesor') {
      if (classItem.id_profesor !== req.user.id) {
        return res.status(403).json({ 
          error: 'No tienes permiso para editar esta clase' 
        });
      }
      // Profesor solo puede editar horario y salón
      if (horario) classItem.horario = horario;
      if (salon) classItem.salon = salon;
    } else {
      // Admin puede editar todo
      if (id_asignatura) {
        const subject = await Subject.findByPk(id_asignatura);
        if (!subject) {
          return res.status(404).json({ error: 'Asignatura no encontrada' });
        }
        classItem.id_asignatura = id_asignatura;
      }
      
      if (id_profesor) {
        const profesor = await User.findByPk(id_profesor);
        if (!profesor || profesor.rol !== 'profesor') {
          return res.status(404).json({ error: 'Profesor no encontrado o inválido' });
        }
        classItem.id_profesor = id_profesor;
      }
      
      if (horario) classItem.horario = horario;
      if (salon) classItem.salon = salon;
    }

    await classItem.save();

    // Obtener clase actualizada con relaciones
    const updatedClass = await Class.findByPk(id, {
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
    });

    res.json({
      message: 'Clase actualizada exitosamente',
      class: updatedClass
    });
  } catch (error) {
    console.error('Error en updateClass:', error);
    res.status(500).json({ error: 'Error al actualizar clase' });
  }
};

// DELETE /classes/:id - Eliminar una clase (solo admin)
const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

    const classItem = await Class.findByPk(id);
    if (!classItem) {
      return res.status(404).json({ error: 'Clase no encontrada' });
    }

    // Verificar si tiene inscripciones
    const enrollmentCount = await Enrollment.count({
      where: { id_clase: id }
    });

    if (enrollmentCount > 0) {
      return res.status(400).json({ 
        error: `No se puede eliminar. La clase tiene ${enrollmentCount} inscripciones activas` 
      });
    }

    await classItem.destroy();

    res.json({ 
      message: 'Clase eliminada exitosamente' 
    });
  } catch (error) {
    console.error('Error en deleteClass:', error);
    res.status(500).json({ error: 'Error al eliminar clase' });
  }
};

// GET /classes/:id/students - Obtener estudiantes inscritos en una clase
const getClassStudents = async (req, res) => {
  try {
    const { id } = req.params;

    const classItem = await Class.findByPk(id, {
      include: [
        {
          model: Subject,
          as: 'asignatura',
          attributes: ['id', 'nombre']
        },
        {
          model: Enrollment,
          as: 'enrollments',
          include: [
            {
              model: User,
              as: 'estudiante',
              attributes: ['id', 'nombre', 'correo']
            }
          ]
        }
      ]
    });

    if (!classItem) {
      return res.status(404).json({ error: 'Clase no encontrada' });
    }

    // Si es profesor, verificar que sea su clase
    if (req.user.rol === 'profesor' && classItem.id_profesor !== req.user.id) {
      return res.status(403).json({ 
        error: 'No tienes permiso para ver los estudiantes de esta clase' 
      });
    }

    res.json({ 
      class: {
        id: classItem.id,
        asignatura: classItem.asignatura,
        horario: classItem.horario,
        salon: classItem.salon
      },
      students: classItem.enrollments.map(e => ({
        enrollment_id: e.id,
        fecha_inscripcion: e.fecha_inscripcion,
        ...e.estudiante.toJSON()
      }))
    });
  } catch (error) {
    console.error('Error en getClassStudents:', error);
    res.status(500).json({ error: 'Error al obtener estudiantes de la clase' });
  }
};

module.exports = {
  getAllClasses,
  getClassById,
  getClassesByProfesor,
  createClass,
  updateClass,
  deleteClass,
  getClassStudents
};