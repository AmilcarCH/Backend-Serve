var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

//=============================================
//Busqueda por coleccion
//=============================================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var regx = new RegExp(busqueda, 'i');

    var promesa;

    switch (tabla) {
        case 'usuarios':

            promesa = buscarUsuarios(busqueda, regx);
            break;
        case 'medicos':

            promesa = buscarMedicos(busqueda, regx);
            break;
        case 'hospitales':

            promesa = buscarHospitales(busqueda, regx);
            break;
        default:
            return res.status(400).json({
                ok: false,
                message: 'los tipos de busqueda solo son: usuarios, medicos y hospitales',
                error: { message: 'Tipo de tabla/coleccion no es valido' }

            })

    }

    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        })
    })

})

//=============================================
//Busqueda General
//=============================================
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regx = new RegExp(busqueda, 'i');

    Promise.all([
            buscarHospitales(busqueda, regx),
            buscarMedicos(busqueda, regx),
            buscarUsuarios(busqueda, regx)
        ])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            })

        })

});

function buscarHospitales(busqueda, regx) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regx })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if (err) {
                    reject('error al cargar hospitales', err);

                } else {
                    resolve(hospitales);
                }

            })
    });


}

function buscarMedicos(busqueda, regx) {

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regx })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err) {
                    reject('error al cargar medicos', err);

                } else {
                    resolve(medicos);
                }

            })
    });


}

function buscarUsuarios(busqueda, regx) {

    return new Promise((resolve, reject) => {

        Usuario.find({ nombre: regx }, 'nombre email role')
            .or([{ nombre: regx }, { 'email': regx }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err)
                } else {
                    resolve(usuarios);
                }
            })

    });


}

module.exports = app;