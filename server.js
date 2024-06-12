import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAllItems, getPublishedItems, getCategories, initialize } from './store-service.js';

const app = express();
const port = process.env.PORT || 8080;

// Get the current directory path
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Serve static files from the "public" directory
app.use(express.static('public'));

// Redirect the root route ("/") to the "/about" route
app.get('/', (req, res) => {
  res.redirect('/about');
});

// Serve the about.html file for the "/about" route
app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

// Serve the shop page for the "/shop" route
app.get('/shop', (req, res) => {
  getPublishedItems()
    .then((items) => {
      res.json(items);
    })
    .catch((err) => {
      res.json({ message: err });
    });
});

// Route to get all items
app.get('/items', (req, res) => {
  getAllItems()
    .then((items) => {
      res.json(items);
    })
    .catch((err) => {
      res.json({ message: err });
    });
});

// Route to get all categories
app.get('/categories', (req, res) => {
  getCategories()
    .then((categories) => {
      res.json(categories);
    })
    .catch((err) => {
      res.json({ message: err });
    });
});

// Custom 404 route
app.use((req, res) => {
  res.status(404).send('Page Not Found');
  // Alternatively, you can send a custom 404 page
  // res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

// Initialize the store-service module
initialize()
  .then(() => {
    // Start the server
    app.listen(port, () => {
      console.log(`Express http server listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error(err);
  });