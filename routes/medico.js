var express = require('express');

//var SEED = require('../config/config').SEED;
var mdAutenticacion = require('../middlewares/autenticacion')

var app = express();


var Medico = require('../models/medico');

//==========================================
//Obtener todos los Medico
//==========================================

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospita')
        .exec(
            (err, medicos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'error cargando Medico',
                        errors: err
                    })

                }
                Medico.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: conteo
                    })
                })
            })

});



//==========================================
//Actualizar Usuario
//==========================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "error al buscar el medico",
                error: err
            });
        }
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'medico con el id' + id + 'no existe',
                error: { message: 'no existe un medico con ese ID' }
            });

        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "error al actualizar el medico",
                    error: err
                });
            }
            res.status(200).json({
                ok: true,
                medicos: medicoGuardado
            });
        });
    });

});

//==========================================
//Crear Usuario
//==========================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: "error al crear el medico",
                error: err
            });
        }
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'el medico con el id' + id + 'no existe',
                error: { message: 'no existe un medico con ese ID' }
            });

        }
        res.status(201).json({
            ok: true,
            usuarios: medicoGuardado,
        });
    })


})

//==========================================
//Borrar Usuario
//==========================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Medico.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: "error al borrar el medico",
                error: err
            });
        }
        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    })
})

module.exports = app;