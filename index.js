const express = require("express");
const axios = require("axios");
const { urlencoded } = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

// Create an instance of Express
const app = express();
const port = 8000; // You can change the port number if needed

//airstack package import
const { init, fetchQuery } = require("@airstack/node");
init("1ab32911bc41b4eef9087e7b8ed71b19d");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(bodyParser.json());

// Define a route
app.get("/", (req, res) => {
  res.send("Sybil Daddy Backend Running!");
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

//Getting UserId / Fid from Wallet Address Airstack
const getUserID = async (fid) => {
  console.log(fid, "address UserId get ");
  try {
    const query = `query MyQuery {
            Socials(
              input: {
                filter: {
                  dappName: { _eq: farcaster }
                  identity: { _eq: "${fid}" } 
                }
                blockchain: ethereum
              }
            ) {
              Social {
                userId
              }
            }
          }`; // Replace with GraphQL Query

    const { data, error } = await fetchQuery(query);
    console.log(data.Socials.Social[0].userId, "userId fid");
    const userFid = data.Socials.Social[0].userId;
    return userFid;
  } catch (error) {
    console.log(error, "error");
  }
};
//if the fid start with "0x" wallet address it will fetch the Fid 
const fetchUserId = async (fid) => {
  if (fid.startsWith("0x")) {
    console.log(fid, "fid in if statemetn");
    // Call the function to get the userId
    // You need to implement this function to get userId based on fid
    const userId = await getUserID(fid);
    console.log(userId, "userIDdd");
    return userId;
  } else {
    // If fid doesn't start with "0x", return null or handle as appropriate
    return fid;
  }
};
//Api endpoint to get all analysis
app.post("/getanalysis", async (req, res) => {
  try {
    const data = req.body.data.data;
    let socialKarma = req.body.social.button
    let aiButton = req.body.ai.button

    console.log(aiButton, "ai button")
    
    const list = [0, 1, 2];
    const pinataKey = process.env.PINATA;
    const edenAi = process.env.EDENAI;

    // Array to store promises for each API call
    const apiPromises = [];

    // Iterate through each object in the data array
    for (const item of data) {
      if (item.fid) {
        // Call function to get userId based on fid
        const userId = await fetchUserId(item.fid);
        if (userId) {
          // Update fid with the new userId value
          item.fid = userId;
        }
      }

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
      const userFidRes = responses[i].data.data.casts[0].fid;
      console.log(userFidRes, "userFidress");

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
      let aiScore = checkResponse.data.sapling.ai_score;
      console.log(aiScore, "old ai score");

      const fidBody = [];
      fidBody.push(userFidRes);

      //karma api social call here
      let totalkarma = 0;

      const karmaSocial = socialKarma;

      if (karmaSocial) {
        //following api
        const response = await axios.post(
          "https://graph.cast.k3l.io/scores/global/following/fids",
          fidBody, // Wrapping the array inside an object
          {
            headers: {
              accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );
        let followingKarma = response.data.result[0].score;

        const responseEngagement = await axios.post(
          "https://graph.cast.k3l.io/scores/global/engagement/fids",
          fidBody, // Wrapping the array inside an object
          {
            headers: {
              accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );

        let engagementKarma = responseEngagement.data.result[0].score;
        totalkarma = followingKarma + engagementKarma;
      }

      console.log(totalkarma, "total karma");
      const originalNumber = totalkarma
      const modifiedNumber = parseFloat(
        originalNumber.toString().slice(0, 2) +
          originalNumber.toString().slice(5)
      );

      if(aiButton && karmaSocial== false){
        aiScore = aiScore
      }

      if(karmaSocial && aiButton == false){
        aiScore = modifiedNumber
      }

      if(karmaSocial && aiButton){
          aiScore = aiScore + modifiedNumber;
      }


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
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
