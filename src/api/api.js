const fetchPosts = async (page) => {
  const response = await fetch(
    `http://localhost:5000/posts?_sort=-id&${
      page ? `_page=${page}&_per_page=5` : ""
    }`
  );
  if (!response.ok) {
    throw new Error("some error");
  }
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
