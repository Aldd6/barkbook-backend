module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define('User', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            field: 'id_user'
        },
        uid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false,
            field: 'user_uid'
        },
        rolId: {
            type: Sequelize.INTEGER,
            references: { 
                model: 'Role', 
                key: 'id_role' 
            },
            allowNull: false,
            field: 'rol_id'
        },
        username: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
            validate: {
                is: {
                    args: [/^[A-Za-z0-9]+$/],
                    msg: 'El usuario debe contener unicamente numeros y letras.'
                }
            },
            field: 'username'
        },
        email: {
            type: Sequelize.STRING(254),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
                len: [5,254]
            },
            field: 'email'
        },
        hashPassword: {
            type: Sequelize.STRING(60),
            allowNull: false,
            validate: {
                is: {
                    args: [/^\$2[ayb]\$\d{2}\$[./0-9A-Za-z]{53}$/],
                    msg: "El formato del hash de la contraseña no es valido."
                }
            },
            field: 'hash_password'
        },
        profileCompleted: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            field: 'profile_completed'
        }
    }, 
    {
        defaultScope: {
            attributes: { exclude: ['hash_password'] }
        }
    });

    User.associate = (models) => {
        User.belongsTo(models.Role, { foreignKey: 'rolId' });
        User.hasMany(models.Worklog, { foreignKey: 'userId' });
    }

    return User;
};