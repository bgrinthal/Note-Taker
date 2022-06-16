const express = require('express');
const path = require('path');
const fs = require('fs');
const util = require('util');

const app = express();

// Set PORT
const PORT = process.env.PORT || 3001;

// 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Link static elements
app.use(express.static('public'));

//direct user to correct page depending on url
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/public/index.html"))
});

app.get("/notes", (req, res) => {
    res.sendFile(path.join(__dirname, "/public/notes.html"))
});

//=================================================================================

const readFromFile = util.promisify(fs.readFile);

const writeToFile = (destination, content) =>
    fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
        err ? console.error(err) : console.info(`\nData written to ${destination}`)
    );

const readAndAppend = (content, file) => {
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
        } else {
            const parsedData = JSON.parse(data);
            parsedData.push(content);
            writeToFile(file, parsedData);
        }
    });
};

// GET Route for retrieving all the tips
app.get('/api/notes', (req, res) => {
    console.info(`${req.method} request received for notes`);
    readFromFile('./db/notes.json').then((data) => res.json(JSON.parse(data)));
});

// POST Route for a new UX/UI tip
app.post('/api/notes', (req, res) => {
    console.info(`${req.method} request received to add a note`);

    const { title, text, id } = req.body;

    if (req.body) {
        const newNote = {
            title,
            text
        };

        readAndAppend(newNote, './db/notes.json');
        res.json(`Note added successfully 🚀`);
    } else {
        res.error('Error in adding note');
    }
});

//delete chosen note using delete http method
app.delete("/api/notes/:id", (req, res) => {
    console.log(req);
    let deleteNote = JSON.parse(req.params.id);
    console.log("ID to be deleted: ", deleteNote);
    fs.readFile(path.join(__dirname, "./db/notes.json"), "utf8", (error, notes) => {
        if (error) {
            return console.log(error)
        }
        let noteArray = JSON.parse(notes);
        for (var i = 0; i < notesArray.length; i++) {
            if (deleteNote == noteArray[i].id) {
                noteArray.splice(i, 1);

                fs.writeFile(path.join(__dirname, "./db/db.json"), JSON.stringify(noteArray), (error, data) => {
                    if (error) {
                        return error
                    }
                    console.log(noteArray)
                    res.json(noteArray);
                })
            }
        }

    });
});

// Listener
app.listen(PORT, () => {
    console.log(`App listening at http://localhost:${PORT} 🚀!`);
});