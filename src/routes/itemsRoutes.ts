import { Router, type Request, type Response } from "express";
// import Zod validators
import {
	zUserId,
	zItemId,
	zItemPostBody,
	zItemPutBody,
	zItemDeleteBody
} from "../libs/zodValidators.js";
// import types
import type { Item, CustomRequest } from "../libs/types.ts";
// import database
import { items, users } from "../db/db.ts";
//import uuid
import { v4 as uuidv4 } from 'uuid';

// import authentication middleware
import { authenticateToken } from "../middlewares/authenMiddleware.ts";
import { checkRoleMiddleware } from "../middlewares/checkRoleMiddleware.ts";

const router = Router();

// GET /api/vXXX/items/:userId 
router.get("/:userId", authenticateToken, checkRoleMiddleware, (req: CustomRequest, res: Response) => {
	try {
		// check if user exists
		const user_id_in_params = req.params.userId as string;
		const user = users.find((u) => u.userId === user_id_in_params);
		
		if (!user) {
			return res.status(404).json({
				success: false,
				message: `item for user ID ${user_id_in_params} not found`,
			});
		}
		
		// get user items
		
		const userItems = items.filter((item) => item.userId === user_id_in_params);
		
		if (userItems.length === 0) {
			return res.status(404).json({
				success: false,
				message: `items for user ID ${user_id_in_params} not found`,
			});
		}
		
		return res.status(200).json({
			success: true,
			data: userItems,
		});
	} catch (err) {
		return res.status(500).json({
			success: false,
			message: "Something is wrong, please try again",
			error: err,
		});
	}
});

// POST /api/vXXX/items/:userId, body = {new item data}
// add a new Item for userId
router.post("/:userId", authenticateToken, checkRoleMiddleware, (req: CustomRequest, res: Response) => {
	try {
	
	const user_id_in_params = req.params.userId as string;
	const itemData = req.body as Item;
	
	// validate body using zod
	const validationResult = zItemPostBody.safeParse(itemData);
	if (!validationResult.success) {
		return res.status(400).json({
			success: false,
			message: "Invalid request body",
			error: validationResult.error.issues[0].message,
		});
	}
	
	// generate a new itemId using uuid
	const newItemId = uuidv4();
	
	let filledItem: Item = {
		userId: user_id_in_params,
		itemId: newItemId,
		product_name: itemData.product_name,
		unit_price: itemData.unit_price,
		quantity: itemData.quantity,
		category: itemData.category,
	};
	
	// push filledItem to items array
	items.push(filledItem);
	
	res.status(201).json({
		success: true,
		message: "New item has been added successfully",
		data: filledItem,
	});
	
	
	} catch (err) {
		return res.status(500).json({
			success: false,
			message: "Something is wrong, please try again",
			error: err,
		});
	}
});

// Delete /api/vXXX/items/:userId

router.delete("/:userId/:itemId", authenticateToken, checkRoleMiddleware, (req: CustomRequest, res: Response) => {
	const user_id_in_params = req.params.userId as string;
	const body = req.body as { itemId: string };

	// validate body using zod
	const validationResult = zItemDeleteBody.safeParse(body);
	if (!validationResult.success) {
		return res.status(400).json({
			success: false,
			message: "Invalid request body",
			error: validationResult.error.issues[0].message,
		});
	}
	
	// check if item exists for the user
	const itemIndex = items.findIndex((item) => item.userId === user_id_in_params && item.itemId === body.itemId);
	
	if (itemIndex === -1) {
		return res.status(404).json({
			success: false,
			message: `There are no items with item ID ${body.itemId} for user ID ${user_id_in_params} not found`,
		});
	}
	
	// get the item
	const itemToDelete = items[itemIndex];
	
	// remove the item from items array
	items.splice(itemIndex, 1);
	
	return res.status(200).json({
		success: true,
		message: `Item ID ${body.itemId} for user ID ${user_id_in_params} has been deleted successfully`,
		data: itemToDelete,
	});
	
});


export default router;