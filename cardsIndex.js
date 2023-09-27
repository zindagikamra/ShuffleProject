
const mongoose = require("mongoose");

mongoose.connect(process.env.dbURL.toString(), 
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
);

const Card = mongoose.model("Card", new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    term: { type: String, required: true },
    definition: { type: String, required: true },
}));

exports.handler = async (event, context) => {

    context.callbackWaitsForEmptyEventLoop = false;

    let body = JSON.parse(event.body);


    if (event.httpMethod == "GET") {
        let cardId = body.id;

        try {
            const card = await Card.findById(cardId).select("term definition").exec();

            return {
                statusCode: 200,
                body: JSON.stringify(card)
            };
        } catch (error) {

            return {
                statusCode: 400,
                body: JSON.stringify(error)
            };
        }
        
    } 
    else if (event.httpMethod == "POST") {

        const card = new Card({
            _id: new mongoose.Types.ObjectId(),
            term: body.term,
            definition: body.definition
        });

        try {
            var result = await card.save();

            return {
                statusCode: 201,
                body: JSON.stringify(result)
            };
        } catch (error) {
            return {
                statusCode: 400,
                body: "Card Not Created, re-check body of request"
            }

        }
    } else if (event.httpMethod == "DELETE") {
        let cardId = body.id;

        try {
            let result = await Card.deleteOne({ _id: cardId }).exec();

            return {
                statusCode: 410,
                body: "Card Deleted"
            };
        } catch (error) {
            return {
                statusCode: 404,
                body: "Card not found try valid id"
            }
        }
        
    }
    
  return {
        stausCode: 404,
        body: "URI Not Found :("
    };
};