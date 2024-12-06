# Understanding React Query and State Management

## Why Use React Query for Data Fetching?

When using **React Query** for data fetching:

- No need to maintain separate states for `error`, `loading`, and `data`.
- Simplifies error handling; no need to manage different types of errors manually.
- Eliminates the need to write complex caching logic, as required in tools like Redux.
- Provides built-in features for efficient data fetching and error handling, such as:
  - `refetchOnWindowFocus`
  - `refetchOnReconnect`
  - `refetchInterval`
  - `retry`
  - `retryDelay`
  - `staleTime`
- Automatically retries on errors with customizable options (`retry` and `retryDelay`).
- Offers an optimized data fetching solution with many prebuilt options to handle different scenarios.(onMutate, onError, onSettled)

> **Key Benefit:** React Query gives powerful tools for efficient data fetching, data manipulation on the server, and seamless updates on the client.

---

## Server State vs Client State

- **Server State:**  
  Example: Fetched product details from the server.

  - Server data is asynchronous because it involves fetching data from a remote server.this why called asynchronous server state.

- **Client State:**  
  Example: Adding a product to a cart.
  - Client state involves managing interactions with cart.

- **React Query is used to store only this server state not client state**
---

## Using Redux and React Query

1. **When to Use React Query:**

   - Ideal for managing **server state** in projects where Redux is not being heavily used.
   - Hassle-free setup: No additional packages or complex configurations are required.

2. **When to Use Redux (with Thunks or RTK Query):**
   - Best suited for projects that are already using Redux heavily for **client state** management.
   - Redux middlewares like Thunks or RTK Query can also handle **server state**, making them a good choice in Redux-heavy projects.

---

```javascript
useQuery({
  queryKey: ["posts"],
  queryFn: fetchPosts,
});
```
### Q: Why is `queryKey` an array?

**A:** The `queryKey` is an array to uniquely identify and cache queries effectively.

- It allows additional context (e.g., **page number**) to be injected.
- This is particularly useful for scenarios like **pagination** and **filters**.

### useQueryClient

- The `useQueryClient` hook gives access to the **QueryClient instance** that was set up when configuring React Query. 
- Through this instance, you can interact with React Query's internal API to control and manage operations like queries, mutations, and caching. 
- It’s fair to call it an API, as it provides methods to manage React Query's functionality programmatically.


### Stale time vs Cache time

- **StaleTime (1 minute)**: Data is **fresh** for 1 minute; no refetch happens during this time.
- **After StaleTime**: Data becomes **stale**, but it stays in the cache.
- **CacheTime**: If no components use the query for the specified `cacheTime` (e.g., 5 minutes), the stale data is removed from memory. 

In short: **StaleTime** controls freshness; **CacheTime** controls how long unused data stays in memory.

### Stale data use cases
Stale data is used when a refetch isn’t possible due to network issues.Stale data can also be shown instantly while a background refetch updates it, avoiding blank states.

#### cacheTime:0
- As long as the component using the query is mounted, the data stays in memory.
- cacheTime: 0 only removes the data immediately after the component unmounts or stops observing the query.

### staleTime vs keepPreviousData
- staleTime: Controls how long the data is considered fresh and prevents unnecessary refetching.
- placeholderData with keepPreviousData: Doesn't affect data freshness; it just provides previous stale data as a placeholder.