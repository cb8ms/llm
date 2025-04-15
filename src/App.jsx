import axios from "axios";
import React, { useState } from "react";

export default function App() {
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState("English");
  const [objective, setObjective] = useState("Sales");
  const [lines, setLines] = useState(3);
  const [result, setResult] = useState("");

  const handleSubmit = async () => {
    const prompt = `Generate ${lines} lines of marketing copy for ${url || "this keyword"} in ${language}, with the goal of ${objective.toLowerCase()}.`;

    try {
      const response = await axios.post("https://llm-backend-82gd.onrender.com/api/generate-copy", {
        prompt,
      });

      // Ensure you update the result with the correct response data
      if (response.data.output) {
        setResult(response.data.output);
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
      <input className="w-full p-2 border mb-2" placeholder="Client URL or keyword" value={url} onChange={(e) => setUrl(e.target.value)} />
      <select className="w-full p-2 border mb-2" value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option>English</option>
        <option>Italian</option>
        <option>Portuguese</option>
      </select>
      <select className="w-full p-2 border mb-2" value={objective} onChange={(e) => setObjective(e.target.value)}>
        <option>Sales</option>
        <option>Awareness</option>
      </select>
      <input type="number" className="w-full p-2 border mb-2" value={lines} onChange={(e) => setLines(e.target.value)} />
      <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleSubmit}>
        Generate
      </button>
      <pre className="mt-4 bg-gray-100 p-4">{result}</pre>
    </div>
  );
}
