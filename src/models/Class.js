const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Class = sequelize.define('Class', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_asignatura: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'subjects',
        key: 'id'
      }
    },
    id_profesor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    horario: {
      type: DataTypes.STRING,
      allowNull: false
    },
    salon: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'classes',
    timestamps: true,
    underscored: true
  });

  return Class;
};