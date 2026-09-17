import express from "express";
import { registerPasswordAuthRoutes } from "./index";

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));
registerPasswordAuthRoutes(app);

export default app;
