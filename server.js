//Constant
const http = require('http');
const express = require('express');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const port = process.env.PORT || 80;
const Api_KEY = process.env.Api_KEY


//VariableNeedsToLoadEveryTimePageIsRefreshed
var titleID = "";
var movie = "";
var movie_placeholder = "";
var lives = 9;

//static
app = express();
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.json({ limit: '1mb' }));

//pug
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));


app.get("/won", (req, res) => {
    if (!won()) {
        res.render("Error404.pug");
    } else {
        const params = { titleID: titleID, Api_KEY: Api_KEY };
        res.render("win.pug", params);
    }
});

app.get("/lost", (req, res) => {
    if (lives > 0) {
        res.render("Error404.pug");
    } else {
        const params = { titleID: titleID, Api_KEY: Api_KEY };
        res.render("lost.pug", params);

    }
})
app.get("/start", (req, res) => {
    lives = 9;
    var ret_value = get_random_movie();
    movie = ret_value[0].toUpperCase();
    titleID = ret_value[1];
    // console.log(movie + ";" + titleID);
    movie_placeholder = movie.replace(/ /g, "/").replace(/[A-Za-z]/g, "_").split("");
    data = {
        movie_placeholder: movie_placeholder
    };
    res.json(data);
})

app.post("/api", (req, res) => {
    // console.log(req.body);
    flag = fill_characters(req.body.character);
    win = won();
    data = {
        character: req.body.character,
        movie_placeholder: movie_placeholder,
        correct: flag,
        win: win
    };
    res.json(data);

})

app.get("/depleteLive", (req, res) => {
    data = {
        life: --lives
    };
    res.json(data);
})

app.listen(port, () => {
    console.log("Server Started on port");
})



function fill_characters(character) {
    character = character.toUpperCase();
    flag = false;
    for (var i = 0; i < movie.length; i++) {
        if (movie_placeholder[i] == '/') {
            continue;
        } else {
            if (movie.charAt(i) == character) {
                flag = true;
                movie_placeholder[i] = character;
            }
        }
    }
    return flag;

}

function get_random_movie() {
    const list = fs.readFileSync("./views/movie_list.txt", { encoding: 'utf8' }).split(/\r\n|\n/);
    var ran = Math.floor(Math.random() * list.length);
    return list[ran].split("*");

}

function won() {
    for (character of movie_placeholder)
        if (character == "_")
            return false;
    return true;
}