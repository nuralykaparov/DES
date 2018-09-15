const listOfWords = ['год', 'человек', 'время', 'дело', 'жизнь', 'день', 'рука', 'раз', 'работа', 'слово', 'место',
  'лицо', 'друг', 'глаз', 'вопрос', 'дом', 'сторона', 'страна', 'мир', 'случай', 'голова', 'ребенок', 'сила',
  'конец', 'вид', 'система', 'часть', 'город', 'женщина', 'деньги', 'земля', 'машина', 'вода', 'отец', 'час',
  'право', 'нога', 'решение', 'дверь', 'образ', 'история', 'голос', 'книга', 'возможность', 'результат', 'ночь',
  'стол', 'область', 'число', 'компания', 'народ', 'группа', 'средство', 'начало', 'свет', 'путь', 'уровень',
  'форма', 'связь', 'минута', 'улица', 'вечер', 'качество', 'мысль', 'дорога', 'действие', 'месяц',
  'государство', 'язык', 'любовь', 'взгляд', 'мама', 'век', 'школа', 'цель', 'общество', 'президент',
  'комната', 'порядок', 'театр',
];
function hideGameArenaAll() {
  $(".game-arena").css("display","none");
}
function getRandom(level){
  var nums = [];
  for (var i = 1; i <= (2+level); i++) {
    var check = "";
    var n = chainGame.words[Math.floor(Math.random() * chainGame.words.length)];
    if (nums.length==0)
      nums.push(n);
    else
      for (var j = 0; j < nums.length; j++) {
        check = false;
        if (nums[j] != n)
          check = true;
      }
    if (check) {
      nums.push(n)
    }
  }
  return nums;
}
function ChainGame() {
  return {
    gameName : "chainGame",
    words: [],
    currentWordsList : [],
    currentWordId : [],
    registeredAnswers : [],
    shuffledWordsList : [],
    trueAnswerCount : 0,
    initWords : function () {
      this.words = listOfWords.slice();
    },
    getLevel : function () {
      if(!parseInt(getCookie(this.gameName))){
        this.setLevel(0);
      }
      return parseInt(getCookie(this.gameName));
    },
    setLevel : function (value) {
      setCookie(this.gameName, value);
    },
    incLevel : function(){
      this.setLevel(this.getLevel() + 1);
    },
    updateWordsList : function () {
      this.registeredAnswers = [];
      this.currentWordId = 0;
      this.currentWordsList = [];
      var level = this.getLevel();
      this.setLevel(level);
      var arr = getRandom(this.getLevel());
      this.currentWordsList = arr;
      return arr;
    },
    shuffleWordList : function (){
      var arr = [];
      for (var i = 0; i < this.currentWordsList.length; i++) {
        arr.push(this.currentWordsList[i]);
      }
      for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      this.shuffledWordsList = arr;
      return arr;
    }
  };
}
var chainGame = ChainGame();

function updateLevel(){
  $("#level-value").text(chainGame.getLevel());
}

function hasNextWord() {
  return chainGame.currentWordsList.length > chainGame.currentWordId;
}
function getNextWord() {
  if(!hasNextWord()){
    return;
  }
  return chainGame.currentWordsList[chainGame.currentWordId++];
}
function showNextWord() {
  if(hasNextWord()){
    $("#current-word").text(getNextWord());
  }else{
    showAnswersView();
  }
}

function showAnswersView(){
  hideGameArenaAll();
  $("#answer-view").css("display","block");
  chainGame.shuffleWordList();
  $("#checkAnswer").prop('disabled',true);
  for(var i = 0;i < chainGame.shuffledWordsList.length;i++){
    var btn = "<div class='d-flex justify-content-center'>";
    btn += "<div class='answer-helper '></div>";
    
    btn += "<button class='btn btn-outline-dark ans answer-word-btn fix-btn' >";
    btn += chainGame.shuffledWordsList[i] +"</button>";
    
    btn += "<div answer-helper></div></div>";
    $(".answer-btn-space").html($(".answer-btn-space").html() + btn);
  }
}
function showResultView() {
  hideGameArenaAll();
  $("#result-view").css("display", "block");
  for (var i = 0; i < chainGame.currentWordsList.length; i++) {
    var btn = "";
    if (chainGame.currentWordsList[i] === chainGame.registeredAnswers[i]) {
      btn += "<div class='d-flex justify-content-center'><button class='btn btn-outline-success answer-helper fix-btn' disabled> ";
      btn += chainGame.currentWordsList[i] + "</button>";
      
      btn += "<button class='btn btn-success ans answer-word-btn fix-btn' disabled>";
      btn += chainGame.registeredAnswers[i] + "</button>";
      
      btn += "<div class='answer-helper'></div></div>";
      chainGame.trueAnswerCount++;
    } else {
      btn += "<div class='d-flex justify-content-center'><button class='btn btn-outline-danger answer-helper fix-btn' disabled>";
      btn += chainGame.currentWordsList[i] + "</button>";
      
      btn += "<button class='btn btn-danger ans answer-word-btn fix-btn' disabled>";
      btn += chainGame.registeredAnswers[i] + "</button>";
      
      btn += "<div class='answer-helper'></div></div>";
    }
    if(chainGame.trueAnswerCount === chainGame.currentWordsList.length ){
      chainGame.incLevel();
    }
    $(".result-space").html($(".result-space").html() + btn);
  }
}
function showGameArena() {
  initChainGame();
  hideGameArenaAll();
  $("#game-view").css("display","block");
}
function showDescView() {
  hideGameArenaAll();
  $("#desc-view").css("display","block");
}

function initChainGame(){
  $("show-result-btn").prop("disabled",true);
  $(".answer-btn-space").html("");
  $(".result-space").html("");
  updateLevel();
  chainGame.initWords();
  chainGame.updateWordsList();
  showNextWord();
}

function finishLevel(){
  showGameArena();
}

function closeDesc() {
  showGameArena();
}
