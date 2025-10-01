const { Subject, Class } = require('../models');

// GET /subjects
const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.findAll({
      order: [['nombre', 'ASC']]
    });

    res.json({ subjects });
  } catch (error) {
    console.error('Error en getAllSubjects:', error);
    res.status(500).json({ error: 'Error al obtener asignaturas' });
  }
};

// GET /subjects/:id
const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const subject = await Subject.findByPk(id, {
      include: [
        {
          model: Class,
          as: 'classes',
          attributes: ['id', 'horario', 'salon', 'id_profesor']
        }
      ]
    });

    if (!subject) {
      return res.status(404).json({ error: 'Asignatura no encontrada' });
    }

    res.json({ subject });
  } catch (error) {
    console.error('Error en getSubjectById:', error);
    res.status(500).json({ error: 'Error al obtener asignatura' });
  }
};

// POST /subjects (solo admin)
const createSubject = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    // Verificar si ya existe una asignatura con ese nombre
    const existingSubject = await Subject.findOne({ where: { nombre } });
    if (existingSubject) {
      return res.status(400).json({ 
        error: 'Ya existe una asignatura con ese nombre' 
      });
    }

    const subject = await Subject.create({
      nombre,
      descripcion
    });

    res.status(201).json({
      message: 'Asignatura creada exitosamente',
      subject
    });
  } catch (error) {
    console.error('Error en createSubject:', error);
    res.status(500).json({ error: 'Error al crear asignatura' });
  }
};

// PUT /subjects/:id (solo admin)
const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    const subject = await Subject.findByPk(id);
    if (!subject) {
      return res.status(404).json({ error: 'Asignatura no encontrada' });
    }

    // Si se cambia el nombre, verificar que no exista otra con ese nombre
    if (nombre && nombre !== subject.nombre) {
      const existingSubject = await Subject.findOne({ where: { nombre } });
      if (existingSubject) {
        return res.status(400).json({ 
          error: 'Ya existe una asignatura con ese nombre' 
        });
      }
      subject.nombre = nombre;
    }

    if (descripcion !== undefined) {
      subject.descripcion = descripcion;
    }

    await subject.save();

    res.json({
      message: 'Asignatura actualizada exitosamente',
      subject
    });
  } catch (error) {
    console.error('Error en updateSubject:', error);
    res.status(500).json({ error: 'Error al actualizar asignatura' });
  }
};

// DELETE /subjects/:id (solo admin)
const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await Subject.findByPk(id);
    if (!subject) {
      return res.status(404).json({ error: 'Asignatura no encontrada' });
    }

    // Verificar si tiene clases asociadas
    const classCount = await Class.count({
      where: { id_asignatura: id }
    });

    if (classCount > 0) {
      return res.status(400).json({ 
        error: `No se puede eliminar. La asignatura tiene ${classCount} clases asociadas` 
      });
    }

    await subject.destroy();

    res.json({ 
      message: 'Asignatura eliminada exitosamente' 
    });
  } catch (error) {
    console.error('Error en deleteSubject:', error);
    res.status(500).json({ error: 'Error al eliminar asignatura' });
  }
};

module.exports = {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject
};