const chai = require("chai");
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');
const puzzlesAndSolutions = require('../controllers/puzzle-strings.js');

chai.use(chaiHttp);

suite('Functional Tests', () => {

  suite('POST to /api/solve', function() {
    test('Solve a puzzle with valid puzzle string', function(done) {
      chai
        .request(server)
        .post('/api/solve')
        .send({
          puzzle: '135762984946381257728459613694517832812936745357824196473298561581673429269145378'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200, "status should be 200");
          assert.equal(res.type, "application/json", "response should be json");
          assert.property(res.body, "solution");
          assert.equal(res.body.solution, '135762984946381257728459613694517832812936745357824196473298561581673429269145378');
          done();
        });
    });


    test('Solve a puzzle with missing puzzle string', function(done) {
      chai
        .request(server)
        .post('/api/solve')
        .send({
        })
        .end(function(err, res) {
          assert.equal(res.status, 200, "status should be 200");
          assert.equal(res.type, "application/json", "response should be json");
          assert.property(res.body, "error");
          assert.equal(res.body.error, 'Required field missing');
          done();
        });
    });

    test('Solve a puzzle with invalid characters', function(done) {
      chai
        .request(server)
        .post('/api/solve')
        .send({
          puzzle: "..A..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6.."
        })
        .end(function(err, res) {
          assert.equal(res.status, 200, "status should be 200");
          assert.equal(res.type, "application/json", "response should be json");
          assert.property(res.body, "error");
          assert.equal(res.body.error, 'Invalid characters in puzzle');
          done();
        });
    });

    test('Solve a puzzle with incorrect length', function(done) {
      chai
        .request(server)
        .post('/api/solve')
        .send({
          puzzle: "....5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6.."
        })
        .end(function(err, res) {
          assert.equal(res.status, 200, "status should be 200");
          assert.equal(res.type, "application/json", "response should be json");
          assert.property(res.body, "error");
          assert.equal(res.body.error, 'Expected puzzle to be 81 characters long');
          done();
        });
    });

    test('Solve a puzzle that cannot be solved', function(done) {
      chai
        .request(server)
        .post('/api/solve')
        .send({
          puzzle: "5....5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6.."
        })
        .end(function(err, res) {
          assert.equal(res.status, 200, "status should be 200");
          assert.equal(res.type, "application/json", "response should be json");
          assert.property(res.body, "error");
          assert.equal(res.body.error, 'Puzzle cannot be solved');
          done();
        });
    });
  });

  suite('POST to /api/check', function() {
    test('Check a puzzle placement with all fields', function(done) {
      chai
        .request(server)
        .post('/api/check')
        .send({
          puzzle: "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..",
          coordinate: "A1",
          value: 7
        })
        .end(function(err, res) {
          assert.equal(res.status, 200, "status should be 200");
          assert.equal(res.type, "application/json", "response should be json");
          assert.property(res.body, "valid");
          assert.notProperty(res.body, "conflict");
          assert.equal(res.body.valid, true);
          done();
        });
    });

    test('Check a puzzle placement with single placement conflict', function(done) {
      chai
        .request(server)
        .post('/api/check')
        .send({
          puzzle: "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..",
          coordinate: "A2",
          value: 1
        })
        .end(function(err, res) {
          assert.equal(res.status, 200, "status should be 200");
          assert.equal(res.type, "application/json", "response should be json");
          assert.property(res.body, "valid");
          assert.property(res.body, "conflict");
          assert.equal(res.body.valid, false);
          assert.equal(res.body.conflict.length, 1);
          assert.equal(res.body.conflict[0], "row");
          done();
        });
    });

    test('Check a puzzle placement with multiple placement conflicts', function(done) {
      chai
        .request(server)
        .post('/api/check')
        .send({
          puzzle: "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..",
          coordinate: "A1",
          value: 1
        })
        .end(function(err, res) {
          assert.equal(res.status, 200, "status should be 200");
          assert.equal(res.type, "application/json", "response should be json");
          assert.property(res.body, "valid");
          assert.property(res.body, "conflict");
          assert.equal(res.body.valid, false);
          assert.equal(res.body.conflict.length, 2);
          assert.equal(res.body.conflict[0], "row");
          assert.equal(res.body.conflict[1], "column");
          done();
        });
    });

    test('Check a puzzle placement with all placement conflicts', function(done) {
      chai
        .request(server)
        .post('/api/check')
        .send({
          puzzle: "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..",
          coordinate: "A1",
          value: 5
        })
        .end(function(err, res) {
          assert.equal(res.status, 200, "status should be 200");
          assert.equal(res.type, "application/json", "response should be json");
          assert.property(res.body, "valid");
          assert.property(res.body, "conflict");
          assert.equal(res.body.valid, false);
          assert.equal(res.body.conflict.length, 3);
          assert.equal(res.body.conflict[2], "region");
          done();
        });
    });

    test('Check a puzzle placement with missing required fields', function(done) {
      chai
        .request(server)
        .post('/api/check')
        .send({
          puzzle: "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..",
          value: 5
        })
        .end(function(err, res) {
          assert.equal(res.status, 200, "status should be 200");
          assert.equal(res.type, "application/json", "response should be json");
          assert.property(res.body, "error");
          assert.equal(res.body.error, "Required field(s) missing");
          done();
        });
    });

    test('Check a puzzle placement with invalid characters', function(done) {
      chai
        .request(server)
        .post('/api/check')
        .send({
          puzzle: "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..K..",
          coordinate: "G7",
          value: 5
        })
        .end(function(err, res) {
          assert.equal(res.status, 200, "status should be 200");
          assert.equal(res.type, "application/json", "response should be json");
          assert.property(res.body, "error");
          assert.equal(res.body.error, 'Invalid characters in puzzle');
          done();
        });
    });


    test('Check a puzzle placement with incorrect length', function(done) {
      chai
        .request(server)
        .post('/api/check')
        .send({
          puzzle: "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3........",
          coordinate: "G7",
          value: 5
        })
        .end(function(err, res) {
          assert.equal(res.status, 200, "status should be 200");
          assert.equal(res.type, "application/json", "response should be json");
          assert.property(res.body, "error");
          assert.equal(res.body.error, 'Expected puzzle to be 81 characters long');
          done();
        });
    });


    test('Check a puzzle placement with invalid placement coordinate', function(done) {
      chai
        .request(server)
        .post('/api/check')
        .send({
          puzzle: "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..",
          coordinate: "Z7",
          value: 5
        })
        .end(function(err, res) {
          assert.equal(res.status, 200, "status should be 200");
          assert.equal(res.type, "application/json", "response should be json");
          assert.property(res.body, "error");
          assert.equal(res.body.error, 'Invalid coordinate');
          done();
        });
    });

    test('Check a puzzle placement with invalid placement value', function(done) {
      chai
        .request(server)
        .post('/api/check')
        .send({
          puzzle: "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..",
          coordinate: "B5",
          value: 11
        })
        .end(function(err, res) {
          assert.equal(res.status, 200, "status should be 200");
          assert.equal(res.type, "application/json", "response should be json");
          assert.property(res.body, "error");
          assert.equal(res.body.error, 'Invalid value');
          done();
        });
    });

  });

});

