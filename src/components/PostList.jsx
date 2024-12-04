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
  const queryClient = useQueryClient();

  const { data: tagsData } = useQuery({
    queryKey: ["tags"],
    queryFn: fetchTags,
  });

  const { mutate } = useMutation({
    mutationFn: addPost,
    //runs before actual mutation
    onMutate: () => {
      return {
        title: true, //this becomes the context parameter of onSuccess method
      };
    },
    //runs after successful mutation
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ["posts"],
        //The `exact: true` ensures that only the query with the exact key `["posts"]` is invalidated, not other queries with keys starting with `["posts"]`, like `["posts", "1"]`.
        exact: true,
        //This invalidates all queries where the first key is "posts". Use it for complex cases instead of exact.only one is used at a time.The predicate function runs for every query in the cache when invalidateQueries is called (e.g., after a mutation's success). It checks each query key and invalidates those that satisfy the condition.
        //predicate: (query) => query.queryKey[0] === "posts",
      });
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
