const express = require('express');
const router = express.Router();
const { 
  getProfile, 
  getAllUsers, 
  getUserById, 
  updateUser, 
  deleteUser,
  getProfessors,
  getStudents
} = require('../controllers/users.controller');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// GET /users/profile - Obtener perfil del usuario autenticado
router.get('/profile', auth, getProfile);

// GET /users/professors - Obtener lista de profesores (requiere autenticación)
router.get('/professors', auth, getProfessors);

// GET /users/students - Obtener lista de estudiantes (requiere autenticación)
router.get('/students', auth, getStudents);

// GET /users - Obtener todos los usuarios (solo admin)
router.get('/', auth, checkRole('admin'), getAllUsers);

// GET /users/:id - Obtener usuario por ID (solo admin)
router.get('/:id', auth, checkRole('admin'), getUserById);

// PUT /users/:id - Actualizar usuario (solo admin)
router.put('/:id', auth, checkRole('admin'), updateUser);

// DELETE /users/:id - Eliminar usuario (solo admin)
router.delete('/:id', auth, checkRole('admin'), deleteUser);

module.exports = router;