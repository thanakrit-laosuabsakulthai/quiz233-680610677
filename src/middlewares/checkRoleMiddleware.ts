import { type Request, type Response, type NextFunction } from "express";
import { type CustomRequest, type User } from "../libs/types.js";

import { zUserId } from "../libs/zodValidators.js";

export const checkRoleMiddleware = (
	req: CustomRequest,
	res: Response,
	next: NextFunction
) => {
	// get payload and token from (custom) request
	// check if userid in params matches the userId in the payload
	
	const { user_id_in_params } = req.params;
	const { user } = req;
	
	// validate user_id_in_params using zod
	const validationResult = zUserId.safeParse(user_id_in_params);
	if (!validationResult.success) {
		return res.status(403).json({
			success: false,
			message: "Forbidden access",
		});
	}
	
	if (user && user.userId !== user_id_in_params) {
		return res.status(403).json({
			success: false,
			message: "Forbidden access",
		});
	}
	
	next();
};