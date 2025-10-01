const express = require('express');
const router = express.Router();
const { 
  getAllSubjects, 
  getSubjectById, 
  createSubject, 
  updateSubject, 
  deleteSubject 
} = require('../controllers/subjects.controller');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// GET /subjects - Obtener todas las asignaturas (requiere autenticación)
router.get('/', auth, getAllSubjects);

// GET /subjects/:id - Obtener asignatura por ID (requiere autenticación)
router.get('/:id', auth, getSubjectById);

// POST /subjects - Crear asignatura (solo admin)
router.post('/', auth, checkRole('admin'), createSubject);

// PUT /subjects/:id - Actualizar asignatura (solo admin)
router.put('/:id', auth, checkRole('admin'), updateSubject);

// DELETE /subjects/:id - Eliminar asignatura (solo admin)
router.delete('/:id', auth, checkRole('admin'), deleteSubject);

module.exports = router;