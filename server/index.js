const express = require("express");
const app = require("express")();
const passport = require("passport");
const mongoose = require("mongoose");
const cookieSession = require("cookie-session");
const cors = require("cors");
require("./utils/authUtils");
const authRoutes = require("./routes/authRoutes");
const apiRoutes = require("./routes/apiRoutes");
const checkUser = require("./middlewares/authMiddleware");
const { DatabaseError } = require("./utils/errors/baseErrors");
require("dotenv").config();
const { Server } = require("socket.io");
const { DBManager } = require("./utils/DBManager");
const SessionManager = require("./utils/SessionManager");

const URI = process.env.MONGODB_URI;
const COOKIE_KEYS = process.env.COOKIE_KEYS;
const PORT = process.env.PORT;

app.set("view engine", "ejs");
app.use(express.json());

app.use(
	cookieSession({
		name: "pair-programming",
		maxAge: 60 * 60 * 1000,
		keys: [COOKIE_KEYS],
	})
);

// set up cors to allow us to accept requests from our client
app.use(
	cors({
		origin: "http://localhost:3000", // allow to server to accept request from different origin
		methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
		credentials: true, // allow session cookie from browser to pass through
	})
);

//initilize passport and create a session
app.use(passport.initialize());
/* passport.session() acts as a middleware to alter the req object 
and change the encrypted user value that is currently the session sig 
(from the client cookie) into a user object.
*/
app.use(passport.session());

(async () => {
	try {
		const connection = await mongoose.connect(URI);

		console.log("connected to db");
	} catch (e) {
		console.log(e);
	}
})();

app.listen(PORT, () => {
	console.log("connected to port 4000");
});

app.use("/auth", authRoutes);
//TODO: checkUser middleware implement later
app.use("/api", apiRoutes);

app.get("/", (req, res) => {
	// console.log(req.user);
	res.send("homepage");
});

//error handler should be handled at the end
app.use((err, req, res, next) => {
	// console.log(err);
	if (res.headersSent) {
		return next(err);
	}

	if (err instanceof DatabaseError) {
		res.status(err.statusCode).json(err.message);
	} else {
		res.status(500);
	}
});

const io = new Server(3001, {
    cors: {
        origin: ['http://localhost:3000'],
        methods: ['GET', 'POST']
    }
});

SessionManager(io, new DBManager());