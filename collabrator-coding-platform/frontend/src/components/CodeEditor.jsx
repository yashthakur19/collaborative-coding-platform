import Editor from "@monaco-editor/react";
import {useState,useEffect, useRef} from "react";
import socket from "../utils/socket";


function CodeEditor({roomId}){
    const [code, setCode] = useState("//start coding here...");
    const [language, setLanguage] = useState("javascript");
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    
    const fileInputRef = useRef(null);

    const runCode = async () => {
      setIsRunning(true);
      setOutput("Running code...");
      try {
        const res=await fetch("http://localhost:5000/run", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ code, language })
        });
        const data = await res.json();
        if (res.ok) {
           setOutput(data.output !== undefined ? data.output : JSON.stringify(data));
        } else {
           setOutput((data.error || "Error") + ": " + JSON.stringify(data.details || ""));
        }
      } catch (err) {
        setOutput(err.message || "Error connecting to execution server");
      }
      setIsRunning(false);
    };

    const handleChange=(value)=>{
      setCode(value);
      socket.emit("code-change",{roomId,code:value});
    };

    const handleLanguageChange=(e)=>{
      const newLang=e.target.value;
      setLanguage(newLang);
      socket.emit("language-change",{roomId, language:newLang});
    }

    const handleFileUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const text = evt.target.result;
          setCode(text);
          socket.emit("code-change", { roomId, code: text });
          
          const ext = file.name.split('.').pop().toLowerCase();
          const extMap = {
            js: 'javascript', jsx: 'javascript',
            py: 'python',
            java: 'java',
            cpp: 'cpp', c: 'cpp'
          };
          if (extMap[ext] && extMap[ext] !== language) {
            setLanguage(extMap[ext]);
            socket.emit("language-change", { roomId, language: extMap[ext] });
          }
        };
        reader.readAsText(file);
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    };

    useEffect(() => {
    socket.on("code-update", (newCode) => {
      setCode(newCode);
    });
    socket.on("language-changed", (newLang) => {
      setLanguage(newLang);
    });
    return () => {
      socket.off("code-update");
      socket.off("language-changed");
    };
  }, []);

    return(
      <div className="editor-container" style={{height:"100%"}}>  
        <div className="toolbar glass-panel" style={{padding: "10px 1.5rem"}}>
          <div style={{display: "flex", gap: "10px", alignItems: "center"}}>
            <select onChange={handleLanguageChange} value={language} style={{width: "150px", marginBottom: 0}}>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>
            
            <div className="file-upload-wrapper">
              <button className="btn" style={{background: "var(--panel-border)"}}>
                📄 Upload File
              </button>
              <input type="file" accept=".js,.py,.cpp,.c,.java,.txt" onChange={handleFileUpload} ref={fileInputRef} />
            </div>
          </div>
          
          <button className="btn btn-success" onClick={runCode} disabled={isRunning}>
            {isRunning ? "⏳ Running..." : "▶ Run Code"}
          </button>
        </div>

        <div className="monaco-wrapper">
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={handleChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'Fira Code', monospace",
              padding: { top: 16 }
            }}
          />
        </div>

        <div className="terminal-output">
          <div style={{color: "var(--text-secondary)", marginBottom: "8px", borderBottom: "1px solid var(--panel-border)", paddingBottom: "5px"}}>Terminal Output</div>
          {output}
        </div>
      </div>
    );
}
export default CodeEditor;