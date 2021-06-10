import jwt from 'jsonwebtoken';
import MessageRes from '../constants/messageres.constant';
import StatusCode from '../constants/statuscode.constant';
import ResponseDtos from '../dtos/response.dto';

export const authorizationToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization;
        const decoded = await jwt.verify(token, process.env.SECRET);
        req.authUser = decoded;
        next();
    } catch (error) {
        return ResponseDtos.createErrorResponse(res, StatusCode.UNAUTHORIZED, MessageRes.UNAUTHORIZED)
    }
}