const express = require('express');
const fs = require('fs');
const dgram = require("dgram");
const bodyParser = require('body-parser');
const compression = require('compression');
const config = require('./config');

const app = express();
const server = dgram.createSocket("udp4");

let clients = [];

server.on("message", function (message, info) {
    console.log("--> from " + info.address + ":" + info.port);
    clients.push(info);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());

app.get('/status', (req, res) => {
    fs.readFile('data', 'utf8', (err, data) => {
        if (err) return res.status(400).send({ status: 400, result: 'data not found' });
        return res.status(200).send({ status: 200, result: data });
    });
});

app.post('/status', (req, res) => {
    const { status } = req.body;
    if (status) {
        switch (status) {
            case 'on':
                fs.writeFile("data", "on", (err) => { if (err) return console.log(err) });
                clients.forEach(e => {
                    server.send('on', e.port, e.address)
                    console.log('UDP SENT --> ' + e.address + ':' + e.port);
                });
                return res.status(200).send({ status: 200, result: 'on' });
            case 'off':
                fs.writeFile("data", "off", (err) => { if (err) return console.log(err) });
                clients.forEach(e => {
                    server.send('off', e.port, e.address)
                    console.log('UDP SENT --> ' + e.address + ':' + e.port);
                });
                return res.status(200).send({ status: 200, result: 'off' });
            default:
                fs.writeFile("data", "off", (err) => { if (err) return console.log(err) });
                clients.forEach(e => {
                    server.send('off', e.port, e.address)
                    console.log('UDP SENT --> ' + e.address + ':' + e.port);
                });
                return res.status(200).send({ status: 200, result: 'off' });
        }
    }
    return res.status(200).send({ status: 200, result: 'status not found' });
});

server.bind(config.udpPort, () => console.log(`Running UDP Server on port ${config.udpPort}`))

module.exports = app;