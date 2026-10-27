import express from 'express';
import { matchRouter } from './routes/matches.js';

const app = express();
const PORT = 8000;

app.use(express.json());

app.use('/matches', matchRouter);

app.get('/', (req, res) => {
	res.status(200).json({ message: 'Hello from the Sportz server!' });
});



app.listen(PORT, () => {
	console.log(`Server listening at http://localhost:${PORT}`);
});
