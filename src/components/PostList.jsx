import React from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { addPost, fetchPosts, fetchTags } from "../api/api";

const PostList = () => {
  const {
    data: postsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });

  const { data: tagsData } = useQuery({
    queryKey: ["tags"],
    queryFn: fetchTags,
  });

  const { mutate } = useMutation({
    mutationFn: addPost,
    onSuccess: (data, variables) => {
      console.log(data, variables);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const title = formData.get("title");
    const tags = [...formData.keys()].filter((key) => key !== "title");

    if (!title || !tags.length) return;

    mutate({
      id: postsData.length + 1,
      title,
      tags,
    });

    e.target.reset();
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter your post..."
          name="title"
          className="postbox"
        />
        <div className="tags">
          {tagsData?.map((tag) => (
            <div key={tag}>
              <input type="checkbox" name={tag} id={tag} />
              <label htmlFor={tag}>{tag}</label>
            </div>
          ))}
        </div>
        <button type="submit">Post</button>
      </form>
      {isLoading && <p>Loading.....</p>}
      {isError && <p>{error?.message}</p>}
      {postsData?.map((post) => (
        <div key={post.id} className="post">
          <div>{post.title}</div>
          {post.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      ))}
    </div>
  );
};

export default PostList;
