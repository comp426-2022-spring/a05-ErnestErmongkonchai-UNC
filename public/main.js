// Focus div based on nav button click
document.getElementById("homenav").onclick = function () {
    document.location.reload();
    document.getElementById("homenav").className = "active";
    document.getElementById("singlenav").className = "";
    document.getElementById("multinav").className = "";
    document.getElementByIdii("guessnav").className = "";

    document.getElementById("home").className = "";
    document.getElementById("single").className = "hidden";
    document.getElementById("multi").className = "hidden";
    document.getElementById("guess").className = "hidden";
}

document.getElementById("singlenav").onclick = function () {
    document.getElementById("homenav").className = "";
    document.getElementById("singlenav").className = "active";
    document.getElementById("multinav").className = "";
    document.getElementById("guessnav").className = "";

    document.getElementById("home").className = "hidden";
    document.getElementById("single").className = "";
    document.getElementById("multi").className = "hidden";
    document.getElementById("guess").className = "hidden";
};

document.getElementById("multinav").onclick = function () {
    document.getElementById("homenav").className = "";
    document.getElementById("singlenav").className = "";
    document.getElementById("multinav").className = "active";
    document.getElementById("guessnav").className = "";

    document.getElementById("home").className = "hidden";
    document.getElementById("single").className = "hidden";
    document.getElementById("multi").className = "";
    document.getElementById("guess").className = "hidden";
};

document.getElementById("guessnav").onclick = function () {
    document.getElementById("homenav").className = "";
    document.getElementById("singlenav").className = "";
    document.getElementById("multinav").className = "";
    document.getElementById("guessnav").className = "active";

    document.getElementById("home").className = "hidden";
    document.getElementById("single").className = "hidden";
    document.getElementById("multi").className = "hidden";
    document.getElementById("guess").className = "";
};
// Flip one coin and show coin image to match result when button clicked
function single_coin() {
    fetch('http://localhost:5555/app/flip/', { mode: 'cors' }).then(function (response) {
        return response.json();
    }).then(function (result) {
        console.log(result);
        document.getElementById("resultsingle").innerHTML = result.flip;
        document.getElementById("quarter").src = `./assets/img/${result.flip}.png`
    })
}
// Flip multiple coins and show coin images in table as well as summary results
// Enter number and press button to activate coin flip series
function flipCoins() {
    number_flips = document.getElementById("flipnumber").ariaValueMax;
    fetch('http://localhost:5555/app/flips/coins', {
        body: JSON.stringify({
            "number": number_flips
        }),
        headers: {
            "Content-Type": "application/json",
        },
        method: "post"
    }).then(function (response) {
        return response.json();
    }).then(function (result) {
        console.log(result);
        document.getElementById("num_heads").innerHTML = result.summary.heads;
        document.getElementById("num_tails").innerHTML = result.summary.tails;

        var detailsTableBody = document.getElementById("details");
        for (var i = 0; i < result.raw.length; i++) {
            var currentRow = document.createElement("tr");

            var currNumber = document.createElement("td");
            currNumber.innerHTML = i + 1;
            currentRow.appendChild(currNumber);

            var currResult = document.createElement("td");
            currResult.innerHTML = result.raw[i];
            currentRow.appendChild(currResult);

            var currImageCell = document.createElement("td");
            var currImageActual = document.createElement("img");
            currImageActual.setAttribute("src", "assets/img/" + result.raw[i] + ".png");
            currImageActual.setAttribute("class", "smallcoin");
            currImageCell.appendChild(currImageActual);
            currentRow.appendChild(currImageCell);

            detailsTableBody.appendChild(currentRow);
        }
        document.getElementById("results_tbl").setAttribute("class", "active");
    })
}
// Guess a flip by clicking either heads or tails button
function guess_flip(guess) {
    console.log(guess);
    fetch('http://localhost:5555/app/flip/call', {
        body: JSON.stringify({
            "guess": guess
        }),
        headers: {
            "Content-Type": "application/json",
        },
        method: "post"
    }).then(function (response) {
        return response.json();
    }).then(function (result) {
        console.log(result);

        document.getElementById("your_call").innerHTML = guess;
        document.getElementById("your_call_img").setAttribute("src", "assets/img/" + guess + ".png")

        document.getElementById("flip_result").innerHTML = result.flip;
        document.getElementById("flip_result_img").setAttribute("src", "assets/img/" + result.flip + ".png");

        document.getElementById("guess_result").innerHTML = "You " + result.result + ".";
    })
}