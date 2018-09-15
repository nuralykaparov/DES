
var schulte = SchulteGame();
function SchulteGame(){
  return {
    tableSize : 5,
    numberList : [],
    currentNumber : 1,
    isGameStarted : false,
    isGameFinished: false,
    intervalId : -1,
    timeElapsed : 0,
    table : document.getElementById("schulte-table"),
    clearNumberList : function () {
      this.currentNumber = 1;
      this.numberList = [];
    },
    clearTable : function () {
      this.table.innerHTML = "";
    },
    getTimeString : function () {
      var minutes = parseInt(this.timeElapsed / 60);
      var seconds = parseInt(this.timeElapsed % 60);
      return minutes + ":" + seconds;
    },
  };
}
function getRandom(range){
  return parseInt(Math.random() * range);
}
function updateTime() {
  $("#time-info").text(schulte.getTimeString());
}
function updateStatusBar(){
  $(".number-seek").text(schulte.currentNumber);
}
// update number list array
function updateNumberList() {
  schulte.clearNumberList();
  var tempNumberList = [];
  for (var i = 1; i <= schulte.tableSize * schulte.tableSize; i++) {
    tempNumberList.push(i);
  }
  while (true) {
    if (tempNumberList.length === 0) break;
    var index = getRandom(tempNumberList.length);
    schulte.numberList.push(tempNumberList[index]);
    tempNumberList.splice(index, 1);
  }
  return schulte.numberList;
}
function updateSchulteTable() {
  stopStopWatch();
  schulte.clearTable();
  updateStatusBar();
  updateNumberList();
  for(var i = 0; i < schulte.tableSize; i++){
    var row = schulte.table.insertRow(i);
    for(var j = 0; j < schulte.tableSize;j++){
      var cell = row.insertCell(j);
      cell.setAttribute("data-number",schulte.numberList[i * schulte.tableSize + j]);
      cell.innerText = schulte.numberList[i * schulte.tableSize + j];
      cell.className += " schulte-cell big-text enable";
    }
  }
}
function startStopWatch(){
  updateTime();
  schulte.intervalId = setInterval(countTime,1000);
  function countTime() {
    schulte.timeElapsed++;
    updateTime();
  }
}
function stopStopWatch(){
  clearInterval(schulte.intervalId);
}
function startGame() {
  schulte.isGameStarted = true;
  startStopWatch();
}
function finishGame() {
  schulte.isGameStarted = false;
  schulte.isGameFinished = true;
  stopStopWatch();
  var finished = schulte.currentNumber === schulte.numberList.length;
  console.log(schulte.currentNumber + " === " + schulte.numberList.length);
  if(finished){
    alert("Молодец, время: " + schulte.getTimeString());
  }else{
    alert("Игра остановлена: " + schulte.getTimeString());
  }
}
function initGameData() {
  var tableSize = schulte.tableSize;
  schulte = SchulteGame();
  schulte.tableSize = tableSize;
}
function startNewSchulteGame (){
  initGameData();
  updateSchulteTable();
}