import express from "express";
import cors from "cors";
import "./helpers/dbConnect.js";
import errorHandler from "./helpers/errorHandler.js";

import eventRoutes from "./routes/eventRoutes.js";

const app = express();

app.use(cors({ origin: '*'}));

const baseRouter = express.Router();
baseRouter.use('/events', eventRoutes);

app.use('/api/v3/app', baseRouter);

app.use(errorHandler);

app.listen(3000);