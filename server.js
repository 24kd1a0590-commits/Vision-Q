const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let queue = [];
let tokenCounter = 1;

const departments = {
    101: "General Medicine (OPD)",
    103: "Orthopedics",
    104: "Cardiology"
};

app.post("/join", (req, res) => {
    const { name, phone, dept_id, category } = req.body;

    const token = "T" + tokenCounter++;

    const patient = {
        token,
        name,
        phone,
        dept_id,
        category,
        time: new Date()
    };

    queue.push(patient);

    res.json({
        success: true,
        token: token
    });
});

app.get("/get-wait-time", (req, res) => {

    const token = req.query.token;

    const index = queue.findIndex(p => p.token === token);

    if(index === -1){
        return res.json({error:"Token not found"});
    }

    const position = index;
    const wait_minutes = position * 5;

    res.json({
        token: token,
        dept_name: departments[queue[index].dept_id],
        position: position,
        wait_minutes: wait_minutes
    });

});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});