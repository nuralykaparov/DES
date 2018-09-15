function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
// Convert Cookie "score" to int
function getCookieInt(cname){
  var num = getCookie(cname);
  num = num == "" || num == NaN || num == undefined ? 0: num;
  return parseInt(num);
}
function setCookie(cname, cvalue) {
  var exdays = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

  var d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  var expires = "expires=" + d.toUTCString();
  var s = "";
  if (exdays === 0) {
    s = cname + "=" + cvalue;
  } else {
    s = cname + "=" + cvalue + ";" + expires;
  }
  document.cookie = s;
}

function clickedCell(el) {
  if (fg._isClicked) return;
  fg._isClicked = true;
  var elX = parseInt(el.getAttribute("cell-x"));
  var elY = parseInt(el.getAttribute("cell-y"));
  var result = document.getElementById("result");
  if (elX == fg._posX && elY == fg._posY) {
    result.innerHTML = "Правильно!";
    el.style.background = "cyan";
    // this.showFly();
  } else {
    result.innerHTML = "Неправильно!";
    el.style.background = "red";
    fg.showFly();
  }
}
function delay(ms) {
  return new Promise(function (resolve, reject) {
    setTimeout(resolve, ms);
  });
}
function isNull(value){
  return value === null || value === undefined;
}

function getRandom(range){
  return parseInt(Math.random() * range);
}

// For all games
class GameController{
  constructor(name){
    this._score = 0;
    this.gameName = name;
  }

  static get score(){
    return this._score;
  }

  static set score(score){
    this._score = score;
  }

  increaseScore(value){
    setScore(getCookieInt()+value);
  }

  increaseScore(value){
    setScore(getCookieInt()-value);
  }
  createElement(elType = "div",className="",id=""){
    let el = document.createElement(elType);
    if(!this.isNull(className) && className !== "")
      el.className += className;
    if(!this.isNull(id) && id !== "")
      el.id = id;
    return el;
  }
  createButton(text = "text",className,name,id){
    let el = document.createElement("button");
    el.innerText = text;
    if(!this.isNull(className) && className !== "")
      el.className += className;
    if(!this.isNull(id) && id !== "")
      el.id = id;
    return el;
  }
  createRow(table,position = 0){
    let row = table.insertRow(position);
  }
  createExitBtn(){
    let exitDiv = this.createElement("div");
    let exit = this.createElement("a","","exit");
    exit.href = "../index.html";
    // exit.innerText = "Выйти";
    exit.style.color = "red";
    exit.style.fontSize = "30px";
    exitDiv.appendChild(exit);
    return exitDiv;
  }
  isNull(value){
    return value === null || value === undefined;
  }
  isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  getRandom(range){
    return parseInt(Math.random() * range);
  }

  getRandomRange(min, max) {
    return parseInt(Math.random() * (max - min) + min);
  }
}

class Time{
  constructor(hour = 0,minute = 0,second = 0){
    this._hour = hour;
    this._minute = minute;
    this._second = second;
    this._currentIntervalId = 0;
  }

  get hour(){
    return parseInt(this._hour);
  }
  get minute(){
    return parseInt(this._minute);
  }
  get second(){
    return parseInt(this._second);
  }

  set hour(value){ this.setHour(parseInt(value)); }
  setHour(value){ this._hour = value % 24; }
  addHour(value){ this.setHour(this.hour + parseInt(value)); }

  set minute(value){ this.setMinute(parseInt(value)); }
  setMinute(value){
    this._minute = value % 60;
    this.addHour(value/60);
  }
  addMinutes(value){ this.setMinute(this.minute + parseInt(value)); }

  setSeconds(value){
    this._second = value % 60;
    this.addMinutes(value / 60);
  }
  addSeconds(value){ this.setSeconds(this.second + parseInt(value)); }

  startTiming(){
    this._currentIntervalId = setInterval(this.addSeconds(1),1000);
  }
  stopTiming(){
    clearInterval(this._currentIntervalId);
  }

  getTime(){
    let out = "";
    if(this.hour !== 0){
      out += this.hour + ":";
    }
    out += this.minute + ":" + this.second;
    return out;
  }
}
