const express = require("express");
const axios = require("axios");
const { urlencoded } = require("express");
const { log } = require("@tensorflow/tfjs");
const bodyParser = require("body-parser");
require("dotenv").config();

// Create an instance of Express
const app = express();
const port = 8000; // You can change the port number if needed

const pinataKey = process.env.PINATA;
const edenAi = process.env.EDENAI;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(bodyParser.json());

// Define a route
app.get("/", (req, res) => {
  res.send("Sybil Daddy Backend Running!");
});
// Define a route to handle the /karma/test endpoint
app.get("/karma/test", async (req, res) => {
  try {
    // Make a GET request to the Kanye West quote API
    const response = await axios.get("https://api.kanye.rest/");

    // Extract the quote from the response data
    const quote = response.data.quote;

    // Send the quote as the response
    res.json({ quote });
  } catch (error) {
    // If there's an error, send an error response
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/karma/following", async (req, res) => {
  try {
    // Extract the body from the request
    const { body } = req;
    console.log("Received array:", body);

    // Make a POST request to the specified URL with the provided body
    const response = await axios.post(
      "https://graph.cast.k3l.io/scores/global/following/fids",
      body, // Wrapping the array inside an object
      {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    // Send the response data as JSON
    res.json(response.data);
  } catch (error) {
    // If there's an error, send an error response
    console.error("Error:", error.response.data);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.post("/karma/engagement", async (req, res) => {
  try {
    // Extract the body from the request
    const { body } = req;
    console.log("Received array:", body);

    // Make a POST request to the specified URL with the provided body
    const response = await axios.post(
      "https://graph.cast.k3l.io/scores/global/engagement/fids",
      body, // Wrapping the array inside an object
      {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    // Send the response data as JSON
    res.json(response.data);
  } catch (error) {
    // If there's an error, send an error response
    console.error("Error:", error.response.data);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/pinata/cast/:id", async (req, res) => {
  try {
    const fid = req.params.id;

    const options = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${pinataKey}`,
      },
    };

    // Make a POST request to the specified URL with the provided body
    const response = await axios.get(
      `https://api.pinata.cloud/v3/farcaster/casts?fid=${fid}&pageSize=1`,
      options // Wrapping the array inside an object
    );

    // Send the response data as JSON
    res.json(response.data.data.casts[0].content);
  } catch (error) {
    // If there's an error, send an error response
    console.error("Error:", error.response.data);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/check", async (req, res) => {
  try {
    // Extract the body from the request
    const { text } = req.body;

    console.log(text, "text");

    // Options for Axios request
    const options = {
      method: "POST",
      url: "https://api.edenai.run/v2/text/ai_detection",
      headers: {
        authorization: `Bearer ${edenAi}`,
      },
      data: {
        providers: "sapling",
        text: text,
        fallback_providers: "",
      },
    };

    // Making the Axios request
    const response = await axios.request(options);

    // Logging the response data
    console.log("Response from API:", response.data);

    // Send the response data as JSON
    res.json(response.data.sapling.ai_score);
  } catch (error) {
    // If there's an error, send an error response
    console.error("Error:", error.response.data);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/pinata/score/:id", async (req, res) => {
  try {
    const fid = req.params.id;

    //   const pinataKey = process.env.PINATA

    const options = {
      method: "GET",
      headers: {
        //   Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI0ZDYxYWQyYi1kZTRhLTRhYmEtOGZlMS1jMjY0N2NmNGM1ZTAiLCJlbWFpbCI6Im5pa2hpbHBuMzYwQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfSx7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI4NTkzNmI2NDc4MzVlMTlkMDlhYSIsInNjb3BlZEtleVNlY3JldCI6IjQ0YzUwNWJhZGNkYjk3ZmM5NDYyNDc2NGUyNGI4ZjBjYzM4NTY2NDA4NjQ1ZWNkYWFiYTQxMTIxZGY4MWNhMmEiLCJpYXQiOjE3MTEyNTMyMTB9.Vm94RqG_pO3COOllmwYji4t1AUaPqV4ckRh517UmCpU",
        Authorization: `Bearer ${pinataKey}`,
      },
    };

    // Make a GET request to the Pinata API
    const response = await axios.get(
      `https://api.pinata.cloud/v3/farcaster/casts?fid=${fid}&pageSize=1`,
      options
    );

    // Extract content from the Pinata API response
    const content = response.data.data.casts[0].content;

    // Options for the check API request
    const edenAi = process.env.EDENAI;
    const checkOptions = {
      method: "POST",
      url: "https://api.edenai.run/v2/text/ai_detection",
      headers: {
        //   Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNWFjOTVkMmItMjQxOC00MDZhLTg3OTgtYjhkY2E2YjdlZjM1IiwidHlwZSI6ImFwaV90b2tlbiJ9.vaF6ZtDPGZAv38yVgmIWuSwj1_UnhrQxbqZitaJ6sB4",
        Authorization: `Bearer ${edenAi}`,
      },
      data: {
        providers: "sapling",
        text: content, // Use the content from Pinata API response
        fallback_providers: "",
      },
    };

    // Make a POST request to the check API
    const checkResponse = await axios.request(checkOptions);

    // Extract the relevant data from the check API response
    const aiScore = checkResponse.data.sapling.ai_score;

    // Send the AI score as JSON response
    res.json({ ai_score: aiScore });
  } catch (error) {
    // If there's an error, send an error response
    console.error("Error:", error.response.data);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Function to calculate the score
function calculate_score(airdrop_initial_score, ai_score) {
  // Weight for airdrop initial score (adjust as needed)
  const airdrop_weight = 0.6;
  // Weight for AI score (adjust as needed)
  const ai_weight = 0.4;

  // Normalize AI score to be in the range [0, 100]
  const normalized_ai_score = ai_score * 100;

  // Combine the scores with the respective weights
  let combined_score =
    airdrop_initial_score * airdrop_weight + normalized_ai_score * ai_weight;

  // Ensure the combined score is within the range [1, 100]
  combined_score = Math.max(1, Math.min(100, combined_score));

  return combined_score;
}

app.post("/getanalysis", async (req, res) => {
  try {
    const data = req.body.data.data;
    const pinataKey = process.env.PINATA;
    // const edenAi = process.env.EDENAI;

    // Array to store promises for each API call
    const apiPromises = [];

    // Iterate through each object in the data array
    for (const item of data) {
      const fid = item.fid;
      const options = {
        method: "GET",
        headers: {
          Authorization: `Bearer ${pinataKey}`,
        },
      };

      // Make a GET request to the Pinata API
      const response = axios.get(
        `https://api.pinata.cloud/v3/farcaster/casts?fid=${fid}&pageSize=1`,
        options
      );

      // Add promise to array
      apiPromises.push(response);
    }

    // Wait for all API calls to finish
    const responses = await Promise.all(apiPromises);

    // Iterate through each response
    for (let i = 0; i < responses.length; i++) {
      const content = responses[i].data.data.casts[0].content;

      const checkOptions = {
        method: "POST",
        url: "https://api.edenai.run/v2/text/ai_detection",
        headers: {
          Authorization: `Bearer ${edenAi}`,
        },
        data: {
          providers: "sapling",
          text: content,
          fallback_providers: "",
        },
      };

      // Make a POST request to the check API
      const checkResponse = await axios.request(checkOptions);

      // Extract the AI score
      const aiScore = checkResponse.data.sapling.ai_score;

      // Calculate the combined score
      const combinedScore = calculate_score(
        data[i].airdropInitialScore,
        aiScore
      );

      // Add the combined score to the corresponding fid object
      data[i].revampedScore = combinedScore;
    }

    // Send the modified data array as JSON response
    res.json({ data });
  } catch (error) {
    console.error("Error:", error.response.data);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// app.post("/pinata/score", async (req, res) => {
//     try {
//         const data = req.body.data.data;
//         const pinataKey = process.env.PINATA;
//         const edenAi = process.env.EDENAI;

//         // Array to store promises for each API call
//         const apiPromises = [];

//         // Iterate through each object in the data array
//         for (const item of data) {
//             const fid = item.fid;
//             const options = {
//                 method: "GET",
//                 headers: {
//                     Authorization: `Bearer ${pinataKey}`,
//                 },
//             };

//             // Make a GET request to the Pinata API
//             const response = axios.get(
//                 `https://api.pinata.cloud/v3/farcaster/casts?fid=${fid}&pageSize=1`,
//                 options
//             );

//             // Add promise to array
//             apiPromises.push(response);
//         }

//         // Wait for all API calls to finish
//         const responses = await Promise.all(apiPromises);

//         // Iterate through each response
//         for (let i = 0; i < responses.length; i++) {
//             const content = responses[i].data.data.casts[0].content;

//             const checkOptions = {
//                 method: "POST",
//                 url: "https://api.edenai.run/v2/text/ai_detection",
//                 headers: {
//                     Authorization: `Bearer ${edenAi}`,
//                 },
//                 data: {
//                     providers: "sapling",
//                     text: content,
//                     fallback_providers: "",
//                 },
//             };

//             // Make a POST request to the check API
//             const checkResponse = await axios.request(checkOptions);

//             // Extract the AI score
//             const aiScore = checkResponse.data.sapling.ai_score;

//             //write a caluculate functin here

//             // Add the AI score to the corresponding fid object
//             data[i].revampedScore = aiScore;
//         }

//         // Send the modified data array as JSON response
//         res.json({ data });
//     } catch (error) {
//         console.error("Error:", error.response.data);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// });

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
