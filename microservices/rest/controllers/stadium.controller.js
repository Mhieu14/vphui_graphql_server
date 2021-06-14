
import Models from '../../../models/index';
import MessageRes from '../constants/messageres.constant';
import StatusCode from '../constants/statuscode.constant';
import ResponseDtos from '../dtos/response.dto';

export default {
  apiCreateStadium: async (req, res) => {
    const data = req.body;
    const name = data.stadium_name;
    const url = data.url;
    const iframeSrc = data.iframe_src;
    try {
      if (!name || !url || !iframeSrc) {
        return ResponseDtos.createErrorResponse(res, StatusCode.MISSING_PARAM, MessageRes.MISSING_PARAM);
      }
      const newStadium = await new Models.Stadium({
        name,
        url,
        iframeSrc,
        status: 'active',
      }).save();
      return ResponseDtos.createSuccessResponse(res, newStadium);
    } catch (error) {
      console.log(error);
      return ResponseDtos.createErrorResponse(res, StatusCode.SERVER_ERROR, MessageRes.SERVER_ERROR);
    }
  },

  // apiGetDetailStadium: async (req, res) => {
  //   const query = req.query;
  //   const id = query.stadium_id;
  //   try {
  //     if (!id) {
  //       return ResponseDtos.createErrorResponse(res, StatusCode.MISSING_PARAM, MessageRes.MISSING_PARAM);
  //     }
  //     const stadium = Models.Stadium.findOne
  //   } catch (error) {
  //     console.log(error);
  //     return ResponseDtos.createErrorResponse(res, StatusCode.SERVER_ERROR, MessageRes.SERVER_ERROR);
  //   }
  // },

  apiGetListStadium: async (req, res) => {
    try {
      const output = await Models.Stadium.find()
      return ResponseDtos.createSuccessResponse(res, output);
    } catch (error) {
      console.log(error);
      return ResponseDtos.createErrorResponse(res, StatusCode.SERVER_ERROR, MessageRes.SERVER_ERROR);
    }
  }
}