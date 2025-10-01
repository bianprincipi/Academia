const { sequelize } = require('../config/database');
const UserModel = require('./User');
const SubjectModel = require('./Subject');
const ClassModel = require('./Class');
const EnrollmentModel = require('./Enrollment');

// Inicializar modelos
const User = UserModel(sequelize);
const Subject = SubjectModel(sequelize);
const Class = ClassModel(sequelize);
const Enrollment = EnrollmentModel(sequelize);

// Definir relaciones

// Subject - Class (1:N)
Subject.hasMany(Class, {
  foreignKey: 'id_asignatura',
  as: 'classes'
});
Class.belongsTo(Subject, {
  foreignKey: 'id_asignatura',
  as: 'asignatura'
});

// User (profesor) - Class (1:N)
User.hasMany(Class, {
  foreignKey: 'id_profesor',
  as: 'classes_profesor'
});
Class.belongsTo(User, {
  foreignKey: 'id_profesor',
  as: 'profesor'
});

// User (estudiante) - Enrollment (1:N)
User.hasMany(Enrollment, {
  foreignKey: 'id_usuario',
  as: 'enrollments'
});
Enrollment.belongsTo(User, {
  foreignKey: 'id_usuario',
  as: 'estudiante'
});

// Class - Enrollment (1:N)
Class.hasMany(Enrollment, {
  foreignKey: 'id_clase',
  as: 'enrollments'
});
Enrollment.belongsTo(Class, {
  foreignKey: 'id_clase',
  as: 'clase'
});

// Sincronizar modelos
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Modelos sincronizados con la base de datos');
  } catch (error) {
    console.error('❌ Error sincronizando modelos:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  Subject,
  Class,
  Enrollment,
  syncDatabase
};