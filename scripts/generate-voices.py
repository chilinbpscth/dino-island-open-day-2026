"""Generate the game's fixed script locally; teacher pronunciation review remains separate."""
import argparse
import hashlib
import json
from pathlib import Path

import numpy as np
import soundfile as sf

parser = argparse.ArgumentParser()
parser.add_argument('--cantonese-model', required=True)
parser.add_argument('--kokoro-model', required=True)
args = parser.parse_args()
root = Path(__file__).resolve().parent.parent
manifest_path = root / 'design/audio/voice-manifest.json'
manifest = json.loads(manifest_path.read_text())
engines = {}

def engine(locale):
    kind = 'cantonese' if locale == 'yue' else 'kokoro'
    if kind not in engines:
        if kind == 'cantonese':
            from canto_tts import CantoTTS
            engines[kind] = CantoTTS(checkpoint=args.cantonese_model, backend='onnx')
        else:
            import sherpa_onnx
            p = Path(args.kokoro_model).resolve()
            config = sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(
                kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(
                    model=str(p / 'model.onnx'), voices=str(p / 'voices.bin'),
                    tokens=str(p / 'tokens.txt'), data_dir=str(p / 'espeak-ng-data'),
                    lexicon=','.join(str(p / n) for n in ['lexicon-zh.txt', 'lexicon-gb-en.txt'])),
                num_threads=4, provider='cpu'))
            if not config.validate():
                raise ValueError('Invalid local Kokoro bundle')
            engines[kind] = sherpa_onnx.OfflineTts(config)
    return engines[kind]

for clip in manifest['clips']:
    target = root / clip['file']
    if target.exists() and clip['status'] == 'generated-awaiting-review':
        if hashlib.sha256(target.read_bytes()).hexdigest() == clip.get('sha256'):
            continue
    target.parent.mkdir(parents=True, exist_ok=True)
    print('Generating', clip['id'], flush=True)
    tts = engine(clip['locale'])
    if clip['locale'] == 'yue':
        tts.synthesize(clip['text'], str(target), quality='duration_filter')
    else:
        import sherpa_onnx
        config = sherpa_onnx.GenerationConfig()
        config.sid = 2 if clip['locale'] == 'en' else 3
        config.speed = .9
        config.silence_scale = .2
        audio = tts.generate(clip['text'], config)
        sf.write(target, audio.samples, audio.sample_rate, subtype='PCM_16')
    samples, rate = sf.read(target)
    duration = len(samples) / rate
    if not np.isfinite(samples).all() or not .2 < duration < 30 or np.max(np.abs(samples)) < .01:
        raise ValueError('Invalid audio output: ' + clip['id'])
    clip.update(status='generated-awaiting-review', teacherReviewed=False,
                seconds=round(duration, 3), sampleRate=rate,
                sha256=hashlib.sha256(target.read_bytes()).hexdigest())
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    print('Saved', clip['id'], clip['seconds'], 'seconds', flush=True)
