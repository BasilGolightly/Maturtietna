npm install openai;

import OpenAI from "openai";

const openai = new OpenAI();

async function main() {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: "INSERT-PROMPT-HERE" }],
    model: "gpt-3.5-turbo",
  });               //sends the prompt to GPT 3.5 and creates it returning the value saved in the string completion

  console.log(completion.choices[0]);
  checkAndModifyString(completion)
}

function checkAndModifyString(inputString) {
  if (inputString.endsWith('1')) {
                // Remove the last character and return the new string
      return inputString.slice(0, -1);
  } else {
                // Return a message if the last character is not '1'
      return "Creation unsuccessful";
  }
}

main();

____________________________________________

npm install openai;

const { OpenAIAPI } = require('openai');

                            // Initialize the OpenAI API with our API key
const openai = new OpenAIAPI({
    apiKey: 'YOUR_API_KEY' // Replace with your actual API key
});

                            // Function to make a request to OpenAI's API
var promptText = "PROMPT-FROM-THE-APP"

async function queryOpenAI(promptText) {
    try {
        const response = await openai.createCompletion({
            model: "gpt-3.5-turbo", 
            prompt: promptText,         // The prompt text for the AI
            max_tokens: 150            // Adjust the number of tokens **ONE TOKEN = 3-4 characters**
        });

        return checkAndModifyString(response.data.choices[0].text.trim());
    } catch (error) {
        console.error("The email could not be created, please try again");
        return null;
    }
}



function checkAndModifyString(inputString) {
  if (inputString.endsWith('1')) {
      // Remove the last character and return the new string
      return inputString.slice(0, -1);
  } else {
      // Return a message if the last character is not '1'
      return "Creation unsuccessful";
  }
}

