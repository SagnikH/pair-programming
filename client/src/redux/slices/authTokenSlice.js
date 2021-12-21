import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
	token: null,
	status: "idle",
	error: null,
};

export const fetchToken = createAsyncThunk(
	"auth/fetchToken",

	async (slug, { rejectWithValue }) => {
		try {
			const res = await axios.get("http://localhost:4000/api/user", {
				withCredentials: true,
			});

			const user = res.data.user;

			const actionPayload = JSON.stringify(user);

			console.log("data from authToken thunk", actionPayload);
			return actionPayload;
		} catch (e) {
			console.log("error in authToken thunk", e.response);

			return rejectWithValue(e.response.status);
		}
	}
);

export const authSlice = createSlice({
	name: "auth",
	initialState,

	reducers: {
		removeToken: () => initialState,
	},

	extraReducers: (builder) => {
		builder.addCase(fetchToken.pending, (state) => {
			state.status = "loading";
		});

		builder.addCase(fetchToken.fulfilled, (state, action) => {
			state.token = action.payload;
			state.status = "succeeded";
		});

		builder.addCase(fetchToken.rejected, (state, action) => {
			// state = initialState;
			for (const [key, value] of Object.entries(initialState)) {
				state[key] = value;
			}

			state.status = "failed";

			if (action.payload) {
				// Being that we passed in ValidationErrors to rejectType in `createAsyncThunk`, the payload will be available here.
				state.error = action.payload.errorMessage;
			} else {
				state.error = action.error.message;
			}
		});
	},
});

export const { addToken, removeToken } = authSlice.actions;

export default authSlice.reducer;