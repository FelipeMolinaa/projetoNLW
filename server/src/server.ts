import express from 'express'

const app = express();

app.get("/users", (request, response) => {
    

    response.json(["fellipe","suzana","maria"])
})

app.listen(3333)