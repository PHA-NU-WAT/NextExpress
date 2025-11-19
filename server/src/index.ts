import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import { Request, Response, NextFunction } from "express";

// Routers
import authRoutes from "./routes/auth.routes";
import teacherRoutes from "./routes/teachers.routes";
import studentRoutes from "./routes/students.routes";
import classroomRoutes from "./routes/classroom.routes";
import curriculumRoutes from "./routes/curriculums.routes";
import enrollRoutes from "./routes/enroll.routes";
import evaluationRoutes from "./routes/evaluation.routes";

const SESSION_SECRET = process.env.SESSION_SECRET || "HelloBabyBoys";
const app = express();
const port = 4000;

app.use(
  cors({
    origin: [
      "http://125.27.241.61",
      "http://125.27.241.61:3000",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 10,
    },
  })
);

// Mount Routers
app.use("/api", authRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/classroom", classroomRoutes);
app.use("/api/curriculums", curriculumRoutes);
app.use("/api/enroll", enrollRoutes);
app.use("/api/evaluation", evaluationRoutes);

// Test route
app.get("/", (_req, res) => {
  res.send("✅ API alive!");
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Error handler
app.use(
  (err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong" });
  }
);

// Start server
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Server is running on http://0.0.0.0:${port}`);
});

process.on("SIGINT", () => {
  console.log("Shutting down server...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
