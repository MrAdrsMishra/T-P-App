import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import nodemailer from "nodemailer";

dotenv.config({ path: "./.env" });

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// connect database
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`server is running at: ${process.env.PORT}`);
    });

    app.get("/", (req, res) => {
      res.send("hey are u there!");
    });
    app.get('/location',async (_,res)=>{
      const ress= await getLocation();
      console.log(ress)
      res.send(ress )
    })
    app.post("/notify-owner", async (req, res) => {
      const data = req.body;
      console.log("Visitor data:", data);

      const mailOptions = {
        from: `"Placement Engine" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_RECEIVER,
        subject: "Hello from Placement-Engine service!",
        text: `This is a notification since someone has visited your platform.
It looks like you have recently applied somewhere for a job role.
Hope they will consider you 🤞

Visitor info:
Location (user-approved):
Latitude: ${data.latitude}
Longitude: ${data.longitude}
Accuracy: ${data.accuracy} meters

Best of luck!
`,
      };

      try {
        const info = await transporter.sendMail(mailOptions);
        // console.log("Email sent:", info.response);

        res.status(200).json({
          success: true,
          message: "Notification sent successfully",
        });
      } catch (error) {
        console.error("Email error:", error);
        res.status(500).json({
          success: false,
          message: "Error sending notification",
        });
      }
    });
  })
  .catch((error) => {
    console.error(`database connection failed error:${error}`);
    process.exit(0);
  });
