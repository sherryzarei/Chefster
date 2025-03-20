const express = require("express")
const router = express.Router()

router.post('/chat/send', async (req, res) => {
  const { senderId, receiverId, message } = req.body;

  if (!senderId || !receiverId || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
      const messageData = {
          senderId,
          receiverId,
          message,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
      };

      await db.collection('privateMessages').add(messageData);

      res.status(200).json({ success: true, message: 'Message sent!' });
  } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get('/chat/messages', async (req, res) => {
  const { senderId, receiverId } = req.query;

  if (!senderId || !receiverId) {
      return res.status(400).json({ error: 'Missing required query parameters' });
  }

  try {
      const messages = await db.collection('privateMessages')
          .where('senderId', 'in', [senderId, receiverId])
          .where('receiverId', 'in', [senderId, receiverId])
          .orderBy('timestamp', 'asc')
          .get();

      const messageList = messages.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      res.status(200).json(messageList);
  } catch (error) {
      console.error("Error retrieving messages:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});


module.exports = router;