// scripts/3_voiceover.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const NARRATION = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../assets/narration_script.json'), 'utf8')
);

const AUDIO_DIR = path.join(__dirname, '../assets/audio');
fs.mkdirSync(AUDIO_DIR, { recursive: true });

async function generateVoiceover(screenId, text) {
  const response = await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
    {
      text: text.replace(/\n\s+/g, ' ').trim(),
      model_id: 'eleven_monolingual_v1',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    },
    {
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      responseType: 'arraybuffer',
    }
  );

  const audioPath = path.join(AUDIO_DIR, `${screenId}.mp3`);
  fs.writeFileSync(audioPath, response.data);
  console.log(`   🔊 Audio saved: ${screenId}.mp3`);
}

async function main() {
  if (!process.env.ELEVENLABS_API_KEY) {
    console.error('❌ ELEVENLABS_API_KEY not set in .env');
    process.exit(1);
  }
  if (!process.env.ELEVENLABS_VOICE_ID) {
    console.error('❌ ELEVENLABS_VOICE_ID not set in .env');
    process.exit(1);
  }

  console.log('🎙️  Generating voiceovers via ElevenLabs...\n');
  for (const [screenId, text] of Object.entries(NARRATION)) {
    console.log(`Processing: ${screenId}`);
    await generateVoiceover(screenId, text);
    await new Promise(r => setTimeout(r, 1000)); // rate limit buffer
  }
  console.log('\n✅ All voiceovers generated!');
}

main().catch(console.error);
