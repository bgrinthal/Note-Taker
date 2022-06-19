const express = require('express');
const path = require('path');
const fs = require('fs');
const util = require('util');
const noteData = require('./db/notes.json');

const app = express();

// Set PORT
const PORT = process.env.PORT || 3001;

// Parses incoming data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Link static elements
app.use(express.static('public'));

//defines default route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/public/index.html"))
});

// Defines /notes endpoint route
app.get("/notes", (req, res) => {
    res.sendFile(path.join(__dirname, "/public/notes.html"))
});


const readFromFile = util.promisify(fs.readFile);

// constant to write new note to file
const writeToFile = (destination, content) =>
    fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
        err ? console.error(err) : console.info(`\nData written to ${destination}`)
    );

// constant to append file
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

// GET Route for retrieving all the notes
app.get('/api/notes', (req, res) => {
    console.info(`${req.method} request received for notes`);
    readFromFile('./db/notes.json').then((data) => res.json(JSON.parse(data)));
});

// POST Route for a new note
app.post('/api/notes', (req, res) => {
    console.info(`${req.method} request received to add a note`);

    // deconstruction
    const { title, text } = req.body;

    if (req.body) {
        const newNote = {
            title,
            text,
            id: Math.floor(Math.random() * 1000)
        };

        readAndAppend(newNote, './db/notes.json');
        res.json(`Note added successfully 🚀`);
    } else {
        res.error('Error in adding note');
    }
});

//delete chosen note by id
app.delete('/api/notes/:id', (req, res) => {
    let deleteNote = JSON.parse(req.params.id);
    console.log("ID of note to be deleted: ", deleteNote);
    fs.readFile(path.join(__dirname, "./db/notes.json"), "utf8", (error, notes) => {
        console.log("from notes ==>", JSON.parse(notes));
        if (error) {
            return console.log(error)
        }
        let notesArr = JSON.parse(notes);
        // searches for correct clicked note
        for (var i = 0; i < notesArr.length; i++) {
            if (deleteNote == notesArr[i].id) {
                notesArr.splice(i, 1);

                // Writes to /db/notes.json folder
                fs.writeFile(path.join(__dirname, "./db/notes.json"), JSON.stringify(notesArr), (error, data) => {
                    if (error) {
                        return error
                    }
                    console.log(notesArr)
                    res.json(notesArr);
                })
            }
        }

    });
});

// Listener
app.listen(PORT, () => {
    console.log(`App listening at http://localhost:${PORT} 🚀!`);
});