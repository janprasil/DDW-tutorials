require('pyextjs')

var fs = require('fs')

var nodes = 0;
var pages = {};
var lineNumber = 0;
var matrixH = [];

function readLines(input, func) {
  var remaining = '';

  input.on('data', function(data) {
    remaining += data;
    var index = remaining.indexOf('\n');
    while (index > -1) {
      var line = remaining.substring(0, index);
      remaining = remaining.substring(index + 1);
      func(line);
      index = remaining.indexOf('\n');
    }
  });

  input.on('end', function() {
    if (remaining.length > 0) {
      func(remaining);
      computeH();
    }
  });
}

var inputFile = "./data/test3.txt";
var input = fs.createReadStream(inputFile);
readLines(input, function(data) {
  if (lineNumber == 0) {
    nodes = parseInt(data, 10);
    lineNumber++;
    return;
  }

  var p = {};
  for(var i = 0; i < data.length; i += 1) {
    if (data[i] === ':' && i !== 0) {
      var count = "";
      var j = i+1;
      while(parseInt(data[j], 10) >= 0 && parseInt(data[j], 10) <= 9) {
        count += data[j++];
      }
      p[parseInt(data[i-1], 10)] = parseInt(count, 10);
    }
  }
  pages[lineNumber] = p;

  lineNumber += 1;
});


function computeH() {
  console.log('NODES', pages);

  var vector = [];
  for(var i = 0; i<nodes; i++) {
    vector[i] = 1/nodes;
  }

  for (var q = 0; q < 15; q++) {

    for(var i = 0; i < nodes; i+=1) {
      matrixH[i] = [];
      for(var j = 0; j < nodes; j+=1) {
        if (pages[i] && pages[i][j]) {
          matrixH[i][j] = vector[i];
        } else {
          matrixH[i][j] = 0;
        }
      }
    }

    vector = numpy.linspace(numpy.array(vector)*numpy.array(matrixH));
    console.log(vector);

  }

  //console.log(matrixH);

};


var alpha = 0.9;
var iterations = 16;

// var H = computeH(inputFile);

// var S = computeS(H);

// var G = computeG(S, alpha);

// computePR(G, iterations);
