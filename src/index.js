import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ApolloClient, InMemoryCache, ApolloProvider, gql } from "@apollo/client";

const client = new ApolloClient({
  uri: "https://fakerql.goosfraba.ro/graphql",
  cache: new InMemoryCache(),
});

client
  .query({
    query: gql`
      query allPosts($count: Int) {
        allPosts(count: $count) {
          id
          title
          body
          published
          createdAt
        }
      }
    `,
  })
  .then((result) => console.log(result));

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
