// scripts/4_assemble.js
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

ffmpeg.setFfmpegPath(ffmpegStatic);

const SCREENS = [
  '00_founder_dashboard', '01_production_calendar', '02_style_master', '03_bom',
  '04_vendor_directory', '05_landed_cost', '06_sample_log',
  '07_drop_launch', '08_drop_performance', '09_production_dashboard'
];

// Seconds per slide when no audio is present
const SILENT_DURATION = 5;

const SCREENSHOTS_DIR = path.join(__dirname, '../assets/screenshots');
const AUDIO_DIR = path.join(__dirname, '../assets/audio');
const SEGMENTS_DIR = path.join(__dirname, '../assets/segments');
const OUTPUT_DIR = path.join(__dirname, '../output');

fs.mkdirSync(SEGMENTS_DIR, { recursive: true });
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

function getAudioDuration(audioPath) {
  try {
    const result = execSync(`"${ffmpegStatic}" -i "${audioPath}" 2>&1 || true`).toString();
    const match = result.match(/Duration: (\d+):(\d+):(\d+\.\d+)/);
    if (!match) return null;
    return parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseFloat(match[3]) + 1.5;
  } catch (e) {
    const output = e.stderr ? e.stderr.toString() : e.stdout ? e.stdout.toString() : '';
    const match = output.match(/Duration: (\d+):(\d+):(\d+\.\d+)/);
    if (!match) return null;
    return parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseFloat(match[3]) + 1.5;
  }
}

async function buildSegment(screenId) {
  return new Promise((resolve, reject) => {
    const imgPath = path.join(SCREENSHOTS_DIR, `${screenId}.png`);
    const audioPath = path.join(AUDIO_DIR, `${screenId}.mp3`);
    const segmentPath = path.join(SEGMENTS_DIR, `${screenId}.mp4`);

    const hasAudio = fs.existsSync(audioPath);
    const duration = hasAudio ? getAudioDuration(audioPath) ?? SILENT_DURATION : SILENT_DURATION;
    const frames = Math.round(duration * 25);

    const cmd = ffmpeg()
      .input(imgPath)
      .inputOptions(['-loop 1', `-t ${duration}`]);

    if (hasAudio) cmd.input(audioPath);

    cmd.outputOptions([
      '-c:v libx264',
      '-tune stillimage',
      '-pix_fmt yuv420p',
      ...(hasAudio ? ['-c:a aac', '-b:a 192k', '-shortest'] : ['-an']),
      `-vf scale=1440:900,zoompan=z='min(zoom+0.0008,1.05)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=1440x900:fps=25`,
    ])
      .output(segmentPath)
      .on('end', () => { console.log(`   ✅ Segment done: ${screenId} (${hasAudio ? 'with audio' : 'silent'})`); resolve(); })
      .on('error', reject)
      .run();
  });
}

async function concatenateSegments() {
  const concatFile = path.join(SEGMENTS_DIR, 'concat.txt');
  const lines = SCREENS.map(id =>
    `file '${path.join(SEGMENTS_DIR, id + '.mp4')}'`
  ).join('\n');
  fs.writeFileSync(concatFile, lines);

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(concatFile)
      .inputOptions(['-f concat', '-safe 0'])
      .outputOptions(['-c copy'])
      .output(path.join(OUTPUT_DIR, 'tutorial_final.mp4'))
      .on('end', () => {
        console.log('\n🎬 Final video assembled: output/tutorial_final.mp4');
        resolve();
      })
      .on('error', reject)
      .run();
  });
}

async function main() {
  console.log('🎬 Assembling tutorial video...\n');
  for (const screenId of SCREENS) {
    console.log(`Building segment: ${screenId}`);
    await buildSegment(screenId);
  }
  await concatenateSegments();
}

main().catch(console.error);
