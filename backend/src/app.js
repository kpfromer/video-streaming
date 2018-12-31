import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';

const app = express();

// Config
app.use(bodyParser.json());
app.use(cors());

app.use('/', express.static(path.join(__dirname, '..', 'public')))

// app.get('/example.webm', (req, res) => {
//   return res.sendFile(path.join(__dirname, '../videos', 'example.webm'))
// });

// app.get('/example.json', (req, res) => {
//   return res.sendFile(path.join(__dirname, '../data', 'example.json'))
// })

app.listen(3001);