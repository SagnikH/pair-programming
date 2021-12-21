import styles from "../styles/sessions.module.css";
import docsData from "../assets/docsData.json";

import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Dropdown, Form, Button } from "react-bootstrap";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { fetchSessionById } from "../redux/slices/sessionSlice";
import Loading from "../components/Loading";
import Error404 from "./Error404";

const Sessions = () => {
	const [sessionName, setSessionName] = useState("");
	const [docs, setDocs] = useState([]);
	const [qtype, setQtype] = useState("");
	// const user = useSelector((state) => state.user);
	const error = useSelector((state) => state.session.error);
	const sessionStatus = useSelector((state) => state.session.status);
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const { id } = useParams();

	const dummyDocs = docs.map((el) => {
		return (
			<div href="/sessions" className={styles.historyItems}>
				<a key={el.sessionId}>
					<div>Id: {el.sessionId}</div>
					<div>Created at: {el.cretedAt}</div>
					<div>Question title: {el.questionTitle}</div>
				</a>
			</div>
		);
	});

	// setDocs(docsData);

  //problem, must fetch everytime a page is loaded
	// useEffect(() => {
	// 	console.log("useEffect -> [Session]");

	// 	if (sessionStatus === "idle") {
	// 		console.log("fetching session data....");
	// 		dispatch(fetchSessionById(id));
	// 	}
	// }, [sessionStatus, dispatch]);

	useEffect(() => {
		console.log("useEffect -> [Session]");

		// if (sessionStatus === "idle") {
		console.log("fetching session data....");
		dispatch(fetchSessionById(id));
		// }
	}, []);

	const handleClick = (e) => {
		if (e.target.text === "Leetcode Question") setQtype("leetcode");
		else if (e.target.text === "Custom Question") setQtype("custom");
	};

	if (sessionStatus === "loading") {
		console.log("loading");
		return <Loading />;
	} else if (sessionStatus === "failed") {
		console.log("error failed");
		return <Error404 />;
	} else if (sessionStatus === "succeeded") {
		return (
			<>
				<div className={styles.body}>
					<p>{id}</p>
					<div className={styles.sessionName}>Session name: {sessionName}</div>
					<div className={styles.sessionContainer}>
						<div className={styles.sessionHistory}>
							<div>
								<div className={styles.historyHeading}>Documents History</div>
							</div>

							<div>{dummyDocs}</div>
						</div>
						<div className={styles.form}>
							<Dropdown className="mb-5">
								<Dropdown.Toggle
									className={styles.formButton}
									id="dropdown-basic"
								>
									Create new doc
								</Dropdown.Toggle>

								<Dropdown.Menu>
									<Dropdown.Item onClick={handleClick}>
										Leetcode Question
									</Dropdown.Item>
									<Dropdown.Item onClick={handleClick}>
										Custom Question
									</Dropdown.Item>
								</Dropdown.Menu>
							</Dropdown>
							<div>
								{qtype === "custom" && (
									<Form className="d-flex flex-column align-items-center">
										<Form.Group className="mb-3" controlId="formBasicEmail">
											<Form.Label>Enter Title</Form.Label>
											<Form.Control
												className={styles.input}
												type="text"
												placeholder="Enter title"
											/>
										</Form.Group>
										<Form.Group className="mb-3" controlId="formBasicEmail">
											<Form.Label>Enter Question</Form.Label>
											<Form.Control as="textarea" rows={8} cols={50} />
										</Form.Group>

										<Button className={styles.formButton} type="submit">
											Create Doc
										</Button>
									</Form>
								)}
							</div>
							<div>
								{qtype === "leetcode" && (
									<Form className="d-flex flex-column align-items-center">
										<Form.Group className="mb-3" controlId="formBasicEmail">
											<Form.Label>Enter Leetcode Question Link</Form.Label>
											<Form.Control
												className={styles.input}
												type="text"
												placeholder="Enter link"
											/>
										</Form.Group>

										<Button className={styles.formButton} type="submit">
											Create Doc
										</Button>
									</Form>
								)}
							</div>
						</div>
					</div>
				</div>
			</>
		);
	} else {
		return <h1>possible bug</h1>;
	}
};

export default Sessions;