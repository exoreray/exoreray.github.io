"""Render an original, unhurried felt-piano/ambient instrumental. No samples."""
import math
import pathlib
import sys
import wave
import numpy as np

RATE = 32000
BEAT = 60 / 72
BARS = 64
DURATION = BARS * BEAT * 4 + 8
rng = np.random.default_rng(111026)
audio = np.zeros((int(DURATION * RATE), 2), dtype=np.float32)

def add_note(midi, when, velocity=.2, pan=0, sustain=5.5):
    t = np.arange(int(sustain * RATE), dtype=np.float32) / RATE
    f = 440 * 2 ** ((midi - 69) / 12)
    note = np.zeros(len(t), np.float32)
    # Inharmonic partials, fast damped attack, soft hammer noise, long felt decay.
    for partial, weight in [(1,1),(2,.27),(3,.12),(4,.045),(5,.02),(6,.006)]:
        frequency = f * partial * math.sqrt(1 + .000045 * partial * partial)
        envelope = np.exp(-t * (.56 + partial * .20))
        note += weight * np.sin(2 * math.pi * frequency * t) * envelope
        if partial == 1:
            note += .20 * np.sin(2 * math.pi * (frequency + .46) * t) * np.exp(-t * .6)
    note += rng.normal(0,.015,len(t)).astype(np.float32) * np.exp(-t * 100)
    note *= np.minimum(t / .011, 1) * np.minimum((sustain-t)/.25,1) * velocity
    start = max(0, int(when * RATE)); end = min(len(audio), start + len(note)); note = note[:end-start]
    audio[start:end,0] += note * math.sqrt((1-pan)/2)
    audio[start:end,1] += note * math.sqrt((1+pan)/2)

def add_pad(notes, when, length):
    t = np.arange(int(length * RATE), dtype=np.float32) / RATE
    envelope = np.minimum(t / 2,1) * np.minimum((length-t)/3,1)
    for midi in notes:
        f = 440 * 2 ** ((midi-69)/12)
        for channel, detune in [(0,-.25),(1,.25)]:
            value = (np.sin(2*math.pi*(f+detune)*t) + .13*np.sin(2*math.pi*(f*2+detune)*t)) * envelope * .011
            start=int(when*RATE);end=min(len(audio),start+len(value))
            audio[start:end,channel] += value[:end-start]

chords = [
    [48,55,59,64,67], [43,55,59,62,67], [45,52,55,59,64], [41,53,57,60,64],
    [48,55,60,64,69], [40,52,55,59,62], [38,53,57,60,64], [43,53,55,59,62]
]
motifs = [
    [(0,76),(.75,79),(1.5,74),(2.75,72)],
    [(.25,74),(1.5,71),(2.5,67)],
    [(0,72),(1,76),(2,79),(3.25,76)],
    [(.5,77),(1.5,76),(2.75,72)],
    [(0,79),(1.25,81),(2.5,76)],
    [(.5,74),(1.75,76),(3,71)],
    [(0,72),(1.25,74),(2.5,77),(3.25,76)],
    [(.5,74),(2,71),(3,72)]
]
for bar in range(BARS):
    chord = chords[bar % 8]; at = bar * BEAT * 4 + .25
    energy = .70 + .15 * math.sin(bar / BARS * math.pi)
    add_note(chord[0],at,velocity=.105*energy,pan=-.26,sustain=6)
    add_pad(chord[1:4],at,BEAT*4+4)
    for step, note in enumerate(chord[1:]):
        add_note(note,at+(step*.57+.37)*BEAT+rng.uniform(-.025,.025),.073*energy*rng.uniform(.9,1.1),pan=(step-1.5)*.12)
    # A sparse, repeating melody gains a little height in the middle.
    if bar >= 4:
        for beat, note in motifs[bar % 8]:
            if bar >= 48 and beat < 1: continue
            octave = 12 if 24 <= bar < 40 and bar % 4 == 0 else 0
            add_note(note+octave,at+beat*BEAT+rng.uniform(-.025,.025),.103*energy*rng.uniform(.85,1.05),pan=.13,sustain=5)

# Wide multi-tap room: short reflections followed by a long, quiet tail.
dry = audio.copy()
for seconds, gain in [(.083,.14),(.137,.12),(.223,.10),(.371,.085),(.557,.072),(.809,.06),(1.111,.048),(1.503,.035),(2.03,.024),(2.71,.015)]:
    delay = int(seconds*RATE)
    audio[delay:] += dry[:-delay, ::-1] * gain
audio = np.tanh(audio * 1.2)
audio *= .58 / max(float(np.max(np.abs(audio))), .01)
audio *= np.minimum(np.arange(len(audio)) / (RATE*5), 1)[:,None]
audio *= np.minimum(np.arange(len(audio),0,-1) / (RATE*7), 1)[:,None]
output=pathlib.Path(sys.argv[1])
with wave.open(str(output),'wb') as file:
    file.setnchannels(2);file.setsampwidth(2);file.setframerate(RATE)
    file.writeframes((audio * 32767).astype('<i2').tobytes())
print(f'Original instrumental: {DURATION:.1f}s, peak {np.max(np.abs(audio)):.3f}')
