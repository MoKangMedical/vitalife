function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function buildQualityVector(modality, payload = {}) {
  const defaults = {
    completeness: 0.86,
    signalToNoise: 0.82,
    recency: 0.9,
    calibration: 0.78,
    motionArtifact: 0.12
  };
  const merged = { ...defaults, ...payload };
  const score = clamp(
    merged.completeness * 0.3 +
      merged.signalToNoise * 0.25 +
      merged.recency * 0.2 +
      merged.calibration * 0.15 -
      merged.motionArtifact * 0.1
  );
  const flags = [
    merged.completeness >= 0.82 ? '完整度合格' : '完整度需复核',
    merged.signalToNoise >= 0.78 ? '信噪比合格' : '信噪比偏低',
    merged.motionArtifact <= 0.18 ? '运动伪差低' : '运动伪差偏高'
  ];
  const disposition = score >= 0.72 ? 'accepted' : score >= 0.48 ? 'weighted_down' : 'repeat_required';

  return {
    modality,
    score: Number(score.toFixed(2)),
    flags,
    status: disposition === 'accepted' ? 'usable' : disposition === 'weighted_down' ? 'review' : 'blocked',
    completeness: merged.completeness,
    signalToNoise: merged.signalToNoise,
    recency: merged.recency,
    calibration: merged.calibration,
    motionArtifact: merged.motionArtifact,
    disposition
  };
}
