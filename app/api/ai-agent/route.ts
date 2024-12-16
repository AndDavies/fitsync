import { NextResponse } from 'next/server';
import axios from 'axios';

// Environment variable for xAI API key
const XAI_API_KEY = process.env.XAI_API_KEY;

export async function POST(request: Request) {
    try {
        // Parse the request body
        const { prompt } = await request.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        // Call the xAI API
        const xaiResponse = await axios.post(
            'https://api.xai.com/generate', // Replace with the correct xAI API endpoint
            { prompt },
            {
                headers: {
                    'Authorization': `Bearer ${XAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        // Return the response from xAI API
        return NextResponse.json(xaiResponse.data);
    } catch (error) {
        console.error('Error calling xAI API:', error);
        return NextResponse.json({ error: 'Failed to generate text' }, { status: 500 });
    }
}
