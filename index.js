const express = require('express');
const cors = require('cors');
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000
require('dotenv').config()


// middleware 
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nuk8vmz.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const usersCollection = client.db('eduStayDB').collection('users')
        const collegesCollection = client.db('eduStayDB').collection('colleges')
        const admissionCollection = client.db('eduStayDB').collection('admission')
        const ratingCollection = client.db('eduStayDB').collection('rating')

        // const indexKeys = { name: 1 }
        // const indexOptions = { name: 'collegTitle' }
        // const result = await collegesCollection.createIndex(indexKeys, indexOptions)


        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existsUser = await usersCollection.findOne(query)
            if (existsUser) {
                return res.send({ message: 'user alerady exists' })
            }
            const result = await usersCollection.insertOne(user)
            res.send(result)
        })

        app.get('/user/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const result = await usersCollection.findOne(query)
            res.send(result)
        })
        app.put('/user-update/:id', async (req, res) => {
            const id = req.params.id
            const body = req.body
            const query = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    name: body.name,
                    photo: body.photo
                }
            }
            const result = await usersCollection.updateOne(query, updateDoc)
            res.send(result)
        })


        app.get('/colleges', async (req, res) => {
            const result = await collegesCollection.find().sort({ rating: -1 }).toArray()
            res.send(result)
        })

        app.get('/colleges/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: parseInt(id) }
            const result = await collegesCollection.findOne(query)
            res.send(result)
        })


        app.get('/college-search/:text', async (req, res) => {
            const searchText = req.params.text
            const result = await collegesCollection.find({
                $or: [
                    { collegeName: { $regex: searchText, $options: "i" } }
                ],
            }).toArray()
            res.send(result)
        })

        app.post('/my-college', async (req, res) => {
            const college = req.body
            const result = await admissionCollection.insertOne(college)
            res.send(result)
        })

        app.get('/my-college/:email', async (req, res) => {
            const email = req.params.email;
            // const query = {email:email}
            const result = await admissionCollection.findOne({ email: email })
            res.send(result)
        })

        app.get('/all-review', async (req, res) => {
            const cursor = ratingCollection.find().sort({ createdAt: -1 }).limit(20)
            const result = await cursor.toArray()
            res.send(result)
        })



        app.post('/review-college', async (req, res) => {
            const userReview = req.body
            userReview.createdAt = new Date()
            const insertResult = await ratingCollection.insertOne(userReview)

            // const reviews = await ratingCollection.find({ college: userReview.college }).toArray();
            // console.log(reviews, 'reviews');
            // const numofreview = reviews.length;
            // console.log(numofreview, 'number of reviews');

            // const totalRating = reviews.reduce((acc, review) => acc + Number(review.rating), 0);
            // console.log('totalRating : ', totalRating);
            // const rating = totalRating / numofreview;
            // console.log('averageRating: ', rating);

            // const updateResult = await collegesCollection.updateOne(
            //     { _id: userReview.college },
            //     {
            //         $et: {
            //             numofreview,
            //             rating: rating.toFixed(2),
            //         }
            //     }
            // )
            // res.send({ insertResult, updateResult })
            res.send(insertResult)
        })



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Edu Stay app running...')
})


app.listen(port, () => {
    console.log(`Edu Stay Server is running on Port : ${port}`);
})