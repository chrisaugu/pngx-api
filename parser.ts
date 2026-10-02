// interface CSVRow {
//   [key: string]: string;
// }

// // Transform stream that converts CSV to JSON
// class CSVToJSON extends Transform {
//   private headers: string[] | null = null;
//   private buffer: string = '';

//   constructor(options?: TransformOptions) {
//     super({ ...options, objectMode: true }); // Output JavaScript objects
//   }

//   _transform(chunk: Buffer, encoding: BufferEncoding, callback: TransformCallback): void {
//     this.buffer += chunk.toString();
//     const lines = this.buffer.split('\n');

//     // Keep incomplete line in buffer
//     this.buffer = lines.pop() || '';

//     for (const line of lines) {
//       if (!line.trim()) continue;

//       const values = line.split(',').map(v => v.trim());

//       if (!this.headers) {
//         this.headers = values;
//       } else {
//         const obj: CSVRow = {};
//         this.headers.forEach((header, i) => {
//           obj[header] = values[i];
//         });
//         this.push(obj);
//       }
//     }

//     callback();
//   }

//   _flush(callback: TransformCallback): void {
//     // Handle any remaining data in buffer
//     if (this.buffer.trim() && this.headers) {
//       const values = this.buffer.split(',').map(v => v.trim());
//       const obj: CSVRow = {};
//       this.headers.forEach((header, i) => {
//         obj[header] = values[i];
//       });
//       this.push(obj);
//     }
//     callback();
//   }
// }

// // Use the transform stream
// createReadStream('./data.csv')
//   .pipe(new CSVToJSON())
//   .on('data', (obj: CSVRow) => {
//     console.log('Row:', obj);
//   })
//   .on('end', () => {
//     console.log('Done parsing CSV');
//   });
