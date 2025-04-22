import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PaidMedia() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState("Facebook");
  const [language, setLanguage] = useState("English UK");
  const [objective, setObjective] = useState("Sales");
  const [lines, setLines] = useState(5);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    let prompt = "";

    // Clear the previous result and show loader
    setResult("");
    setLoading(true);

    if (platform === "Facebook") {
      prompt = You are a skilled marketing copywriter with expertise in creating compelling ads. You will need to go through the following steps to ensure the exact demands of the input values and provide ${lines} versions of each of the requested outputs.

Input Client:
Please write the ads for ${url} and use the tone of voice of the website and try and use as many of the available characters as listed in the output format

Input Language:
Please write the ads in the correct spelling and grammar of ${language}

Input Key Marketing Objective:
The objective of the ads is to ${objective}

If it is Sales then you will sell the product to the user and should contain as much direct information about the product.
If it is Awareness then you will generate awareness for the product.

#########

Facebook prompt:
1. Hook/Opening Line: Must capture attention quickly within the primary text
2. Do not exceed the character limit below in the output format
3. Compliance: No exaggerated claims or anything that cannot be found on the provided URL, if pricing is available please include this in the primary text.

**Output Format**
Provide the following formats below clearly annotating which ad text is for the placement

1. Image Facebook Feed
Primary text: 50-150 characters
Headline: 27 characters

2. Facebook Stories
Primary text: 125 characters
Headline: 40 characters

3. Facebook Reels
Primary text: 72 characters
Headline: 10 characters

4. Facebook Video Feed
Primary text: 50-150 characters
Headline: 27 characters;
    } else if (platform === "Google Ads") {
      prompt = You are a skilled marketing copywriter with expertise in creating compelling ads. You will need to go through the following steps to ensure the exact demands of the input values and provide ${lines} versions of each of the requested outputs.

Input Client:
Please write the ads for ${url} and use the tone of voice of the website and try and use as many of the available characters as listed in the output format

Input Language:
Please write the ads in the correct spelling and grammar of ${language}

Input Key Marketing Objective:
The objective of the ads is to ${objective}

If it is Sales then you will sell the product to the user and should contain as much direct information about the product.
If it is Awareness then you will generate awareness for the product.

#########

Google Ads prompt:
1. Hook/Opening Line: Must capture attention quickly within the headlines
2. Do not exceed the character limit below in the output format
3. Compliance: No exaggerated claims or anything that cannot be found on the provided URL, if pricing is available please include this in the primary text.

**Output Format**
Headline (1): 30 characters
Headline (2): 30 characters
Description (1): 90 characters
Description (2): 90 characters
Path (1): 15 characters 
Path (2): 15 characters 

Copy paste output:
Provide a short paragraph on the reason why this ad copy has been selected followed by a table clearly outlining the output format and suggestions. Please include the number of characters, including spaces, in brackets after each response.
;
    }

    try {
      const response = await axios.post(
        "https://llm-backend-82gd.onrender.com/api/generate-copy",
        { input_text: prompt },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.response) {
        setResult(response.data.response);
      } else {
        setResult("No output received from the backend.");
      }
    } catch (err) {
      setResult("Error generating content.");
    } finally {
      setLoading(false);
    }
  };

// Robust Export: Supports Facebook & Google Ads formats with different parsers

const handleFacebookCSV = () => {
  const lines = result.split("\n").map(line => line.trim()).filter(Boolean);
  const rows = [["Placement", "Primary Text", "Headline"]];

  let currentPlacement = "";
  let primary = "";
  let headline = "";

  for (let line of lines) {
    const placementMatch = line.match(/^\*\*\d+\.\s*(.*?)\*\*$/);
    if (placementMatch) {
      currentPlacement = placementMatch[1];
      continue;
    }

    if (/^\*Version \d+:\*/i.test(line)) continue;

    const primaryMatch = line.match(/^-?\s*Primary text:\s*(.+)$/i);
    if (primaryMatch) {
      primary = primaryMatch[1].trim();
      continue;
    }

    const headlineMatch = line.match(/^-?\s*Headline:\s*(.+)$/i);
    if (headlineMatch) {
      headline = headlineMatch[1].trim();
      if (currentPlacement && primary && headline) {
        rows.push([currentPlacement, primary, headline]);
        primary = "";
        headline = "";
      }
    }
  }

  return downloadAsCSV(rows, "facebook-ads.csv");
};

const handleGoogleCSV = () => {
  const lines = result.split("\n").map(line => line.trim()).filter(Boolean);
  const rows = [["Ad Variation", "Headline 1", "Headline 2", "Description 1", "Description 2", "Path 1", "Path 2"]];

  let variation = 1;
  let h1 = "";
  let h2 = "";
  let d1 = "";
  let d2 = "";
  let p1 = "";
  let p2 = "";

  for (let line of lines) {
    // Match lines like '| Headline (1)  | Discover Gleneagles            | (23)       |'
    const cellMatch = line.match(/^\|\s*(Headline \(1\)|Headline \(2\)|Description \(1\)|Description \(2\)|Path \(1\)|Path \(2\))\s*\|\s*(.*?)\s*\|/i);
    if (cellMatch) {
      const label = cellMatch[1].toLowerCase();
      const value = cellMatch[2].trim();

      if (label === "headline (1)") h1 = value;
      if (label === "headline (2)") h2 = value;
      if (label === "description (1)") d1 = value;
      if (label === "description (2)") d2 = value;
      if (label === "path (1)") p1 = value;
      if (label === "path (2)") p2 = value;

      if (h1 && h2 && d1 && d2 && p1 && p2) {
        rows.push([
          Variation ${variation++},
          h1,
          h2,
          d1,
          d2,
          p1,
          p2
        ]);
        h1 = h2 = d1 = d2 = p1 = p2 = "";
      }
    }
  }

  return downloadAsCSV(rows, "google-ads.csv");
};

const handleDownloadCSV = () => {
  if (!result.trim()) {
    alert("No response to export.");
    return;
  }

  if (platform === "Facebook") {
    handleFacebookCSV();
  } else if (platform === "Google Ads") {
    handleGoogleCSV();
  }
};

const downloadAsCSV = (rows, filename) => {
  if (rows.length <= 1) {
    alert("No valid rows to export.");
    return;
  }

  const csvContent =
    "data:text/csv;charset=utf-8," +
    rows.map(row => row.map(field => "${field.replace(/"/g, '""')}").join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Paid Media Marketing Copy Generator</h1>

      <input className="w-full p-2 border mb-2" placeholder="Client URL or keyword" value={url} onChange={(e) => setUrl(e.target.value)} />

      <select className="w-full p-2 border mb-2" value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option>English UK</option>
        <option>English US</option>
        <option>Italian</option>
        <option>French</option>
      </select>

      <select className="w-full p-2 border mb-2" value={platform} onChange={(e) => setPlatform(e.target.value)}>
        <option>Facebook</option>
        <option>Google Ads</option>
      </select>

      <select className="w-full p-2 border mb-2" value={objective} onChange={(e) => setObjective(e.target.value)}>
        <option>Sales</option>
        <option>Awareness</option>
      </select>

      <select className="w-full p-2 border mb-2" value={lines} onChange={(e) => setLines(Number(e.target.value))}>
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={15}>15</option>
      </select>

      <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleSubmit} disabled={loading}>
        Generate
      </button>
      <button className="ml-2 bg-gray-500 text-white px-4 py-2 rounded" onClick={() => navigate("/")}>
        ← Back
      </button>

      {loading && (
        <div className="inline-flex items-center gap-2 text-blue-600 font-medium mt-2">
          <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          Working on it…
        </div>
      )}

      {result && (
        <div className="mt-4">
          <pre className="bg-gray-100 p-4 whitespace-pre-wrap">{result}</pre>
          <button className="mt-2 bg-green-600 text-white px-4 py-2 rounded" onClick={handleDownloadCSV}>
            Download CSV
          </button>
        </div>
      )}
    </div>
  );
}
