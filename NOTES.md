# Development Notes & Best Practices

## React Context Pattern

### What is Context?

Context is a React feature that allows sharing state across multiple components without prop drilling. Instead of passing props down through every level, components can directly access shared data via `useContext()`.

**Problem it solves:** Prop drilling (passing props through many intermediate components that don't need them)

### How it works:

1. **Create context** - Define what data will be shared
2. **Create provider** - Wraps components and provides the data
3. **Consume context** - Any component inside the provider accesses data via `useContext()`

---

## Context Approach: FavoritesContext vs AppContext

### Why We Chose FavoritesContext ✅

**Specialized, Single-Purpose Context**

```typescript
<FavoritesProvider>
  <Header />
  <Main />
</FavoritesProvider>
```

**Advantages:**

- **Separation of concerns** - Each context has one responsibility
- **Performance** - Components don't re-render when unrelated state changes
- **Scalability** - Easy to add more specialized contexts as app grows
- **Reusability** - Can use in different projects
- **Maintainability** - Clear what each context manages
- **Testability** - Easy to test in isolation

### Why NOT AppContext ❌

**Monolithic, All-in-One Context**

```typescript
<AppContext.Provider value={{favorites, user, theme, filters}}>
  <Header />
  <Main />
</AppContext.Provider>
```

**Problems:**

- Everything connected = harder to maintain
- Performance issue - Any state change causes all consumers to potentially re-render
- Hard to scale - becomes a nightmare as app grows
- Tightly coupled - changing one piece affects everything
- Not reusable - too specific to this app

---

## Best Practice: Multi-Context Pattern

For scalable apps, use **multiple specialized contexts**:

```typescript
<AuthContext>        // User login & profile
  <FavoritesContext> // Favorites list
    <ThemeContext>   // Dark mode, styling
      <App />
    </ThemeContext>
  </FavoritesContext>
</AuthContext>
```

**This is the industry standard** and what drives most professional React applications.

---

## Key Takeaways

| Aspect      | FavoritesContext  | AppContext          |
| ----------- | ----------------- | ------------------- |
| Purpose     | Only favorites    | Everything          |
| Performance | ✅ Efficient      | ❌ Re-renders often |
| Scalability | ✅ Easy to extend | ❌ Gets messy       |
| Reusability | ✅ Yes            | ❌ No               |
| Complexity  | ✅ Simple         | ❌ Complex          |

**Lesson:** Always prefer specialized contexts over monolithic ones.

---

## API Pattern: Server Route Handler Proxy

Instead of calling Spoonacular directly from the browser, the frontend now calls internal routes (`/api/recipes/random`, `/api/recipes/search`) and those routes call Spoonacular.

### Why this is better

- **Security**: API key stays on the server, not exposed in browser requests.
- **Control**: One central place for error handling, retries, logging, and rate-limit handling.
- **Maintainability**: UI depends on our internal API contract, not directly on third-party response shapes.
- **Scalability**: Easier to swap providers, add caching, or combine multiple APIs later.

### Tradeoff

- Adds one extra network hop, but this is usually worth it for production safety and cleaner architecture.
