const db = require('../models');
const SocialMedia = db.SocialMedia;

exports.updateByUserId = async (req, res) => {
  const userId = req.params.id;
  try {
    const [updatedRows] = await SocialMedia.update(req.body, {
      where: { userId },
    });

    if (updatedRows === 1) {
      res.status(200).json({ message: 'Updated successfully' });
    } else {
      res.status(404).json({ message: 'User not found or no changes made' });
    }
  } catch (error) {
    console.error('❌ Error updating social media:', error);
    res.status(500).json({ message: 'Update failed', error });
  }
};
