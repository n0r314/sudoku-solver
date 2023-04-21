'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function(app) {

  let solver = new SudokuSolver();

  app.route('/api/check')
    .post((req, res) => {

      //required fields
      if (!(req.body.puzzle && req.body.coordinate && req.body.value)) {
        return res.json({ error: "Required field(s) missing" });
      };

      //puzzle string and validation
      const puzzle = req.body.puzzle;
      const validationObject = solver.validate(puzzle);
      if (!validationObject.valid) {
        return res.json({ error: validationObject.errorMessage });
      };

      //value and validation
      const value = req.body.value;
      if (!/^[1-9]$/.test(value)) {
        return res.json({ error: 'Invalid value' });
      };

      //coordinate and validation
      const coordinate = req.body.coordinate;
      const matches = coordinate.match(/^(?<row>[A-I])(?<col>[1-9])$/);
      if (matches == null) {
        return res.json({ error: 'Invalid coordinate' });
      };
      const row = matches.groups.row;
      const col = matches.groups.col;

      //checker
      const rowNb = row.charCodeAt(0) - 65;
      const colNb = parseInt(col) - 1;
      const puzzleX = solver.initCheck(puzzle, rowNb, colNb);
      const conflict = [];
      if (!solver.checkRowPlacement(puzzleX, rowNb, value)) {
        conflict.push("row")
      };
      if (!solver.checkColPlacement(puzzleX, colNb, value)) {
        conflict.push("column")
      };
      if (!solver.checkRegionPlacement(puzzleX, rowNb, colNb, value)) {
        conflict.push("region")
      };
      if (conflict.length === 0) {
        return res.json({
          valid: true
        })
      } else {
        return res.json({
          valid: false,
          conflict: conflict
        })
      }
    });

  app.route('/api/solve')
    .post((req, res) => {

      //required field puzzle 
      if (!(req.body.puzzle)) {
        return res.json({ error: "Required field missing" });
      };

      //puzzle string and validation
      const puzzle = req.body.puzzle;
      const validationObject = solver.validate(puzzle);
      if (!validationObject.valid) {
        return res.json({ error: validationObject.errorMessage });
      };

      let solverResponse = solver.solve(puzzle);
      return res.json(solverResponse);


    });
};
