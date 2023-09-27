const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

    context.callbackWaitsForEmptyEventLoop = false;

    let body = JSON.parse(event.body);

    if(event.httpMethod == "DELETE") {
        const userId = body.id;

        try {
            let result = await User.deleteOne({ _id: userId }).exec();

            return {
                statusCode: 410,
                body: "User Deleted"
            };
        } catch (error) {
            return {
                statusCode: 404,
                body: "User not found, try valid id"
            }
        }


    } else if(event.path == "/users/signup" && event.httpMethod == "POST") {
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
               // console.log("MADE IT HERE 1");

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
    } else if(event.path == "/users/login" && event.httpMethod == "POST") {
        const givenEmail = body.email;
        const password = body.password;

        let found = await User.find({email: givenEmail}).exec();

        if(found.length >= 1) {
            if(bcrypt.compareSync(password, found[0].password)) {
                return {
                    statusCode: 200,
                    body: "Log In Successfull!!! Yipee"
                };
            } else {
                return {
                    statusCode: 401,
                    body: "Log In Not Successful, try different email or password"
                };
            }

        } else {
            return {
                statusCode: 404,
                body: "User not found, try valid email address"
            };
        }


    } else if(event.path == "/users/addset" && event.httpMethod == "PATCH") {
        
    } else if(event.path == "/users/deleteset" && event.httpMethod == "PATCH") {
        
    }

}