require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Person = require('./Models/person');

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('dist'));

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method);
    console.log('Path:', request.path);
    console.log('Body:', request.body);
    console.log('---');
    next();
};

app.use(requestLogger);

// Ruta principal
app.get('/', (request, response) => {
    response.send('<h1>API REST FROM PERSONS</h1>');
});

// Obtener todas las personas
app.get('/api/persons', (request, response) => {
    Person.find({}).then((persons) => response.json(persons));
});

// Obtener una persona especifica
app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id)
        .then((person) => {
            if (person) {
                response.json(person);
            } else {
                response.status(404).end();
            }
        })
        .catch((error) => {
            console.error(error);
            response.status(400).send({ error: 'malformatted id' });
        });
});

// Eliminar una persona por ID
app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id;

    Person.findByIdAndDelete(id)
        .then((result) => {
            if (result) {
                console.log(`Person with id ${id} deleted.`);
                response.status(204).end();
            } else {
                response.status(404).send({ error: 'Person not found' });
            }
        })
        .catch((error) => {
            console.error('Error deleting person:', error.message);
            response.status(400).send({ error: 'Invalid ID format or delete failed' });
        });
});

// Agregar una nueva persona
app.post('/api/persons', (request, response) => {
    const body = request.body;

    if (!body.name || !body.number) {
        return response.status(400).json({ error: 'Name or number is missing' });
    }

    const person = new Person({
        name: body.name,
        number: body.number,
    });

    person
        .save()
        .then((savedPerson) => response.json(savedPerson))
        .catch((error) => {
            console.error(error);
            response.status(500).json({ error: 'Failed to save person' });
        });
});

// Actualizar el numero de una persona
app.put('/api/persons/:id', (request, response) => {
    const { name, number } = request.body;

    Person.findByIdAndUpdate(
        request.params.id,
        { name, number },
        { new: true, runValidators: true, context: 'query' }
    )
        .then((updatedPerson) => {
            if (updatedPerson) {
                response.json(updatedPerson);
            } else {
                response.status(404).end();
            }
        })
        .catch((error) => {
            console.error(error);
            response.status(400).send({ error: 'malformatted id' });
        });
});

app.get('/info', (request, response) => {
    Person.countDocuments({})
        .then((count) => {
            const currentDate = new Date();
            response.send(`
                <p>Phonebook has info for ${count} people</p>
                <p>${currentDate}</p>
            `);
        })
        .catch((error) => {
            console.error(error);
            response.status(500).json({ error: 'Failed to fetch info' });
        });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});