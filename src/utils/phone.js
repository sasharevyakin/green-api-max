// приводим введенный номер к виду 79001234567 или 375291234567, иначе возвращает null, согласно доке макса
export function normalizePhone(input) {
  let digits = input.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('8')) {
    digits = '7' + digits.slice(1);
  }
  const isRu = digits.length === 11 && digits.startsWith('7');
  const isBy = digits.length === 12 && digits.startsWith('375');
  return isRu || isBy ? digits : null;
}