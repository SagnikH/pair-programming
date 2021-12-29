import React, { useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import styles from "../styles/sessionWrapper.module.css";
import { fetchSessionById } from "../redux/slices/sessionSlice";
import { Outlet, useParams } from "react-router-dom";
import Loading from "../components/Loading";
import Error404 from "./Error404";
import { io } from "socket.io-client";

const URL = "http://localhost:3001";
const SESSION_INIT = "session init";
const CLIENT_DISCONNECTED = "client disconnected";
const CLIENT_CONNECTED = "client connected";

export default function SessionWrapper() {
	const dispatch = useDispatch();
	const { id } = useParams();

	const userId = useSelector((state) => state.user._id);
	const sessionStatus = useSelector((state) => state.session.status);
	const [socket, setSocket] = useState(null);
	const [connected, setConnected] = useState(false);

	useEffect(() => {
		console.log("New Session", id);
		console.log("userId", userId);
		const socket = io(URL, { auth: { userId, sessionId: id } });
		setSocket(socket);
		socket.onAny((event, ...args) => console.log(event, args));
		socket.on("connect", () => {
			console.log("Connected!");
			setConnected(true);
		});
		socket.on("disconnect", (reason) => {
			console.log("disconnected:", reason);
			setConnected(false);
		});

		socket.on(SESSION_INIT, (data) => {
			console.log("session init", data);
		});

		return () => {
			console.log("session cleanup");
			if (socket) {
				if (socket.connected) socket.disconnect();
				socket.offAny(); // remove all event listeners
			}
			setConnected(false);
		};
	}, []);

	useEffect(() => {
		console.log("useEffect -> [Session]");
		console.log("fetching session data....");
		dispatch(fetchSessionById(id));
	}, []);

	if (sessionStatus === "loading" || !connected) {
		console.log("loading");
		return <Loading />;
	} else if (sessionStatus === "failed") {
		console.log("error failed");
		return <Error404 />;
	} else if (sessionStatus === "succeeded") {
		return (
			<div className="d-flex">
				<div className={styles.main}>
					<Outlet />
				</div>
				<div className={styles.videocall}></div>
			</div>
		);
	} else {
		return <h1> Potential bug in Session</h1>;
	}
}
