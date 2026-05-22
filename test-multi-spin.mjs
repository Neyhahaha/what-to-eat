/**
 * 完整转盘测试：模拟连续多次转动，验证指针和弹窗一致性
 */

function getCurrentRotation(rotationDeg) {
  const rad = rotationDeg * Math.PI / 180;
  return Math.atan2(Math.sin(rad), Math.cos(rad)) * (180 / Math.PI);
}

function spin(targetIndex, totalFoods, currentRotation) {
  const segmentAngle = 360 / totalFoods;
  const segmentCenter = targetIndex * segmentAngle + segmentAngle / 2;

  const currentNormalized = ((currentRotation % 360) + 360) % 360;
  const targetAbsolute = (360 - segmentCenter) % 360;
  const relativeRotation = ((targetAbsolute - currentNormalized) % 360 + 360) % 360;
  const totalRotation = 360 * Math.floor(5 + Math.random() * 3) + relativeRotation;
  const newRotation = currentRotation + totalRotation;

  return { newRotation, relativeRotation, currentNormalized, targetAbsolute, segmentCenter };
}

function getSegmentAtPointer(rotation, totalFoods) {
  const segmentAngle = 360 / totalFoods;
  const effectiveAngle = ((rotation % 360) + 360) % 360;
  // 旋转后，canvas 上角度 α 的扇区移到视觉角度 (α + effectiveAngle) mod 360
  // 指针在 0°，需要 (α + effectiveAngle) mod 360 = 0 → α = (360 - effectiveAngle) mod 360
  const landingAngle = (360 - effectiveAngle + 360) % 360;
  for (let i = 0; i < totalFoods; i++) {
    const start = i * segmentAngle;
    const end = (i + 1) * segmentAngle;
    if (landingAngle >= start && landingAngle < end) {
      return i;
    }
  }
  return Math.floor(landingAngle / segmentAngle) % totalFoods;
}

const TOTAL = 12;
let rotation = 0;
const trials = 10;

console.log('=== 连续转动模拟 (12个食物, 10轮) ===\n');

for (let i = 0; i < trials; i++) {
  const targetIdx = Math.floor(Math.random() * TOTAL);
  const result = spin(targetIdx, TOTAL, rotation);
  rotation = result.newRotation;

  const effectiveAngle = ((rotation % 360) + 360) % 360;
  const visualPos = ((result.segmentCenter + effectiveAngle) % 360 + 360) % 360;
  const pointed = getSegmentAtPointer(rotation, TOTAL);
  const ok = pointed === targetIdx;

  console.log(
    `第${(i + 1).toString().padStart(2)}轮: ` +
    `目标[${targetIdx}] ${ok ? '✓' : '✗'} ` +
    `segCenter=${result.segmentCenter.toFixed(1)}° ` +
    `effective=${effectiveAngle.toFixed(1)}° ` +
    `visualPos=${visualPos.toFixed(1)}° ` +
    `pointed=[${pointed}] ` +
    `curNorm=${result.currentNormalized.toFixed(1)}° ` +
    `targetAbs=${result.targetAbsolute.toFixed(1)}° ` +
    `relRot=${result.relativeRotation.toFixed(1)}°`
  );

  if (!ok) {
    console.log(`  ❌ MISMATCH! segmentCenter + effectiveAngle = ${(result.segmentCenter + effectiveAngle).toFixed(1)}°`);
  }
}