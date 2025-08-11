const express = require('express');
const router = express.Router();
const { Quote, Sequelize } = require('../models');

module.exports = (app) => {
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

  router.get('/random', async (req, res) => {
    try {
      const randomQuote = await Quote.findOne({ order: Sequelize.literal('RANDOM()') });
      if (!randomQuote) return res.status(404).json({ error: 'No quotes found' });

      res.json(randomQuote);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.use('/quotes', router);
};
