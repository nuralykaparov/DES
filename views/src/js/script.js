var exercises = {};
var variables = [];
function setExercises(value){
  exercises = value;
}
function addVariables(value){
  variables.push(value);
}
function print(v,num = 0){
  console.log(JSON.stringify(v,null,num));
}

function getExerciseList(){
  let urlArray = document.URL.split('/');
  let subjectId  = urlArray[urlArray.length-1]
  let reqUrl = "/api/arithmetics/getExerciseListBySubject/" + subjectId;
  $.ajax({
    async:false,
    url: reqUrl,
    type: 'GET',
    success: function(res) {
      setExercises(res);
    }
  }); // ajax
} // getExerciseList()

function getVariableList(exerciseList){
  if(exerciseList && exerciseList.length == 0)
    return
  for(i in exerciseList){
    id = exerciseList[i].id;
    // getVariablesReq(id);
    $.ajax({
      async:false,
      url: "/api/arithmetics/getVarListByEx/" + id,
      type: 'GET',
      success: function(res) {
        addVariables(res);
      }
    }); // ajax
  } // loop
} // getVariables()

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function setCookie(cname, cvalue, exdays) {
    let d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function setSolSpeedCookie(value){
  setCookie("exSolSpeed",value,30);
}

function getSolSpeedCookie(){
  value = parseInt(getCookie("exSolSpeed"));
  if(isNaN(value) || value == 0)
    setSolSpeedCookie(1);
  return parseInt(getCookie("exSolSpeed"));
}

function setSolTypeIdCookie(value){
  setCookie("exSolTypeId",value,30);
}

function getSolTypeIdCookie(){
    value = parseInt(getCookie("exSolTypeId"));
    if(isNaN(value) || value == 0)
      setSolTypeIdCookie(3);
    return parseInt(getCookie("exSolTypeId"));
}

function getAjax (reqUrl){
  let s = "";
  $.ajax({
    async: false,
    url: reqUrl,
    type: "GET",
    dataType: "json",
    success: function (data) {
      s = data;
    }
  });
  return s;
}

function getUserTrophiesList (userId){
  let reqUrl = '/api/arithmetics/getUserToTrophies/' + userId;
  return getAjax(reqUrl);
}

function getUserProgress (userId){
  let reqUrl = '/api/arithmetics/getUserProgress/' + userId;
  return getAjax(reqUrl);
}

function modifyProgresses (userId){
  let data = getUserProgress(userId);
  if(data instanceof Array){
    for(let i = 0;i < data.length;i++){
      modifyProgress(data[i]);
    }
  }
}

function modifyProgress (data){
  let element = document.getElementById("subject-progress-"+data["subjectId"]);
  element.style.width = data["progress"]+"%";
}

function getTrophies(){
  let url = "/api/arithmetics/getTrophies"
  return getAjax(url);
}

function getSubjectList(){
  let url = '/api/arithmetics/getSubjectList'
  return getAjax(url)
}

/**
 * [getSubjectName description]
 * loops though subject-list comparing by subject id returns name of subject
 * @param  {[integer]} subjectId   [subject id]
 * @param  {[list]} subjectList [list of subject objects]
 * @return {[string]}             [name of subject of given subject id]
 */
function getSubjectName(subjectId,subjectList){
  if(!(subjectList instanceof Array)){
    return "no name";
  }
  for(let i = 0; i < subjectList.length;i++){
    if(subjectList[i]['id'] == subjectId){
      return subjectList[i]['name'];
    }
  }
  return "none";
}

/**
 * [createAchievemet description]
 * creates and appends <li> element to achievements list
 *
 * @param  {[int]} subjectId   [subject id]
 * @param  {[list]} subjectList [list of subject objects]
 * @return {[none]}             [description]
*/
function createAchievemet(subjectId,subjectList ){

  let achievementDiv = document.createElement("li");
  achievementDiv.className += "d-flex list-group-item";

  let subjectDiv = document.createElement("div");
  subjectDiv.className += "subject-name mr-5";
  if(subjectId > 0){
    subjectDiv.id = "subject-id-trophy-" + subjectId;
    subjectDiv.innerHTML = getSubjectName(subjectId,subjectList);
    achievementDiv.id = "achievement-subject-"+subjectId;
  }else{
      subjectDiv.innerHTML = "Пока нет достижений."
  }
  achievementDiv.appendChild(subjectDiv);
  document.getElementById("user-achievement-list").appendChild(achievementDiv);
}

/**
 * [getTrophyELement description]
 * @param  {[int]} trophyId   [trophy id]
 * @param  {[list]} trophyList [list of trophy objects]
 * @return {[html element]}             [html element]
 */
function getTrophyElement(trophyId,trophyList){
  let imgEl = document.createElement("img");
  imgEl.className = "trophy-img";
  imgEl.alt = "trophy";

  for(let i = 0; i < trophyList.length;i++){
    if(trophyList[i].id == trophyId){
      imgEl.src = "/"+trophyList[i].path;
    }
  }
  let trophyDiv = document.createElement("div");
  trophyDiv.className += "sub-tropey mr-4";
  trophyDiv.appendChild(imgEl);
  return trophyDiv;
}

/**
* [showTrophies description]
*
* @return {[type]} [description]
*/
function showUserTrophies(userId){
  let trophiesList = getTrophies().trList;
  let subjectList = getSubjectList().subjectList;
  let userTrophiesList = getUserTrophiesList(userId).trophyList;
  // print(subjectList);
  // print(trophiesList);
  if(userTrophiesList.length < 1){
    createAchievemet(-1,[]);
  }
  for(let i = 0; i < userTrophiesList.length;i++){
    let userTrophy = userTrophiesList[i];
    let achievementSubject = document.getElementById("achievement-subject-"+userTrophy.subjectId);
    if(achievementSubject == null){
      createAchievemet(userTrophy.subjectId,subjectList);
      achievementSubject = document.getElementById("achievement-subject-"+userTrophy.subjectId);
    }

    if (trophiesList!=undefined) {
      achievementSubject.appendChild(getTrophyElement(userTrophy.trophieId,trophiesList));
    }

    // console.log("subject: " + JSON.stringify(userTrophy));

  }
}


/**
 * removes class from HTML element
 * @param element [HTML element]
 * @param className [string]
 */
function removeClass(element,className) {
  console.log(JSON.stringify(element));
  if(element instanceof Array){
    for(let i = 0;i < element.length;i++){
      element[i].className = element[i].classList.remove(className);
    }
  }else
    element.className = element.classList.remove(className);
}
/**
 * add class to an HTML element
 * @param element [HTML element]
 * @param className [string]
 */
function addClass(element,className) {
  if(element instanceof Array){
    for(let i = 0;i < element.length;i++){
      element[i].className += className;
    }
  }else
    element.className += className;
}

/**
 * get current user data from server
 */
function getCurrentUserData() {
  return getAjax(`/api/user/getCurrentUser`);
}

function parseMysqlDate(value) {
  let date = new Date(value);
  console.log(`${date} | ${value}`);
  date.setDate(parseInt(date.getDate())-1);
  return date;
}

function delay(ms) {
  return new Promise(function (resolve, reject) {
    setTimeout(resolve, ms);
  });
}