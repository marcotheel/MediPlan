const Validators = {
  required(value) {
    return String(value ?? "").trim().length > 0;
  },
  nonNegativeNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) && number >= 0;
  },
  time(value) {
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(String(value));
  }
};
