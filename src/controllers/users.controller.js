const { User, Class, Enrollment } = require('../models');

// GET /users/profile
const getProfile = async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        nombre: req.user.nombre,
        correo: req.user.correo,
        rol: req.user.rol,
        is_active: req.user.is_active,
        created_at: req.user.created_at
      }
    });
  } catch (error) {
    console.error('Error en getProfile:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

// GET /users (solo admin)
const getAllUsers = async (req, res) => {
  try {
    const { rol } = req.query;

    const whereClause = {};
    if (rol) {
      whereClause.rol = rol;
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: { exclude: ['contraseña', 'reset_token', 'reset_token_expire'] },
      order: [['nombre', 'ASC']]
    });

    res.json({ 
      users,
      total: users.length
    });
  } catch (error) {
    console.error('Error en getAllUsers:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

// GET /users/:id (solo admin)
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['contraseña', 'reset_token', 'reset_token_expire'] }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Si es profesor, incluir sus clases
    if (user.rol === 'profesor') {
      const classes = await Class.findAll({
        where: { id_profesor: id },
        attributes: ['id', 'horario', 'salon']
      });
      return res.json({ 
        user: user.toJSON(), 
        classes 
      });
    }

    // Si es estudiante, incluir sus inscripciones
    if (user.rol === 'estudiante') {
      const enrollments = await Enrollment.findAll({
        where: { id_usuario: id },
        attributes: ['id', 'fecha_inscripcion', 'id_clase']
      });
      return res.json({ 
        user: user.toJSON(), 
        enrollments 
      });
    }

    res.json({ user });
  } catch (error) {
    console.error('Error en getUserById:', error);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
};

// PUT /users/:id (solo admin)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, correo, rol, is_active } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Actualizar solo campos permitidos
    if (nombre) user.nombre = nombre;
    
    if (correo && correo !== user.correo) {
      // Verificar que el correo no esté en uso
      const existingUser = await User.findOne({ where: { correo } });
      if (existingUser && existingUser.id !== user.id) {
        return res.status(400).json({ 
          error: 'El correo ya está en uso por otro usuario' 
        });
      }
      user.correo = correo;
    }
    
    if (rol) {
      // Validar cambio de rol
      if (user.rol === 'profesor') {
        const classCount = await Class.count({ where: { id_profesor: id } });
        if (classCount > 0 && rol !== 'profesor') {
          return res.status(400).json({ 
            error: `No se puede cambiar el rol. El profesor tiene ${classCount} clases asignadas` 
          });
        }
      }
      
      if (user.rol === 'estudiante') {
        const enrollmentCount = await Enrollment.count({ where: { id_usuario: id } });
        if (enrollmentCount > 0 && rol !== 'estudiante') {
          return res.status(400).json({ 
            error: `No se puede cambiar el rol. El estudiante tiene ${enrollmentCount} inscripciones activas` 
          });
        }
      }
      
      user.rol = rol;
    }
    
    if (typeof is_active !== 'undefined') user.is_active = is_active;

    await user.save();

    res.json({
      message: 'Usuario actualizado exitosamente',
      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol,
        is_active: user.is_active
      }
    });
  } catch (error) {
    console.error('Error en updateUser:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

// DELETE /users/:id (solo admin)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar restricciones antes de eliminar
    if (user.rol === 'profesor') {
      const classCount = await Class.count({ where: { id_profesor: id } });
      if (classCount > 0) {
        return res.status(400).json({ 
          error: `No se puede eliminar. El profesor tiene ${classCount} clases asignadas` 
        });
      }
    }

    if (user.rol === 'estudiante') {
      const enrollmentCount = await Enrollment.count({ where: { id_usuario: id } });
      if (enrollmentCount > 0) {
        return res.status(400).json({ 
          error: `No se puede eliminar. El estudiante tiene ${enrollmentCount} inscripciones activas` 
        });
      }
    }

    // No permitir que el admin se elimine a sí mismo
    if (user.id === req.user.id) {
      return res.status(400).json({ 
        error: 'No puedes eliminar tu propia cuenta' 
      });
    }

    await user.destroy();

    res.json({ 
      message: 'Usuario eliminado exitosamente' 
    });
  } catch (error) {
    console.error('Error en deleteUser:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

// GET /users/professors - Obtener lista de profesores
const getProfessors = async (req, res) => {
  try {
    const professors = await User.findAll({
      where: { 
        rol: 'profesor',
        is_active: true 
      },
      attributes: ['id', 'nombre', 'correo'],
      order: [['nombre', 'ASC']]
    });

    res.json({ professors });
  } catch (error) {
    console.error('Error en getProfessors:', error);
    res.status(500).json({ error: 'Error al obtener profesores' });
  }
};

// GET /users/students - Obtener lista de estudiantes
const getStudents = async (req, res) => {
  try {
    const students = await User.findAll({
      where: { 
        rol: 'estudiante',
        is_active: true 
      },
      attributes: ['id', 'nombre', 'correo'],
      order: [['nombre', 'ASC']]
    });

    res.json({ students });
  } catch (error) {
    console.error('Error en getStudents:', error);
    res.status(500).json({ error: 'Error al obtener estudiantes' });
  }
};

module.exports = {
  getProfile,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getProfessors,
  getStudents
};