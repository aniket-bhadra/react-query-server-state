import React from "react";
import { useQuery } from "react-query";
import { fetchPosts } from "../api/api";

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
  return (
    <div className="container">
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
