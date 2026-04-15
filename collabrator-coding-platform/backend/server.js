const express=require("express");
const cors= require("cors");
const http=require("http");
const { Server } = require("socket.io");
const axios=require("axios");

const app=express();

app.use(cors());
app.use(express.json());
const rooms={};
const server=http.createServer(app);

const io=new Server(server,{
    cors: {
        origin: "*"
    }
});

io.on("connection",(socket)=>{
  
  socket.on("language-change", ({ roomId, language }) => {
    socket.to(roomId).emit("language-changed", language);
  });
  socket.on("join-voice", ({ roomId, peerId }) => {
    socket.to(roomId).emit("user-connected-voice", peerId);
  });
  socket.on("send-message",({roomId, message, username})=>{
    io.to(roomId).emit("receive-message", { message, username });
  });
  socket.on("join-room", ({ roomId, username }) => {

    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }

    rooms[roomId].push({
      id: socket.id,
      username: username
    });

    io.to(roomId).emit("user-list", rooms[roomId]);
  });

  socket.on("disconnect", () => {

    for (const roomId in rooms) {

      rooms[roomId] = rooms[roomId].filter(
        user => user.id !== socket.id
      );

      io.to(roomId).emit("user-list", rooms[roomId]);
    }

    });
});

const { exec, spawn } = require('child_process');
const fs = require('fs');
const crypto = require('crypto');

app.post("/run", async (req, res) => {
    const { code, language } = req.body;
    
    // We execute code locally since public APIs restrict access
    const runLocal = (cmd, args, sourceFile, sourceCode) => {
        return new Promise((resolve) => {
            if (sourceFile) {
                fs.writeFileSync(sourceFile, sourceCode);
            }
            
            const process = spawn(cmd, args);
            let output = '';
            let error = '';
            
            process.stdout.on('data', data => output += data.toString());
            process.stderr.on('data', data => error += data.toString());
            
            // Timeout after 10 seconds
            const timeoutId = setTimeout(() => {
                process.kill();
                resolve(`Error: Execution timed out (10s limit). Output so far:\n${output}`);
            }, 10000);

            process.on('close', code => {
                clearTimeout(timeoutId);
                // Clean up file if needed
                if (sourceFile && fs.existsSync(sourceFile)) {
                    try { fs.unlinkSync(sourceFile); } catch(e){}
                }
                if (error) resolve(output ? output + "\n" + error : error);
                else resolve(output || "No output\n(Executed Successfully)");
            });
            
            process.on('error', err => {
                clearTimeout(timeoutId);
                if (sourceFile && fs.existsSync(sourceFile)) {
                   try { fs.unlinkSync(sourceFile); } catch(e){}
                }
                resolve(`Failed to start '${cmd}'. Is ${cmd} installed on your system?\nError: ${err.message}`);
            });
        });
    };

    try {
        const id = crypto.randomUUID();
        let output = "";

        if (language === "javascript") {
            const fileName = `temp_${id}.js`;
            output = await runLocal("node", [fileName], fileName, code);
        } else if (language === "python") {
            const fileName = `temp_${id}.py`;
            output = await runLocal("python", [fileName], fileName, code);
        } else if (language === "java") {
            // Java needs class Main usually.
            const fileName = `Main.java`;
            fs.writeFileSync(fileName, code);
            output = await new Promise(resolve => {
                exec(`javac ${fileName}`, (err, stdout, stderr) => {
                    if (err || stderr) {
                        if (fs.existsSync(fileName)) fs.unlinkSync(fileName);
                        resolve(stderr || err.message);
                    } else {
                        exec(`java Main`, (err2, stdout2, stderr2) => {
                            if (fs.existsSync(fileName)) fs.unlinkSync(fileName);
                            if (fs.existsSync("Main.class")) fs.unlinkSync("Main.class");
                            resolve(stdout2 || stderr2 || "No output\n(Executed Successfully)");
                        });
                    }
                });
            });
        } else if (language === "cpp") {
            const fileName = `temp_${id}.cpp`;
            const exeName = process.platform === "win32" ? `temp_${id}.exe` : `temp_${id}`;
            fs.writeFileSync(fileName, code);
            output = await new Promise(resolve => {
                exec(`g++ ${fileName} -o ${exeName}`, (err, stdout, stderr) => {
                    if (err || stderr) {
                        if (fs.existsSync(fileName)) fs.unlinkSync(fileName);
                        resolve(stderr || err.message);
                    } else {
                        exec(process.platform === "win32" ? `${exeName}` : `./${exeName}`, (err2, stdout2, stderr2) => {
                            if (fs.existsSync(fileName)) fs.unlinkSync(fileName);
                            if (fs.existsSync(exeName)) fs.unlinkSync(exeName);
                            resolve(stdout2 || stderr2 || "No output\n(Executed Successfully)");
                        });
                    }
                });
            });
        } else {
            output = `Language ${language} is not supported by this local execution engine.`;
        }

        res.json({ output });
    } catch (error) {
        console.error("ERROR running code:", error);
        res.status(500).json({ error: "Execution failed", details: error.message });
    }
});

app.get("/",(req,res)=>{
    res.send("server is running");
});

server.listen(5000,()=>{
    console.log("server is running on port 5000");
});