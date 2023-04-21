const chai = require('chai');
const assert = chai.assert;

const SudokuSolver = require('../controllers/sudoku-solver.js');
const puzzlesAndSolutions = require('../controllers/puzzle-strings.js')


let solver = new SudokuSolver();
let validString = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
let invalidString = "9.9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
let invalidCharacterString = "..A..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
let invalidLengthString1 = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6...";
let invalidLengthString2 = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6";

suite('UnitTests', () => {

  // Logic handles a valid puzzle string of 81 characters
  test('valid 81 character puzzle', function() {
    let test = solver.validate(validString);
    assert.property(test, "valid");
    assert.equal(test.valid, true);
  });

  //Logic handles a puzzle string with invalid characters (not 1-9 or .)
  test('invalid character puzzle', function() {
    let test = solver.validate(invalidCharacterString);
    assert.property(test, "valid");
    assert.equal(test.valid, false);
    assert.property(test, "errorMessage");
    assert.equal(test.errorMessage, "Invalid characters in puzzle");
  });


  //Logic handles a puzzle string that is not 81 characters in length
  test('invalid length puzzle', function() {
    let test1 = solver.validate(invalidLengthString1);
    let test2 = solver.validate(invalidLengthString2);
    assert.property(test1, "valid");
    assert.equal(test1.valid, false);
    assert.property(test1, "errorMessage");
    assert.equal(test1.errorMessage, "Expected puzzle to be 81 characters long");
    assert.property(test2, "valid");
    assert.equal(test2.valid, false);
    assert.property(test2, "errorMessage");
    assert.equal(test2.errorMessage, "Expected puzzle to be 81 characters long");
  });

  //Logic handles a valid row placement
  test('valid row placement', function() {
    let puzzleX = solver.initCheck(validString, 0, 0);
    assert.equal(solver.checkRowPlacement(puzzleX, 0, 7), true, "7 not in the row (and not in region nor col)");
    assert.equal(solver.checkRowPlacement(puzzleX, 0, 6), true, "6 not in the row but in col");
    assert.equal(solver.checkRowPlacement(puzzleX, 0, 2), true, "2 not in the row but in region");
  });


  //Logic handles an invalid row placement
  test('invalid row placement', function() {
    let puzzleX = solver.initCheck(validString, 0, 0);
    // 1 already in the row
    assert.equal(solver.checkRowPlacement(puzzleX, 0, 1), false);
  });

  //Logic handles a valid column placement
  test('valid column placement', function() {
    let puzzleX = solver.initCheck(validString, 0, 0);
    assert.equal(solver.checkColPlacement(puzzleX, 0, 7), true, "7 not in the column (and not in region nor row)");
    assert.equal(solver.checkColPlacement(puzzleX, 0, 9), true, "9 not in the column but in row");
    assert.equal(solver.checkColPlacement(puzzleX, 0, 2), true, "2 not in the column but in region");
  });

  //Logic handles an invalid column placement
  test('invalid column placement', function() {
    let puzzleX = solver.initCheck(validString, 0, 0);
    // 6 already in the column
    assert.equal(solver.checkColPlacement(puzzleX, 0, 6), false);
  });

  //Logic handles a valid region (3x3 grid) placement
  test('valid region placement', function() {
    let puzzleX = solver.initCheck(validString, 0, 0);
    assert.equal(solver.checkRegionPlacement(puzzleX, 0, 0, 7), true, "7 not in the region");
    assert.equal(solver.checkRegionPlacement(puzzleX, 0, 0, 1), true, "1 not in the region but in row");
    assert.equal(solver.checkRegionPlacement(puzzleX, 0, 0, 6), true, "6 not in the column but in column");
  });

  //Logic handles an invalid region (3x3 grid) placement
  test('invalid region placement', function() {
    let puzzleX = solver.initCheck(validString, 0, 0);
    // 2 already in the region
    assert.equal(solver.checkRegionPlacement(puzzleX, 0, 2), false);
  });

  //Valid puzzle strings pass the solver
  test('solver passes valid puzzle string', function() {
    // use puzzle dans solutions in puzzle-strings.js
    for (let i = 0; i < puzzlesAndSolutions.length; i++) {
      let solution = puzzlesAndSolutions[i][1];
      assert.property(solver.solve(solution), "solution");
      assert.equal(solver.solve(solution).solution, solution);
    }
  });

  //Invalid puzzle strings fail the solver
  test('solver fails invalid puzzle', function() {
    // use puzzle dans solutions in puzzle-strings.js
    let puzzle = invalidString;
    assert.property(solver.solve(puzzle), "error");
    assert.equal(solver.solve(puzzle).error, "Puzzle cannot be solved");
  });


  //Solver returns the expected solution for an incomplete puzzle
  test('solver returns expected solution', function() {
    // use puzzle dans solutions in puzzle-strings.js
    for (let i = 0; i < puzzlesAndSolutions.length; i++) {
      let puzzle = puzzlesAndSolutions[i][0];
      let solution = puzzlesAndSolutions[i][1];
      assert.property(solver.solve(puzzle), "solution");
      assert.equal(solver.solve(puzzle).solution, solution);
    }
  });

});
