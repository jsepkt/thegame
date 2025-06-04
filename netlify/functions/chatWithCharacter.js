// netlify/functions/chatWithCharacter.js

import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GOOGLE_STUDIO_API_KEY;
const MODEL_NAME_FOR_TEST = "gemini-pro"; 

let genAI_client_instance; // Renamed to avoid conflict if genAI is used elsewhere as a common name

if (API_KEY) {
    try {
        genAI_client_instance = new GoogleGenerativeAI(API_KEY); // Assign to our renamed variable
        console.info(`Netlify Function: GoogleGenerativeAI client initialized for diagnostics.`);
    } catch (error) {
        console.error(`Netlify Function Critical Error: Failed to initialize GoogleGenerativeAI client:`, error);
        // genAI_client_instance will remain undefined if this fails
    }
} else {
    console.error("Netlify Function Critical Error: GOOGLE_STUDIO_API_KEY environment variable not set.");
}

// CharacterPersonalities object is not used by this diagnostic handler
const characterPersonalities = { /* ... your character prompts ... */ }; // Keep for easy revert

// DIAGNOSTIC HANDLER
export async function handler(event, context) {
    // Check if the client instance was successfully created
    if (!genAI_client_instance) { // Check the renamed variable
        console.error("Netlify Function DIAGNOSTIC Error: GoogleGenerativeAI client (genAI_client_instance) was not initialized. Check API Key and initial setup.");
        return {
            statusCode: 503, // Service Unavailable
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "AI client (genAI_client_instance) not configured. API Key or SDK init issue." }),
        };
    }

    console.log("Netlify Function INFO: Running DIAGNOSTIC handler to check model access.");
    let diagnosticMessage = "Starting diagnostic...\n"; // Initialize here for broader scope in try/catch

    try {
        let testModel;
        try {
            // Use the initialized client instance to get the model
            testModel = genAI_client_instance.getGenerativeModel({ model: MODEL_NAME_FOR_TEST });
            diagnosticMessage += `Successfully got model instance for '${MODEL_NAME_FOR_TEST}'.\n`;
            console.info(`Netlify Function DIAGNOSTIC: Successfully got model instance for '${MODEL_NAME_FOR_TEST}'.`);
        } catch (modelError) {
            diagnosticMessage += `Failed to get model instance for '${MODEL_NAME_FOR_TEST}'. Error: ${modelError.message}\n`;
            console.error(`Netlify Function DIAGNOSTIC ERROR: Failed to get model instance for '${MODEL_NAME_FOR_TEST}':`, modelError);
            return {
                statusCode: 500,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: "Diagnostic failed: Could not get model instance.", error: modelError.message, diagnosticLog: diagnosticMessage })
            };
        }
        
        diagnosticMessage += `Attempting generateContent with '${MODEL_NAME_FOR_TEST}'...\n`;
        console.info(`Netlify Function DIAGNOSTIC: Attempting generateContent with '${MODEL_NAME_FOR_TEST}'.`);
        
        const result = await testModel.generateContent("Tell me a one-sentence horror story.");
        // Check if response and text() method exist before calling
        let aiReply = "[No valid response structure received from AI]";
        if (result && result.response && typeof result.response.text === 'function') {
            aiReply = result.response.text();
        } else {
            diagnosticMessage += `Unexpected response structure from AI for '${MODEL_NAME_FOR_TEST}'.\n`;
            console.warn(`Netlify Function DIAGNOSTIC WARNING: Unexpected response structure from AI for '${MODEL_NAME_FOR_TEST}'. Result:`, JSON.stringify(result));
        }
        
        diagnosticMessage += `Successfully generated content with '${MODEL_NAME_FOR_TEST}'. Response snippet: ${aiReply.substring(0,50)}...\n`;
        console.info(`Netlify Function DIAGNOSTIC: Test call to '${MODEL_NAME_FOR_TEST}' successful. Response: ${aiReply.substring(0,100)}...`);

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                message: "Diagnostic completed successfully.", 
                testModelUsed: MODEL_NAME_FOR_TEST,
                testResponse: aiReply,
                diagnosticLog: diagnosticMessage
            })
        };

    } catch (error) {
        console.error('Netlify Function DIAGNOSTIC ERROR:', error.message);
        // console.error('Full diagnostic error object:', error); 
        
        diagnosticMessage += `Error during generateContent or processing: ${error.message}\n`; // Append error to the log
        let clientErrorMessage = "Diagnostic test failed while communicating with Google AI.";
         if (process.env.CONTEXT === 'dev' || process.env.CONTEXT === 'branch-deploy' || process.env.CONTEXT === 'deploy-preview') {
            clientErrorMessage += ` Details: ${error.message || 'Unknown AI error during diagnostic'}`;
        }

        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                message: clientErrorMessage, 
                errorDetails: error.message,
                diagnosticLog: diagnosticMessage
            })
        };
    }
}