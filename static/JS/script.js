var id = null;
var won_or_lost = false;

function render_character(character) {
    document.getElementsByClassName("dynamicText")[0].innerHTML = character.toUpperCase();
}

async function render_message(character, correct) {
    var happy = [9757, 9889, 9996, 10004, 128526, 127774, 128525, 128584];
    var sad = [128580, 128577, 128575, 128561, 128560, 128557, 128555, 128545];
    var random = Math.floor(Math.random() * 8);
    var ele = document.getElementById("messages");

    if (correct) {
        ele.innerHTML = character.toUpperCase() + " is Correct! &#" + happy[random] + ";";
    } else {
        ele.innerHTML = character.toUpperCase() + " is Incorrect! &#" + sad[random] + ";";
    }
}

async function depleteLive() {
    const options = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: id })
    };
    const response = await fetch("/depleteLive", options);
    const json = await response.json();

    if (json.life <= 0) {
        lost();
    }
    document.getElementsByClassName("dynamicText")[1].innerHTML = json.life + " / 9";


}

function turn_keyboard_off(message, url) {
    won_or_lost = true;
    document.getElementById("messages").innerHTML = message;
    document.querySelectorAll(".key").forEach(element => {
        element.classList.add("off");
        element.classList.remove("key");
        element.onclick = null;
    });
    setInterval(() => {
        window.location = url + "/" + id;
    }, 1500);
}

function lost() {
    turn_keyboard_off("You Lost!", "lost")
}

function game_won() {
    turn_keyboard_off("You Won!", "won")
}

const userLeft = (e) => {
    if (!won_or_lost) {
        fetch("userLeft/" + id);
        e.preventDefault();
        e.returnValue = 'Hey';
    }
}

function keyboardEvent(event) {
    var x = event.key.toUpperCase();

    charCode = x.charCodeAt(0);

    if (x.length == 1 && (charCode >= 65 && charCode <= 90)) {
        // document.getElementById(x).focus();
        func(x);
    }
}


async function func(id_name) {
    var element = document.getElementById(id_name);

    if (!element.onclick) {
        alert("You Have Already selected: " + id_name);
        return "";
    }

    element.classList.add("off");
    element.classList.remove("key");
    element.onclick = null;
    render_character(id_name);

    const data = {
        id: id,
        character: id_name
    };

    const options = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    const response = await fetch("/api", options);
    const json = await response.json();


    render_movie(json);
    render_message(id_name, json.correct);
    if (json.win)
        game_won();

}


async function render_movie(data) {
    if (data.correct) {
        const movie_placeholder = stringjoin(data.movie_placeholder);
        document.querySelector("#gameArea>span").innerHTML = movie_placeholder;

    } else {
        depleteLive();
    }
}



function stringjoin(movie_placeholder) {
    var return_string = "";
    for (let character of movie_placeholder) {
        if (character == "_") {
            return_string += "__ ";
        } else if (character == "/")
            return_string += "&nbsp&nbsp";
        else {
            return_string += character + " ";
        }
    }
    return return_string.trim();
}


async function start() {
    const response = await fetch("/start");
    const recived_data = await response.json();
    id = recived_data.id;
    // console.log(id);
    document.querySelector("#gameArea>span").innerHTML = stringjoin(recived_data.movie_placeholder);
}

addEventListener("beforeunload", userLeft, { capture: true });
start();