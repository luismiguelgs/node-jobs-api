require('dotenv').config();
require('express-async-errors');

const express = require('express');
const app = express();

//extra security packager
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss');
const rateLimiter = require('express-rate-limit');

//connect DB
const connectDB = require('./db/connection');
const authenticatedUser = require('./middleware/authentication')

//routers
const authRouter = require('./routes/auth');
const jobsRouter = require('./routes/jobs');

//error handlers
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

// middleware
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss);
app.use(rateLimiter({
  windowMs: 15*60*1000, //15 min
  max: 100
}));

//routes
app.use('/api/v1/auth',authRouter);
app.use('/api/v1/jobs',authenticatedUser,jobsRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 8080;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();