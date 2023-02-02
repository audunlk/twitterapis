const express = require('express');
const cors = require('cors');
const app = express();
const { getTweets, getTweetsByUsername, createTweet, getUserByUsername, updateLikes, handleCheckLikes, defineLiked  } = require('./services/database');
const jwt = require('jsonwebtoken');

const PORT = 3333;
const APP_SECRET = 'my-secret-key-1234'

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from Twitter API');
});

app.get('/tweets', async (req, res) => {
  const tweets = await getTweets();
  res.json(tweets);
});

app.get('/tweets/:username', async (req, res) => {
  const { username } = req.params;
  const tweets = await getTweetsByUsername(username);
  res.json(tweets);
});

//post request
app.post('/tweets', async (req, res) => {
  const { text } = req.body;
  const token = req.headers['x-token'];

  try{
  const payload = jwt.verify(token, Buffer.from(APP_SECRET, 'base64'));
  const username = payload.username;
  
  const newTweet = await createTweet(username, text);
  res.json(newTweet);
  }catch(error){
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await getUserByUsername(username);

    if (!user) {
      res.status(401).send({ error: 'Unknown user - not found' });
      return;
    }
  
    if (password !== user.password) {
      res.status(401).send({ error: 'Wrong password' });
      return;
    }
  
    const token = jwt.sign({
      id: user.id,
      username: user.username,
      name: user.name
    }, Buffer.from(APP_SECRET, 'base64'));
  
    res.json({ token });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get('/session', async (req, res) => {
  const token = req.headers['x-token'];
  if(!token) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }
  try{
    const payload = jwt.verify(token, Buffer.from(APP_SECRET, 'base64'));
    res.json({message: `You're logged inn as ${payload.username}`});
  }catch(error){
    res.status(401).json({ error: 'Invalid token' });
  }

});





app.post('/tweets/:tweetId/', async (req, res) => {
  const { tweetId } = req.params;
  const { like_count } = req.body;
  const newLike = await updateLikes(tweetId, like_count);
  res.json(newLike);
});

app.get('/tweets/:tweetId/likes/:userId', async (req, res) => {
  const { tweetId, userId } = req.params;
  const token = req.headers['x-token'];
  try{
    const payload = jwt.verify(token, Buffer.from(APP_SECRET, 'base64'));
    const user_id = payload.id;
    if(user_id !== userId){
      res.status(401).json({ error: 'You are not allowed to like this tweet' });
      return;
    }
    const checkLikes = await handleCheckLikes(tweetId, userId);
    res.json(checkLikes);
  }catch(error){
    res.status(401).json({ error: 'Invalid token' });
  }

});

app.post('/tweets/:tweetId/likes/:userId', async (req, res) => {
  const { tweetId, userId } = req.params;
  const { like_count } = req.body;
  const token = req.headers['x-token'];
  try{
    const payload = jwt.verify(token, Buffer.from(APP_SECRET, 'base64'));
    const user_id = payload.id;
    if(user_id !== userId){
      res.status(401).json({ error: 'You are not allowed to like this tweet' });
      return;
    }
    const newLike = await updateLikes(tweetId, like_count);
    res.json(newLike);
  }catch(error){
    res.status(401).json({ error: 'Invalid token' });
  }
});






app.listen(PORT, () => {
  console.log(`Twitter API listening to port: ${PORT}`);
})