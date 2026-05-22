/**
 * 验证转盘旋转角度计算是否正确
 *
 * CSS transform: rotate(θdeg) 生成矩阵:
 *   [a=cosθ  c=-sinθ]
 *   [b=sinθ  d=cosθ ]
 *
 * 提取角度: atan2(b, a) = atan2(sinθ, cosθ) = θ (正确)
 *            atan2(d, c) = atan2(cosθ, -sinθ) ≠ θ (错误, 修复前)
 */

function getRotationFixed(m12, m11) {
  return Math.atan2(m12, m11) * (180 / Math.PI);
}

function getRotationBuggy(m22, m21) {
  return Math.atan2(m22, m21) * (180 / Math.PI);
}

function matrixForAngle(deg) {
  const rad = deg * Math.PI / 180;
  return {
    m11: Math.cos(rad),  // a
    m12: Math.sin(rad),  // b
    m21: -Math.sin(rad), // c
    m22: Math.cos(rad),  // d
  };
}

const testAngles = [0, 30, 45, 90, 180, 270, 315, -90];

let allPass = true;
console.log('=== 旋转角度提取测试 ===\n');

for (const angle of testAngles) {
  const m = matrixForAngle(angle);
  const fixed = getRotationFixed(m.m12, m.m11);
  const buggy = getRotationBuggy(m.m22, m.m21);

  const fixedOk = Math.abs(fixed - angle) < 0.01 || Math.abs(fixed - angle - 360) < 0.01;
  const buggyOk = Math.abs(buggy - angle) < 0.01 || Math.abs(buggy - angle - 360) < 0.01;

  console.log(`θ=${angle}°`);
  console.log(`  矩阵: a=${m.m11.toFixed(2)} b=${m.m12.toFixed(2)} c=${m.m21.toFixed(2)} d=${m.m22.toFixed(2)}`);
  console.log(`  修复后 atan2(b,a): ${fixed.toFixed(2)}° ${fixedOk ? '✓' : '✗'}`);
  console.log(`  修复前 atan2(d,c): ${buggy.toFixed(2)}° ${buggyOk ? '✓' : '✗'}`);
  console.log('');

  if (!fixedOk) allPass = false;
}

// 验证目标角度计算
console.log('=== 转盘目标角度测试 ===\n');

function calcTargetAngle(targetIndex, totalFoods) {
  const segmentAngle = 360 / totalFoods;
  const targetAngle = 360 - (targetIndex * segmentAngle + segmentAngle / 2);
  const totalRotation = 360 * 5 + targetAngle;
  return { segmentAngle, targetAngle, totalRotation };
}

for (let foods = 2; foods <= 12; foods += 2) {
  for (let idx = 0; idx < foods; idx++) {
    const { segmentAngle, targetAngle, totalRotation } = calcTargetAngle(idx, foods);
    const finalAngle = totalRotation % 360;
    const segmentCenter = (idx * segmentAngle + segmentAngle / 2) % 360;
    // 旋转 finalAngle 度后，原来在 segmentCenter 度的扇区应该出现在 0 度(指针处)
    // 即: segmentCenter + finalAngle ≡ 0 (mod 360)
    const visualPos = (segmentCenter + finalAngle) % 360;
    const ok = visualPos < 0.01 || Math.abs(visualPos - 360) < 0.01;
    if (!ok) {
      console.log(`✗ foods=${foods}, target=${idx}: segmentCenter=${segmentCenter.toFixed(1)}°, finalAngle=${finalAngle.toFixed(1)}°, visualPos=${visualPos.toFixed(1)}°`);
      allPass = false;
    }
  }
}

if (allPass) {
  console.log('✓ 所有目标角度计算通过！');
}

// 完整端到端模拟
console.log('\n=== 端到端模拟 (12 个食物) ===\n');

const TOTAL_FOODS = 12;
for (let trial = 0; trial < 5; trial++) {
  const targetIndex = Math.floor(Math.random() * TOTAL_FOODS);
  const { segmentAngle, targetAngle, totalRotation } = calcTargetAngle(targetIndex, TOTAL_FOODS);

  // 模拟：获取当前旋转角度 (假设初始 0)
  const currentRotation = 0; // 首次转动
  const newRotation = currentRotation + totalRotation;
  const finalAngle = newRotation % 360;

  // 验证：旋转 finalAngle 度后，targetIndex 对应的扇区中心应该在指针(0°)处
  const segmentCenter = targetIndex * segmentAngle + segmentAngle / 2;
  // 旋转后：原 canvas 上 segmentCenter 位置 → visual = segmentCenter + finalAngle (mod 360)
  // 我们需要: (segmentCenter + finalAngle) mod 360 = 0
  const landed = ((segmentCenter + finalAngle) % 360 + 360) % 360;
  const match = landed < 0.1 || landed > 359.9;

  console.log(
    `第${trial + 1}次: 目标=${targetIndex}(${segmentCenter.toFixed(1)}°) ` +
    `→ 旋转=${newRotation.toFixed(1)}° → 落地角度=${landed.toFixed(2)}° ${match ? '✓' : '✗'}`
  );

  if (!match) allPass = false;
}

console.log(allPass ? '\n✅ 所有测试通过!' : '\n❌ 存在问题!');
process.exit(allPass ? 0 : 1);