const Router = {
  current: "dashboard",
  go(page) {
    this.current = page;
    console.log("Route:", page);
  }
};
