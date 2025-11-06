import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Admin } from "../models/admin.models.js";
import { Student } from "../models/student.models.js";

const verifyJwt = asyncHandler(async (req, res, next) => {
  // Get the token from cookies or headers
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ message: "No token provided, access denied" });
  }

  try {
    // Decode the token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Check the role and find the user in the appropriate model
    let user;
    if (decodedToken.role === "admin") {
      user = await Admin.findById(decodedToken._id);
    } else if (decodedToken.role === "Student") {
      user = await Student.findById(decodedToken._id);
    } 
    // provede role model not exist
    else {
      return res
      .status(403)
      .json(
        {
        message: "Invalid role, access denied",
        }
    );
    }
    // user not find in specified model
    if (!user) {
      return res
      .status(404)
      .json(
        {
        message: "User not found, access denied",
        }
    );
    }

    // Attach the user and role to the request object
    req.user = user;
    req.role = decodedToken.role;

    next();
  } catch (error) {
    return res
    .status(401)
    .json(
        { 
            message: "Invalid token, access denied" 
        }
    );
  }
});

export default verifyJwt;
