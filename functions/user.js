// functions/users.js
exports.handler = async (event, context) => {
    // Ensure that the method is POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405, // Method Not Allowed
            body: JSON.stringify({ message: "Method Not Allowed" }),
        };
    }

    try {
        // Parse the incoming JSON data
        const data = JSON.parse(event.body);
        
        // Process the data (e.g., save to a database, etc.)
        console.log('Received data:', data);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Form submitted successfully!" }),
        };
    } catch (error) {
        return {
            statusCode: 500, // Internal Server Error
            body: JSON.stringify({ message: "Error processing the request" }),
        };
    }
};
