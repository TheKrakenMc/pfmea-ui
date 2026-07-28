export const calculateActionPriority = (s?: number, o?: number, d?: number): 'H' | 'M' | 'L' | undefined => {
  if (!s || !o || !d) return undefined;

  // S = 9-10
  if (s >= 9) {
    if (o >= 8) return 'H'; // D=1-10 -> H
    if (o >= 6) return 'H'; // D=1-10 -> H
    if (o >= 4) {
      if (d >= 2) return 'H';
      return 'M';
    }
    if (o >= 2) {
      if (d >= 7) return 'H';
      if (d >= 5) return 'M';
      return 'L';
    }
    return 'L'; // O=1 -> L
  }

  // S = 7-8
  if (s >= 7) {
    if (o >= 8) return 'H'; // D=1-10 -> H
    if (o >= 6) {
      if (d >= 2) return 'H';
      return 'M';
    }
    if (o >= 4) {
      if (d >= 7) return 'H';
      return 'M'; // D=1-6 -> M
    }
    if (o >= 2) {
      if (d >= 5) return 'M';
      return 'L';
    }
    return 'L'; // O=1 -> L
  }

  // S = 4-6
  if (s >= 4) {
    if (o >= 8) {
      if (d >= 7) return 'H';
      return 'M'; // D=1-6 -> M
    }
    if (o >= 6) {
      if (d >= 7) return 'M';
      if (d >= 5) return 'M';
      if (d >= 2) return 'M';
      return 'L';
    }
    if (o >= 4) {
      if (d >= 7) return 'M';
      return 'L'; // D=1-6 -> L
    }
    return 'L'; // O=1-3 -> L
  }

  // S = 2-3
  if (s >= 2) {
    if (o >= 8) {
      if (d >= 5) return 'M';
      return 'L';
    }
    return 'L'; // O=1-7 -> L
  }

  // S = 1
  return 'L';
};
