export const ethUnit = 100_000_000n;
export const promoCode = 'KURIO10';
export const networkFee = 1_600_000n;

export const toEthUnits = (value: string) => {
  const [whole, fraction = ''] = value.split('.');
  return BigInt(whole) * ethUnit + BigInt(fraction.padEnd(8, '0'));
};

export const formatEth = (value: bigint) => {
  const whole = value / ethUnit;
  const fraction = (value % ethUnit).toString().padStart(8, '0').replace(/0+$/, '');
  return fraction ? `${whole}.${fraction}` : whole.toString();
};
