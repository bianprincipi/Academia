const express = require('express');
const router = express.Router();
const { 
  getAllClasses, 
  getClassById, 
  getClassesByProfesor,
  createClass, 
  updateClass, 
  deleteClass,
  getClassStudents
} = require('../controllers/classes.controller');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// GET /classes - Obtener todas las clases (requiere autenticación)
router.get('/', auth, getAllClasses);

// GET /classes/profesor/:id_profesor - Obtener clases de un profesor
router.get('/profesor/:id_profesor', auth, checkRole('admin', 'profesor'), getClassesByProfesor);

// GET /classes/:id - Obtener clase por ID (requiere autenticación)
router.get('/:id', auth, getClassById);

// GET /classes/:id/students - Obtener estudiantes de una clase (admin o profesor de la clase)
router.get('/:id/students', auth, checkRole('admin', 'profesor'), getClassStudents);

// POST /classes - Crear clase (solo admin)
router.post('/', auth, checkRole('admin'), createClass);

// PUT /classes/:id - Actualizar clase (admin o profesor asignado)
router.put('/:id', auth, checkRole('admin', 'profesor'), updateClass);

// DELETE /classes/:id - Eliminar clase (solo admin)
router.delete('/:id', auth, checkRole('admin'), deleteClass);

module.exports = router;