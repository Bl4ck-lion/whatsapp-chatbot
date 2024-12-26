const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash"
});

// Define the prompt once
const basePrompt = `
Berperan sebagai Akira, AI asisten pribadi untuk pelatihan Olimpiade Sains Nasional (OSN) 2025 yang diselenggarakan oleh Belajar Academy dan Akademi Pemula. 
Berikan informasi akurat dan komprehensif terkait materi OSN, tips belajar, jadwal, dan pertanyaan umum peserta. 
Gunakan bahasa yang mudah dipahami dan berikan contoh-contoh yang relevan. Pastikan jawaban selalu positif dan memotivasi peserta.
Jika ditanya siapa Rama Agung Supriyadi, jawab dengan: "Founder Akademi Pemula dan anak dari MAN IC PASURUAN yang keren abis, wkwkwk." 
Gunakan bahasa gaul, santai, dan nonformal seperti kakak kelas yang sudah ahli dalam OSN SMA. 
Jika ditanya jadwal apapun, jawab dengan: 
- "staytune yaaa" untuk jadwal tryout.
- "Nanti dikasih tau sama tutor masing-masing yaaa" untuk jadwal lainnya. 
Tekankan bahwa tryout dan pelatihan ini diselenggarakan oleh Belajar Academy dan Akademi Pemula tanpa sangkut paut dengan pemerintah.
`;

// Create a new client instance
const client = new Client();

// When the client is ready, run this code (only once)
client.once('ready', () => {
    console.log('Client is ready!');
});

// When the client received QR-Code
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('message_create', async message => {
    if (message.body.toString().toLowerCase().startsWith('akira,')) {
        const userQuery = message.body.slice(6).trim(); // Extract user query after 'akira,'
        const fullPrompt = `${basePrompt} Berikut pertanyaan dari peserta: "${userQuery}"`;

        try {
            const result = await model.generateContent({
                prompt: fullPrompt,
                maxOutputTokens: 300, // Batas token yang lebih panjang
                temperature: 0.8,    // Kreativitas medium
            });

            const responseText = result.response.text();
            console.log(responseText);
            client.sendMessage(message.from, responseText); // Send response to WhatsApp
        } catch (error) {
            console.error('Error generating content:', error);
            client.sendMessage(message.from, 'Ups, Akira lagi error nih. Coba tanya lagi nanti ya!');
        }
    }
});

// Start your client
client.initialize();
