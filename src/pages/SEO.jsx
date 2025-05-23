// /components/SEO.js
import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SEO() {
  const navigate = useNavigate();
  const [inputType, setInputType] = useState("manual");
  const [url, setUrl] = useState("");
  const [brand, setBrand] = useState("");
  const [screenSize, setscreenSize] = useState("Desktop");
  const [pKeyword, setPkeyword] = useState("");
  const [sKeyword, setsKeyword] = useState("");
  const [csvContent, setCsvContent] = useState("");
  const [language, setLanguage] = useState("English UK");
  const [lines, setLines] = useState(5);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [csvRows, setCsvRows] = useState([]);

  function parseCsvLine(line) {
    const result = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "text/csv") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const lines = e.target.result
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(Boolean);
        const [headerLine, ...rows] = lines;
        const headers = parseCsvLine(headerLine).map((h) => h.trim().toLowerCase());
        const expectedHeaders = ["url", "primary keyword", "secondary keyword", "brand"];
        const headerIndices = expectedHeaders.map((h) => headers.indexOf(h));

        if (headerIndices.includes(-1)) {
          alert("CSV is missing one or more required columns: URL, Primary Keyword, Secondary Keyword, Brand.");
          return;
        }

        const parsedRows = rows.map((row) => {
          const values = parseCsvLine(row);
          const rowData = {};
          expectedHeaders.forEach((header, i) => {
            rowData[header] = values[headerIndices[i]] || "";
          });
          return {
            url: rowData["url"],
            pKeyword: rowData["primary keyword"],
            sKeyword: rowData["secondary keyword"],
            brand: rowData["brand"],
          };
        });

        setCsvRows(parsedRows);
      };
      reader.readAsText(file);
    } else {
      alert("Please upload a valid CSV file.");
    }
  };

  const generatePrompt = ({ url, pKeyword, sKeyword, brand }) => {
    const basePrompt = `You are an SEO expert in writing metadata and you will need to go through the following steps to ensure the exact demands of the input values and provide ${lines} versions of each of the requested outputs:

- URL: ${url}
- Primary Keyword: ${pKeyword}
- Secondary Keyword(s): ${sKeyword}
- Brand: ${brand}

Using the ${url} as the website URL for Tone of Voice.

Please provide me with ${screenSize.toLowerCase()} friendly ${lines} page titles in ${language} that don't exceed a maximum length of ${screenSize === "desktop" ? "55-65 characters or approximately 580px" : "60-75 characters or approximately 580px"} wide also for Meta descriptions don't exceed a maximum length of ${screenSize === "desktop" ? "150-160 characters or approximately 920px" : "120-130 characters or approximately 680px"} wide.

Write the titles and meta descriptions for the ${brand} by using the ${pKeyword} as the primary Keyword but also ${sKeyword} as your secondary Keyword(s), in a way that will entice the user to click through including the brand in the meta description but not in the title. Please include the number of characters, including spaces, in brackets after each response.

Ensure that the most important information is included first in both titles and descriptions so that if search engines truncate these, the right context is still provided to users.

Page titles should also use a hyphen (-) separator rather than a pipe (|) separator.

When providing the output, say: For input: ${pKeyword} and then provide the rest of the output.`;
    return basePrompt;
  };

  const handleSubmit = async () => {
    setResult("");
    setLoading(true);
    setProgress({ current: 0, total: 0 });
    try {
      const inputs = inputType === "csv" ? csvRows : [{ url, pKeyword, sKeyword, brand }];
      setProgress({ current: 0, total: inputs.length });
      const allResults = [];
      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        const prompt = generatePrompt(input);
        const response = await axios.post("https://llm-backend-82gd.onrender.com/api/generate-copy", { input_text: prompt }, { headers: { "Content-Type": "application/json" } });
        if (response.data.response) {
          allResults.push(`For input: ${input.url}\n${response.data.response.replace(/\*\*\*/g, "###").replace(/\*\*/g, "")}\n`);
        } else {
          allResults.push(`For input: ${input.url}\nNo output received.\n`);
        }
        setProgress((prev) => ({ ...prev, current: i + 1 }));
      }
      setResult(allResults.join("\n=========================\n\n"));
    } catch (err) {
      setResult("Error generating content.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    // Sanitize the result by removing unwanted "###" characters
    const sanitizedResult = result.replace(/###/g, "");

    const blocks = sanitizedResult.split("\n=========================\n\n").filter(Boolean);
    const csvRows = [];

    blocks.forEach((block) => {
      const lines = block.split("\n").filter(Boolean); // Split block into lines
      lines.forEach((line) => {
        const safe = line.replace(/"/g, '""'); // Escape double quotes for CSV
        csvRows.push(`"${safe}"`); // Add each line as a separate row
      });
    });

    // Add BOM to ensure proper encoding
    const csvContent = "\uFEFF" + csvRows.join("\n");
    const encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "marketing-copy.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">SEO Marketing Copy Generator</h1>
      <div className="mb-4">
        <label className="font-semibold mr-4">Choose Input Type:</label>
        <select className="p-2 border" value={inputType} onChange={(e) => setInputType(e.target.value)}>
          <option value="manual">Manual Input</option>
          <option value="csv">Upload CSV</option>
        </select>
      </div>
      {inputType === "manual" ? (
        <>
          <input className="w-full p-2 border mb-2" placeholder="Insert Client URL" value={url} onChange={(e) => setUrl(e.target.value)} />
          <input className="w-full p-2 border mb-2" placeholder="Insert Primary keyword" value={pKeyword} onChange={(e) => setPkeyword(e.target.value)} />
          <input className="w-full p-2 border mb-2" placeholder="Insert Secondary keywords.(If more then one,use comma to separate them)" value={sKeyword} onChange={(e) => setsKeyword(e.target.value)} />
          <input className="w-full p-2 border mb-2" placeholder="Insert Client Brand name here" value={brand} onChange={(e) => setBrand(e.target.value)} />
        </>
      ) : (
        <div className="border-dashed border-2 border-gray-400 p-6 mb-2 text-center">
          <input type="file" accept=".csv" onChange={handleFileUpload} className="w-full text-center" />
          <p className="mt-2 text-gray-600">Upload a CSV file containing URLs or keywords.</p>
        </div>
      )}

      <select className="w-full p-2 border mb-2" value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option>English UK</option>
        <option>English US</option>
        <option>Italian</option>
        <option>French</option>
        <option>German</option>
      </select>

      <select className="w-full p-2 border mb-2" value={screenSize} onChange={(e) => setscreenSize(e.target.value)} required>
        <option value="desktop">Desktop</option>
        <option value="mobile">Mobile</option>
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
          Working on it… ({progress.current}/{progress.total})
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
