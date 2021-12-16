const mongoose = require("mongoose");
const Document = require("../models/documentModel");
const Session = require("../models/sessionModel");
const { NotFoundError } = require("../utils/errors/databaseFacingErrors");
const ObjectId = mongoose.Types.ObjectId;

const createDocument = async (req, res, next) => {
	const { title, type, question, link, userId, sessionId } = req.body;
	//TODO: add validity checker
	//TODO: check if link is valid -> ask fetcher team

	try {
		//TODO: check session id exists here if not throw error
		const document = await Document.create({
			title,
			type,
			question,
			link,
			userId,
			sessionId,
		});

		const documentObj = { documentId: document._id, title };
		//TODO: don't send document as response -> socket stuff ask SUBODH
		//TODO: check to see if session id exists
		const session = await Session.findByIdAndUpdate(
			sessionId,
			{
				$addToSet: { documents: documentObj },
			},
			{ new: true }
		);

		res.json(session).status(200);
	} catch (e) {
		console.log(e.message);
		res.status(403).json(e.message);
	}
};

const getDocument = async (req, res, next) => {
	const _id = req.params.id;
	if (!ObjectId.isValid(_id))
		return next(new NotFoundError("no document with id found"));

	try {
		const documentInfo = await Document.findById(_id);

		if (!documentInfo)
			return next(
				new NotFoundError("no document found with given document id")
			);

		res.json(documentInfo).status(200);
	} catch (e) {
		console.log(e);
		res.json(e).status(500);
	}
};

const updateDocument = async (req, res, next) => {
	const _id = req.params.id;
	if (!ObjectId.isValid(_id))
		return next(new NotFoundError("invalid document id"));

	const { savedCode } = req.body;

	try {
		const document = await Document.findByIdAndUpdate(
			_id,
			{ savedCode },
			{ new: true }
		);

		res.json(document).status(200);
	} catch (e) {
		console.log(e);
		res.status(500).json(e);
	}
};

const deleteDocument = async (req, res, next) => {
	const _id = req.params.id;
	if (!ObjectId.isValid(_id))
		return next(new NotFoundError("invalid document id"));

	try {
		const deletedDocument = await Document.findByIdAndDelete(_id);
		console.log(deletedDocument);
		const { sessionId } = deletedDocument;
		// TODO: delete from the session as well

		const session = await Session.findByIdAndUpdate(
			sessionId,
			{
				//can use the dot notation to access documentId -> { "documents.documentId" : deletedDocument._id }
				$pull: { documents: { documentId: deletedDocument._id } },
			},
			{ new: true, safe: true }
		);

		console.log(session);
		res.status(202).json("document deleted");
	} catch (e) {
		console.log(e);
		res.json(e).status(500);
	}
};

module.exports = {
	createDocument,
	getDocument,
	updateDocument,
	deleteDocument,
};
