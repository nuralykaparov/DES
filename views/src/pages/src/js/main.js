$(document).ready(function () {
    const tableSize = 5;
    console.log("ready!");
    localStorage.game_points = 0;
    const points = 0;
    const TIMEOUT = 5000;
    $("#game_points").html("0");
    var myFunc;

    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    function rotateToRight(arr) {
        console.log("Rotate called");
        var size = arr.length;
        var tmp = new Array(size);
        for (var i = 0; i < size; i++) {
            tmp[i] = new Array();
        }

        for (var i = 0; i < size; i++) {
            for (var j = 0; j < size; j++) {
                tmp[j][size - 1 - i] = arr[i][j];
            }
        }
        return tmp;
    }

    function rotateTable(arr) {
        console.log(arr);
        var degrees = [90, 180, 270];
        var numRotates = getRandomInt(3);
        var selectedDegree = degrees[numRotates];
        console.log(selectedDegree);
        for (var i = 0; i <= numRotates; i++) {
            arr = rotateToRight(arr);
            console.log("Rotation # " + (i + 1));
            console.log(arr);
        }
        console.log("Rotated array");
        console.log(arr);
        return arr;
    }

    function showTable(arr, tableId) {

        $("#" + tableId).html("");

        var content = "<table>";
        for (var i = 0; i < arr.length; i++) {
            content += '<tr>';
            for (var j = 0; j < arr.length; j++) {
                if (arr[i][j] % 2 == 0) {
                    content += '<td class="even"></td>';
                } else {
                    content += '<td class="odd"></td>';
                }
            }
            content += '</tr>';
        }
        content += "</table>";

        console.log("add table to div tag");
        console.log(content);
        $("#" + tableId).append(content);

    }

    function changeTable(arr) {

        console.log("Rotate called");
        var size = arr.length;
        var count = 0;
        for (var i = 0; i < size; i++) {
            for (var j = 0; j < size; j++) {
                if (arr[i][j] == 1 && getRandomInt(2) == 1) {
                    arr[i][j] = 0;
                    count++;
                } else if (arr[i][j] == 0 && getRandomInt(2) == 0) {
                    arr[i][j] = 1;
                    count++;
                }
                if (count > 2) {
                    break;
                }
            }
            if (count > 2) {
                break;
            }
        }

        if (count == 0) {
            arr[3][2] = 1 - arr[3][2];
        }

        return arr;
    }

    function showGamePoints(points) {
        $("#game_points").html("");

        var points = points;
        $("#game_points").append(points);
        localStorage.game_points = points;
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

    function generateTable() {
        var emptyCells = 13;
        var sameTable = getRandomInt(2) % 2;
        // var num = 1;
        var firstTable = new Array(tableSize);
        var secondTable = new Array(tableSize);
        for (var i = 0; i < tableSize; i++) {
            firstTable[i] = new Array(tableSize);
            secondTable[i] = new Array(tableSize);

            for (var j = 0; j < tableSize; j++) {
                var even = getRandomInt(25) % 2;
                if (even == 0) {
                    firstTable[i][j] = 1
                } else {
                    firstTable[i][j] = 0;
                }
            }
        }
        console.log(firstTable);
        secondTable = rotateTable(firstTable);
        if (sameTable == 0) {
            secondTable = changeTable(secondTable);
        }

        console.log("FINAL TABLES");
        console.log(firstTable);
        console.log(secondTable);

        showTable(firstTable, "first_table");
        showTable(secondTable, "second_table");
        showAnswer(sameTable);


        myFunc = setTimeout(function () {
            generateTable();
        }, TIMEOUT);

    }

    $("#answerYes").click(function () {
        clearTimeout(myFunc);
        var gameAnswer = parseInt(localStorage.game_answer);
        var totalPoints = parseInt(localStorage.game_points);
        if (gameAnswer == 1) {
            totalPoints += 100;
            showGamePoints(totalPoints);
        } else {
            totalPoints -= 50;
            showGamePoints(totalPoints);
        }

        generateTable();
    });

    $("#answerNo").click(function () {
        clearTimeout(myFunc);
        var gameAnswer = parseInt(localStorage.game_answer);
        var totalPoints = parseInt(localStorage.game_points);
        if (gameAnswer == 0) {
            totalPoints += 100;
            showGamePoints(totalPoints);
        } else {
            totalPoints -= 50;
            showGamePoints(totalPoints);
        }

        generateTable();
    });

    $("#endGame").click(function () {
        clearTimeout(myFunc);
        localStorage.game_answer = 0;
        localStorage.game_points = 0;
    });

    $("#startGame").click(function () {
        generateTable();
    });

});
