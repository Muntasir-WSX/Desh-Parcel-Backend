export const calculateParcelDeliveryFee = (pickupAddress: string, deliveryAddress: string, weight: number): number => {

  const isInterCity = pickupAddress.toLowerCase().trim() !== deliveryAddress.toLowerCase().trim();

  const baseFee = isInterCity ? 120 : 80;
  const extraPerKgRate = 20;

  let totalFee = baseFee;

  if (weight > 3) {
    const extraWeight = Math.ceil(weight - 3);
    totalFee += extraWeight * extraPerKgRate;
  }

  return totalFee;
};