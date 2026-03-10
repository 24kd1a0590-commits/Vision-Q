const express = require("express");
const cors = require("cors");
const editJsonFile = require("edit-json-file");

const app = express();
app.use(cors());
app.use(express.json());

// Initialize the JSON file database
let db = editJsonFile(`${__dirname}/db.json`, { autosave: true });

// If the file is new, create an empty queue
if (!db.get("queue")) {
    db.set("queue", []);
    db.set("tokenCounter", 1);
}

const departments = {
    "101": "General Medicine (OPD)",
    "103": "Orthopedics",
    "104": "Cardiology"
};

app.post("/join", (req, res) => {
    const { name, phone, dept_id, category } = req.body;
    
    let queue = db.get("queue");
    let counter = db.get("tokenCounter");

    const token = "T" + counter;
    
    const newPatient = {
        token,
        name,
        phone,
        dept_id,
        category,
        time: new Date().toISOString()
    };

    queue.push(newPatient);
    
    // Save back to file
    db.set("queue", queue);
    db.set("tokenCounter", counter + 1);

    console.log(`✅ Saved Patient: ${name} with Token: ${token}`);
    res.json({ success: true, token: token });
});

app.get("/get-wait-time", (req, res) => {
    const token = req.query.token;
    const queue = db.get("queue");

    const index = queue.findIndex(p => p.token === token);

    if (index === -1) {
        return res.status(404).json({ error: "Token not found" });
    }

    const wait_minutes = index * 5;

    res.json({
        token: token,
        dept_name: departments[queue[index].dept_id] || "General OPD",
        position: index,
        wait_minutes: wait_minutes
    });
});
// DOCTOR'S API: Remove the first person in the queue (the one being called)
app.post("/call-next", (req, res) => {
    let queue = db.get("queue") || [];
    
    if (queue.length === 0) {
        return res.json({ success: false, message: "Queue is empty!" });
    }

    const calledPatient = queue.shift(); // Removes the first person
    db.set("queue", queue); // Save the updated list back to db.json

    console.log(`👨‍⚕️ Doctor called: ${calledPatient.name} (Token: ${calledPatient.token})`);
    
    res.json({ 
        success: true, 
        nextPatient: calledPatient 
    });
});

// DOCTOR'S API: View the entire current queue
app.get("/view-queue", (req, res) => {
    res.json(db.get("queue") || []);
});

app.listen(3000, () => {
    console.log("🚀 Local Server running at http://localhost:3000");
    console.log("📁 Data is being saved to db.json");
});