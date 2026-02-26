import httpStatus from "http-status";
import bcrypt from "bcrypt";
import { Counter } from "../models/counter.model.js";
import { Room } from "../models/room.model.js";
import { User } from "../models/user.model.js";

const NUMERIC_PASSWORD_LENGTH = 10; // 8-12 allowed; using 10 by default

const generateNumericPassword = (len = NUMERIC_PASSWORD_LENGTH) => {
  let s = "";
  for (let i = 0; i < len; i++) s += Math.floor(Math.random() * 10);
  return s;
};

const nextMeetingId = async () => {
  // Use only $inc to avoid Mongo conflict of $inc + $setOnInsert on the same field
  const doc = await Counter.findOneAndUpdate(
    { _id: "meeting" },
    { $inc: { next: 1 } },
    { upsert: true, new: true }
  );
  return `meetspot${doc.next}`; // no padding
};

// POST /api/v1/meetings/create
// body: { token }
const createMeeting = async (req, res) => {
  try {
    const { token } = req.body || {};
    if (!token) return res.status(httpStatus.BAD_REQUEST).json({ message: "token required" });

    const user = await User.findOne({ token });
    if (!user) return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid token" });

    const meetingId = await nextMeetingId();
    const password = generateNumericPassword();
    const passwordHash = await bcrypt.hash(password, 10);

    await Room.create({ meetingId, passwordHash, hostUsername: user.username });

    // Return raw password only at creation time
    return res.status(httpStatus.CREATED).json({ meetingId, password });
  } catch (e) {
    // Handle race condition on unique meetingId by retrying once
    if (e?.code === 11000) {
      try {
        const meetingId = await nextMeetingId();
        const password = generateNumericPassword();
        const passwordHash = await bcrypt.hash(password, 10);
        await Room.create({ meetingId, passwordHash, hostUsername: (await User.findOne({ token: req.body.token }))?.username || "unknown" });
        return res.status(httpStatus.CREATED).json({ meetingId, password });
      } catch (err) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: `Could not create meeting: ${err}` });
      }
    }
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: `Something went wrong ${e}` });
  }
};

// POST /api/v1/meetings/join
// body: { meetingId, password }
const joinMeeting = async (req, res) => {
  try {
    const { meetingId, password } = req.body || {};
    if (!meetingId || !password) return res.status(httpStatus.BAD_REQUEST).json({ message: "meetingId and password are required" });

    const room = await Room.findOne({ meetingId });
    if (!room) return res.status(httpStatus.NOT_FOUND).json({ message: "Meeting not found" });

    const ok = await bcrypt.compare(password, room.passwordHash);
    if (!ok) return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid password" });

    return res.status(httpStatus.OK).json({ ok: true, meetingId });
  } catch (e) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: `Something went wrong ${e}` });
  }
};

export { createMeeting, joinMeeting };