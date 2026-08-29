module.exports = (sequelize, Sequelize) => {
    const Usuario = sequelize.define('Usuario', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            field: 'id_usuario'
        },
        uid: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false,
            field: 'uid_usuario'
        },
        rolId: {
            type: Sequelize.INTEGER,
            references: { model: 'Rol', key: 'id_rol' },
            allowNull: false,
            field: 'rol_id'
        },
        usuario: {
            type: Sequelize.STRING,
            unique: true,
            validate: {
                is: {
                    args: [/^[A-Za-z0-9]+$/],
                    msg: 'El usuario debe contener unicamente numeros y letras.'
                }
            },
            field: 'nombre_usuario'
        },
        correoElectronico: {
            type: Sequelize.STIRNG(254),
            unique: true,
            validate: {
                isEmail: true,
                len: [5,254]
            },
            field: 'correo_electronico'
        },
        hashContrasenia: {
            type: Sequelize.STRING(60),
            allowNull: false,
            validate: {
                is: {
                    args: [/^\$2[ayb]\$\d{2}\$[./0-9A-Za-z]{53}$/],
                    msg: "El formato del hash de la contraseña no es valido."
                }
            },
            field: 'hash_contrasenia'
        },
        perfilCompletado: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            field: 'perfil_completado'
        }
    }, 
    {
        defaultScope: {
            attributes: { exclude: ['hash_contrasenia'] }
        }
    });

    Usuario.associate = (models) => {
        Usuario.belongsTo(models.Rol, { foreignKey: 'rol_id' });
    }

    return Usuario;
}