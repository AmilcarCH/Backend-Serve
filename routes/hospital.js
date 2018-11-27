var express = require('express');

//var SEED = require('../config/config').SEED;
var mdAutenticacion = require('../middlewares/autenticacion')

var app = express();


var Hospital = require('../models/hospital');

//==========================================
//Obtener todos los Hospital
//==========================================

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'error cargando Hospital',
                        errors: err
                    })

                }

                Hospital.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
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
    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "error al buscar el hospital",
                error: err
            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'hospital con el id' + id + 'no existe',
                error: { message: 'no existe un hospital con ese ID' }
            });

        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "error al actualizar el hospital",
                    error: err
                });
            }
            res.status(200).json({
                ok: true,
                hospitales: hospitalGuardado
            });
        });
    });

});

//==========================================
//Crear Usuario
//==========================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: "error al crear el hospital",
                error: err
            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'el hospital con el id' + id + 'no existe',
                error: { message: 'no existe un hospital con ese ID' }
            });

        }
        res.status(201).json({
            ok: true,
            usuarios: hospitalGuardado,
        });
    })


})

//==========================================
//Borrar Usuario
//==========================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Hospital.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: "error al borrar el hospital",
                error: err
            });
        }
        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    })
})

module.exports = app;