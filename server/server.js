const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const argon2 = require('argon2');
const notesRouter = require('./src/routes/noteRoutes.js');
const User = require('./src/models/User.js');
const userRoutes = require('./src/routes/userRoutes'); // adjust path as necessary
const multer = require('multer');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/')  // ensure this directory exists
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + file.originalname)
  }
});


const upload = multer({ storage: storage });
// MongoDB connection string should be moved to environment variables for security
mongoose.connect('mongodb+srv://changkim1:444UfPxG3tIQysJ9@cluster0.xu3gl69.mongodb.net/')
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.log('Failed to connect to MongoDB', err));

// Sign up new user
app.post('/signup', async (req, res) => {
  const { firstName, lastName, birthdate, phoneNumber, email, password } = req.body;
  try {
    const hashedPassword = await argon2.hash(password, { type: argon2.argon2id });
    const newUser = new User({ firstName, lastName, birthdate, phoneNumber, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully', userId: newUser._id });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// User login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isMatch = await argon2.verify(user.password, password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    res.status(200).json({ message: "Login successful", userId: user._id });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Internal server error during login" });
  }
});
app.post('/submit', upload.single('image'), async (req, res) => {
  const { name, description } = req.body;
  const imagePath = req.file ? req.file.path : '';  // handle case where no image is uploaded

  const newProfile = new Profile({
    name,
    description,
    imagePath
  });

  try {
    await newProfile.save();
    res.status(201).send('Profile added successfully');
  } catch (error) {
    console.error('Failed to add profile:', error);
    res.status(500).send('Error adding profile');
  }
});
// POST /notes - create a new note for a user
app.post('/notes', async (req, res) => {
  const { title, content, image, userId } = req.body;

  try {
      const newNote = new Note({
          title,
          content,
          image,
          userId
      });
      await newNote.save();
      res.status(201).json(newNote);
  } catch (error) {
      console.error("Error creating note:", error);
      res.status(500).send("Failed to add note");
  }
});
// GET /notes/:userId - get all notes for a user
app.get('/notes/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
      const notes = await Note.find({ userId }).exec();
      res.json(notes);
  } catch (error) {
      console.error("Error retrieving notes:", error);
      res.status(500).send("Error fetching notes");
  }
});

// Static files handling (For React SPA)
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});
app.use('/users', userRoutes);

const profileRoutes = require('./src/routes/profiles.js'); // Adjust path as necessary
app.use('/profiles', profileRoutes);


// Server startup
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
