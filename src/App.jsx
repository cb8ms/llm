import React, { useState } from "react";
import axios from "axios";

export default function App() {
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("english");
  const [objective, setObjective] = useState("sales");
  const [lines, setLines] = useState(3);
  const [prompt, setPrompt] = useState("Write marketing copy for:");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const fullPrompt = `${prompt}\n\nKeyword or URL: ${input}\nLanguage: ${language}\nObjective: ${objective}\nLines: ${lines}`;

    try {
      const response = await axios.post("http://localhost:5000/generate", {
        prompt: fullPrompt
      });
      setOutput(response.data.result);
    } catch (err) {
      console.error(err);
      setOutput("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-2xl space-y-4">
        <h1 className="text-2xl font-bold">Marketing Copy Generator</h1>

        <input
          type="text"
          placeholder="Enter client URL or keyword"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full p-2 border rounded"
        />

        <div className="flex gap-4">
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="p-2 border rounded w-full">
            <option value="english">English</option>
            <option value="italian">Italian</option>
            <option value="portuguese">Portuguese</option>
          </select>

          <select value={objective} onChange={(e) => setObjective(e.target.value)} className="p-2 border rounded w-full">
            <option value="sales">Sales</option>
            <option value="awareness">Awareness</option>
          </select>
        </div>

        <input
          type="number"
          placeholder="Number of output lines"
          value={lines}
          onChange={(e) => setLines(e.target.value)}
          className="w-full p-2 border rounded"
        />

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full p-2 border rounded"
          rows={3}
        />

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate"}
        </button>

        <div className="mt-4 bg-gray-50 p-4 rounded border min-h-[100px] whitespace-pre-wrap">
          {output}
        </div>
      </div>
    </div>
  );
}
