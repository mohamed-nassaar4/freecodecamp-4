const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')
const { json } = require('express/lib/response')
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  username: String,
  count: Number,
  log: [{
    description: String,
    duration: Number,
    date: Date
  }]
}, { strict: false });
let Users = mongoose.model('users', userSchema);



app.use(cors())
app.use(express.static('public'))
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', async (req, res) => {
  try {
    // console.log(req.body)
    let createUser = new Users({
      username: req.body.username
    })
    await createUser.save()
    let userList = await Users.find({ username: req.body.username });
    // console.log(userList[0]._id)
    res.json({
      username: userList[0].username,
      _id: userList[0]._id
    })
  } catch (e) {
    console.log(e)
  }
})

app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    console.log(req.body, req.params)
    let { description, duration, date } = req.body
    _id = req.params._id || req.body[':_id']
    let count = 1
    let checkUserLog = await Users.find({ _id: _id })
    // console.log(checkUserLog)
    checkUserLog = checkUserLog[0]

    count = checkUserLog.log.length + count
    // console.log(count, '2cccccc');


    if (!date) {
      date = new Date().toDateString()
    }

    let updateUser = await Users.findByIdAndUpdate(_id, {
      count: count,
      $push: { "log": { "description": description, "duration": duration, "date": new Date(date).toDateString() } }
    }
      , {
        returnOriginal: false
      })
    console.log(updateUser, 'upppp')
    res.json({
      username: updateUser.username,
      description: description,
      duration: parseInt(duration),
      date: new Date(date).toDateString(),
      _id: _id
    })
  } catch (e) {
    console.log(e)
  }
})

app.get('/api/users', async (req, res) => {
  try {

    Users.find().then(data => {
      data.forEach(elem => {
        elem = elem.toObject()
        if (elem.log.length > 0) {
          elem.log.forEach(logs => {
            // logs.duration=7
            logs.date = new Date(logs.date).toDateString();
            // console.log(typeof logs.date)
          })

        }
      }
      )
      res.send(data)
    }
    ).catch(e => console.log(e))

  } catch (e) {
    console.log(e)
  }
})

app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    console.log(req.query, 'ssddss',req.params)
    let limit =  parseInt(req.query.limit)
    if (req.query.from && req.query.to) {
      Users.find({
        _id: req.params._id, "log.date": {
          $gte: `${req.query.from}T00:00:00.000Z`,
          $lte:`${req.query.to}T23:59:59.000Z`,
          

        }
      }, { "log._id": 0, __v: 0}).limit(limit).then(data => {

        // console.log(data)
        if (data.length > 0) {
          data[0] = data[0].toObject()
          if (data[0].log.length > 0) {
            data[0].log.forEach(logs => {
              logs.date = new Date(logs.date).toDateString();
              // console.log(logs.date)
            })
            // console.log(data[0].log[0].date,'ggggggg');
          }
          data=data[0]
          let obj = {
            username: data.username,
            count: data.count,
            _id: data._id,
            log: data.log
          }
          
            console.log(limit,'ssss');
            limit=obj.log.length-limit
            if(limit>0){
             obj.log.splice(limit)
          }
         
          console.log(obj)
          return res.json(obj)
        }else {
          return res.json([])
        }
       
      })
    } else {
      Users.findById(req.params._id, { "log._id": 0, __v: 0 }).then(data => {
        data = data.toObject()
        // console.log(data)
        if (data.log.length > 0) {
          data.log.forEach(logs => {
            logs.date = new Date(logs.date).toDateString();
            // console.log(logs.date)
          })
          // console.log(logData[0]);
        }
        // console.log(data)
        let obj = {
          username: data.username,
          count: data.count,
          _id: data._id,
          log: data.log
        }
          console.log(limit,'ssss');
            limit=obj.log.length-limit
            if(limit>0){
             obj.log.splice(limit)
          }
        return res.json(obj)
      })
    }


  } catch (e) {
    console.log(e)
  }
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
