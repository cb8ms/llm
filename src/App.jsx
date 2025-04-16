import axios from "axios";
import React, { useState } from "react";

export default function App() {
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState("Facebook");
  const [language, setLanguage] = useState("English UK");
  const [objective, setObjective] = useState("Sales");
  const [lines, setLines] = useState(5);
  const [result, setResult] = useState("");

   const handleSubmit = async () => {
    const prompt = `You are a skilled marketing copywriter with expertise in creating compelling ads. You will need to go through the following steps to ensure the exact demands of the input values and provide ${lines} versions of each of the requested outputs.

Input Client:
Please write the ads for ${url} and use the tone of voice of the website and try and use as many of the available characters as listed in the output format

Input Language:
Please write the ads in the correct spelling and grammar of ${language}



Input Key Marketing Objective:
The objective of the ads is to ${objective}


if it is Sales then you will sell the product to the user and should contain as much direct information about the product
If it is Awareness then you will generate awareness for the product


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
Headline: 27 characters
`;

    try {
      const response = await axios.post(
        "https://llm-backend-82gd.onrender.com/api/generate-copy",
        {
          input_text: prompt,  // Ensure the request has the 'input_text' field
        },
        {
          headers: {
            "Content-Type": "application/json", // Ensure the frontend sends JSON
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
    }
  };
  



  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Marketing Copy Generator</h1>
      <input
        className="w-full p-2 border mb-2"
        placeholder="Client URL or keyword"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <select
        className="w-full p-2 border mb-2"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        <option>English UK</option>
        <option>English US</option>
        <option>Italian</option>
        <option>French</option>
      </select>
      <select
        className="w-full p-2 border mb-2"
        value={platform}
        onChange={(e) => setPlatform(e.target.value)}
      >
        <option>Facebook</option>
        <option>Google</option>
      </select>
      <select
        className="w-full p-2 border mb-2"
        value={objective}
        onChange={(e) => setObjective(e.target.value)}
      >
        <option>Sales</option>
        <option>Awareness</option>
      </select>
      <select
        className="w-full p-2 border mb-2"
        value={lines}
        onChange={(e) => setLines(e.target.value)}
      >
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={15}>15</option>
      </select>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleSubmit}
      >
        Generate
      </button>
      <pre className="mt-4 bg-gray-100 p-4">{result}</pre>
    </div>
  );
}
