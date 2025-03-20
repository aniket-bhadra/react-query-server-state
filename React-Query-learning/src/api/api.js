const fetchPosts = async (page) => {
  const response = await fetch(
    `http://localhost:5000/posts?_sort=-id&${
      page ? `_page=${page}&_per_page=5` : ""
    }`
  );
  const postData = await response.json();
  return postData;
};

const fetchTags = async () => {
  const response = await fetch("http://localhost:5000/tags");
  const tagsData = response.json();
  return tagsData;
};

const addPost = async (post) => {
  const response = await fetch("http://localhost:5000/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(post),
  });
  const newPost = await response.json();
  return newPost;
};

export { fetchPosts, fetchTags, addPost };
// create function to fetch data from the API

//find prime number checking
function isPrime(num) {
  if (num < 2) return false;
  for (let k = 2; k < num; k++) {
    if (num % k === 0) return false;
  }
  return true;
}
//find fibonacci series
function fibonacci(n) {
  let arr = [0, 1];
  for (let i = 2; i < n; i++) {
    arr.push(arr[i - 1] + arr[i - 2]);
  }
  return arr;
}

//find factorial of a number
function factorial(n) {
  if (n === 0) return 1;
  return n * factorial(n - 1);
}


