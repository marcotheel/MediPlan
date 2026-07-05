const Admin = {
  pin: "1234",

  login(input) {
    return input === this.pin;
  }
};
