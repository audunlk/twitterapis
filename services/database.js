const { Pool } = require('pg');

const database = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'twitter',
  password: '387456',
  port: 5432,
});

async function getTweets() {
  const result = await database.query(`
    SELECT
      tweets.id,
      tweets.message,
      tweets.created_at,
      users.name,
      users.username,
      tweets.like_count
    FROM
      tweets
    INNER JOIN users ON
      tweets.user_id = users.id
    ORDER BY created_at DESC;
  `);
  console.log(result.rows);
  return result.rows;
}

async function getTweetsByUsername(username) {
  const result = await database.query(`
    SELECT
      tweets.id,
      tweets.message,
      tweets.created_at,
      users.name,
      users.username,
      tweets.like_count
    FROM
      tweets
    INNER JOIN users ON
      tweets.user_id = users.id
    WHERE
      users.username = $1
    ORDER BY created_at DESC;
  `, [username]);
  console.log(result.rows)
  return result.rows;
}


async function createTweet(username, text) {
  const userResult = await database.query(`
    SELECT
      users.id
    FROM 
      users
    WHERE
      users.username = $1
  `, [username]);
  const user = userResult.rows[0];

  const tweetResult = await database.query(`
    INSERT INTO tweets
      (message, user_id)
    VALUES
      ($1, $2)
    RETURNING
      id
  `, [text, user.id]);
  const newTweet = tweetResult.rows[0];
  return newTweet;
}

async function getUserByUsername(username) {
  const result = await database.query(`
    SELECT 
      *
    FROM
      users
    WHERE
      username = $1
  `, [username]);
  const user = result.rows[0];
  return user;
}

async function updateLikes(tweetId, like_count) { 
  const likeResult = await database.query(`
    UPDATE tweets
    SET like_count = $2
    WHERE id = $1
    RETURNING
      like_count
  `, [tweetId, (like_count + 1)]);
  const newLike = likeResult.rows[0];
  return newLike;
}

async function defineLiked(tweetId, user_id) {
  const likeResult = await database.query(`
    Update likes
    SET liked = true
    WHERE tweet_id = $1 AND user_id = $2
    RETURNING
      liked
  `, [tweetId, user_id]);
  const like = likeResult.rows[0];
  return like;
}

async function handleCheckLikes(tweetId, user_id) {
  const likeResult = await database.query(`
    SELECT
      *
    FROM
      likes
    WHERE
      tweet_id = $1 AND user_id = $2
  `, [tweetId, user_id]);
  const like = likeResult.rows[0];
  return like;
}



module.exports = {
  getTweets,
  getTweetsByUsername,
  createTweet,
  getUserByUsername,
  updateLikes,
  handleCheckLikes,
  defineLiked
};