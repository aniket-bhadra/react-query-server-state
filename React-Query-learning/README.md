# React Query and State Management Guide

## 1. Introduction to React Query

### Why Use React Query for Data Fetching?

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
- Offers an optimized data fetching solution with many prebuilt options to handle different scenarios (onMutate, onError, onSettled).

> **Key Benefit:** React Query gives powerful tools for efficient data fetching, data manipulation on the server, and seamless updates on the client.

---

## 2. Understanding Server State vs Client State

- **Server State:**  
  Example: Fetched product details from the server.
  - Server data is asynchronous because it involves fetching data from a remote server. This is why it's called asynchronous server state.

- **Client State:**  
  Example: Adding a product to a cart.
  - Client state involves managing interactions with cart.

- **React Query is used to store only this server state not client state**

---

## 3. When to Use React Query vs Redux

1. **When to Use React Query:**
   - Ideal for managing **server state** in projects where Redux is not being heavily used.
   - Hassle-free setup: No additional packages or complex configurations are required.

2. **When to Use Redux (with Thunks or RTK Query):**
   - Best suited for projects that are already using Redux heavily for **client state** management.
   - Redux middlewares like Thunks or RTK Query can also handle **server state**, making them a good choice in Redux-heavy projects.

---

## 4. Core Functionality: useQuery

### Basic Usage

```javascript
useQuery({
  queryKey: ["posts"],
  queryFn: fetchPosts,
});
```

This `queryFn` has to be the function which returns a promise. You can put this function in a separate file and import it, making it more manageable and preventing it from being recreated on every re-render.

### Error Handling

The `useQuery` returns an error state, but this error is not handled by `useQuery` itself. For example:

```javascript
const fetchProducts = async () => {
  const response = await fetch("https://dummyjson.com/productss");
  const data = await response.json();
  return data.products;
};
```

In this function, the URL is incorrect, but since `fetch` does not handle such errors, we don't get the exact error. Instead, we get an error from `response.json()`. If we put proper error handling, we can get the exact error (which is a bad request).

React Query retries failed requests three times by default before showing the error.

### Why is `queryKey` an array?

**A:** The `queryKey` is an array to uniquely identify and cache queries effectively.

- It allows additional context (e.g., **page number**) to be injected.
- This is particularly useful for scenarios like **pagination** and **filters**.

If the query key changes, the query is automatically refetched:

```javascript
const {
  data: postsData,
  isLoading,
  isError,
  error,
} = useQuery({
  queryKey: ["posts", { page }],
  queryFn: () => fetchPosts(page),
  // cacheTime: 0
  // refetchInterval: 3 * 1000,
  // staleTime: 1000 * 60 * 5
  // placeholderData: keepPreviousData,
});
```

Here, if the `page` changes inside the `queryKey`, then the query is automatically refetched with the new page.

In query configuration, we can pass:

```javascript
placeholderData: keepPreviousData;
```

This ensures that during pagination, the current page data remains visible until the next page data arrives. This prevents the product list from becoming null, providing a better user experience as the UI doesn't jump while waiting for new data.

It's also good practice to put pagination filter state into the URL, since if we navigate to other routes, this URL state will not be reset (unlike normal state) and it's easy to share with others.

### useQueryClient

- The `useQueryClient` hook gives access to the **QueryClient instance** that was set up when configuring React Query.
- Through this instance, you can interact with React Query's internal API to control and manage operations like queries, mutations, and caching.
- It's fair to call it an API, as it provides methods to manage React Query's functionality programmatically.

Stale time can be passed individually in every query or directly inside the `queryClient` so that it applies to all queries.

Stale queries are refetched automatically in the background when:

- A component remounts (e.g., navigating away and back, or reopening a modal) → If the query's data became stale in the meantime, React Query automatically refetches it in the background.
- The window is refocused
- The network is reconnected
- If you set `refetchInterval`, React Query will automatically refetch the data at that interval, acting like HTTP polling.

### ✅ `useQuery` - What It Can Take (Options)

- `queryKey`: **Unique key** to identify the query (e.g., `["todos"]`).
- `queryFn`: Function that **fetches the data** (e.g., `fetchTodos`).
- `enabled`: `false` means **query won't run automatically** (default: `true`).
- `staleTime`: How long data stays **fresh** before refetching (default: `0ms`).
- `cacheTime`: How long unused data stays in cache **after becoming stale** (default: `5 minutes`).
- `refetchOnWindowFocus`: `true` = Refetch when **window is focused** (default: `true`).
- `onSuccess`: Callback **when data is successfully fetched**.
- `onError`: Callback **when fetching fails**.

### ✅ `useQuery` - What It Returns

- `data`: **Fetched data** (or `undefined` if not yet fetched).
- `isLoading`: `true` when **first-time fetching**.
- `isFetching`: `true` when **refetching** in the background.
- `isError`: `true` if **fetch failed**.
- `error`: The **error object** (if fetching failed).
- `refetch()`: Manually **refetch the data**.

### ✅ When `useQuery` Executes

- **Automatically runs when the component mounts.**
- **Runs again when the `queryKey` changes.**
- **Runs again when the window is focused (if `refetchOnWindowFocus` is `true`).**
- **Runs when manually triggered via `refetch()`.**
- **Runs on network reconnect if `refetchOnReconnect` is `true`.**

```javascript
const { data, isLoading, isError, error, refetch } = useQuery({
  queryKey: ["todos"],
  queryFn: fetchTodos,
  staleTime: 5000, // Data stays fresh for 5 sec before refetching
  refetchOnWindowFocus: false, // Won't refetch when switching back to tab
  onSuccess: () => console.log("✅ Fetched successfully"),
  onError: (err) => console.log("❌ Error:", err.message),
});
```

---

## 5. Stale Time vs Cache Time

- **StaleTime (1 minute)**: Data is **fresh** for 1 minute; no refetch happens during this time.
- **After StaleTime**: Data becomes **stale**, but it stays in the cache.
- **CacheTime**: The cacheTime countdown starts when data becomes inactive (meaning when no components are using that query data), regardless of whether it's stale or fresh. If the data remains inactive for the entire duration of the cacheTime, then the data is removed from the cache.

Even after data becomes stale, it's still shown to the user while a refetch happens in the background. Staleness doesn't mean the data disappears - it just triggers a background refresh.

In short: **StaleTime** controls freshness; **CacheTime** controls how long unused data stays in memory.

### Stale data use cases

Stale data is used when a refetch isn't possible due to network issues. Stale data can also be shown instantly while a background refetch updates it, avoiding blank states.

### cacheTime:0

- As long as the component using the query is mounted, the data stays in memory.
- cacheTime: 0 only removes the data immediately after the component unmounts or stops observing the query.

### staleTime vs keepPreviousData

- staleTime: Controls how long the data is considered fresh and prevents unnecessary refetching.
- placeholderData with keepPreviousData: Doesn't affect data freshness; it just provides previous stale data as a placeholder.

### Retry and RetryDelay Options

- **`retry`** → Controls **how many times** React Query retries a failed request before showing an error.
- **`retryDelay`** → Controls the **time between retries**. By default, it uses **exponential backoff**, meaning each retry waits **longer** than the previous one.

### **Why not change `retryDelay` manually?**

- The default **exponential backoff** prevents **overloading the server**.
- Setting a **fixed `retryDelay`** (e.g., `1000ms` for all retries) can **waste resources** if the server is temporarily slow or down.

---

## 6. Query Key Importance

### query refetches only when a variable inside the queryKey changes

- The query refetches only when a variable inside the queryKey (like `Toggle`) changes.
- Any other variable changes (even important ones) won't trigger a refetch unless explicitly included in the queryKey.

For example:

```javascript
queryKey: ["product", productId];
```

Now React Query creates a unique key by combining these 2 values and stores it in the cache. If `productId` changes, then a refetch happens automatically. This means if the `productId` changes, then the function we defined gets called automatically.

---

## 7. Mutations with useMutation

### **✅ `useMutation` - What It Can Take (Options)**

- `mutationFn`: **Function to perform mutation** (e.g., POST request).
- `onMutate`: Runs **before the mutation starts** (can return context for rollback).
- `onSuccess`: Runs **after a successful mutation**.
- `onError`: Runs **if the mutation fails** (receives error & context).
- `onSettled`: Runs **after success or error** (cleanup).
- `retry`: Number of retries on failure (default: `3`).

### **✅ `useMutation` - What It Returns**

- `mutate()`: Function to **trigger the mutation**.
- `mutateAsync()`: Same as `mutate()` but returns a Promise.
- `isPending`: `true` when mutation is in progress.
- `isSuccess`: `true` if mutation **succeeded**.
- `isError`: `true` if mutation **failed**.
- `error`: Holds error details if failed.

### **✅ Example: `useMutation` with Key Options & Returns**

```tsx
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const addTodo = async (newTodo) => {
  const { data } = await axios.post("/todos", newTodo);
  return data;
};

function AddTodo() {
  const mutation = useMutation({
    mutationFn: addTodo,
    onSuccess: (data) => console.log("✅ Todo added:", data),
    onError: (error) => console.log("❌ Error:", error.message),
  });

  return (
    <div>
      <button
        onClick={() => mutation.mutate({ title: "New Todo" })}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Adding..." : "Add Todo"}
      </button>
      {mutation.isError && <p>Error: {mutation.error.message}</p>}
      {mutation.isSuccess && <p>Todo added!</p>}
    </div>
  );
}

export default AddTodo;
```

### **📝 What This Example Does:**

- **Posts a new todo** to `/todos`.
- **Returns:** `mutate()`, `isPending`, `isError`, `isSuccess`, `error`.
- **Logs success/error messages.**
- **Button disables while mutation is running.**

This is the **simplest and cleanest** example! 🚀

---

## 8. Updating UI After Mutations

There are two ways to update the UI when a new todo is added:
1️⃣ Using useState → Store data in state and manually update it with setState.
2️⃣ Updating the Query Cache (queryClient.setQueryData) → Update the cache, so the UI automatically syncs.

### 1️⃣ Manual State Updates

Here we can rely on either `mutation.data` or we can update directly the state:

✅ but Instead of relying on `mutation.data`, it's better to **manually update the UI** inside `onSuccess`.

### **Why?**

1. **`mutation.data` is not reactive** → It won't automatically update the UI state.
2. **Better state management** → Using `onSuccess`, you can update the todo state properly.

### **Best Practice:**

- **Use `onSuccess` to update the state** (e.g., appending the new todo).
- **Avoid using `mutation.data` directly** for UI updates.

✅ **Example (Updating Todo List in `onSuccess`)**

```tsx
const [todos, setTodos] = useState([]);

const mutation = useMutation({
  mutationFn: addTodo,
  onSuccess: (newTodo) => {
    setTodos((prev) => [...prev, newTodo]); // Append to state
  },
});
```

This ensures **better UI updates and reactivity**! 🚀

### 2️⃣ Updating Query Cache

### **Example (Updating Cache on Mutation Success)**

```tsx
const queryClient = useQueryClient();

const mutation = useMutation(addTodo, {
  onSuccess: (newTodo) => {
    queryClient.setQueryData(["todos"], (oldTodos) => [...oldTodos, newTodo]);
  },
});
```

- **🚀 This updates the cache**, so `useQuery` re-renders with the new data automatically!
- **No need for extra `useState`!**

### **Which is better?**

- **Cache update (`setQueryData`) is better** ✅ because `useQuery` data stays in sync with React Query's cache, avoiding unnecessary state duplication.

🔹 **Conclusion:** You don't update `data` directly. Instead:  
✅ Use `useState` (if manually handling data).  
✅ Use `setQueryData` (recommended) to update the cache → UI auto-refreshes.

---

## 9. React Query vs Apollo Client Caching

✅ Yes, in Apollo Client, the cache automatically updates if the response contains the same \_\_typename and id.

### How does Apollo auto-update the cache?

Apollo normalizes data by storing objects with **typename and id.
When a new response comes with the same **typename and id, Apollo merges it into the cache automatically.
No manual update needed if fields match; UI updates automatically.

❌ **No, React Query does NOT auto-update the cache like Apollo Client.**

### **Why?**

- React Query **does not normalize data** like Apollo.
- A mutation does **not automatically merge** new data into the cache.

### **How to update UI after mutation?**

✅ **Manually update the cache** using `queryClient.setQueryData`:

```tsx
const queryClient = useQueryClient();

const mutation = useMutation(addTodo, {
  onSuccess: (newTodo) => {
    queryClient.setQueryData(["todos"], (oldTodos) => [...oldTodos, newTodo]);
  },
});
```

✅ **Or refetch the query** after mutation:

```tsx
const mutation = useMutation(addTodo, {
  onSuccess: () => {
    queryClient.invalidateQueries(["todos"]); // Triggers refetch
  },
});
```

🔹 **Conclusion:** Unlike Apollo, React Query **doesn't auto-merge** new data into the cache. You must **manually update the cache or refetch the query**. 🚀

---

## 10. Optimistic Updates

**Optimistic Updates - Summary**
✅ **What is Optimistic Update?**

- Update UI **before** the server responds, assuming success.
- If the server fails, **rollback** to the previous state.

✅ **Steps for Optimistic Updates in React Query:**

1. `onMutate` → Before mutation, update UI optimistically and save previous data for rollback.
2. `mutationFn` (async request) → Send data to the server.
3. `onError` → If the request fails, rollback using saved data.
4. `onSuccess` → If successful, optionally sync cache.
5. `onSettled` → Invalidate & refetch to ensure fresh data.

✅ **Example (Todos App)**

```tsx
const queryClient = useQueryClient();

const mutation = useMutation(addTodo, {
  onMutate: async (newTodo) => {
    await queryClient.cancelQueries(["todos"]); // Stop ongoing fetches

    const previousTodos = queryClient.getQueryData(["todos"]); // Get current data

    queryClient.setQueryData(["todos"], (oldTodos) => [...oldTodos, newTodo]); // Optimistic UI update

    return { previousTodos }; // Save old state for rollback
  },
  onError: (error, newTodo, context) => {
    queryClient.setQueryData(["todos"], context.previousTodos); // Rollback on error
  },
  onSettled: () => {
    queryClient.invalidateQueries(["todos"]); // Refetch to sync with the server
  },
});
```

Here, the `onMutate` function receives `newTodo` before the mutation request is sent to the server. In `onMutate`, you receive the `newTodo` that you're about to submit to the server.

✅ **Key Notes:**

- `setQueryData()` updates the cache **synchronously**, while React UI updates happen **asynchronously**.
- `cancelQueries()` is **async** (returns a Promise) because it needs to stop network requests in flight.
- Rollback works because `onMutate` **returns previous state**, which is then used in `onError`.
- `invalidateQueries()` in `onSettled` ensures data consistency with the server.

### Why we refetch in `onSettled` when we've already updated the UI:

The refetch is important because:

1. The optimistic update only guesses what the server will do - it doesn't know for sure
2. The server might add additional data (like IDs, timestamps, or other fields)
3. The server might modify the data slightly (like formatting, calculations, etc.)
4. Other users might have modified the data between your request and response

The `onSettled` refetch is not strictly required, but it's a best practice to ensure your client data matches what's actually on the server. You can remove it if:

- Your server responses exactly match your optimistic updates
- You don't need the data to be perfectly in sync with the server
- You want to reduce network requests

In many real applications, this final refetch is important for data consistency and preventing subtle bugs.

### Why `await` is used before `cancelQueries()` but not before `setQueryData()`:

`queryClient.cancelQueries(['todos'])` returns a Promise because it performs an asynchronous operation - it has to communicate with the query system to stop ongoing network requests that might be in flight. This is a truly asynchronous operation that needs to complete before proceeding, so `await` is necessary.

In contrast, `queryClient.setQueryData()` doesn't need `await` because:

1. The cache update itself is synchronous - it immediately modifies the data in React Query's cache
2. Even though the UI updates triggered by this change are asynchronous, the function doesn't return a Promise
3. The cache modification is complete as soon as the function returns

This pattern is common in optimistic updates:

- First, await cancellation of ongoing queries (async operation)
- Then synchronously update the cache (setQueryData)
- Then proceed with the rest of the function

So React Query's `setQueryData()` updates the cache synchronously while UI updates happen asynchronously. The function completes its work immediately (modifying the cache), so there's no Promise to await.

### Two Approaches to Optimistic Updates

**React Query provides two ways to optimistically update your UI before a mutation completes:**

1. **Using `onMutate` to update the cache directly:**  
   This option allows you to immediately update the local cache with the new data before the mutation is confirmed by the server. It's especially useful when multiple UI components rely on the same data.

2. **Using the `variables` returned from `useMutation` to update the UI temporarily:**  
   With this approach, you can display a temporary UI change based on the data passed to the mutation. The `variables` field holds the data you submitted, and you can use it to render a pending state in your UI.

Here's an example:

```tsx
const { isPending, variables, mutate, isError } = useMutation({
  mutationFn: (newTodo: string) => axios.post("/api/data", { text: newTodo }),
  // Ensure the mutation remains in a pending state until refetch is finished
  onSettled: async () => {
    return await queryClient.invalidateQueries({ queryKey: ["todos"] });
  },
});
```

In your UI, you can display a temporary list item while the mutation is pending:

```tsx
<ul>
  {todoQuery.items.map((todo) => (
    <li key={todo.id}>{todo.text}</li>
  ))}
  {isPending && <li style={{ opacity: 0.5 }}>{variables}</li>}
</ul>
```

If the mutation fails, the temporary item will be removed, but since the `variables` are still available, you can offer a retry option:

```tsx
{
  isError && (
    <li style={{ color: "red" }}>
      {variables}
      <button onClick={() => mutate(variables)}>Retry</button>
    </li>
  );
}
```

### When to Use Each Approach

- **Using `variables`:**  
  Best when the optimistic update affects a single UI element. This approach is simpler because you don't need to manage rollbacks manually.

- **Using `onMutate`:**  
  Use this method when multiple parts of the UI depend on the updated data. Directly updating the cache ensures that all UI components reflect the change immediately.

---

## 11. Advanced Mutation Topics

### **Using `onSuccess` and `onError` with `mutate()` - Summary**

✅ **Why use `onSuccess` and `onError` in `mutate()`?**

- **To handle specific cases per mutation call**, instead of using the default ones in `useMutation()`.
- Useful when **different actions** should happen for different mutations.

✅ **Key Differences**

- `onSuccess` inside `useMutation()` → Runs **for all `mutate()` calls**.
- `onSuccess` inside `mutate()` → Runs **only for that specific mutation call**.

✅ **Example (Adding Todos)**

```tsx
const mutation = useMutation(addTodo, {
  onSuccess: () => {
    console.log("Global success: Todo added!");
  },
  onError: () => {
    console.log("Global error: Failed to add todo.");
  },
});

// Calling `mutate()` with specific `onSuccess` and `onError`
mutation.mutate(todo, {
  onSuccess: () => {
    console.log("Specific success: Todo added!");
  },
  onError: () => {
    console.log("Specific error: Failed to add this todo.");
  },
});
```

✅ **When to Use?**

- **Use `onSuccess` inside `mutate()`** when you need a **different action** per call.
- **Use `onError` inside `mutate()`** to handle specific failure cases.
- **Use `onSuccess` in `useMutation()`** for **global success actions** like cache updates.

🚀 **This allows flexibility!**

### No Need for try...catch()

✅ **Correct!** You **do not** need to use `try...catch` inside `fetchPosts()`.

🔹 Just perform your logic and `throw` an error if needed.  
🔹 React Query **automatically catches** the error and provides it in `error` from `useQuery()`.

### **Example (Correct Approach)**

```tsx
const fetchPosts = async (page) => {
  const response = await fetch(
    `http://localhost:5000/posts?_page=${page}&_per_page=5`,
  );
  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }
  return response.json();
};

const { data, error } = useQuery(["posts", page], () => fetchPosts(page));

if (error) {
  console.log(error.message); // React Query catches and logs the error
}
```

👉 **Conclusion:** **No need for `try...catch`** inside `fetchPosts()`, as React Query handles errors for you! 🚀

### reset() from useMutation()

`reset()` also comes from useMutation, which does not send another network request. It simply resets the mutation's state (like isError, isSuccess, error, data) back to its initial state.
Calling reset() on the click of an error message clears the error state (isError, error) and resets the mutation state back to its initial state. This allows the user to try submitting again without the error message persisting.

### Ensuring the app continues running smoothly even if errors occur

1. **Using `onMutate` and `onError` for rollback:**
   - In `onMutate`, return the previous state before the mutation.
   - If an error occurs in `onError`, restore the cache to the previous state using `queryClient.setQueryData()`.

2. **Using `reset()` to clear the mutation state:**
   - If a mutation fails, the UI can show an error message.
   - When the user clicks the error message, calling `reset()` clears the mutation state (`isError`, `error`), allowing them to retry without the error persisting.

Whatever function you pass inside queryFn or mutationFn, the return value of that function becomes the data in useQuery or useMutation.
In useMutation, data holds whatever the mutationFn returns after a successful mutation.
Similarly, in useQuery, data holds the resolved value from queryFn.

---

## 12. Dependent Queries

### **React Query – Dependent Queries (Short Notes)**

#### **What is a Dependent Query?**

- A query that **waits for another query's result** before running.
- Useful when one API response **depends on** another (e.g., fetching user details after getting user ID).

#### **How to Use Dependent Queries?**

- Use the `enabled` option to **delay execution** until the required data is available.

#### **Example Code (Simplest Form)**

```tsx
const { data: user } = useQuery({
  queryKey: ["user"],
  queryFn: () => axios.get("/api/user").then((res) => res.data),
});

const { data: orders } = useQuery({
  queryKey: ["orders", user?.id], // Depends on user ID
  queryFn: () => axios.get(`/api/orders/${user?.id}`).then((res) => res.data),
  enabled: !!user?.id, // Runs only if user ID is available
});
```

#### **Key Points to Remember**

✅ `enabled: !!user?.id` ensures the second query **waits** for `user.id`.  
✅ Prevents unnecessary API calls when dependency is **not available**.  
✅ Keeps UI efficient by avoiding errors from missing data.

### update the UI

In **React Query**, whenever new data comes from the server (whether it's an update to existing data or completely new data), **React Query does not automatically update the UI**. We must manually handle the update.

There are **five ways** to update the UI when new data arrives:

1. **Extract data from `useMutation` and display based on `isSuccess`**
   - Not recommended because this data is **not reactive**, leading to errors.

2. **Refetch data using `invalidateQueries` in `onSuccess` of the mutation**
   - Works but **not the most efficient** approach.

3. **Store query data in a global state and update it manually in `onSuccess`**
   - **Good approach**, as UI updates immediately after a successful mutation.

4. **Update the cache using `setQueryData` in `onSuccess`**
   - **Better approach** since the cache updates instantly without refetching.

5. **Use Optimistic Updates** (Two methods):
   - **Through variables**:
     - Use `isPending` to show temporary UI updates.
     - If successful, call `refetch()`, removing temporary data.
     - If an error occurs, display an error message instead.
   - **Through cache**:
     - Use `onMutate` to **optimistically update the UI**, assuming the request succeeds.
     - Store the previous state and revert if the mutation fails.
     - In `onSettle`, refetch the query to sync with the server.

---

# React Query vs Apollo Client vs React Query + GraphQL

## Data Fetching with `useQuery`

### React Query

```tsx
const { data, error, isLoading, isFetching, refetch } = useQuery({
  queryKey: ["posts"],
  queryFn: async () => fetch("/api/posts").then((res) => res.json()),
});
```

### Apollo Client

```tsx
const { data, error, loading, refetch, networkStatus } = useQuery(GET_POSTS, {
  notifyOnNetworkStatusChange: true, // Enables networkStatus updates
});

// True only when refetching
const isFetching = networkStatus === 4;
```

> **Note:** `networkStatus === 4` indicates that Apollo Client is refetching, similar to `isFetching` in React Query.

### React Query + GraphQL

```tsx
const { data, error, isLoading, isFetching, refetch } = useQuery({
  queryKey: ["posts"],
  queryFn: async () => request("/graphql", gqlQuery),
});
```

## Data Modification with `useMutation`

### React Query

```tsx
const mutation = useMutation({
  mutationFn: async (newPost) => {
    return fetch("/api/posts", {
      method: "POST",
      body: JSON.stringify(newPost),
    });
  },

  onMutate: async (newPost) => {
    console.log("Mutation started with", newPost);
    return { tempId: Date.now() }; // Context for error rollback
  },

  onError: (err, variables, context) => {
    console.log("Error:", err, "Temp ID:", context.tempId);
  },

  onSuccess: (data) => {
    console.log("Mutation success:", data);
  },

  onSettled: () => {
    console.log("Mutation done");
  },
});
```

### Apollo Client

```tsx
const [mutate, { loading, error }] = useMutation(CREATE_POST, {
  onError: (err) => console.log("Error:", err),
  onCompleted: (data) => console.log("Mutation success:", data),
  update: (cache, { data }) => {
    cache.modify({
      fields: {
        posts(existingPosts = []) {
          return [...existingPosts, data.createPost];
        },
      },
    });
  },
});
```

### React Query + GraphQL

```tsx
const mutation = useMutation({
  mutationFn: async (newPost) => {
    return request("/graphql", gqlMutation, { input: newPost });
  },

  onMutate: async (newPost) => {
    console.log("Mutation started with", newPost);
    return { tempId: Date.now() };
  },

  onError: (err, variables, context) => {
    console.log("Error:", err, "Temp ID:", context.tempId);
  },

  onSuccess: (data) => {
    console.log("Mutation success:", data);
  },

  onSettled: () => {
    console.log("Mutation done");
  },
});
```

## Key Differences

| Feature                | React Query                          | Apollo Client                            |
| ---------------------- | ------------------------------------ | ---------------------------------------- |
| **Optimistic Updates** | Uses `onMutate`                      | Uses `update` callback                   |
| **Cache Management**   | Manual with `invalidateQueries()`    | Automatic with normalized cache          |
| **Success Handling**   | Separate `onSuccess` and `onSettled` | Combined in `onCompleted`                |
| **Refetch Indicator**  | Built-in `isFetching`                | `networkStatus === 4`                    |
| **Primary Use Case**   | REST/GraphQL agnostic                | GraphQL-focused                          |
| **Bundle Size**        | Lighter                              | Heavier with full GraphQL implementation |

## When to Choose Which?

- **React Query**: When working with REST APIs or when you need a lightweight solution.
- **Apollo Client**: When fully committed to GraphQL and need robust cache normalization.
- **React Query + GraphQL**: When you want GraphQL benefits with React Query's simpler API.
