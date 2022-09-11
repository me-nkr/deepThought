import { BSONTypeError } from "bson";

const respond = (response) => {
    return (statusCode, message) => {
        if (message)
        response.status(statusCode).json({ message: message });
        else
        response.status(statusCode).end();
    }
}

export default (error, req, res, next) => {
    if (res.headersSent) {
        return next(error)
    }

    const resp = respond(res);

    console.log(error.constructor)

    switch(error.constructor) {
        case BSONTypeError:
            return resp(400, 'Invalid id');
        default :
            console.log(error);
            return resp(500, 'Something wrong');
    }
}