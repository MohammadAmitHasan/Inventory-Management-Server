const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000;

// Using middleware
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Nasah Inventory Management Server is Running')
})

app.listen(port, () => {
    console.log(`Nasah Inventory Management Server is Up and Running on ${port}`)
})