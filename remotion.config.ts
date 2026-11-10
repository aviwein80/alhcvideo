import {Config} from '@remotion/cli/config';

// /assets is the public directory, so staticFile('brand/logo.svg') reads
// assets/brand/logo.svg.
Config.setPublicDir('assets');
Config.setEntryPoint('src/index.ts');

// Output: H.264 MP4 that plays everywhere.
Config.setCodec('h264');
Config.setPixelFormat('yuv420p');
Config.setCrf(16);
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);
