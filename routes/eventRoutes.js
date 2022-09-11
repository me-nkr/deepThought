import multer from "multer";
import { Router } from "express";
import { dbClient } from "../helpers/dbConnect.js";
import eventController from "../controllers/eventController.js";

const files = multer();

const eventsCollection = await dbClient.collection('events');
const { singleOrListMiddleware, getEvent, getEvents, addEvent, replaceEvent, deleteEvent } = new eventController(eventsCollection);

const events = Router();

events.get('/', singleOrListMiddleware, getEvent)
events.get('/', getEvents)
events.post('/', files.array('images'), addEvent);

events.route('/:id')
.put(files.array('images'), replaceEvent)
.delete(deleteEvent);

export default events;