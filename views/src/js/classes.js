/**
 * Created by aziret on 3/2/18.
 */

class GeneralClass{
  isNull(variable){
    return variable === null || variable === undefined;
  }
  getAjax(reqUrl){
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
}

class SubjectList extends GeneralClass{
  constructor(userId = 0){
    super();
    this._APILink = "/api/arithmetics/getSubjectList";
    this._APIProgressLink = "/api/arithmetics/getUserProgress/";
    // this._APIUserLevel = "/api/user/getUserLevel"
    this._userId = userId;
    this._hasSolveAccess = false;
    this._hasTeacherAccess = false;
  }
  get hasSolveAccess(){
    return this._hasSolveAccess;
  }
  set hasSolveAccess(value){
    this._hasSolveAccess = value;
  }
  get hasTeacherAccess(){
    return this._hasTeacherAccess;
  }
  set hasTeacherAccess(value){
    this._hasTeacherAccess = value;
  }
  get userId(){return this._userId;}
  set userId(value){this._userId = value}

  get subjectList(){
    if(!this._subjectList)
      this._subjectList = super.getAjax(this._APILink).subjectList;

    return this._subjectList;
  }
  set subjectList(value){
    this._subjectList = value;
  }
  // getUserLevel(){
  //   return this.getAjax(this._APIUserLevel + "/" + this.userId)
  // }
  generateProgressBar(subject){

    let parentDiv = document.createElement("div");
    let progressDiv = document.createElement("div");

    progressDiv.className += "progres-bar progress-bar-striped bg-success";
    progressDiv.setAttribute("aria-valuenow","10");
    progressDiv.setAttribute("aria-valuemin","0");
    progressDiv.setAttribute("aria-valuemax","100");
    progressDiv.id = "subject-progress-" + subject.id;

    parentDiv.className += "progress";

    parentDiv.appendChild(progressDiv);

    return parentDiv;
  }
  generateTeacherAbilities(subject){
    let parentEditDiv = document.createElement("div");
    let editLink = document.createElement("a");
    // console.log("USER ID IS: " + UserLevel());

    // if (this.getUserLevel().userRole != 7) {
      editLink.className += "btn btn-primary";
      editLink.href = "/arithmetics/training/editSubject/" + subject.id;
      editLink.innerHTML = "Редактировать";
      parentEditDiv.appendChild(editLink);
    // }




    let parentShowDiv = document.createElement("div");

    let c = document.createElement("div");
    c.className += "d-flex flex-row";
    c.appendChild(parentShowDiv);
    c.appendChild(parentEditDiv);

    return c;
  }

  generateCardDiv(level){
    let cardDiv = document.createElement("div");
    let cardHeaderDiv = document.createElement("div");
    let h5Text = document.createElement("h5");
    let btn = document.createElement("button");

    btn.className += "btn btn-link collapsed";
    btn.setAttribute("data-toggle", "collapse");
    btn.setAttribute("data-target", "#collapse-level-" + level);
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", "collapse-level-"+level);
    btn.innerHTML = "Уровень " + level;

    h5Text.className += "mb-0";

    cardHeaderDiv.className += "card-header";
    cardHeaderDiv.id = "heading-level-" + level;

    cardDiv.className += "card";

    h5Text.appendChild(btn);
    cardHeaderDiv.appendChild(h5Text);
    cardDiv.appendChild(cardHeaderDiv);

    return cardDiv;
  }
  generateCollapseDiv(level){
    let colDiv = document.createElement("div");
    let cardBodyDiv = document.createElement("div");
    let ulElement = document.createElement("ul");

    ulElement.className += "list-group";
    ulElement.id = "ul-level-" + level;

    cardBodyDiv.className += "card-body";

    colDiv.className += "collapse";
    colDiv.id = "collapse-level-" + level;
    colDiv.setAttribute("aria-labelledby","heading-level-" + level);
    colDiv.setAttribute("data-parrent","#accrodion");

    cardBodyDiv.appendChild(ulElement);
    colDiv.appendChild(cardBodyDiv);
    return colDiv;
  }
  getUlElement(level){
    let ulElement = document.getElementById("ul-level-"+level);
    if(ulElement !== null && ulElement !== undefined){
      return ulElement;
    }
    let subjectList = document.getElementById("subject-accordion");
    let cardDiv = this.generateCardDiv(level);
    subjectList.appendChild(cardDiv);
    let collapseDiv = this.generateCollapseDiv(level);
    subjectList.appendChild(collapseDiv);
    return document.getElementById("ul-level-"+level);
  }
  generateLiElement(subject){
    let liElement = document.createElement("li");
    let flexDiv = document.createElement("div");
    let link = document.createElement("a");
    let titleDiv = document.createElement("div");
    let titleSpan = document.createElement("span");
    let levelSpan = document.createElement("span");

    levelSpan.className += "mr-3 text-muted";
    levelSpan.innerHTML = "Уровень" + subject.level;

    titleSpan.className += "subject-title-text";
    titleSpan.innerHTML = subject.name;

    titleDiv.className += "subject-title d-flex justify-content-between";

    link.className += "align-self-center link-subject-solve";
    link.id = "link-subject-" + subject.id;
    link.href = "/arithmetics/training/showSubjectForSolution/" + subject.id;
    link.style.flex = "5";

    flexDiv.className += "d-flex input-group";
    flexDiv.id = "subject-" + subject.id;

    liElement.className += "list-group-item";

    titleDiv.appendChild(titleSpan);
    titleDiv.appendChild(levelSpan);
    link.appendChild(titleDiv);
    link.appendChild(this.generateProgressBar(subject));
    flexDiv.appendChild(link);
    if(this.hasTeacherAccess){
      flexDiv.appendChild(this.generateTeacherAbilities(subject));
    }
    liElement.appendChild(flexDiv);

    return liElement;

  }
  getUserProgress (){
    return this.getAjax(this._APIProgressLink + this.userId);
  }

  modifyProgress (data){
    let element = document.getElementById("subject-progress-"+data["subjectId"]);
    element.style.width = data["progress"]+"%";
  }

  modifyProgresses (){
    if(this.userId === 0){

    }
    let data = this.getUserProgress(this.userId);
    if(data instanceof Array){
      for(let i = 0;i < data.length;i++){
        console.log("progress: " + JSON.stringify(data[i]));
        this.modifyProgress(data[i]);
      }
    }
  }

  showSubjectList(){
    console.log();
    // let userLevel = this.getUserLevel().userLevel;
    let list = this.subjectList;
    for(let i = 0;i < list.length; i++){
      let ulEl = this.getUlElement(list[i].level);
      let listEl = this.generateLiElement(list[i]);
      // console.log(userLevel);
      // console.log(list[i].level);
      // if (userLevel <= list[i].level) {
      ulEl.appendChild(listEl);
      // }

    }
    this.modifyProgresses();
  };
}

class ExerciseTable extends GeneralClass{
  constructor() {
    super();
    this._table = null;
    this._exerciseAmount = -1;
    this._variableAmount = -1;
    this._subjectId = -1;
    this._operationType = 0;
    this._variablesList = null;
    this._exercisesList = null;
    this._APIVariablesListUrl = "/api/arithmetics/getVarListByEx/";
    this._APIExercisesListUrl = "/api/arithmetics/getExerciseListBySubject/";
    this._APIUpdateSubject = "/api/arithmetics/training/updateSubject";
    this._APICreateSubject = "/api/arithmetics/training/createSubject";
    this._variablesGrouped = null;
    let olympiadEl = document.getElementById("olympiadId");
    if(olympiadEl !== undefined && olympiadEl !== null && !isNaN(olympiadEl.value)){
      this._olympiadId = parseInt(olympiadEl.value);
    }else{
      this._olympiadId = -1;
    }
  }

  get table() {
    if (this._table === null)
      this._table = document.getElementById("exercise-table");
    return this._table;
  }

  get exerciseAmount() {
    if (this._exerciseAmount || this._exerciseAmount.length === 0 || isNaN(this._exerciseAmount))
      this._exerciseAmount = parseInt(document.getElementById("exercise-amount").value);
    return this._exerciseAmount;
  }

  get variableAmount() {
    if (this._variableAmount  || this._variableAmount.length === 0 || isNaN(this._exerciseAmount))
      this._variableAmount = parseInt(document.getElementById("variable-amount").value);
    return this._variableAmount;
  }

  get subjectId() {
    return this._subjectId;
  }

  get variablesList() {
    if (this._variablesList === null || this._variablesList === undefined)
      this.updateVariablesList();
    return this._variablesList;
  }

  get exercisesList() {
    if (this._exercisesList === null || this._exercisesList === undefined)
      this._exercisesList = this.getAjax(this._APIExercisesListUrl + this.subjectId);
    return this._exercisesList;
  }

  get operationType() {
    if (!this._operationType) {
      if (this.subjectId !== -1) {
        this._operationType = parseInt(this.exercisesList[0]["exersiceTypeId"]);
      } else {
        this._operationType = parseInt($("#exercise-type-id").val());
      }
    }
    return this._operationType;
  }

  get variablesGrouped(){
    this._variablesGrouped = this.groupVariables();
    return this._variablesGrouped;
  }
  get olympiadId(){
    return this._olympiadId;
  }
  set table(value) {
    this._table = value;
  }

  set subjectId(value) {
    this._subjectId = value;
  }

  updateVariablesList() {
    let exerciseList = this.exercisesList;
    if (!exerciseList)
      return null;
    this._variablesList = [];
    for (let i = 0; i < exerciseList.length; i++) {
      let exerciseId = exerciseList[i].id;
      this._variablesList.push(super.getAjax(this._APIVariablesListUrl + exerciseId));
    }
  }
  clearTable() {
    this.table.innerHTML = "";
  }

  /* Table creation and showing methods */
  parseVarCellData(cellOrder, exId, varId, varValue = -1) {
    return {
      cellOrder: cellOrder,
      exerciseId: exId,
      variableId: varId,
      variableValue: varValue,
    };
  }

  insertVarCell(row, cellData) {
    let field = document.createElement("input");
    field.className += "variable form-control";
    field.setAttribute("type", "number");
    field.setAttribute("exId", cellData.exerciseId);
    field.setAttribute("varId", cellData.variableId);
    if (cellData.variableValue !== -1) {
      field.value = cellData.variableValue;
    }
    let cell = row.insertCell(cellData.cellOrder);
    cell.appendChild(field);
    cell.className += "variable-cell col-exercise-" + cellData.exerciseId;
    return cell;
  }

  insertRow(table, text = "") {
    let row = table.insertRow();
    row.insertCell(0).innerHTML = text;
    return row;
  }

  insertHeaderRows(table, size, exerciseList = null) {
    let header = table.createTHead();
    let row = header.insertRow();
    let emptyCell = row.insertCell();

    size = exerciseList ? exerciseList.length : size;

    emptyCell.innerHTML = "";
    emptyCell.className += "variable-cell";
    for (let e = 0; e < size; e++) {
      let cell = row.insertCell(e + 1);
      let exId = exerciseList ? exerciseList[e].id : (e + 1);
      cell.innerHTML = "пример: " + exId;
      cell.className = "variable-cell col-exercise-" + exId;
    } // loop
  }

  generateFromExistingData() {
    let variables = this.variablesList;
    // console.log(JSON.stringify(variables,null,2));
    this.clearTable();
    for (let i = 0; i < variables[0].length; i++) {
      let row = this.insertRow(this.table, "переменная: " + (i + 1));
      for (let j = 0; j < variables.length; j++) {
        let cellData = this.parseVarCellData(j + 1, variables[j][i].exerciseId,
          variables[j][i].id,
          variables[j][i].value);
        let cell = this.insertVarCell(row, cellData);
      }
    }
    this.insertHeaderRows(this.table, this.variablesList.length, this.exercisesList);
  }

  generateNewData() {
    this.clearTable();
    for (let i = 0; i < this.variableAmount; i++) {
      let row = this.insertRow(this.table, "переменная: " + (i + 1));

      for (let j = 0; j < this.exerciseAmount; j++) {
        let cellData = this.parseVarCellData(j + 1, j, i);
        let cell = this.insertVarCell(row, cellData);
      }
    }
    this.insertHeaderRows(this.table, this.exerciseAmount);
  }

  generateTableData() {
    if (this.subjectId === -1)
      this.generateNewData();
    else
      this.generateFromExistingData();
    this.subjectId === -1 ? this.generateNewData() : this.generateFromExistingData();
  }

  /* Data evaluation methods */
  groupVariables() {
    let variablesListElement = document.getElementsByClassName("variable");
    let vars = {};
    for (let i = 0; i < variablesListElement.length; i++) {
      let exId = parseInt(variablesListElement[i].getAttribute("exid"));
      if (!vars[exId]) {
        vars[exId] = [];
      }
      let variable = {
        id: variablesListElement[i].getAttribute("varid"),
        exerciseId: variablesListElement[i].getAttribute("exId"),
        value: variablesListElement[i].value,
      };
      vars[exId].push(variable);
    }
    return vars;
  }
  
  /**
   * returns subject data in JSON format
   * used while sending data to the server
   */
  getSubjectData(){
    let subject = {};
    if(this.subjectId !== -1)
      subject["id"] = this.subjectId;
    if(this.olympiadId !== -1)
      subject["olympiadId"] = this.olympiadId;
    subject["name"] = document.getElementById("subject-name").value;
    subject["level"] = document.getElementById("subject-level").value;
    return subject;
  }
  
  /**
   *
   * @param elId -> elementId
   * @param type -> {info, error, alert}
   * @param command -> {show, hide}
   */
  validateSubjectData(){
    let isValid = true;
    let subjectName = document.getElementById("subject-name").value;
    let subjectLevel = document.getElementById("subject-level").value;
    if(subjectLevel === "" || !this.isNumeric(subjectLevel) || subjectLevel < 1 || subjectLevel > 10){
      $("#subject-level").addClass("error-col");
      isValid = false;
    } else {
      $("#subject-level").removeClass("error-col");
    }

    if(subjectName === ""){
      $("#subject-name").addClass("error-col");
      isValid = false;
    } else {
      $("#subject-name").removeClass("error-col");
    }
    return isValid;
  }
  
  /**
   * checks if input fields for variables have been created
   * if there are no input field shows error message
   * else removes message
   */
  validateHasVariables(){
    let isValid = true;
    let variablesGroup = this.variablesGrouped;
    console.log(`variablesGroup: ${JSON.stringify(variablesGroup)} : ${variablesGroup.length}`);
    if(Object.keys(variablesGroup).length === 0){
      console.log("input error");
      $("#invalid-input-field").css("display","block");
      isValid = false;
    }else{
      $("#invalid-input-field").css("display","none");
    }
    return isValid;
  }
  
  /**
   * validates all data on negative results
   * returns true if table has only positive answers
   * returns false if has any negative answer
   * @returns {boolean}
   */
  validateTableData() {
    let variablesGroup = this.variablesGrouped;
    let isValid = true;
    for (let i in variablesGroup) {
      let ans = this.evaluate(variablesGroup[i]);
      let searchClass = "col-exercise-" + variablesGroup[i][0]["exerciseId"];
      console.log("error: " + searchClass);
      if (ans < 0) {
        $("." + searchClass).addClass("error-col");
        isValid = false;
      } else {
        $("." + searchClass).removeClass("error-col");

      }
    }
    return isValid;
  }

  /**
   *
   * @param varList
   * @returns {number}
   */
  evaluate(varList) {
    let result = 0;
    if (this.operationType === 1)
      for (let i = 0; i < varList.length; i++){
        if(varList[0].value === "" || result < 0)
          return -1;
        result += parseInt(varList[i].value);
      }

    else {
      if(varList[0].value === "" || varList[1].value === "")
        return -1;
      if (this.operationType === 2)
        result = parseInt(varList[0].value) * parseInt(varList[1].value);

      else if (this.operationType === 3)
        result = parseInt(varList[0].value) / parseInt(varList[1].value);
    }

    return result;
  }

  sendData(reqUrl,sendData){
    let response;
    $.ajax({
      async: false,
      type: "POST",
      url: reqUrl,
      dataType: "json",
      data: sendData,
      success: function(p){
        // console.log("it's ok: " + JSON.stringify(p.status));
        response = p.status;
      },
      error: function(err){
        console.log("it's not ok");
        response = err;
      },
    });
    return response;
  }

  submit() {

    let subject = this.getSubjectData();

    let sendData = {
      subject: subject,
      variables: this.variablesGrouped,
      operationTypeId: this.operationType,
      olympId: this.olympiadId
    };
    
    if (!this.validateSubjectData() || !this.validateHasVariables() || !this.validateTableData() ) {
      return;
    }
    if (this.subjectId === -1) {
        console.log("creating subject");
        let status = this.sendData(this._APICreateSubject,sendData);
        if(this.olympiadId === -1){
          if(status === "ok")
            window.location = "http://localhost:3000/arithmetics/training/showSubjectList";
        }else{
          window.location = "http://localhost:3000/arithmetics/olympiad/showOlympiadOverview/";
        }

      } else {
        // sendVariables();
        console.log("updating subject");
        this.sendData(this._APIUpdateSubject,sendData);
    }
  }

  isNumeric(num){
   return !isNaN(parseFloat(num)) && isFinite(num);
  }
  
  set user(value){
    this._user = value;
    this.showManagerFunctions();
  }
  
  showManagerFunctions(){
    if(this._user.userRoleId <= 2){
      $("#delete-button").html(`<form action="/arithmetics/training/destroySubject/{{subject.id}}" method="post" >
        <button type="submit" name="your_name" value="your_value" class="btn btn-danger" id="subject-delete-btn">Удалить</button>
      </form>`);
    }
  }
}
