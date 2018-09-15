/**
 * shows or hides game space
 * @param value {String} -> both || full || demo || none
 */
function showGameArena(value){
  switch(value){
    case "both":
      $("#color-game-space").css("display","none");
      $("#color-game-demo").css("display","none");
      break;
    case "full":
      $("#color-game-space").css("display","block");
      $("#color-game-demo").css("display","none");
      break;
    case "demo":
      $("#color-game-space").css("display","none");
      $("#color-game-demo").css("display","block");
      break;
    case "none":
      $("#color-game-space").css("display","none");
      $("#color-game-demo").css("display","none");
      break;
  }
}
showGameArena("none");
var colorGame = ColorGame();
function ColorGame() {
  return {
    score : 0,
    colorValues : ["red","blue","black","green","purple","yellow"],
    colorNames : [" КРАСНЫЙ","СИНИЙ","ЧЁРНЫЙ","ЗЕЛЁНЫЙ","ФИОЛЕТОВЫЙ","ЖЁЛТЫЙ"],
    trueColorValue : 0,
    isGameOver : false,
    scoreDiff : 10,
    intervalId : -1,
    incScore : function () { this.score += this.scoreDiff; },
    decScore : function () { this.score -= this.scoreDiff;
      if(this.score <= -30){
        gameOver();
      }
    },
  };
}

function initGame() {
  colorGame = ColorGame();
  updateScore();
}
function gameOver() {
  colorGame.isGameOver = true;
  // $('#gameOverModal').modal({backdrop: 'static', keyboard: false});
  // $('#gameOverModal').modal()
}
function isNull(value){
  return value === null || value === undefined;
}
function startNewColorGame() {
  clearInterval(colorGame.intervalId);
  initGame();
  showColorGameDemo();
}
function startTimer(){
  if(colorGame.isGameOver){
    return;
  }
  var elem = document.getElementById("progress");
  var width = 1;
  colorGame.intervalId = setInterval(frame, 50);
  function frame() {
    if (width >= 100) {
      // clearInterval(colorGame.intervalId);
      stopTime()
      lostRound();
    } else {
      width++;
      elem.style.width = width + '%';
    }
  }
}
function lostRound(){
  // clearInterval(colorGame.intervalId);
  stopTime();
  colorGame.decScore();
  updateScore();
  nextQuestion();
}
function winRound() {
  // clearInterval(colorGame.intervalId);
  stopTime();
  colorGame.incScore();
  updateScore();
  nextQuestion();
}
function showColorGameDemo() {
  showGameArena("demo");
}
function finishDemo() {
  showGameArena("full");
  nextQuestion();
}

function getRandom() {
  var range = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 99999999;
  var except = arguments[1];
  while (true) {
    var num = Math.floor(Math.random() * range);
    if (isNull(except)) return num;else if (except instanceof Array) {
      var flag = true;
      for (var i = 0; i < except.length; i++) {
        if (except[i] === num) flag = false;
      }
      if (flag) return num;
    } else if (!isNaN(except) && except !== num) {
      return num;
    }
  }
}

// create new level
function nextQuestion() {
  var colorLen = colorGame.colorNames.length;
  colorGame.trueColorValue = getRandom(colorLen);
  var name = getRandom(colorLen);
  
  $("#question").text(colorGame.colorNames[name]);
  $("#question").css("color",colorGame.colorValues[colorGame.trueColorValue]);
  
  var trueChoice = getRandom($(".question-answer").length);
  var usedColorValues = [colorGame.trueColorValue];
  var usedColorNames = [name];
  for(var i = 0;i < $(".question-answer").length;i++){
    var tempColorValue = getRandom(colorLen,usedColorValues);
    var tempColorName = getRandom(colorLen,usedColorNames);
    usedColorNames.push(tempColorName);
    usedColorValues.push(tempColorValue);
    $(".question-answer")[i].style.color = colorGame.colorValues[tempColorValue];
    
    if(i == trueChoice){
      $(".question-answer")[i].innerText = colorGame.colorNames[colorGame.trueColorValue];
      $(".question-answer")[i].setAttribute("color-value",colorGame.trueColorValue);
      continue;
    }
    $(".question-answer")[i].setAttribute("color-value",tempColorName);
    $(".question-answer")[i].innerText = colorGame.colorNames[tempColorName];
  }
  startTimer();
}


function stopTime() {
  clearInterval(colorGame.intervalId);
}
// update score
function updateScore(){
  $(".score-value").text(colorGame.score);
}