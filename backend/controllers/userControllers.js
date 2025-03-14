import httpStatus from "http-status";
import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { Meeting } from "../models/meetingModel.js";

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User Not Found" });
    }

    let isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (isPasswordCorrect) {
      let token = crypto.randomBytes(20).toString("hex");

      user.token = token;
      await user.save();
      return res.status(httpStatus.OK).json({ token: token });
    } else {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "Invalid Username or Password" });
    }
  } catch (e) {
    return res.status(500).json({ message: `Something went wrong ${e}` });
  }
};

const register = async (req, res) => {
  const { name, username, password } = req.body;

  try {
    const userExist = await User.findOne({ username });

    if (userExist) {
      return res
        .status(httpStatus.FOUND)
        .json({ message: "User already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name: name,
      username: username,
      password: hashPassword,
    });

    await newUser.save();

    res.status(httpStatus.CREATED).json({ message: "User registered" });
  } catch (e) {
    res.json({ message: `Something went wrong ${e}` });
  }
};

const addTOHistory = async (req, res) => {
  const { token, meeting_code } = req.body;

  try {
    const user = await User.findOne({ token: token });

    const newMeeting = new Meeting({
      user_id: user.username,
      meetingCode: meeting_code,
    });

    await newMeeting.save();

    res.status(httpStatus.CREATED).json({ message: "Added code to history" });
  } catch (e) {
    res.json({ message: `Something went wrong`, e });
  }
};

const getToUserHistory = async (req, res) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({ token: token });
    const meetings = await Meeting.find({ user_id: user.username });
    res.json(meetings);
  } catch (e) {
    res.json({ message: "Something went wrong", e });
  }
};

export { login, register, addTOHistory, getToUserHistory };
