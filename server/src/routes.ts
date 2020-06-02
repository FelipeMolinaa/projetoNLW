import express from 'express'

const routes = express.Router();

routes.get("/users", (request, response) => {
    
    return response.json({message: "ola mundo"})
})

export default routes