const express = require('express');
const axios = require('axios');
const saveToFirestore = require('./save_to_firestore.js'); // Import the saveToFirestore module

const app = express();
const port = 8095;

// GitHub API endpoint to list closed issues (replace 'owner' and 'repo' with your GitHub repository details)
const githubApiEndpoint = 'https://api.github.com/repos/nodejs/node/issues';

// Route to fetch closed issues since a specific date
app.get('/retrieve-closed-issues', async (req, res) => {
    const targetDate = req.query.targetDate;
  
    try {
      // Fetch issues from GitHub API
      const closedIssues = await fetchClosedIssuesUntilDate(githubApiEndpoint, targetDate);
      console.log("Issues since ",targetDate," successfully fetched from github.");

      // Save data to Firestore using the saveToFirestore function
      await saveToFirestore(closedIssues);
      console.log("closed issues successfully updated in firestore.");
  
      res.json("closed issues successfully updated in firestore.");
    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).send('Internal Server Error');
    }
  });

// Function to fetch closed issues until a specific date
async function fetchClosedIssuesUntilDate(apiEndpoint, targetDate) {
  let page = 1;
  let cutoff = 0;
  let issues = [];
  let issuesOnOrBeforeCutoff = []

  while (true) {
    const url = `${apiEndpoint}?state=closed&page=${page}`;
    try {
      const response = await axios.get(url);

      // Check if the response is empty or if the issues array is already beyond the target date
      if (response.data.length === 0 || new Date(response.data[response.data.length - 1].closed_at) < new Date(targetDate)) {
        cutoff++;
      }

      // Concatenate the new issues to the existing array
      issues = issues.concat(response.data);

      if (cutoff === 1){
        break;
      }

      // Increment the page number for the next request
      page++;
    } catch (error) {
      console.error('Error fetching issues:', error.message);
      break;
    }
  }

  console.log("Before cutting length: ", issues.length);

  // Filter issues to keep only those on or before the cutoff date
  issuesOnOrBeforeCutoff = issues.filter(issue =>
    new Date(issue.closed_at) >= new Date(targetDate)
  );
  console.log("after cutting length: ", issuesOnOrBeforeCutoff.length);

  return issuesOnOrBeforeCutoff;
}



app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
