module.exports = async function getData(type, prompt, quantity) {
  var systemRole = "";
  switch (type) {
    case "summary":
      systemRole =
        "You are a summarizing master who can take information and turn it into flashcards which help students memorize your summarizations. Take the given information and return it as " +
        quantity +
        " flashcards with a term, definition format. If you encounter a term which's definition is specific to the text, define it independently. It is very important that you return these in an array and in json format.";
      break;
    case "topic":
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
        Authorization: `Add-token-here`,
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
    const cardsData = await response.json();
    //console.log(cardsData["choices"][0]["message"]["content"]);
    return cardsData["choices"][0]["message"]["content"];
  } catch (error) {
    console.error("error in getting the data" + error);
    throw error;
  }
};
