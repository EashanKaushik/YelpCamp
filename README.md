### Including a .env file
### Sample .env file

Port=3002
IP=0.0.0.0
Geocoder= (geocoder api)

For generating google api You need to set a billing accout and create two API keys(Javascript api).

1. Geocoder api
The first api key should be unrestricted and after generating it add it to .env file. 
2. Map api
This api should be restricted.
Go to views > campgrounds > show.ejs

At line 269 add your Map api key.


### MongoDB

Create MongoDB cluster here https://www.mongodb.com/cloud/atlas.
After creatring cluster follow path Connect > Connect Your Application > Copy connect link. In app.js replace 'Your mongodb cluster link here' with the generated link.

mongoose.Promise = global.Promise;
mongoose.connect('Your mongodb cluster link here',{useNewUrlParser: true, useUnifiedTopology: true
}).then(() => console.log("Database connected!"))
    .catch((err) => console.log("Database error: " + err.message));
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

