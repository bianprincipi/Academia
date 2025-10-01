const express = require('express');
const router = express.Router();
const { 
  createEnrollment, 
  getMyEnrollments, 
  getEnrollmentsByUser,
  getAllEnrollments,
  deleteEnrollment,
  getAvailableClasses,
  getMySchedule
} = require('../controllers/enrollments.controller');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// GET /enrollments/available-classes - Obtener clases disponibles para inscribirse (estudiante)
router.get('/available-classes', auth, checkRole('estudiante'), getAvailableClasses);

// GET /enrollments/my-enrollments - Obtener mis inscripciones (estudiante)
router.get('/my-enrollments', auth, checkRole('estudiante'), getMyEnrollments);

// GET /enrollments/my-schedule - Obtener mi horario (estudiante)
router.get('/my-schedule', auth, checkRole('estudiante'), getMySchedule);

// GET /enrollments - Obtener todas las inscripciones (solo admin)
router.get('/', auth, checkRole('admin'), getAllEnrollments);

// GET /enrollments/user/:id_usuario - Obtener inscripciones de un usuario (solo admin)
router.get('/user/:id_usuario', auth, checkRole('admin'), getEnrollmentsByUser);

// POST /enrollments - Crear inscripción (estudiante)
router.post('/', auth, checkRole('estudiante'), createEnrollment);

// DELETE /enrollments/:id - Cancelar inscripción (estudiante dueño o admin)
router.delete('/:id', auth, checkRole('admin', 'estudiante'), deleteEnrollment);

module.exports = router;