// eslint-disable-next-line max-classes-per-file
export abstract class ProblemJsonError extends Error {
    public readonly type: string;
    public readonly title: string;
    public readonly detail: string;
    public readonly status: number;
    public readonly isProblemJsonError = true;

    protected constructor(type: string, title: string, detail: string, status: number, message?: string) {
        super(message ?? detail);

        this.type = `/problems/${type}`;
        this.title = title;
        this.detail = detail;
        this.status = status;
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    public toJSON(): Record<string, unknown> {
        return {
            type: this.type,
            title: this.title,
            detail: this.detail,
            status: this.status
        };
    }
}

export class ValidationError extends ProblemJsonError {
    public constructor(detail: string, message?: string) {
        super('validation-error', 'Validation Error', detail, 400, message);
    }
}

export class AuthorizationError extends ProblemJsonError {
    public constructor(detail: string, message?: string) {
        super('authorization-error', 'Authorization Error', detail, 401, message);
    }
}

export class UserExistsError extends ProblemJsonError {
    public constructor(username: string, message?: string) {
        super('resource-already-exists', 'Resource already exists.', `The user ${username} already exists.`, 400, message);
    }
}

export class UserNotExistsError extends ProblemJsonError {
    public constructor(username: string, message?: string) {
        super('resource-not-exists', 'Resource doesnt exist.', `The user ${username} doesnt exist.`, 404, message);
    }
}

export class BadRequestError extends ProblemJsonError {
    public constructor(details: string,message?: string) {
        super('bad-request', 'Bad request', details, 400, message);
    }
}


export class PathNotFoundError extends ProblemJsonError {
    public constructor(path: string, message?: string) {
        super('unknown-resource', 'The requested resource does not exist.', `The resource ${path} does not exist.`, 404, message);
    }
}

export class InternalServerError extends ProblemJsonError {
    public constructor(message?: string) {
        super('internal-server-error', 'Internal Server Error', 'Please contact developer.', 500, message);
    }
}
