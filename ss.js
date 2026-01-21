function fetch() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("done");
    }, 3000);
  });
}

console.log("first");
