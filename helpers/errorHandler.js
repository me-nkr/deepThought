import { BSONTypeError } from "bson";

export class InvalidRequestError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidRequestError';
    }
}
export class NotFoundError extends Error {
    constructor(resource) {
        super(resource + ' Not Found');
        this.name = 'NotFoundError';
    }
}

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
            return resp(400, 'id should be a 12-byte BSON ObjectId');
        case InvalidRequestError:
            return resp(400, error.message);
        case NotFoundError:
            return resp(404, error.message);
        default :
            console.log(error.constructor);
            console.log(error.message)
            return resp(500, 'Something wrong');
    }
}

/**
 * Possible errors
 * - Invalid body
 * - Invalid query
 * - Not Found
 */