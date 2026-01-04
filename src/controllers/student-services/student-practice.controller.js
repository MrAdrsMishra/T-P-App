import { ApiResponse } from "../../utils/ApiResponse.js";

export const runCode = async (req, res) => {
  try {
    const req_data = req.body;
    const response = fetch('http://localhost:3000/v1/practice/run-code',{
      headers:{
        "content-type":'application/json'
      }, 
      body:JSON.stringify(req_data)});
      console.log(response.JSON());
      return res.status(200).json(
        new ApiResponse(200,response.JSON(),"compiled successfully")
      );
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: err.message });
  }
};
