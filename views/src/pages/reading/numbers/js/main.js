$(document).ready(function () {
    const tableSize = 3;
    console.log("ready!");
    localStorage.game_points = 0;
    const points = 0;
    const TIMEOUT = 5000;
    localStorage.game_points = 0;
    $("#game_points").html("0");

    var currentMatrix = [];
    var allMatrix = [];
    var missingNumbers = [];

    var myFunc;

    function hello() {
        console.log("hello clicked");
    }


    function shuffle(a) {
        var j, x, i;
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        }
        return a;
    }

    function showTable(arr, tableId) {

        currentMatrix = arr;

        $("#" + tableId).html("");

        var content = "<table>";
        content += '<tr>';
        for (var i = 0; i < arr.length; i++) {
            if (i % tableSize == 0 && i != 0) {
                content += '</tr>';
            }
            if (i % tableSize == 0 && i != 0) {
                content += '<tr>';
            }

            content += '<td class="tableData">' + arr[i] + '</td>';

        }
        content += "</table>";

        console.log(content);
        $("#" + tableId).append(content);

    }

    function showGamePoints() {
        $("#game_points").html("");

        var points = localStorage.game_points || 0;
        $("#game_points").append(points);
    }

    function showAnswer(sameOrNot) {
        $("#game_answer").html("");
        if (sameOrNot) {
            $("#game_answer").append("SAME");
        } else {
            $("#game_answer").append("NOT SAME");
        }

        localStorage.game_answer = sameOrNot;
    }

    function showSecondTable(arr, tableId) {
        console.log(arr);
        $("#" + tableId + " td").each(function (index) {
            console.log(index + ": " + $(this).text());
            $(this).text(arr[index]);
            $(this).removeClass("selected");
        });

    }

    function generateTable() {
        var numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        var firstTable = new Array(tableSize * tableSize);
        var shuffledArray = shuffle(numbers);
        allMatrix = shuffledArray;
        missingNumbers = [];
        console.log("Shuffled array");
        console.log(shuffledArray);
        for (var i = 0; i < tableSize * tableSize; i++) {
            firstTable[i] = shuffledArray[i];
        }

        for (var i = 9; i < 12; i++) {
            missingNumbers.push(shuffledArray[i]);
        }
        allMatrix = shuffle(allMatrix);
        console.log(firstTable);
        showTable(firstTable, "first_table");
        showSecondTable(allMatrix, "second_table");

        $("#myFirstRow").show();
        $("#mySecondRow").hide();

    }


    $("#playNext").click(function () {

        $("#myFirstRow").hide();
        $("#mySecondRow").show();

    });
    $('.td').click(function (e) {
        e.preventDefault();
        console.log($(this).text());
        $(this).toggleClass("selected");
    });


    $("#endGame").click(function () {
        localStorage.game_answer = 0;
        localStorage.game_points = 0;
        generateTable();
        showGamePoints();
    });

    function showNotification(correct) {
        console.log("Correct: " + correct);
        $("#notification").show();
        if (correct) {
            $("#missingNumbers").text("Correct");
        } else {
            $("#missingNumbers").text('Неправильно! Правильный ответ: ' + missingNumbers.join(", "));
        }
        setTimeout(function () {
            $("#notification").hide();
        }, 1000);
    }

    $("#checkGame").click(function (e) {
        console.log("Check clicked");
        e.preventDefault();
        var answer = [];
        $(".selected").each(function (index) {
            console.log(index + ": " + $(this).text());
            answer.push(parseInt($(this).text()));
        });
        console.log("Answer");
        console.log(answer);
        console.log("missing");
        console.log(missingNumbers);

        var same = false;
        for (var i = 0; i < answer.length; i++) {
            var ok = false;
            for (var j = 0; j < missingNumbers.length; j++) {
                if (answer[i] == missingNumbers[j]) {
                    ok = true;
                    break;
                }
            }

            if (ok == false) {
                break;
            }
            if (i + 1 == answer.length) {
                same = true;
            }
        }

        if (same) {
            var points = parseInt(localStorage.game_points) + 100;
            localStorage.game_points = points;
        } else {
            var points = parseInt(localStorage.game_points) - 50;
            localStorage.game_points = points;
        }
        showNotification(same);
        showGamePoints();
        generateTable();

    });

    generateTable();

});
