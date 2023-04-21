

const getRow = (puzzleString, rowNb) => {
  const startIndex = 9 * rowNb;
  return puzzleString.substring(startIndex, startIndex + 9);
};

const getCol = (puzzleString, colNb) => {
  let colString = "";
  for (let i = 0; i < 9; i++) {
    let index = (9 * i) + colNb;
    colString += puzzleString.charAt(index);
  }
  return colString;
};

const getRegion = (puzzleString, rowNb, colNb) => {
  const regionRow = Math.floor(rowNb / 3);
  const regionCol = Math.floor(colNb / 3);
  let regionString = "";
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let index = (3 * regionRow + i) * 9 + (3 * regionCol + j);
      regionString += puzzleString.charAt(index);
    }
  }
  return regionString;
};


class SudokuSolver {

  validate(puzzleString) {
    if (puzzleString.length !== 81) {
      return { valid: false, errorMessage: "Expected puzzle to be 81 characters long" }
    } else if (!/^[1-9\.]{81}$/.test(puzzleString)) {
      return { valid: false, errorMessage: "Invalid characters in puzzle" }
    } else {
      return { valid: true, errorMessage: "" }
    }
  }

  // put an X on the cell to be validated
  initCheck(puzzleString, rowNb, colNb) {
    const index = rowNb * 9 + colNb;
    return puzzleString.substring(0, index) + "X" + puzzleString.substring(index + 1);
  }


  checkRowPlacement(puzzleX, rowNb, value) {
    const rowString = getRow(puzzleX, rowNb);
    if (rowString.search(value) === -1) {
      return true
    } else {
      return false
    }
  }

  checkColPlacement(puzzleX, colNb, value) {
    const colString = getCol(puzzleX, colNb);
    if (colString.search(value) === -1) {
      return true
    } else {
      return false
    }
  }

  checkRegionPlacement(puzzleX, rowNb, colNb, value) {
    const regionString = getRegion(puzzleX, rowNb, colNb);
    //console.log(regionString);
    if (regionString.search(value) === -1) {
      return true
    } else {
      return false
    }
  }





  solve(puzzleString) {
    var possibleGrid = true;

    // creates an array of objects, one for each cell : {rowNb, colNb, poss (array of values), value (0 if unknown)}
    const initSolve = (puzzleString) => {
      const puzzleArray = [];
      for (let i = 0; i < puzzleString.length; i++) {
        const rowNb = Math.floor(i / 9);
        const colNb = i - Math.floor(i / 9) * 9;
        const regionNb = Math.floor(rowNb / 3) * 3 + Math.floor(colNb / 3);
        let puzzleX = this.initCheck(puzzleString, rowNb, colNb);
        // if the value in the cell in unknown
        if (puzzleString.charAt(i) === ".") {
          let cellObject = {
            row: rowNb,
            col: colNb,
            region: regionNb,
            poss: [],
            testPoss: [],
            value: 0, // unknown value
            testValue: 0 // will be used for backtracking
          };
          for (let value = 1; value <= 9; value++) {
            // if value possible in this cell
            if (this.checkRowPlacement(puzzleX, rowNb, value) && this.checkColPlacement(puzzleX, colNb, value) && this.checkRegionPlacement(puzzleX, rowNb, colNb, value)) {
              //add the value to the cellObject possibilities
              cellObject.poss.push(value);
              cellObject.testPoss.push(value);
            };
            //else do nothing
          }
          // if there is no possibility for this cell, the grid is impossible
          if (cellObject.poss.lenth === 0) {
            possibleGrid = false;
          }
          // we have added all possible values in the cellObject, we store this object in the puzzleArray :
          puzzleArray.push(cellObject);
        }
        // the value in the cell is known
        else {
          let value = parseInt(puzzleString.charAt(i));
          // check if the initial numbers are valid
          if (!(this.checkRowPlacement(puzzleX, rowNb, value) && this.checkColPlacement(puzzleX, colNb, value) && this.checkRegionPlacement(puzzleX, rowNb, colNb, value))) {
            possibleGrid = false;
          }
          puzzleArray.push({
            row: rowNb,
            col: colNb,
            region: regionNb,
            poss: [],
            value: value
          })
        }
      };
      // sort the array by length of possible values array, cells with less possibilities come first
      puzzleArray.sort((obj1, obj2) => obj1.poss.length - obj2.poss.length);
      //console.log(puzzleArray);
      return puzzleArray;
    };


    // we initialize the puzzle and check if we can go on (grid can be solved)
    let puzzleArray = initSolve(puzzleString);
    if (!possibleGrid) {
      return { error: "Puzzle cannot be solved" }
    };



    // this function updates the value in the cell and all it's dependencies. If a cell ends up with no more possibility, sets possibleGrid to false
    const updateValue = (puzzleArray, index, value) => {
      let valueCell = puzzleArray[index];
      valueCell.poss = [];
      delete valueCell.testPoss;
      valueCell.value = value;
      delete valueCell.testValue;
      let valueRow = valueCell.row;
      let valueCol = valueCell.col;
      let valueRegion = valueCell.region;

      for (let i = 0; i < puzzleArray.length; i++) {
        let cell = puzzleArray[i];
        if (cell.value === 0 && (cell.row === valueRow || cell.col === valueCol || cell.region === valueRegion) && cell.poss.indexOf(value) !== -1) {
          let deleteIndex = cell.poss.indexOf(value);
          cell.poss.splice(deleteIndex, 1);
          // faulty grid if there is no more possibility in a cell
          if (cell.poss.length === 0 && cell.value === 0) {
            possibleGrid = false;
          }
        }
      };
      return puzzleArray;
    }


    // updates all the easy to know values (only one choice for one cell)
    const solveNoChoice = (puzzleArray) => {
      while (puzzleArray.filter((obj) => obj.poss.length === 1).length !== 0 && possibleGrid) {
        // for each cell we update the right value in the cell if there is only one choice and we update the dependencies in the corresponding row, column and region. Doing so, we propagate the data forward in the array but not backwards
        for (let i = 0; i < puzzleArray.length; i++) {
          let cell = puzzleArray[i];
          // if we don't know the value and there is only one possibility
          if (cell.value === 0 && cell.poss.length === 1) {
            // we set the cell to this value and modify dependencies in row, column and region
            puzzleArray = updateValue(puzzleArray, i, cell.poss[0]);
          }
        };
        // we sort the array before doing it again
        puzzleArray.sort((obj1, obj2) => obj1.poss.length - obj2.poss.length || obj1.row - obj2.row || obj1.col - obj2.col);
      };
      return puzzleArray;
    }

    solveNoChoice(puzzleArray);

    if (!possibleGrid) {
      return { error: "Puzzle cannot be solved" }
    } else if (puzzleArray.filter(obj => obj.value !== 0).length > 0) {
      //console.log(puzzleArray);
      let solutionString = puzzleArray.map(obj => obj.value).join("");
      //console.log("solutions string : " + solutionString);
      return { solution: solutionString };
    } else {
      return { solution: "a choice needs to be made : yet to be implemented using backtracking technique" }
    }
  }
}

module.exports = SudokuSolver;

