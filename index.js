const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

let persons = [
  {
    id: 1,
    name: 'John Doe',
    number: '123-456-7890'
  },
  {
    id: 2,
    name: 'Jane Smith',
    number: '987-654-3210'
  }
];

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method);
  console.log('Path:', request.path);
  console.log('Body:', request.body);
  console.log('---');
  next();
};

app.use(requestLogger);

app.get('/', (request, response) => {
  response.send('<h1>API REST de Agenda</h1>');
});

app.get('/api/persons', (request, response) => {
  response.json(persons);
});

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find(p => p.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter(p => p.id !== id);
  response.status(204).end();
});

// Generar un ID único para cada persona
const generateId = () => {
  const maxId = persons.length > 0 ? Math.max(...persons.map(p => p.id)) : 0;
  return maxId + 1;
};

app.post('/api/persons', (request, response) => {
  const body = request.body;
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number missing'
    });
  }
  const person = {
    id: generateId(),
    name: body.name,
    number: body.number
  };
  persons = persons.concat(person);
  response.json(person);
});

app.put('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const body = request.body;
  const person = persons.find(p => p.id === id);
  if (!person) return response.status(404).end();
  const updatedPerson = { ...person, number: body.number };
  persons = persons.map(p => p.id !== id ? p : updatedPerson);
  response.json(updatedPerson);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
