# Ambient Sounds for Pomo AI-doro

This directory contains ambient sound files for the Pomo AI-doro application. These sounds are designed to enhance focus and productivity during work sessions.

## Sound Categories

The ambient sounds are organized into the following categories:

1. **Nature Sounds**

   - rain.mp3 - Gentle rainfall sounds
   - forest.mp3 - Forest ambience with birds and rustling leaves
   - ocean.mp3 - Ocean waves sounds
   - night.mp3 - Night sounds with crickets and gentle wind

2. **Ambient Sounds**

   - cafe.mp3 - Coffee shop ambience with quiet chatter and cups clinking
   - fireplace.mp3 - Crackling fireplace sounds

3. **White Noise**

   - white-noise.mp3 - Pure white noise for maximum focus

4. **Music**
   - lofi.mp3 - Lo-fi beats for focus and concentration

## Adding New Sounds

To add new ambient sounds:

1. Place the MP3 file in this directory
2. Update the `defaultAmbientSounds` array in `hooks/use-ambient-sounds.ts`
3. Add an appropriate icon from Lucide icons

## Sound Requirements

- Format: MP3
- Duration: At least 5 minutes (looped playback is handled by the player)
- Quality: 128kbps or higher
- Volume: Normalized to prevent sudden volume changes

## Credits

Please ensure all sound files used in the application are properly licensed for commercial use.

## Note for Developers

The actual sound files need to be added to this directory. Due to file size limitations, they are not included in the repository. You can download royalty-free ambient sounds from sources like:

- [Freesound](https://freesound.org/)
- [Pixabay](https://pixabay.com/sound-effects/)
- [Zapsplat](https://www.zapsplat.com/)
