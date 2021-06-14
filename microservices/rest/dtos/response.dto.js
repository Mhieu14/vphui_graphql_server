exports.createOutput = (statusCode, error = null, data = null) => ({ statusCode, error, data });

exports.createSuccessResponse = (res, data) => res.status(200).send({ error: null, data });

exports.createErrorResponse = (res, statusCode, error) => res.status(statusCode).send({ error, data: null });

exports.isSuccess = (output) => output && output.statusCode && output.statusCode >= 200 && output.statusCode < 400;
