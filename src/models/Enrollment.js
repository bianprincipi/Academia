const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Enrollment = sequelize.define('Enrollment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    id_clase: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'classes',
        key: 'id'
      }
    },
    fecha_inscripcion: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'enrollments',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['id_usuario', 'id_clase']
      }
    ]
  });

  return Enrollment;
};