
import Models from '../../../models/index';

export default {
	createNoti: async (userId, notificationType, notificationTypeId) => {
		try {
			let newNotification = await Models.Notification({
				user: userId,
				[notificationType.toLowerCase()]: notificationTypeId,
			}).save();
			return newNotification
		} catch (error) {
			console.log(error);
			throw error;
		}
	}
}