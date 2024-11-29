const fetchPosts = async () => {
  const response = await fetch("http://localhost:5000/posts?_sort=-id");
  const postData = await response.json();
  return postData;
};

const fetchTags = async () => {
  const response = await fetch("http:localhost:5000/tags");
  const tagsData = response.json();
  return tagsData;
};

const addPost = async (post) => {
  const response = fetch("http://localhost:5000/posts", {
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
