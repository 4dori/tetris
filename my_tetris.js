// global variables
let pos_x; // x-postition
let pos_y; // y-postition
let tetro; // type of a tetromino
let next_tetro; // next tetromino
const t_color = ['cyan', 'yellow', 'purple', 'green', 'red', 'blue', 'orange']; // array of colors
let sec = 1000; // tieme for setInterval
let game = 'on'; 
let first_iter = 1; // first appearance for tetromino
let interval; // setInterval method
let ary_2d = []; // game window ary 10x20
let tetr_ary = []; // tetromino ary 4x2
let next_tetr_ary = []; // next tetromino ary 4x2
let position = 0; /* position for rotation:
                     0=>0 deg; 1=>90 deg; 2=>180 deg; 3=>270 deg; */
// all possible types of tetrominos and their positions
let aryI = [[[0, 1], [1, 1], [2, 1], [3, 1]], [[1, -1], [1, 0], [1, 1], [1, 2]], [[0, 0], [1, 0], [2, 0], [3, 0]], [[2, -1], [2, 0], [2, 1], [2, 2]]];
let aryO = [[[1, 0], [2, 0], [1, 1], [2, 1]], [[1, 0], [2, 0], [1, 1], [2, 1]], [[1, 0], [2, 0], [1, 1], [2, 1]], [[1, 0], [2, 0], [1, 1], [2, 1]]];
let aryT = [[[1, 0], [0, 1], [1, 1], [2, 1]], [[1, 0], [1, 1], [2, 1], [1, 2]], [[0, 1], [1, 1], [2, 1], [1, 2]], [[1, 0], [0, 1], [1, 1], [1, 2]]];
let aryS = [[[1, 0], [2, 0], [0, 1], [1, 1]], [[1, 0], [1, 1], [2, 1], [2, 2]], [[1, 1], [2, 1], [0, 2], [1, 2]], [[0, 0], [0, 1], [1, 1], [1, 2]]];
let aryZ = [[[0, 0], [1, 0], [1, 1], [2, 1]], [[2, 0], [1, 1], [2, 1], [1, 2]], [[0, 1], [1, 1], [1, 2], [2, 2]], [[1, 0], [0, 1], [1, 1], [0, 2]]];
let aryL = [[[2, 0], [0, 1], [1, 1], [2, 1]], [[1, 0], [1, 1], [1, 2], [2, 2]], [[0, 1], [1, 1], [2, 1], [0, 2]], [[0, 0], [1, 0], [1, 1], [1, 2]]];
let aryJ = [[[0, 0], [0, 1], [1, 1], [2, 1]], [[1, 0], [2, 0], [1, 1], [1, 2]], [[0, 1], [1, 1], [2, 1], [2, 2]], [[1, 0], [1, 1], [0, 2], [1, 2]]];

let realtime_score = 0;
let realtime_lines = 0;

let meet_bot = 0; // bottom of the window condition 

function endGame(){
    window.removeEventListener('keydown', keyPress, true);
    clearInterval(interval);
    game = 'off';
    gameWindowAry();
    tetroAry();
    cleanWindow();
    cleanNextPieceWindow();
    document.getElementById("play").disabled = false;
    pos_y = 0;
    pos_x = 3;
}

function movingTetro() {
    if (first_iter == 1){
        if(checkForObstruct()){
            endGame();
            return 0;
        }
        changeBoxes(pos_x, pos_y, 1);
        first_iter = 0;
        stop = 0;
    } else if(meet_bot == 1) {
        endIteration();
        meet_bot = 0;
    } else {
        changeBoxes(pos_x, pos_y, 0)        
        pos_y+= 1; 
        let obstruct = checkForObstruct('down');
        changeBoxes (pos_x, pos_y, 1);                
        if(obstruct) {
            endIteration();
        } else if (checkForBottom()){
            meet_bot = 1;
        }
        if (pos_y < 2){
            return movingTetro();
        }
    }
}

// preparation for next tetromino (iteration)
function endIteration() {
    tetro = next_tetro;
    next_tetro = rand();
    next_tetr_ary = changeTetroArray(next_tetro, 0);
    cleanNextPieceWindow();
    changeNextPiece(next_tetr_ary, next_tetro);
    position = 0;
    tetr_ary = changeTetroArray(tetro, position);
    pos_y = 0;
    pos_x = 3;
    first_iter = 1;
    checkFullLine();
}


// checking for full line 
function checkFullLine() {
    let sum = 0;
    for(let y in ary_2d) {
        y = Number(y);
        for (let x in ary_2d[y]){
            sum += ary_2d[y][x];
        }
        if (sum == 10){
            deliteLine(y);
        }
        sum = 0;
    }
}

// deleting line and progressing in level
function deliteLine(y) {
    while (y != 1){
        for(let x in ary_2d[y]) {
            x = Number(x);
            ary_2d[y][x] = ary_2d[y-1][x];
            if (y > 2) {
                let color = document.getElementById('div_1' + numberToId(y-3) + numberToId(x)).style.backgroundColor;
                changeBox(x, y, color);
            }
        }
        y -= 1;
    }
    writeLines(1);
}



// check for the bottom of the window
function checkForBottom(){
    let max = findMinMax('max', 'y');
    let bot_index = 21;
    if (pos_y + max == bot_index) {
        return true;
    } 
}

//preparing to change boxes (cells)
function changeBoxes(x_0, y_0, val) {
    let index = 0;
    while (index < 4) {
        let x = x_0 + tetr_ary[index][0];
        let y = y_0 + tetr_ary[index][1];
        ary_2d[y][x] = val; // change value of the box in an array
        if (y > 1){   
            let color = null; 
            if (val == 0) {
                color = "rgb(59, 50, 50)";
            } else {
                color = t_color[tetro];
            }
            changeBox(x, y, color);
        }
        index += 1;
    }
}

// changing one box (cell) color
function changeBox(x, y, color){
    document.getElementById('div_1' + numberToId(y-2) + numberToId(x)).style.backgroundColor = color; // change color of the box
}

// erasing all the pieces from the window
function cleanWindow(){
    let x = 0;
    let y = 0;
    for (x = 0; x < 10; x++){
        for (y = 0; y < 22; y++){
            if (y > 1){
                changeBox(x, y, "rgb(59, 50, 50)");
            }
        }
    }
}

// erasing all the pieces from the window
function cleanNextPieceWindow(){
    for (let x = 0; x < 4; x ++){
        for (let y = 0; y < 3; y ++){
            document.getElementById('div2_' + y + x).style.backgroundColor = "rgb(256, 256, 256)";
        }
    }
}

// number to ID converter
function numberToId(num){
    num = Number(num);
    num += 1;
    if (num < 10) {
        return '0' + num;
    } else {
        return num;
    }
}

// creating new division (cell)
function newDivision(div_n, con_id, con_str_n) {
    let div_id = 'div_';
    if (div_n != 10) {
        div_id += '1' + con_str_n + '0' + div_n; // ex: div_id = "id_10101"
    } else {
        div_id += '1' + con_str_n + div_n;
    }
    let new_div = document.createElement('div');
    new_div.setAttribute('id', div_id);
    document.getElementById(con_id).appendChild(new_div);
}

// creating new row division
function newContainer(con_n){
    let con_id = 'con_';
    let con_str_n = '';
    if (con_n < 10){
        con_str_n = '0' + con_n;
    } else {
        con_str_n = con_n;
    }
    con_id += con_str_n;
    let new_con = document.createElement('div');
    new_con.setAttribute('id', con_id);
    new_con.setAttribute('class', 'flex-container');
    document.getElementById('window').appendChild(new_con);
    let index = 0;
    while (index < 10){
        newDivision(index + 1, con_id, con_str_n);
        index+= 1;
    }
}



// check for obstructions on the way of moving tetromino
function checkForObstruct(direction) { 
    for (let index in tetr_ary) {
        index = Number(index);
        let x = pos_x + tetr_ary[index][0];
        let y = pos_y + tetr_ary[index][1];
        if (ary_2d[y][x] == 1) {
            if (direction == 'down') {
                pos_y -= 1;
            } else if (direction == 'left') {
                pos_x += 1;
            } else if (direction == 'right') {
                pos_x -=1;
            } 
            return true;
        }
    }
    return false;
}

// function for rotating tetromino
function rotate(direction = false) { 
    if (direction == false){
        position += 1;
        if (position == 4) position = 0;
        tetr_ary = changeTetroArray(tetro, position);
    } else if (direction == 'reverse') {
        position -= 1;
        if (position == -1) position = 3;
        tetr_ary = changeTetroArray(tetro, position);
    }
}

//calculating top and bot position of the current tetromino
function findMinMax (type, axis) { 
    let max = 0;
    let min = 4;
    if (axis == 'x') {
        axis = 0;
    } else {
        axis = 1;
    }
    switch(type) {
        case 'max':
            for (let index in tetr_ary) {
                index = Number(index);
                if (max < tetr_ary[index][axis]) {
                    max = tetr_ary[index][axis];
                }                
            }
            return max;
        case 'min':
            for (let index in tetr_ary) {
                index = Number(index);
                if (min > tetr_ary[index][axis]) {
                    min = tetr_ary[index][axis];
                }
            }
            return min;
    }
}

// check for right border of the game window
function limitRight (){ 
    let max = findMinMax('max', 'x');
    let right_border = 9;
    if (pos_x + max > right_border) {
        return 1;
    }
    return 0;
}

// check for left border of the game window
function limitLeft (){ 
    let min = findMinMax('min', 'x');
    let left_border = 0;
    if (pos_x + min < left_border) {
        return 1;
    }
    return 0;
}

// check for the possibility to rotate
function chekRotate() { 
    if (limitLeft() == 1) {
        pos_x += 1;
        if (tetro == 0 & position == 0) pos_x += 1;// l type tetro has uniq length THTHTHTHT
        if (checkForObstruct()){
            pos_x -= 1;
            if (tetro == 0 & position == 0) pos_x -= 1; //l type tetro has uniq length
            rotate('reverse');
        }
    } else if (limitRight()){
        pos_x -= 1;
        if (tetro == 0 & position == 2) pos_x -= 1;
        if (checkForObstruct()){
            pos_x += 1;
            if (tetro == 0 & position == 2) pos_x += 1;
            rotate('reverse');
        }
    } 
    else {
        if (checkForObstruct()){
            // have to moderate, but it is too hard and takes time
            rotate('reverse');
        }
    }
}

// showing the score on the screen earned by the player
function writeScore (score){
    realtime_score += score;
    let score_line = document.getElementById('score');
    score_line.innerHTML = "Score: " + realtime_score  ;
}

// showing abount of lines that has been deleted 
function writeLines(line){
    realtime_lines += line;
    let level = 0;
    if (realtime_lines%5 == 0){
        level = (realtime_lines / 5) + 1;
        changeLevel(level);
    }
    let lines_line = document.getElementById('lines');
    lines_line.innerHTML = "Lines: " + realtime_lines;
}

function changeLevel(level){
    if (level > 1){        
        writeScore(30);
    }
    writeLevel(level);
    let time = Math.pow(0.8-((level-1)*0.007), level - 1);
    sec = Math.round(time * 1000);
    clearInterval(interval);
    interval = setInterval(movingTetro, sec);
}

// showing the level on the screen
function writeLevel(level){
    let level_line = document.getElementById('level');
    level_line.innerHTML = "Level: " + level;
}

// keyPress logic
function keyPress(event){
    let name = event.key;
    changeBoxes(pos_x, pos_y, 0);
    if (name == 'ArrowLeft'){
        pos_x -= 1;
        pos_x += limitLeft();
        checkForObstruct('left');
    } else if (name == 'ArrowRight') {
        pos_x += 1;
        pos_x -= limitRight();
        checkForObstruct('right');  
    } else if (name == 'ArrowDown') {
        movingTetro();
        writeScore(1);
    } else if (name == 'ArrowUp') {
        if (pos_y == 0 & tetro == 0) pos_y += 1; //rotate l type tetro in top position
        rotate();
        chekRotate();
    } else if (name == ' ') {
        while(pos_y != 0){
            movingTetro();
            writeScore(1);
        }
        return movingTetro();
    } else if (name == 'p') {
        if (game == 'on'){
            clearInterval(interval);
            game = 'pause';
        } else if (game == 'pause') {
            interval = setInterval(movingTetro, sec);
            game = 'on';
        }
    } else if (name =='Escape'){
        endGame();
    }
    if (game != 'off')changeBoxes(pos_x, pos_y, 1);
}

//key press 
function addListener(){ 
    window.addEventListener('keydown', keyPress, true);
}

// show the next tetromino in next tetrominos window
function changeNextPiece(ary, tetromino){
    for (let index = 0; index < 4; index += 1) {
        let x = ary[index][0];
        let y = ary[index][1];
        let color = t_color[tetromino];
        document.getElementById('div2_' + y + x).style.backgroundColor = color;
    }
}


// changeing tetromino 
function changeTetroArray(tetromino, position_of_tetro){
    let tetromino_ary = [];
    switch(tetromino){ //choosing type
        case 0:
            tetromino_ary = aryI; // returns array for tetromino shape
            break;
        case 1:
            tetromino_ary = aryO;
            break;
        case 2:
            tetromino_ary = aryT;
            break;
        case 3:
            tetromino_ary = aryS;
            break;
        case 4:
            tetromino_ary = aryZ;
            break;
        case 5:
            tetromino_ary = aryJ;
            break;
        case 6:
            tetromino_ary = aryL;
            break;
    }
    let ary =[];
    for (let i = 0; i < 4; i ++){
        ary[i] = tetromino_ary[position_of_tetro][i];
    }
    return ary;
}


// tetromino array 4x2. For the logical part
function tetroAry(){
    let index = 0;
    while (index < 4) {
        let ary = new Array(2).fill(0);
        tetr_ary [index] = ary; // gloabal variable
        index += 1;
    }
}

// game array 10x22. For the logical part
function gameWindowAry(){ 
    let index = 0;
    while (index < 22) {
        let ary = new Array(10).fill(0);
        ary_2d [index] = ary; // global variable
        index += 1;    
    }
}

// next tetromino rows division (cell)
function newPieceDivision(div_n, con_id, con_n){
    let div_id = 'div2_' + con_n + div_n;
    let new_div = document.createElement('div');
    new_div.setAttribute('id', div_id);
    document.getElementById(con_id).appendChild(new_div);
}

// next tetromin windows row
function newPieceContainer(con_n){
    let con_id = 'con2_' + con_n;
    let new_con = document.createElement('div');
    new_con.setAttribute('id', con_id);
    new_con.setAttribute('class', 'flex-container');
    document.getElementById('nextPiece').appendChild(new_con);
    let index = 0;
    while (index < 4) {
        newPieceDivision(index, con_id, con_n);
        index += 1;
    }
}



// creating next tetromino window
function nextPiece(){
    let index = 0;
    while (index < 3) {
        newPieceContainer(index);
        index += 1;
    }
    cleanNextPieceWindow();
}

//choosing tetromino through randomiser
function rand(){
    let max = 7;
    return Math.floor(Math.random() * max);
}

// creating game window front
function gameWindow(){
    let index = 0;
    while (index < 20) {
        newContainer(index + 1);
        index+= 1;
    }
}

// start game
function play() {
    if(game == 'on') {
        gameWindow();
        next_tetro = rand();        
        nextPiece();
    }
    game = 'on';
    document.getElementById("play").disabled = true;
    gameWindowAry();
    tetroAry();
    tetro = next_tetro;
    next_tetro = rand();
    next_tetr_ary = changeTetroArray(next_tetro, 0);
    changeNextPiece(next_tetr_ary, next_tetro);
    tetr_ary = changeTetroArray(tetro, position);
    pos_y = 0;
    pos_x = 3;
    first_iter = 1;
    addListener();
    realtime_lines = 0;
    writeLines(0);
    realtime_score = 0;
    writeScore(0);
    changeLevel(1);   
}

