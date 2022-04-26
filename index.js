const express = require('express');
const app = express();
const fs = require('fs');
const db = require('./src/services/database.js');
const args = require('minimist')(process.argv.slice(2));
args['port', 'debug', 'log', 'help'];
const port = args.port || process.env.PORT || 5555;

const cors = require('cors');
app.use(cors());

// Make Express use its own built-in body parser for both urlencoded and JSON body data.
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Serve static HTML files
app.use(express.static('./public'));
// Make Express use its own built-in body parser to handle JSON
app.use(express.json());
app.use(express.static('./www'));

// Start an app server
const server = app.listen(port, () => {
    console.log('App listening on port %PORT%'.replace('%PORT%', port))
});

// Help message
if (args.help == true) {
    console.log(`server.js [options]
    
    --port	Set the port number for the server to listen on. Must be an integer
                between 1 and 65535.
    
    --debug	If set to true, creates endlpoints /app/log/access/ which returns
                a JSON access log from the database and /app/error which throws 
                an error with the message "Error test successful." Defaults to 
                false.
    
    --log	If set to false, no log files are written. Defaults to true.
                Logs are always written to database.
    
    --help	Return this message and exit.
    `);
    process.exit(0);
}

if (args.debug == true) {
    app.get("/app/log/access", (req, res) => {
        try {
            const stmt = db.prepare('SELECT * FROM accesslog').all();
            res.status(200).json(stmt);
        } catch {
            console.error(e);
        }
    });

    app.get('/app/error', (req, res) => {
        res.status(500);
        throw new Error('Error test completed successfully.');
    });
}

if (args.log == true) {
    const morgan = require('morgan');
    const accessLog = fs.createWriteStream('access.log', { flags: 'a' });
    app.use(morgan('combined', { stream: accessLog }));
}

// Middleware function to insert new record
app.use((req, res, next) => {
    let logdata = {
        remoteaddr: req.ip,
        remoteuser: req.user,
        time: Date.now(),
        method: req.method,
        url: req.url,
        protocol: req.protocol,
        httpversion: req.httpVersion,
        status: res.statusCode,
        referer: req.headers['referer'],
        useragent: req.headers['user-agent']
    }

    const stmt = db.prepare(`INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url, protocol, httpversion, secure, status, referer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`)
    const info = stmt.run(String(logdata.remoteaddr), String(logdata.remoteuser), String(logdata.time), String(logdata.method), String(logdata.url), String(logdata.protocol), String(logdata.httpversion), String(logdata.secure), String(logdata.status), String(logdata.referer), String(logdata.useragent));
    next();
})

app.get('/app/', (req, res) => {
    res.statusCode = 200;
    res.statusMessage = 'OK';
    res.writeHead(res.statusCode, { 'Content-Type': 'text/plain' });
    res.end(res.statusCode + ' ' + res.statusMessage);
});

app.get('/app/flip', (req, res) => {
    res.status(200).json({ flip: coinFlip() });
});

app.get('/app/flips/:number', (req, res) => {
    let arr = coinFlips(req.body.number);
    res.status(200).json({ raw: arr, summary: countFlips(arr) });
});


app.get('/app/flip/call/heads', (req, res) => {
    res.status(200).json(flipACoin("heads"));
});

app.get('/app/flip/call/tails', (req, res) => {
    res.status(200).json(flipACoin("tails"));
});

app.post('/app/flip/call/', (req, res, next) => {
    const game = flipACoin(req.body.guess);
    res.status(200).json(game);
})

app.post('/app/flips/coins/', (req, res, next) => {
    const result = coinFlips(parseInt(req.body.number));
    const count = countFlips(result);
    res.status(200).json({"raw": result, "summary": count});
})

// Default response for any other request
app.use(function (req, res) {
    res.status(404).send('404 NOT FOUND');
    res.type("text/plain");
});

process.on('SIGTERM', () => {
    server.close(() => {
        console.log('Server stopped');
    })
})

function coinFlip() {
    return (Math.random() > 0.5 ? "heads" : "tails");
}

function coinFlips(flips) {
    const flipResults = [];
    const output = { raw: [], summary: "" };

    for (var i = 0; i < flips; i++) {
        flipResults.push(coinFlip());
    }

    output.raw = flipResults;
    output.summary = countFlips(flipResults);

    return output;
}

function countFlips(array) {
    var counts = { heads: 0, tails: 0 };

    array.forEach(element => {
        if (element == "heads")
            counts.heads++;
        else
            counts.tails++;
    });

    if (counts.heads == 0)
        delete counts.heads;
    else if (counts.tails == 0)
        delete counts.tails;

    return counts;
}

function flipACoin(call) {
    var result = coinFlip();
    const output = { call: "", flip: "", result: "" };

    output.call = call;
    output.flip = result;
    output.result = (call == result ? "win" : "lose");

    return output;
}