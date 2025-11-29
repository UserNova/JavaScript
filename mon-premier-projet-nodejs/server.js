// Chargement des variables d'environnement
require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan'); // Middleware de journalisation

// Création de l'application Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Journalisation des requêtes

// Dossier statique pour les fichiers publics
app.use(express.static(path.join(__dirname, 'public')));

// Route principale : renvoie index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Routes API
const usersRouter = express.Router();

// Obtenir tous les utilisateurs
usersRouter.get('/', (req, res) => {
  fs.readFile(path.join(__dirname, 'users.json'), 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    const users = JSON.parse(data);
    res.json(users);
  });
});

// Obtenir un utilisateur par ID
usersRouter.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);

  fs.readFile(path.join(__dirname, 'users.json'), 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    const users = JSON.parse(data);
    const user = users.find(u => u.id === id);

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
  });
});

// Ajouter un utilisateur
usersRouter.post('/', (req, res) => {
  const newUser = req.body;

  if (!newUser.nom || !newUser.prenom) {
    return res.status(400).json({ error: 'Nom et prénom sont requis' });
  }

  fs.readFile(path.join(__dirname, 'users.json'), 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    const users = JSON.parse(data);

    // Génération ID auto-incrémenté
    const maxId = Math.max(...users.map(u => u.id), 0);
    newUser.id = maxId + 1;

    users.push(newUser);

    fs.writeFile(
      path.join(__dirname, 'users.json'),
      JSON.stringify(users, null, 2),
      err => {
        if (err) {
          return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.status(201).json(newUser);
      }
    );
  });
});

// Activer le routeur
app.use('/api/users', usersRouter);

// Middleware 404
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Middleware erreur serveur
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur' });
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`Serveur Express démarré sur http://localhost:${PORT}`);
});
