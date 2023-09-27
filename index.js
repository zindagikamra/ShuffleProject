const mongoose = require("mongoose");
const axios = require("axios");

mongoose.connect(process.env.dbURL.toString(), 
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
);

const Set = mongoose.model("Set", new mongoose.Schema({
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

exports.handler = async (event, context) => {

    context.callbackWaitsForEmptyEventLoop = false;

    let body = JSON.parse(event.body);

    ///////////////////////////////////////////////////////
    if(event.httpMethod == "DELETE") {
        const setId = body.id;

        try {
            let result = await Set.findById(setId).select("cards").exec();

            console.log(result);

            if(!result) {
                return {
                    statusCode: 404,
                    body: "Set not found, try valid id"
                }
            } else {
                const deleteCardPromises = result.cards.map((cardId) => {

                    const config = {
                        headers: {
                            "Content-Type": "application/json",
                        },
                        data: {
                            id: cardId,
                        }
                    };

                    axios.delete(process.env.cardsURL.toString(), config)
                        .then()
                        .catch((error) => {
                            console.error(`Error in deleting card ${cardId} from set: ${error}`);
                            throw error;
                        });
                });

                await Promise.all(deleteCardPromises);

                let setDelete = await Set.deleteOne({ _id: setId }).exec();

            }

            return {
                statusCode: 410,
                body: "Set Deleted\n" + JSON.stringify(setDelete)
            };
        } catch (error) {
            return {
                statusCode: 500,
                body: "Invalid Request Try Again"
            }
        }

        /////////////////////////////////////////////////////////////
    } if(event.httpMethod == "GET") {
        let setId = body.id;

        try {
            const set = await Set.findById(setId).select("title cards").exec();

            return {
                statusCode: 200,
                body: JSON.stringify(set)
            };
        } catch (error) {

            return {
                statusCode: 400,
                body: JSON.stringify(error)
            };
        }

        /////////////////////////////////////////////////////////
    } else if(event.path == "/sets/regularset" && event.httpMethod == "POST") {

        const set = new Set({
            _id: new mongoose.Types.ObjectId(),
            title: body.title,
            cards: body.cards
        });

        try {
            var result = await set.save();

            return {
                statusCode: 201,
                body: JSON.stringify(result)
            };
        } catch (error) {
            return {
                statusCode: 400,
                body: "Set Not Created, re-check body of request"
            }

        }

        ////////////////////////////////////////////////////////
    } else if(event.path == "/sets/aiset" && event.httpMethod == "POST") {
        // things from req
        const title = body.title
        const type = body.type;
        const prompt = body.prompt;
        const quantity = body.quantity;

        // ai part
        var systemRole = "";
        switch (type) {
            case "summary":
                systemRole =
                "You are a summarizing master who can take information and turn it into flashcards which help students memorize your summarizations. Take the given information and return it as " +
                quantity +
                " flashcards with a term, definition format. If you encounter a term which's definition is specific to the text, define it independently. It is very important that you return these in an array and in json format.";
                break;
            //case "topic":
            default:
                systemRole =
                "You are a topic master who can take information and turn it into flashcards which help students memorize key information about a given topic. Take the given topic and generate " +
                quantity +
                " flashcards with a term, definition format. It is very important that you return these in an array and in json format.";
                break;
        }
        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    Authorization: `ADD-KEY-HERE`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: systemRole, // sets the behavior of the assistant
                        },
                        {   
                            role: "user",
                            content: prompt, // represents the user's input
                        },
                    ],
                }),
        });

        // process response
        const cardsData = await response.json();
        //return cardsData["choices"][0]["message"]["content"];
        const justCards = cardsData["choices"][0]["message"]["content"];
        const cleanedCardSet = justCards.replaceAll(/\n/g, "").replaceAll(/\\"/g, '"');
        const jsonCards = JSON.parse(cleanedCardSet);

        // make cards
        try {
            const cardPromises = jsonCards.map((card) => {
                const config = {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    data: {
                        card
                    }
                };
                axios.post(`https://ybsrts34a3.execute-api.us-east-2.amazonaws.com/dev/cards/`, config)
            });

            const cardResponds = await Promise.all(cardPromises);

            const cardIds = cardResponds.map((card) => card.data._id);

            const set = new Set({
                _id: new mongoose.Types.ObjectId(),
                title: req.body.title,
                cards: cardIds,
            });
            
            const result = await set.save();

            return {
                statusCode: 200,
                body: {
                    message: "Set Created! Information:",
                    set: JSON.stringify(result)
                }
            };

            // PICK UP HERE
        } catch (problem) {
            return {
                statusCode: 500,
                body: "Something went wrong with the card post connection, try again!"
            };
        }

    } catch (error) {
        return {
            statusCode: 500,
            body: "Something went wrong with the ai connection, try again!"
        };
  }

    ////////////////////////////////////////////////////
    } else if(event.path == "/sets/addcard" && event.httpMethod == "PATCH") {

    } else if(event.path == "/sets/deletecard" && event.httpMethod == "PATCH") {

    }
}
