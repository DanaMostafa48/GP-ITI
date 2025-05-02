// const express = require('express')
// const app = express()
// const port = process.env.PORT || 3000

// const mysql = require('mysql2');

// const pool = mysql.createPool({
//   host: process.env.RDS_HOSTNAME,
//   user: process.env.RDS_USERNAME,
//   password: process.env.RDS_PASSWORD,
//   port: process.env.RDS_PORT || 3306,

// });
// app.get("/db", (req, res) => {

//   pool.getConnection(function(err, connection) {
//     if (err) {
//       res.send("db connection failed");
//       console.error('Database connection failed: ' + err.stack);
//       return;
//     }
//     res.send("db connection successful finished pipeline");
//     console.log('Connected to database.');
//     connection.release(); // release back to the pool
//   });
// });

// const redis = require('redis');
// const client = redis.createClient({
//     host: process.env.REDIS_HOSTNAME,
//     port: process.env.REDIS_PORT || 6379,
// });

// client.on('error', err => {
//     console.log('Error ' + err);
// });

// app.get('/redis', (req, res) => {

//   client.set('foo','bar', (error, rep)=> {                
//     if(error){     
// console.log(error);
//       res.send("redis connectionnnnnnn failed");                             
//       return;                
//   }                 
//   if(rep){                          //JSON objects need to be parsed after reading from redis, since it is stringified before being stored into cache                      
//  console.log(rep);
//   res.send("redis is successfuly connected  ok");                 
//  }}) 
//   })
  
//   app.listen(port, () => {
//     console.log(`Example app listening at http://localhost:${port}`)
//   })

  // ############################################
  const express = require('express');
  const app = express();
  const port = process.env.PORT || 3000;
  
  const mysql = require('mysql2');
  const { createClient } = require('redis');
  const path = require('path');
  
  // Serve static files like CSS
  app.use(express.static(path.join(__dirname, 'public')));
  
  // MySQL setup
  const pool = mysql.createPool({
    host: process.env.RDS_HOSTNAME,
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    port: process.env.RDS_PORT || 3306,
  });
  
  // Redis v4 setup
  const client = createClient({
    socket: {
      host: process.env.REDIS_HOSTNAME,
      port: process.env.REDIS_PORT || 6379,
    },
  });
  
  client.on('error', (err) => console.error('Redis Client Error', err));
  
  (async () => {
    try {
      console.log('✅ Connected to Redis');
    } catch (err) {
      console.error('❌ Failed to connect to Redis:', err);
    }
  })();
  
  // Routes
  app.get('/', (req, res) => {
    res.send(`
      <html>
        <head>
          <title>Enhanced App</title>
          <link rel="stylesheet" href="/styles.css">
        </head>
        <body>
          <h1>🌈 Welcome to the Enhanced Node.js App!</h1>
          <ul>
            <li><a href="/db">Check MySQL Connection</a></li>
            <li><a href="/redis">Check Redis Connection</a></li>
            <li><a href="/redis/set?key=color&value=blue">Set Redis Key</a></li>
            <li><a href="/redis/get?key=color">Get Redis Key</a></li>
            <li><a href="/health">Health Check</a></li>
          </ul>
        </body>
      </html>
    `);
  });
  
  app.get('/db', (req, res) => {
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('DB error:', err);
        res.status(500).send('❌ DB connection failed');
        return;
      }
      res.send('✅ DB connection successful - Finished pipeline!');
      connection.release();
    });
  });
  
  app.get('/redis', async (req, res) => {
    try {
      await client.set('foo', 'bar');
      res.send('✅ Redis connected and value set');
    } catch (err) {
      console.error('Redis error:', err);
      res.status(500).send('❌ Redis connection failed');
    }
  });
  
  app.get('/redis/set', async (req, res) => {
    const { key, value } = req.query;
    if (!key || !value) return res.send('❌ Provide key and value');
    try {
      await client.set(key, value);
      res.send(`✅ Set Redis key "${key}" with value "${value}"`);
    } catch (err) {
      console.error('Redis set error:', err);
      res.status(500).send('❌ Redis set failed');
    }
  });
  
  app.get('/redis/get', async (req, res) => {
    const { key } = req.query;
    if (!key) return res.send('❌ Provide key');
    try {
      const value = await client.get(key);
      res.send(`✅ Redis key "${key}" has value "${value}"`);
    } catch (err) {
      console.error('Redis get error:', err);
      res.status(500).send('❌ Redis get failed');
    }
  });
  
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
  });
  
  // Start server
  app.listen(port, () => {
    console.log(`🌐 App listening at http://localhost:${port}`);
  });
  