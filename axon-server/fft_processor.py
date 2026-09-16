import numpy as np

def extract_features(samples, fs=500):
    samples = np.array(samples, dtype=float)
    n = len(samples)
    fft_vals = np.fft.rfft(samples)
    magnitudes = np.abs(fft_vals)
    freqs = np.fft.rfftfreq(n, d=1.0/fs)

    dominant_idx = np.argmax(magnitudes)
    dominant_freq = float(freqs[dominant_idx])
    peak_power = float(magnitudes[dominant_idx])
    rms_amplitude = float(np.sqrt(np.mean(samples**2)))

    total_mag = np.sum(magnitudes) + 1e-10
    spectral_centroid = float(np.sum(freqs * magnitudes) / total_mag)

    def band_energy(f_low, f_high):
        mask = (freqs >= f_low) & (freqs <= f_high)
        return float(np.sum(magnitudes[mask]))

    return {
        "dominant_freq": dominant_freq,
        "peak_power": peak_power,
        "rms_amplitude": rms_amplitude,
        "spectral_centroid": spectral_centroid,
        "energy_0_20hz": band_energy(0, 20),
        "energy_20_80hz": band_energy(20, 80),
        "energy_80_200hz": band_energy(80, min(200, fs/2))
    }
