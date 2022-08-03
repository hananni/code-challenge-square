const csv = require('csv-stream');
const fcsv = require('fast-csv');
const fs = require("fs");

const args = process.argv.slice(2);

const outputData = []

fs.createReadStream(args[0])
  .pipe(csv.createStream({ escapeChar : '"', enclosedChar : '"' }))
  .on("data", function (row) {
      outputData.push(processRow(row));
   })
  .on("end", () => {
     writeFile(outputData);
   });

const processRow = (data) => {
    const square = JSON.parse(data.json)
    const isValid = isSquare(square);
   
    if(!isValid){ 
        return { id: data.id, json: "[]", isValid: false }
    }
    const rotatedSquare = rotateSquare(square);
    return {id: data.id, json: JSON.stringify(rotatedSquare), isValid: true};
}

const rotateSquare = (data) =>{
    const size = Math.round(Math.sqrt(data.length));
    const matrix = toMatrix(data, size);
    let result = [];

    for(let a=0,b=matrix.length-1;b>=a;a++,b--){
        result = rotateRightOclock(matrix,a,a,b,b);
    }

    return [].concat.apply([], result)
}

const rotateRightOclock = (mtx,top,left,bottom,right) => {
    const result = [...mtx];
    let elem=mtx[top][left];
    for(let y=top;y<bottom;y++) {
        result[y][left]=mtx[y+1][left];
    }
    for(let x=left;x<right;x++)    {
        result[bottom][x]=mtx[bottom][x+1];
    }
    for(let y=bottom;y>top;y--) {
        result[y][right]=mtx[y-1][right];
    }
    for(let x=right;x>left+1;x--){
        result[top][x]=mtx[top][x-1];
        result[top][left+1]=elem;
    }
    return result;
  }

const toMatrix = (arr, width) => 
    arr.reduce((rows, key, index) => (index % width == 0 ? rows.push([key]) 
      : rows[rows.length-1].push(key)) && rows, []);

var isSquare = (array) => array.length > 0 && Math.sqrt(array.length) % 1 === 0;

const writeFile = (data) => {
    const csvStream = fcsv.format({ headers: true });
    csvStream.pipe(process.stdout).on('end', () => process.exit());
    data.forEach(row => csvStream.write(row));
    csvStream.end();
}