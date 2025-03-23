# Binaural Beat Sound Files

This directory should contain the following binaural beat sound files:

- `alpha.mp3` - Alpha waves (8-12 Hz)
- `beta.mp3` - Beta waves (13-30 Hz)
- `theta.mp3` - Theta waves (4-7 Hz)
- `gamma.mp3` - Gamma waves (30-100 Hz)

These files can be generated using Web Audio API or obtained from royalty-free sound libraries.

## Note on Implementation

The application can generate binaural beats in real-time using the Web Audio API, which is implemented in the `use-ambient-sounds.ts` hook. The sound files are optional and serve as fallbacks for browsers that don't support the Web Audio API or for users who prefer pre-recorded binaural beats.

## Resources for Binaural Beat Generation

- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Creating Binaural Beats with JavaScript](https://medium.com/better-programming/creating-binaural-beats-with-javascript-96367b6153f3)
- [Tone.js](https://tonejs.github.io/) - A framework for creating interactive music in the browser
