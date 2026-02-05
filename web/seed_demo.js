import axios from 'axios';
import { randomUUID } from 'crypto';

const API_URL = 'http://localhost:3000/worksheets';

const step2 = {
    title: 'Step 2: Deep Dive',
    slug: 'step-2',
    content: {
        version: 1,
        blocks: [
            { id: randomUUID(), type: 'heading', content: 'Going Deeper' },
            { id: randomUUID(), type: 'text', content: 'Great job completing Step 1! Now let\'s get specific.' },
            { id: randomUUID(), type: 'input', label: 'What is your biggest obstacle?', inputType: 'textarea', field_key: 'obstacle' }
        ]
    }
};

const step1 = {
    title: 'Step 1: Welcome',
    slug: 'step-1',
    content: {
        version: 1,
        nextSlug: 'step-2',
        blocks: [
            { id: randomUUID(), type: 'heading', content: 'Welcome to the Course' },
            { id: randomUUID(), type: 'text', content: 'This is the first step in our connected workbook flow.' },
            { id: randomUUID(), type: 'input', label: 'What is your name?', inputType: 'text', field_key: 'name' }
        ]
    }
};

async function run() {
    try {
        console.log('Creating Step 2...');
        await axios.post(API_URL, step2);
        
        console.log('Creating Step 1 (Linked to Step 2)...');
        await axios.post(API_URL, step1);
        
        console.log('Done! Demo created.');
    } catch (e) {
        console.log('Error:', e.message);
        if (e.response) {
            console.log('Status:', e.response.status);
            console.log('Data:', JSON.stringify(e.response.data, null, 2));
        }
    }
}

run();
