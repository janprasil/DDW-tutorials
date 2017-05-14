import * as Data from './data';
import csv from 'fast-csv';
import Visit from './Visit';
import kmeans from 'kmeansjs';

const writeOutput = () => {
  const csvStream = csv.createWriteStream({ headers: true });
  csvStream.pipe(Data.writableStream);
  Data.visits.forEach(x => {
    csvStream.write(x.toCsvOutput());
  });
  csvStream.end();
};

const writeOutputTopics = () => {
  const csvStream = csv.createWriteStream({ headers: true });
  csvStream.pipe(Data.writableStreamTopics);
  Data.visits.forEach(x => {
    const d = x.toCsvTopics(15, 7);
    if (d) csvStream.write(d);
  });
  csvStream.end();
};

const writeClusterOutput = () => {
  const csvStream = csv.createWriteStream({ headers: true });
  csvStream.pipe(Data.writableStreamCluster);
  const columns = new Set();
  Data.visits.forEach(x => {
    const c = x.get('pages').map(x => x.TopicName);
    c.forEach(y => columns.add(y));
  })
  const col = Array.from(columns);
  const matrix = [];
  let length = 0;
  Data.visits.forEach(x => {
    const y = x.toCsvCluster(col);
    csvStream.write(y);
    // console.log(y);
    matrix.push(Object.keys(y).map(j => y[j]));
    length = Object.keys(y).length;
  });
  csvStream.end();

  kmeans(matrix, length, function(err, res) {
    if (err) throw new Error(err)
    res.forEach(k => {
      //console.log(k);
      //console.log('=====================');
    })

      //console.log(res)
      //do something with the result
  })

}

const runClicks = () =>
  csv
    .fromStream(Data.clicksStream, { headers: true })
    .validate((row) => parseInt(row.TimeOnPage, 10) > 3)
    .on("data", data => {
      if (Data.visits.get(data.VisitID)) {
        Data.visits = Data.visits.update(data.VisitID, d => d.addPage(data));
      } else {
        Data.visits = Data.visits.set(data.VisitID, new Visit(data));
      }
    })
    .on("end", function(){
      console.log("Continue adding visitors info.");
      runVisitors();
    });

const runVisitors = () => 
  csv
    .fromStream(Data.visitorsStream, { headers: true })
    .validate((row) => parseInt(row.Length_seconds, 10) > 30)
    .on('data-invalid', (data) => {
      Data.visits = Data.visits.delete(data.VisitID);
    })
    .on("data", data => {
      if (Data.visits.get(data.VisitID)) {
        Data.visits = Data.visits.update(data.VisitID, d => d.addVisitor(data));
      } else {
        console.log('NO ENTRIES FOR VisitID ' + data.VisitID, 'Continue');
      }
    })
    .on("end", () => {
      Data.visits.forEach(x => x.computeUPM());
      writeOutput();
      writeClusterOutput();
      writeOutputTopics();
    })

const runReferrer = () =>
  csv
    .fromStream(Data.searchEngineStream, { headers: true })
    .on("data", data => {
      Data.referrers = Data.referrers.set(data.Referrer, data.Type);
    })
    .on("end", () => {
      console.log('Continue adding clicks');
      runClicks();
    })

runReferrer();
