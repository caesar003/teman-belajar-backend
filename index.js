const express = require("express");
const app = express();
const port = process.env.PORT || 3002;

app.get("/", (req, res) => {
    res.send("This is working");
});

app.listen(port, () => console.log(`App is running on port: ${port}`));
