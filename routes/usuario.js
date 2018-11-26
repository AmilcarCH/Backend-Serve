var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

//var SEED = require('../config/config').SEED;
var mdAutenticacion = require('../middlewares/autenticacion')

var app = express();


var Usuario = require('../models/Usuario');

//==========================================
//Obtener todos los usuarios
//==========================================

app.get('/', (req, res, next) => {

    Usuario.find({}, 'nombre email img role')
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'error cargando usuarios',
                        errors: err
                    })

                }
                res.status(200).json({
                    ok: true,
                    usuarios: usuarios
                })
            })

});



//==========================================
//Actualizar Usuario
//==========================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "error al buscar el usuario",
                error: err
            });
        }
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'el usuario con el id' + id + 'no existe',
                error: { message: 'no existe un usuario con ese ID' }
            });

        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "error al actualizar el usuario",
                    error: err
                });
            }
            res.status(200).json({
                ok: true,
                usuarios: usuarioGuardado
            });
        });
    });

});

//==========================================
//Crear Usuario
//==========================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: "error al crear el usuario",
                error: err
            });
        }
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'el usuario con el id' + id + 'no existe',
                error: { message: 'no existe un usuario con ese ID' }
            });

        }
        res.status(201).json({
            ok: true,
            usuarios: usuarioGuardado,
            usuariotoken: req.usuario
        });
    })


})

//==========================================
//Borrar Usuario
//==========================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: "error al borrar el usuario",
                error: err
            });
        }
        res.status(200).json({
            ok: true,
            usuarios: usuarioBorrado
        });
    })
})

module.exports = app;