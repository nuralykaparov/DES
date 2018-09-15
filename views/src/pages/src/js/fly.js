class FlyGame extends GameController{
  static _possibleMoves (){
    return {
      1 : "top",
      2 : "top-right",
      3 : "right",
      4 : "bottom-right",
      5 : "bottom",
      6 : "bottom-left",
      7 : "left",
      8 : "top-left",
    };
  };
  constructor(){
    super("Fly game");
    this._tableSize = 5; // size of table
    this._gameSpace = document.getElementById("fly-game-space"); // game space HTML element
    this._table = this.createElement("table","table table-bordered square-table float-left","fly-table");
    this._posX = 0;
    this._posY = 0;
    this._isGameStarted = false;
    this._intervalId = 0;
    this._moveCount = 5;
    this._moveHistory = []
    this._isClicked = false;
  }

  get numbersList(){
    return this._numbersList;
  }
  get tableSize(){
    return this._tableSize === 0 ? 5 : this._tableSize;
  }
  get gameSpace(){
    return this._gameSpace;
  }
  set tableSize(value){
    this.setTableSize(value)
  }
  set moveCount(value){
    this.setMoveCount(value);
  }
  set tableSize(value){
    this.setTableSize(value);
  }
  setPosition(x,y){
    this._posX = x;
    this._posY = y;
  }

  setTableSize(value){
    let size = parseInt(value);
    size = size % 2 === 1 ? size - 1 : size;
    if( size < 5 || isNaN(size)){
      size = 5
    }else
    if( size > 13){
      size = 13;
    }
    this._tableSize = size;
    this.updateGameSpace();
  }
  setMoveCount(value){
    let num = parseInt(value);

    this._moveCount = num < 5 || isNaN(num)? 5 : num;
  }
  registerMove(value){
    value = parseInt(value);
    if(isNaN(value)){
      // console.log("CATCH moveHistory: '" + value+"' " + isNaN(value));
      return ;
    }
    // console.log("moveHistory.add: " + value);
    this._moveHistory.push(value);
  }
  clearTable(){
    this._table.innerHTML = "";
  }

  /**
   * checks if given move command is possible
   * @param move -> integer 1-8
   * @returns {boolean} true if move is possible
   */
  isPossibleMove(move){
    switch (parseInt(move)){
      case 1: return this.isPossibleMoveTop();
      case 2: return this.isPossibleMoveTopRight();
      case 3: return this.isPossibleMoveRight();
      case 4: return this.isPossibleMoveBottomRight();
      case 5: return this.isPossibleMoveBottom();
      case 6: return this.isPossibleMoveBottomLeft();
      case 7: return this.isPossibleMoveLeft();
      case 8: return this.isPossibleMoveTopLeft();
    }
  }
  isPossibleMoveTop(){
    return this._posY > 0;
  }
  isPossibleMoveRight(){
    return this._posX < this._tableSize - 1;
  }
  isPossibleMoveBottom(){
    return this._posY < this._tableSize - 1;
  }
  isPossibleMoveLeft(){
    return this._posX > 0;
  }
  isPossibleMoveTopRight(){
    return this.isPossibleMoveTop() && this.isPossibleMoveRight();
  }
  isPossibleMoveBottomRight(){
    return this.isPossibleMoveBottom() && this.isPossibleMoveRight();
  }
  isPossibleMoveBottomLeft(){
    return this.isPossibleMoveBottom() && this.isPossibleMoveLeft();
  }
  isPossibleMoveTopLeft(){
    return this.isPossibleMoveTop() && this.isPossibleMoveLeft();
  }

  getPossibleMoves(){
    let possibleMoves = [];
    for(let i = 1; i < 9;i++){
      if(this.isPossibleMove(i)){
        possibleMoves.push(i);
      }
    }
    return possibleMoves;
  }

  /**
   * changes current [X,Y] positions if possible, then registers to [moveHistory]
   * @param move -> integer 1-8
   */
  move(move){
    switch (parseInt(move)){
      case 1: this.moveTop(); break;
      case 2: this.moveTopRight(); break;
      case 3: this.moveRight(); break;
      case 4: this.moveBottomRight(); break;
      case 5: this.moveBottom(); break;
      case 6: this.moveBottomLeft(); break;
      case 7: this.moveLeft(); break;
      case 8: this.moveTopLeft(); break;
    }
  }
  moveTop(){
    if(!this.isPossibleMoveTop())
      return;
    this._posY--;
    this.registerMove(1);
  }
  moveRight(){
    if(!this.isPossibleMoveRight())
      return;
    this._posX++;
    this.registerMove(3);
  }
  moveBottom(){
    if(!this.isPossibleMoveBottom())
      return;
    this._posY++;
    this.registerMove(5);
  }
  moveLeft(){
    if(!this.isPossibleMoveLeft())
      return;
    this._posX--;
    this.registerMove(7);
  }
  moveTopRight(){
    if(!this.isPossibleMoveTopRight())
      return;
    this._posX++;
    this._posY--;
    this.registerMove(2);
  }
  moveBottomRight(){
    if(!this.isPossibleMoveBottomRight())
      return;
    this._posX++;
    this._posY++;
    this.registerMove(4);
  }
  moveBottomLeft(){
    if(!this.isPossibleMoveBottomLeft())
      return;
    this._posX--;
    this._posY++;
    this.registerMove(6);
  }
  moveTopLeft(){
    // console.log("entergin top left");
    if(!this.isPossibleMoveTopLeft()){
      // console.log("can't move 8");
      return;
    }
    // console.log("moving top left");
    this._posX--;
    this._posY--;
    this.registerMove(8);
  }

  getArrow(direction){
    switch (direction) {
      case "top":return this.getArrowTop();
      case "right":return this.getArrowRight();
      case "bottom":return this.getArrowBottom();
      case "left":return this.getArrowLeft();
      case "top-right":return this.getArrowTopRight();
      case "bottom-right":return this.getArrowBottomRight();
      case "bottom-left":return this.getArrowBottomLeft();
      case "top-left":return this.getArrowTopLeft();
      default:
        console.log("can't find arrow");
        return null;
    }
  }

  createArrowImg(direction){
    let img = this.createElement("img","fly-moves");
    if(direction === null || direction === undefined || direction.length === 0)
      return img;
    img.setAttribute("src", "../src/img/arrows/arrow-"+direction+".svg");
    return img;
  }

  getArrowTop(){
    let img = this.createArrowImg("up");
    return img;
  }
  getArrowRight(){
    let img = this.createArrowImg("right");
    return img;
  }
  getArrowBottom(){
    let img = this.createArrowImg("down");
    return img;
  }
  getArrowLeft(){
    let img = this.createArrowImg("left");
    return img;
  }
  getArrowTopRight(){
    let img = this.getArrowTop();
    img.className += " diagonal45";
    return img;
  }
  getArrowBottomRight(){
    let img = this.getArrowRight();
    img.className += " diagonal45";
    return img;
  }
  getArrowBottomLeft(){
    let img = this.getArrowBottom();
    img.className += " diagonal45";
    return img;
  }
  getArrowTopLeft(){
    let img = this.getArrowLeft();
    img.className += " diagonal45";
    return img;
  }

  /**
   * initializes game data to initial state
   * modified variables:
   *    posX
   *    posY
   *    moveHistory
   */
  initGameData(){
    // set position to center of the table
    this._posY = this._posX = parseInt(this._tableSize / 2);
    // clear history of moves
    this._moveHistory = [];
    this._isClicked = false;
  }

  createEmptyTable(){
    this.clearTable();
    for(let i = 0;i < this.tableSize;i++){
      let row = this._table.insertRow(i);
      for(let j = 0; j < this.tableSize;j++){
        let cell = row.insertCell(j);
        cell.className += " square-cell";
        cell.setAttribute("cell-x",j.toString());
        cell.setAttribute("cell-y",i.toString());
        cell.setAttribute("onclick","clickedCell(this)");
      }
    }
  }
  initGameSpace(){
    this.gameSpace.appendChild(this.createExitBtn());
    let movesDiv = this.createElement("div","input-group mb-4","moves");
    let result = this.createElement("div","","result");
    let movesLabel = this.createElement("label"," mr-3","");
    let movesInput = this.createElement("input","form-control","moves-count");
    movesLabel.innerText = "колличество ходов";
    movesLabel.setAttribute("for","moves-count");
    movesInput.setAttribute("length","4");

    let movesOuterDiv = this.createElement("div","d-flex justify-content-center");
    movesDiv.appendChild(movesLabel);
    movesDiv.appendChild(movesInput);
    movesOuterDiv.appendChild(movesDiv);

    this.gameSpace.appendChild(movesOuterDiv);

    this.gameSpace.appendChild(result);

    let tableDiv = this.createElement("div"," d-flex justify-content-center","table-div");
    tableDiv.appendChild(this._table);
    this.gameSpace.appendChild(tableDiv);
    this.createEmptyTable();

    let showMoves = this.createElement("div","","show-moves-space");
    showMoves.style.display = "none";
    tableDiv.appendChild(showMoves);
    this.gameSpace.appendChild(this.createElement("div","clearfix"));
    let tableSizes = this.createElement("div","","table sizes");

    let startBtn = this.createButton("Начать");
    startBtn.setAttribute("onclick","fg.startGame()");

    let gameFooterRowDiv = this.createElement("div","d-flex justify-content-center");
    let gameFooterColDiv = this.createElement("div","d-flex flex-column");

    gameFooterColDiv.appendChild(startBtn);
    gameFooterColDiv.appendChild(tableSizes);
    gameFooterRowDiv.appendChild(gameFooterColDiv);
    this.gameSpace.appendChild(gameFooterRowDiv);

    // this.gameSpace.appendChild(gameFooterDiv);
    for(let i = 5; i<14;i+=2){
      let link = this.createElement("a");
      link.innerText = i + "x" + i + "|";
      link.className += "action-link";
      link.removeAttribute("href");
      link.setAttribute("onclick","fg.setTableSize("+i+")" );
      let span = this.createElement("span");
      span.innerText = " ";
      tableSizes.appendChild(link);
      tableSizes.appendChild(span);
    }
  }
  updateGameSpace(){
    this.createEmptyTable();
  }

  async showMoves(){
    let movesSpace = document.getElementById("show-moves-space");
    movesSpace.style.display = "block";
    this.flyInitialPositionShow();
    for(let i = 0; i < this._moveCount;i++){
      movesSpace.innerHTML = "";
      await delay(300);
      movesSpace.appendChild(this.getArrow(FlyGame._possibleMoves()[this._moveHistory[i]]));
      await delay(1500);
    }
    this.flyInitialPositionHide()
    movesSpace.style.display = "none";
  }

  printPosition(){
    let out = this._posX + " " + this._posY;
    // console.log();
    return out;
  }
  printMoveString(){
    let out = ""
    for(let i = 0;i < this._moveHistory.length;i++){
      out += FlyGame._possibleMoves()[this._moveHistory[i]]+" -> ";
    }
    // console.log(out);
    return out;
  }

  generateMoves(){
    this.initGameData();
    let moveCount = 0;
    while(true){
      if(moveCount == this._moveCount){
        console.log(this._posX + "," + this._posY);
        break;
      }
      let possibleMoves = this.getPossibleMoves();
      let move = this.getRandomRange(0,possibleMoves.length);
      let moveValue = possibleMoves[move];
      this.move(possibleMoves[move]);
      console.log("possibles: " + JSON.stringify(possibleMoves) + " -> ch["+ moveValue +"]: '" +
        FlyGame._possibleMoves()[possibleMoves[move]] + "' | pos: "+this.printPosition());
      moveCount++;
    }
  }

  startGame(){
    this.updateGameSpace();
    let movesLength = document.getElementById("moves-count").value;
    this.setMoveCount(movesLength);
    this.generateMoves();
    this.showMoves();
  }

  flyInitialPositionShow(){
    let iy = 0, ix = 0;
    ix = iy = parseInt(this.tableSize / 2);
    let cell = this._table.rows[ix].cells[iy];
    cell.className += " fly-position";
    console.log("fly is here: " + JSON.stringify(cell));
  }
  flyInitialPositionHide(){
    let iy = 0, ix = 0;
    ix = iy = parseInt(this.tableSize / 2);
    let cell = this._table.rows[ix].cells[iy];
    cell.classList.remove("fly-position");
    console.log("fly is here: " + JSON.stringify(cell));
  }
  showFly(){
    let cell = this._table.rows[this._posX].cells[this._posY];
    cell.className += " fly-position";
  }
  cellClick(el){
    if(this.isClicked)
      return;
    this._isClicked = true;
    let elX = parseInt(el.getAttribute("cell-x"));
    let elY = parseInt(el.getAttribute("cell-y"));
    let result = document.getElementById("result");
    if(elX == this._posX && elY == this._posY){
      result.innerHTML = "Правильно";
      el.style.background = "cyan"
      // this.showFly();
    }else {
      result.innerHTML = "Неправильно";
      el.style.background = "red"
      FlyGame.showFly();
    }
  }
}
