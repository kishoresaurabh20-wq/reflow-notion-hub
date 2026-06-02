// scripts/3_voiceover.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const NARRATION = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../assets/narration_script.json'), 'utf8')
);

const AUDIO_DIR = path.join(__dirname, '../assets/audio');
fs.mkdirSync(AUDIO_DIR, { recursive: true });

async function generateWithElevenLabs(screenId, text) {
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
      timeout: 30000,
    }
  );
  const audioPath = path.join(AUDIO_DIR, `${screenId}.mp3`);
  fs.writeFileSync(audioPath, response.data);
  console.log(`   🔊 ElevenLabs audio saved: ${screenId}.mp3`);
}

function generateWithEspeak(screenId, text) {
  const clean = text.replace(/\n\s+/g, ' ').trim().replace(/'/g, "'");
  const wavPath = path.join(AUDIO_DIR, `${screenId}.wav`);
  const mp3Path = path.join(AUDIO_DIR, `${screenId}.mp3`);
  const ffmpegStatic = require('ffmpeg-static');

  execSync(`espeak-ng -v en-us -s 145 -p 50 -a 180 "${clean.replace(/"/g, '\\"')}" --stdout > "${wavPath}"`);
  execSync(`"${ffmpegStatic}" -y -i "${wavPath}" -codec:a libmp3lame -qscale:a 2 "${mp3Path}" 2>/dev/null`);
  fs.unlinkSync(wavPath);
  console.log(`   🔊 espeak-ng audio saved: ${screenId}.mp3`);
}

async function main() {
  const useElevenLabs = !!(process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_VOICE_ID);

  if (useElevenLabs) {
    console.log('🎙️  Generating voiceovers via ElevenLabs...\n');
  } else {
    console.log('🎙️  Generating voiceovers via espeak-ng (system TTS)...\n');
  }

  for (const [screenId, text] of Object.entries(NARRATION)) {
    console.log(`Processing: ${screenId}`);
    if (useElevenLabs) {
      try {
        await generateWithElevenLabs(screenId, text);
        await new Promise(r => setTimeout(r, 1000));
      } catch (e) {
        console.log(`   ⚠️  ElevenLabs failed (${e.message}) — falling back to espeak-ng`);
        generateWithEspeak(screenId, text);
      }
    } else {
      generateWithEspeak(screenId, text);
    }
  }
  console.log('\n✅ All voiceovers generated!');
}

main().catch(console.error);
