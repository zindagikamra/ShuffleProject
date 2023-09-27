const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

mongoose.connect(process.env.dbURL.toString(), 
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
);

const Set = mongoose.model("Set", mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: { type: String, required: true },
    cards: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Card",
        required: true,
      },
    ],
}));

const User = mongoose.model("User", mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[^\s@]+@(gmail\.com|yahoo\.com|northeastern\.edu)$/,
    },
    password: { type: String, required: true },
    sets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Set",
      },
    ],
}));

exports.handler = async (event, context) => {
    //console.log(JSON.stringify(event));


    context.callbackWaitsForEmptyEventLoop = false;

    let body = JSON.parse(event.body);

    const givenEmail = body.email;
    const password = body.password;

    try {
        let user = await User.find({email: givenEmail}).exec();

        console.log("users: " + JSON.stringify(user));

        if(user.length >= 1) {
            return {
                statusCode: 401,
                body: "User with this email already exists, use another email"
            }
        } else {
            console.log("MADE IT HERE 1");

            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(password, salt);
            
            user = new User({
                _id: new mongoose.Types.ObjectId(),
                email: givenEmail,
                password: hash,
                sets: []
            });
        }

        return {
            statusCode: 201,
            body: JSON.stringify(await user.save())
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: "Something failed in signup, try again: THIS UPDATES" + JSON.stringify(error)
        };
    }



}