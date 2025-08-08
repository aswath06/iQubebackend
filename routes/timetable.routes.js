module.exports = (app) => {
  const { Timetable } = require('../models');

  app.get('/timetables', async (req, res) => res.json(await Timetable.findAll()));

  app.get('/timetables/:id', async (req, res) => {
    const entry = await Timetable.findByPk(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Not found' });
    res.json(entry);
  });

  app.get('/timetables/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const entries = await Timetable.findAll({ where: { userId } });

    if (!entries.length) {
      return res.status(404).json({ message: 'No timetables found for this user' });
    }

    res.json(entries);
  } catch (error) {
    console.error('Error fetching user timetable:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
  app.post('/timetables', async (req, res) => {
    const entry = await Timetable.create(req.body);
    res.status(201).json(entry);
  });
  app.post('/timetables/bulk/:userId', async (req, res) => {
  const { userId } = req.params;
  const timetableEntries = req.body; // array of entries

  try {
    const bulkData = [];

    for (const entry of timetableEntries) {
      const dateSerial = entry["Date/Time"];

      // Convert Excel serial date to JS date
      const jsDate = new Date(Math.round((dateSerial - 25569) * 86400 * 1000)); // Excel to JS

      // Remove "Date/Time" to loop only periods
      const { ["Date/Time"]: _, ...periods } = entry;

      for (const time in periods) {
        bulkData.push({
          userId,
          time: time.trim(),
          subject: periods[time].trim(),
          status: 'pending',
          date: jsDate,
          comment: '',
          total_number_of_classes: 0,
          attended: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    // Bulk insert into database
    const result = await Timetable.bulkCreate(bulkData);
    res.status(201).json({ message: 'Bulk timetable created', count: result.length });
  } catch (error) {
    console.error('Error creating bulk timetable:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});


  app.put('/timetables/:id', async (req, res) => {
    const entry = await Timetable.findByPk(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Not found' });
    await entry.update(req.body);
    res.json(entry);
  });

  app.delete('/timetables/:id', async (req, res) => {
    const entry = await Timetable.findByPk(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Not found' });
    await entry.destroy();
    res.json({ message: 'Deleted' });
  });
};
