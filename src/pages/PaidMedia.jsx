import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PaidMedia() {
  const navigate = useNavigate();
  const [inputType, setInputType] = useState("manual");
  const [url, setUrl] = useState("");
  const [csvContent, setCsvContent] = useState("");
  const [platform, setPlatform] = useState("Facebook");
  const [language, setLanguage] = useState("English UK");
  const [objective, setObjective] = useState("Sales");
  const [lines, setLines] = useState(5);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  // Facebook placements
  const [placements, setPlacements] = useState({
    "Facebook Stories": true,
    "Facebook Reels": true,
    "Facebook Video Feed": true,
  });

  // Google Ads fields
  const [googleFields, setGoogleFields] = useState({
    Headline: true,
    Description: true,
    Path: true,
    Sitelink: true,
  });

  const handlePlacementChange = (placement) => {
    setPlacements((prev) => ({
      ...prev,
      [placement]: !prev[placement],
    }));
  };

  const handleGoogleFieldChange = (field) => {
    setGoogleFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "text/csv") {
      const reader = new FileReader();
      reader.onload = (e) => setCsvContent(e.target.result);
      reader.readAsText(file);
    } else {
      alert("Please upload a valid CSV file.");
    }
  };

  const generatePrompt = (input) => {
    if (platform === "Facebook") {
      // Always include Image Facebook Feed
      const selectedPlacements = [
        "Image Facebook Feed",
        ...Object.entries(placements)
          .filter(([_, checked]) => checked)
          .map(([name]) => name),
      ];

      // Build placement instructions
      const placementInstructions = selectedPlacements
        .map(
          (placement, idx) => `
${idx + 1}. ${placement}
Option 1:
Primary text: [text] ([character count]) 
Headline: [text] ([character count]) 
Option 2:
Primary text: [text] ([character count]) 
Headline: [text] ([character count]) 
...repeat up to Option ${lines}...
`
        )
        .join("\n");

      return `You are a skilled marketing copywriter with expertise in creating compelling ads. You will need to go through the following steps to ensure the exact demands of the input values and provide ${lines} versions of each of the requested outputs.

Input Client:
Please write the ads for ${input} and use the tone of voice of the website and try and use as many of the available characters as listed in the output format

Input Language:
Please write the ads in the correct spelling and grammar of ${language}

Input Key: Marketing Objective
The goal of the ads is: ${objective}

If the objective is Sales, analyze the landing page and extract the following:
- Product name
- Exact price (if unavailable, look for percentage discounts)
- 3 to 5 key features
- Customer benefits
- Any available promotional offers
- Clues about the target audience
- A strong call-to-action

Ensure the extracted information is concise, relevant, and aligned with a persuasive sales tone.


If the objective is Awareness, analyze the landing page and extract the following:
- Brand name and positioning
- Core message or value proposition
- 3 to 5 key themes or topics emphasized
- Emotional tone or storytelling elements
- Target audience cues
- Any slogans, taglines, or memorable phrases
- Soft call-to-action (e.g., “Learn more,” “Explore,” etc.)

Focus on conveying brand identity, recognition, and interest rather than direct conversion.

------

IMPORTANT: Output ONLY the following fields for each placement and each option, in this exact order, with no extra text, no explanations, and no markdown or special formatting. Use plain text only. DO NOT use asterisks, hashes, or any special characters.

For each placement, output ${lines} options, in this format:
${placementInstructions}

Do not include any other text, explanations, or formatting. Do not use asterisks, hashes, or markdown. Use only plain text as shown above.
`;
    } else {
      // Google Ads: Build output fields based on selected checkboxes
      const fields = [];
      if (googleFields.Headline) {
        fields.push(
          "Headline (1): [text] ([character count])",
          "Headline (2): [text] ([character count])"
        );
      }
      if (googleFields.Description) {
        fields.push(
          "Description (1): [text] ([character count])",
          "Description (2): [text] ([character count])"
        );
      }
      if (googleFields.Path) {
        fields.push(
          "Path (1): [text] ([character count])",
          "Path (2): [text] ([character count])"
        );
      }
      if (googleFields.Sitelink) {
        fields.push(
          "SiteLink (1): [text] ([character count])",
          "SiteLink (2): [text] ([character count])"
        );
      }

      return `You are a skilled marketing copywriter with expertise in creating compelling ads. You will need to go through the following steps to ensure the exact demands of the input values and provide ${lines} versions of each of the requested outputs.

Input Client:
Please write the ads for ${input} and use the tone of voice of the website and try and use as many of the available characters as listed in the output format

Input Language:
Please write the ads in the correct spelling and grammar of ${language}

Input Key Marketing Objective:
The objective of the ads is to ${objective}

If it is Sales then you will Extract from the landing page the product name, exact price, 3 to 5 key features, customer benefits, any available offers, target audience cues, and strong call-to-action; if the price is not found, look for a percentage discount

Input Key: Marketing Objective
The goal of the ads is: ${objective}

If the objective is Sales, analyze the landing page and extract the following:
- Product name
- Exact price (if unavailable, look for percentage discounts)
- 3 to 5 key features
- Customer benefits
- Any available promotional offers
- Clues about the target audience
- A strong call-to-action

Ensure the extracted information is concise, relevant, and aligned with a persuasive sales tone.


If the objective is Awareness, analyze the landing page and extract the following:
- Brand name and positioning
- Core message or value proposition
- 3 to 5 key themes or topics emphasized
- Emotional tone or storytelling elements
- Target audience cues
- Any slogans, taglines, or memorable phrases
- Soft call-to-action (e.g., “Learn more,” “Explore,” etc.)

Focus on conveying brand identity, recognition, and interest rather than direct conversion.

-------

Output ONLY the following fields for each ad, in this exact order, with no extra text, no explanations, and no markdown or special formatting. Use plain text only.
Each of the headlines contain up to 30 characters, descriptions up to 90 characters, and paths up to 15 characters.

For each ad, output:
${fields.join('\n')}

Repeat for each ad for ${lines} times. Do not include any other text, explanations, or formatting.

`;
    }
  };

  const handleSubmit = async () => {
    setResult("");
    setLoading(true);

    try {
      const inputs =
        inputType === "csv"
          ? csvContent
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean)
          : [url];

      if (inputType === "csv") {
        // Batch processing for CSV input
        const prompts = inputs.map(generatePrompt);
        const response = await axios.post("https://llm-backend-82gd.onrender.com/api/generate-copy-batch", { prompts }, { headers: { "Content-Type": "application/json" } });
        const allResults = response.data.responses.map((res, i) => `For input: ${inputs[i]}\n${res}\n`);
        setResult(allResults.join("\n=========================\n\n"));
      } else {
        // Manual input (single request)
        const prompt = generatePrompt(url);
        const response = await axios.post("https://llm-backend-82gd.onrender.com/api/generate-copy", { input_text: prompt }, { headers: { "Content-Type": "application/json" } });
        if (response.data.response) {
          setResult(`For input: ${url}\n${response.data.response}\n`);
        } else {
          setResult(`For input: ${url}\nNo output received.\n`);
        }
      }
    } catch (err) {
      setResult("Error generating content.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadXLSX = async () => {
    if (!result || result.trim() === "") {
      alert("No generated content to export.");
      return;
    }

    try {
      setLoading(true);

      // Choose endpoint based on platform
      const endpoint = platform === "Google Ads" ? "https://llm-backend-82gd.onrender.com/api/export-xlsx-google" : "https://llm-backend-82gd.onrender.com/api/export-xlsx";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ llm_output: result }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        alert("Export failed: " + errorText);
        setLoading(false);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = platform === "Google Ads" ? "GoogleAdsCopyFilled.xlsx" : "AdCopyFilled.xlsx";
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export XLSX. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="p-8 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Paid Media Marketing Copy Generator</h1>
        <div className="text-base mt-1">Instructions</div>
        <div className="text-sm">
          <ul className="mt-1 mb-4">
            <li>
              First select the type of input, if selecting CSV for Bulk upload, please download{" "}
              <a className="font-bold" href="https://docs.google.com/spreadsheets/d/1jt1pljedbNNdzBHes-lONTYTTdZvDSrHdhjWatfP6CE/edit?gid=0#gid=0" target="_blank" rel="noopener noreferrer">
                THIS TEMPLATE
              </a>
            </li>
            <li>To download the template: Click on File, Download and than select Comma-separated values (.csv)</li>
            <li>
              Please note that currently the maximum that can be uploaded at once is <strong>70 lines</strong> on the CSV file. If it is more then 70, please use multiple sheets.
            </li>
          </ul>
        </div>
        <div className="mb-4">
          <label className="font-semibold mr-4">Choose Input Type:</label>
          <select className="p-2 border" value={inputType} onChange={(e) => setInputType(e.target.value)}>
            <option value="manual">Manual Input</option>
            <option value="csv">Upload CSV</option>
          </select>
        </div>
        {inputType === "manual" ? (
          <div className="text-sm mt-1">
            Insert Client URL or keyword
            <input className="w-full p-2 border mb-2 mt-2" placeholder="Insert Client URL or keyword" value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
        ) : (
          <div className="border-dashed border-2 border-gray-400 p-6 mb-2 text-center mt-2">
            <input type="file" accept=".csv" onChange={handleFileUpload} className="w-full text-center" />
            <p className="mt-2 text-gray-600">Upload a CSV file containing URLs or keywords.</p>
          </div>
        )}
        <div className="text-sm mt-1">Select a Language</div>
        <select className="w-full p-2 border mb-2" value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option>English UK</option>
          <option>English US</option>
          <option>Italian</option>
          <option>French</option>
        </select>
        <div className="text-sm mt-1">Select the Platform</div>
        <select className="w-full p-2 border mb-2" value={platform} onChange={(e) => setPlatform(e.target.value)}>
          <option>Facebook</option>
          <option>Google Ads</option>
        </select>
        {platform === "Facebook" && (
          <div className="mb-4">
            <label className="block font-semibold mb-1">Select Facebook Placements:</label>
            <div className="ml-2">
              <div>
                <input type="checkbox" checked={true} disabled readOnly />
                <span className="ml-2">Image Facebook Feed (always included)</span>
              </div>
              <div>
                <input type="checkbox" checked={placements["Facebook Stories"]} onChange={() => handlePlacementChange("Facebook Stories")} id="fb-stories" />
                <label htmlFor="fb-stories" className="ml-2">
                  Facebook Stories
                </label>
              </div>
              <div>
                <input type="checkbox" checked={placements["Facebook Reels"]} onChange={() => handlePlacementChange("Facebook Reels")} id="fb-reels" />
                <label htmlFor="fb-reels" className="ml-2">
                  Facebook Reels
                </label>
              </div>
              <div>
                <input type="checkbox" checked={placements["Facebook Video Feed"]} onChange={() => handlePlacementChange("Facebook Video Feed")} id="fb-video-feed" />
                <label htmlFor="fb-video-feed" className="ml-2">
                  Facebook Video Feed
                </label>
              </div>
            </div>
          </div>
        )}
        {platform === "Google Ads" && (
          <div className="mb-4">
            <label className="block font-semibold mb-1">Select Google Ads Fields:</label>
            <div className="ml-2">
              <div>
                <input
                  type="checkbox"
                  checked={googleFields.Headline}
                  onChange={() => handleGoogleFieldChange("Headline")}
                  id="ga-headline"
                />
                <label htmlFor="ga-headline" className="ml-2">Headline</label>
              </div>
              <div>
                <input
                  type="checkbox"
                  checked={googleFields.Description}
                  onChange={() => handleGoogleFieldChange("Description")}
                  id="ga-description"
                />
                <label htmlFor="ga-description" className="ml-2">Description</label>
              </div>
              <div>
                <input
                  type="checkbox"
                  checked={googleFields.Path}
                  onChange={() => handleGoogleFieldChange("Path")}
                  id="ga-path"
                />
                <label htmlFor="ga-path" className="ml-2">Path</label>
              </div>
              <div>
                <input
                  type="checkbox"
                  checked={googleFields.Sitelink}
                  onChange={() => handleGoogleFieldChange("Sitelink")}
                  id="ga-sitelink"
                />
                <label htmlFor="ga-sitelink" className="ml-2">Sitelink</label>
              </div>
            </div>
          </div>
        )}
        <div className="text-sm mt-1">Type of Marketing Objective</div>
        <select className="w-full p-2 border mb-2" value={objective} onChange={(e) => setObjective(e.target.value)}>
          <option>Sales</option>
          <option>Awareness</option>
        </select>
        <div className="text-sm mt-1">Number of Lines</div>
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
            <svg className="animate-spin h-4 w-4 text-blue-600 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            Working on it…
          </div>
        )}
      </div>
      {result && (
        <div className="mt-2 w-full max-w-3xl mx-auto mb-6">
          <pre className="bg-gray-100 p-6 whitespace-pre-wrap w-full">{result}</pre>
          <button className="mt-2 bg-green-600 text-white px-4 py-2 rounded" onClick={handleDownloadXLSX}>
            Download XLSX
          </button>
        </div>
      )}
    </>
  );
}
