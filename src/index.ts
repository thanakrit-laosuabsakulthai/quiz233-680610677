import express, { Router, type Request, type Response } from "express";

// import routes
import itemsRoutes from "./routes/itemsRoutes.ts";
import usersRoutes from "./routes/usersRoutes.ts";


// import middlewares
import morgan from "morgan";
import invalidJsonMiddleware from "./middlewares/invalidJsonMiddleware.ts";
import notFoundMiddleware from "./middlewares/notFoundMiddleware.ts";

const app = express();
const port = 3000;

// body parser middleware
app.use(express.json());

// logger middleware
app.use(morgan("dev"));
// app.use(morgan("combined"));

app.use(invalidJsonMiddleware);

// Endpoints
app.get("/", (req: Request, res: Response) => {
	res.send("Quiz #2 - API service");
});

app.get("/me", (req: Request, res: Response) => {
	res.status(200).json({
		success: true,
		message: "Quiz #2 - API service",
	});
});

app.get("/studentInfo", (req: Request, res: Response) => {
	res.status(200).json({
		success: true,
		message: "Student Information",
		data: {
			firstName: "Thanakrit",
			lastName: "Laosuabsakulthai",
			studentId: 680610677,
			section: "001",
		},
	});
});

app.use("/api/v677/items", itemsRoutes);
app.use("/api/v677/auth", usersRoutes);

app.use(notFoundMiddleware);

app.listen(port, () => {
	console.log(`🚀 Server running on http://localhost:${port}`);
});

// Export app for vercel deployment
export default app;
