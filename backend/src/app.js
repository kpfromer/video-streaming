import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';

const app = express();

// Config
app.use(bodyParser.json());
app.use(cors());

app.get('/example.webm', (req, res) => {
  return res.sendFile(path.join(__dirname, '../videos', 'example.webm'))
})

app.listen(3001);