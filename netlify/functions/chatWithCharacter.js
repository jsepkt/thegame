export async function handler(event, context) {
    if (!genAI) { // Check if genAI client was initialized
        console.error("Netlify Function Error: GoogleGenerativeAI client not initialized.");
        return { statusCode: 503, body: JSON.stringify({ message: "AI client not configured." }) };
    }
    try {
        console.log("Netlify Function INFO: Attempting to list models...");
        let modelsList = "Could not retrieve models.";
        // The way to list models changed in different minor versions of the SDK
        // Trying a common approach:
        if (typeof genAI.listModels === 'function') { // Older SDK style
            const models = await genAI.listModels();
            modelsList = JSON.stringify(models, null, 2);
        } else if (genAI.getGenerativeModel && typeof genAI.getGenerativeModel({ model: "models/embedding-001" }).listModels === 'function') {
            // This is a guess for some SDK structures, may not work
             const embedModel = genAI.getGenerativeModel({ model: "models/embedding-001" }); // Need any valid model name to get listModels
             const models = await embedModel.listModels();
             modelsList = JSON.stringify(models, null, 2);
        } else {
            // For newer SDKs, listing models might not be straightforward via the base client.
            // Often, you'd use the Google Cloud Console (Vertex AI Model Garden) to see available models.
            // Or use gcloud CLI: gcloud ai models list --region=YOUR_REGION
            modelsList = "SDK does not directly support listing models this way. Check Google Cloud Console.";

            // Let's try to make a call to a very basic model just to see if the API is hit
             console.log("Attempting a simple generateContent with a basic model string...");
             const testModel = genAI.getGenerativeModel({ model: "gemini-pro" }); // Keep gemini-pro
             const result = await testModel.generateContent("test prompt");
             modelsList = "Test call to gemini-pro successful. Response: " + result.response.text();

        }

        console.log("Netlify Function INFO: Available/Testable Models:", modelsList);
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ availableModels: modelsList })
        };
    } catch (error) {
        console.error('Netlify Function ERROR: Error listing models or test call:', error.message, error);
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "Error listing models.", error: error.message })
        };
    }
}