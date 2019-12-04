const Campground           = require("@campgrounds-controllers/campground_model"),
      Comment              = require("@comments-controllers/comment_model"),
      User                 = require("@users-controllers/user_model"),
      mongoose             = require("mongoose"),      
      NodeGeocoder         = require("node-geocoder");

var options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
}; 
var geocoder = NodeGeocoder(options);

// === DATA ===
const campground_name_1 = [
    "Herkimer",
    "Diamond",
    "Sunny",
    "Ventura",
    "Blue Bell",
    "Lakedale",
    "Bend-Sunriver",
    "Grubhof",
    "Alaska Beach",
    "Werner",
    "Holiday",
    "Vacation",
    "Bromford",
    "Atkins",
    "Daikin",
    "Hollow",
    "Leaf",
    "Coconut",
    "Green",
    "Red",
    "Yellow"
];
 
const campground_name_2 = [
    " Cave",
    " Lake",
    " Resort",
    " Campground",
    " RV Park",
    " Meadow",
    " Park",
    " KOA",
    " Forest",
    " Hills",
    " Zone",
    " Perimeter",
    " Cove",
    " Camp",
    " Vortex"
];
 
const campground_desc = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris leo enim, condimentum ut imperdiet at, maximus id lacus. Phasellus ultricies volutpat ipsum, in mattis mi dapibus ac. Integer pellentesque, nibh sed sagittis congue, sapien risus eleifend velit, nec bibendum enim purus ac dui. Aliquam tincidunt turpis at nunc hendrerit, quis commodo nunc finibus. Cras ultricies libero et lacus lacinia sollicitudin. Ut eget suscipit mi. Cras placerat a nulla vitae sagittis. Praesent urna diam, semper eget ligula id, sagittis accumsan justo. Quisque non commodo arcu. Fusce mollis gravida tempor. Maecenas sit amet eros vel sem consectetur viverra. Donec in purus lobortis nunc tempor condimentum. ";
 
const campground_comments = [
        "This place was amazing!",
        "Terrible, I don't recommend it.",
        "Great value for this price!",
        "If you're looking for a campground, check this one out! I highly recommend it!",
        "Awful place, avoid it at all costs.",
        "Great place, though some people that go there should consider taking their trash with themselves...",
        "Looking forward to visit again!",
        "WORST EXPERIENCE OF MY LIFE",
        "Keep scrolling, I'mma randomly generated comment (:",
        "Was fine, have visited better ones tho",
        "I have mixed feelings about this place"
];

const campground_location = [
    "Afghanistan",
    "Albania",
    "Algeria",
    "Andorra",
    "Angola",
    "Antigua and Barbuda",
    "Argentina",
    "Armenia",
    "Australia",
    "Austria",
    "Azerbaijan",
    "The Bahamas",
    "Bahrain",
    "Bangladesh",
    "Barbados",
    "Belarus",
    "Belgium",
    "Belize",
    "Benin",
    "Bhutan",
    "Bolivia",
    "Bosnia and Herzegovina",
    "Botswana",
    "Brazil",
    "Brunei",
    "Bulgaria",
    "Burkina Faso",
    "Burundi",
    "Cabo Verde",
    "Cambodia",
    "Cameroon",
    "Canada",
    "Central African Republic",
    "Chad",
    "Chile",
    "China",
    "Colombia",
    "Comoros",
    "Congo, Democratic Republic of the",
    "Congo, Republic of the",
    "Costa Rica",
    "Côte d’Ivoire",
    "Croatia",
    "Cuba",
    "Cyprus",
    "Czech Republic",
    "Denmark",
    "Djibouti",
    "Dominica",
    "Dominican Republic",
    "East Timor (Timor-Leste)",
    "Ecuador",
    "Egypt",
    "El Salvador",
    "Equatorial Guinea",
    "Eritrea",
    "Estonia",
    "Eswatini",
    "Ethiopia",
    "Fiji",
    "Finland",
    "France",
    "Gabon",
    "The Gambia",
    "Georgia",
    "Germany",
    "Ghana",
    "Greece",
    "Grenada",
    "Guatemala",
    "Guinea",
    "Guinea-Bissau",
    "Guyana",
    "Haiti",
    "Honduras",
    "Hungary",
    "Iceland",
    "India",
    "Indonesia",
    "Iran",
    "Iraq",
    "Ireland",
    "Israel",
    "Italy",
    "Jamaica",
    "Japan",
    "Jordan",
    "Kazakhstan",
    "Kenya",
    "Kiribati",
    "Korea, North",
    "Korea, South",
    "Kosovo",
    "Kuwait",
    "Kyrgyzstan",
    "Laos",
    "Latvia",
    "Lebanon",
    "Lesotho",
    "Liberia",
    "Libya",
    "Liechtenstein",
    "Lithuania",
    "Luxembourg",
    "Madagascar",
    "Malawi",
    "Malaysia",
    "Maldives",
    "Mali",
    "Malta",
    "Marshall Islands",
    "Mauritania",
    "Mauritius",
    "Mexico",
    "Micronesia, Federated States of",
    "Moldova",
    "Monaco",
    "Mongolia",
    "Montenegro",
    "Morocco",
    "Mozambique",
    "Myanmar (Burma)",
    "Namibia",
    "Nauru",
    "Nepal",
    "Netherlands",
    "New Zealand",
    "Nicaragua",
    "Niger",
    "Nigeria",
    "North Macedonia",
    "Norway",
    "Oman",
    "Pakistan",
    "Palau",
    "Panama",
    "Papua New Guinea",
    "Paraguay",
    "Peru",
    "Philippines",
    "Poland",
    "Portugal",
    "Qatar",
    "Romania",
    "Russia",
    "Rwanda",
    "Saint Kitts and Nevis",
    "Saint Lucia",
    "Saint Vincent and the Grenadines",
    "Samoa",
    "San Marino",
    "Sao Tome and Principe",
    "Saudi Arabia",
    "Senegal",
    "Serbia",
    "Seychelles",
    "Sierra Leone",
    "Singapore",
    "Slovakia",
    "Slovenia",
    "Solomon Islands",
    "Somalia",
    "South Africa",
    "Spain",
    "Sri Lanka",
    "Sudan",
    "Sudan, South",
    "Suriname",
    "Sweden",
    "Switzerland",
    "Syria",
    "Taiwan",
    "Tajikistan",
    "Tanzania",
    "Thailand",
    "Togo",
    "Tonga",
    "Trinidad and Tobago",
    "Tunisia",
    "Turkey",
    "Turkmenistan",
    "Tuvalu",
    "Uganda",
    "Ukraine",
    "United Arab Emirates",
    "United Kingdom",
    "United States",
    "Uruguay",
    "Uzbekistan",
    "Vanuatu",
    "Vatican City",
    "Venezuela",
    "Vietnam",
    "Yemen",
    "Zambia",
    "Zimbabwe"
];

const firstNames = [
        "James",
        "Jack",
        "John",
        "Jacob",
        "Chris",
        "Matheew",
        "Bob",
        "Marshall",
        "Ron",
        "Harry",
        "Karim",
        "Cristiano",
        "Chuck",
        "Charlie",
        "Ahmed",
        "Richard",
        "Martin"
];

const lastNames = [
        "Geere",
        "Sarandon",
        "Mathers",
        "Grice",
        "Gibson",
        "Pitt",
        "DiCaprio",
        "Connery",
        "Snow",
        "Cooper",
        "Tarantino",
        "Scorcese",
        "Stallone",
        "Nicholson",
        "Schwarzenegger",
        "Lannister",
        "Mormont",
        "Tyrell"
];

// === FUNCTIONS ===
async function deleteCurrentData(){
    try{
        console.log("\nDELETING CURRENT DATA");
        console.log("==========================");
 
        // delete users
        await User.deleteMany({});
        console.log("> deleted users...");
 
        // delete campgrounds
        await Campground.deleteMany({});
        console.log("> deleted campgrounds...");
 
        // delete comments
        await Comment.deleteMany({});
        console.log("> deleted comments...");
 
        console.log("> successfully deleted current data");
        return true;
    }
    catch(err){
        console.log(err);
        return false;
    }
}
 
async function createUser(username, password, isAdmin){
    try{
        console.log(`\nCREATING USER "${username}"`);
        console.log("===================================");
        
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const email = firstName + "." + lastName + "@random.com"

        let newUser = new User({
            username: username,
            isAdmin: isAdmin,
            firstName: firstName,
            lastName: lastName,
            email: email
        });
 
        await User.register(newUser, password);
 
        console.log(`> created user "${username}" successfully`);
        return true;
    }
    catch(err){
        console.log(err);
        return false;
    }
}
 
async function createCampground(username, howMany, isPending, geocoded){
    try{
        if(isPending){
            console.log(`\nCREATING ${howMany} PENDING CAMPGROUNDS ASSOCIATED WITH USER "${username}"`);
        } else{
            console.log(`\nCREATING ${howMany} CAMPGROUNDS ASSOCIATED WITH USER "${username}"`);            
        }
        console.log("=========================================================");
 
        let data = {};
        data.desc = campground_desc;

        await User.findOne({username: username}, (err, user) => {            
            data.author = {
                id: user._id,
                username: user.username
            }
        });

        if(isPending){
            data.isPending = isPending;
        }  
 
        for(let i=0; i<howMany; i++){
            data.name = (campground_name_1[Math.floor(Math.random() * campground_name_1.length)]) + (campground_name_2[Math.floor(Math.random() * campground_name_2.length)]);
            data.image = `https://source.unsplash.com/collection/429524/1024x768?sig=${i}`;
            data.price = ((Math.floor(Math.random() * 150) + 1) + Math.random()).toFixed(2);
            if(isPending){
                data.location = campground_location[Math.floor(Math.random() * campground_location.length)];                
            } else if(geocoded){
                await geocoder.geocode(campground_location[Math.floor(Math.random() * campground_location.length)], async function (err, data2){
                    data.location = await data2[0].formattedAddress;
                    data.lat = await data2[0].latitude;
                    data.lng = await data2[0].longitude;
                    await Campground.create(data);
                    return true;
                });
            }

            if(isPending){
                console.log(`> created ${i+1} pending campground associated with user "${data.author.username}"`);
            } else{
                console.log(`> created ${i+1} campground associated with user "${data.author.username}"`);
            }            
        }
        return true;
    }
    catch(err){
        console.log(err);
        return false;
    }
}

async function createComment(username){
    try{
        console.log(`\nCREATING A COMMENT TO EACH CAMPGROUND ASSOCIATED WITH USER "${username}"`);
        console.log("===========================================================================");
 
        let data = {};
        data.campground = {};
        data.campground.author = {};
 
        await User.findOne({username: username}, (err, user) => {
            data.desc = campground_desc;
            data.author = {
                    id: user._id,
                    username: user.username
            }
        });
 
        await Campground.find({}, async (err, campgrounds) => {
            campgrounds.forEach(async (campground, i) => {
                if(!campground.isPending && Math.floor(Math.random() * 3) == 2){
                    data.text = campground_comments[Math.floor(Math.random() * campground_comments.length)];
                    data.campground.id = campground._id;
                    data.campground.name = campground.name;
                    data.campground.isPending = campground.isPending;
                    data.campground.author.id = campground.author.id;
                    data.campground.author.username = campground.author.username;
 
                    await Comment.create(data, async (err, comment) => {
                        // save comment
                        await comment.save();
                        // connect new comment to campground
                        await campground.comments.push(comment);
                        // save
                        await campground.save();
                    });
     
                    console.log(`> created ${i+1} comment - to campground "${campground.name}, associated with user "${username}"`);
                }
            });
        });
 
        return true;
    }
    catch(err){
        console.log(err);
        return false;
    }
}
 
async function seedDB(){
    // await deleteCurrentData();
    
    // await createUser("admin", "4251", true);
    // await createUser("test1", "test1", false);
    // await createUser("test2", "test2", false);
    // await createUser("test3", "test3", false);
    // await createUser("test4", "test4", false);
    // await createUser("test5", "test5", false);
    // await createUser("test6", "test6", false);
    // await createUser("test7", "test7", false);
    // await createUser("test8", "test8", false);
    // await createUser("test9", "test9", false);

    // await createCampground("test1", Math.floor(Math.random() * 2) + 1, false, true);
    // await createCampground("test2", Math.floor(Math.random() * 2) + 1, false, true);
    // await createCampground("test3", Math.floor(Math.random() * 2) + 1, false, true);
    // await createCampground("test4", Math.floor(Math.random() * 2) + 1, false, true);
    // await createCampground("test2", Math.floor(Math.random() * 2) + 1, false, true);
    // await createCampground("test6", Math.floor(Math.random() * 2) + 1, false, true);
    // await createCampground("test7", Math.floor(Math.random() * 2) + 1, false, true);
    // await createCampground("test8", Math.floor(Math.random() * 2) + 1, false, true);
    // await createCampground("test9", Math.floor(Math.random() * 2) + 1, false, true);
 
    // await createComment("test1");
    // await createComment("test2");
    // await createComment("test3");
    // await createComment("test4");
    // await createComment("test5");
    // await createComment("test6");
    // await createComment("test7");
    // await createComment("test8");
    // await createComment("test9");
    
    return true;
}
 
module.exports = seedDB;
