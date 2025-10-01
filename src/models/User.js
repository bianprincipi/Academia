const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    correo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    contraseña: {
      type: DataTypes.STRING,
      allowNull: false
    },
    rol: {
      type: DataTypes.ENUM('admin', 'profesor', 'estudiante'),
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    reset_token: {
      type: DataTypes.STRING,
      allowNull: true
    },
    reset_token_expire: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.contraseña) {
          const salt = await bcrypt.genSalt(10);
          user.contraseña = await bcrypt.hash(user.contraseña, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('contraseña')) {
          const salt = await bcrypt.genSalt(10);
          user.contraseña = await bcrypt.hash(user.contraseña, salt);
        }
      }
    }
  });

  // Método para comparar contraseñas
  User.prototype.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.contraseña);
  };

  return User;
};