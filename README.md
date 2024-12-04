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