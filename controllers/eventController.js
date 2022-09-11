import { ObjectId } from "mongodb";
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
            else throw Error('Invalid queries');
        } catch (error) { next(error) };
    }

    getEvent = async (req, res, next) => {
        try {

            const id = req.query.id;

            if (new ObjectId(id).toString() !== id) throw Error('Invalid id');

            const event = await this.events.findOne(ObjectId(id));

            return res.json(event);

        } catch (error) { next(error) };
    }

    getEvents = async (req, res, next) => {
        try {

            const { type, limit, page } = req.query;

            const events = await this.events.find()
                .skip((Number(page) - 1) * Number(limit))
                .limit(Number(limit));

            console.log(events)

            return res.send(await events.toArray());

        } catch (error) { next(error) };
    }

    addEvent = async (req, res, next) => {
        try {

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

            // validation
            if (!(name && typeof name === 'string')) throw Error('Invalid body: name');
            if (!(tagline && typeof tagline === 'string')) throw Error('Invalid body: tagline');
            if (!(description && typeof description === 'string')) throw Error('Invalid body: description');
            if (!(category && typeof category === 'string')) throw Error('Invalid body: category');
            if (!(subCategory && typeof subCategory === 'string')) throw Error('Invalid body: sub category');
            if (!uid || new ObjectId(uid).toString() !== uid) throw Error('Invalid body: uid');
            if (!moderator || new ObjectId(moderator).toString() !== moderator) throw Error('Invalid body: moderator');
            if (!(schedule &&
                /^\d{4}\-(0[1-9]|1[0-2])\-(0[1-9]|[12][0-9]|3[01])T[01][0-9]|2[0-3]\:[0-6][0-9]\:[0-6][0-9]Z$/.test(schedule)
            )) throw Error('Invalid body: schedule format YYYY-MM-DDThh:mm:ss');
            if (isNaN(rigorRank)) throw Error('Invalid body: rigor rank');
            if (!(files.length > 0 && files.every(file => ['image/jpeg', 'image/png'].includes(file.mimetype)))) throw Error('Invalid files: only jpeg or png accepted');

            const status = await this.events.insertOne({
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
            });

            res.send({ id: status.insertedId });

        } catch (error) { next(error) };
    }

    replaceEvent = async (req, res, next) => {
        try {
        
            const eventId = req.params.id;
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

            // validation
            if (!(name && typeof name === 'string')) throw Error('Invalid body: name');
            if (!(tagline && typeof tagline === 'string')) throw Error('Invalid body: tagline');
            if (!(description && typeof description === 'string')) throw Error('Invalid body: description');
            if (!(category && typeof category === 'string')) throw Error('Invalid body: category');
            if (!(subCategory && typeof subCategory === 'string')) throw Error('Invalid body: sub category');
            if (!uid || new ObjectId(uid).toString() !== uid) throw Error('Invalid body: uid');
            if (!moderator || new ObjectId(moderator).toString() !== moderator) throw Error('Invalid body: moderator');
            if (!(schedule &&
                /^\d{4}\-(0[1-9]|1[0-2])\-(0[1-9]|[12][0-9]|3[01])T[01][0-9]|2[0-3]\:[0-6][0-9]\:[0-6][0-9]Z$/.test(schedule)
            )) throw Error('Invalid body: schedule format YYYY-MM-DDThh:mm:ss');
            if (isNaN(rigorRank)) throw Error('Invalid body: rigor rank');
            if (!(files.length > 0 && files.every(file => ['image/jpeg', 'image/png'].includes(file.mimetype)))) throw Error('Invalid files: only jpeg or png accepted');

            const status = await this.events.replaceOne({ _id: ObjectId(eventId) }, {
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
            });

            if (status.matchedCount === 0) res.status(404).send('Not Found');
            else if (status.matchedCount === 1 && status.modifiedCount === 1) res.send('updated');
            else throw Error('Didn\'t update');
        } catch (error) { next(error) };
    }

    deleteEvent = async (req, res, next) => {
        try {
            const eventId = req.params.id;

            const status = await this.events.deleteOne({ _id: ObjectId(eventId) });

            if (status.deletedCount === 1) res.send('deleted');
            else res.send('not found or not deleted');
        } catch (error) { next(error) };
    }

}