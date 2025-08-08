const express = require('express');
const router = express.Router();
const { Quote } = require('../models');  // Make sure this path is correct

module.exports = (app) => {
  // POST /quotes — add a single quote
  router.post('/', async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: 'Quote text is required' });

      const newQuote = await Quote.create({ text });
      res.status(201).json(newQuote);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /quotes/bulk — bulk add quotes
  router.post('/bulk', async (req, res) => {
    try {
      const { quotes } = req.body;
      if (!Array.isArray(quotes) || quotes.length === 0) {
        return res.status(400).json({ error: 'Quotes array is required' });
      }

      const quoteObjects = quotes.map(text => ({ text }));
      const inserted = await Quote.bulkCreate(quoteObjects);
      res.status(201).json({ insertedCount: inserted.length });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /quotes/random — get a random quote
  router.get('/random', async (req, res) => {
    try {
      const count = await Quote.count();
      if (count === 0) return res.status(404).json({ error: 'No quotes found' });

      const randomIndex = Math.floor(Math.random() * count);
      const randomQuote = await Quote.findOne({ offset: randomIndex });

      res.json(randomQuote);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.use('/quotes', router);
};
