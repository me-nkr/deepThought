import { ObjectId } from "mongodb";
import { InvalidRequestError, NotFoundError } from "../helpers/errorHandler.js";

export default class Event {

    constructor(collection) {
        this.events = collection;
    }

    singleOrListMiddleware(req, res, next) {
        try {
            if (Object.keys(req.query).length === 1 && req.query.id) {
                return next();
            }
            else if (Object.keys(req.query).length === 3 && req.query.type && req.query.limit && req.query.page) {
                return next('route');
            }
            else throw new InvalidRequestError('Query should contain either id or type, limit and page only');
        } catch (error) { next(error) };
    }

    getEvent = async (req, res, next) => {
        try {

            const id = req.query.id;

            if (!id || new ObjectId(id).toString() !== id) throw new InvalidRequestError('id should be a 12-byte BSON ObjectId');

            const event = await this.events.findOne(ObjectId(id));

            if (!event) throw new NotFoundError('Event');

            return res.json(event);

        } catch (error) { next(error) };
    }

    getEvents = async (req, res, next) => {
        try {

            const { type, limit, page } = req.query;

            if (isNaN(limit) || isNaN(page)) throw new InvalidRequestError('limit and page should be numbers')

            let events;

            switch (type) {
                case 'latest':
                    events = await this.events.find()
                        .sort({ schedule: 1 })
                        .skip((Number(page) - 1) * Number(limit))
                        .limit(Number(limit));
                    break;
                default:
                    new InvalidRequestError('should specify a valid type');
            }

            return res.send(await events.toArray());

        } catch (error) { next(error) };
    }

    addEvent = async (req, res, next) => {
        try {

            const payload = this.payloadForDb(req);

            const status = await this.events.insertOne(payload);

            res.send({ id: status.insertedId });

        } catch (error) { next(error) };
    }

    replaceEvent = async (req, res, next) => {
        try {

            const eventId = req.params.id;

            if (!eventId || new ObjectId(eventId).toString() !== eventId) throw new InvalidRequestError('id should be a 12-byte BSON ObjectId');

            const payload = this.payloadForDb(req);

            const status = await this.events.replaceOne({ _id: ObjectId(eventId) }, payload);

            if (status.matchedCount === 0) throw new NotFoundError('Event');
            else if (status.matchedCount === 1 && status.modifiedCount === 1) res.status(204).end();
            else throw Error('Event Not Updated');
        } catch (error) { next(error) };
    }

    deleteEvent = async (req, res, next) => {
        try {

            const eventId = req.params.id;

            if (!eventId || new ObjectId(eventId).toString() !== eventId) throw new InvalidRequestError('id should be a 12-byte BSON ObjectId');

            const status = await this.events.deleteOne({ _id: ObjectId(eventId) });

            if (status.deletedCount === 1) res.status(204).send();
            else throw new NotFoundError('Event');
        } catch (error) { next(error) };
    }

    validatePayload({ name, tagline, description, category, sub_category: subCategory, uid, moderator, schedule, rigor_rank: rigorRank, files }) {

        if (!(name && typeof name === 'string')) throw new InvalidRequestError('invalid name');
        if (!(tagline && typeof tagline === 'string')) throw new InvalidRequestError('invalid tagline');
        if (!(description && typeof description === 'string')) throw new InvalidRequestError('invalid description');
        if (!(category && typeof category === 'string')) throw new InvalidRequestError('invalid category');
        if (!(subCategory && typeof subCategory === 'string')) throw new InvalidRequestError('invalid sub category');
        if (!uid || new ObjectId(uid).toString() !== uid) throw new InvalidRequestError('uid should be a 12-byte BSON ObjectId');
        if (!moderator || new ObjectId(moderator).toString() !== moderator) throw new InvalidRequestError('moderator should be a 12-byte BSON ObjectId');
        if (!(schedule &&
            /^\d{4}\-(0[1-9]|1[0-2])\-(0[1-9]|[12][0-9]|3[01])T[01][0-9]|2[0-3]\:[0-6][0-9]\:[0-6][0-9]Z$/.test(schedule)
        )) throw new InvalidRequestError('schedule should be in format YYYY-MM-DDThh:mm:ssZ, example: 2022-10-14T21:45:34Z');
        if (isNaN(rigorRank)) throw new InvalidRequestError('rigor rank should be a number');
        if (!(files && files.length > 0 && files.every(file => ['image/jpeg', 'image/png'].includes(file.mimetype)))) throw new InvalidRequestError('atleast one image files should be given and should be of only jpeg or png format');

    }

    payloadForDb(req) {

        this.validatePayload({ ...req.body, files: req.files });

        const files = req.files;
        const {
            uid,
            name,
            tagline,
            schedule,
            description,
            moderator,
            category,
            sub_category: subCategory,
            rigor_rank: rigorRank
        } = req.body;

        return {
            type: 'event',
            uid,
            name,
            tagline,
            schedule: new Date(schedule),
            description,
            files: files.map(file => { return { name: file.originalname, data: file.buffer } }),
            moderator,
            category,
            sub_category: subCategory,
            rigor_rank: Number(rigorRank),
            attendees: []
        };
    }

}