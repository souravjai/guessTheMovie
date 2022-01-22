//Constant
const http = require('http');
const express = require('express');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const port = process.env.PORT || 80;
const Api_KEY = process.env.Api_KEY



//VariableNeedsToLoadEveryTimePageIsRefreshed
const map = new Map();

//static
app = express();
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.json({ limit: '1mb' }));

//pug
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

//Setting up listenting Port
app.listen(port, () => {
    console.log("Server Started on port");
})


//ENDPOINT 

//start
app.get("/start", (req, res) => {


    var ret_value = get_random_movie();
    var random_id;

    //Assign the incoming Request with random id
    do {
        random_id = Math.floor(Math.random() * 1000);
    } while (map.has(random_id));

    movie = ret_value[0].toUpperCase();
    titleID = ret_value[1];
    movie_placeholder = movie.replace(/ /g, "/").replace(/[A-Za-z]/g, "_").split("");


    //Create a game json for that id
    map.set(random_id, {
        lives: 9,
        movie: movie,
        titleID: titleID,
        movie_placeholder: movie_placeholder,
        won: false
    });

    res.json({
        id: random_id,
        movie_placeholder: movie_placeholder
    });
})


//API
app.post("/api", (req, res) => {
    var data = map.get(req.body.id)
    data = fill_characters(req.body.character, data);
    flag = data.flag;
    data = won(data.json);
    map.set(req.body.id, data);
    const ret = {
        movie_placeholder: data.movie_placeholder,
        correct: flag,
        win: data.won
    };

    res.json(ret);
})


app.post("/depleteLive", (req, res) => {

    const data = map.get(req.body.id);

    var life = 0;
    if (data.lives > 0)
        life = --data.lives;

    map.set(req.body.id, data);

    res.json({
        life: life
    });
})


app.get("/won/:id", (req, res) => {

    const data = map.get(parseInt(req.params.id));
    if (!data) {
        res.render("Error404.pug");
    } else {
        dlete(req.params.id);
        // map.delete(req.params.id);
        const params = { titleID: data.titleID, Api_KEY: Api_KEY };
        res.render("win.pug", params);
    }
});

app.get("/lost/:id", (req, res) => {

    const data = map.get(parseInt(req.params.id));
    if (!data) {
        res.render("Error404.pug");
    } else {
        dlete(req.params.id);
        // map.delete(req.params.id);
        const params = { titleID: data.titleID, Api_KEY: Api_KEY };
        res.render("lost.pug", params);
    }


})

app.get("/userLeft/:id", (req, res) => {
    dlete(req.params.id);
})



//UTILITY FUNCTIONS
function get_random_movie() {
    const list = fs.readFileSync("./views/movie_list.txt", { encoding: 'utf8' }).split(/\r\n|\n/);
    var ran = Math.floor(Math.random() * list.length);
    return list[ran].split("*");

}

function fill_characters(character, data) {
    flag = false;

    for (var i = 0; i < data.movie.length; i++) {
        if (data.movie_placeholder[i] != '/' && data.movie.charAt(i) == character) {
            flag = true;
            data.movie_placeholder[i] = character;
        }
    }

    return { flag: flag, json: data };

}

function dlete(id) {
    map.delete(parseInt(id));
}

function won(data) {
    data.won = true;

    for (character of data.movie_placeholder)
        if (character == "_") {
            data.won = false;
            break;
        }
    return data;
}

setInterval(function() {

    var date = new Date(); // Create a Date object to find out what time it is
    if (date.getHours() === 12 && date.getMinutes() === 00) { // Check the time
        map.clear();
    }
}, 50000);