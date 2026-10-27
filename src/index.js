import express from 'express';

const app = express();
const PORT = 8000;

app.use(express.json());


app.get('/', (req, res) => {
	res.status(200).json({ message: 'Hello from the Sportz server!' });
});

app.listen(PORT, () => {
	console.log(`Server listening at http://localhost:${PORT}`);
});
